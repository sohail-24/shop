import { describe, expect, it } from "vitest";
import { categoriesForProductEdit } from "./EditProduct";

describe("Edit Product category choices", () => {
  const categories = [
    { id: 1, name: "Active category", isActive: true },
    { id: 2, name: "Inactive category", isActive: false },
  ];

  it("loads active categories for reassignment", () => {
    expect(categoriesForProductEdit(categories, 1)).toEqual([categories[0]]);
  });

  it("keeps an existing inactive category visible without making other inactive categories selectable", () => {
    expect(categoriesForProductEdit(categories, 2)).toEqual(categories);
  });
});
