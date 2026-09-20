# Customer About Page / Shah's Halal

**Version:** 1.0

**Status:** Active

**Page:** Customer About Page (`src/pages/AboutPage.tsx`)

---

# Overview

The Customer About Page is the dedicated brand storytelling and Halal transparency destination for the **Shah's Halal** storefront (`/about`).

Designed specifically for customer trust, the page presents the restaurant's culinary heritage, strict Halal standards, quality pillars, interactive FAQ accordion, and direct store contact information.

It integrates seamlessly with the fixed `CustomerBottomNav` and deliberately omits redundant top navigation bars to maintain clean vertical hierarchy.

---

# Core Sections & Content Architecture

### 1. Brand Hero & Mission
- **Heading:** "Authentic Halal Cuisine Crafted with Care"
- **Mission Statement:** Articulates the brand promise of combining authentic recipes, pure Halal ingredients, and warm hospitality.
- **Visual Presentation:** Clean, high-contrast typography framed by emerald and amber accent badges.

### 2. Halal Verification & Certification Standards
- **Authenticity Banner:** Reassures customers with explicit certification points:
  - 100% Zabiha Halal Certified meats.
  - Strict hand-slaughtered protocols.
  - Complete zero-tolerance for pork or alcohol products.
  - Regular third-party vendor audits and supply chain traceability.

### 3. Four Quality Pillars
1. **Premium Halal Meats:** 100% certified chicken, lamb, and beef sourced exclusively from verified ethical suppliers.
2. **Farm-Fresh Produce:** Crisp salads, vine-ripened tomatoes, and fresh herbs sourced daily.
3. **Proprietary Spice Blends:** Signature seasoning blends ground in-house for distinctive marinades and sauces.
4. **Fresh Daily Preparation:** Slow-simmered sauces, freshly cooked basmati rice, and made-to-order platters.

### 4. Interactive Halal FAQ Accordion
Implemented with `@radix-ui/react-collapsible` for accessible interaction:
- **Q:** How do you verify your meat is 100% Halal?
  - **A:** Details strict supplier documentation, Zabiha slaughter protocols, and batch verification.
- **Q:** Do you use separate cooking stations?
  - **A:** Confirms entire facility is 100% Halal with zero pork or cross-contamination risk.
- **Q:** Are your sauces gluten-free or allergen-friendly?
  - **A:** Outlines ingredient transparency for signature white, hot, and BBQ sauces.
- **Q:** Do you offer catering for events?
  - **A:** Details custom family platters, corporate events, and party packaging.

### 5. Store Information & Contact
- **Physical Address:** Prominently displays storefront address.
- **Opening Hours:** Lists operational hours for pickup and delivery.
- **Direct Contact:** Verified phone and customer support email channels.

---

# Technical Details

- **File Path:** `src/pages/AboutPage.tsx`
- **Routing:** Mapped in `src/App.tsx` under `<Route path="/about" element={<AboutPage />} />`
- **Navigation Integration:** Directly linked as the 4th tab ("About") in `src/components/CustomerBottomNav.tsx`.
- **Top Header Status:** Redundant top action bar removed to avoid visual clutter and duplication with the bottom navigation.
