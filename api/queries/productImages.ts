import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { eq, sql } from "drizzle-orm";
import { getDb } from "./connection";
import { productImages } from "@db/schema";

export interface DurableProductImage {
  filename: string;
  mimeType: string;
  data: Buffer;
  size: number;
  productId: number | null;
}

export function extractFilename(imagePathOrUrl: string): string {
  const clean = imagePathOrUrl.trim().split("?")[0].split("#")[0];
  return path.basename(clean);
}

export async function saveProductImageDurable(input: {
  filename: string;
  mimeType: string;
  data: Buffer;
  size: number;
  productId?: number | null;
}): Promise<void> {
  const db = getDb();
  await db
    .insert(productImages)
    .values({
      filename: input.filename,
      mimeType: input.mimeType,
      data: input.data,
      size: input.size,
      productId: input.productId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: productImages.filename,
      set: {
        mimeType: input.mimeType,
        data: input.data,
        size: input.size,
        productId: input.productId ?? sql`COALESCE(EXCLUDED."productId", ${productImages.productId})`,
        updatedAt: new Date(),
      },
    });
}

export async function findProductImageByFilename(
  filename: string,
): Promise<DurableProductImage | null> {
  const db = getDb();
  try {
    const rows = await db
      .select({
        filename: productImages.filename,
        mimeType: productImages.mimeType,
        data: productImages.data,
        size: productImages.size,
        productId: productImages.productId,
      })
      .from(productImages)
      .where(eq(productImages.filename, filename))
      .limit(1);

    const match = rows[0];
    if (!match) return null;

    const dataBuffer = Buffer.isBuffer(match.data)
      ? match.data
      : Buffer.from(match.data as unknown as Uint8Array);

    return {
      filename: match.filename,
      mimeType: match.mimeType,
      data: dataBuffer,
      size: match.size,
      productId: match.productId,
    };
  } catch (err) {
    console.error(`[durable-images] Error querying product image "${filename}":`, err);
    return null;
  }
}

export async function associateProductImage(
  productId: number,
  filenameOrUrl: string,
): Promise<void> {
  const filename = extractFilename(filenameOrUrl);
  if (!filename) return;

  const db = getDb();
  try {
    await db
      .update(productImages)
      .set({
        productId,
        updatedAt: new Date(),
      })
      .where(eq(productImages.filename, filename));
  } catch (err) {
    console.warn(`[durable-images] Could not associate image "${filename}" with product ${productId}:`, err);
  }
}

function detectMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

/**
 * Migrates local product images from disk into durable Neon PostgreSQL storage.
 * Ensures existing product images survive any container restart or filesystem wipe.
 */
export async function migrateLocalImagesToDurable(): Promise<{
  migrated: string[];
  count: number;
}> {
  const searchDirs = [
    path.resolve(process.cwd(), "uploads", "products"),
    path.resolve(process.cwd(), "public", "products"),
  ];

  const migrated: string[] = [];

  for (const dir of searchDirs) {
    if (!existsSync(dir)) continue;

    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        if (!/\.(png|jpe?g|webp|svg|gif)$/i.test(file)) continue;

        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);
        if (!stats.isFile() || stats.size === 0) continue;

        const fileBytes = await fs.readFile(filePath);
        const mimeType = detectMimeType(file);

        let productId: number | null = null;
        if (file.includes("7dfe9590") || file === "french-fries.png") {
          productId = 61; // French Fries
        } else if (file.includes("e1041cb3") || file.includes("3509f65f")) {
          productId = 65; // Mac N'Cheese
        }

        await saveProductImageDurable({
          filename: file,
          mimeType,
          data: fileBytes,
          size: fileBytes.length,
          productId,
        });

        migrated.push(file);
      }
    } catch (err) {
      console.error(`[durable-images] Error reading directory ${dir}:`, err);
    }
  }

  // Also ensure alias for product-3509f65f-efcc-4cca-9a75-e6466f1d1ffd.png points to Mac N'Cheese image
  const macNCheeseFile = path.resolve(process.cwd(), "uploads", "products", "product-e1041cb3-332d-4286-9e70-62f2e100b916.png");
  if (existsSync(macNCheeseFile)) {
    try {
      const macBytes = await fs.readFile(macNCheeseFile);
      await saveProductImageDurable({
        filename: "product-3509f65f-efcc-4cca-9a75-e6466f1d1ffd.png",
        mimeType: "image/png",
        data: macBytes,
        size: macBytes.length,
        productId: 65,
      });
      migrated.push("product-3509f65f-efcc-4cca-9a75-e6466f1d1ffd.png");
    } catch (err) {
      console.warn("[durable-images] Could not alias product-3509f65f:", err);
    }
  }

  return { migrated, count: migrated.length };
}
