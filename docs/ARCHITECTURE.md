# Architecture

This document defines the technical architecture of the **Shah's Halal / Shop** application based strictly on verified repository implementation.

---

## 1. Project Identity & Naming Conventions

The application maintains a dual-naming convention reflecting its active customer experience and foundational architecture:

- **Customer-Facing Brand:** **Shah's Halal** ("Fresh Food · Pure Taste"). Customer storefront views (`/`, `/products`, `/products/:slug`, `/cart`, `/about`) present authentic halal food, platters, gyros, wraps, falafel, burgers, wings, salads, sides, and desserts.
- **Architectural & ERP Identifier:** **Shop / FreshFlow**. Used in database schema definitions (`db/schema.ts`), query modules, Docker configurations, administrative ERP modules, and legacy backend services.

---

## 2. Technology Stack

| Layer | Technology | Implementation Details |
| --- | --- | --- |
| **Frontend Framework** | React 19 (`react@^19.0.0`) | Modern React 19 single-page application with concurrent features |
| **Build & Tooling** | Vite 6 (`vite@^6.0.7`) + TypeScript 5.7 | Fast bundling, strict TypeScript type checking, ESBuild packaging |
| **Client Routing** | React Router 7 (`react-router-dom@^7.0.2` & `react-router`) | Declarative client-side routing with role-gated guards |
| **Styling & Icons** | Tailwind CSS 3, Lucide React (`lucide-react@^0.468.0`) | Utility-first responsive styling, mobile-first layouts, accessible icons |
| **UI Components** | Radix UI primitives + custom shadcn-style components | Dialogs, dropdown menus, tabs, inputs, cards, and skeletons |
| **Notifications** | Sonner (`sonner@^1.7.1`) | Toast notification system for cart, auth, and mutations |
| **Data Fetching / RPC**| tRPC 11 (`@trpc/server`, `@trpc/react-query`) + TanStack Query 5 | End-to-end typesafe client-server communication with SuperJSON |
| **Backend Framework** | Hono 4 (`hono@^4.6.14`) | High-performance server framework running on Node.js 22 |
| **Validation** | Zod 3 (`zod@^3.24.1`) | Runtime input and schema validation across client and server |
| **Database & ORM** | Drizzle ORM (`drizzle-orm@^0.38.3`) + PostgreSQL (`pg@^8.13.1`) | Schema-first relational modeling, automated migrations via `api/boot.ts` |
| **Database Resiliency**| Dynamic Connection Proxy (`api/queries/connection.ts`) | Automatic failover to in-memory `mockDbInstance` upon connection drops |
| **Admin Authentication**| Environment-backed JWT + HTTP-only cookies (`shop_admin_access`, `shop_admin_refresh`) | Timing-safe credential validation, local token storage for Bearer auth |
| **Customer Cart** | Hybrid guest / authed cart (`src/lib/guestCart.ts` & `trpc.cart`) | Client-side `localStorage` guest cart; synchronized with database when authenticated |
| **Payment Gateway** | Razorpay Node SDK (`razorpay@^2.9.5`) | Server-side order generation, timing-safe HMAC-SHA256 signature verification |
| **Transactional Email**| Nodemailer (`nodemailer@^6.9.16`) + Resend API | Fail-safe admin order alerts with HTML/plain-text templates |
| **Container & Proxy** | Docker Compose, Nginx (`nginx:stable`), Node 22-slim | Production containerization, SSL termination, static SPA serving |

---

## 3. Repository Structure

```text
.
├── api/                    # Hono/tRPC backend routers, auth, middleware, and query functions
│   ├── auth/               # Password hashing, admin session, mobile OTP, and session cookies
│   │   ├── admin-session.ts # Dedicated admin JWT session creation, validation, and cookies
│   │   ├── mobile.ts       # Indian mobile normalization (+91)
│   │   ├── otp-provider.ts # OTP delivery abstractions
│   │   ├── otp-store.ts    # In-memory OTP code verification store
│   │   ├── password.ts     # Scrypt / bcrypt password hashing utilities
│   │   └── session.ts      # Legacy buyer session cookie utilities
│   ├── lib/                # Server utilities (cookies, env validation, HTTP helpers, Razorpay, Vite)
│   ├── queries/            # Drizzle ORM queries and resilient connection proxy with mock fallback
│   │   ├── connection.ts   # Database connection proxy with automatic mockDbInstance fallback
│   │   ├── mockDb.ts       # In-memory mock database store supporting CRUD operations
│   │   └── *.ts            # Domain query modules (products, orders, inventory, etc.)
│   ├── services/           # Background services (transactional email, order notification)
│   ├── *Router.ts          # Domain-specific tRPC routers (product, order, warehouse, invoice, etc.)
│   ├── auth-router.ts      # Active admin authRouter + preserved legacyAuthRouter
│   ├── context.ts          # Per-request tRPC context with admin token/cookie authentication
│   ├── middleware.ts       # Procedure middleware (publicQuery, authedQuery, ownerQuery, adminQuery)
│   ├── boot.ts             # Server entry point, runs migrations and boots Hono HTTP listener
│   └── router.ts           # App router aggregating all 17 domain routers
├── contracts/              # Shared server/client types, constants, error codes, and role definitions
├── db/                     # Drizzle ORM schema, table relations, seed data, and migration scripts
│   ├── migrations/         # Generated SQL migrations
│   ├── baseline.ts         # Manual database baseline script
│   ├── relations.ts        # Drizzle table relationships
│   ├── schema.ts           # Complete 18-table relational PostgreSQL schema and enums
│   └── seed.ts             # Development seed script
├── docs/                   # Full documentation suite (Architecture, API, Auth, Database, UI)
├── nginx/                  # Production Nginx reverse proxy configuration, SSL, and security headers
├── public/                 # Static assets (branding, icons, food images, manifest)
├── src/                    # React 19 single-page application
│   ├── components/         # Layout shells (AppLayout, CustomerBottomNav) and UI components
│   ├── hooks/              # Custom React hooks (useAuth, useDebounce, etc.)
│   ├── lib/                # Client utilities, tRPC client configuration, guest cart, and i18n
│   ├── pages/              # Route-level view components (LandingPage, Products, Cart, About, AdminLogin, etc.)
│   └── providers/          # React ThemeProvider and tRPC QueryClient provider
├── dist/                   # Production build outputs (frontend SPA assets and bundled server)
├── Dockerfile              # Multi-stage production build (Node 22-slim)
└── docker-compose.yml      # Multi-container orchestration (App, Nginx, PostgreSQL)
```

---

## 4. Frontend Routing Architecture

The frontend routing is centralized in `src/App.tsx`.

```text
                                 [ Application Routing ]
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
 [ Public Storefront ]             [ Authentication ]                  [ Protected Admin ERP ]
   /                                 /admin/login                        /dashboard
   /products                         /login (redirects to /)             /inventory
   /products/:slug                   /register (redirects to /)          /warehouses
   /cart                             /auth (redirects to /)              /customers
   /checkout                                                             /invoices, /invoices/:id
   /orders/:id                                                           /delivery-zones
   /about                                                                /shipping-methods
                                                                         /gst-settings
                                                                         /reports
                                                                         /profile, /settings
                                                                         /categories
                                                                         /products/:slug/edit
```

### Route Tier Details

1. **Public Storefront Routes:** Accessible by any customer without requiring login:
   - `/`: Shah's Halal Storefront (`src/pages/LandingPage.tsx`). Features desktop & tablet header, sticky mobile left category panel (~28% width), search, hero banner, Halal quality badges, products grid with instant quantity / Add to Cart controls, and mobile bottom navigation (`CustomerBottomNav`).
   - `/products`: Product catalog & category filtering (`src/pages/Products.tsx`), featuring category selection, search, product cards, and bottom navigation.
   - `/products/:slug`: Product detail page (`src/pages/ProductDetail.tsx`), featuring high-resolution food images, Halal badges, nutrition/specs, price, quantity controls, Add to Cart feedback, and bottom navigation.
   - `/cart`: Shopping cart (`src/pages/Cart.tsx`), supporting both guest cart (`useGuestCart` backed by `localStorage`) and authenticated cart, item notes, quantity adjusters, price breakdown, and bottom navigation.
   - `/checkout`: Multi-step checkout (`src/pages/Checkout.tsx`) with shipping address capture, zone fee calculation, GST calculation, and Razorpay / COD payment.
   - `/orders/:id`: Public order tracking / confirmation view (`src/pages/OrderDetail.tsx`).
   - `/about`: Customer About page (`src/pages/About.tsx`), featuring the Shah's Halal brand story, 100% Halal certification badge, 4 core quality pillars, interactive 10-category showcase, signature specialties, halal commitment banner, and active 4-item bottom navigation. **Crucial:** The redundant top navigation bar was removed.

2. **Authentication Routes:**
   - `/admin/login`: Dedicated administrator login portal (`src/pages/AdminLogin.tsx`). Accepts administrator email and password, calls `trpc.auth.loginAdmin`, stores token in `localStorage`, and sets HTTP-only session cookies.
   - `/login`, `/register`, `/auth`: Legacy customer login routes. Redirect directly to `/` because the storefront operates in guest mode.

3. **Protected Admin ERP Routes (`OwnerRoute` / `ProtectedRoute`):**
   Restricted to users with `role === "admin"` or matching `ownerEmail`:
   - `/dashboard`: Operational analytics dashboard (`src/pages/Dashboard.tsx`).
   - `/inventory`: Real-time stock levels, batch tracking, and adjustment logs (`src/pages/Inventory.tsx`).
   - `/warehouses`: Multi-warehouse facility management and stock movements (`src/pages/Warehouse.tsx`).
   - `/customers`: B2B customer directory and credit terms (`src/pages/Customers.tsx`).
   - `/invoices`, `/invoices/:id`: GST tax invoices, detailed breakdowns, and print views (`src/pages/Invoices.tsx`).
   - `/delivery-zones`: State-level delivery zones and fee rules (`src/pages/DeliveryZones.tsx`).
   - `/shipping-methods`: Shipping method rules and free shipping tiers (`src/pages/ShippingMethods.tsx`).
   - `/gst-settings`: Category-mapped GST rates and HSN codes (`src/pages/GstSettings.tsx`).
   - `/reports`: Financial, sales, order, and inventory performance reports (`src/pages/Reports.tsx`).
   - `/profile`, `/settings`: User settings, avatars, and password change (`src/pages/Profile.tsx`, `src/pages/Settings.tsx`).
   - `/categories`: Product category taxonomy management (`src/pages/Categories.tsx`).
   - `/products/:slug/edit`: Product catalog maintenance, SKU adjustments, and visibility (`src/pages/EditProduct.tsx`).

---

## 5. UI Layouts & Navigation Wireframes

### Customer Bottom Navigation Bar

The active mobile customer navigation is rendered via `CustomerBottomNav` (`src/components/CustomerBottomNav.tsx`). It is fixed to the bottom of the screen on all customer pages:

```text
┌─────────────────────────────────────────────────────────────┐
│    🏠               🍽️              🛒               ℹ️      │
│   Home          Categories         Cart            About    │
└─────────────────────────────────────────────────────────────┘
```

1. **Home (`/`):** Links to storefront landing page.
2. **Categories (`/products`):** Links to full catalog and category view.
3. **Cart (`/cart`):** Links to shopping cart with dynamic item count badge.
4. **About (`/about`):** Links to Shah's Halal About page.

---

### Landing Page Wireframe (`/`)

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Shah's Halal  [Search halal food...]   [Cart (N)]  [Admin Login]          │
├─────────────────┬────────────────────────────────────────────────────────────────┤
│ MOBILE SIDEBAR  │ HERO BANNER                                                    │
│ (~28% width)    │ "Authentic Halal Food · Fresh Gyros, Platters & Falafel"      │
│                 │ [Order Fresh Halal]                                            │
│ 🍽️ All          ├────────────────────────────────────────────────────────────────┤
│ 🍛 Platters     │ HALAL QUALITY BADGES                                           │
│ 🌯 Gyros        │ [100% Halal] [Farm Fresh] [Fast Delivery] [Pure Taste]          │
│ 🍔 Burgers      ├────────────────────────────────────────────────────────────────┤
│ 🍗 Wings        │ PRODUCTS GRID                                                  │
│ 🍚 Rice Bowls   │ ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│ 🥗 Salads       │ │ [Halal]    │  │ [Halal]    │  │ [Halal]    │  │ [Halal]    │ │
│ 🍟 Sides        │ │ Chicken Pl.│  │ Lamb Gyro  │  │ Falafel Pl.│  │ Wings 6pc  │ │
│ 🥤 Drinks       │ │ $11.99     │  │ $9.99      │  │ $10.49     │  │ $8.99      │ │
│ 🍰 Desserts     │ │ [Add Cart] │  │ [Add Cart] │  │ [Add Cart] │  │ [Add Cart] │ │
│ 🍱 Catering     │ └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
├─────────────────┴────────────────────────────────────────────────────────────────┤
│ MOBILE BOTTOM NAV: [Home]  [Categories]  [Cart]  [About]                         │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

### Customer About Page Wireframe (`/about`)

*Note: The redundant top header (Logo, title, icons) was removed to rely purely on the bottom navigation.*

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│ (No redundant top action bar)                                                    │
│                                                                                  │
│ HERO SECTION                                                                     │
│               [☪ 100% CERTIFIED HALAL ✨]                                        │
│                        [Shah's Halal Logo]                                       │
│                           SHAH'S HALAL                                           │
│                     Fresh Food · Pure Taste                                      │
│         "Serving authentic halal street food, slow-cooked meats,                 │
│         crispy golden falafel, and signature white & hot sauces."               │
│                  [Explore Menu]    [Order Fresh Halal]                           │
├──────────────────────────────────────────────────────────────────────────────────┤
│ HALAL PROMISE & 4 CORE PILLARS                                                   │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐     │
│ │ 100% Halal     │ │ Fresh Daily    │ │ Authentic Spice│ │ Community First│     │
│ │ Certified meat │ │ Crisp produce  │ │ Heritage recipes││ Welcoming all  │     │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘     │
├──────────────────────────────────────────────────────────────────────────────────┤
│ FOOD CATEGORY SHOWCASE (Interactive Grid of 10 Categories)                       │
│ [Platters 🍛] [Gyros 🌯] [Burgers 🍔] [Wings 🍗] [Rice Bowls 🍚]                │
│ [Salads 🥗]   [Sides 🍟] [Drinks 🥤]  [Desserts 🍰] [Catering 🍱]               │
├──────────────────────────────────────────────────────────────────────────────────┤
│ SIGNATURE SPECIALTIES                                                            │
│ • Over-Rice Platters (Chicken, Lamb, Combo, Falafel over spiced basmati)         │
│ • Warm Gyros & Pita Wraps (Wrapped fresh with crisp lettuce & tomato)            │
│ • Crispy Halal Wings (Buffalo, BBQ, Sweet Chili)                                 │
│ • Handcrafted Halal Burgers & Sandwiches                                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│ HALAL CERTIFICATION & FOOD INTEGRITY COMMITMENT                                  │
│ Strict segregation, trusted certified distributors, daily quality control.       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ BOTTOM CTA: "Hungry for Authentic Halal? Explore Our Full Menu Today"            │
│ [Order Now]                                                                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│ MOBILE BOTTOM NAV: [Home]  [Categories]  [Cart]  [About (Active)]                │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Backend & tRPC Architecture

The backend runs on **Hono 4** and mounts the tRPC router at `/trpc`.

### Complete tRPC Router Surface (17 Routers)

Registered in `api/router.ts`:

| Router | File | Key Procedures | Access Tier |
| --- | --- | --- | --- |
| `ping` | `api/router.ts` | `ping` | Public |
| `auth` | `api/auth-router.ts` | `me`, `loginAdmin`, `refresh`, `logout` | Public (Login) / Authed |
| `product` | `api/productRouter.ts` | `list`, `bySlug`, `byId`, `featured`, `freshDeals`, `count`, `stats`, `create`, `update`, `updateMarketplace`, `marketplaceById`, `delete` | Public (Browse) / Owner (CRUD) |
| `category` | `api/categoryRouter.ts` | `list`, `bySlug`, `byId`, `create`, `update`, `delete` | Public (Browse) / Owner (CRUD) |
| `cart` | `api/cartRouter.ts` | `list`, `add`, `update`, `remove`, `clear` | Authed |
| `order` | `api/orderRouter.ts` | `list`, `quote`, `detail`, `createRazorpayOrder`, `create`, `status`, `deliveryEstimate`, `cancel`, `stats`, `recent` | Authed (Order) / Owner (Manage) |
| `inventory` | `api/inventoryRouter.ts` | `list`, `stats`, `reorderAlerts`, `adjust` | Owner |
| `company` | `api/companyRouter.ts` | `list`, `byId`, `create`, `update` | Owner / Authed |
| `warehouse` | `api/warehouseRouter.ts` | `list`, `byId`, `movements`, `receive`, `dispatch` | Owner |
| `invoice` | `api/invoiceRouter.ts` | `list`, `byId`, `generate`, `print` | Owner / Authed |
| `report` | `api/reportRouter.ts` | `summary`, `sales`, `inventory`, `orders` | Owner |
| `profile` | `api/profileRouter.ts` | `get`, `update` | Authed |
| `customer` | `api/customerRouter.ts` | `list`, `byId`, `create`, `update` | Owner |
| `deliveryZone` | `api/deliveryZoneRouter.ts`| `list`, `create`, `update` | Owner |
| `gst` | `api/gstRouter.ts` | `list`, `rules`, `create`, `update` | Owner |
| `shipping` | `api/shippingRouter.ts` | `list`, `create`, `update` | Owner |
| `address` | `api/addressRouter.ts` | `list`, `create`, `delete` | Authed |

---

## 7. Database Architecture & Schema

## 9. Security & Access Control

- **Admin Session Credentials:** Admin authentication requires valid `ADMIN_EMAIL` and `ADMIN_PASSWORD` validated using `crypto.timingSafeEqual`. Successful login issues JWT access (15m) and refresh (30d) tokens set as HTTP-only cookies (`shop_admin_access`, `shop_admin_refresh`), while returning the access token for `Authorization: Bearer` client requests.
- **Timing-Safe Signatures:** Razorpay payment signature verification uses `crypto.timingSafeEqual` over HMAC-SHA256 digests to prevent timing attacks.
- **Idempotent Order Creation:** Order checkout verifies whether a Razorpay order ID has already been persisted to prevent duplicate order placement.
- **Security Headers:** In production, Nginx enforces strict HTTP security headers including `X-Frame-Options SAMEORIGIN`, `X-Content-Type-Options nosniff`, `X-XSS-Protection "1; mode=block"`, and Content Security Policy (CSP).

---

## 10. Container Deployment & Production Infrastructure

Production deployment is orchestrated via Docker Compose (`docker-compose.yml`):

- **Nginx Container (`nginx:stable`):**
  - Serves as the primary reverse proxy listening on ports `80` (HTTP) and `443` (HTTPS).
  - Serves compiled static SPA frontend files directly from `/usr/share/nginx/html` with gzip compression and caching headers.
  - Proxies `/api/*`, `/trpc/*`, and WebSocket upgrades to the internal application container on port `3000`.
  - Handles ACME challenge validation for Let's Encrypt certificates.
- **App Container (`node:22-slim`):**
  - Executes the compiled backend server (`dist/server.cjs` or `dist/boot.js`).
  - Automatically runs Drizzle schema migrations upon startup before listening on port `3000`.
  - Exposes health checks at `/health`.
- **Database Container (`postgres:15-alpine`):**
  - Runs PostgreSQL on internal port `5432` with health checks via `pg_isready`.
  - Persists relational data using named volume `pgdata`.
- **Network Isolation:** All containers communicate across the isolated bridge network `freshflow-network`.

