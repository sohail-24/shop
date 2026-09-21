import { getDb } from "./connection";
import { findAddressesByUserId } from "./addresses";
import {
  cartItems,
  companies,
  inventory,
  orderItems,
  orders,
  users,
  type InsertOrder,
  type InsertOrderItem,
} from "@db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { BUSINESS_OWNER_EMAIL } from "@contracts/roles";

export type OrderStatus = NonNullable<InsertOrder["status"]>;
export type DeliveryEstimate = NonNullable<InsertOrder["deliveryEstimate"]>;

export const orderStatuses = [
  "pending",
  "confirmed",
  "packed",
  "ready_for_dispatch",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const satisfies readonly OrderStatus[];

export const deliveryEstimates = [
  "same_day",
  "next_day",
  "within_2_days",
  "within_3_5_days",
] as const satisfies readonly DeliveryEstimate[];

export const orderStatusTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed"],
  packed: ["ready_for_dispatch"],
  ready_for_dispatch: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

function calculateAvailableStock(quantityOnHand: number, quantityReserved: number) {
  return Math.max(0, quantityOnHand - quantityReserved);
}

function calculateInventoryStatus(quantityAvailable: number, reorderLevel: number) {
  if (quantityAvailable <= 0) return "out_of_stock" as const;
  if (quantityAvailable <= reorderLevel) return "low_stock" as const;
  return "in_stock" as const;
}

function orderTimestampForStatus(status: OrderStatus) {
  const timestampMap: Partial<Record<OrderStatus, keyof InsertOrder>> = {
    confirmed: "confirmedAt",
    out_for_delivery: "shippedAt",
    delivered: "deliveredAt",
    cancelled: "cancelledAt",
  };
  return timestampMap[status];
}

export type OrderListFilters = {
  search?: string;
  status?: OrderStatus;
  deliveryEstimate?: DeliveryEstimate;
  page?: number;
  size?: number;
};

async function findOrdersForCompany(
  companyId: number | undefined,
  type: "buyer" | "supplier",
  filters?: OrderListFilters,
) {
  const db = getDb();
  const relatedCompanyName =
    type === "buyer"
      ? sql<string>`${companies.name}`.as("supplierName")
      : sql<string>`${companies.name}`.as("buyerName");
  const conditions = companyId
    ? [type === "buyer" ? eq(orders.buyerId, companyId) : eq(orders.supplierId, companyId)]
    : [];

  if (filters?.status) {
    conditions.push(eq(orders.status, filters.status));
  }
  if (filters?.deliveryEstimate) {
    conditions.push(eq(orders.deliveryEstimate, filters.deliveryEstimate));
  }
  if (filters?.search?.trim()) {
    const pattern = `%${filters.search.trim()}%`;
    conditions.push(or(ilike(orders.orderNumber, pattern), ilike(companies.name, pattern))!);
  }
  const page = Math.max(1, filters?.page ?? 1);
  const size = Math.min(100, Math.max(1, filters?.size ?? 20));

  const items = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      buyerId: orders.buyerId,
      supplierId: orders.supplierId,
      placedByUserId: orders.placedByUserId,
      subtotal: orders.subtotal,
      taxAmount: orders.taxAmount,
      shippingAmount: orders.shippingAmount,
      discountAmount: orders.discountAmount,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      deliveryEstimate: orders.deliveryEstimate,
      shippingMethod: orders.shippingMethod,
      trackingNumber: orders.trackingNumber,
      orderedAt: orders.orderedAt,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      relatedCompanyName,
      itemCount: sql<number>`count(${orderItems.id})`,
    })
    .from(orders)
    .leftJoin(
      companies,
      type === "buyer"
        ? eq(orders.supplierId, companies.id)
        : eq(orders.buyerId, companies.id),
    )
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(conditions.length ? and(...conditions) : undefined)
    .groupBy(orders.id, companies.name)
    .orderBy(desc(orders.createdAt))
    .limit(size)
    .offset((page - 1) * size);

  const totalRows = await db
    .select({ total: sql<number>`count(distinct ${orders.id})` })
    .from(orders)
    .leftJoin(
      companies,
      type === "buyer"
        ? eq(orders.supplierId, companies.id)
        : eq(orders.buyerId, companies.id),
    )
    .where(conditions.length ? and(...conditions) : undefined);

  return {
    items,
    total: Number(totalRows[0]?.total ?? 0),
    page,
    size,
  };
}

export function findOrdersByBuyer(buyerId: number, filters?: OrderListFilters) {
  return findOrdersForCompany(buyerId, "buyer", filters);
}

export function findOrdersBySupplier(supplierId?: number, filters?: OrderListFilters) {
  return findOrdersForCompany(supplierId, "supplier", filters);
}

export async function findOrderByRazorpayOrderId(razorpayOrderId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.razorpayOrderId, razorpayOrderId))
    .limit(1);
  return rows[0] ?? null;
}

export async function findOrderById(orderId: number) {
  const db = getDb();
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const order = rows[0] ?? null;

  if (!order) return null;

  const [buyer, supplier, supplierAdmin, platformAdmin, buyerUser] = await Promise.all([
    db.query.companies.findFirst({ where: eq(companies.id, order.buyerId) }),
    db.query.companies.findFirst({ where: eq(companies.id, order.supplierId) }),
    db.query.users.findFirst({
      where: and(eq(users.companyId, order.supplierId), eq(users.role, "admin")),
    }),
    db.query.users.findFirst({
      where: or(eq(users.email, BUSINESS_OWNER_EMAIL), eq(users.role, "admin")),
    }),
    db.query.users.findFirst({ where: eq(users.id, order.placedByUserId) }),
  ]);

  // Determine if supplier is the store owner / AM Fruits or placeholder seed company
  const isOwnerOrPlaceholder =
    !supplier ||
    supplier.slug === "amfruits-warehouse" ||
    supplier.name === "AMfruits-warehouse" ||
    order.supplierId === 19 ||
    order.supplierId === 2 ||
    order.supplierId === 1 ||
    order.supplierId === platformAdmin?.companyId ||
    supplier.country === "USA" ||
    Boolean(supplier.addressLine1?.includes("Fruit Ave"));

  // Retrieve the platform admin's live addresses from userAddresses (same authoritative source as Admin Profile)
  const adminAddresses = platformAdmin ? await findAddressesByUserId(platformAdmin.id) : [];
  const adminDefaultAddress = adminAddresses.find((a) => a.isDefault) || adminAddresses[0] || null;

  const businessAccount = isOwnerOrPlaceholder ? platformAdmin : (supplierAdmin ?? platformAdmin);
  const businessName = isOwnerOrPlaceholder
    ? (businessAccount?.name || "Tex’s Chicken & Burgers")
    : (supplierAdmin?.name || supplier?.name || businessAccount?.name || "Tex’s Chicken & Burgers");

  const businessPhone = isOwnerOrPlaceholder
    ? (adminDefaultAddress?.mobileNumber || businessAccount?.phone || null)
    : (supplierAdmin?.phone || supplier?.phone || businessAccount?.phone || null);

  const businessEmail = isOwnerOrPlaceholder
    ? (businessAccount?.email || BUSINESS_OWNER_EMAIL)
    : (supplierAdmin?.email || supplier?.email || businessAccount?.email || BUSINESS_OWNER_EMAIL);

  const businessAddressLine1 = isOwnerOrPlaceholder
    ? (adminDefaultAddress?.addressLine1 || null)
    : (supplierAdmin?.addressLine1 || (supplier?.country !== "USA" ? supplier?.addressLine1 : null) || adminDefaultAddress?.addressLine1 || null);

  const businessAddressLine2 = isOwnerOrPlaceholder
    ? ([adminDefaultAddress?.addressLine2, adminDefaultAddress?.landmark, adminDefaultAddress?.areaLocality].filter(Boolean).join(", ") || null)
    : (supplierAdmin?.addressLine2 || (supplier?.country !== "USA" ? supplier?.addressLine2 : null) || [adminDefaultAddress?.addressLine2, adminDefaultAddress?.landmark, adminDefaultAddress?.areaLocality].filter(Boolean).join(", ") || null);

  const businessCity = isOwnerOrPlaceholder
    ? (adminDefaultAddress?.city || null)
    : (supplierAdmin?.city || (supplier?.country !== "USA" ? supplier?.city : null) || adminDefaultAddress?.city || null);

  const businessState = isOwnerOrPlaceholder
    ? (adminDefaultAddress?.state || null)
    : (supplierAdmin?.state || (supplier?.country !== "USA" ? supplier?.state : null) || adminDefaultAddress?.state || null);

  const businessPostalCode = isOwnerOrPlaceholder
    ? (adminDefaultAddress?.postalCode || null)
    : (supplierAdmin?.postalCode || (supplier?.country !== "USA" ? supplier?.postalCode : null) || adminDefaultAddress?.postalCode || null);

  const businessCountry = isOwnerOrPlaceholder
    ? (adminDefaultAddress?.country || null)
    : (supplierAdmin?.country || (supplier?.country !== "USA" ? supplier?.country : null) || adminDefaultAddress?.country || null);

  return {
    ...order,
    buyerName: buyer?.name ?? null,
    buyerPhone: order.shippingMobileNumber ?? buyerUser?.phone ?? null,
    buyerAddressLine1: buyer?.addressLine1 ?? null,
    buyerAddressLine2: buyer?.addressLine2 ?? null,
    buyerCity: buyer?.city ?? null,
    buyerState: buyer?.state ?? null,
    buyerPostalCode: buyer?.postalCode ?? null,
    buyerCountry: buyer?.country ?? null,
    supplierName: businessName,
    supplierPhone: businessPhone,
    supplierEmail: businessEmail,
    supplierAddressLine1: businessAddressLine1,
    supplierAddressLine2: businessAddressLine2,
    supplierCity: businessCity,
    supplierState: businessState,
    supplierPostalCode: businessPostalCode,
    supplierCountry: businessCountry,
  };
}

export async function findOrderItems(orderId: number) {
  return getDb()
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .orderBy(orderItems.createdAt);
}

export async function findOrderWithDetails(orderId: number) {
  const order = await findOrderById(orderId);
  if (!order) return null;

  const items = await findOrderItems(orderId);
  return { ...order, items };
}

export async function createOrderFromCart(data: {
  order: InsertOrder;
  items: Array<
    Omit<InsertOrderItem, "id" | "createdAt" | "orderId"> & {
      inventoryId: number;
      currentReserved: number;
      quantityOnHand: number;
      reorderLevel: number;
    }
  >;
  userId: number;
}) {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(orders)
      .values(data.order)
      .returning({ id: orders.id, orderNumber: orders.orderNumber });

    await tx.insert(orderItems).values(
      data.items.map(({ inventoryId: _inventoryId, currentReserved: _currentReserved, quantityOnHand: _quantityOnHand, reorderLevel: _reorderLevel, ...item }) => ({
        ...item,
        orderId: created.id,
      })),
    );

    for (const item of data.items) {
      const quantityReserved = item.currentReserved + item.quantity;
      const quantityAvailable = calculateAvailableStock(item.quantityOnHand, quantityReserved);
      await tx
        .update(inventory)
        .set({
          quantityReserved,
          quantityAvailable,
          status: calculateInventoryStatus(quantityAvailable, item.reorderLevel),
          lastCountedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(inventory.id, item.inventoryId));
    }

    if (data.userId && data.userId > 0) {
      await tx.delete(cartItems).where(eq(cartItems.userId, data.userId));
    }

    return created;
  });
}

export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  const db = getDb();
  const timestampField = orderTimestampForStatus(status);
  const updates: Record<string, unknown> = { status, updatedAt: new Date() };

  if (timestampField) {
    updates[timestampField] = new Date();
  }

  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) return;

    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));

    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of items) {
        const [record] = await tx
          .select()
          .from(inventory)
          .where(and(eq(inventory.productId, item.productId), eq(inventory.supplierId, order.supplierId)))
          .limit(1);
        if (!record) continue;
        const quantityReserved = Math.max(0, record.quantityReserved - item.quantity);
        const quantityAvailable = calculateAvailableStock(record.quantityOnHand, quantityReserved);
        await tx
          .update(inventory)
          .set({
            quantityReserved,
            quantityAvailable,
            status: calculateInventoryStatus(quantityAvailable, record.reorderLevel),
            updatedAt: new Date(),
          })
          .where(eq(inventory.id, record.id));
      }
    }

    if (status === "delivered" && order.status !== "delivered") {
      for (const item of items) {
        const [record] = await tx
          .select()
          .from(inventory)
          .where(and(eq(inventory.productId, item.productId), eq(inventory.supplierId, order.supplierId)))
          .limit(1);
        if (!record) continue;
        const quantityOnHand = Math.max(0, record.quantityOnHand - item.quantity);
        const quantityReserved = Math.max(0, record.quantityReserved - item.quantity);
        const quantityAvailable = calculateAvailableStock(quantityOnHand, quantityReserved);
        await tx
          .update(inventory)
          .set({
            quantityOnHand,
            quantityReserved,
            quantityAvailable,
            status: calculateInventoryStatus(quantityAvailable, record.reorderLevel),
            lastCountedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(inventory.id, record.id));
      }
    }

    await tx.update(orders).set(updates).where(eq(orders.id, orderId));
  });
}

export async function updateOrderDeliveryEstimate(
  orderId: number,
  deliveryEstimate: DeliveryEstimate,
) {
  await getDb()
    .update(orders)
    .set({ deliveryEstimate, updatedAt: new Date() })
    .where(eq(orders.id, orderId));
}

export async function cancelOrder(orderId: number) {
  await updateOrderStatus(orderId, "cancelled");
}

export async function countOrdersByStatus(companyId?: number) {
  return getDb()
    .select({
      status: orders.status,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(companyId ? eq(orders.supplierId, companyId) : undefined)
    .groupBy(orders.status);
}

export async function getRecentOrders(companyId: number | undefined, limit = 5, type: "buyer" | "supplier" = "buyer") {
  const relatedCompanyName =
    type === "buyer"
      ? sql<string>`${companies.name}`.as("supplierName")
      : sql<string>`${companies.name}`.as("buyerName");

  return getDb()
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      totalAmount: orders.totalAmount,
      status: orders.status,
      deliveryEstimate: orders.deliveryEstimate,
      orderedAt: orders.orderedAt,
      relatedCompanyName,
    })
    .from(orders)
    .leftJoin(
      companies,
      type === "buyer"
        ? eq(orders.supplierId, companies.id)
        : eq(orders.buyerId, companies.id),
    )
    .where(
      companyId
        ? type === "buyer"
          ? eq(orders.buyerId, companyId)
          : eq(orders.supplierId, companyId)
        : undefined,
    )
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}
