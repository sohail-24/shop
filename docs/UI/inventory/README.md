# Inventory Module

**Version:** 2.0

**Status:** Active

**Module:** Inventory (`src/pages/Inventory.tsx`)

---

# Overview

The Inventory module manages the stock of food items, ingredients, and packaged goods across **Shah's Halal** and the **Shop** administrative ERP.

It tracks on-hand stock quantities, reserved inventory for active orders, reorder thresholds, and warehouse stock movements. The module interfaces with the `inventories` and `warehouse_stock_movements` database tables to guarantee accurate stock visibility and prevent overselling.

---

# Purpose

The purpose of this module is to:

* Monitor on-hand, reserved, and available stock levels.
* Support stock adjustments with logged movement reasons (Inbound, Outbound, Transfer, Adjustment).
* Interface with the Warehouse module (`/warehouse`) for multi-location physical inventory.
* Alert managers when stock levels drop below configured reorder points.
* Provide reliable inventory availability signals to the storefront.


---

# Business Goals

The Inventory module aims to:

* Keep inventory records accurate.
* Help businesses monitor stock levels.
* Prevent overselling products.
* Simplify inventory management.
* Support future inventory expansion.
* Provide reliable inventory data across the platform.

---

# Users

The following users can access this module.

## Business Owner

Can:

* View inventory.
* Update stock quantities.
* Perform stock adjustments.
* View inventory status.

---

## Buyer

Can:

* View product availability.

Buyers cannot view internal inventory information.

---

## Future Roles

The architecture is designed to support:

* Inventory Manager
* Warehouse Staff
* Sales Executive
* Platform Administrator

Additional permissions can be introduced without changing the overall module architecture.

---

# Permissions

## Business Owner

Can:

* View inventory.
* Update stock.
* Perform stock adjustments.
* View low stock alerts.

Cannot:

* Permanently delete inventory records.

---

## Buyer

Can:

* View whether a product is available.

Cannot:

* View stock quantities.
* Modify inventory.
* Perform stock adjustments.

---

# Features

Version 1.0 includes:

## Inventory Information

* Product
* Current Stock
* Available Stock
* Inventory Status
* Last Updated

---

## Stock Management

Business owners can:

* Increase stock.
* Decrease stock.
* Adjust stock manually.
* View stock history (basic).

---

## Inventory Status

Products may have one of the following inventory statuses:

* In Stock
* Low Stock
* Out of Stock

Inventory status is calculated automatically based on the current stock quantity.

---

# Business Rules

The Inventory module follows these business rules:

* Every inventory record belongs to one company.
* Every inventory record belongs to one product.
* A product has only one inventory record.
* Stock quantity cannot be negative.
* Inventory records cannot exist without a product.
* Inventory adjustments update stock immediately.
* Inventory information is shared across business modules.
* Inventory records are never permanently deleted.

---

# Dependencies

The Inventory module depends on:

* Authentication Module
* User Profile Module
* Company Module
* Categories Module
* Products Module

The following modules depend on Inventory:

* Orders
* Reports
* Dashboard
* Marketplace

---

# Database

Version 1.0 uses:

## Table

* inventory

Typical information stored includes:

* Product
* Company
* Current Stock
* Available Stock
* Inventory Status
* Last Updated

Product information is managed by the Products module.

---

# API

The Inventory module provides APIs for:

* Get Inventory List
* Search Inventory
* Get Inventory Details
* Update Stock
* Adjust Stock
* Get Inventory Status

Detailed API specifications are documented in **API.md**.

---

# Security

Security requirements include:

* Authentication required for inventory management.
* Server-side authorization.
* Input validation.
* Protected inventory operations.
* Audit-ready stock adjustments.

Buyers can only view product availability and cannot access internal inventory details.

---

# Future Roadmap

Future versions may include:

* Warehouse management
* Multi-warehouse inventory
* Batch management
* Expiry date tracking
* Stock transfers
* Purchase receiving
* Inventory valuation
* Automated low stock notifications
* Barcode scanning
* Inventory forecasting

These features are intentionally excluded from Version 1.0 to keep inventory management simple.

---

# Related Modules

The Inventory module works with:

* Company
* Categories
* Products
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

Initial Inventory module documentation.

Focus areas:

* Simple inventory management.
* Accurate stock tracking.
* Reliable inventory information.
* Foundation for future warehouse and stock management features.
