# Shah's Halal / Shop Roadmap

**Version:** 2.0

**Status:** Active

**Last Updated:** 2026-09-20

---

## Strategic Phases Overview

```text
Phase 1: Foundation & Storefront Experience (ACTIVE / COMPLETED)
Phase 2: Administrative ERP & Operations (ACTIVE / COMPLETED)
Phase 3: Production Hardening & Cloud Ingress (IN PROGRESS)
Phase 4: Customer Accounts & Loyalty Re-activation (PLANNED)
Phase 5: Multi-Tenant Enterprise Scaling (PLANNED)
```

---

## Phase 1 — Customer Storefront Experience (Shah's Halal)

- [x] **Storefront Branding:** Shah's Halal ("Fresh Food · Pure Taste") branding and visual identity.
- [x] **Storefront Landing Page (`LandingPage.tsx`):** Hero section, category quick-scroll, featured dishes, and special offers.
- [x] **Halal Food Taxonomy:** Specialized food categories (Fresh Halal Meats, Biryani & Rice, Platters, Gyros & Sandwiches, Appetizers, Beverages, Sauces & Condiments).
- [x] **Customer Bottom Navigation (`CustomerBottomNav.tsx`):** Fixed 4-tab bar with Home (`/`), Categories (`/categories`), Cart (`/cart`), and About (`/about`).
- [x] **Customer About Page (`AboutPage.tsx`):** Dedicated brand story, Halal certification standards, quality pillars, interactive FAQ accordion, and store contact info.
- [x] **Customer Cart Experience:** Unauthenticated guest cart with local storage persistence (`src/lib/guestCart.ts`).
- [x] **Public Catalog Browsing:** Filter by category, price, and halal tags.
- [x] **Checkout & Payment Flow:** Razorpay modal integration with backend HMAC-SHA256 signature verification.

---

## Phase 2 — Administrative ERP & Operations (Shop / FreshFlow)

- [x] **Admin Authentication:** Constant-time password validation, JWT access and refresh token cookies (`api/auth/admin-session.ts`).
- [x] **Administrative Portal (`/admin/login`, `/dashboard`):** Unified operations navigation and metrics.
- [x] **Product & Catalog Management:** Complete CRUD, image uploads, wholesale pricing, and marketplace visibility controls.
- [x] **Category Management:** Active status controls and hierarchical ordering.
- [x] **Multi-Warehouse Stock Management:** Stock tracking, reserved stock, reorder levels, and physical warehouse directories.
- [x] **Immutable Stock Movement Log:** Audit logs for all inbound, outbound, transfer, and adjustment events.
- [x] **Invoicing & Billing:** GST-compliant tax invoices, itemized tax rates (CGST/SGST/IGST), and PDF/print views.
- [x] **Delivery Zones & Shipping:** State-level delivery zone fees and warehouse shipping thresholds.
- [x] **Reports & Business Analytics:** Revenue analytics, inventory valuation, and order statistics.
- [x] **Database Resiliency:** Proxy interceptor routing queries to mock DB instance when PostgreSQL is unconfigured.

---

## Phase 3 — Production Hardening & Cloud Ingress (In Progress)

- [x] **Containerization:** Dockerfile and Docker Compose orchestration (Nginx, Node, PostgreSQL).
- [x] **Edge Security:** Nginx reverse proxy with gzip, CSP, and security headers.
- [x] **Automated Boot Migrations:** Programmatic Drizzle schema migrations during container boot with error catching.
- [x] **Health Check Endpoints:** Node `/health` and Nginx `/nginx-health`.
- [ ] **DNS & TLS Provisioning:** Domain configuration for `amfruits.shop` with Let's Encrypt certificates.
- [ ] **Automated CI/CD Pipeline:** GitHub Actions for automated linting, testing, and container deployment.

---

## Phase 4 — Customer Accounts & Loyalty Re-activation (Planned)

- [ ] **Re-activate Customer Auth:** Connect preserved `legacyAuthRouter` (email login, mobile normalization, SMS OTP) to customer UI.
- [ ] **Order Tracking Portal:** Re-enable customer-facing order timeline and live dispatch tracker.
- [ ] **Customer Profile & Address Book:** Persist multiple delivery addresses directly to `user_addresses`.
- [ ] **Customer Loyalty & Rewards:** Points accrual on completed orders.

---

## Phase 5 — Multi-Tenant Enterprise Scaling (Future)

- [ ] Multi-tenant isolation with tenant-scoped database schemas.
- [ ] Staff role-based access control (RBAC) with granular permission tables.
- [ ] Comprehensive audit logs for all administrative mutations.
- [ ] Automated supplier inventory synchronization via webhooks.