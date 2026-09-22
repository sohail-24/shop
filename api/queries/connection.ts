import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";
import { mockDbInstance } from "./mockDb";

const fullSchema = { ...schema, ...relations };

let instance: any;
let pool: Pool | null = null;
let useMock = false;

// Detect unresolvable container hostnames like "db:5432"
if (!env.databaseUrl || env.databaseUrl.includes("@db:") || env.databaseUrl.includes("@db/")) {
  useMock = true;
}

export function getDb(): any {
  if (useMock) {
    return mockDbInstance;
  }

  if (!instance) {
    try {
      pool = new Pool({
        connectionString: env.databaseUrl,
        connectionTimeoutMillis: 15000,
      });

      pool.on("error", (err) => {
        console.warn("[FreshFlow] Database error, falling back to mock:", err.message);
        useMock = true;
      });

      const realDb = drizzle(pool, {
        schema: fullSchema,
      });

      // Wrap realDb in a safety proxy that falls back to mockDbInstance if connection fails
      instance = new Proxy(realDb, {
        get(target, prop, receiver) {
          if (useMock) {
            return Reflect.get(mockDbInstance, prop);
          }
          const orig = Reflect.get(target, prop, receiver);
          if (typeof orig === "function") {
            return function (...args: any[]) {
              try {
                const res = orig.apply(target, args);
                if (res && typeof res.then === "function") {
                  return res.catch((err: any) => {
                    if (
                      err?.code === "ENOTFOUND" ||
                      err?.code === "ECONNREFUSED" ||
                      err?.message?.includes("EAI_AGAIN") ||
                      err?.message?.includes("connection")
                    ) {
                      console.warn("[FreshFlow] DB query failed, switching to mock:", err.message);
                      useMock = true;
                      const mockTarget = Reflect.get(mockDbInstance, prop);
                      return typeof mockTarget === "function" ? mockTarget(...args) : mockTarget;
                    }
                    throw err;
                  });
                }
                return res;
              } catch (e: any) {
                console.warn("[FreshFlow] DB call failed, switching to mock:", e.message);
                useMock = true;
                const mockTarget = Reflect.get(mockDbInstance, prop);
                return typeof mockTarget === "function" ? mockTarget(...args) : mockTarget;
              }
            };
          }
          return orig;
        },
      });
    } catch (e: any) {
      console.warn("[FreshFlow] DB initialization failed, using mock mode:", e?.message);
      useMock = true;
      return mockDbInstance;
    }
  }

  return instance;
}

export { mockDbInstance };
