# Home Marketplace / Shah's Halal Storefront

**Version:** 2.0

**Status:** Active

**Page:** Home Marketplace (`src/pages/LandingPage.tsx`)

---

# Overview

The Home Marketplace is the customer-facing storefront entry point for **Shah's Halal** ("Fresh Food · Pure Taste").

It allows visitors and food lovers to explore the halal menu, browse categories, discover chef's specials, search dishes, and add items directly to their shopping cart without mandatory registration.

The storefront is fully responsive and integrates with a persistent bottom navigation bar on mobile and desktop viewports.

---

# Purpose

The Home Marketplace exists to:

* Showcase authentic Shah's Halal cuisine and halal-certified meats immediately.
* Provide frictionless product browsing with category filtering and real-time search.
* Enable instant purchasing through an unauthenticated guest cart (`localStorage`).
* Highlight featured specials, fresh platters, gyros, and biryani.
* Direct customers effortlessly to categories, cart checkout, and the brand story (About page).

---

# User Roles & Capabilities

## Guest Customer (Default Storefront Visitor)

Can:

* Browse halal dishes, ingredients, and categories.
* Search the catalog by dish name, description, or halal tag.
* View item details, spice level, preparation notes, and pricing.
* **Add items directly to the shopping cart** (persisted locally via `src/lib/guestCart.ts`).
* Update quantities or remove items from the cart.
* Proceed to checkout and pay via Razorpay.
* Access the About page to review Halal certification and store hours.

---

## Administrator (Store Manager / Owner)

Can:

* Navigate to `/admin/login` to access the administrative ERP portal (`/dashboard`).
* Manage product listings, update prices, upload food images, and control marketplace visibility.
* Adjust multi-warehouse stock levels, inspect orders, and view financial reports.

---

# Page Navigation & Structure

Customers navigate via the unified **CustomerBottomNav** (`src/components/CustomerBottomNav.tsx`):

1. **Home (`/`):** Returns to this storefront landing page.
2. **Categories (`/categories`):** Navigates to the full Halal food taxonomy grid.
3. **Cart (`/cart`):** Navigates to the shopping cart review with line-item totals and dynamic badge count.
4. **About (`/about`):** Navigates to the brand story, Halal certification standards, FAQ, and contact info.
* Product Catalog
* Categories
* Login
* Registration
* Shopping Cart
* Buyer Dashboard (Authenticated)
* Owner Dashboard (Authenticated Business Owner)

---

# Page Layout

The page is organised into the following sections:

1. Sticky Marketplace Header
2. Search Bar
3. Category Navigation
4. Business Information Strip
5. Featured Products
6. Browse by Categories
7. Recently Added Products
8. Footer

The layout prioritises products above promotional content.

---

# Page Sections

## Sticky Marketplace Header

Displays:

* FreshFlow logo
* Product search
* Login or Profile
* Shopping Cart

The header remains visible while scrolling.

---

## Search

Allows users to search products from anywhere on the page.

Search results update the visible product listing without requiring page navigation.

---

## Category Navigation

Displays active product categories.

Selecting a category filters the visible products.

Users can return to the complete catalogue by selecting **All Products**.

---

## Business Information Strip

Displays key marketplace highlights such as:

* Wholesale Pricing
* Verified Suppliers
* Bulk Orders
* Fast Delivery

This section is intentionally compact to keep products visible near the top of the page.

---

## Featured Products

Displays selected wholesale products available for purchase.

Each product card may display:

* Product Image
* Product Name
* Supplier
* Price
* Unit
* Minimum Order Quantity
* Stock Availability
* Category
* Add to Cart
* View Details

Only products available for sale are displayed.

---

## Browse by Categories

Displays active categories to help buyers discover products quickly.

Selecting a category updates the product listing.

---

## Recently Added Products

Displays recently added products.

Users may continue loading additional products or open the complete product catalogue.

---

## Footer

Displays:

* Company information
* Contact information
* Useful links
* Copyright
* Legal pages

---

# User Interactions

Users can:

* Search products.
* Browse categories.
* Filter products.
* View product details.
* Add products to the cart (Authenticated Buyers).
* Sign in.
* Register.
* Navigate to the complete catalogue.

---

# Business Modules Used

The Home Marketplace uses the following business modules.

## Products Module

Provides:

* Product listing
* Product information
* Product availability
* Product pricing
* Product search
* Product images

---

## Categories Module

Provides:

* Category navigation
* Product categorisation
* Category filtering

---

## Company Module

Provides:

* Supplier and business information displayed with products.
* Business identity shown throughout the marketplace.

---

## Authentication Module

Provides:

* Login
* Registration
* Session management
* Authentication before cart operations

---

# Business Rules

The Home Marketplace follows these page-level rules:

* Products can be browsed without authentication.
* Product searching is available to all visitors.
* Category filtering is available to all visitors.
* Only available products are displayed.
* Only active categories are displayed.
* Guests cannot add products to the shopping cart.
* Guests attempting to add products to the cart are redirected to authentication.
* Administrative controls are never displayed on this page.
* Product management is performed only within the Business Owner workspace.

---

# Responsive Behaviour

## Desktop

* Multi-column product grid.
* Sticky header.
* Full search bar.
* Horizontal category navigation.

---

## Tablet

* Responsive product grid.
* Collapsible spacing.
* Touch-friendly controls.

---

## Mobile

* Stacked header layout.
* Full-width search.
* Horizontally scrollable categories.
* Single-column product cards.
* Touch-optimised actions.

---

# Design Principles

The Home Marketplace follows these design principles:

* Product-first experience.
* Minimal visual clutter.
* Professional wholesale appearance.
* Simple navigation.
* Consistent spacing.
* Fast product discovery.
* Mobile-first responsiveness.
* Accessible user interface.
* Consistent branding throughout the page.

---

# Accessibility

The page should support:

* Keyboard navigation.
* Visible keyboard focus.
* Screen reader compatibility.
* Alternative text for images.
* Accessible form controls.
* Responsive layouts across supported devices.
* Sufficient colour contrast for readability.

---

# Future Enhancements

Future versions may include:

* Featured suppliers.
* Personalised recommendations.
* Seasonal promotions.
* Recently viewed products.
* Product comparison.
* Saved searches.
* Advanced product filters.
* Multi-language support.

These features are intentionally excluded from Version 1.0 to maintain a simple and focused marketplace experience.

---

# Related Pages

The Home Marketplace connects with:

* Product Catalog
* Product Details
* Cart
* Checkout
* Authentication
* Buyer Dashboard
* Owner Dashboard

---

# Documentation

This page includes:

* README.md
* ASCII.md
* FLOW.md

Business logic is documented in the corresponding business modules and should not be duplicated within this page documentation.

---

# Version History

## Version 1.0

Initial Home Marketplace page documentation.

Focus areas:

* Product-first marketplace experience.
* Simple product discovery.
* Category-based navigation.
* Guest browsing with authenticated purchasing.
* Responsive wholesale marketplace design.
