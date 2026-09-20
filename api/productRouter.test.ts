import { describe, expect, it } from "vitest";
import { isSupportedProductImageUrl } from "./productRouter";

describe("product image validation", () => {
  it("accepts legacy local product assets as well as uploaded and remote images", () => {
    expect(isSupportedProductImageUrl("/products/chicken-sandwich.jpg")).toBe(true);
    expect(isSupportedProductImageUrl("/api/uploads/chicken-sandwich.jpg")).toBe(true);
    expect(isSupportedProductImageUrl("https://images.example.com/chicken-sandwich.jpg")).toBe(true);
  });

  it("does not accept arbitrary local paths", () => {
    expect(isSupportedProductImageUrl("/branding/logo.png")).toBe(false);
  });
});
