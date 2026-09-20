# Buyer Dashboard (Customer Experience)

**Version:** 2.0

**Status:** Planned / Integrated into Storefront

**Page:** Customer Storefront (`/`, `/categories`, `/cart`, `/about`)

---

# Overview

In the current implementation, customer buyers interact directly with the **Shah's Halal** storefront in an unauthenticated guest mode. All purchasing capabilities (product catalog discovery, filtering, dish details, cart additions, and Razorpay checkout) are available without requiring a dedicated buyer dashboard.

The authenticated buyer dashboard concept described herein is archived for Phase 4, when customer registration, address books, and loyalty accounts are re-activated.

---

# Current vs. Future State

| Feature | Current State (v2.0) | Future State (Phase 4) |
| --- | --- | --- |
| **Catalog Browsing** | Public Storefront (`LandingPage.tsx`) | Personalized Storefront & Recommendations |
| **Cart Storage** | Client `localStorage` (`guest_cart`) | Server-synced Buyer Cart |
| **Order History** | Receipt on order completion | Historical Orders List & Status Tracker |
| **Addresses** | Direct input at Checkout | Saved Address Book (`user_addresses`) |
| **Authentication** | Guest Mode (No login required) | Mobile OTP / Password Login |

---

# Phase 4 Planned Capabilities

When customer authentication is re-enabled, the Buyer Dashboard will provide:
1. **Order Timeline:** Real-time order status tracking (Received, Preparing, Dispatched, Delivered).
2. **Saved Addresses:** Ability to manage default delivery locations.
3. **Repeat Orders:** One-click re-ordering of favorite halal platters and family combos.
4. **Loyalty Balance:** Display accrued rewards points and promotional discounts.


---

## Business Owner

Business Owners use a separate Business Owner Dashboard.

---

# Page Goals

The Buyer Dashboard aims to:

* Reduce the time required to find products.
* Simplify wholesale purchasing.
* Present personalized shopping information.
* Provide quick navigation to frequently used features.
* Improve product discovery.
* Support mobile and desktop users equally.

---

# Navigation

Users can navigate to:

* Home Marketplace
* Product Details
* Shopping Cart
* Orders
* Profile
* Notifications
* Authentication (Logout)

---

# Page Layout

The page is organised into the following sections:

1. Header Navigation
2. Welcome Section
3. Quick Statistics
4. Category Navigation
5. Search
6. Product Filters
7. Product Grid
8. Pagination

---

# Page Sections

## Header Navigation

Displays:

* FreshFlow Logo
* Search Bar
* Wishlist
* Shopping Cart
* Notifications
* Profile Menu

---

## Welcome Section

Displays:

* Welcome Message
* Buyer Name

This section provides a personalised experience after login.

---

## Quick Statistics

Displays a summary of buyer activity.

Typical information includes:

* Active Cart Items
* Recent Orders
* Saved Products (Future)
* Saved Suppliers (Future)

Statistics provide quick insight into buyer activity.

---

## Category Navigation

Displays product categories.

Buyers can quickly browse products by category.

---

## Search

Allows buyers to search products by:

* Product Name
* Category
* Supplier

Search results update the displayed product list.

---

## Product Filters

Supports filtering by:

* Category
* Price
* Origin
* Supplier
* Availability
* Rating

Filters may be combined.

---

## Product Grid

Displays product cards containing:

* Product Image
* Product Name
* Category
* Price
* Unit
* Available Stock
* Minimum Order Quantity
* Supplier
* Rating
* Quantity Selector
* Calculated Line Total
* View Details
* Add to Cart

Each product card provides sufficient information for buyers to make purchasing decisions without opening the product details page.

---

## Pagination

Allows buyers to browse additional products.

Navigation includes:

* Previous
* Page Numbers
* Next

---

# User Interactions

Users can:

* Search products.
* Filter products.
* Browse categories.
* Adjust product quantities.
* View product details.
* Add products to the shopping cart.
* Access profile.
* Access orders.
* View notifications.

---

# Business Modules Used

The Buyer Dashboard uses the following business modules.

## Products Module

Provides:

* Product information.
* Product pricing.
* Product images.
* Product availability.
* Minimum Order Quantity.

---

## Categories Module

Provides:

* Product categories.
* Category navigation.

---

## Company Module

Provides:

* Supplier information.
* Business identity.

---

## Authentication Module

Provides:

* Buyer authentication.
* Secure dashboard access.

---

## Shopping Cart

Provides:

* Cart management.
* Product quantities.
* Cart status.

---

## Orders Module

Provides:

* Recent orders.
* Order navigation.

---

# Business Rules

The Buyer Dashboard follows these page-level rules:

* Only authenticated buyers may access the dashboard.
* Only available products are displayed.
* Product information is read-only.
* Quantities cannot be lower than the product's Minimum Order Quantity.
* Filters update product listings dynamically.
* Search results reflect active filters.
* Buyers cannot modify product information.
* Buyers may add products directly to the shopping cart.

---

# Responsive Behaviour

## Desktop

* Multi-column layout.
* Sidebar filters.
* Four-column product grid.
* Persistent header navigation.

---

## Tablet

* Responsive filter panel.
* Two-column product grid.
* Touch-friendly controls.

---

## Mobile

* Single-column layout.
* Collapsible filters.
* Full-width product cards.
* Sticky search bar.
* Bottom navigation (Future Enhancement).

---

# Design Principles

The Buyer Dashboard follows these principles:

* Personalised buyer experience.
* Fast product discovery.
* Efficient wholesale purchasing.
* Minimal navigation effort.
* Consistent shopping workflow.
* Mobile-first responsiveness.
* Accessible interface.

---

# Accessibility

The page should support:

* Keyboard navigation.
* Screen reader compatibility.
* Accessible search controls.
* Accessible filter controls.
* Visible keyboard focus.
* Sufficient colour contrast.
* Accessible product cards.

---

# Future Enhancements

Future versions may include:

* Recently Viewed Products.
* Recommended Products.
* Favourite Suppliers.
* Saved Searches.
* Product Comparison.
* AI Product Recommendations.
* Smart Reordering.
* Promotional Banners.
* Bulk Quick Order.
* Recently Purchased Products.

These features are intentionally excluded from Version 1.0 to maintain a focused and efficient buying experience.

---

# Related Pages

The Buyer Dashboard connects with:

* Home Marketplace
* Product Details
* Shopping Cart
* Checkout
* Orders
* Profile

---

# Documentation

This page includes:

* README.md
* ASCII.md
* FLOW.md

Business logic for products, categories, authentication, shopping cart, and orders is documented within their respective business modules and is intentionally not duplicated in this page documentation.

---

# Version History

## Version 1.0

Initial Buyer Dashboard page documentation.

Focus areas:

* Personalised buyer workspace.
* Product discovery.
* Search and filtering.
* Shopping efficiency.
* Quick access to buyer activities.
* Responsive wholesale purchasing experience.
