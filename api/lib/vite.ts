import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  const rootDir = fs.existsSync(path.resolve(process.cwd(), "dist/public"))
    ? path.resolve(process.cwd(), "dist/public")
    : path.resolve(import.meta.dirname, "public");

  app.use("*", serveStatic({ root: rootDir }));

  app.notFound((c) => {
    const pathname = c.req.path;

    // Never return index.html for missing static assets, scripts, styles, images, or API routes
    if (
      pathname.startsWith("/assets/") ||
      pathname.startsWith("/api/") ||
      /\.(?:js|mjs|cjs|ts|tsx|jsx|css|json|map|wasm|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot)$/i.test(pathname)
    ) {
      return c.text("Not Found", 404);
    }

    const accept = c.req.header("accept") ?? "";
    if (!accept.includes("text/html") && !accept.includes("*/*")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(rootDir, "index.html");
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, "utf-8");
      return c.html(content, 200, {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      });
    }
    return c.text("App loading...", 200);
  });
}
