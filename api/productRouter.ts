import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { isOwner } from "@contracts/roles";
import { createRouter, publicQuery, ownerQuery } from "./middleware";
import {
  findAllProducts,
  findBuyerProducts,
  findProductBySlug,
  findBuyerProductBySlug,
  findProductById,
  findBuyerProductById,
  findFeaturedProducts,
  findFreshDealProducts,
  countProducts,
  createProductWithInventory,
  deleteProduct,
  findProductBySku,
  getProductStats,
  getBuyerProductStats,
  updateProduct,
  updateProductMarketplace,
  findProductMarketplaceById,
} from "./queries/products";
import { findCategoryById } from "./queries/categories";
import { findCompanyById } from "./queries/companies";
import { findAllInventory, updateInventory } from "./queries/inventory";
import { associateProductImage } from "./queries/productImages";

const unitTypeSchema = z.enum(["kg", "lb", "case", "pallet", "each", "bunch", "box", "bag"]);
const gradeSchema = z.enum(["premium", "grade_a", "grade_b", "standard"]);
const statusSchema = z.enum(["draft", "active", "archived"]);
export function isSupportedProductImageUrl(value: string) {
  return (
    value.startsWith("/api/uploads/") ||
    value.startsWith("api/uploads/") ||
    value.startsWith("/uploads/") ||
    value.startsWith("uploads/") ||
    value.startsWith("/products/") ||
    value.startsWith("products/") ||
    /^https?:\/\//i.test(value) ||
    value.startsWith("data:image/")
  );
}

const productImageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    isSupportedProductImageUrl,
    "Product images must be uploaded files, supported local product assets, or HTTP(S) URLs.",
  );

const productOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Option name is required."),
  price: z.number().min(0, "Option price must be non-negative."),
  compareAtPrice: z.number().min(0).optional().nullable(),
  mealPrice: z.number().min(0).optional().nullable(),
  onlyPrice: z.number().min(0).optional().nullable(),
});

const productMutationSchema = z.object({
  name: z.string().trim().min(2, "Product name is required."),
  sku: z.string().trim().min(2, "SKU is required.").max(80),
  barcode: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  categoryId: z.number().int().positive("Category is required."),
  supplierId: z.number().int().positive().optional(),
  description: z.string().trim().max(5000).optional().or(z.literal("").transform(() => undefined)),
  purchasePrice: z.number().positive("Purchase price must be greater than zero."),
  wholesalePrice: z.number().positive("Wholesale price must be greater than zero.").optional(),
  sellingPrice: z.number().min(0, "Selling price must be greater than or equal to zero."),
  discount: z.number().min(0).max(100).optional(),
  openingStock: z.number().int().min(0).default(0),
  availableStock: z.number().int().min(0).optional(),
  reservedStock: z.number().int().min(0).optional(),
  minimumStock: z.number().int().min(0).default(10),
  reorderQuantity: z.number().int().min(0).optional(),
  warehouse: z.string().trim().min(1, "Warehouse is required.").max(100),
  batchNumber: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  status: statusSchema.default("active"),
  unitType: unitTypeSchema.default("kg"),
  unitSize: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  minimumOrderQuantity: z.number().int().positive().default(1),
  grade: gradeSchema.default("grade_a"),
  organic: z.boolean().default(false),
  images: z.array(productImageUrlSchema).default([]),
  options: z.array(productOptionSchema).optional().default([]),
  tags: z.array(z.string().trim().min(1)).default([]),
});

const productUpdateSchema = productMutationSchema.partial().extend({
  id: z.number().int().positive(),
});

const productListFilterSchema = z
  .object({
    categoryId: z.number().optional(),
    supplierId: z.number().optional(),
    status: z.string().optional(),
    organic: z.boolean().optional(),
    grade: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    search: z.string().optional(),
    sortBy: z.enum(["price", "name", "newest"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  })
  .optional();

const marketplaceUpdateSchema = z.object({
  id: z.number().int().positive(),
  marketplaceVisible: z.boolean(),
  showInFreshDeals: z.boolean(),
  isFeatured: z.boolean(),
  displayPriority: z.number().int().min(0).nullable(),
});

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product"
  );
}

function parseProductTags(value?: string | null) {
  if (!value) return {};
  try {
    return JSON.parse(value) as {
      sku?: string;
      barcode?: string;
      wholesalePrice?: number;
      discount?: number;
      tags?: string[];
    };
  } catch {
    return { tags: value.split(",").map((tag) => tag.trim()).filter(Boolean) };
  }
}

function productTags(input: {
  sku: string;
  barcode?: string;
  wholesalePrice?: number;
  discount?: number;
  tags?: string[];
}) {
  return JSON.stringify({
    sku: input.sku.trim(),
    barcode: input.barcode?.trim() || undefined,
    wholesalePrice: input.wholesalePrice,
    discount: input.discount,
    tags: input.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
  });
}

function canManageProducts(user?: { role?: string | null; email?: string | null } | null) {
  return user?.role === "admin" || isOwner(user);
}

async function validateSupplierCompany(supplierId: number) {
  const company = await findCompanyById(supplierId);
  if (!company || !company.isActive || !["supplier", "both"].includes(company.type)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Select an active supplier company.",
    });
  }
}

function inventoryStatus(quantityAvailable: number, reorderLevel: number) {
  if (quantityAvailable <= 0) return "out_of_stock" as const;
  if (quantityAvailable <= reorderLevel) return "low_stock" as const;
  return "in_stock" as const;
}

export const productRouter = createRouter({
  list: publicQuery
    .input(productListFilterSchema)
    .query(async ({ ctx, input }) => {
      const filters = input ?? {};
      return canManageProducts(ctx.user)
        ? findAllProducts(filters)
        : findBuyerProducts(filters);
    }),

  freshDeals: publicQuery
    .input(productListFilterSchema)
    .query(async ({ input }) => findFreshDealProducts(input ?? {})),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = canManageProducts(ctx.user)
        ? await findProductBySlug(input.slug)
        : await findBuyerProductBySlug(input.slug);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found.",
        });
      }
      return product;
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const product = canManageProducts(ctx.user)
        ? await findProductById(input.id)
        : await findBuyerProductById(input.id);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found.",
        });
      }
      return product;
    }),

  featured: publicQuery
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return findFeaturedProducts(input?.limit ?? 8);
    }),

  count: publicQuery
    .input(
      z
        .object({
          categoryId: z.number().optional(),
          supplierId: z.number().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return countProducts(input ?? {});
    }),

  stats: publicQuery.query(async ({ ctx }) => {
    return canManageProducts(ctx.user) ? getProductStats() : getBuyerProductStats();
  }),

  create: ownerQuery
    .input(productMutationSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user.companyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Your account is not linked to a business.",
        });
      }

      const category = await findCategoryById(input.categoryId);
      if (!category?.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an active category before publishing this product.",
        });
      }

      const duplicateSku = await findProductBySku(input.sku);
      if (duplicateSku) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A product with this SKU already exists.",
        });
      }

      const supplierId = input.supplierId ?? user.companyId;
      await validateSupplierCompany(supplierId);
      const quantityReserved = input.reservedStock ?? 0;
      const quantityOnHand =
        input.availableStock !== undefined
          ? quantityReserved + input.availableStock
          : input.openingStock;
      if (quantityReserved > quantityOnHand) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reserved stock cannot exceed current stock.",
        });
      }

      try {
        const imageUrls = input.images.filter(Boolean);
        const productId = await createProductWithInventory({
          product: {
            name: input.name,
            slug: `${slugify(input.name)}-${input.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            description: input.description,
            shortDescription: input.description?.slice(0, 220),
            categoryId: input.categoryId,
            supplierId,
            unitPrice: input.sellingPrice.toFixed(2),
            compareAtPrice: input.purchasePrice.toFixed(2),
            currency: "INR",
            unitType: input.unitType,
            unitSize: input.unitSize,
            minimumOrderQuantity: input.minimumOrderQuantity,
            image: imageUrls[0],
            images: JSON.stringify(imageUrls),
            grade: input.grade,
            organic: input.organic,
            status: input.status,
            options: input.options && input.options.length > 0 ? JSON.stringify(input.options) : undefined,
            tags: productTags({
              sku: input.sku,
              barcode: input.barcode,
              wholesalePrice: input.wholesalePrice,
              discount: input.discount,
              tags: input.tags,
            }),
          },
          inventory: {
            quantityOnHand,
            quantityReserved,
            quantityAvailable: Math.max(0, quantityOnHand - quantityReserved),
            reorderLevel: input.minimumStock,
            reorderQuantity: input.reorderQuantity,
            warehouseLocation: input.warehouse,
            batchNumber: input.batchNumber,
            notes: `Created from product setup. SKU: ${input.sku}`,
          },
        });

        if (imageUrls && imageUrls.length > 0) {
          for (const url of imageUrls) {
            await associateProductImage(productId, url);
          }
        }

        return { id: productId, slug: `${slugify(input.name)}-${input.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? `Could not create product: ${error.message}`
              : "Could not create product. Please try again.",
        });
      }
    }),

  update: ownerQuery.input(productUpdateSchema).mutation(async ({ input }) => {
    const existing = await findProductById(input.id);
    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Product not found." });
    }
    if (input.supplierId) {
      await validateSupplierCompany(input.supplierId);
    }
    if (input.categoryId) {
      const category = await findCategoryById(input.categoryId);
      if (!category?.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an active category before updating this product.",
        });
      }
    }
    if (input.sku) {
      const duplicateSku = await findProductBySku(input.sku, input.id);
      if (duplicateSku) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A product with this SKU already exists.",
        });
      }
    }

    const existingMeta = parseProductTags(existing.tags);
    const sku = input.sku ?? existingMeta.sku ?? `${existing.id}`;
    const productName = input.name ?? existing.name;
    const slug = input.name !== undefined || input.sku !== undefined
      ? `${slugify(productName)}-${sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
      : undefined;
    const imageUrls = input.images?.filter(Boolean);
    let inventoryUpdate:
      | {
          id: number;
          data: Parameters<typeof updateInventory>[1];
        }
      | undefined;

    const shouldUpdateInventory =
      input.supplierId !== undefined ||
      input.openingStock !== undefined ||
      input.availableStock !== undefined ||
      input.reservedStock !== undefined ||
      input.minimumStock !== undefined ||
      input.reorderQuantity !== undefined ||
      input.warehouse !== undefined ||
      input.batchNumber !== undefined;

    if (shouldUpdateInventory) {
      const [record] = await findAllInventory({ productId: input.id });
      if (record) {
        const quantityReserved = input.reservedStock ?? record.quantityReserved;
        const quantityOnHand =
          input.availableStock !== undefined && input.openingStock === undefined
            ? quantityReserved + input.availableStock
            : input.openingStock ?? record.quantityOnHand;
        if (quantityReserved > quantityOnHand) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Reserved stock cannot exceed current stock.",
          });
        }
        const quantityAvailable = Math.max(0, quantityOnHand - quantityReserved);
        const reorderLevel = input.minimumStock ?? record.reorderLevel;
        inventoryUpdate = {
          id: record.id,
          data: {
            supplierId: input.supplierId,
            quantityOnHand,
            quantityReserved,
            quantityAvailable,
            reorderLevel,
            reorderQuantity: input.reorderQuantity,
            warehouseLocation: input.warehouse,
            batchNumber: input.batchNumber,
            status: inventoryStatus(quantityAvailable, reorderLevel),
            lastCountedAt: new Date(),
          },
        };
      }
    }

    await updateProduct(input.id, {
      name: input.name,
      slug,
      description: input.description,
      shortDescription: input.description?.slice(0, 220),
      categoryId: input.categoryId,
      supplierId: input.supplierId,
      unitPrice: input.sellingPrice?.toFixed(2),
      compareAtPrice: input.purchasePrice?.toFixed(2),
      unitType: input.unitType,
      unitSize: input.unitSize,
      minimumOrderQuantity: input.minimumOrderQuantity,
      image: imageUrls ? imageUrls[0] ?? null : undefined,
      images: imageUrls ? JSON.stringify(imageUrls) : undefined,
      grade: input.grade,
      organic: input.organic,
      status: input.status,
      options: input.options !== undefined ? (input.options.length > 0 ? JSON.stringify(input.options) : null) : undefined,
      tags:
        input.sku ||
        input.barcode !== undefined ||
        input.wholesalePrice !== undefined ||
        input.discount !== undefined ||
        input.tags !== undefined
          ? productTags({
              sku,
              barcode: input.barcode ?? existingMeta.barcode,
              wholesalePrice: input.wholesalePrice ?? existingMeta.wholesalePrice,
              discount: input.discount ?? existingMeta.discount,
              tags: input.tags ?? existingMeta.tags ?? [],
            })
          : undefined,
    });

    if (inventoryUpdate) {
      await updateInventory(inventoryUpdate.id, inventoryUpdate.data);
    }

    if (imageUrls && imageUrls.length > 0) {
      for (const url of imageUrls) {
        await associateProductImage(input.id, url);
      }
    }

    return { success: true };
  }),

  updateMarketplace: ownerQuery
    .input(marketplaceUpdateSchema)
    .mutation(async ({ input }) => {
      const existing = await findProductById(input.id);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found." });
      }

      await updateProductMarketplace(input.id, {
        marketplaceVisible: input.marketplaceVisible,
        showInFreshDeals: input.showInFreshDeals,
        isFeatured: input.isFeatured,
        displayPriority: input.displayPriority,
      });
      return { success: true };
    }),

  marketplaceById: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const marketplace = await findProductMarketplaceById(input.id);
      if (!marketplace) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found." });
      }
      return marketplace;
    }),

  delete: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const existing = await findProductById(input.id);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found." });
      }
      await deleteProduct(input.id);
      return { success: true };
    }),
});
