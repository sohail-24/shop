import { describe, expect, it } from "vitest";
import {
  getCategoryDescription,
  getCategoryImage,
  getCategoryVisual,
} from "./Products";

describe("Products Category Helpers", () => {
  it("resolves category visual attributes with database id", () => {
    const visual = getCategoryVisual({
      id: 3,
      name: "Burgers & Sandwiches",
      slug: "burgers-sandwiches",
      description: "Juicy handcrafted burgers",
    });

    expect(visual.id).toBe(3);
    expect(visual.key).toBe("3");
    expect(visual.name).toBe("Burgers & Sandwiches");
    expect(visual.emoji).toBe("🍔");
    expect(visual.image).toBe("/products/cheeseburger.jpg");
    expect(visual.description).toBe("Juicy handcrafted burgers");
  });

  it("resolves category visual with default description and appropriate image when missing", () => {
    const wingsVisual = getCategoryVisual({
      id: 4,
      name: "Party Wings",
      slug: "party-wings",
    });

    expect(wingsVisual.id).toBe(4);
    expect(wingsVisual.emoji).toBe("🍗");
    expect(wingsVisual.image).toBe("/products/hot-wings.jpg");
    expect(wingsVisual.description).toBe("Perfect for sharing");
  });

  it("resolves images and descriptions for all primary food categories", () => {
    expect(getCategoryImage({ name: "Platters Over Rice", slug: "platters" })).toBe("/products/chicken-platter.jpg");
    expect(getCategoryImage({ name: "Gyros & Pitas", slug: "gyros" })).toBe("/products/combo-gyro.jpg");
    expect(getCategoryImage({ name: "Sides", slug: "sides" })).toBe("/products/fries.jpg");
    expect(getCategoryImage({ name: "Beverages", slug: "drinks" })).toBe("/products/soda-bottle.jpg");
    expect(getCategoryImage({ name: "Baklava & Sweets", slug: "desserts" })).toBe("/products/baklava.jpg");
    expect(getCategoryImage({ name: "Catering Packages", slug: "catering" })).toBe("/products/catering.jpg");

    expect(getCategoryDescription({ name: "Beverages", slug: "drinks" })).toBe("Cool & Refreshing");
    expect(getCategoryDescription({ name: "Sides", slug: "sides" })).toBe("The perfect add-ons");
  });
});
