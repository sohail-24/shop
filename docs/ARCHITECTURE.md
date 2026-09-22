# Architecture

This document defines the technical architecture of the **Tex’s Chicken & Burgers** application based strictly on verified repository implementation.

---

## 1. Project Identity & Naming Conventions

The application maintains a clearly defined separation between its active production brand identity and its architectural origins:

### 1.1 Active Production Brand Identity
- **Primary Brand Name:** **Tex’s Chicken & Burgers** (frequently styled as **Tex’s**).
- **Brand Tagline & Mottos:**
  - *"Worth Every Bite"* (Primary brand tagline, prominent across header, landing hero, `/info`, and `/about`).
  - *"Good Food Brings Good People"* (Brand culinary motto and quote).
  - *"100% Halal Certified"* / *"Fresh Food • Always Halal"*.
- **Customer Experience:** Fast-casual comfort food dining specializing in crispy southern-style fried chicken, halal smash burgers, fiery wings & tenders, fresh comfort sides, and golden honey biscuits across 55+ East Coast locations.
- **Storefront Views:** Customer views (`/`, `/products`, `/products/:slug`, `/cart`, `/info`, `/checkout`, `/orders/:id`, `/about`) strictly present Tex’s Chicken & Burgers branding, food photography, halal verification badges, and customer rewards.

### 1.2 Architectural & Historical Identity Separation
To ensure zero confusion for developers and AI assistants, the repository's identity evolution is categorized as follows:
- **Active Production Identity:** **Tex’s Chicken & Burgers** (`texs-chicken-and-burgers`, supplier ID 1). This is the sole identity of the live customer application, brand assets (`/branding/logo.png`), active side catalog, customer checkout flow, and About page experience.
- **Foundational ERP Architecture (FreshFlow):** Origin platform identifier used in backend service wrappers (`[FreshFlow]` logger tags in `api/queries/connection.ts`), database seed script naming (`db/seed.ts`), Docker network naming (`freshflow-network`), and legacy administrative schema defaults.
- **Historical Testing & Prototype Catalogs:**
  - **AM Fruits:** Initial B2B produce and wholesale fruit testing catalog (`Tropical Direct`, `Citrus Kings`, `Berry Fresh Farms`), preserved in `api/queries/mockDb.ts` and legacy database seed records.
  - **Shah's Halal:** Intermediate street food cart testing catalog (`scripts/seed-shahs-halal.ts`), used during fast-food menu prototyping.

---

## 2. Technology Stack

| Layer | Technology | Implementation Details |
| --- | --- | --- |
| **Frontend Framework** | React 19 (`react@^19.0.0`, `react-dom@^19.0.0`) | Modern React 19 single-page application with concurrent features |
| **Build & Tooling** | Vite 6 (`vite@^6.0.7`) + TypeScript 5.7 | High-speed ESM bundling, strict TypeScript compilation, ESBuild production server bundling |
| **Client Routing** | React Router 7 (`react-router@^7.0.2`, `react-router-dom@^7.0.2`) | Declarative client routing with path-level code splitting and route guards |
| **Styling & Design** | Tailwind CSS 3, Lucide React (`lucide-react@^0.468.0`) | Custom brand green/amber palette, responsive utilities, accessible vector icons |
| **Animation Engine** | Motion (`motion@^12.4.7` / `framer-motion`) | Fluid page enter transitions, interactive reward tier selector, and canvas scroll drivers |
| **UI Components** | Radix UI primitives + custom shadcn-style components | Modals, dialogs, dropdowns, inputs, skeletons, and cards |
| **Notifications** | Sonner (`sonner@^1.7.1`) | Responsive toast feedback for cart mutations, validation errors, and order events |
| **Data Fetching / RPC**| tRPC 11 (`@trpc/server`, `@trpc/react-query`) + TanStack Query 5 | End-to-end typesafe client-server communication with SuperJSON transformer |
| **Backend Framework** | Hono 4 (`hono@^4.6.14`) | High-performance modern web framework executing on Node.js 22 |
| **Validation** | Zod 3 (`zod@^3.24.1`) | Runtime input and data-layer validation across frontend and backend boundaries |
| **Database & ORM** | Drizzle ORM (`drizzle-orm@^0.38.3`) + PostgreSQL (`pg@^8.13.1`) | Schema-first relational database with automated startup migration execution |
| **Database Resiliency**| Dynamic Connection Proxy (`api/queries/connection.ts`) | Automatic transparent failover to in-memory `mockDbInstance` upon connection timeout or network loss |
| **Admin Authentication**| Environment-backed JWT + HTTP-only cookies (`shop_admin_access`, `shop_admin_refresh`) | Timing-safe credential validation, isolated at `/admin/login` |
| **Customer Cart** | Hybrid guest / authed cart (`src/lib/guestCart.ts` & `trpc.cart`) | Client-side `localStorage` guest cart with automatic database sync for authenticated sessions |
| **Checkout State** | Preserved Customer Session (`src/lib/checkoutState.ts`) | Event-driven customer phone storage in `sessionStorage` and `localStorage` bridging `/info` to `/checkout` |
| **Payment Gateway** | Razorpay Node SDK (`razorpay@^2.9.5`) + COD | Server-side order generation, timing-safe HMAC-SHA256 signature verification |
| **Container & Proxy** | Docker Compose, Nginx (`nginx:stable`), Node 22-slim | Production containerization, reverse proxying, SSL termination, static SPA serving |

---

## 3. Repository Structure

```text
.
├── api/                    # Hono/tRPC backend routers, auth, middleware, and query functions
│   ├── auth/               # Password hashing, admin session, mobile OTP, and session cookies
│   │   ├── admin-session.ts # Dedicated admin JWT session creation, validation, and cookies
│   │   ├── mobile.ts       # Mobile normalization (+91 / Indian standard)
│   │   ├── otp-provider.ts # OTP delivery abstractions
│   │   ├── otp-store.ts    # In-memory OTP code verification store
│   │   ├── password.ts     # Scrypt / bcrypt password hashing utilities
│   │   └── session.ts      # Legacy buyer session cookie utilities
│   ├── lib/                # Server utilities (cookies, env validation, HTTP helpers, Razorpay, Vite)
│   ├── queries/            # Drizzle ORM queries and resilient connection proxy with mock fallback
│   │   ├── connection.ts   # Database connection proxy with automatic mockDbInstance fallback
│   │   ├── mockDb.ts       # In-memory mock database store supporting full CRUD operations
│   │   └── *.ts            # Domain query modules (products, orders, inventory, etc.)
│   ├── services/           # Background services (transactional email, order notification)
│   ├── *Router.ts          # Domain-specific tRPC routers (product, order, warehouse, invoice, etc.)
│   ├── auth-router.ts      # Active admin authRouter + preserved legacy customer auth
│   ├── context.ts          # Per-request tRPC context with admin token/cookie extraction
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
├── public/                 # Static assets (branding/logo.png, icons, food images, manifest)
├── scripts/                # Utility and database migration/seed scripts
├── src/                    # React 19 single-page application
│   ├── components/         # Layout shells (AppLayout, CustomerBottomNav, RealBurgerScrollHero) & UI
│   ├── hooks/              # Custom React hooks (useAuth, useDebounce, etc.)
│   ├── lib/                # Client utilities (guestCart, checkoutState, image resolver, i18n)
│   ├── pages/              # Route-level view components (LandingPage, Products, Cart, Info, Checkout, About, AdminLogin)
│   └── providers/          # React ThemeProvider and tRPC QueryClient provider
├── dist/                   # Production build outputs (frontend SPA assets and bundled server)
├── Dockerfile              # Multi-stage production build (Node 22-slim)
└── docker-compose.yml      # Multi-container orchestration (App, Nginx, PostgreSQL)
```

---

## 4. Frontend Routing & Customer Flow Architecture

Frontend routing is centralized in `src/App.tsx`.

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
    /info                                                                 /invoices, /invoices/:id
    /checkout                                                             /delivery-zones
    /orders/:id                                                           /shipping-methods
    /about                                                                /gst-settings
                                                                          /reports
                                                                          /profile, /settings
                                                                          /categories
                                                                          /products/:slug/edit
```

### 4.1 Customer Guest Checkout Progression
The storefront operates on a zero-barrier **Guest Checkout Flow**. Customers can browse, configure food options, add items to cart, input contact details, and complete payment without requiring prior account creation or administrative sign-in:

```text
[ Home (/) ]
     │
     ▼
[ Browse Catalog (/products) ]
     │
     ▼
[ Product Detail (/products/:slug) ]
     │
     ▼
[ Shopping Cart (/cart) ]
     │
     ▼
[ Customer Info (/info) ]  ◄── Captures 10-digit phone (+91), zero-trust server validation
     │
     ▼
[ Checkout (/checkout) ]   ◄── Prepopulated phone from checkoutState, address, payment
     │
     ▼
[ Order Confirmation (/orders/:id) ] ◄── Public order tracking and item summary
```

#### Step Breakdown:
1. **Home (`/` - `src/pages/LandingPage.tsx`):**
   - Branded desktop header with Tex’s Chicken & Burgers identity and tagline *"Worth Every Bite"*.
   - Left vertical category navigation sidebar on desktop with quick emoji badges.
   - Halal certified trust badges, search input, and products grid with option selectors and direct cart triggers.
   - Mobile persistent navigation via `CustomerBottomNav`.
2. **Products Catalog (`/products` - `src/pages/Products.tsx`):**
   - Full categorized menu items, category filters, real-time search, and product cards showing unit prices and options.
3. **Product Detail (`/products/:slug` - `src/pages/ProductDetail.tsx`):**
   - High-resolution food imagery, option selection (e.g., Small vs. Large, meal options), quantity selectors, and ingredients breakdown.
4. **Shopping Cart (`/cart` - `src/pages/Cart.tsx`):**
   - Displays items from `useGuestCart` (`localStorage`) or authed cart, with real-time quantity adjustments and item removal.
   - **Checkout Action:** Explicit primary button links directly to `/info` (`<Link to="/info">Checkout</Link>`).
5. **Customer Info (`/info` - `src/pages/Info.tsx`):**
   - **Purpose:** Seamlessly captures customer contact details before final payment while keeping active cart items visible.
   - **Phone Validation:** Accepts 10-digit mobile number, formatted cleanly. Runs server-side verification through `trpc.order.validatePhone`.
   - **State Persistence:** Normalizes number with `+91` prefix and persists into `sessionStorage` and `localStorage` using `setCheckoutPhone()`.
   - **Navigation:** Automatically navigates to `/checkout` upon successful validation.
6. **Checkout (`/checkout` - `src/pages/Checkout.tsx`):**
   - Prepopulates customer phone from `getCheckoutPhone()`.
   - Captures delivery address, calculates state/zone delivery fees and GST tax.
   - Supports Cash on Delivery (COD) and Razorpay digital payments.
   - Upon successful placement, clears cart, clears preserved phone session via `clearCheckoutPhone()`, and navigates to `/orders/:id`.
7. **Order Confirmation (`/orders/:id` - `src/pages/OrderDetail.tsx`):**
   - Publicly accessible tracking page displaying placed order details, items, delivery estimate, and order status.
   - "Back to Home" button returns the customer to the storefront.

### 4.2 Authentication Boundary
The repository enforces a strict, impenetrable boundary between public customer ordering and administrative management:
- **Customer Experience:** 100% guest-friendly. Customers are **never** required to log in. Legacy customer auth routes (`/login`, `/register`, `/auth`) automatically redirect to `/`.
- **Administrative Portal (`/admin/login` - `src/pages/AdminLogin.tsx`):**
  - Sole entrance for store managers and operations staff.
  - Requires valid administrator credentials verified server-side against `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
  - Sets HTTP-only cookies (`shop_admin_access`, `shop_admin_refresh`) and stores JWT in `localStorage` for tRPC `Authorization: Bearer` headers.
  - Grants access to protected ERP management routes (`/dashboard`, `/inventory`, `/warehouses`, etc.).

---

## 5. UI Layouts & Navigation Wireframes

### 5.1 Customer Bottom Navigation Bar
The active mobile customer navigation is rendered via `CustomerBottomNav` (`src/components/CustomerBottomNav.tsx`). It is fixed to the viewport bottom across all customer-facing routes:

```text
┌─────────────────────────────────────────────────────────────┐
│    🏠               🍽️              🛒               ℹ️      │
│   Home          Categories         Cart            About    │
└─────────────────────────────────────────────────────────────┘
```

1. **Home (`/`):** Links to storefront landing page.
2. **Categories (`/products`):** Links to categorized food menu.
3. **Cart (`/cart`):** Links to shopping cart with reactive badge showing total item count.
4. **About (`/about`):** Links to Tex’s Chicken & Burgers brand story and animation page.

---

### 5.2 Customer About Page (`/about` - `src/pages/About.tsx`)
The About page provides an interactive brand experience celebrating the heritage and standards of Tex’s Chicken & Burgers:

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│ (No redundant top action bar; mobile bottom nav active)                          │
│                                                                                  │
│ HERO SECTION                                                                     │
│               [☪ 100% CERTIFIED HALAL ✨]                                        │
│                 [Tex’s Chicken & Burgers Logo]                                   │
│                    TEX’S CHICKEN & BURGERS                                       │
│                        Worth Every Bite                                          │
│        "A single, unmistakable standard for fresh halal comfort food."          │
│                  [Explore Menu]    [Order Online]                                │
├──────────────────────────────────────────────────────────────────────────────────┤
│ INTERACTIVE REAL BURGER SCROLL HERO                                              │
│ [Canvas / DOM Layered Burger Assembly reacting to user scroll progress]         │
│ • Brioche Bun Top (Sesame glazed)                                                │
│ • Fresh Chopped Red Onions & Crinkle Cut Pickles                                 │
│ • Signature House Sauce Drizzle                                                  │
│ • 100% Halal Beef Smashed Patties with Melted Cheese                             │
│ • Vine-Ripened Tomato & Crisp Green Leaf Lettuce                                 │
│ • Toasted Bottom Brioche Bun                                                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 4 QUALITY PILLARS (Sourcing & Purity)                                            │
│ ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐ ┌────────────┐ │
│ │ 100% Halal Cert.  │ │ Never Frozen      │ │ Fresh Produce     │ │Zero Fillers│ │
│ │ Humane & pure     │ │ Fresh daily beef  │ │ Crisp greens daily│ │Pure beef   │ │
│ └───────────────────┘ └───────────────────┘ └───────────────────┘ └────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────┤
│ HISTORIC MILESTONE & 55+ LOCATIONS GROWTH (Then → Now)                           │
│ Phase 1: 1 NYC Storefront  ──►  Phase 4: 55+ East Coast Locations & Counting    │
├──────────────────────────────────────────────────────────────────────────────────┤
│ WHY THE NAME "TEX’S"?                                                            │
│ The story connecting southern crispy breading craft to NYC's halal food culture. │
├──────────────────────────────────────────────────────────────────────────────────┤
│ MADE FOR THE MENU (Lineup Bento Grid)                                            │
│ • Signature Fried Chicken (2PC, 3PC, 4PC bone-in meals)                          │
│ • Tex’s Smash Burgers (Classic, Deluxe & Hell Smash)                             │
│ • Crispy Chicken Sandwiches & Fiery Wings                                        │
│ • Comfort Sides (Fries, Mac & Cheese, Mashed Potato, Corn, Coleslaw)            │
│ • Golden Honey Butter Biscuits                                                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TEX’S REWARDS (Earn Spurs Loyalty Program)                                       │
│ Bronze (0-999) ──► Silver (1000-2499) ──► Gold VIP (2500+)                       │
│ Official Redemption Ladder: 150 Spurs (Biscuit) to 750 Spurs (Tenders)          │
├──────────────────────────────────────────────────────────────────────────────────┤
│ FINAL BRAND STATEMENT & CINEMATIC CTA                                            │
│ "TEX’S CHICKEN & BURGERS • Worth Every Bite • Good Food Brings Good People"      │
│ [Explore Menu]  [Order Online]                                                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ MOBILE BOTTOM NAV: [Home]  [Categories]  [Cart]  [About (Active)]                │
└──────────────────────────────────────────────────────────────────────────────────┘
```

#### The Burger Animation (`RealBurgerScrollHero`):
Located at `src/components/RealBurgerScrollHero.tsx`, this component renders an interactive, physics-based, scroll-driven visual representation of Tex’s signature halal cheeseburger:
- Reacts smoothly to page scroll coordinates using standard viewport ratios.
- Separates individual ingredients (golden toasted brioche bun, fresh crinkle pickles, crisp onions, melting cheese, seared smash patties, farm-fresh tomatoes, and lettuce).
- Assembles seamlessly into a complete burger as the user scrolls, providing a distinctive culinary presentation.

---

## 6. Product & Inventory Architecture

### 6.1 Relational Schema Core Entities
The database schema (`db/schema.ts`) links products, categories, companies, and inventory records through relational constraints:

```text
[ companies (suppliers) ]
         │ (1:N)
         ▼
    [ products ] ◄─────── (N:1) ────── [ categories ]
         │ (1:1)
         ▼
   [ inventory ] ──────── (N:1) ────── [ warehouses ]
```

1. **`companies`**: Represents business entities. Active supplier ID `1` represents **Tex’s Chicken & Burgers** (`texs-chicken-and-burgers`, warehouse: `Tex’s Kitchen`).
2. **`categories`**: Taxonomy records (`id`, `name`, `slug`, `icon`, `color`, `isActive`).
3. **`products`**: Menu items with pricing, options, media, status (`draft`, `active`, `archived`), and marketplace visibility toggles.
4. **`inventory`**: Physical inventory tracking per product per supplier (`quantityOnHand`, `quantityReserved`, `quantityAvailable`, `reorderLevel`, `reorderQuantity`, `warehouseLocation`, `status`, `isActive`).

### 6.2 Verified Active Live Inventory
Inspection of the active PostgreSQL database confirms the following verified active catalog:

| ID | Product Name | Slug | Category | Unit Price | Active Options | SKU | Image URI | Stock Avail. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **61** | **French Fries** | `french-fries-tex-french-fries-4ebo` | Sides (13) | $3.25 | `SM (300 CAL) - $3.25`<br>`LG (500 CAL) - $4.25` | `TEX-FRENCH-FRIES-4EBO` | `/api/uploads/product-7dfe9590-14c5-438a-b3a3-cc7b1609fe19.png` | 100 (In Stock) |
| **65** | **Mac N'Cheese** | `mac-n-cheese-tex-mac-n-cheese-npdc` | Sides (13) | $3.25 | Standard 1 Order | `TEX-MAC-N-CHEESE-NPDC` | `/api/uploads/product-3509f65f-efcc-4cca-9a75-e6466f1d1ffd.png` | 100 (In Stock) |
| **66** | **Mashed Potato** | `mashed-potato-tex-mashed-potato-vl8` | Sides (13) | $3.25 | Standard 1 Order | `TEX-MASHED-POTATO--VL8` | `/api/uploads/product-ad977bc0-2165-445e-8b0f-cb3d4f29ce22.png` | 100 (In Stock) |
| **67** | **Fire Roasted Corn** | `fire-roasted-corn-tex-fire-roasted-corn-hasg` | Sides (13) | $3.25 | Standard 1 Order | `TEX-FIRE-ROASTED-CORN-HASG` | `/api/uploads/product-5dbaf069-2c99-40a3-b49a-05fec7881027.png` | 100 (In Stock) |
| **68** | **Coleslaw** | `coleslaw-tex-coleslaw-iqqp` | Sides (13) | $3.25 | Standard 1 Order | `TEX-COLESLAW-IQQP` | `/api/uploads/product-0e4372e4-cd21-4f34-99f6-c92cf703af1c.png` | 100 (In Stock) |

#### Verified Inventory State:
- All 5 active products link to Supplier ID `1` (**Tex’s Chicken & Burgers**).
- All 5 active products belong to Category ID `13` (**Sides**, `slug: "sides"`).
- All 5 items have verified active inventory records (IDs 108, 112, 113, 114, 115) with `quantityOnHand = 100`, `quantityReserved = 0`, `quantityAvailable = 100`, `reorderLevel = 5`, `reorderQuantity = 20`, `warehouseLocation = "Tex’s Kitchen"`, and `status = "in_stock"`.

### 6.3 Media & Image Serving Architecture
- **Uploaded Assets:** Product photographs are stored in the server filesystem under `uploads/` and exposed via the static HTTP route `/api/uploads/*`.
- **Branding Assets:** Primary logos, vector graphics, and manifest icons are served from `/public/branding/` (e.g., `/branding/logo.png`).
- **Client Resolution:** Frontend views invoke `resolveProductImageUrl()` (`src/lib/image.ts`) to validate relative URIs and gracefully handle missing media.

---

## 7. Backend & tRPC API Architecture

The backend operates on **Hono 4** mounted with tRPC at `/trpc`.

### Complete tRPC Router Surface (17 Routers)
Registered in `api/router.ts`:

| Router | File | Key Procedures | Access Tier |
| --- | --- | --- | --- |
| `ping` | `api/router.ts` | `ping` | Public |
| `auth` | `api/auth-router.ts` | `me`, `loginAdmin`, `refresh`, `logout` | Public (Login) / Authed |
| `product` | `api/productRouter.ts` | `list`, `bySlug`, `byId`, `featured`, `freshDeals`, `count`, `stats`, `create`, `update`, `updateMarketplace`, `marketplaceById`, `delete` | Public (Browse) / Owner (CRUD) |
| `category` | `api/categoryRouter.ts` | `list`, `bySlug`, `byId`, `create`, `update`, `delete` | Public (Browse) / Owner (CRUD) |
| `cart` | `api/cartRouter.ts` | `list`, `add`, `update`, `remove`, `clear` | Authed |
| `order` | `api/orderRouter.ts` | `list`, `quote`, `detail`, `createRazorpayOrder`, `create`, `status`, `deliveryEstimate`, `cancel`, `stats`, `recent`, `validatePhone` | Public / Authed (Order) / Owner (Manage) |
| `inventory` | `api/inventoryRouter.ts` | `list`, `byId`, `byProduct`, `bySupplier`, `stats`, `reorderAlerts`, `adjust` | Owner |
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

## 8. Security & Access Control

- **Admin Session Credentials:** Admin authentication requires valid `ADMIN_EMAIL` and `ADMIN_PASSWORD` validated using `crypto.timingSafeEqual`. Successful login issues JWT access (15m) and refresh (30d) tokens set as HTTP-only cookies (`shop_admin_access`, `shop_admin_refresh`), while returning the access token for `Authorization: Bearer` client requests.
- **Zero-Trust Phone Validation:** The `/info` checkout step requires explicit mobile validation executed on the backend via `trpc.order.validatePhone`, confirming format before order submission.
- **Timing-Safe Signatures:** Razorpay payment signature verification uses `crypto.timingSafeEqual` over HMAC-SHA256 digests to prevent timing attacks.
- **Idempotent Order Creation:** Order checkout verifies whether a Razorpay order ID has already been persisted to prevent duplicate order placement.
- **Security Headers:** In production, Nginx enforces strict HTTP security headers including `X-Frame-Options SAMEORIGIN`, `X-Content-Type-Options nosniff`, `X-XSS-Protection "1; mode=block"`, and Content Security Policy (CSP).

---

## 9. Container Deployment & Production Infrastructure

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


