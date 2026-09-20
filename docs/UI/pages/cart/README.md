# Shopping Cart / Shah's Halal

**Version:** 2.0

**Status:** Active

**Page:** Shopping Cart (`src/pages/CartPage.tsx`)

---

# Overview

The Shopping Cart page allows customers to review their selected halal dishes and items before proceeding to checkout.

It displays line items, quantities, dish prices, subtotal, estimated taxes/delivery, and order totals. Customers can increment/decrement quantities, remove line items, empty the cart, continue shopping, or proceed directly to checkout.

---

# Purpose

The Shopping Cart page exists to:

* Display all selected dishes and merchandise.
* Allow customers to review line items and custom dish notes.
* Update item quantities with real-time total recalculation.
* Remove unwanted items or clear the entire cart.
* Display itemized order breakdown (subtotal, shipping estimate, GST).
* Seamlessly transition to the checkout and payment stage.

---

# User Roles & Capabilities

## Guest Customer (Default Experience)

Can:

* View all items stored in the browser's guest cart (`localStorage` under `guest_cart`).
* Adjust quantities (increment / decrement).
* Delete specific items or clear the cart.
* Proceed directly to `/checkout` without forced authentication.
* Continue shopping by returning to the menu (`/` or `/categories`).

---

## Administrator

Can:

* Access the cart page as a customer would to verify checkout mechanics.
* Access administrative dashboards via `/dashboard`.
* View supplier information.
* View order summary.
* Proceed to checkout.

---

## Business Owner

Business Owners do not manage customer shopping carts through this page.

---

# Page Goals

The Shopping Cart page aims to:

* Present a clear summary of selected products.
* Allow quick quantity adjustments.
* Simplify cart management.
* Display accurate pricing information.
* Reduce checkout abandonment.
* Minimise the number of steps required to complete a purchase.

---

# Navigation

Users can navigate to:

* Home Marketplace
* Product Catalog
* Product Details
* Authentication
* Checkout

The Continue Shopping action returns users to product browsing.

---

# Page Layout

The page is organised into the following sections:

1. Navigation Header
2. Cart Items
3. Product Information
4. Quantity Controls
5. Supplier Information
6. Order Summary
7. Delivery Summary
8. Purchase Actions

---

# Page Sections

## Navigation Header

Displays:

* Back Navigation
* Shopping Cart Title
* Cart Item Count

---

## Cart Items

Displays every selected product including:

* Product Image
* Product Name
* Category
* Supplier
* Unit Price
* Quantity
* Line Total

Each product is displayed as an individual cart item.

---

## Quantity Controls

Buyers can:

* Increase quantity.
* Decrease quantity.
* View updated line totals.

The selected quantity cannot be lower than the product's Minimum Order Quantity.

---

## Remove Product

Buyers may remove products from the cart.

Removing a product immediately updates the order summary.

---

## Supplier Information

Displays supplier details for each product.

Supplier information is provided by the Company module.

---

## Order Summary

Displays:

* Total Products
* Total Quantity
* Subtotal
* Estimated Total

The summary updates automatically whenever the cart changes.

---

## Delivery Summary

Displays:

* Delivery Area
* Estimated Delivery
* Delivery Availability

Delivery information is based on the company's configured delivery settings.

---

## Purchase Actions

Buyers can:

* Continue Shopping.
* Proceed to Checkout.

---

## Empty Cart

When no products exist, the page displays:

* Empty cart message.
* Continue Shopping button.

No checkout option is shown until products are added.

---

# User Interactions

Users can:

* Review selected products.
* Update quantities.
* Remove products.
* View supplier information.
* Review order totals.
* Continue shopping.
* Proceed to checkout.

---

# Business Modules Used

The Shopping Cart page uses the following business modules.

## Products Module

Provides:

* Product information.
* Product images.
* Pricing.
* Units.
* Minimum Order Quantity.
* Availability.

---

## Company Module

Provides:

* Supplier information.
* Delivery configuration.

---

## Authentication Module

Provides:

* Authentication before checkout.

---

## Orders Module

Provides:

* Checkout hand-off.
* Order creation workflow after checkout.

---

# Business Rules

The Shopping Cart page follows these page-level rules:

* Only available products remain in the cart.
* Quantities cannot be lower than the Minimum Order Quantity.
* Order totals update automatically when quantities change.
* Guests may review the cart.
* Guests must authenticate before checkout.
* Products may be removed at any time before checkout.
* Checkout is available only when the cart contains at least one product.
* Product information is read-only.

---

# Responsive Behaviour

## Desktop

* Multi-column cart layout.
* Order summary displayed beside cart items.
* Checkout button remains visible.

---

## Tablet

* Responsive cart layout.
* Large touch-friendly quantity controls.
* Order summary displayed below cart items.

---

## Mobile

* Single-column layout.
* Full-width product cards.
* Large quantity controls.
* Sticky checkout button (future enhancement).

---

# Design Principles

The Shopping Cart page follows these principles:

* Clear product review.
* Fast quantity management.
* Simple checkout progression.
* Consistent pricing visibility.
* Mobile-first responsiveness.
* Minimal distractions.
* Accessible controls.

---

# Accessibility

The page should support:

* Keyboard navigation.
* Screen reader compatibility.
* Accessible quantity controls.
* Accessible remove buttons.
* Visible keyboard focus.
* Sufficient colour contrast.

---

# Future Enhancements

Future versions may include:

* Save for Later.
* Coupon codes.
* Promotional discounts.
* Estimated taxes.
* Delivery charge calculation.
* Product recommendations.
* Recently viewed products.
* Multiple shipping options.

These features are intentionally excluded from Version 1.0 to maintain a simple purchasing experience.

---

# Related Pages

The Shopping Cart page connects with:

* Home Marketplace
* Product Catalog
* Product Details
* Authentication
* Checkout
* Orders

---

# Documentation

This page includes:

* README.md
* ASCII.md
* FLOW.md

Business logic for products, company information, authentication, and order processing is documented within their respective business modules and is intentionally not duplicated in this page documentation.

---

# Version History

## Version 1.0

Initial Shopping Cart page documentation.

Focus areas:

* Product review.
* Quantity management.
* Order summary.
* Delivery overview.
* Checkout preparation.
* Responsive purchasing experience.
