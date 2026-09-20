# User Profile Module

**Version:** 2.0

**Status:** Active

**Module:** Profile (`src/pages/Profile.tsx`)

---

# Overview

The User Profile module allows authenticated administrators and users to view and update their account information within **Shop** / **FreshFlow**.

It provides management of personal identity, display name, contact phone number, and profile preferences via `trpc.profile.get` and `trpc.profile.update`.


---

# Purpose

The purpose of this module is to provide every authenticated user with a secure and centralized location to:

- View personal information
- Update profile details
- Manage contact information
- Upload a profile picture
- Manage account security
- View account information
- Configure personal preferences

The module should remain simple, fast, and independent from business operations.

---

# Business Goals

The User Profile module aims to:

- Provide a professional account management experience
- Reduce duplicate user information throughout the platform
- Keep personal information separate from company information
- Improve account security
- Support future role expansion
- Serve as the identity layer for all business modules

---

# Users

The following users can access this module.

## Business Owner

Can:

- View profile
- Edit profile
- Upload profile photo
- Change password
- View account information
- Configure personal preferences

---

## Buyer

Can:

- View profile
- Edit profile
- Upload profile photo
- Change password
- View account information
- Configure personal preferences

---

## Future Roles

The architecture is designed to support:

- Manager
- Warehouse Staff
- Sales Executive
- Platform Administrator

No additional implementation is required when these roles are introduced.

---

# Permissions

Every authenticated user may access only their own profile.

Users must never:

- Edit another user's profile
- View another user's private information
- Modify another user's security settings

Platform administrators may receive additional management capabilities in future versions.

---

# Features

Version 1.0 includes:

## Personal Information

- Full Name
- Email Address
- Mobile Number
- Date of Birth (optional)
- Gender (optional)

---

## Contact Information

- Address Line
- City
- State
- Country
- Postal Code

---

## Profile Photo

Users can:

- Upload profile picture
- Replace profile picture
- Remove profile picture

If no profile picture exists, FreshFlow displays a default avatar.

---

## Security

Users can:

- Change password
- View last login
- View account creation date

Future versions will include:

- MFA
- Device Management
- Login History
- Session Management

---

## Preferences

Users can configure:

- Theme (Light / Dark / System)
- Language (Future)
- Notification Preferences (Future)

---

# Out of Scope

The following functionality belongs to other modules.

Company Information

- Company Name
- GST
- PAN
- Business Address
- Business Logo

These belong to:

Company Module

---

Orders

Purchase history belongs to:

Orders Module

---

Invoices

Invoice history belongs to:

Invoice Module

---

Reports

Reports belong to:

Reports Module

---

Warehouse

Warehouse assignment belongs to:

Warehouse Module

---

# Dependencies

This module depends on:

Authentication Module

Provides:

- Logged-in user
- JWT Authentication
- Session Validation
- Role Resolution

Database

Tables:

- users

Future:

- user_preferences

---

# Database Tables

Current

users

Future

user_preferences

user_sessions

login_history

---

# APIs

The module will expose APIs for:

- Get Current Profile
- Update Profile
- Upload Avatar
- Delete Avatar
- Change Password

API details are documented separately inside:

API.md

---

# User Experience Principles

The User Profile page should be:

- Clean
- Professional
- Minimal
- Fast
- Mobile Friendly
- Easy to navigate

The page should avoid unnecessary complexity.

Most profile updates should require no more than a few clicks.

---

# Security

The module follows FreshFlow Authentication v1.0.

Security includes:

- JWT Authentication
- HTTP-only Cookies
- Authorization Validation
- Password Hashing
- Server-side Validation

Email addresses are considered verified through the authentication process and cannot be edited in Version 1.0.

---

# Future Roadmap

Version 1.1

- Email Verification
- Mobile Verification
- Multiple Addresses
- Notification Settings

Version 1.2

- Login History
- Device Management
- Active Sessions
- MFA

Version 2.0

- Complete Identity Management
- User Preferences
- API Tokens
- Audit Logs

---

# Related Modules

Authentication

Company

Orders

Invoices

Reports

Warehouse

---

# Documentation

This module includes:

README.md

DECISIONS.md

ASCII.md

COMPONENTS.md

FLOW.md

API.md

TESTING.md

---

# Version History

Version 1.0

Initial module specification.

Architecture completed.

Implementation pending.
