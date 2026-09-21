import { z } from "zod";
import { createRouter, authedQuery, ownerQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import { isOwner } from "@contracts/roles";
import {
  cancelOrder,
  createOrderFromCart,
  deliveryEstimates,
  findOrdersByBuyer,
  findOrdersBySupplier,
  findOrderWithDetails,
  findOrderByRazorpayOrderId,
  orderStatuses,
  orderStatusTransitions,
  type OrderStatus,
  updateOrderStatus,
  updateOrderDeliveryEstimate,
  countOrdersByStatus,
  getRecentOrders,
} from "./queries/orders";
import { getCartTotal } from "./queries/cart";
import { findBuyerProductById } from "./queries/products";
import { validateInventory } from "./queries/inventory";
import { razorpay } from "./lib/razorpay";
import * as crypto from "crypto";
import { generateInvoiceFromOrder } from "./queries/invoices";
import { calculateGstForOrder } from "./queries/gst";
import { calculateShippingForOrder } from "./queries/shipping";
import { BUSINESS_OWNER_EMAIL } from "@contracts/roles";
import { findUserByEmail } from "./queries/users";
import { notifyAdminNewOrder } from "./services/orderNotification";

function canAccessOrderDetails(input: {
  user: { role: string; email?: string | null; companyId?: number | null };
  order: { buyerId: number; supplierId: number };
}) {
  if (input.user.role === "admin" || isOwner(input.user)) {
    return true;
  }

  return (
    !!input.user.companyId &&
    (input.order.buyerId === input.user.companyId ||
      input.order.supplierId === input.user.companyId)
  );
}

function canManageOrder(input: {
  user: { role: string; email?: string | null; companyId?: number | null };
  order: { supplierId: number };
}) {
  if (input.user.role === "admin" || isOwner(input.user)) return true;
  return input.user.companyId === input.order.supplierId;
}

function requireCompanyId(companyId?: number | null) {
  if (!companyId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "User is not associated with a company",
    });
  }
  return companyId;
}

const orderStatusSchema = z.enum(orderStatuses);
const deliveryEstimateSchema = z.enum(deliveryEstimates);

export const orderRouter = createRouter({
  list: authedQuery
    .input(
      z
        .object({
          type: z.enum(["buyer", "supplier"]).optional(),
          search: z.string().trim().optional(),
          status: orderStatusSchema.optional(),
          deliveryEstimate: deliveryEstimateSchema.optional(),
          page: z.number().int().min(1).optional(),
          size: z.number().int().min(1).max(100).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user.companyId);
      const requestedType = input?.type ?? "buyer";
      if (requestedType === "supplier" && !isOwner(ctx.user) && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to manage supplier orders.",
        });
      }

      const filters = {
        search: input?.search,
        status: input?.status,
        deliveryEstimate: input?.deliveryEstimate,
        page: input?.page,
        size: input?.size,
      };

      if (requestedType === "supplier") {
        return findOrdersBySupplier(ctx.user.role === "admin" || isOwner(ctx.user) ? undefined : companyId, filters);
      }
      return findOrdersByBuyer(companyId, filters);
    }),

  quote: authedQuery
    .input(
      z.object({
        shippingState: z.string().trim().min(2).max(100),
        shippingMethodId: z.number().int().positive().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cart = await getCartTotal(ctx.user.id);
      if (cart.items.length === 0) {
        return {
          subtotal: 0,
          taxAmount: 0,
          shippingAmount: 0,
          totalAmount: 0,
          deliveryAvailable: false,
        };
      }

      let supplierId: number | null = null;
      const gstItems = [];
      for (const item of cart.items) {
        const product = await findBuyerProductById(item.productId);
        if (!product) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A product in your cart is no longer available.",
          });
        }
        if (supplierId === null) supplierId = product.supplierId;
        if (product.supplierId !== supplierId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Orders can only contain products from one supplier.",
          });
        }

        await validateInventory(
          product.id,
          product.supplierId,
          product.name,
          item.quantity
        );

        gstItems.push({
          categoryId: product.categoryId,
          taxableAmount: Number(item.unitPrice) * item.quantity,
        });
      }

      if (!supplierId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart does not contain valid products.",
        });
      }

      const subtotal = cart.total;
      const gst = await calculateGstForOrder({ companyId: supplierId, items: gstItems });

      const ownerUser = await findUserByEmail(BUSINESS_OWNER_EMAIL);
      const platformCompanyId = ownerUser?.companyId;
      if (!platformCompanyId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Platform owner company not configured.",
        });
      }

      const shipping = await calculateShippingForOrder({
        companyId: platformCompanyId,
        subtotal,
        state: input.shippingState,
        shippingMethodId: input.shippingMethodId,
      });

      return {
        subtotal,
        taxAmount: gst.taxAmount,
        shippingAmount: shipping.shippingAmount,
        totalAmount: subtotal + gst.taxAmount + shipping.shippingAmount,
        deliveryAvailable: shipping.available,
        deliveryZoneId: shipping.deliveryZoneId,
        warehouseId: shipping.warehouseId,
        shippingMethodId: shipping.shippingMethodId,
        shippingMethod: shipping.shippingMethod,
        deliveryEstimate: shipping.deliveryEstimate,
        gstBreakdown: gst.breakdown,
      };
    }),

  detail: authedQuery
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const order = await findOrderWithDetails(input.orderId);
      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found.",
        });
      }

      if (!canAccessOrderDetails({ user: ctx.user, order })) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view this order.",
        });
      }

      return order;
    }),

  createRazorpayOrder: authedQuery
    .input(
      z.object({
        shippingState: z.string().trim().min(2).max(100),
        shippingMethodId: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cart = await getCartTotal(ctx.user.id);
      if (cart.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        });
      }

      const gstItems = [];
      let supplierId: null | number = null;
      for (const item of cart.items) {
        const product = await findBuyerProductById(item.productId);
        if (!product) continue;
        if (supplierId === null) supplierId = product.supplierId;
        gstItems.push({
          productId: product.id,
          categoryId: product.categoryId,
          taxableAmount: Number(item.unitPrice) * item.quantity,
        });
      }

      if (supplierId === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No valid products in cart",
        });
      }

      const ownerUser = await findUserByEmail(BUSINESS_OWNER_EMAIL);
      const platformCompanyId = ownerUser?.companyId;
      if (!platformCompanyId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Platform configuration error",
        });
      }

      const [gst, shipping] = await Promise.all([
        calculateGstForOrder({ companyId: supplierId, items: gstItems }),
        calculateShippingForOrder({
          companyId: platformCompanyId,
          subtotal: cart.total,
          state: input.shippingState,
          shippingMethodId: input.shippingMethodId,
        }),
      ]);

      if (!shipping.available) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Delivery is not available for the selected state.",
        });
      }

      const totalAmount = cart.total + gst.taxAmount + shipping.shippingAmount;
      // Amount in paise
      const amount = Math.round(totalAmount * 100);

      try {
        const order = await razorpay.orders.create({
          amount,
          currency: "INR",
          receipt: `rcpt_${Date.now()}_${ctx.user.id}`,
        });

        return {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID || "",
        };
      } catch (error) {
        console.error("Razorpay order creation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to initialize payment.",
        });
      }
    }),

  create: authedQuery
    .input(
      z.object({
        supplierId: z.number().optional(),
        shippingContactName: z.string().optional(),
        shippingMobileNumber: z.string().optional(),
        shippingAddressLine1: z.string().optional(),
        shippingAddressLine2: z.string().optional(),
        shippingLandmark: z.string().optional(),
        shippingAreaLocality: z.string().optional(),
        shippingCity: z.string().optional(),
        shippingState: z.string().optional(),
        shippingPostalCode: z.string().optional(),
        shippingCountry: z.string().optional(),
        shippingMethod: z.string().optional(),
        shippingMethodId: z.number().int().positive().optional(),
        buyerNotes: z.string().optional(),
        paymentMethod: z.enum(["upi", "cod"]).default("cod"),
        razorpayPaymentId: z.string().optional(),
        razorpayOrderId: z.string().optional(),
        razorpaySignature: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const buyerId = requireCompanyId(ctx.user.companyId);
      if (!input.shippingState?.trim()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select a delivery state before placing the order.",
        });
      }

      const cart = await getCartTotal(ctx.user.id);
      if (cart.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        });
      }

      const orderItemsData = [];
      const gstItems = [];
      let supplierId: number | null = null;
      let currency = "INR";

      for (const item of cart.items) {
        const product = await findBuyerProductById(item.productId);
        if (!product) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A product in your cart is no longer available.",
          });
        }
        if (supplierId === null) {
          supplierId = product.supplierId;
          currency = product.currency;
        }
        if (product.supplierId !== supplierId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Orders can only contain products from one supplier.",
          });
        }
        if (input.supplierId && input.supplierId !== product.supplierId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cart products do not match the selected supplier.",
          });
        }
        if (product.currency !== currency) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Orders can only contain products with one currency.",
          });
        }

        const inventoryRecord = await validateInventory(
          product.id,
          product.supplierId,
          product.name,
          item.quantity
        );

        const unitPrice = parseFloat(item.unitPrice?.toString() ?? "0");
        const totalPrice = unitPrice * item.quantity;

        orderItemsData.push({
          productId: item.productId,
          productName: item.selectedOption ? `${product.name} (${item.selectedOption})` : product.name,
          productImage: product.image ?? undefined,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          totalPrice: totalPrice.toFixed(2),
          unitType: product.unitType,
          selectedOption: item.selectedOption ?? undefined,
          notes: item.notes ?? undefined,
          inventoryId: inventoryRecord.id,
          currentReserved: inventoryRecord.quantityReserved,
          quantityOnHand: inventoryRecord.quantityOnHand,
          reorderLevel: inventoryRecord.reorderLevel,
        });
        gstItems.push({
          categoryId: product.categoryId,
          taxableAmount: totalPrice,
        });
      }

      if (supplierId === null || orderItemsData.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart does not contain valid products.",
        });
      }

      const subtotal = cart.total;
      const gst = await calculateGstForOrder({
        companyId: supplierId,
        items: gstItems,
      });
      const taxAmount = gst.taxAmount;

      const ownerUser = await findUserByEmail(BUSINESS_OWNER_EMAIL);
      const platformCompanyId = ownerUser?.companyId;
      if (!platformCompanyId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Platform owner company not configured.",
        });
      }

      const shipping = await calculateShippingForOrder({
        companyId: platformCompanyId,
        subtotal,
        state: input.shippingState,
        shippingMethodId: input.shippingMethodId,
      });
      if (input.shippingState && !shipping.available) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Delivery is not available for the selected state.",
        });
      }
      const shippingAmount = shipping.shippingAmount;
      const totalAmount = subtotal + taxAmount + shippingAmount;
      const orderNumber = `FF-${Date.now()}-${ctx.user.id}`;

      if (input.paymentMethod === "upi") {
        if (!input.razorpayOrderId || !input.razorpayPaymentId || !input.razorpaySignature) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing Razorpay payment details.",
          });
        }

        const existingOrder = await findOrderByRazorpayOrderId(input.razorpayOrderId);
        if (existingOrder) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An order with this payment ID already exists.",
          });
        }

        const body = input.razorpayOrderId + "|" + input.razorpayPaymentId;
        const expectedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
          .update(body.toString())
          .digest("hex");

        const expectedBuffer = Buffer.from(expectedSignature, "hex");
        const inputBuffer = Buffer.from(input.razorpaySignature, "hex");

        let isValid = false;
        try {
          isValid = crypto.timingSafeEqual(expectedBuffer, inputBuffer);
        } catch (err) {
          // Occurs if lengths do not match
          isValid = false;
        }

        if (!isValid) {
          console.error(`Signature mismatch for order: ${input.razorpayOrderId}, user: ${ctx.user.id}`);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid payment signature.",
          });
        }
      }

      const order = await createOrderFromCart({
        userId: ctx.user.id,
        order: {
          orderNumber,
          buyerId,
          supplierId,
          placedByUserId: ctx.user.id,
          subtotal: subtotal.toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          shippingAmount: shippingAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          currency,
          shippingContactName: input.shippingContactName,
          shippingMobileNumber: input.shippingMobileNumber,
          shippingAddressLine1: input.shippingAddressLine1,
          shippingAddressLine2: input.shippingAddressLine2,
          shippingLandmark: input.shippingLandmark,
          shippingAreaLocality: input.shippingAreaLocality,
          shippingCity: input.shippingCity,
          shippingState: input.shippingState,
          shippingPostalCode: input.shippingPostalCode,
          shippingCountry: input.shippingCountry,
          shippingMethod: input.shippingMethod ?? shipping.shippingMethod,
          deliveryEstimate: shipping.deliveryEstimate,
          warehouseId: shipping.warehouseId,
          deliveryZoneId: shipping.deliveryZoneId,
          shippingMethodId: shipping.shippingMethodId,
          gstConfigId: gst.gstConfigId,
          buyerNotes: input.buyerNotes,
          paymentMethod: input.paymentMethod,
          paymentStatus: input.paymentMethod === "upi" ? "paid" : "pending",
          razorpayOrderId: input.razorpayOrderId,
          razorpayPaymentId: input.razorpayPaymentId,
          razorpaySignature: input.razorpaySignature,
        },
        items: orderItemsData,
      });

      // Trigger Admin New Order Email Notification safely
      // Email delivery failure must NOT break the successfully persisted order
      try {
        const origin =
          ctx.req.headers.get("origin") ||
          (ctx.req.headers.get("host")
            ? `http://${ctx.req.headers.get("host")}`
            : undefined);
        await notifyAdminNewOrder(order.id, { appUrl: origin });
      } catch (notifyErr) {
        console.error("Failed to notify admin of new order:", notifyErr);
      }

      return { orderId: order.id, orderNumber: order.orderNumber, totalAmount: totalAmount.toFixed(2) };
    }),

  status: ownerQuery
    .input(
      z.object({
        orderId: z.number(),
        status: orderStatusSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await findOrderWithDetails(input.orderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      }
      if (!canManageOrder({ user: ctx.user, order })) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this order.",
        });
      }
      if (order.status === input.status) {
        return { success: true };
      }
      const allowedTransitions = orderStatusTransitions[order.status as OrderStatus] ?? [];
      if (!allowedTransitions.includes(input.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid order status transition.",
        });
      }

      await updateOrderStatus(input.orderId, input.status);
      if (input.status === "delivered") {
        const invoice = await generateInvoiceFromOrder(input.orderId);
        if (!invoice) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Order was delivered, but invoice generation failed.",
          });
        }
      }
      return { success: true };
    }),

  deliveryEstimate: ownerQuery
    .input(
      z.object({
        orderId: z.number(),
        deliveryEstimate: deliveryEstimateSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await findOrderWithDetails(input.orderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      }
      if (!canManageOrder({ user: ctx.user, order })) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this order.",
        });
      }
      if (order.status === "delivered") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Delivered orders cannot be edited.",
        });
      }
      await updateOrderDeliveryEstimate(input.orderId, input.deliveryEstimate);
      return { success: true };
    }),

  cancel: ownerQuery
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const order = await findOrderWithDetails(input.orderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      }
      if (!canManageOrder({ user: ctx.user, order })) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to cancel this order.",
        });
      }
      if (order.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only pending orders can be cancelled.",
        });
      }
      await cancelOrder(input.orderId);
      return { success: true };
    }),

  stats: ownerQuery.query(async ({ ctx }) => {
    const companyId = ctx.user.role === "admin" || isOwner(ctx.user)
      ? undefined
      : requireCompanyId(ctx.user.companyId);
    return countOrdersByStatus(companyId);
  }),

  recent: authedQuery
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(20).optional(),
          type: z.enum(["buyer", "supplier"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const requestedType = input?.type ?? "buyer";
      if (requestedType === "supplier") {
        if (!isOwner(ctx.user) && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to view supplier orders.",
          });
        }
        return getRecentOrders(
          ctx.user.role === "admin" || isOwner(ctx.user)
            ? undefined
            : ctx.user.companyId ?? undefined,
          input?.limit ?? 5,
          "supplier",
        );
      }

      const companyId = ctx.user.companyId;
      if (!companyId) return [];
      return getRecentOrders(companyId, input?.limit ?? 5, "buyer");
    }),
});
