# Database Schema Specification

**Version:** 2.0

**Status:** Active

**Last Updated:** 2026-09-20

---

## 1. Overview

The application uses PostgreSQL as its relational database, managed via **Drizzle ORM** (`drizzle-orm`). The schema definitions are centralized in `db/schema.ts` and relational associations in `db/relations.ts`.

---

## 2. PostgreSQL Enum Inventory

All custom pgEnum types declared in `db/schema.ts`:

| Enum Name | Allowed Values |
| --- | --- |
| `auth_provider` | `local`, `google`, `mobile` |
| `role` | `user`, `admin` |
| `address_type` | `shipping`, `billing`, `warehouse`, `both`, `home`, `work`, `other` |
| `company_type` | `buyer`, `supplier`, `both` |
| `payment_terms` | `net_15`, `net_30`, `net_60`, `cod`, `prepaid` |
| `unit_type` | `kg`, `gram`, `box`, `crate`, `pallet`, `ton`, `piece`, `dozen`, `bunch`, `bag`, `case`, `pack`, `lb`, `oz` |
| `grade` | `premium`, `grade_a`, `grade_b`, `standard` |
| `product_status`| `active`, `inactive`, `draft`, `archived`, `out_of_stock` |
| `order_status` | `pending`, `confirmed`, `processing`, `packed`, `ready_for_dispatch`, `out_for_delivery`, `delivered`, `cancelled`, `refunded` |
| `delivery_estimate` | `same_day`, `next_day`, `within_2_days`, `within_3_5_days`, `within_week`, `custom` |
| `invoice_status` | `draft`, `issued`, `paid`, `partially_paid`, `overdue`, `void`, `cancelled` |
| `payment_status` | `pending`, `authorized`, `paid`, `partially_paid`, `failed`, `refunded` |
| `payment_method` | `bank_transfer`, `upi`, `cheque`, `cash`, `credit`, `cod`, `credit_card`, `debit_card`, `net_banking` |
| `user_gender` | `male`, `female`, `other`, `prefer_not_to_say` |
| `user_theme_preference` | `system`, `light`, `dark` |
| `inventory_status` | `in_stock`, `low_stock`, `out_of_stock`, `reserved`, `expired`, `damaged` |
| `warehouse_status` | `active`, `inactive`, `maintenance`, `full` |
| `warehouse_movement_type` | `inbound`, `outbound`, `transfer`, `adjustment`, `return`, `loss`, `recount` |

---

## 3. Table Inventory (18 Tables)

### User & Authentication
1. **`users` (`users`)**: Authenticated user accounts, hashed passwords, roles (`user`, `admin`), optional company association, gender, theme preference, timestamps.
2. **`otp_verifications` (`otp_verifications`)**: Mobile OTP verification challenges, code hashes, and expiration timestamps.
3. **`user_addresses` (`user_addresses`)**: Saved delivery and billing addresses for users, including contact names, phone numbers, state, pincode, and default flags.

### Organizations & Customers
4. **`companies` (`companies`)**: B2B entities (`buyer`, `supplier`, `both`), credit limits, payment terms, GSTIN/PAN numbers, verification status.
5. **`customers` (`customers`)**: CRM customer directory linking supplier to buyer company, tracking balance and active status.

### Catalog & Food Taxonomy
6. **`categories` (`categories`)**: Halal food and product categories, hierarchical parent IDs, slug, icon names, display ordering, and active flags.
7. **`products` (`products`)**: Catalog items, SKU, name, description, category ID, supplier ID, base price, unit type, minimum order quantity, halal badges, image URLs, organic flags, and marketplace visibility controls.

### Cart & Orders
8. **`cart_items` (`cart_items`)**: User-scoped shopping cart items, product IDs, quantities, and notes.
9. **`orders` (`orders`)**: Master purchase orders tracking status lifecycle, total amount, shipping fees, tax amount, delivery zone ID, warehouse ID, shipping method ID, GST configuration ID, payment status, payment method, Razorpay payment ID, and snapshot address.
10. **`order_items` (`order_items`)**: Immutable line items captured at checkout with product names, units, quantities, unit prices, and line totals.

### Invoicing & Billing
11. **`invoices` (`invoices`)**: GST-compliant tax invoices, buyer/supplier tax snapshots, subtotal, CGST, SGST, IGST, total amounts, and payment status.
12. **`invoice_items` (`invoice_items`)**: Immutable item snapshots linked to invoice headers.

### Inventory & Warehousing
13. **`inventory` (`inventory`)**: Multi-warehouse stock tracking per product (`quantityOnHand`, `quantityReserved`, `quantityAvailable`, `reorderLevel`, `reorderQuantity`, `warehouseLocation`, `batchNumber`, `expiryDate`, `inventoryStatus`).
14. **`warehouses` (`warehouses`)**: Physical facility records with company ownership, address, total capacity units, and used capacity units.
15. **`warehouse_stock_movements` (`warehouse_stock_movements`)**: Immutable audit log for all stock inbound/outbound movements, order linkages, and user attribution.

### Delivery & Tax Configuration
16. **`delivery_zones` (`delivery_zones`)**: Geographical zones mapped by state with delivery estimates and fee structures.
17. **`gst_configurations` (`gst_configurations`)**: Category-specific tax rules, HSN codes, and tax rates.
18. **`shipping_methods` (`shipping_methods`)**: Warehouse and zone shipping options with free shipping minimum order thresholds.

---

## 4. Key Relationships & Foreign Keys

- `users.companyId` → `companies.id`
- `user_addresses.userId` → `users.id`
- `customers.supplierCompanyId` → `companies.id`
- `customers.buyerCompanyId` → `companies.id`
- `categories.parentId` → `categories.id`
- `products.categoryId` → `categories.id`
- `products.supplierId` → `companies.id`
- `cart_items.userId` → `users.id`
- `cart_items.productId` → `products.id`
- `orders.buyerId` → `companies.id`
- `orders.supplierId` → `companies.id`
- `orders.userId` → `users.id`
- `orders.warehouseId` → `warehouses.id`
- `orders.deliveryZoneId` → `delivery_zones.id`
- `orders.shippingMethodId` → `shipping_methods.id`
- `orders.gstConfigurationId` → `gst_configurations.id`
- `order_items.orderId` → `orders.id`
- `order_items.productId` → `products.id`
- `invoices.orderId` → `orders.id`
- `invoice_items.invoiceId` → `invoices.id`
- `inventory.productId` → `products.id`
- `inventory.supplierId` → `companies.id`
- `inventory.warehouseId` → `warehouses.id`
- `warehouse_stock_movements.warehouseId` → `warehouses.id`
- `warehouse_stock_movements.productId` → `products.id`
- `warehouse_stock_movements.orderId` → `orders.id`
- `shipping_methods.warehouseId` → `warehouses.id`
- `shipping_methods.deliveryZoneId` → `delivery_zones.id`
