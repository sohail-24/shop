# Orders Module

**Version:** 2.0

**Status:** Active

**Module:** Orders
- Administrative List: `src/pages/Orders.tsx` (`/orders`)
- Administrative Detail: `src/pages/OrderDetail.tsx` (`/orders/:id`)

---

# Overview

The Orders module manages the complete lifecycle of customer orders within **Shah's Halal** and the **Shop** administrative platform.

It is responsible for converting a customer's shopping cart into a verified purchase order following secure Razorpay payment authorization, tracking order preparation and delivery milestones, recording delivery addresses, and preserving an immutable snapshot of purchased dishes and items.

---

# Purpose

The purpose of this module is to:

* Process and store customer orders placed through the online storefront.
* Verify Razorpay payment signatures cryptographically using HMAC-SHA256 (`timingSafeEqual`).
* Preserve immutable line-item price and quantity snapshots to protect against future menu changes.
* Track order fulfillment states (Pending, Confirmed, Shipped, Delivered, Cancelled).
* Provide administrative inspection, search, and status updating at `/orders` and `/orders/:id`.


---

# Business Goals

The Orders module aims to:

* Simplify wholesale order processing.
* Provide accurate order records.
* Prevent historical order changes.
* Improve customer order tracking.
* Support business operations from purchase to delivery.
* Provide a strong foundation for invoices, reports, and analytics.

---

# Users

The following users can access this module.

## Business Owner

Can:

* View all orders.
* View order details.
* Update order status.
* Update delivery estimates.
* Cancel orders.
* Monitor order progress.

---

## Buyer

Can:

* View their own orders.
* View order details.
* Track order progress.
* View delivery estimates.

Buyers cannot modify order information.

---

## Future Roles

The architecture is designed to support:

* Order Manager
* Sales Executive
* Warehouse Staff
* Delivery Staff
* Platform Administrator

Additional permissions can be introduced without changing the overall module architecture.

---

# Permissions

## Business Owner

Can:

* View all orders.
* Update order status.
* Update delivery estimates.
* Cancel orders.
* View complete customer order history.

Cannot:

* Permanently delete orders through the user interface.

---

## Buyer

Can:

* View their own orders.
* Track order progress.
* View delivery estimates.

Cannot:

* Modify orders.
* Change order status.
* Cancel completed orders.
* View other customers' orders.

---

# Features

Version 1.0 includes:

## Order Information

* Order Number
* Order Date
* Customer
* Company
* Order Items
* Order Total
* Payment Status
* Order Status
* Delivery Estimate
* Delivery Address
* Customer Notes (Optional)

---

## Order Status

Business owners can manage orders using the following workflow:

* Pending
* Confirmed
* Packed
* Ready for Dispatch
* Out for Delivery
* Delivered
* Cancelled

Order status represents the current stage of order fulfilment.

---

## Delivery Estimate

Business owners can set the expected delivery time for each order.

Supported delivery estimates include:

* Same Day
* Next Day
* Within 2 Days
* Within 3–5 Days

Future versions may support scheduled delivery dates and automated delivery estimation.

Delivery estimates help buyers understand when their order is expected to arrive and are independent of the order status.

---

## Order Snapshot

Every order stores a snapshot of purchased product information at the time the order is created.

The snapshot typically includes:

* Product Name
* Product Price
* Unit
* Quantity
* Total Price

Changes made to products after an order is placed do not affect historical orders.

This ensures that every order remains an accurate historical record.

---

# Business Rules

The Orders module follows these business rules:

* Every order belongs to one company.
* Every order belongs to one buyer.
* Every order contains one or more order items.
* Order numbers must be unique.
* Orders cannot exist without products.
* Product information is copied into order snapshots when an order is created.
* Product changes do not modify existing orders.
* Order totals are calculated when the order is created.
* Order status follows the defined business workflow.
* Delivery estimates may be updated by the business owner.
* Delivered orders cannot be edited.
* Orders are archived instead of permanently deleted.
* Order information is shared across reporting and analytics modules.

---

# Dependencies

The Orders module depends on:

* Authentication Module
* User Profile Module
* Company Module
* Categories Module
* Products Module
* Inventory Module

The following modules depend on Orders:

* Invoices
* Reports
* Dashboard

---

# Database

Version 1.0 uses:

## Tables

* orders
* order_items

Typical information stored includes:

### orders

* Order Number
* Buyer
* Company
* Order Status
* Delivery Estimate
* Payment Status
* Order Total
* Delivery Address
* Created Date
* Updated Date

### order_items

* Product Snapshot
* Product Name
* Product Price
* Quantity
* Unit
* Line Total

Order item snapshots preserve historical product information independently from the Products module.

---

# API

The Orders module provides APIs for:

* Get Order List
* Get Order Details
* Create Order
* Update Order Status
* Update Delivery Estimate
* Cancel Order
* Get Customer Orders

Detailed API specifications are documented in **API.md**.

---

# Security

Security requirements include:

* Authentication required for order access.
* Server-side authorization.
* Buyers can only access their own orders.
* Business owners can manage company orders.
* Protected order updates.
* Audit-ready order history.
* Immutable product snapshots after order creation.

---

# Future Roadmap

Future versions may include:

* Invoice generation
* Payment gateway integration
* Partial shipments
* Split orders
* Returns and refunds
* Courier integration
* Delivery partner assignment
* Scheduled delivery dates
* Tax calculation
* Discount and coupon support
* Automated delivery estimation
* Order notifications
* Order approval workflow
* Purchase order export

These features are intentionally excluded from Version 1.0 to keep order management simple.

---

# Related Modules

The Orders module works with:

* Company
* User Profile
* Categories
* Products
* Inventory
* Invoices
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

## Version 2.0 (2026-09-20)
- Documented active administrative routes (`/orders`, `/orders/:id`).
- Documented Razorpay payment flow integration, HMAC signature verification, and guest storefront ordering.

## Version 1.0
- Initial Orders module documentation.

