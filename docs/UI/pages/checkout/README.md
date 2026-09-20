# Checkout / Shah's Halal

**Version:** 2.0

**Status:** Active

**Page:** Checkout (`src/pages/Checkout.tsx`)

---

# Overview

The Checkout page is the final step in the customer purchasing journey before an order is placed.

It collects customer delivery details (full name, phone number, delivery address, city, pincode), calculates final shipping and tax totals, and triggers the **Razorpay** payment modal. Upon successful client-side authorization, the payment signature is cryptographically verified on the backend before the order is persisted.

---

# Purpose

The Checkout page exists to:

* Collect customer delivery contact information.
* Display the itemized order summary, delivery fee, and applicable GST.
* Initiate the Razorpay checkout process via `trpc.order.createRazorpayOrder`.
* Securely process payments with timing-safe HMAC-SHA256 signature verification.
* Provide an immediate order confirmation and receipt upon completion.

---

# User Roles & Capabilities

## Guest Customer (Default Experience)

Can:

* Access `/checkout` with items from the guest cart.
* Input delivery address and contact information.
* Initiate payment through Razorpay modal.
* Complete order placement and view the order confirmation summary.

---

## Administrator

Can:

* Complete test checkouts to verify payment processing and order pipeline integrity.
* Inspect all completed orders within the `/orders` administrative dashboard.

Business Owners do not place customer orders through this page.

---

# Page Goals

The Checkout page aims to:

* Simplify the order submission process.
* Minimise data entry.
* Reduce checkout abandonment.
* Display complete order information before submission.
* Prevent invalid delivery requests.
* Create a reliable purchase order.

---

# Navigation

Users can navigate to:

* Shopping Cart
* Authentication
* Orders (after successful order creation)

The Back action returns users to the Shopping Cart without losing entered information whenever possible.

---

# Page Layout

The page is organised into the following sections:

1. Navigation Header
2. Shipping Information
3. Delivery Address
4. Delivery Slot
5. Order Notes
6. Order Summary
7. Delivery Summary
8. Confirmation
9. Review & Place Order

---

# Page Sections

## Navigation Header

Displays:

* Back Navigation
* Checkout Title

---

## Shipping Information

Collects:

* Contact Person Name
* Mobile Number

These details are used for delivery communication.

---

## Delivery Address

Collects:

* State
* City
* Delivery Address
* Landmark (Optional)

Delivery addresses must fall within the company's supported delivery areas.

---

## Delivery Slot

Buyers may optionally choose:

* Morning
* Afternoon
* Evening

If no delivery slot is selected, the earliest available delivery schedule is used.

---

## Order Notes

Allows buyers to enter optional delivery instructions.

Examples include:

* Delivery timing preferences.
* Site instructions.
* Contact guidance.

---

## Order Summary

Displays:

* Selected Products
* Product Quantities
* Unit Prices
* Subtotal
* Estimated Total

The summary is read-only and reflects the current shopping cart.

---

## Delivery Summary

Displays:

* Estimated Delivery
* Delivery Area
* Delivery Availability

Delivery information is provided using the Company module's delivery configuration.

---

## Confirmation

Buyers must confirm:

* Delivery information is correct.
* Terms and Conditions are accepted.

Both confirmations are required before placing an order.

---

## Review & Place Order

Creates the purchase order.

Once submitted, buyers are redirected to the Orders page.

---

# User Interactions

Users can:

* Enter shipping information.
* Select delivery location.
* Choose a delivery slot.
* Add delivery notes.
* Review order details.
* Confirm delivery information.
* Accept Terms and Conditions.
* Submit the order.

---

# Business Modules Used

The Checkout page uses the following business modules.

## Products Module

Provides:

* Product information.
* Pricing.
* Units.
* Product quantities.

---

## Company Module

Provides:

* Delivery configuration.
* Supported delivery states.
* Business information.

---

## Authentication Module

Provides:

* Buyer authentication.
* Secure access to checkout.

---

## Orders Module

Provides:

* Purchase order creation.
* Order numbering.
* Initial order status.

---

# Business Rules

The Checkout page follows these page-level rules:

* Only authenticated buyers may access checkout.
* Orders must contain at least one product.
* Delivery is available only within supported delivery areas.
* Required shipping fields must be completed.
* Contact Person Name is required.
* Mobile Number is required.
* State is required.
* City is required.
* Delivery Address is required.
* Terms and Conditions must be accepted.
* Order information is read-only during checkout.
* Product modifications must be performed in the Shopping Cart.
* Successfully submitted orders are redirected to the Orders page.

---

# Responsive Behaviour

## Desktop

* Two-column layout.
* Checkout form displayed on the left.
* Sticky order summary displayed on the right.
* Review & Place Order remains visible.

---

## Tablet

* Form displayed above the order summary.
* Large touch-friendly controls.
* Responsive address fields.

---

## Mobile

* Single-column layout.
* Full-width input fields.
* Large touch targets.
* Order summary displayed below the form.
* Full-width Review & Place Order button.

---

# Design Principles

The Checkout page follows these principles:

* Simple and focused checkout.
* Minimal data entry.
* Clear delivery information.
* Complete order visibility.
* Mobile-first responsiveness.
* Accessible form controls.
* Reliable order submission.

---

# Accessibility

The page should support:

* Keyboard navigation.
* Screen reader compatibility.
* Accessible form labels.
* Visible keyboard focus.
* Accessible checkbox controls.
* Error messages associated with fields.
* Sufficient colour contrast.

---

# Future Enhancements

Future versions may include:

* Saved delivery addresses.
* Multiple delivery addresses.
* Interactive map selection.
* Delivery charge calculation.
* Coupon and promotional codes.
* Tax calculation.
* Payment gateway integration.
* Digital invoices.
* Scheduled delivery dates.
* Address auto-completion.

These features are intentionally excluded from Version 1.0 to maintain a simple and reliable checkout experience.

---

# Related Pages

The Checkout page connects with:

* Shopping Cart
* Authentication
* Orders

---

# Documentation

This page includes:

* README.md
* ASCII.md
* FLOW.md

Business logic for products, delivery configuration, authentication, and order processing is documented within their respective business modules and is intentionally not duplicated in this page documentation.

---

# Version History

## Version 1.0

Initial Checkout page documentation.

Focus areas:

* Delivery information.
* Order review.
* Delivery validation.
* Order summary.
* Confirmation workflow.
* Purchase order creation.
* Responsive checkout experience.
