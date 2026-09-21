import { useCallback, useEffect, useState } from "react";

const GUEST_CART_KEY = "freshflow_guest_cart";
const GUEST_CART_EVENT = "freshflow_guest_cart_changed";

export type GuestCartItem = {
  id: number;
  productId: number;
  productSlug: string;
  productName: string;
  productImage?: string | null;
  productUnitType?: string | null;
  productUnitSize?: string | null;
  selectedOption?: string | null;
  quantity: number;
  unitPrice: string;
  notes?: string;
};

function emitCartChange() {
  window.dispatchEvent(new Event(GUEST_CART_EVENT));
}

export function getGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GuestCartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveGuestCart(items: GuestCartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  emitCartChange();
}

export function addGuestCartItem(item: GuestCartItem) {
  const items = getGuestCart();
  const existing = items.find(
    (cartItem) =>
      cartItem.productId === item.productId &&
      (cartItem.selectedOption || null) === (item.selectedOption || null)
  );
  if (existing) {
    existing.quantity += item.quantity;
    saveGuestCart(items);
    return;
  }
  const uniqueId = items.some((i) => i.id === item.id)
    ? Date.now() + Math.floor(Math.random() * 1000)
    : item.id;
  saveGuestCart([...items, { ...item, id: uniqueId }]);
}

export function updateGuestCartItem(idOrProductId: number, quantity: number) {
  saveGuestCart(
    getGuestCart().map((item) =>
      item.id === idOrProductId ? { ...item, quantity } : item
    )
  );
}

export function removeGuestCartItem(idOrProductId: number) {
  saveGuestCart(getGuestCart().filter((item) => item.id !== idOrProductId));
}

export function clearGuestCart() {
  saveGuestCart([]);
}

export function useGuestCart() {
  const [items, setItems] = useState<GuestCartItem[]>(() => getGuestCart());

  useEffect(() => {
    const refresh = () => setItems(getGuestCart());
    window.addEventListener(GUEST_CART_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(GUEST_CART_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const total = items.reduce(
    (sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
    0,
  );

  return {
    items,
    total,
    count: items.length,
    update: useCallback(updateGuestCartItem, []),
    remove: useCallback(removeGuestCartItem, []),
    clear: useCallback(clearGuestCart, []),
  };
}
