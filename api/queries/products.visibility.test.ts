import { describe, expect, it } from "vitest";
import { and } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { buyerProductVisibilityConditions } from "./products";

describe("buyer product visibility", () => {
  it("requires an active, marketplace-visible product in an active category with sellable inventory", () => {
    const query = new PgDialect().sqlToQuery(and(...buyerProductVisibilityConditions()));

    expect(query.sql).toContain('"products"."status" = $1');
    expect(query.sql).toContain('"products"."marketplaceVisible" = $2');
    expect(query.sql).toContain('"inventory"."isActive" = $3');
    expect(query.sql).toContain('"categories"."isActive" = $4');
    expect(query.sql).toContain('"inventory"."quantityAvailable" >= "products"."minimumOrderQuantity"');
    expect(query.params).toEqual(["active", true, true, true]);
  });
});
