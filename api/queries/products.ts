import { getDb } from "./connection";
import { inventory, products, categories, companies, users, warehouses, type InsertProduct } from "@db/schema";
import {
  eq,
  and,
  like,
  or,
  gte,
  lte,
  desc,
  asc,
  sql,
  ne,
  type SQL,
} from "drizzle-orm";

function withoutUndefined<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

// ─── Product Queries ───

type ProductFilters = {
  categoryId?: number;
  supplierId?: number;
  status?: string;
  organic?: boolean;
  grade?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

/**
 * The single visibility rule for buyer-facing product reads. Keep this joined
 * with inventory so inactive inventory makes the product indistinguishable
 * from a missing product to buyers.
 */
export function buyerProductVisibilityConditions(): SQL[] {
  return [
    eq(products.status, "active"),
    eq(products.marketplaceVisible, true),
    eq(inventory.isActive, true),
    eq(categories.isActive, true),
    gte(inventory.quantityAvailable, products.minimumOrderQuantity),
  ];
}

function productFilterConditions(filters?: ProductFilters): SQL[] {
  const conditions: SQL[] = [];

  if (filters?.status) {
    conditions.push(eq(products.status, filters.status as any));
  }

  if (filters?.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }
  if (filters?.supplierId) {
    conditions.push(eq(products.supplierId, filters.supplierId));
  }
  if (filters?.organic !== undefined) {
    conditions.push(eq(products.organic, filters.organic));
  }
  if (filters?.grade) {
    conditions.push(eq(products.grade, filters.grade as any));
  }
  if (filters?.minPrice) {
    conditions.push(gte(products.unitPrice, String(filters.minPrice)));
  }
  if (filters?.maxPrice) {
    conditions.push(lte(products.unitPrice, String(filters.maxPrice)));
  }
  if (filters?.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(
        like(products.name, pattern),
        like(products.description, pattern),
        like(products.tags, pattern)
      )!
    );
  }

  return conditions;
}

function productOrderBy(filters?: ProductFilters) {
  return filters?.sortBy === "price"
    ? filters.sortOrder === "asc"
      ? asc(products.unitPrice)
      : desc(products.unitPrice)
    : filters?.sortBy === "name"
      ? filters.sortOrder === "asc"
        ? asc(products.name)
        : desc(products.name)
      : desc(products.createdAt);
}

async function listProducts(
  filters?: ProductFilters,
  visibilityConditions: SQL[] = [],
  marketplaceOrdering = false,
) {
  const db = getDb();
  const conditions = [...visibilityConditions, ...productFilterConditions(filters)];

  const orderByCol = productOrderBy(filters);

  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      shortDescription: products.shortDescription,
      categoryId: products.categoryId,
      supplierId: products.supplierId,
      unitPrice: products.unitPrice,
      compareAtPrice: products.compareAtPrice,
      currency: products.currency,
      unitType: products.unitType,
      unitSize: products.unitSize,
      minimumOrderQuantity: products.minimumOrderQuantity,
      image: products.image,
      origin: products.origin,
      season: products.season,
      grade: products.grade,
      organic: products.organic,
      status: products.status,
      tags: products.tags,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryName: categories.name,
      supplierName: companies.name,
      stock: inventory.quantityAvailable,
      quantityOnHand: inventory.quantityOnHand,
      quantityReserved: inventory.quantityReserved,
      reorderLevel: inventory.reorderLevel,
      inventoryStatus: inventory.status,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(companies, eq(products.supplierId, companies.id))
    .leftJoin(
      inventory,
      eq(inventory.productId, products.id),
    )
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...(marketplaceOrdering ? [asc(products.displayPriority), orderByCol] : [orderByCol]));
}

export async function findAllProducts(filters?: ProductFilters) {
  return listProducts(filters);
}

export async function findBuyerProducts(filters?: ProductFilters) {
  return listProducts(filters, buyerProductVisibilityConditions(), true);
}

export async function findFreshDealProducts(filters?: ProductFilters) {
  return listProducts(
    filters,
    [...buyerProductVisibilityConditions(), eq(products.showInFreshDeals, true)],
    true,
  );
}

async function findProductDetailBySlug(slug: string, visibilityConditions: SQL[] = []) {
  const db = getDb();
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      shortDescription: products.shortDescription,
      categoryId: products.categoryId,
      supplierId: products.supplierId,
      unitPrice: products.unitPrice,
      compareAtPrice: products.compareAtPrice,
      currency: products.currency,
      unitType: products.unitType,
      unitSize: products.unitSize,
      minimumOrderQuantity: products.minimumOrderQuantity,
      image: products.image,
      images: products.images,
      origin: products.origin,
      season: products.season,
      grade: products.grade,
      organic: products.organic,
      certifications: products.certifications,
      status: products.status,
      tags: products.tags,
      metaTitle: products.metaTitle,
      metaDescription: products.metaDescription,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      supplierName: companies.name,
      supplierSlug: companies.slug,
      supplierPhone: companies.phone,
      supplierAddressLine1: companies.addressLine1,
      supplierAddressLine2: companies.addressLine2,
      supplierCity: companies.city,
      supplierState: companies.state,
      supplierPostalCode: companies.postalCode,
      supplierCountry: companies.country,
      stock: inventory.quantityAvailable,
      quantityOnHand: inventory.quantityOnHand,
      quantityReserved: inventory.quantityReserved,
      reorderLevel: inventory.reorderLevel,
      inventoryStatus: inventory.status,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(companies, eq(products.supplierId, companies.id))
    .leftJoin(
      inventory,
      eq(inventory.productId, products.id),
    )
    .where(and(eq(products.slug, slug), ...visibilityConditions))
    .limit(1);

  const row = rows[0] ?? null;
  if (!row) return null;

  // If supplier is AM Fruits / store owner (seed placeholder "amfruits-warehouse", supplierId 19, 2, or owner product)
  const isOwnerSupplier =
    row.supplierSlug === "amfruits-warehouse" ||
    row.supplierName === "AMfruits-warehouse" ||
    row.supplierId === 19 ||
    row.supplierId === 2 ||
    (!row.supplierName && (row.supplierId === 1 || !row.supplierId));

  if (isOwnerSupplier) {
    const [adminUser, activeWarehouse] = await Promise.all([
      db.query.users.findFirst({
        where: eq(users.role, "admin"),
      }).catch(() => null),
      db.query.warehouses.findFirst({
        where: eq(warehouses.status, "active"),
      }).catch(() => null),
    ]);

    const realName = adminUser?.name || activeWarehouse?.name || "Tex’s Chicken & Burgers";
    const realPhone = adminUser?.phone || activeWarehouse?.contactNumber || null;
    const realAddressLine1 = activeWarehouse?.address || adminUser?.addressLine1 || null;
    const realCity = activeWarehouse?.city || adminUser?.city || null;
    const realState = activeWarehouse?.state || adminUser?.state || null;
    const realPostalCode = activeWarehouse?.postalCode || adminUser?.postalCode || null;
    const realCountry = activeWarehouse?.country || adminUser?.country || null;

    return {
      ...row,
      supplierName: realName,
      supplierSlug: "texs-chicken-and-burgers",
      supplierPhone: realPhone,
      supplierAddressLine1: realAddressLine1,
      supplierAddressLine2: null,
      supplierCity: realCity,
      supplierState: realState,
      supplierPostalCode: realPostalCode,
      supplierCountry: realCountry,
    };
  }

  return row;
}

export async function findProductBySlug(slug: string) {
  return findProductDetailBySlug(slug);
}

export async function findBuyerProductBySlug(slug: string) {
  return findProductDetailBySlug(slug, buyerProductVisibilityConditions());
}

export async function findProductBySku(sku: string, excludeId?: number) {
  const pattern = `%"sku":"${sku.replace(/"/g, '\\"')}"%`;
  const conditions = [like(products.tags, pattern)];
  if (excludeId) {
    conditions.push(ne(products.id, excludeId));
  }
  const rows = await getDb()
    .select({ id: products.id })
    .from(products)
    .where(and(...conditions))
    .limit(1);
  return rows[0] ?? null;
}

export async function createProductWithInventory(input: {
  product: InsertProduct;
  inventory: {
    quantityOnHand: number;
    quantityReserved?: number;
    quantityAvailable?: number;
    reorderLevel: number;
    reorderQuantity?: number;
    warehouseLocation?: string;
    batchNumber?: string;
    notes?: string;
  };
}) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const productResult = await tx
      .insert(products)
      .values(input.product)
      .returning({ id: products.id });
    const productId = productResult[0].id;
    const quantityOnHand = input.inventory.quantityOnHand;
    const quantityReserved = input.inventory.quantityReserved ?? 0;
    const quantityAvailable =
      input.inventory.quantityAvailable ?? Math.max(0, quantityOnHand - quantityReserved);
    const reorderLevel = input.inventory.reorderLevel;
    const status =
      quantityAvailable <= 0
        ? "out_of_stock"
        : quantityAvailable <= reorderLevel
          ? "low_stock"
          : "in_stock";

    await tx.insert(inventory).values({
      productId,
      supplierId: input.product.supplierId,
      quantityOnHand,
      quantityReserved,
      quantityAvailable,
      reorderLevel,
      reorderQuantity: input.inventory.reorderQuantity ?? Math.max(reorderLevel * 2, 1),
      warehouseLocation: input.inventory.warehouseLocation,
      batchNumber: input.inventory.batchNumber,
      receivedDate: new Date(),
      lastCountedAt: new Date(),
      status,
      notes: input.inventory.notes,
    });

    return productId;
  });
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const updates = withoutUndefined({ ...data, updatedAt: new Date() });
  if (Object.keys(updates).length === 0) return;

  await getDb()
    .update(products)
    .set(updates)
    .where(eq(products.id, id));
}

export async function updateProductMarketplace(
  id: number,
  data: Pick<
    InsertProduct,
    "marketplaceVisible" | "showInFreshDeals" | "isFeatured" | "displayPriority"
  >,
) {
  await updateProduct(id, data);
}

export async function findProductMarketplaceById(id: number) {
  const rows = await getDb()
    .select({
      marketplaceVisible: products.marketplaceVisible,
      showInFreshDeals: products.showInFreshDeals,
      isFeatured: products.isFeatured,
      displayPriority: products.displayPriority,
    })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function deleteProduct(id: number) {
  await getDb()
    .update(products)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(products.id, id));
}

export async function getProductStats() {
  const db = getDb();
  const totalRows = await db.select({ count: sql<number>`count(*)` }).from(products);
  const activeRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.status, "active"));
  const avgRows = await db
    .select({ value: sql<string>`avg(${products.unitPrice})` })
    .from(products)
    .where(eq(products.status, "active"));
  const recent = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      unitPrice: products.unitPrice,
      status: products.status,
      createdAt: products.createdAt,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt))
    .limit(5);

  return {
    totalProducts: totalRows[0]?.count ?? 0,
    activeProducts: activeRows[0]?.count ?? 0,
    averageSellingPrice: avgRows[0]?.value ?? "0",
    recentlyAdded: recent,
  };
}

export async function getBuyerProductStats() {
  const buyerProducts = await findBuyerProducts({ sortBy: "newest" });
  const totalProducts = buyerProducts.length;
  const averageSellingPrice = totalProducts
    ? (buyerProducts.reduce((total, product) => total + Number(product.unitPrice), 0) / totalProducts).toFixed(2)
    : "0";

  return {
    totalProducts,
    activeProducts: totalProducts,
    averageSellingPrice,
    recentlyAdded: buyerProducts.slice(0, 5).map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      unitPrice: product.unitPrice,
      status: product.status,
      createdAt: product.createdAt,
      categoryName: product.categoryName,
    })),
  };
}

export async function findProductById(id: number) {
  return getDb().query.products.findFirst({
    where: eq(products.id, id),
    with: {
      category: true,
      supplier: true,
    },
  });
}

export async function findBuyerProductById(id: number) {
  const rows = await getDb()
    .select({ product: products })
    .from(products)
    .innerJoin(
      inventory,
      eq(inventory.productId, products.id),
    )
    .innerJoin(
      categories,
      eq(products.categoryId, categories.id),
    )
    .where(and(eq(products.id, id), ...buyerProductVisibilityConditions()))
    .limit(1);

  return rows[0]?.product ?? null;
}

export async function findProductsByCategory(categoryId: number) {
  return findBuyerProducts({ categoryId });
}

export async function findFeaturedProducts(limit = 8) {
  const db = getDb();
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      unitPrice: products.unitPrice,
      compareAtPrice: products.compareAtPrice,
      currency: products.currency,
      unitType: products.unitType,
      unitSize: products.unitSize,
      image: products.image,
      origin: products.origin,
      grade: products.grade,
      organic: products.organic,
      categoryName: categories.name,
      supplierName: companies.name,
      stock: inventory.quantityAvailable,
      inventoryStatus: inventory.status,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(companies, eq(products.supplierId, companies.id))
    .innerJoin(
      inventory,
      eq(inventory.productId, products.id),
    )
    .where(and(...buyerProductVisibilityConditions(), eq(products.isFeatured, true)))
    .orderBy(asc(products.displayPriority), desc(products.createdAt))
    .limit(limit);
}

export async function countProducts(filters?: {
  categoryId?: number;
  supplierId?: number;
  search?: string;
}) {
  const db = getDb();
  const conditions = [...buyerProductVisibilityConditions()];

  if (filters?.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }
  if (filters?.supplierId) {
    conditions.push(eq(products.supplierId, filters.supplierId));
  }
  if (filters?.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(
        like(products.name, pattern),
        like(products.description, pattern)
      )!
    );
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .innerJoin(
      inventory,
      eq(inventory.productId, products.id),
    )
    .innerJoin(
      categories,
      eq(products.categoryId, categories.id),
    )
    .where(and(...conditions));

  return result[0]?.count ?? 0;
}
