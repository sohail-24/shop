import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartTotal,
  findCartByUserId,
} from "./queries/cart";
import { findBuyerProductById } from "./queries/products";
import { validateInventory } from "./queries/inventory";
import { parseProductOptions } from "../contracts/types";

export const cartRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    return getCartTotal(ctx.user.id);
  }),

  add: authedQuery
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        selectedOption: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await findBuyerProductById(input.productId);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }
      if (input.quantity < product.minimumOrderQuantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Minimum order quantity is ${product.minimumOrderQuantity}`,
        });
      }

      // Check product options and verify price from server database
      const options = parseProductOptions(product.options);
      let unitPrice = Number(product.unitPrice);
      let resolvedOptionName: string | undefined = input.selectedOption?.trim() || undefined;

      if (options.length > 0) {
        if (!resolvedOptionName) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Please select an option before adding to cart.",
          });
        }
        // Match option by id, name, or meal/only label
        const matched = options.find((opt) =>
          opt.id === resolvedOptionName ||
          opt.name.toLowerCase() === resolvedOptionName?.toLowerCase() ||
          (opt.mealPrice && `${opt.name} (Meal)`.toLowerCase() === resolvedOptionName?.toLowerCase()) ||
          (opt.onlyPrice && `${opt.name} (Only)`.toLowerCase() === resolvedOptionName?.toLowerCase())
        );

        if (matched) {
          if (matched.mealPrice && resolvedOptionName.toLowerCase().includes("meal")) {
            unitPrice = matched.mealPrice;
            resolvedOptionName = `${matched.name} (Meal)`;
          } else if (matched.onlyPrice && resolvedOptionName.toLowerCase().includes("only")) {
            unitPrice = matched.onlyPrice;
            resolvedOptionName = `${matched.name} (Only)`;
          } else {
            unitPrice = matched.price;
            resolvedOptionName = matched.name;
          }
        }
      }

      const cartItems = await findCartByUserId(ctx.user.id);
      const existingCartItem = cartItems.find(
        (item) =>
          item.productId === input.productId &&
          (item.selectedOption || null) === (resolvedOptionName || null)
      );
      const totalQuantity = (existingCartItem?.quantity ?? 0) + input.quantity;

      await validateInventory(
        product.id,
        product.supplierId,
        product.name,
        totalQuantity
      );

      return addToCart({
        userId: ctx.user.id,
        productId: input.productId,
        quantity: input.quantity,
        unitPrice: unitPrice.toFixed(2),
        selectedOption: resolvedOptionName,
        notes: input.notes,
      });
    }),

  update: authedQuery
    .input(
      z.object({
        cartItemId: z.number(),
        quantity: z.number().min(1).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.quantity !== undefined) {
        const cartItems = await findCartByUserId(ctx.user.id);
        const existingCartItem = cartItems.find((item) => item.id === input.cartItemId);

        if (existingCartItem) {
          const product = await findBuyerProductById(existingCartItem.productId);
          if (product) {
            await validateInventory(
              product.id,
              product.supplierId,
              product.name,
              input.quantity
            );
          }
        }
      }

      await updateCartItem(
        input.cartItemId,
        ctx.user.id,
        {
          quantity: input.quantity,
          notes: input.notes,
        }
      );
      return { success: true };
    }),

  remove: authedQuery
    .input(z.object({ cartItemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await removeFromCart(input.cartItemId, ctx.user.id);
      return { success: true };
    }),

  clear: authedQuery.mutation(async ({ ctx }) => {
    await clearCart(ctx.user.id);
    return { success: true };
  }),
});
