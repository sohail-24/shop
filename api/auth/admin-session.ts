import * as cookie from "cookie";
import { timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "@db/schema";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";

const encoder = new TextEncoder();
const accessCookieName = "shop_admin_access";
const refreshCookieName = "shop_admin_refresh";
const accessMaxAgeMs = 15 * 60 * 1000;
const refreshMaxAgeMs = 30 * 24 * 60 * 60 * 1000;

type TokenType = "access" | "refresh";

function configuredAdmin() {
  if (!env.adminEmail || !env.adminPassword || !env.jwtAccessSecret || !env.jwtRefreshSecret) {
    throw new Error("Admin authentication is not configured.");
  }
  return { email: env.adminEmail.trim().toLowerCase(), password: env.adminPassword };
}

function keyFor(type: TokenType) {
  return encoder.encode(type === "access" ? env.jwtAccessSecret : env.jwtRefreshSecret);
}

export function activeAdminUser(email: string): User {
  // This is an in-memory session identity only. It is deliberately not a users-table record.
  return {
    id: 0,
    unionId: `admin:${email}`,
    authProvider: "local",
    role: "admin",
    email,
    name: "Administrator",
    phone: null,
    companyId: null,
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
  return activeAdminUser(configured.email);
}

function appendCookie(headers: Headers, requestHeaders: Headers, name: string, value: string, maxAgeMs: number) {
  const options = getSessionCookieOptions(requestHeaders);
  headers.append("set-cookie", cookie.serialize(name, value, {
    httpOnly: true,
    path: "/",
    sameSite: options.sameSite?.toLowerCase() as "lax" | "none",
    secure: options.secure,
    maxAge: Math.floor(maxAgeMs / 1000),
  }));
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
      maxAge: 0,
    }));
  }
}

export async function authenticateAdminRequest(requestHeaders: Headers, responseHeaders?: Headers) {
  const cookies = cookie.parse(requestHeaders.get("cookie") ?? "");
  if (cookies[accessCookieName]) return verifyToken(cookies[accessCookieName], "access");
  if (!cookies[refreshCookieName] || !responseHeaders) throw new Error("Authentication required");
  const user = await verifyToken(cookies[refreshCookieName], "refresh");
  await issueAdminSessionCookies(user.email!, requestHeaders, responseHeaders);
  return user;
}
