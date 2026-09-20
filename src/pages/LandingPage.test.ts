import { describe, expect, it } from "vitest";
import { toCategoryNavItem } from "./LandingPage";

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
});
