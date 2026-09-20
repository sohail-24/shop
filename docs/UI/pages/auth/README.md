# Authentication / Admin Login

**Version:** 2.0

**Status:** Active

**Pages:**
- Active: `/admin/login` (`src/pages/AdminLogin.tsx`)
- Redirected: `/login`, `/register`, `/auth` (Redirect to `/`)

---

# Overview

The active authentication interface is the **Admin Login** page (`src/pages/AdminLogin.tsx`), which provides administrative ERP access to authorized platform operators.

Because customer ordering operates in an unauthenticated guest mode (`src/lib/guestCart.ts`), customer authentication routes (`/login`, `/register`, `/auth`) automatically redirect users back to the storefront (`/`).

---

# Purpose

The Admin Login page exists to:

* Provide a secure credentials prompt (Email and Password) for administrative personnel.
* Authenticate against `ADMIN_EMAIL` and `ADMIN_PASSWORD` via `trpc.auth.loginAdmin`.
* Set secure HTTP-only cookies (`shop_admin_access`, `shop_admin_refresh`) and persist the JWT in client storage.
* Redirect authenticated administrators to the operational ERP dashboard (`/dashboard`).

---

# User Roles & Experience

## Administrative Operator

Can:

* Enter administrator email and password.
* Authenticate securely with timing-safe backend verification.
* Access the operations dashboard (`/dashboard`), inventory, warehouse management, products, orders, and reports.

---

## Storefront Customer

* Customers do not need to sign in or register to browse or purchase halal food.
* If a customer attempts to visit `/login`, `/register`, or `/auth`, `src/App.tsx` routes them seamlessly to the storefront homepage (`/`).

---

# Form Validation & Feedback

- **Form Fields:** Email input (`type="email"`), Password input (`type="password"`).
- **Client Validation:** Verifies that both email and password are provided prior to submission.
- **Error States:** Displays an explicit error notification if credentials fail validation.
- **Loading State:** Disables the submission button and displays a spinner during authentication.

---

# Technical Wiring

- **Component:** `src/pages/AdminLogin.tsx`
- **Route:** `/admin/login`
- **tRPC Procedure:** `trpc.auth.loginAdmin.useMutation()`
- **Post-Login Action:** Persists JWT in `localStorage.setItem('shop_admin_token', token)` and navigates to `/dashboard`.
- **Customer Redirects:** Configured in `src/App.tsx`:
  - `<Route path="/login" element={<Navigate to="/" replace />} />`
  - `<Route path="/register" element={<Navigate to="/" replace />} />`
  - `<Route path="/auth" element={<Navigate to="/" replace />} />`


---

# Preserved Customer Auth Capability

The codebase preserves the multi-method buyer authentication UI workflows (Email Login, Mobile Password Login, and Mobile OTP verification) in code history, backed by the inactive `legacyAuthRouter`. Should user registration be re-introduced for a customer loyalty tier, the authentication components can be remounted on `/login` and `/register`.

---

# Authentication Methods

FreshFlow Version 1.0 supports:

## Email Login

Users authenticate using:

* Email Address
* Password

---

## Mobile Login

Users authenticate using:

* Mobile Number
* Password

---

## Mobile OTP Login

Users authenticate using:

* Mobile Number
* One-Time Password (OTP)

---

## Registration

New users can register using:

* Mobile Number
* Email Address

Registration requires:

* Password
* Password Confirmation
* Acceptance of Terms and Conditions

---

# Page Sections

The Authentication page contains:

## Welcome Section

Displays:

* FreshFlow branding.
* Welcome message.
* Short platform introduction.

---

## Authentication Navigation

Allows users to switch between:

* Mobile Login
* Email Login
* Registration

---

## Registration Form

Allows new users to create an account.

The form adapts based on the selected registration method.

---

## Login Form

Allows existing users to authenticate using the selected login method.

---

## Terms and Conditions

Users must accept the Terms and Conditions before registration.

---

# User Interactions

Users can:

* Select registration method.
* Switch between login methods.
* Enter authentication details.
* Request Mobile OTP.
* Verify Mobile OTP.
* Create an account.
* Sign in.
* Return to the Home Marketplace.

---

# Business Modules Used

The Authentication page uses the following business modules.

## Authentication Module

Provides:

* User registration.
* User authentication.
* Session management.
* Role resolution.
* Authorization.

---

## User Profile Module

Provides:

* User identity.
* Personal account information.
* Profile ownership after successful registration.

---

# Business Rules

The Authentication page follows these page-level rules:

* Guests can access the page without authentication.
* Authenticated users should not see the login screen unless re-authentication is required.
* Users must choose a supported authentication method.
* Registration requires password confirmation.
* Users must accept the Terms and Conditions before registration.
* Successful authentication redirects users to the appropriate destination.
* Authentication failures display clear error messages without exposing sensitive information.

---

# Responsive Behaviour

## Desktop

* Authentication card displayed in the centre of the page.
* Comfortable spacing for desktop users.

---

## Tablet

* Responsive authentication card.
* Touch-friendly controls.

---

## Mobile

* Single-column layout.
* Full-width input fields.
* Large touch targets.
* Optimised keyboard behaviour.

---

# Design Principles

The Authentication page follows these principles:

* Simple onboarding.
* Minimal visual clutter.
* Clear authentication choices.
* Secure user experience.
* Consistent branding.
* Fast interaction.
* Mobile-first responsiveness.
* Accessible interface.

---

# Accessibility

The page should support:

* Keyboard navigation.
* Visible keyboard focus.
* Screen reader compatibility.
* Accessible form labels.
* Password visibility toggle.
* Clear validation messages.
* Sufficient colour contrast.

---

# Future Enhancements

Future versions may include:

* Email Verification.
* Forgot Password.
* Reset Password.
* Social Login.
* Multi-Factor Authentication (MFA).
* Login History.
* Device Management.
* CAPTCHA protection.
* Rate limiting indicators.

These features are intentionally excluded from Version 1.0 to keep authentication simple while maintaining a production-ready foundation.

---

# Related Pages

The Authentication page connects with:

* Home Marketplace
* Buyer Dashboard
* Business Owner Dashboard
* Product Catalog
* Cart
* User Profile

---

# Documentation

This page includes:

* README.md
* ASCII.md
* FLOW.md

Authentication logic, authorization, session management, security, and JWT implementation are documented in **AUTHENTICATION.md** and should not be duplicated within this page documentation.

---

# Version History

## Version 1.0

Initial Authentication page documentation.

Focus areas:

* Simple onboarding.
* Secure authentication.
* Multiple login methods.
* Responsive user experience.
* Authentication-aware navigation.
