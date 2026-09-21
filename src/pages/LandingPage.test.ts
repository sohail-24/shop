import { describe, expect, it } from "vitest";
import { toCategoryNavItem, getCategoryEmoji } from "./LandingPage";

describe("customer category navigation", () => {
  it("uses the database category id and name, so newly returned categories need no frontend entry", () => {
    expect(
      toCategoryNavItem({
        id: 42,
        name: "Chicken Shawarma",
        slug: "chicken-shawarma",
      }),
    ).toMatchObject({
      key: "category-42",
      categoryId: 42,
      name: "Chicken Shawarma",
    });
  });

  it("maps categories to their designated food emojis", () => {
    expect(getCategoryEmoji({ name: "Platters", slug: "platters" })).toBe("🍛");
    expect(getCategoryEmoji({ name: "Gyros", slug: "gyros" })).toBe("🌯");
    expect(getCategoryEmoji({ name: "Burgers", slug: "burgers" })).toBe("🍔");
    expect(getCategoryEmoji({ name: "Party Wings", slug: "party-wings" })).toBe("🍗");
    expect(getCategoryEmoji({ name: "Rice Bowls", slug: "rice-bowls" })).toBe("🍚");
    expect(getCategoryEmoji({ name: "Sandwiches", slug: "sandwiches" })).toBe("🥪");
    expect(getCategoryEmoji({ name: "Salads", slug: "salads" })).toBe("🥗");
    expect(getCategoryEmoji({ name: "Sides", slug: "sides" })).toBe("🍟");
    expect(getCategoryEmoji({ name: "Beverages", slug: "beverages" })).toBe("🥤");
    expect(getCategoryEmoji({ name: "Desserts", slug: "desserts" })).toBe("🍰");
  });
});
