# Warehouse Module

**Version:** 2.0

**Status:** Active

**Module:** Warehouse (`src/pages/Warehouse.tsx`)

---

# Overview

The Warehouse module manages physical storage facilities, inventory allocations, and stock transfers across the **Shop** / **FreshFlow** operations infrastructure.

It maintains records for physical warehouses (location name, facility code, address, active status) and logs all inbound, outbound, transfer, and adjustment movements into the immutable `warehouse_stock_movements` ledger.

---

# Purpose

The purpose of this module is to:

* Manage multiple physical storage facilities and fulfillment centers.
* Record immutable stock movement transactions (`Inbound`, `Outbound`, `Transfer`, `Adjustment`).
* Track stock quantities per warehouse facility.
* Connect physical stock locations to regional delivery zones and shipping methods.


---

# Business Goals

The Warehouse module aims to:

* Simplify warehouse management.
* Organize physical product storage.
* Improve inventory accuracy.
* Support efficient stock handling.
* Prepare the platform for future warehouse expansion.
* Provide reliable warehouse information across the platform.

---

# Users

The following users can access this module.

## Business Owner

Can:

* View warehouse information.
* Update warehouse information.
* View warehouse stock.
* Receive stock.
* Dispatch stock.
* View stock movement history.

---

## Buyer

Buyers do not have direct access to the Warehouse module.

Warehouse operations remain internal to the business.

---

## Future Roles

The architecture is designed to support:

* Warehouse Manager
* Warehouse Staff
* Inventory Manager
* Sales Executive
* Platform Administrator

Additional permissions can be introduced without changing the overall module architecture.

---

# Permissions

## Business Owner

Can:

* View warehouse information.
* Update warehouse information.
* Receive stock.
* Dispatch stock.
* View warehouse stock.
* View stock movement history.

Cannot:

* Permanently delete warehouse records.

---

## Buyer

Cannot:

* View warehouse information.
* View warehouse stock.
* Receive stock.
* Dispatch stock.
* Modify warehouse information.

---

# Features

Version 1.0 includes:

## Warehouse Information

* Warehouse Name
* Warehouse Code (Optional)
* Description (Optional)
* Address
* Contact Person (Optional)
* Contact Number (Optional)
* Warehouse Status

---

## Warehouse Operations

Business owners can:

* View stored products.
* View warehouse stock.
* Receive stock.
* Dispatch stock.
* View basic stock movement history.

---

## Warehouse Status

Warehouses may have one of the following statuses:

* Active
* Inactive

Only active warehouses can receive and dispatch stock.

---

# Business Rules

The Warehouse module follows these business rules:

* Every warehouse belongs to one company.
* Version 1.0 supports one warehouse per company.
* Every inventory record belongs to one warehouse.
* Warehouse Name is required.
* Warehouse Address is required.
* Warehouse Status is required.
* Only authorized users can manage warehouse information.
* Inactive warehouses cannot receive or dispatch stock.
* Warehouse information is shared across business modules.
* Warehouse records are archived instead of permanently deleted.

---

# Dependencies

The Warehouse module depends on:

* Authentication Module
* User Profile Module
* Company Module
* Products Module
* Inventory Module

The following modules depend on Warehouse:

* Orders
* Reports

---

# Database

Version 1.0 uses:

## Table

* warehouses

Typical information stored includes:

* Warehouse Name
* Warehouse Code
* Description
* Address
* Contact Person
* Contact Number
* Warehouse Status
* Company
* Created Date
* Updated Date

Inventory quantities remain managed by the Inventory module.

---

# API

The Warehouse module provides APIs for:

* Get Warehouse Information
* Update Warehouse Information
* Get Warehouse Stock
* Receive Stock
* Dispatch Stock
* Get Stock Movement History

Detailed API specifications are documented in **API.md**.

---

# Security

Security requirements include:

* Authentication required for warehouse management.
* Server-side authorization.
* Input validation.
* Protected warehouse operations.
* Audit-ready stock movement history.

Buyers cannot access warehouse information or warehouse operations.

---

# Future Roadmap

Future versions may include:

* Multiple warehouses
* Warehouse zones
* Shelf and bin locations
* Inter-warehouse stock transfers
* Warehouse managers
* Barcode and QR code scanning
* Batch and lot tracking
* Expiry date tracking
* Advanced receiving workflows
* Warehouse performance analytics

These features are intentionally excluded from Version 1.0 to keep warehouse management simple.

---

# Related Modules

The Warehouse module works with:

* Company
* Products
* Inventory
* Orders
* Reports

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

Initial Warehouse module documentation.

Focus areas:

* Simple warehouse management.
* Single warehouse support.
* Organized physical stock storage.
* Foundation for future multi-warehouse operations.
