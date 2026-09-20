# Shah's Halal / Shop (FreshFlow)

Shah's Halal is an authentic Halal food restaurant storefront powered by the **Shop** / **FreshFlow** administrative ERP platform. Built with React 19, Vite, Tailwind CSS, Radix UI, Hono, tRPC, PostgreSQL, and Drizzle ORM.

The platform provides a dual-layer architecture:
1. **Customer Storefront ("Shah's Halal"):** Public, friction-free Halal food discovery, menu categorization, dedicated About page, guest cart, and Razorpay checkout.
2. **Operations & ERP ("Shop"):** Secure administrative portal (`/admin/login`, `/dashboard`) for product management, multi-warehouse stock movements, GST invoicing, order fulfillment, and business intelligence.

---

## Quick Start

### Development

```bash
npm install
cp .env.example .env
npm run dev
```

The application will bind to `0.0.0.0:3000`.

### Production (Docker)

```bash
cp .env.example .env
docker compose up --build -d
```

- **Nginx Reverse Proxy:** Ingress on port `80`, terminates TLS and reverse-proxies `/api/*` to Hono.
- **Node.js App Server:** Hono + tRPC backend on internal port `3000`.
- **PostgreSQL Database:** PostgreSQL 15 on internal port `5432` with automated boot migrations (`api/boot.ts`).

---

## Architecture & Workflows

### 1. Customer Storefront
- **Navigation:** Persistent 4-tab bottom navigation (`CustomerBottomNav.tsx`) linking to Home (`/`), Categories (`/categories`), Cart (`/cart`), and About (`/about`).
- **Brand Heritage & Halal Transparency:** Dedicated About page (`/about`) featuring 100% Zabiha certification, quality pillars, interactive FAQ, and store hours.
- **Ordering Experience:** LocalStorage guest cart (`src/lib/guestCart.ts`), live cart badge counts, and Razorpay checkout modal with cryptographic backend signature verification (`crypto.timingSafeEqual`).

### 2. Administrative Operations
- **Authentication:** Admin login at `/admin/login` validating against `ADMIN_EMAIL` and `ADMIN_PASSWORD` with HTTP-only cookies (`shop_admin_access`, `shop_admin_refresh`).
- **Operations Dashboard (`/dashboard`):** Real-time revenue statistics, active orders, and low-stock alerts.
- **Multi-Warehouse Stock:** Multi-facility tracking and an immutable audit log (`warehouse_stock_movements`).
- **Invoicing & Taxes:** Sequential GST invoice generation (`INV-YYYY-XXXX`) with automated CGST/SGST/IGST breakdown.

---

## Documentation Directory

All documentation is maintained according to strict codebase truth:

- **System Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **API Reference (tRPC & Endpoints):** [`docs/API.md`](docs/API.md)
- **Authentication Specification:** [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md)
- **Database Schema:** [`docs/database/SCHEMA.md`](docs/database/SCHEMA.md)
- **Database Migrations:** [`docs/database/MIGRATIONS.md`](docs/database/MIGRATIONS.md)
- **Production Readiness & Deployment:** [`docs/PRODUCTION_READINESS.md`](docs/PRODUCTION_READINESS.md)
- **Roadmap & Phases:** [`docs/ROADMAP.md`](docs/ROADMAP.md)
- **Development Log:** [`docs/DEVELOPMENT_LOG.md`](docs/DEVELOPMENT_LOG.md)
- **Documentation Structure:** [`docs/DOCUMENTATION_STRUCTURE.md`](docs/DOCUMENTATION_STRUCTURE.md)
- **UI & Page Specifications:** [`docs/UI/`](docs/UI/)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

