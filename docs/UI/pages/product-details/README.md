# Product / Dish Details — Shah's Halal

**Version:** 2.0

**Status:** Active

**Page:** Product Details (`src/pages/ProductDetail.tsx`)

---

# Overview

The Product Details page provides comprehensive culinary and purchasing details for an individual halal dish or menu item in the **Shah's Halal** storefront.

It displays dish photography, halal certification badges, spice indicators, detailed descriptions, preparation notes, pricing, and stock status. Customers can select desired quantities and add items directly to their shopping cart.

---

# Purpose

The Product Details page exists to:

* Present authentic imagery and appetizing dish descriptions.
* Highlight 100% Halal certification and ingredient transparency.
* Provide accurate unit pricing and portion sizing.
* Allow customers to choose quantity and add the dish to their cart.
* Keep customers oriented with back navigation to categories or the main menu.

---

# User Roles & Capabilities

## Guest Customer (Default Storefront Visitor)

Can:

* View complete dish photography and descriptions.
* Verify Halal certification standards.
* Select quantity and **add directly to the guest cart** (`localStorage`).
* Review updated cart total badge in the persistent `CustomerBottomNav`.
* Proceed to `/cart` or continue browsing.

---

## Administrator

Can:

* Inspect public dish presentation and verify image rendering.
* Update dish details, descriptions, or prices via `/products` in the admin dashboard.

* View complete product information.
* Change purchase quantity.
* Add products to the cart.
* Continue shopping.
* Buy immediately.
* View related products.
* Share products.

---

## Business Owner

Can:

* View the public product page.
* Review how products appear to buyers.

Product management is performed through the Business Owner Dashboard and not from this page.

---

# Page Goals

The Product Details page aims to:

* Provide complete and accurate product information.
* Reduce uncertainty before purchase.
* Display real-time product availability.
* Simplify quantity selection.
* Minimise the number of steps required to purchase.
* Support mobile and desktop shopping experiences.
* Encourage additional product discovery.

---

# Navigation

Users can navigate to:

* Home Marketplace
* Product Catalog
* Shopping Cart
* Checkout
* Authentication
* Related Products
* Supplier Information

The Back action returns users to the page from which they arrived.

---

# Page Layout

The page is organised into the following sections:

1. Navigation Header
2. Product Summary
3. Product Image
4. Product Information
5. Quantity Selector
6. Purchase Actions
7. Product Description
8. Product Specifications
9. Supplier Information
10. Related Products

---

# Page Sections

## Navigation Header

Displays:

* Back Navigation
* Page Title
* Share Product

---

## Product Summary

Displays:

* Product Name
* Category
* Product Grade (if available)
* Customer Rating
* Supplier Name

---

## Product Image

Displays:

* Primary Product Image

Future versions may support multiple product images and image gallery navigation.

---

## Pricing Information

Displays:

* Selling Price
* Original Price (if applicable)
* Discount
* Unit
* Minimum Order Quantity (MOQ)

---

## Availability

Displays:

* Current Stock
* Product Availability
* Delivery Information

Only products available for sale are displayed.

---

## Quantity Selector

Allows buyers to:

* Increase quantity.
* Decrease quantity.
* View calculated purchase total.

The selected quantity cannot be lower than the product's Minimum Order Quantity.

---

## Purchase Actions

Buyers can:

* Add & Continue Shopping.
* Add to Cart & Go to Cart.
* Buy Now.

Guests attempting to purchase are redirected to the Authentication page.

---

## Product Description

Displays:

* Product description.
* Product highlights.
* Additional information provided by the supplier.

---

## Product Specifications

Displays product attributes such as:

* Category
* Unit
* Brand (Optional)
* Product Quality (Optional)
* Organic Product (Optional)
* Product Code (Optional)

Only information configured for the product is displayed.

---

## Supplier Information

Displays:

* Supplier Name
* Business Location
* Contact Information
* Supplier Rating

Business information is provided by the Company module.

---

## Related Products

Displays products from the same or related categories.

Selecting a product opens its Product Details page.

---

# User Interactions

Users can:

* View product information.
* View product image.
* Select quantity.
* Calculate purchase total.
* Add products to the shopping cart.
* Buy immediately.
* View supplier information.
* Browse related products.
* Share products.

---

# Business Modules Used

The Product Details page uses the following business modules.

## Products Module

Provides:

* Product information.
* Product images.
* Product description.
* Pricing.
* Unit.
* Minimum Order Quantity.
* Availability.

---

## Categories Module

Provides:

* Product category.
* Related product grouping.

---

## Company Module

Provides:

* Supplier information.
* Business identity.
* Delivery information.

---

## Authentication Module

Provides:

* Authentication before protected purchasing actions.

---

## Cart Module

Provides:

* Shopping cart functionality.
* Quantity management after products are added.

---

## Orders Module

Provides:

* Buy Now purchasing workflow.

---

# Business Rules

The Product Details page follows these page-level rules:

* Only products available for sale can be viewed.
* Product pricing is displayed using the current selling price.
* The selected quantity cannot be less than the Minimum Order Quantity.
* Purchase totals update automatically when quantity changes.
* Guests may browse products without authentication.
* Guests attempting protected purchasing actions are redirected to authentication.
* Related products display only available products.
* Product information is read-only for buyers.
* Administrative product controls are not displayed.

---

# Responsive Behaviour

## Desktop

* Two-column layout.
* Product image and information displayed side-by-side.
* Purchase actions remain immediately visible.

---

## Tablet

* Responsive image layout.
* Touch-friendly quantity controls.
* Purchase actions remain easily accessible.

---

## Mobile

* Single-column layout.
* Full-width product image.
* Large quantity controls.
* Sticky purchase actions (future enhancement).
* Touch-optimised buttons.

---

# Design Principles

The Product Details page follows these principles:

* Product-first presentation.
* Clear pricing information.
* Simple purchasing workflow.
* Minimal distractions.
* Professional wholesale appearance.
* Mobile-first responsiveness.
* Consistent branding.
* Accessible user interface.

---

# Accessibility

The page should support:

* Keyboard navigation.
* Visible keyboard focus.
* Screen reader compatibility.
* Alternative text for product images.
* Accessible quantity controls.
* Accessible action buttons.
* Sufficient colour contrast.

---

# Future Enhancements

Future versions may include:

* Multiple product images.
* Image zoom.
* Product comparison.
* Customer reviews.
* Product ratings.
* Recently viewed products.
* Frequently bought together.
* Similar products.
* Product videos.
* Availability notifications.

These features are intentionally excluded from Version 1.0 to maintain a simple purchasing experience.

---

# Related Pages

The Product Details page connects with:

* Home Marketplace
* Product Catalog
* Authentication
* Cart
* Checkout
* Orders
* Buyer Dashboard

---

# Documentation

This page includes:

* README.md
* ASCII.md
* FLOW.md

Business logic for products, categories, supplier information, authentication, shopping cart, and ordering is documented within their respective business modules and should not be duplicated within this page documentation.

---

# Version History

## Version 1.0

Initial Product Details page documentation.

Focus areas:

* Complete product information.
* Supplier transparency.
* Simple quantity selection.
* Streamlined purchasing workflow.
* Responsive wholesale shopping experience.
