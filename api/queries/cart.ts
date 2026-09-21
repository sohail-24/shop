import { getDb } from "./connection";
import { cartItems, categories, inventory, products } from "@db/schema";
import { eq, and, or, isNull } from "drizzle-orm";
import { buyerProductVisibilityConditions } from "./products";

export async function findCartByUserId(userId: number) {
  const db = getDb();
  return db
    .select({
      id: cartItems.id,
      userId: cartItems.userId,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      unitPrice: cartItems.unitPrice,
      selectedOption: cartItems.selectedOption,
      notes: cartItems.notes,
      createdAt: cartItems.createdAt,
      updatedAt: cartItems.updatedAt,
      productName: products.name,
      productCategoryId: products.categoryId,
      productSlug: products.slug,
      productImage: products.image,
      productUnitType: products.unitType,
      productUnitSize: products.unitSize,
      productStatus: products.status,
      options: products.options,
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .innerJoin(
      inventory,
      eq(inventory.productId, products.id),
    )
    .innerJoin(
      categories,
      eq(products.categoryId, categories.id),
    )
    .where(and(eq(cartItems.userId, userId), ...buyerProductVisibilityConditions()))
    .orderBy(cartItems.createdAt);
}

export async function findCartItem(
  userId: number,
  productId: number,
  selectedOption?: string | null
) {
  const db = getDb();
  const optionCondition = selectedOption
    ? eq(cartItems.selectedOption, selectedOption)
    : or(isNull(cartItems.selectedOption), eq(cartItems.selectedOption, ""));

  return db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId),
        optionCondition
      )
    )
    .limit(1);
}

export async function addToCart(data: {
  userId: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  selectedOption?: string | null;
  notes?: string;
}) {
  const db = getDb();
  // Check if item with matching product and option already exists in cart
  const existing = await findCartItem(data.userId, data.productId, data.selectedOption);
  if (existing.length > 0) {
    // Update quantity instead of inserting
    const newQuantity = existing[0].quantity + data.quantity;
    await db
      .update(cartItems)
      .set({ quantity: newQuantity, updatedAt: new Date() })
      .where(eq(cartItems.id, existing[0].id));
    return { id: existing[0].id, quantity: newQuantity, updated: true };
  }

  const result = await db
    .insert(cartItems)
    .values({
      userId: data.userId,
      productId: data.productId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      selectedOption: data.selectedOption || null,
      notes: data.notes,
    })
    .returning({ id: cartItems.id });
  return { id: result[0].id, quantity: data.quantity, updated: false };
}

export async function updateCartItem(
  cartItemId: number,
  userId: number,
  updates: { quantity?: number; notes?: string }
) {
  const db = getDb();
  await db
    .update(cartItems)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)));
}

export async function removeFromCart(cartItemId: number, userId: number) {
  const db = getDb();
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)));
}

export async function clearCart(userId: number) {
  const db = getDb();
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

export async function getCartTotal(userId: number) {
  const items = await findCartByUserId(userId);
  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.unitPrice?.toString() ?? "0");
    return sum + price * item.quantity;
  }, 0);
  return { items, total, count: items.length };
}
