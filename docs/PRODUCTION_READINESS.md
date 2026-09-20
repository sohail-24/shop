# Shah's Halal / Shop Production Readiness Assessment & Deployment

**Version:** 2.0

**Status:** Active

**Last Updated:** 2026-09-20

---

## 1. Production Architecture Overview

The application is architected for dual-mode deployment:

- **AI Studio / Container Development:** Boots Vite dev server on `0.0.0.0:3000` with mock database proxy resilience when PostgreSQL is unconfigured.
- **Production Container Stack:** Multi-container Docker deployment orchestrated via `docker-compose.yml`:
  1. **Nginx Edge Layer (`nginx/nginx.conf`):** Public reverse proxy listening on ports 80/443, enforcing rate limits, gzip compression, CSP, and security headers (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`).
  2. **Application Server (`api/boot.ts`):** Node.js runtime executing Hono + tRPC 11 bundled via esbuild (`dist/boot.js`).
  3. **Database (`db`):** PostgreSQL with persistent volume (`pgdata`) and automated startup migrations.

---

## 2. Environment Variables Specification

The production environment expects the following variables declared in `.env.example`:

| Variable | Requirement | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Production: Required | PostgreSQL connection string (`postgresql://postgres:<password>@db:5432/freshflow`). If absent or unreachable, the server falls back to an in-memory database proxy. |
| `ADMIN_EMAIL` | Required | Email address permitted to access `/admin/login`. |
| `ADMIN_PASSWORD` | Required | Password validated with constant-time equality check for administrative access. |
| `OWNER_EMAIL` | Required | Platform owner email used for owner-scoped tRPC procedures. |
| `JWT_SECRET` | Required | Cryptographic secret for signing and verifying JWT authentication tokens. |
| `RAZORPAY_KEY_ID` | Optional / Gateway | Public Razorpay key ID for checkout initialization. |
| `RAZORPAY_KEY_SECRET` | Optional / Gateway | Razorpay secret key for HMAC-SHA256 signature verification. |
| `NODE_ENV` | Optional | Set to `production` in containerized deployments. |
| `PORT` | System / Hardcoded | Fixed to `3000` for application container ingress. |

---

## 3. Verified Security Hardening

- **Timing-Safe Admin Auth:** Uses `crypto.timingSafeEqual` in `api/auth/admin-session.ts` to prevent timing attacks.
- **Payment Signature Verification:** Server calculates HMAC-SHA256 hash using `crypto.createHmac` and validates via constant-time comparison in `api/orderRouter.ts`.
- **Duplicate Payment Prevention:** The order creation pipeline queries the database for pre-existing `razorpayOrderId` records before persisting new orders.
- **Resilient Database Layer:** `api/queries/connection.ts` employs a JavaScript `Proxy` interceptor that routes queries to `mockDbInstance` if PostgreSQL connection fails.
- **Graceful Shutdown:** `SIGTERM` and `SIGINT` signals are intercepted in `api/boot.ts` to cleanly close HTTP listeners.
- **Volume Persistence:** Docker volumes configured for `pgdata` (PostgreSQL) and `product_uploads` (`/app/uploads/products`).

---

## 4. OCI / Production Deployment Checklist

1. **Firewall & Network Ingress:**
   - Port 80 (HTTP) -> Redirect to HTTPS / Certbot challenge.
   - Port 443 (HTTPS) -> TLS termination via Let's Encrypt for `amfruits.shop`.
   - Port 22 (SSH) -> Administrative bastion access.
2. **Container Launch:**
   ```bash
   docker compose up -d --build
   ```
3. **Health Verification:**
   - `GET /health` -> `{ status: "ok", service: "FreshFlow", version: "1.0.0" }`.
   - `GET /nginx-health` -> Verifies edge reverse proxy routing.