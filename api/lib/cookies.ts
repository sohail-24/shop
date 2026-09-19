import type { CookieOptions } from "hono/utils/cookie";

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const proto = headers.get("x-forwarded-proto") || "";
  const host = headers.get("host") || "";
  const origin = headers.get("origin") || "";
  const referer = headers.get("referer") || "";

  const isHttps =
    proto.includes("https") ||
    headers.get("x-forwarded-ssl") === "on" ||
    host.includes(".run.app") ||
    origin.startsWith("https:") ||
    referer.startsWith("https:") ||
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    path: "/",
    sameSite: isHttps ? "None" : "Lax",
    secure: isHttps,
    partitioned: isHttps,
  };
}
