# Owner / Administrative Dashboard

**Version:** 2.0

**Status:** Active

**Page:** Owner Dashboard (`src/pages/Dashboard.tsx`)

---

# Overview

The Owner Dashboard is the primary operational workspace for platform administrators and business operators of **Shop** / **FreshFlow**.

It provides an executive overview of daily business operations, enabling managers to track revenue, manage orders, review stock levels across physical warehouses, generate tax invoices, configure tax and delivery rules, and drill down into individual business modules.

Access is restricted to authenticated administrators who log in via `/admin/login`.

---

# Purpose

The Owner Dashboard exists to:

* Provide complete operational visibility into daily restaurant and wholesale performance.
* Display key metrics (Total Revenue, Active Orders, Low Stock Alerts, Total Customers).
* Enable quick navigation to all 12 operational sub-modules:
  - Products (`/products`, `/products/new`)
  - Categories (`/categories`)
  - Orders (`/orders`)
  - Invoices (`/invoices`)
  - Inventory (`/inventory`)
  - Warehouse Management (`/warehouse`)
  - Customers (`/customers`)
  - Delivery Zones (`/delivery-zones`)
  - GST Configuration (`/gst-rules`)
  - Shipping Rules (`/shipping-rules`)
  - Business Reports (`/reports`)
  - Settings (`/settings`)

---

# User Roles & Security

## Guest Customer

Cannot access the Owner Dashboard. Attempts to visit `/dashboard` redirect unauthenticated visitors to `/admin/login`.

---

## Administrator (Store Manager / Owner)

Authenticated via `trpc.auth.loginAdmin`. Has full read/write access to all management modules, analytics reports, and system settings.

* Manage inventory.
* Manage customer orders.
* Manage customers.
* Review business reports.
* Configure business settings.
* Monitor system health.

---

# Page Goals

The Owner Dashboard aims to:

* Present the overall health of the business.
* Surface the most important operational information.
* Reduce the number of clicks required to access common tasks.
* Highlight issues requiring immediate attention.
* Support efficient daily business management.
* Provide a responsive experience across all supported devices.

---

# Navigation

Business Owners can navigate to:

* Product Catalog
* Categories
* Inventory
* Orders
* Customers
* Delivery Zones
* GST Rules
* Shipping Rules
* Coupons
* Reports
* Notifications
* Staff
* Settings

---

# Page Layout

The page is organised into the following sections:

1. Header Navigation
2. Sidebar Navigation
3. Welcome Section
4. Business KPI Cards
5. Sales Analytics
6. Recent Activity
7. Quick Actions
8. System Status

---

# Page Sections

## Header Navigation

Displays:

* FreshFlow Logo
* Global Search
* Notifications
* Profile Menu

Provides quick access to commonly used owner functions.

---

## Sidebar Navigation

Provides navigation to all business management modules.

Modules include:

* Dashboard
* Product Catalog
* Categories
* Inventory
* Orders
* Customers
* Delivery Zones
* GST Rules
* Shipping Rules
* Coupons
* Reports
* Notifications
* Staff
* Settings

The sidebar remains consistent throughout the Business Owner experience.

---

## Welcome Section

Displays:

* Welcome Message
* Business Name (Future Enhancement)
* Short operational summary

The welcome section introduces the daily business workspace.

---

## Business KPI Cards

Displays important business metrics such as:

* Total Products
* Total Orders
* Total Customers
* Revenue
* Low Stock Products
* Pending Orders
* Suppliers
* Active Coupons

These KPIs provide an immediate snapshot of business performance.

---

## Sales Analytics

Displays business performance using charts and summary metrics.

Typical analytics include:

* Sales Trends
* Revenue Overview
* Order Trends

Charts help owners monitor business growth over time.

---

## Recent Activity

Displays recent operational events including:

* Recent Orders
* Low Stock Alerts
* Recent Customers
* Notifications

Recent activity helps owners identify business events that may require attention.

---

## Quick Actions

Provides shortcuts to frequently used operations.

Typical actions include:

* Add Product
* Add Category
* Add Supplier
* Create Coupon
* Manage Inventory
* Configure Delivery Zones
* Configure GST Rules
* Configure Shipping Rules

Quick Actions reduce navigation time for common administrative tasks.

---

## System Status

Displays the operational health of connected services.

Typical indicators include:

* Database
* Server
* Payment Service
* WhatsApp Integration
* Email Service
* Storage

The dashboard provides status visibility only. Configuration is managed within the appropriate system modules.

---

# User Interactions

Business Owners can:

* Navigate between modules.
* Review business metrics.
* Monitor sales performance.
* Review recent activity.
* Respond to operational alerts.
* Launch common administrative tasks.
* Access notifications.
* Manage profile settings.

---

# Business Modules Used

The Owner Dashboard integrates information from the following modules.

## Company Module

Provides:

* Business identity.
* Business configuration.

---

## Product Catalog Module

Provides:

* Product statistics.
* Product management entry point.

---

## Categories Module

Provides:

* Category statistics.

---

## Inventory Module

Provides:

* Stock information.
* Low stock alerts.

---

## Orders Module

Provides:

* Order statistics.
* Recent orders.
* Pending orders.

---

## Customers Module

Provides:

* Customer statistics.
* Recent customer activity.

---

## Delivery Zones Module

Provides:

* Delivery configuration summary.

---

## GST Rules Module

Provides:

* Tax configuration summary.

---

## Shipping Rules Module

Provides:

* Shipping configuration summary.

---

## Coupons Module

Provides:

* Coupon statistics.

---

## Reports Module

Provides:

* Sales analytics.
* Business reporting.

---

## Notifications Module

Provides:

* Business notifications.
* Operational alerts.

---

## Staff Module

Provides:

* Staff management summary.

---

## Settings Module

Provides:

* Business configuration access.

---

## Authentication Module

Provides:

* Secure owner authentication.
* Session management.

---

# Business Rules

The Owner Dashboard follows these page-level rules:

* Only authenticated Business Owners may access the dashboard.
* Dashboard information is read-only.
* Business metrics update dynamically as underlying data changes.
* Navigation shortcuts do not modify business data.
* Operational alerts are informational until acted upon.
* Dashboard widgets display only information relevant to the authenticated business.
* Module-specific business logic remains within the corresponding business module.

---

# Responsive Behaviour

## Desktop

* Permanent sidebar navigation.
* Multi-column KPI layout.
* Large analytics panels.
* Multiple information widgets displayed simultaneously.

---

## Tablet

* Collapsible sidebar.
* Responsive KPI cards.
* Two-column content layout.
* Touch-friendly controls.

---

## Mobile

* Drawer navigation.
* Stacked KPI cards.
* Simplified analytics.
* Single-column widgets.
* Full-width quick action buttons.

---

# Design Principles

The Owner Dashboard follows these principles:

* Business-first design.
* Operational visibility.
* Information hierarchy.
* Fast navigation.
* Action-oriented interface.
* Responsive experience.
* Consistent module access.
* Minimal cognitive load.

---

# Accessibility

The page should support:

* Keyboard navigation.
* Screen reader compatibility.
* Accessible navigation menus.
* Accessible dashboard widgets.
* Visible keyboard focus.
* Sufficient colour contrast.
* Accessible charts and KPI cards.

---

# Future Enhancements

Future versions may include:

* AI Business Insights.
* Revenue Forecasting.
* Smart Inventory Recommendations.
* Business Health Score.
* Live Activity Feed.
* Custom Dashboard Widgets.
* Drag-and-drop Dashboard Layout.
* Multi-store Dashboard.
* Advanced Analytics.
* Scheduled Reports.
* Goal Tracking.

These features are intentionally excluded from Version 1.0 to maintain a focused and efficient business management experience.

---

# Related Pages

The Owner Dashboard connects with:

* Product Catalog
* Categories
* Inventory
* Orders
* Customers
* Delivery Zones
* GST Rules
* Shipping Rules
* Coupons
* Reports
* Notifications
* Staff
* Settings

---

# Documentation

This page includes:

* README.md
* ASCII.md
* FLOW.md

Business logic for products, inventory, orders, customers, reporting, notifications, and all management modules is documented within their respective business modules and is intentionally not duplicated in this page documentation.

---

# Version History

## Version 1.0

Initial Owner Dashboard page documentation.

Focus areas:

* Business overview.
* Operational visibility.
* KPI monitoring.
* Sales analytics.
* Recent business activity.
* Quick administrative actions.
* Responsive business management workspace.
