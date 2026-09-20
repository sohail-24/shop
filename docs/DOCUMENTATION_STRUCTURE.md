# Shah's Halal / Shop Documentation Structure

**Version:** 5.0

**Status:** Active

**Last Updated:** 2026-09-20

---

# Purpose

This document defines the official documentation standard for the Shah's Halal / Shop project (incorporating foundational ERP and commerce modules from FreshFlow).

All project documentation must follow this structure.

Business modules own business logic. UI pages own screen behaviour. Business rules must never be duplicated across documents. The actual repository codebase is the single source of truth.

---

# Documentation Philosophy

The project follows a **Code-Truth Documentation** methodology:
- **Code is Reality:** Documentation must accurately describe what is actually implemented in the repository, without speculation or obsolete claims.
- **Truthful Status:** Features are classified by their real status: `ACTIVE`, `PRESERVED BUT DEACTIVATED`, `HIDDEN`, `UNUSED / ORPHANED`, or `REMOVED`.
- **Verified Verification:** If a capability cannot be definitively proven in the codebase, it is marked as `Needs verification`.

---

# Project Documentation Structure

```text
docs/
├── ARCHITECTURE.md                 # Full-stack system architecture, technology stack, and routing
├── API.md                          # Global tRPC API standards, registered routers, and protocols
├── AUTHENTICATION.md               # Admin authentication and customer guest/legacy session management
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
    ├── pages/                      # Specific view/page wireframes and user interaction flows
    │   ├── home-marketplace/      # Storefront landing page (/), mobile category panel, products grid
    │   ├── product-details/       # Product detail page (/products/:slug) with bottom navigation
    │   ├── cart/                   # Customer cart (/cart), guest storage, and checkout entry
    │   ├── checkout/               # Multi-step checkout, zone shipping, and Razorpay payment
    │   ├── about/                  # Customer About page (/about) with Halal promise & 4-item bottom nav
    │   ├── auth/                   # Admin Login (/admin/login) and customer login redirect handling
    │   ├── buyer-dashboard/        # Customer order tracking and purchase dashboard
    │   └── owner-dashboard/        # Operational admin ERP dashboard (/dashboard)
    │
    ├── categories/                 # Category management module documentation
    ├── company/                    # Supplier/Buyer company profile module documentation
    ├── inventory/                  # Multi-warehouse inventory and batch tracking documentation
    ├── invoices/                   # GST-compliant tax invoices and PDF generation documentation
    ├── orders/                     # Order lifecycle, fulfillment state transitions, and Razorpay
    ├── products/                   # Catalog item management, pricing, SKU, and visibility
    ├── reports/                    # Sales, inventory valuation, and performance analytics
    ├── user-profile/               # User preferences, themes, and profile management
    └── warehouse/                  # Physical warehouse facilities and stock movements log
```

---

# Documentation Principles

* **Codebase is the Source of Truth:** Documentation must reflect actual files, endpoints, tables, and UI components.
* **Separation of Concerns:** Business logic and UI wireframes are documented separately.
* **Explicit Navigation Standards:** Customer-facing pages must explicitly document both desktop headers and the active mobile bottom navigation bar (`Home`, `Categories`, `Cart`, `About`).
* **No Unverified Claims:** Production readiness, external cloud services, or security guarantees are documented based strictly on verifiable code.
    ├── user-profile/
    ├── warehouse/
    │
    └── pages/
         ├── auth/
         ├── buyer-dashboard/
         ├── cart/
         ├── checkout/
         ├── home-marketplace/
         ├── orders/
         ├── owner-dashboard/
         └── product-details/
```

---

# Root Documentation

## ARCHITECTURE.md

Defines the overall system architecture.

---

## API.md

Defines project-wide API standards and conventions.

---

## AUTHENTICATION.md

Defines authentication, authorization, roles, and permissions.

---

## ROADMAP.md

Defines project milestones and future development plans.

---

## DEVELOPMENT_LOG.md

Records daily development progress and completed work.

---

## DOCUMENTATION_STRUCTURE.md

Defines the official documentation standard used throughout the project.

---

## PRODUCTION_READINESS.md

Defines the production deployment architecture and checklist.

---

# Database Documentation

```text
database/
```

Contains:

* Database architecture
* ER diagrams
* Database standards
* Schema documentation
* Migration documentation

---

# UI Documentation

UI documentation is divided into two sections.

## Business Modules

Each business capability has its own folder.

Example:

```text
products/
inventory/
orders/
company/
categories/
warehouse/
reports/
invoices/
user-profile/
```

Business modules define business rules and behaviour.

---

## UI Pages

Each user-facing screen has its own folder.

Example:

```text
pages/
├── about/
├── auth/
├── buyer-dashboard/
├── cart/
├── checkout/
├── home-marketplace/
├── orders/
├── owner-dashboard/
└── product-details/
```

UI pages define screen layout, navigation, user interactions, and user experience.

UI pages should reference business modules instead of duplicating business rules.

---

# Standard Documentation Template

Every business module and every UI page follows the same documentation structure.

```text
README.md
DECISIONS.md
ASCII.md
COMPONENTS.md
FLOW.md
API.md
TESTING.md
```

---

# Purpose of Each Document

## README.md

Overview, purpose, scope, business objectives, functional requirements, and business rules.

---

## DECISIONS.md

Business decisions, architectural decisions, assumptions, constraints, and design choices.

---

## ASCII.md

ASCII wireframes, layouts, page structure, and visual organisation.

---

## COMPONENTS.md

UI components, reusable elements, layouts, states, and interactions.

---

## FLOW.md

User journeys, navigation, workflows, and business processes.

---

## API.md

Interfaces, API contracts, validation rules, backend communication, and integrations.

---

## TESTING.md

Acceptance criteria, business scenarios, edge cases, and testing strategy.

---

# Documentation Ownership

## Business Modules

Business modules define:

* Business rules
* Business logic
* Data ownership
* Validation rules
* Business workflows

Examples:

* Company
* Products
* Categories
* Inventory
* Warehouse
* Orders

---

## UI Pages

UI pages define:

* Screen layout
* User experience
* Navigation
* User interactions

Examples:

* Home Marketplace
* Product Details
* Checkout
* Cart
* Dashboards

Business rules should never be duplicated inside UI page documentation.

---

# Documentation Workflow

Every new business module and every new UI page follows the same process.

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

Implementation begins only after documentation has been completed and approved.

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

Auth                 ✅ Completed
Buyer Dashboard      ✅ Completed
Home Marketplace     ✅ Completed
Owner Dashboard      ✅ Completed
Product Details      ✅ Completed
Cart                 ✅ Completed
Checkout             ✅ Completed
Orders               ✅ Completed
---

# Overall Progress

FreshFlow currently has **eight fully documented UI pages** following the official documentation standard.

Each completed UI page contains:

* README.md
* ASCII.md
* FLOW.md

The UI documentation defines:

* Screen layouts
* Navigation
* User interactions
* User experience

Business rules remain within the corresponding business modules.

## Completed Business Modules

✓ Company
✓ User Profile
✓ Products
✓ Categories
✓ Inventory
✓ Warehouse
✓ Orders
✓ Invoices
✓ Reports

## Remaining Business Modules

None.

All planned core business modules have been fully documented.

## Completed UI Pages

✓ Authentication

✓ Home Marketplace

✓ Product Details

✓ Shopping Cart

✓ Checkout

✓ Buyer Dashboard

✓ Orders

✓ Owner Dashboard

FreshFlow currently has **eight fully documented UI pages**.

Each page includes:

* README.md
* ASCII.md
* FLOW.md

All planned UI documentation has been completed and approved.





---

# Benefits

* One consistent documentation standard.
* Clear separation between business modules and UI pages.
* Easy onboarding for new developers.
* Better collaboration between developers, designers, QA engineers, DevOps engineers, product owners, and AI assistants.
* Reduced duplication of business rules.
* Easier maintenance as the project grows.
* Scalable documentation for future modules.
* Documentation First Development is enforced throughout the project.
* AI assistants can accurately understand project architecture with minimal onboarding.

---

## Version 3.5

Major documentation milestone.

Changes include:

* Completed all planned UI page documentation.
* Completed Authentication page documentation.
* Completed Home Marketplace page documentation.
* Completed Product Details page documentation.
* Completed Shopping Cart page documentation.
* Completed Checkout page documentation.
* Completed Buyer Dashboard documentation.
* Completed Orders page documentation.
* Completed Owner Dashboard documentation.
* Updated UI documentation status.
* Updated overall documentation progress.
* Corrected Project Documentation Structure by replacing Product Catalog with Product Details.
* Confirmed completion of all planned business modules and UI pages.
* FreshFlow now follows a complete Documentation First Development workflow before implementation.

---

## Version 3.4

Documentation progress update.

Changes include:

* Completed the Orders module documentation.
* Completed the Invoices module documentation.
* Completed the Reports module documentation.
* Updated the Current Documentation Status section.
* Updated the Overall Progress section.
* Increased completed business modules from six to nine.
* Confirmed that all planned core business modules now follow the official seven-document documentation standard.

---

# Version History

## Version 4.1

Documentation structure and evidence update.

Changes include:
* Synchronized document version header (Version 4.1).
* Explicitly mapped `database/` contents (`MIGRATIONS.md`, `SCHEMA.md`) in the project documentation tree.
* Verified complete alignment between repository implementation, business modules (9 modules), UI pages (8 pages), and architecture evidence.

---

## Version 4.0

Documentation structure update.

Changes include:
* Verified existing file structure and added `PRODUCTION_READINESS.md` to root docs list.
* Removed duplicate information in the progress sections.

---
## Version 3.3

Documentation progress update.

Changes include:

* Completed the Warehouse module documentation.
* Updated documentation progress.
* Updated completed business modules.
* Updated remaining business modules.
* Improved wording and consistency throughout the document.
* Simplified the documentation standard for both developers and AI assistants.

---

## Version 3.2

Documentation progress update.

Changes include:

* Completed the Company module documentation.
* Completed the User Profile module documentation.
* Completed the Products module documentation.
* Completed the Categories module documentation.
* Completed the Inventory module documentation.
* Updated the overall documentation progress.
* Confirmed the standardized seven-document template across completed business modules.

---

## Version 3.0

Major documentation architecture redesign.

Changes include:

* Added the Categories module.
* Standardized every UI page into its own folder.
* Unified documentation templates across modules and pages.
* Established one documentation standard for the entire FreshFlow project.
* Improved long-term scalability and maintainability.
