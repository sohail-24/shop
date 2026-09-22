import { env } from "./lib/env";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { authenticateAdminRequest } from "./auth/admin-session";
import { isOwner } from "@contracts/roles";
import {
  saveProductImageDurable,
  findProductImageByFilename,
  migrateLocalImagesToDurable,
} from "./queries/productImages";

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { basename, extname, join, resolve } from "node:path";

const app = new Hono<{ Bindings: HttpBindings }>();
const productUploadsDirectory = resolve(process.cwd(), "uploads/products");
mkdirSync(productUploadsDirectory, { recursive: true });
const maxProductImageBytes = 5 * 1024 * 1024;
const imageExtensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

app.use("*", async (c, next) => {
  const origin = c.req.header("origin");
  if (origin) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Credentials", "true");
    c.header("Vary", "Origin");
  } else {
    c.header("Access-Control-Allow-Origin", "*");
  }
  c.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, PATCH, HEAD");
  c.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-trpc-source, trpc-accept, *"
  );
  c.header("Access-Control-Expose-Headers", "Content-Length, *");
  c.header("Access-Control-Max-Age", "600");

  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }
  await next();
});

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

let pkgVersion = "1.0.0";
try {
  const pkgPath = resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  if (pkg.version) pkgVersion = pkg.version;
} catch {
  // fallback if package.json is missing or unreadable
}

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "FreshFlow",
    version: pkgVersion,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/uploads/:filename", async (c) => {
  const filename = c.req.param("filename");
  if (filename !== basename(filename) || !imageExtensions[contentTypeFor(filename)]) {
    return c.json({ error: "Not Found" }, 404);
  }

  const candidatePaths = [
    join(productUploadsDirectory, filename),
    resolve(process.cwd(), "public/products", filename),
    resolve(process.cwd(), "public/branding", filename),
    resolve(process.cwd(), "public/uploads/products", filename),
    resolve(process.cwd(), "public/uploads", filename),
    resolve(process.cwd(), "dist/public/products", filename),
  ];

  for (const candidatePath of candidatePaths) {
    try {
      if (existsSync(candidatePath)) {
        const image = await readFile(candidatePath);
        return new Response(image, {
          headers: {
            "Content-Type": contentTypeFor(filename),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch {
      // Continue searching candidate paths
    }
  }

  // Fallback to durable Neon PostgreSQL storage if file is not on local filesystem
  try {
    const durableImage = await findProductImageByFilename(filename);
    if (durableImage && durableImage.data && durableImage.data.length > 0) {
      // Opportunistically cache to local filesystem for fast future reads
      try {
        await writeFile(join(productUploadsDirectory, filename), durableImage.data);
      } catch {
        // Cache write failure is non-fatal
      }

      const mimeType = durableImage.mimeType || contentTypeFor(filename) || "image/png";
      return new Response(durableImage.data, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (err) {
    console.error(`[durable-images] Error fetching image "${filename}" from database:`, err);
  }

  return c.json({ error: "Not Found" }, 404);
});

app.get("/api/uploads/products/:filename", (c) => {
  const filename = basename(c.req.param("filename"));
  return c.redirect(`/api/uploads/${filename}`);
});

app.get("/uploads/products/:filename", (c) => {
  const filename = basename(c.req.param("filename"));
  return c.redirect(`/api/uploads/${filename}`);
});

app.get("/uploads/:filename", (c) => {
  const filename = basename(c.req.param("filename"));
  return c.redirect(`/api/uploads/${filename}`);
});

app.post("/api/products/upload", async (c) => {
  const responseHeaders = new Headers();
  let user;
  try {
    user = await authenticateAdminRequest(c.req.raw.headers, responseHeaders);
  } catch {
    return c.json({ error: "Authentication required" }, 401);
  }

  if (!isOwner(user) && user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const form = await c.req.parseBody();
  const image = form.image;
  if (!image || typeof image === "string" || Array.isArray(image)) {
    return c.json({ error: "Provide one product image." }, 400);
  }

  const extension = imageExtensions[image.type];
  if (!extension) {
    return c.json({ error: "Use a PNG, JPEG, or WebP image." }, 400);
  }
  if (image.size > maxProductImageBytes) {
    return c.json({ error: "Product images must be 5 MB or smaller." }, 400);
  }

  const filename = `product-${randomUUID()}${extension}`;
  const fileBytes = Buffer.from(await image.arrayBuffer());

  // Save to durable Neon PostgreSQL database FIRST
  try {
    await saveProductImageDurable({
      filename,
      mimeType: image.type,
      data: fileBytes,
      size: fileBytes.length,
    });
  } catch (err) {
    console.error("[durable-images] Failed to save image to Neon PostgreSQL:", err);
    return c.json({ error: "Failed to persist image to durable database." }, 500);
  }

  // Also write to local cache directories for fast I/O
  try {
    await mkdir(productUploadsDirectory, { recursive: true });
    await writeFile(join(productUploadsDirectory, filename), fileBytes);
    const publicProductsDir = resolve(process.cwd(), "public/products");
    await mkdir(publicProductsDir, { recursive: true });
    await writeFile(join(publicProductsDir, filename), fileBytes);
  } catch {
    // Ignore cache failure
  }

  for (const [name, value] of responseHeaders) c.header(name, value, { append: true });
  return c.json({ url: `/api/uploads/${filename}` }, 201);
});

function contentTypeFor(filename: string) {
  const extension = extname(filename).toLowerCase();
  return Object.entries(imageExtensions).find(([, value]) => value === extension)?.[0] ?? "";
}

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// Ensure local images are migrated into durable Neon PostgreSQL storage on server startup
migrateLocalImagesToDurable().catch((err) => {
  console.warn("[durable-images] Background startup image migration warning:", err);
});

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  try {
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const { getDb } = await import("./queries/connection");
    console.log("Running database migrations...");
    const db = getDb();
    await migrate(db, { migrationsFolder: resolve(process.cwd(), "db/migrations") });
    console.log("Database migrations completed successfully.");
  } catch (error: any) {
    console.warn("Database migrations skipped or failed — running with in-memory database:", error?.message);
  }

  const port = 3000;
  const server = serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    // Close the HTTP server
    server.close();

    // Attempt to close DB connection if possible, usually handled by process exit
    // but better to allow ongoing requests to finish
    console.log("Closed HTTP server.");
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}
