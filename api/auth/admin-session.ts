import * as cookie from "cookie";
import { timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { users, type User } from "@db/schema";
import { eq, or, and } from "drizzle-orm";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";
import { getDb } from "../queries/connection";
import { ensureDefaultBusiness } from "../queries/companies";

const encoder = new TextEncoder();
const accessCookieName = "shop_admin_access";
const refreshCookieName = "shop_admin_refresh";
const accessMaxAgeMs = 15 * 60 * 1000;
const refreshMaxAgeMs = 30 * 24 * 60 * 60 * 1000;

type TokenType = "access" | "refresh";

let cachedAdminCompanyId: number | null = null;

function configuredAdmin() {
  if (!env.adminEmail || !env.adminPassword || !env.jwtAccessSecret || !env.jwtRefreshSecret) {
    throw new Error("Admin authentication is not configured.");
  }
  return { email: env.adminEmail.trim().toLowerCase(), password: env.adminPassword };
}

function keyFor(type: TokenType) {
  return encoder.encode(type === "access" ? env.jwtAccessSecret : env.jwtRefreshSecret);
}

export function activeAdminUser(email: string, companyId?: number | null): User {
  const finalCompanyId = companyId ?? cachedAdminCompanyId ?? 1;
  return {
    id: 1,
    unionId: `admin:${email.trim().toLowerCase()}`,
    authProvider: "local",
    role: "admin",
    email: email.trim().toLowerCase(),
    name: "Administrator",
    phone: null,
    companyId: finalCompanyId,
    passwordHash: null,
    refreshTokenHash: null,
    isActive: true,
    mobileVerifiedAt: null,
    emailVerifiedAt: null,
    lastSignInAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;
}

export async function resolveAdminUser(email: string): Promise<User> {
  const defaultBusiness = await ensureDefaultBusiness();
  cachedAdminCompanyId = defaultBusiness.id;
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const unionId = `admin:${normalizedEmail}`;

  try {
    let user = await db.query.users.findFirst({
      where: or(
        eq(users.unionId, unionId),
        and(eq(users.email, normalizedEmail), eq(users.role, "admin"))
      ),
    });

    if (!user) {
      const [inserted] = await db
        .insert(users)
        .values({
          unionId,
          authProvider: "local",
          name: "Administrator",
          email: normalizedEmail,
          role: "admin",
          companyId: defaultBusiness.id,
          isActive: true,
          lastSignInAt: new Date(),
        })
        .returning();
      user = inserted;
    } else if (user.companyId !== defaultBusiness.id || user.role !== "admin" || !user.isActive) {
      const [updated] = await db
        .update(users)
        .set({
          companyId: defaultBusiness.id,
          role: "admin",
          isActive: true,
          updatedAt: new Date(),
          lastSignInAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();
      user = updated;
    }

    if (user) {
      return user;
    }
  } catch (error) {
    console.warn("[AdminSession] Database lookup/sync failed, using fallback linked user:", error);
  }

  return activeAdminUser(normalizedEmail, defaultBusiness.id);
}

export function validateAdminCredentials(email: string, password: string) {
  const configured = configuredAdmin();
  const suppliedEmail = Buffer.from(email.trim().toLowerCase());
  const expectedEmail = Buffer.from(configured.email);
  const suppliedPassword = Buffer.from(password);
  const expectedPassword = Buffer.from(configured.password);
  return suppliedEmail.length === expectedEmail.length &&
    suppliedPassword.length === expectedPassword.length &&
    timingSafeEqual(suppliedEmail, expectedEmail) &&
    timingSafeEqual(suppliedPassword, expectedPassword);
}

async function signToken(email: string, type: TokenType) {
  const maxAge = type === "access" ? accessMaxAgeMs : refreshMaxAgeMs;
  return new SignJWT({ typ: type, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("shop-admin")
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + maxAge) / 1000))
    .sign(keyFor(type));
}

async function verifyToken(token: string, type: TokenType) {
  const result = await jwtVerify(token, keyFor(type), { issuer: "shop-admin" });
  const configured = configuredAdmin();
  if (result.payload.typ !== type || result.payload.role !== "admin" || result.payload.sub !== configured.email) {
    throw new Error("Invalid admin token");
  }
  return await resolveAdminUser(configured.email);
}

function appendCookie(headers: Headers, requestHeaders: Headers, name: string, value: string, maxAgeMs: number) {
  const options = getSessionCookieOptions(requestHeaders);
  headers.append("set-cookie", cookie.serialize(name, value, {
    httpOnly: true,
    path: "/",
    sameSite: options.sameSite?.toLowerCase() as "lax" | "none",
    secure: options.secure,
    partitioned: options.partitioned,
    maxAge: Math.floor(maxAgeMs / 1000),
  }));
}

export async function signAdminToken(email: string, type: "access" | "refresh" = "access") {
  return signToken(email, type);
}

export async function issueAdminSessionCookies(email: string, requestHeaders: Headers, responseHeaders: Headers) {
  configuredAdmin();
  appendCookie(responseHeaders, requestHeaders, accessCookieName, await signToken(email, "access"), accessMaxAgeMs);
  appendCookie(responseHeaders, requestHeaders, refreshCookieName, await signToken(email, "refresh"), refreshMaxAgeMs);
}

export function clearAdminSessionCookies(requestHeaders: Headers, responseHeaders: Headers) {
  const options = getSessionCookieOptions(requestHeaders);
  for (const name of [accessCookieName, refreshCookieName]) {
    responseHeaders.append("set-cookie", cookie.serialize(name, "", {
      httpOnly: true,
      path: "/",
      sameSite: options.sameSite?.toLowerCase() as "lax" | "none",
      secure: options.secure,
      partitioned: options.partitioned,
      maxAge: 0,
    }));
  }
}

export async function authenticateAdminRequest(requestHeaders: Headers, responseHeaders?: Headers) {
  const cookies = cookie.parse(requestHeaders.get("cookie") ?? "");
  if (cookies[accessCookieName]) {
    try {
      return await verifyToken(cookies[accessCookieName], "access");
    } catch {
      // Token may be expired; fall through to Bearer / refresh token check
    }
  }

  const authHeader = requestHeaders.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    if (bearerToken) {
      try {
        return await verifyToken(bearerToken, "access");
      } catch {
        // Bearer token verification failed; fall through to refresh check
      }
    }
  }

  if (!cookies[refreshCookieName] || !responseHeaders) throw new Error("Authentication required");
  const user = await verifyToken(cookies[refreshCookieName], "refresh");
  await issueAdminSessionCookies(user.email!, requestHeaders, responseHeaders);
  return user;
}
