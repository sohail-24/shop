# Products Module

**Version:** 2.0

**Status:** Active

**Module:** Products
- Administrative List: `src/pages/Products.tsx` (`/products`)
- Add Product: `src/pages/AddProduct.tsx` (`/products/new`)
- Edit Product: `src/pages/EditProduct.tsx` (`/products/:slug/edit`)
- Storefront View: `src/pages/ProductDetail.tsx` (`/products/:slug`)

---

# Overview

The Products module manages all culinary dishes, halal meats, and packaged goods sold through the **Shah's Halal** storefront and managed within the **Shop** administrative ERP.

Dishes configured in this module populate the storefront homepage, category catalog, guest shopping cart, orders, inventory stock registers, and GST invoices.

---

# Purpose

The purpose of this module is to:

* Maintain the catalog of authentic Halal dishes, platter combinations, and side orders.
* Control dish pricing, descriptions, images, category associations, and Halal tags.
* Manage marketplace visibility (`isActive`) and stock thresholds.
* Provide an intuitive administrative management interface for adding, editing, and archiving products.


---

# Business Goals

The Products module aims to:

* Allow businesses to add products within minutes.
* Keep product management simple and user-friendly.
* Provide consistent product information across the platform.
* Support different types of wholesale businesses.
* Separate product information from inventory management.
* Provide a strong foundation for future business modules.

---

# Users

The following users can access this module.

## Business Owner

Can:

* View products.
* Create products.
* Update products.
* Archive products.
* Manage product images.
* Control product availability.

---

## Buyer

Can:

* Browse products.
* Search products.
* Filter products.
* View product details.
* Add products to the shopping cart.

Buyers cannot modify product information.

---

## Future Roles

The architecture is designed to support:

* Manager
* Warehouse Staff
* Sales Executive
* Platform Administrator

Additional permissions can be introduced without changing the overall module architecture.

---

# Permissions

## Business Owner

Can:

* Create products.
* Edit products.
* Archive products.
* Upload product images.
* Change product availability.

Cannot:

* Permanently delete products through the user interface.

---

## Buyer

Can:

* View available products.
* Search products.
* Filter products.
* View product details.
* Add products to the shopping cart.

Cannot:

* Create products.
* Edit products.
* Archive products.
* View administrative product information.

---

# Features

Version 1.0 includes:

## Product Information

* Product Name
* Category
* Description (Optional)

---

## Selling Information

* Price
* Unit
* Minimum Order

Supported units include:

* Item
* Kilogram
* Gram
* Box
* Packet
* Bag
* Bottle
* Crate
* Tray

Additional units may be introduced in future versions.

---

## Product Details

* Brand (Optional)
* Product Code (Optional)
* Barcode (Optional)
* Product Quality (Optional)
* Organic Product (Optional)

---

## Product Images

Business owners can:

* Upload a main product image.
* Upload additional product images.
* Replace product images.
* Remove product images.

If no image is available, FreshFlow displays a default product image.

---

## Product Availability

Products may have one of the following statuses:

* Available for Sale
* Hidden from Customers
* Archived

Only products marked as Available for Sale are visible in the marketplace.

---

# Business Rules

The Products module follows these business rules:

* Every product belongs to one company.
* Every product belongs to one category.
* Product Name is required.
* Price is required.
* Unit is required.
* Minimum Order is required.
* A product may exist before stock is added.
* Archived products cannot be purchased.
* Hidden products are not shown to customers.
* Products are archived instead of permanently deleted.
* Product information is shared across all business modules.

---

# Dependencies

The Products module depends on:

* Authentication Module
* User Profile Module
* Company Module
* Category Module

The following modules depend on Products:

* Inventory
* Shopping Cart
* Orders
* Reports
* Dashboard
* Marketplace

---

# Database

Version 1.0 uses:

## Table

* products

Typical information stored includes:

* Product Name
* Category
* Description
* Price
* Unit
* Minimum Order
* Brand
* Product Code
* Barcode
* Product Quality
* Organic Product
* Product Images
* Product Status
* Company
* Created Date
* Updated Date

Stock quantity is managed by the Inventory module.

---

# API

The Products module provides APIs for:

* Get Product List
* Search Products
* Get Product Details
* Create Product
* Update Product
* Archive Product
* Upload Product Image
* Remove Product Image

Detailed API specifications are documented in **API.md**.

---

# Security

Security requirements include:

* Authentication required for product management.
* Server-side authorization.
* Input validation.
* Secure product image upload validation.
* Protected administrative actions.
* Audit-ready product updates.

Buyers can only access products that are available for sale.

---

# Future Roadmap

Future versions may include:

* Product variants
* Multiple product images with drag-and-drop ordering
* Product tags
* Product bundles
* Supplier catalog sharing
* Product recommendations
* Product reviews and ratings
* Barcode generation
* Bulk product import and export

These features are intentionally excluded from Version 1.0 to keep product management simple.

---

# Related Modules

The Products module works with:

* Company
* Categories
* Inventory
* Shopping Cart
* Orders
* Reports
* Dashboard
* Marketplace

---

# Documentation

This module includes:

* README.md
* DECISIONS.md
* ASCII.md
* COMPONENTS.md
* FLOW.md
* API.md
* TESTING.md

---

# Version History

## Version 1.0

Initial Products module documentation.

Focus areas:

* Simple product management.
* Easy product creation.
* Clean marketplace experience.
* Foundation for inventory and order management.

