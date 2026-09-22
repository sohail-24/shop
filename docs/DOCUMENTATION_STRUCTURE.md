# Tex’s Chicken & Burgers Documentation Structure

**Version:** 6.0

**Status:** Active

**Last Updated:** 2026-09-21

---

# Purpose

This document defines the official documentation standard for the **Tex’s Chicken & Burgers** project (built upon the foundational commerce and administrative ERP architecture of FreshFlow).

All project documentation must adhere to this structure.

Business modules own domain data rules and workflows. UI pages define screen layouts, navigation, and user interaction states. Business logic must never be duplicated across documents. The repository codebase is the definitive single source of truth.

---

# Documentation Philosophy & Identity Separation

The project strictly follows a **Code-Truth Documentation** methodology:
- **Code is Reality:** Documentation must accurately describe what is actually implemented in the codebase, without speculation, aspirational claims, or obsolete copy.
- **Identity Clarity:**
  - **Active Production Brand:** **Tex’s Chicken & Burgers** ("Worth Every Bite"). Powers the active customer storefront, menu catalog, burger scroll animation, brand assets (`/branding/logo.png`), and customer checkout journey.
  - **Foundational ERP Architecture (FreshFlow):** Origin engine providing backend tRPC services, relational database baseline models (`db/schema.ts`), Docker configurations, and administrative warehouse tools.
  - **Historical Testing & Prototype Catalogs:** **AM Fruits** (wholesale fruit catalog) and **Shah's Halal** (halal street food cart testing catalog).
- **Truthful Status:** System capabilities are categorized by verified implementation state: `ACTIVE`, `PRESERVED BUT DEACTIVATED`, `HIDDEN`, `UNUSED / ORPHANED`, or `REMOVED`.

---

# Project Documentation Structure

```text
docs/
├── ARCHITECTURE.md                 # Full-stack system architecture, technology stack, routing, and live inventory
├── API.md                          # Global tRPC API standards, registered routers, and protocols
├── AUTHENTICATION.md               # Admin authentication boundary (/admin/login) and customer guest session management
├── ROADMAP.md                      # Real project progress, completed milestones, and planned work
├── DEVELOPMENT_LOG.md              # Historical development log and audit records
├── DOCUMENTATION_STRUCTURE.md      # This document: documentation map and structural guidelines
├── PRODUCTION_READINESS.md         # Factual production readiness assessment
│
├── database/
│   ├── MIGRATIONS.md               # Drizzle migration flow, startup execution, and mock fallback
│   └── SCHEMA.md                   # Full 18-table relational PostgreSQL schema and enum inventory
│
└── UI/
    ├── categories/                 # Category management module documentation
    ├── company/                    # Supplier/Buyer company profile module documentation
    ├── inventory/                  # Multi-warehouse inventory and batch tracking documentation
    ├── invoices/                   # GST-compliant tax invoices and PDF generation documentation
    ├── orders/                     # Order lifecycle, fulfillment state transitions, and Razorpay
    ├── products/                   # Catalog item management, pricing, SKU, and visibility
    ├── reports/                    # Sales, inventory valuation, and performance analytics
    ├── user-profile/               # User preferences, themes, and profile management
    ├── warehouse/                  # Physical warehouse facilities and stock movements log
    │
    └── pages/                      # Specific view/page wireframes and user interaction flows
        ├── home-marketplace/      # Storefront landing page (/), mobile category panel, products grid
        ├── product-details/       # Product detail page (/products/:slug) with bottom navigation
        ├── cart/                   # Customer cart (/cart), guest storage, and checkout progression
        ├── checkout/               # Multi-step checkout, /info phone capture bridging, and Razorpay/COD
        ├── about/                  # Customer About page (/about) with Tex’s story & RealBurgerScrollHero
        ├── auth/                   # Admin Login (/admin/login) and customer login redirect handling
        ├── buyer-dashboard/        # Customer order tracking and purchase dashboard
        ├── orders/                 # Order confirmation view (/orders/:id)
        └── owner-dashboard/        # Operational admin ERP dashboard (/dashboard)
```

---

# Documentation Principles

* **Codebase is the Source of Truth:** Documentation must reflect actual files, endpoints, tables, and UI components.
* **Separation of Concerns:** Business domain logic and UI view wireframes are documented in dedicated folders.
* **Explicit Navigation Standards:** Customer-facing pages must explicitly document desktop headers and the active mobile bottom navigation bar (`Home`, `Categories`, `Cart`, `About`).
* **Guest Ordering First:** The customer checkout journey progresses seamlessly from Home (`/`) → Products (`/products`) → Cart (`/cart`) → Info (`/info`) → Checkout (`/checkout`) → Order Confirmation (`/orders/:id`) without requiring account creation.
* **Strict Admin Boundary:** Administrative capabilities are strictly isolated at `/admin/login`, requiring timing-safe credential verification.
* **No Unverified Claims:** Production readiness, external cloud services, or security guarantees are documented based strictly on verifiable code.

---

# Root Documentation

## ARCHITECTURE.md

Defines the overall system architecture, technology stack, directory structure, customer guest checkout flow (including `/info`), admin authentication boundary, verified live PostgreSQL inventory (Sides catalog), image serving architecture, and production deployment.

---

## API.md

Defines project-wide tRPC API standards, procedures, error handling, SuperJSON transformers, and router registries.

---

## AUTHENTICATION.md

Defines the isolated administrator authentication workflow at `/admin/login`, JWT cookie management, password hashing, and the customer guest cart session architecture.

---

## ROADMAP.md

Defines project milestones, completed implementations, and future architectural evolution.

---

## DEVELOPMENT_LOG.md

Records historical development logs, refactoring milestones, and audit summaries.

---

## DOCUMENTATION_STRUCTURE.md

Defines the official documentation standard, file mapping, and code-truth principles.

---

## PRODUCTION_READINESS.md

Defines the containerized production deployment architecture, security headers, and deployment checklist.

---

# Database Documentation

```text
database/
├── MIGRATIONS.md
└── SCHEMA.md
```

Contains:
* Database architecture and Drizzle schema configuration
* Relational schema definitions across 18 PostgreSQL tables
* Startup migration execution in `api/boot.ts`
* Resilient connection proxy with automatic `mockDbInstance` fallback

---

# UI Documentation

UI documentation is divided into two distinct sections:

## Business Modules

Each business capability has its own folder under `docs/UI/`:

```text
docs/UI/
├── categories/
├── company/
├── inventory/
├── invoices/
├── orders/
├── products/
├── reports/
├── user-profile/
└── warehouse/
```

Business modules define domain logic, data models, validation constraints, and business rules.

---

## UI Pages

Each user-facing screen has its own folder under `docs/UI/pages/`:

```text
docs/UI/pages/
├── about/                  # Tex’s Chicken & Burgers story, quality pillars, and burger scroll hero
├── auth/                   # Admin portal (/admin/login) and customer redirect handling
├── buyer-dashboard/        # Customer purchase history view
├── cart/                   # Shopping cart, item quantity adjustment, and checkout progression
├── checkout/               # Checkout payment, shipping, and /info customer phone validation
├── home-marketplace/      # Storefront landing page (/), desktop header, category rail, product grid
├── orders/                 # Public order confirmation (/orders/:id)
├── owner-dashboard/        # Operational admin ERP dashboard (/dashboard)
└── product-details/        # Product detail page (/products/:slug)
```

UI pages define screen layout, user experience, navigation flows, and interactive UI states. UI pages reference business modules rather than duplicating domain rules.

---

# Standard Documentation Template

Every business module and UI page follows the standardized seven-document specification:

```text
README.md
      ↓
DECISIONS.md
      ↓
ASCII.md
      ↓
COMPONENTS.md
      ↓
FLOW.md
      ↓
API.md
      ↓
TESTING.md
```

### Document Roles:
- **README.md:** Overview, purpose, scope, functional requirements, and business rules.
- **DECISIONS.md:** Architectural choices, design rationale, assumptions, and constraints.
- **ASCII.md:** Visual wireframes, layout geometry, responsive breakpoints, and component hierarchy.
- **COMPONENTS.md:** UI component breakdown, props interfaces, state hooks, and design tokens.
- **FLOW.md:** User journeys, navigation state machines, edge cases, and transition diagrams.
- **API.md:** tRPC procedure contracts, input/output schemas, and error responses.
- **TESTING.md:** Acceptance criteria, test cases, and verification checklists.

---

# Current Documentation Status

## Business Modules

```text
Company          ✅ Completed
User Profile     ✅ Completed
Products         ✅ Completed
Categories       ✅ Completed
Inventory        ✅ Completed
Warehouse        ✅ Completed
Orders           ✅ Completed
Invoices         ✅ Completed
Reports          ✅ Completed
```

---

## UI Pages

```text
About                ✅ Completed
Auth                 ✅ Completed
Buyer Dashboard      ✅ Completed
Cart                 ✅ Completed
Checkout             ✅ Completed
Home Marketplace     ✅ Completed
Orders               ✅ Completed
Owner Dashboard      ✅ Completed
Product Details      ✅ Completed
```

---

# Version History

## Version 6.0

Source of Truth Update & Tex’s Chicken & Burgers Alignment (2026-09-21):
* Established **Tex’s Chicken & Burgers** ("Worth Every Bite") as the definitive active production identity.
* Documented the complete customer guest checkout progression: Home (`/`) → Products (`/products`) → Cart (`/cart`) → Info (`/info`) → Checkout (`/checkout`) → Order Confirmation (`/orders/:id`).
* Clarified the strict administrator authentication boundary at `/admin/login`.
* Documented the interactive `RealBurgerScrollHero` burger scroll animation on `/about`.
* Documented the verified active PostgreSQL live inventory catalog (5 Sides products with 100 units each in Tex’s Kitchen).
* Cleaned up duplicated structural fragments and aligned all documentation maps with actual repository contents.

---

## Version 5.0

Customer Experience and Navigation Refinement (2026-09-20):
* Added Customer About Page documentation (`docs/UI/pages/about/`).
* Codified the 4-item mobile bottom navigation bar (`Home`, `Categories`, `Cart`, `About`).

---

## Version 4.1

Documentation structure and evidence update:
* Synchronized document version header.
* Explicitly mapped `database/` contents (`MIGRATIONS.md`, `SCHEMA.md`) in the project documentation tree.
* Verified complete alignment between repository implementation, business modules (9 modules), and UI pages.

---

## Version 4.0

Documentation structure update:
* Verified existing file structure and added `PRODUCTION_READINESS.md` to root docs list.
* Cleaned up redundant progress notes.

---

## Version 3.5

Major documentation milestone:
* Completed all planned UI page documentation across 8 primary views.
* Standardized seven-document templates across completed modules.
