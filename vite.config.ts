import devServer from "@hono/vite-dev-server"
import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

function preventAssetFallback(): Plugin {
  return {
    name: "prevent-asset-html-fallback",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split("?")[0] : "";
        if (
          /\.(?:js|mjs|cjs|ts|tsx|jsx|css|json|map|wasm|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot)$/i.test(url) ||
          url.startsWith("/assets/")
        ) {
          if (req.headers.accept) {
            req.headers.accept = req.headers.accept
              .replace(/text\/html/g, "text/plain")
              .replace(/\*\/\*/g, "application/octet-stream");
          } else {
            req.headers.accept = "application/octet-stream";
          }
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    devServer({ entry: "api/boot.ts", exclude: [/^\/(?!api\/).*$/] }),
    react(),
    preventAssetFallback(),
  ],
  server: {
    port: 3000,
    host: "0.0.0.0",
    allowedHosts: true,
    cors: {
      origin: true,
      credentials: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      "db": path.resolve(__dirname, "./db"),
    },
  },
  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/react-router")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/@trpc") || id.includes("node_modules/@tanstack") || id.includes("node_modules/superjson")) {
            return "vendor-data";
          }
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
            return "vendor-charts";
          }
          if (id.includes("node_modules/@radix-ui") || id.includes("node_modules/lucide-react")) {
            return "vendor-ui";
          }
        },
      },
    },
  },
});
