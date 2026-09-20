# Shah's Halal / Shop Authentication & Authorization

**Version:** 2.0

**Status:** Active

**Last Updated:** 2026-09-20

---

# Purpose

This document defines the verified authentication and authorization architecture for the Shah's Halal / Shop application.

---

# Operational Overview

The application operates with a distinct separation between administrative ERP operations and customer storefront access:

1. **Administrator Authentication (Active):**
   - Accessed via `/admin/login`.
   - Validates credentials against environment variables (`ADMIN_EMAIL` and `ADMIN_PASSWORD`).
   - Uses cryptographic timing-safe string comparison (`crypto.timingSafeEqual`).
   - Issues JWT access tokens (15-minute validity) and refresh tokens (30-day validity).
   - Transmits tokens via secure HTTP-only cookies (`shop_admin_access`, `shop_admin_refresh`) and returns the access token to the client.
   - Client stores token in `localStorage` under `shop_admin_token` and includes it in `Authorization: Bearer <token>` headers.
   - Grants full access to `/dashboard`, `/inventory`, `/warehouses`, `/customers`, `/invoices`, `/delivery-zones`, `/shipping-methods`, `/gst-settings`, `/reports`, and product editing.

2. **Customer Storefront (Active Guest Mode):**
   - Public customer access does not require login or registration.
   - Cart items are persisted in client-side `localStorage` via the guest cart hook (`src/lib/guestCart.ts`).
   - Navigation routes `/login`, `/register`, and `/auth` automatically redirect to `/` (home storefront).

3. **Legacy Customer Authentication (Preserved but Deactivated):**
   - The multi-method buyer authentication router (`legacyAuthRouter` in `api/auth-router.ts`) supports user registration, password login, mobile normalization (`+91`), and mobile OTP verification.
   - It is intentionally preserved in the codebase for modularity and future customer loyalty re-activation, but is not exposed on the active `appRouter`.

---

# Admin Authentication Flow

```text
┌────────────────────────────────────────────────────────┐
│ 1. Admin navigates to /admin/login                     │
│    Enters Email & Password                             │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Client invokes trpc.auth.loginAdmin.useMutation()   │
│    Payload: { email, password }                        │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. Server validates credentials in admin-session.ts    │
│    - Checks ADMIN_EMAIL and ADMIN_PASSWORD             │
│    - Validates with crypto.timingSafeEqual             │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. Server issues JWT Access & Refresh Tokens           │
│    - Sets cookie: shop_admin_access (15 min, HttpOnly) │
│    - Sets cookie: shop_admin_refresh (30 d, HttpOnly)  │
│    - Returns: { token, user: { id: 1, role: 'admin' } }│
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 5. Client stores token in localStorage                 │
│    key: 'shop_admin_token'                             │
│    Redirects to /dashboard                             │
└────────────────────────────────────────────────────────┘
```

---

# Request Authentication & Context Injection

For every incoming HTTP / tRPC request, `api/context.ts` creates the request context:

1. **Token Extraction:**
   - Checks `Authorization: Bearer <token>` header.
   - Checks `shop_admin_access` cookie via `getCookie(c, "shop_admin_access")`.
2. **Token Verification:**
   - Calls `authenticateAdminRequest(tokenOrCookie)` from `api/auth/admin-session.ts`.
   - Verifies JWT signature against `JWT_SECRET` (falling back to a default dev secret if unset).
3. **Context Population:**
   - Injects authenticated user `{ id: 1, email: ADMIN_EMAIL, role: "admin", name: "Administrator" }` into `ctx.user`.
   - If missing or invalid, `ctx.user` is set to `null`.

---

# Procedure Authorization Tiers (`api/middleware.ts`)

Backend tRPC endpoints are protected by 4 tiered middleware functions:

1. **`publicProcedure` / `publicQuery`:**
   - No authentication required.
   - Used for public catalog browsing (`product.list`, `product.bySlug`, `category.list`, `auth.loginAdmin`).

2. **`authedProcedure` / `authedQuery`:**
   - Requires `ctx.user !== null`.
   - Throws `UNAUTHORIZED` if user is unauthenticated.

3. **`ownerProcedure` / `ownerQuery`:**
   - Requires `ctx.user.role === "admin"` or `ctx.user.email === ownerEmail`.
   - Used for catalog editing, inventory adjustments, invoices, and reports.

4. **`adminProcedure` / `adminQuery`:**
   - Requires `ctx.user.role === "admin"`.
   - Used for administrative system controls.

---

# Security & Session Storage Specifications

| Parameter | Specification | Notes |
| --- | --- | --- |
| **Access Token Cookie** | `shop_admin_access` | `HttpOnly`, `Path=/`, `Max-Age=900` (15m), `SameSite=Lax`, `Secure` in production |
| **Refresh Token Cookie** | `shop_admin_refresh`| `HttpOnly`, `Path=/`, `Max-Age=2592000` (30d), `SameSite=Lax`, `Secure` in production |
| **Client Storage Key** | `shop_admin_token` | Stored in `localStorage` for API calls using `Authorization: Bearer` header |
| **Password Verification** | `crypto.timingSafeEqual` | Constant-time comparison prevents timing attack vulnerabilities |
| **Guest Cart Storage** | `guest_cart` | JSON array stored in browser `localStorage` under `guest_cart` |

---

# Legacy Buyer Authentication (Preserved Code)

The codebase retains complete buyer authentication logic in `api/auth-router.ts` (`legacyAuthRouter`), `api/auth/password.ts`, `api/auth/mobile.ts`, and `api/auth/otp-store.ts`.

- **Mobile Phone Formatting:** Indian mobile numbers are normalized to E.164 (`+91XXXXXXXXXX`) on the server, while displayed as 10 digits on the frontend.
- **Password Security:** Scrypt and Bcrypt password hashing algorithms.
- **OTP Delivery:** Abstracted OTP provider with in-memory fallback store (`otp-store.ts`).
- **Database Schema:** `users`, `otp_verifications`, and `user_addresses` tables remain fully mapped in `db/schema.ts` for future activation.

---

# Environment Configuration

The following environment variables govern authentication in `api/lib/env.ts`:

- `ADMIN_EMAIL`: Required. The email address permitted to log into the administrative ERP at `/admin/login`.
- `ADMIN_PASSWORD`: Required. The password for administrator access.
- `JWT_SECRET`: Secret key used for signing and verifying JWT tokens. If unset in development, defaults to an internal fallback key (a secure 32+ character random string MUST be supplied in production).
- `NODE_ENV`: Set to `production` in live environments to force `Secure` cookie attributes.

---

# Verification & Status

| Capability | Verified Status | Evidence in Codebase |
| --- | --- | --- |
| **Admin Login** | **ACTIVE** | `src/pages/AdminLogin.tsx`, `api/auth-router.ts` (`loginAdmin`) |
| **Timing-Safe Auth** | **ACTIVE** | `api/auth/admin-session.ts` (`crypto.timingSafeEqual`) |
| **HTTP-Only Cookies** | **ACTIVE** | `api/auth/admin-session.ts` (`setCookie`) |
| **JWT Bearer Token** | **ACTIVE** | `src/lib/trpc.ts`, `api/auth/admin-session.ts` |
| **Guest Cart** | **ACTIVE** | `src/lib/guestCart.ts` (localStorage persistence) |
| **Customer Auth Redirect** | **ACTIVE** | `src/App.tsx` (`/login` -> `/`) |
| **Legacy Auth Router** | **PRESERVED** | `api/auth-router.ts` (`legacyAuthRouter`) |
| **SMS OTP Service** | **NOT CONFIGURED** | In-memory OTP store (`api/auth/otp-store.ts`) |