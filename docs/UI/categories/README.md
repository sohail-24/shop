# Categories Module

**Version:** 2.0

**Status:** Active

**Module:** Categories (`src/pages/Categories.tsx`)

---

# Overview

The Categories module organizes dishes and grocery products into culinary classifications across **Shah's Halal** and the **Shop** administrative platform.

In the customer-facing storefront, categories serve as the primary browsing mechanism (e.g., Fresh Halal Meats, Biryani & Rice, Platters, Gyros & Sandwiches, Appetizers, Beverages, Sauces & Condiments). In the administrative ERP, managers can create, update, reorder, or archive categories to control menu availability.

---

# Purpose

The purpose of this module is to:

* Structure the Halal food and restaurant menu into logical, appetizing groups.
* Provide quick-filtering pills on the storefront home and dedicated category pages.
* Support administrative CRUD via `trpc.category` router procedures.
* Enable or disable categories dynamically based on seasonal or daily kitchen availability.


---

# Business Goals

The Categories module aims to:

* Keep product organization simple and consistent.
* Improve the marketplace browsing experience.
* Reduce duplicate product classifications.
* Support different wholesale business types.
* Provide reusable category information across the platform.
* Prepare the system for future category expansion.

---

# Users

The following users can access this module.

## Business Owner

Can:

* View categories.
* Create categories.
* Update categories.
* Archive categories.
* Control category availability.

---

## Buyer

Can:

* Browse active categories.
* Filter products using categories.
* View products grouped by category.

Buyers cannot modify category information.

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

* Create categories.
* Edit categories.
* Archive categories.
* Change category status.

Cannot:

* Permanently delete categories through the user interface.

---

## Buyer

Can:

* View active categories.
* Use categories for browsing and filtering products.

Cannot:

* Create categories.
* Edit categories.
* Archive categories.
* View administrative category settings.

---

# Features

Version 1.0 includes:

## Category Information

* Category Name
* Description (Optional)

---

## Category Display

* Display Order
* Category Status

---

## Category Image

Business owners can:

* Upload a category image.
* Replace a category image.
* Remove a category image.

If no image is available, FreshFlow displays a default category image.

---

## Category Availability

Categories may have one of the following statuses:

* Active
* Inactive
* Archived

Only Active categories are visible in the marketplace.

---

# Business Rules

The Categories module follows these business rules:

* Every category belongs to one company.
* Category Name is required.
* Category Name must be unique within a company.
* Categories can exist without products.
* Products belong to only one category.
* Archived categories cannot be assigned to new products.
* Inactive categories are hidden from buyers.
* Categories are archived instead of permanently deleted.
* Category information is shared across all business modules.

---

# Dependencies

The Categories module depends on:

* Authentication Module
* User Profile Module
* Company Module

The following modules depend on Categories:

* Products
* Inventory
* Marketplace
* Orders
* Reports
* Dashboard

---

# Database

Version 1.0 uses:

## Table

* categories

Typical information stored includes:

* Category Name
* Description
* Display Order
* Category Image
* Category Status
* Company
* Created Date
* Updated Date

---

# API

The Categories module provides APIs for:

* Get Category List
* Get Category Details
* Create Category
* Update Category
* Archive Category
* Upload Category Image
* Remove Category Image

Detailed API specifications are documented in **API.md**.

---

# Security

Security requirements include:

* Authentication required for category management.
* Server-side authorization.
* Input validation.
* Secure category image upload validation.
* Protected administrative actions.
* Audit-ready category updates.

Buyers can only access categories that are marked as Active.

---

# Future Roadmap

Future versions may include:

* Parent and Child Categories
* Category Icons
* Bulk Category Import
* Bulk Category Export
* Category Analytics
* Category Recommendations
* Localized Category Names

These features are intentionally excluded from Version 1.0 to keep category management simple.

---

# Related Modules

The Categories module works with:

* Company
* Products
* Inventory
* Marketplace
* Orders
* Reports
* Dashboard

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

Initial Categories module documentation.

Focus areas:

* Simple category management.
* Consistent product organization.
* Improved marketplace navigation.
* Foundation for future business modules.
