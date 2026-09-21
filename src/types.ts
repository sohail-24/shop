export type ProductOption = {
  id: string;
  name: string; // e.g. "2 PC", "3 PC", "4 PC", "Small", "Regular", "Classic"
  price: number; // Primary selling price
  compareAtPrice?: number | null; // Optional original/compare price
  mealPrice?: number | null; // Optional MEAL price
  onlyPrice?: number | null; // Optional ONLY price
};

export const ProductOption = {} as unknown as ProductOption;

export function parseProductOptions(value?: unknown): ProductOption[] {
  if (!value) return [];
  try {
    const raw = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item: any, idx: number) => {
        if (!item || typeof item !== "object") return null;
        const name = String(item.name || "").trim();
        const price = Number(item.price ?? item.sellingPrice ?? 0);
        const mealPrice = item.mealPrice != null && Number(item.mealPrice) > 0 ? Number(item.mealPrice) : null;
        const onlyPrice = item.onlyPrice != null && Number(item.onlyPrice) > 0 ? Number(item.onlyPrice) : null;
        const compareAtPrice = item.compareAtPrice != null && Number(item.compareAtPrice) > 0 ? Number(item.compareAtPrice) : null;
        
        if (!name && price <= 0 && !mealPrice && !onlyPrice) return null;

        return {
          id: item.id ? String(item.id) : `opt-${idx + 1}-${Date.now()}`,
          name: name || `Option ${idx + 1}`,
          price: isNaN(price) ? (mealPrice || onlyPrice || 0) : price,
          compareAtPrice,
          mealPrice,
          onlyPrice,
        } as ProductOption;
      })
      .filter((opt): opt is ProductOption => opt !== null);
  } catch {
    return [];
  }
}
