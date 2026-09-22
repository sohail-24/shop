import {
  pgTable,
  bigserial,
  varchar,
  text,
  timestamp,
  numeric,
  integer,
  bigint,
  pgEnum,
  index,
  uniqueIndex,
  boolean,
  customType,
} from "drizzle-orm/pg-core";

export const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
  toDriver(val: Buffer): Buffer {
    return Buffer.isBuffer(val) ? val : Buffer.from(val);
  },
  fromDriver(val: unknown): Buffer {
    if (Buffer.isBuffer(val)) return val;
    return Buffer.from(val as any);
  },
});

export const authProviderEnum = pgEnum("authProvider", ["local", "mobile"]);
export const userRoleEnum = pgEnum("role", ["user", "admin"]);
export const addressTypeEnum = pgEnum("addressType", ["home", "work", "other"]);
export const companyTypeEnum = pgEnum("company_type", [
  "supplier",
  "buyer",
  "both",
]);
export const paymentTermsEnum = pgEnum("paymentTerms", [
  "net_15",
  "net_30",
  "net_45",
  "net_60",
  "cod",
  "prepaid",
]);
export const unitTypeEnum = pgEnum("unitType", [
  "kg",
  "lb",
  "case",
  "pallet",
  "each",
  "bunch",
  "box",
  "bag",
]);
export const productGradeEnum = pgEnum("grade", [
  "premium",
  "grade_a",
  "grade_b",
  "standard",
]);
export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "packed",
  "ready_for_dispatch",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);
export const deliveryEstimateEnum = pgEnum("delivery_estimate", [
  "same_day",
  "next_day",
  "within_2_days",
  "within_3_5_days",
]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["generated"]);
export const paymentStatusEnum = pgEnum("paymentStatus", [
  "pending",
  "authorized",
  "paid",
  "partially_paid",
  "refunded",
  "failed",
]);
export const paymentMethodEnum = pgEnum("paymentMethod", ["upi", "cod"]);
export const userGenderEnum = pgEnum("user_gender", [
  "male",
  "female",
  "other",
  "prefer_not_to_say",
]);
export const userThemePreferenceEnum = pgEnum("user_theme_preference", [
  "system",
  "light",
  "dark",
]);
export const inventoryStatusEnum = pgEnum("inventory_status", [
  "in_stock",
  "low_stock",
  "out_of_stock",
]);
export const warehouseStatusEnum = pgEnum("warehouse_status", [
  "active",
  "inactive",
]);
export const warehouseMovementTypeEnum = pgEnum("warehouse_movement_type", [
  "receive",
  "dispatch",
]);
export const customerStatusEnum = pgEnum("customer_status", [
  "active",
  "inactive",
  "blocked",
]);
export const gstConfigStatusEnum = pgEnum("gst_config_status", [
  "active",
  "inactive",
]);
export const shippingMethodStatusEnum = pgEnum("shipping_method_status", [
  "active",
  "inactive",
]);
export const otpPurposeEnum = pgEnum("purpose", ["login"]);

// ─────────────────────────────────────────────────────────────
// USERS — Extended from auth with company association
// ─────────────────────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    unionId: varchar("unionId", { length: 255 }).notNull().unique(),
    authProvider: authProviderEnum("authProvider")
      .default("local")
      .notNull(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 320 }),
    passwordHash: text("passwordHash"),
    refreshTokenHash: text("refreshTokenHash"),
    avatar: text("avatar"),
    role: userRoleEnum("role").default("user").notNull(),
    // B2B: each user belongs to a company
    companyId: bigint("companyId", { mode: "number" }),
    phone: varchar("phone", { length: 50 }),
    dateOfBirth: timestamp("dateOfBirth"),
    gender: userGenderEnum("gender"),
    addressLine1: varchar("addressLine1", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    country: varchar("country", { length: 100 }),
    postalCode: varchar("postalCode", { length: 20 }),
    themePreference: userThemePreferenceEnum("themePreference")
      .default("system")
      .notNull(),
    mobileVerifiedAt: timestamp("mobileVerifiedAt"),
    emailVerifiedAt: timestamp("emailVerifiedAt"),
    jobTitle: varchar("jobTitle", { length: 100 }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
  },
  (table) => ({
    companyIdx: index("user_company_idx").on(table.companyId),
    emailIdx: index("user_email_idx").on(table.email),
    phoneIdx: index("user_phone_idx").on(table.phone),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─────────────────────────────────────────────────────────────
// OTP VERIFICATIONS — Pluggable mobile login verification
// ─────────────────────────────────────────────────────────────
export const otpVerifications = pgTable(
  "otp_verifications",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    mobileNumber: varchar("mobileNumber", { length: 20 }).notNull(),
    codeHash: text("codeHash").notNull(),
    purpose: otpPurposeEnum("purpose").default("login").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    consumedAt: timestamp("consumedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    mobileIdx: index("otp_mobile_idx").on(table.mobileNumber),
    expiresIdx: index("otp_expires_idx").on(table.expiresAt),
  })
);

export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = typeof otpVerifications.$inferInsert;


// ─────────────────────────────────────────────────────────────
// USER ADDRESSES — Multiple saved addresses for buyers
// ─────────────────────────────────────────────────────────────
export const userAddresses = pgTable(
  "user_addresses",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("userId", { mode: "number" }).notNull(),
    fullName: varchar("fullName", { length: 255 }).notNull(),
    mobileNumber: varchar("mobileNumber", { length: 50 }).notNull(),
    addressLine1: varchar("addressLine1", { length: 255 }).notNull(),
    addressLine2: varchar("addressLine2", { length: 255 }),
    landmark: varchar("landmark", { length: 255 }),
    areaLocality: varchar("areaLocality", { length: 255 }),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    postalCode: varchar("postalCode", { length: 20 }).notNull(),
    country: varchar("country", { length: 100 }).default("India").notNull(),
    addressType: addressTypeEnum("addressType").default("home").notNull(),
    isDefault: boolean("isDefault").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdx: index("user_address_user_idx").on(table.userId),
    defaultIdx: index("user_address_default_idx").on(table.isDefault),
  })
);

export type UserAddress = typeof userAddresses.$inferSelect;
export type InsertUserAddress = typeof userAddresses.$inferInsert;

// ─────────────────────────────────────────────────────────────
// COMPANIES — B2B entities (buyers, suppliers, or both)
// ─────────────────────────────────────────────────────────────
export const companies = pgTable(
  "companies",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    type: companyTypeEnum("type")
      .default("buyer")
      .notNull(),
    description: text("description"),
    logo: text("logo"),
    website: varchar("website", { length: 255 }),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 50 }),
    // Address fields
    addressLine1: varchar("addressLine1", { length: 255 }),
    addressLine2: varchar("addressLine2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    postalCode: varchar("postalCode", { length: 20 }),
    country: varchar("country", { length: 100 }),
    // Business details
    taxId: varchar("taxId", { length: 100 }),
    businessLicense: varchar("businessLicense", { length: 255 }),
    // Verification
    isVerified: boolean("isVerified").default(false).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    // Wholesale-specific
    minimumOrderAmount: numeric("minimumOrderAmount", {
      precision: 12,
      scale: 2,
    }).default("0.00"),
    paymentTerms: paymentTermsEnum("paymentTerms").default("net_30"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    typeIdx: index("company_type_idx").on(table.type),
    slugIdx: index("company_slug_idx").on(table.slug),
    verifiedIdx: index("company_verified_idx").on(table.isVerified),
  })
);

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ─────────────────────────────────────────────────────────────
// CUSTOMERS — Buyer records managed by supplier owners
// ─────────────────────────────────────────────────────────────
export const customers = pgTable(
  "customers",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    ownerCompanyId: bigint("ownerCompanyId", { mode: "number" }).notNull(),
    buyerCompanyId: bigint("buyerCompanyId", { mode: "number" }),
    name: varchar("name", { length: 255 }).notNull(),
    contactName: varchar("contactName", { length: 255 }),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 50 }),
    status: customerStatusEnum("status").default("active").notNull(),
    addressLine1: varchar("addressLine1", { length: 255 }),
    addressLine2: varchar("addressLine2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    postalCode: varchar("postalCode", { length: 20 }),
    country: varchar("country", { length: 100 }).default("India"),
    taxId: varchar("taxId", { length: 100 }),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    ownerIdx: index("customer_owner_idx").on(table.ownerCompanyId),
    buyerCompanyIdx: index("customer_buyer_company_idx").on(table.buyerCompanyId),
    statusIdx: index("customer_status_idx").on(table.status),
    emailIdx: index("customer_email_idx").on(table.email),
    phoneIdx: index("customer_phone_idx").on(table.phone),
  })
);

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ─────────────────────────────────────────────────────────────
// CATEGORIES — Product categories for fruits
// ─────────────────────────────────────────────────────────────
export const categories = pgTable(
  "categories",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 7 }), // hex color for UI
    parentId: bigint("parentId", { mode: "number" }),
    sortOrder: integer("sortOrder").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    slugIdx: index("category_slug_idx").on(table.slug),
    parentIdx: index("category_parent_idx").on(table.parentId),
    activeIdx: index("category_active_idx").on(table.isActive),
  })
);

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ─────────────────────────────────────────────────────────────
// PRODUCTS — Wholesale fruit products
// ─────────────────────────────────────────────────────────────
export const products = pgTable(
  "products",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    shortDescription: varchar("shortDescription", { length: 500 }),
    // Category
    categoryId: bigint("categoryId", { mode: "number" }).notNull(),
    // Supplier (the company selling this product)
    supplierId: bigint("supplierId", { mode: "number" }).notNull(),
    // Pricing (wholesale)
    unitPrice: numeric("unitPrice", { precision: 12, scale: 2 }).notNull(),
    compareAtPrice: numeric("compareAtPrice", {
      precision: 12,
      scale: 2,
    }).default("0.00"),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    // Unit of measure
    unitType: unitTypeEnum("unitType").notNull(),
    unitSize: varchar("unitSize", { length: 50 }),
    // Quantity
    minimumOrderQuantity: integer("minimumOrderQuantity").default(1).notNull(),
    // Media
    image: text("image"),
    images: text("images"), // JSON array of image URLs
    // Details
    origin: varchar("origin", { length: 100 }),
    season: varchar("season", { length: 100 }),
    grade: productGradeEnum("grade")
      .default("grade_a")
      .notNull(),
    organic: boolean("organic").default(false).notNull(),
    certifications: text("certifications"), // JSON array
    // Status
    status: productStatusEnum("status")
      .default("draft")
      .notNull(),
    // Marketplace presentation (one configuration per product, independent of inventory)
    marketplaceVisible: boolean("marketplaceVisible").default(true).notNull(),
    showInFreshDeals: boolean("showInFreshDeals").default(false).notNull(),
    isFeatured: boolean("isFeatured").default(false).notNull(),
    displayPriority: integer("displayPriority"),
    // SEO
    metaTitle: varchar("metaTitle", { length: 255 }),
    metaDescription: text("metaDescription"),
    tags: text("tags"), // comma-separated
    options: text("options"), // JSON array of ProductOption { id, name, price, compareAtPrice?, mealPrice?, onlyPrice? }
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    slugIdx: index("product_slug_idx").on(table.slug),
    categoryIdx: index("product_category_idx").on(table.categoryId),
    supplierIdx: index("product_supplier_idx").on(table.supplierId),
    statusIdx: index("product_status_idx").on(table.status),
    marketplaceVisibleIdx: index("product_marketplace_visible_idx").on(table.marketplaceVisible),
    freshDealsIdx: index("product_fresh_deals_idx").on(table.showInFreshDeals),
    featuredIdx: index("product_featured_idx").on(table.isFeatured),
    displayPriorityIdx: index("product_display_priority_idx").on(table.displayPriority),
    priceIdx: index("product_price_idx").on(table.unitPrice),
    organicIdx: index("product_organic_idx").on(table.organic),
    gradeIdx: index("product_grade_idx").on(table.grade),
    nameIdx: index("product_name_idx").on(table.name),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─────────────────────────────────────────────────────────────
// CART ITEMS — Shopping cart
// ─────────────────────────────────────────────────────────────
export const cartItems = pgTable(
  "cart_items",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("userId", { mode: "number" }).notNull(),
    productId: bigint("productId", { mode: "number" }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unitPrice", { precision: 12, scale: 2 }).notNull(),
    selectedOption: varchar("selectedOption", { length: 255 }),
    notes: varchar("notes", { length: 500 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdx: index("cart_user_idx").on(table.userId),
    productIdx: index("cart_product_idx").on(table.productId),
    uniqueUserProduct: index("cart_user_product_idx").on(
      table.userId,
      table.productId
    ),
  })
);

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// ─────────────────────────────────────────────────────────────
// ORDERS — Purchase orders
// ─────────────────────────────────────────────────────────────
export const orders = pgTable(
  "orders",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
    // Parties
    buyerId: bigint("buyerId", { mode: "number" }).notNull(),
    supplierId: bigint("supplierId", { mode: "number" }).notNull(),
    placedByUserId: bigint("placedByUserId", { mode: "number" }).notNull(),
    // Financial
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    taxAmount: numeric("taxAmount", {
      precision: 12,
      scale: 2,
    }).default("0.00"),
    shippingAmount: numeric("shippingAmount", {
      precision: 12,
      scale: 2,
    }).default("0.00"),
    discountAmount: numeric("discountAmount", {
      precision: 12,
      scale: 2,
    }).default("0.00"),
    totalAmount: numeric("totalAmount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    // Status workflow
    status: orderStatusEnum("status")
      .default("pending")
      .notNull(),
    paymentStatus: paymentStatusEnum("paymentStatus")
      .default("pending")
      .notNull(),
    paymentMethod: paymentMethodEnum("paymentMethod")
      .default("cod")
      .notNull(),
    razorpayOrderId: varchar("razorpayOrderId", { length: 255 }),
    razorpayPaymentId: varchar("razorpayPaymentId", { length: 255 }),
    razorpaySignature: varchar("razorpaySignature", { length: 255 }),
    // Shipping
    shippingContactName: varchar("shippingContactName", { length: 255 }),
    shippingMobileNumber: varchar("shippingMobileNumber", { length: 50 }),
    shippingAddressLine1: varchar("shippingAddressLine1", { length: 255 }),
    shippingAddressLine2: varchar("shippingAddressLine2", { length: 255 }),
    shippingLandmark: varchar("shippingLandmark", { length: 255 }),
    shippingAreaLocality: varchar("shippingAreaLocality", { length: 255 }),
    shippingCity: varchar("shippingCity", { length: 100 }),
    shippingState: varchar("shippingState", { length: 100 }),
    shippingPostalCode: varchar("shippingPostalCode", { length: 20 }),
    shippingCountry: varchar("shippingCountry", { length: 100 }),
    shippingMethod: varchar("shippingMethod", { length: 100 }),
    trackingNumber: varchar("trackingNumber", { length: 100 }),
    deliveryEstimate: deliveryEstimateEnum("deliveryEstimate"),
    estimatedDeliveryDate: timestamp("estimatedDeliveryDate"),
    actualDeliveryDate: timestamp("actualDeliveryDate"),
    warehouseId: bigint("warehouseId", { mode: "number" }),
    deliveryZoneId: bigint("deliveryZoneId", { mode: "number" }),
    shippingMethodId: bigint("shippingMethodId", { mode: "number" }),
    gstConfigId: bigint("gstConfigId", { mode: "number" }),
    // Dates
    orderedAt: timestamp("orderedAt").defaultNow().notNull(),
    confirmedAt: timestamp("confirmedAt"),
    shippedAt: timestamp("shippedAt"),
    deliveredAt: timestamp("deliveredAt"),
    cancelledAt: timestamp("cancelledAt"),
    // Notes
    buyerNotes: text("buyerNotes"),
    sellerNotes: text("sellerNotes"),
    internalNotes: text("internalNotes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    orderNumberIdx: index("order_number_idx").on(table.orderNumber),
    buyerIdx: index("order_buyer_idx").on(table.buyerId),
    supplierIdx: index("order_supplier_idx").on(table.supplierId),
    statusIdx: index("order_status_idx").on(table.status),
    deliveryEstimateIdx: index("order_delivery_estimate_idx").on(table.deliveryEstimate),
    warehouseIdx: index("order_warehouse_idx").on(table.warehouseId),
    deliveryZoneIdx: index("order_delivery_zone_idx").on(table.deliveryZoneId),
    shippingMethodIdx: index("order_shipping_method_idx").on(table.shippingMethodId),
    gstConfigIdx: index("order_gst_config_idx").on(table.gstConfigId),
    paymentStatusIdx: index("order_payment_idx").on(table.paymentStatus),
    orderedAtIdx: index("order_date_idx").on(table.orderedAt),
    placedByIdx: index("order_placed_by_idx").on(table.placedByUserId),
  })
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─────────────────────────────────────────────────────────────
// ORDER ITEMS — Line items within orders
// ─────────────────────────────────────────────────────────────
export const orderItems = pgTable(
  "order_items",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    orderId: bigint("orderId", { mode: "number" }).notNull(),
    productId: bigint("productId", { mode: "number" }).notNull(),
    productName: varchar("productName", { length: 255 }).notNull(),
    productImage: text("productImage"),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unitPrice", { precision: 12, scale: 2 }).notNull(),
    totalPrice: numeric("totalPrice", { precision: 12, scale: 2 }).notNull(),
    unitType: unitTypeEnum("unitType").notNull(),
    selectedOption: varchar("selectedOption", { length: 255 }),
    notes: varchar("notes", { length: 500 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("order_item_order_idx").on(table.orderId),
    productIdx: index("order_item_product_idx").on(table.productId),
  })
);

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ─────────────────────────────────────────────────────────────
// INVOICES — Immutable financial documents generated from orders
// ─────────────────────────────────────────────────────────────
export const invoices = pgTable(
  "invoices",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    companyId: bigint("companyId", { mode: "number" }).notNull(),
    orderId: bigint("orderId", { mode: "number" }).notNull().unique(),
    invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
    orderNumber: varchar("orderNumber", { length: 50 }).notNull(),
    status: invoiceStatusEnum("status").default("generated").notNull(),
    invoiceDate: timestamp("invoiceDate").defaultNow().notNull(),
    companyName: varchar("companyName", { length: 255 }).notNull(),
    companyPhone: varchar("companyPhone", { length: 50 }),
    companyAddress: text("companyAddress"),
    customerName: varchar("customerName", { length: 255 }).notNull(),
    customerPhone: varchar("customerPhone", { length: 50 }),
    billingAddress: text("billingAddress"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    taxAmount: numeric("taxAmount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    shippingAmount: numeric("shippingAmount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    gstRate: numeric("gstRate", { precision: 5, scale: 2 }).default("0.00").notNull(),
    gstin: varchar("gstin", { length: 20 }),
    totalAmount: numeric("totalAmount", { precision: 12, scale: 2 }).notNull(),
    archivedAt: timestamp("archivedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    companyIdx: index("invoice_company_idx").on(table.companyId),
    orderIdx: index("invoice_order_idx").on(table.orderId),
    invoiceNumberIdx: index("invoice_number_idx").on(table.invoiceNumber),
    statusIdx: index("invoice_status_idx").on(table.status),
    invoiceDateIdx: index("invoice_date_idx").on(table.invoiceDate),
  })
);

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    invoiceId: bigint("invoiceId", { mode: "number" }).notNull(),
    productName: varchar("productName", { length: 255 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitType: unitTypeEnum("unitType").notNull(),
    unitPrice: numeric("unitPrice", { precision: 12, scale: 2 }).notNull(),
    totalPrice: numeric("totalPrice", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    invoiceIdx: index("invoice_item_invoice_idx").on(table.invoiceId),
  })
);

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

// ─────────────────────────────────────────────────────────────
// INVENTORY — Stock tracking per product per supplier
// ─────────────────────────────────────────────────────────────
export const inventory = pgTable(
  "inventory",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    productId: bigint("productId", { mode: "number" }).notNull(),
    supplierId: bigint("supplierId", { mode: "number" }).notNull(),
    // Stock levels
    quantityOnHand: integer("quantityOnHand").default(0).notNull(),
    quantityReserved: integer("quantityReserved").default(0).notNull(),
    quantityAvailable: integer("quantityAvailable").default(0).notNull(),
    reorderLevel: integer("reorderLevel").default(10).notNull(),
    reorderQuantity: integer("reorderQuantity").default(100).notNull(),
    // Location
    warehouseLocation: varchar("warehouseLocation", { length: 100 }),
    batchNumber: varchar("batchNumber", { length: 100 }),
    // Dates
    expiryDate: timestamp("expiryDate"),
    receivedDate: timestamp("receivedDate"),
    lastCountedAt: timestamp("lastCountedAt"),
    // Status
    status: inventoryStatusEnum("status")
      .default("in_stock")
      .notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    productIdx: index("inventory_product_idx").on(table.productId),
    supplierIdx: index("inventory_supplier_idx").on(table.supplierId),
    statusIdx: index("inventory_status_idx").on(table.status),
    batchIdx: index("inventory_batch_idx").on(table.batchNumber),
    uniqueProductSupplier: index("inventory_product_supplier_idx").on(
      table.productId,
      table.supplierId
    ),
  })
);

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

// ─────────────────────────────────────────────────────────────
// WAREHOUSES — Single physical storage location per company
// ─────────────────────────────────────────────────────────────
export const warehouses = pgTable(
  "warehouses",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    companyId: bigint("companyId", { mode: "number" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 80 }),
    description: text("description"),
    address: text("address").notNull(),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    postalCode: varchar("postalCode", { length: 20 }),
    country: varchar("country", { length: 100 }).default("India"),
    capacityUnits: integer("capacityUnits").default(0).notNull(),
    usedCapacityUnits: integer("usedCapacityUnits").default(0).notNull(),
    isDefault: boolean("isDefault").default(false).notNull(),
    contactPerson: varchar("contactPerson", { length: 255 }),
    contactNumber: varchar("contactNumber", { length: 50 }),
    status: warehouseStatusEnum("status").default("active").notNull(),
    archivedAt: timestamp("archivedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    companyIdx: index("warehouse_company_idx").on(table.companyId),
    codeIdx: uniqueIndex("warehouse_code_idx").on(table.code),
    statusIdx: index("warehouse_status_idx").on(table.status),
    defaultIdx: index("warehouse_default_idx").on(table.isDefault),
  })
);

export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = typeof warehouses.$inferInsert;

// ─────────────────────────────────────────────────────────────
// WAREHOUSE STOCK MOVEMENTS — Audit-ready receive/dispatch log
// ─────────────────────────────────────────────────────────────
export const warehouseStockMovements = pgTable(
  "warehouse_stock_movements",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    warehouseId: bigint("warehouseId", { mode: "number" }).notNull(),
    companyId: bigint("companyId", { mode: "number" }).notNull(),
    productId: bigint("productId", { mode: "number" }).notNull(),
    inventoryId: bigint("inventoryId", { mode: "number" }).notNull(),
    type: warehouseMovementTypeEnum("type").notNull(),
    quantity: integer("quantity").notNull(),
    supplierName: varchar("supplierName", { length: 255 }),
    orderId: bigint("orderId", { mode: "number" }),
    reference: varchar("reference", { length: 120 }),
    notes: text("notes"),
    performedByUserId: bigint("performedByUserId", { mode: "number" }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    warehouseIdx: index("warehouse_movement_warehouse_idx").on(table.warehouseId),
    companyIdx: index("warehouse_movement_company_idx").on(table.companyId),
    productIdx: index("warehouse_movement_product_idx").on(table.productId),
    typeIdx: index("warehouse_movement_type_idx").on(table.type),
    createdAtIdx: index("warehouse_movement_created_at_idx").on(table.createdAt),
  })
);

export type WarehouseStockMovement = typeof warehouseStockMovements.$inferSelect;
export type InsertWarehouseStockMovement = typeof warehouseStockMovements.$inferInsert;

// ─────────────────────────────────────────────────────────────
// DELIVERY ZONES — Serviceable states per supplier
// ─────────────────────────────────────────────────────────────
export const deliveryZones = pgTable(
  "delivery_zones",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    companyId: bigint("companyId", { mode: "number" }).notNull(),
    warehouseId: bigint("warehouseId", { mode: "number" }),
    name: varchar("name", { length: 255 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    deliveryEstimate: deliveryEstimateEnum("deliveryEstimate").default("next_day").notNull(),
    deliveryFee: numeric("deliveryFee", { precision: 12, scale: 2 }).default("0.00").notNull(),
    minimumOrderAmount: numeric("minimumOrderAmount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    companyIdx: index("delivery_zone_company_idx").on(table.companyId),
    warehouseIdx: index("delivery_zone_warehouse_idx").on(table.warehouseId),
    stateIdx: index("delivery_zone_state_idx").on(table.state),
    activeIdx: index("delivery_zone_active_idx").on(table.isActive),
  })
);

export type DeliveryZone = typeof deliveryZones.$inferSelect;
export type InsertDeliveryZone = typeof deliveryZones.$inferInsert;

// ─────────────────────────────────────────────────────────────
// GST CONFIGURATION — Supplier tax settings for orders and invoices
// ─────────────────────────────────────────────────────────────
export const gstConfigurations = pgTable(
  "gst_configurations",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    companyId: bigint("companyId", { mode: "number" }).notNull(),
    categoryId: bigint("categoryId", { mode: "number" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    gstin: varchar("gstin", { length: 20 }),
    hsnCode: varchar("hsnCode", { length: 20 }),
    rate: numeric("rate", { precision: 5, scale: 2 }).notNull(),
    status: gstConfigStatusEnum("status").default("active").notNull(),
    isDefault: boolean("isDefault").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    companyIdx: index("gst_config_company_idx").on(table.companyId),
    categoryIdx: index("gst_config_category_idx").on(table.categoryId),
    statusIdx: index("gst_config_status_idx").on(table.status),
    defaultIdx: index("gst_config_default_idx").on(table.isDefault),
  })
);

export type GstConfiguration = typeof gstConfigurations.$inferSelect;
export type InsertGstConfiguration = typeof gstConfigurations.$inferInsert;

// ─────────────────────────────────────────────────────────────
// SHIPPING METHODS — Zone-aware charges and delivery estimates
// ─────────────────────────────────────────────────────────────
export const shippingMethods = pgTable(
  "shipping_methods",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    companyId: bigint("companyId", { mode: "number" }).notNull(),
    warehouseId: bigint("warehouseId", { mode: "number" }),
    deliveryZoneId: bigint("deliveryZoneId", { mode: "number" }),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 80 }),
    description: text("description"),
    charge: numeric("charge", { precision: 12, scale: 2 }).default("0.00").notNull(),
    freeShippingThreshold: numeric("freeShippingThreshold", { precision: 12, scale: 2 }),
    deliveryEstimate: deliveryEstimateEnum("deliveryEstimate").default("next_day").notNull(),
    status: shippingMethodStatusEnum("status").default("active").notNull(),
    isDefault: boolean("isDefault").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    companyIdx: index("shipping_method_company_idx").on(table.companyId),
    warehouseIdx: index("shipping_method_warehouse_idx").on(table.warehouseId),
    deliveryZoneIdx: index("shipping_method_delivery_zone_idx").on(table.deliveryZoneId),
    statusIdx: index("shipping_method_status_idx").on(table.status),
    defaultIdx: index("shipping_method_default_idx").on(table.isDefault),
  })
);

export type ShippingMethod = typeof shippingMethods.$inferSelect;
export type InsertShippingMethod = typeof shippingMethods.$inferInsert;

// ─────────────────────────────────────────────────────────────
// PRODUCT IMAGES — Durable binary storage for product assets
// ─────────────────────────────────────────────────────────────
export const productImages = pgTable(
  "product_images",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    productId: bigint("productId", { mode: "number" }),
    filename: varchar("filename", { length: 255 }).notNull().unique(),
    mimeType: varchar("mimeType", { length: 100 }).notNull(),
    data: bytea("data").notNull(),
    size: integer("size").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    filenameIdx: uniqueIndex("product_images_filename_idx").on(table.filename),
    productIdx: index("product_images_product_idx").on(table.productId),
  })
);

export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = typeof productImages.$inferInsert;

