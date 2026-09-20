# Shah's Halal / Shop API Standards

**Version:** 2.0

**Status:** Active

**Last Updated:** 2026-09-20

---

# Purpose

This document defines the official API architecture and standards for the Shah's Halal / Shop project.

The API exposes backend functionality exclusively through **tRPC 11** mounted over **Hono 4** at `/trpc`. All business operations are organized into typed domain routers with runtime input validation using Zod and serialization via SuperJSON.

---

# Registered tRPC Router Surface

The root application router (`api/router.ts`) aggregates 17 domain routers:

```text
api/
├── router.ts             # Root router aggregating all 17 sub-routers
├── auth-router.ts        # authRouter (active admin) + legacyAuthRouter (preserved)
├── productRouter.ts      # product
├── categoryRouter.ts     # category
├── cartRouter.ts         # cart
├── orderRouter.ts        # order
├── inventoryRouter.ts    # inventory
├── companyRouter.ts      # company
├── warehouseRouter.ts    # warehouse
├── invoiceRouter.ts      # invoice
├── reportRouter.ts       # report
├── profileRouter.ts      # profile
├── customerRouter.ts     # customer
├── deliveryZoneRouter.ts # deliveryZone
├── gstRouter.ts          # gst
├── shippingRouter.ts     # shipping
└── addressRouter.ts      # address
```

---

# Router Specifications & Key Procedures

### 1. `ping`
- **Purpose:** Root health check procedure.
- **Procedures:**
  - `ping` (Query, Public): Returns `{ ok: true, timestamp: string }`.

### 2. `auth` (`api/auth-router.ts`)
- **Active Implementation:** Admin authentication router.
- **Procedures:**
  - `me` (Query, Public): Returns the current authenticated admin user or `null`.
  - `loginAdmin` (Mutation, Public): Validates email and password against `ADMIN_EMAIL` and `ADMIN_PASSWORD` with timing-safe comparison. Returns signed JWT access token and sets HTTP-only cookies (`shop_admin_access`, `shop_admin_refresh`).
  - `refresh` (Mutation, Public): Refreshes the admin session using the refresh token cookie.
  - `logout` (Mutation, Public): Clears admin cookies and terminates the session.
- **Deactivated State Note:** The legacy buyer authentication router (`legacyAuthRouter`) supporting registration, email login, and mobile OTP challenges is preserved in `api/auth-router.ts` for architectural reversibility, but is intentionally not registered in the active API.

### 3. `product` (`api/productRouter.ts`)
- **Public Storefront Queries:**
  - `list`: Browse catalog items with category, search, grade, and pagination filters.
  - `bySlug`: Fetch detailed product data by URL slug.
  - `byId`: Fetch detailed product data by numeric ID.
  - `featured`: Fetch items marked as featured for the hero and showcase sections.
  - `freshDeals`: Fetch active discounted or promotional items.
  - `count`: Returns total catalog count matching filter criteria.
- **Admin Management Procedures:**
  - `create`, `update`, `delete`, `updateMarketplace`, `marketplaceById`, `stats`.

### 4. `category` (`api/categoryRouter.ts`)
- **Public Storefront Queries:**
  - `list`: Retrieves active halal food categories with display order and icons.
  - `bySlug`: Retrieves category details by URL slug.
  - `byId`: Retrieves category details by ID.
- **Admin Management Procedures:**
  - `create`, `update`, `delete`.

### 5. `cart` (`api/cartRouter.ts`)
- **Storefront Behavior:**
  - Unauthenticated customers use the guest cart (`src/lib/guestCart.ts`), which persists line items in browser `localStorage`.
  - Authenticated users synchronize with server cart tables (`cartItems`).
- **Procedures:**
  - `list` (Query, Authed): Returns active cart items with calculated totals.
  - `add` (Mutation, Authed): Adds a product quantity to the user's cart.
  - `update` (Mutation, Authed): Updates quantity or line-item notes.
  - `remove` (Mutation, Authed): Removes a specific line item.
  - `clear` (Mutation, Authed): Empties the user's cart.

### 6. `order` (`api/orderRouter.ts`)
- **Procedures:**
  - `list` (Query, Authed): Retrieves order history for the active user or admin.
  - `quote` (Query, Authed): Computes shipping fees, GST, and total quote.
  - `detail` (Query, Authed): Retrieves itemized order details.
  - `createRazorpayOrder` (Mutation, Authed): Generates a short-lived Razorpay order ID.
  - `create` (Mutation, Authed): Finalizes order creation after verifying payment signature.
  - `status`, `deliveryEstimate`, `cancel`, `stats`, `recent`.

### 7. Operations & ERP Routers (`OwnerProcedure` / `AdminProcedure`)
- **`inventory`:** Multi-warehouse stock tracking, batch numbers, reorder alerts, and stock adjustments.
- **`warehouse`:** Physical storage facilities, capacities, stock movements, and receipts/dispatches.
- **`invoice`:** GST-compliant tax invoices, itemized tax rates, and printable views.
- **`report`:** Business intelligence, revenue summaries, period filters, and valuation analytics.
- **`customer`:** B2B customer directory and credit terms.
- **`deliveryZone`:** State-level delivery zones, delivery time estimates, and fee schedules.
- **`gst`:** Category-mapped GST rules, HSN codes, and calculation helpers.
- **`shipping`:** Shipping methods, rates, and free shipping thresholds.
- **`company`:** Company directory and supplier/buyer profiles.
- **`profile`:** User personal profile and theme preferences.
- **`address`:** Saved user delivery addresses.

---

# API Design Principles

All APIs should follow these principles:

* Single responsibility.
* Clear naming.
* Predictable behaviour.
* Business-focused operations.
* Consistent validation.
* Consistent error handling.
* Reusable request models.
* Reusable response models.

---

# Naming Standards

Router names use singular nouns.

Examples:

```text
auth
company
category
product
inventory
warehouse
order
invoice
report
```

Procedure names use verbs that describe the operation.

Examples:

```text
list
get
create
update
delete
archive
search
stats
count
```

Avoid unclear names such as:

```text
process
handle
execute
doSomething
```

---

# Authentication

Authentication is required for protected APIs.

Supported authentication methods are documented in:

```text
docs/AUTHENTICATION.md
```

Authentication should be completed before any protected business operation.

---

# Authorization

Authorization must be enforced on the server.

Permissions must never rely solely on the frontend.

Business rules determine who can perform each operation.

Future role expansion should not require API redesign.

---

# Validation

All API inputs must be validated before business logic executes.

Validation should include:

* Required fields
* Data types
* Length limits
* Numeric ranges
* Business rules
* Enum validation
* Format validation

Invalid requests must return meaningful validation errors.

---

# Error Handling

APIs should return clear and consistent errors.

Typical error categories include:

* Validation Error
* Authentication Error
* Authorization Error
* Not Found
* Conflict
* Business Rule Violation
* Internal Server Error

Internal implementation details must never be exposed.

---

# Response Principles

Responses should be:

* Consistent
* Predictable
* Easy to understand
* Business-focused

Return only the information required by the client.

Avoid unnecessary data.

---

# Pagination

Large datasets should support pagination.

Typical examples include:

* Products
* Orders
* Inventory
* Reports

Pagination should remain consistent across all modules.

---

# Search

Search operations should:

* Support partial matches where appropriate.
* Return predictable results.
* Respect user permissions.
* Filter only accessible data.

---

# Filtering

Filtering should be available where it improves usability.

Typical filters include:

* Status
* Category
* Date
* Company
* Warehouse
* Supplier
* Buyer

Business modules define their own supported filters.

---

# Sorting

Sorting should be consistent across modules.

Common sorting options include:

* Name
* Created Date
* Updated Date
* Status
* Price
* Quantity

---

# Security Standards

Every API must follow these security principles:

* Authentication required where appropriate.
* Server-side authorization.
* Input validation.
* Protection against unauthorized access.
* Secure handling of sensitive information.
* Audit-ready business operations where required.

---

# API Documentation Rules

Every business module must maintain its own `API.md`.

Module documentation should include:

* Purpose
* Available operations
* Validation rules
* Business rules
* Request fields
* Response fields
* Error scenarios
* Security requirements

Project-wide standards should never be duplicated inside module documentation.

---


# Order & Payment Flow

The order creation process integrates securely with Razorpay.

## 1. Creating a Razorpay Order
- **Procedure:** `createRazorpayOrder`
- **Purpose:** Generates a short-lived `razorpay_order_id` intended for the frontend checkout.
- **Rules:** The amount and currency are securely calculated on the backend based on the user's cart.

## 2. Payment Verification
- **Procedure:** `create` (Order Creation)
- **Purpose:** Finalizes the application order only if the payment signature is valid.
- **Verification Inputs:**
  - `razorpayOrderId`
  - `razorpayPaymentId`
  - `razorpaySignature`
- **Security:** The backend securely verifies the `razorpaySignature` using `crypto.timingSafeEqual` against a locally computed HMAC-SHA256 hash using the server-side Razorpay secret (e.g., `RAZORPAY_KEY_SECRET`).

## 3. Idempotency & Duplicate Protection
If a `razorpayOrderId` has already been processed and an application order exists for it, another order must not be created.
- **Behavior:** The API queries the database for the provided `razorpayOrderId`. If found, a duplicate-payment conflict error is raised to prevent duplicate orders.


# Future Improvements

Future versions may include:

* API versioning
* Rate limiting
* Webhooks
* Batch operations
* Background job APIs
* Public developer APIs
* OpenAPI documentation
* API monitoring
* API analytics

---

# Related Documentation

Project documentation:

```text
ARCHITECTURE.md
AUTHENTICATION.md
DOCUMENTATION_STRUCTURE.md
ROADMAP.md
```

Business module documentation:

```text
docs/UI/<module>/API.md
```

---

# Version History

## Version 1.1

Updated to accurately reflect the real API implemented, including all current routers and Razorpay flow.

## Version 1.0

Initial API standards document.
