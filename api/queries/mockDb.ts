import { getTableName } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";

const dialect = new PgDialect();

export interface MockStore {
  companies: any[];
  categories: any[];
  products: any[];
  inventory: any[];
  users: any[];
  cartItems: any[];
  orders: any[];
  orderItems: any[];
  invoices: any[];
  invoiceItems: any[];
  warehouse: any[];
  warehouseStockMovements: any[];
  deliveryZones: any[];
  gstRules: any[];
  shippingRules: any[];
  addresses: any[];
  customers: any[];
  productImages: any[];
}

export function createInitialStore(): MockStore {
  const companies = [
    {
      id: 1,
      name: "Tex’s Chicken & Burgers",
      slug: "texs-chicken-and-burgers",
      type: "supplier",
      description: "Worth Every Bite",
      logo: "/branding/logo.png",
      email: "contact@texschickenandburgers.com",
      phone: "+1 (212) 555-0199",
      addressLine1: "Tex’s Kitchen",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      isVerified: true,
      isActive: true,
      minimumOrderAmount: "0.00",
      paymentTerms: "immediate",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ];

  const categories = [
    { id: 9, name: "Platters", slug: "platters", description: "Fresh halal platters served with seasoned rice, fresh salad, and signature white & hot sauces", icon: "beef", color: "#DC2626", sortOrder: 0, isActive: true, createdAt: new Date("2024-01-01") },
    { id: 11, name: "Burgers & Sandwiches", slug: "burgers-sandwiches", description: "Juicy halal cheeseburgers, crispy chicken, falafel sandwiches, and classic Philly cheesesteaks", icon: "sparkles", color: "#D97706", sortOrder: 1, isActive: true, createdAt: new Date("2024-01-01") },
    { id: 12, name: "Party Wings", slug: "party-wings", description: "Crispy seasoned chicken wings tossed in your choice of signature sauces (6 pcs)", icon: "sparkles", color: "#E11D48", sortOrder: 5, isActive: true, createdAt: new Date("2024-01-01") },
    { id: 13, name: "Sides", slug: "sides", description: "Crispy golden fries, mac n' cheese, mashed potato, fire roasted corn, and fresh coleslaw", icon: "boxes", color: "#059669", sortOrder: 3, isActive: true, createdAt: new Date("2024-01-01") },
    { id: 14, name: "Drinks", slug: "drinks", description: "Refreshing cold sodas, iced tea, Snapple, energy drinks, and bottled water", icon: "droplets", color: "#0284C7", sortOrder: 6, isActive: true, createdAt: new Date("2024-01-01") },
    { id: 15, name: "Catering", slug: "catering", description: "Large party platters and feast packages for family gatherings, events, and parties", icon: "package", color: "#7C3AED", sortOrder: 7, isActive: true, createdAt: new Date("2024-01-01") },
  ];

  const productsRaw = [
    {
      id: 61,
      name: "French Fries",
      slug: "french-fries-tex-french-fries-4ebo",
      sku: "TEX-FRIES-01",
      description: "Crispy golden french fries fried to perfection and lightly seasoned.",
      shortDescription: "Crispy golden french fries",
      categoryId: 13,
      supplierId: 1,
      unitPrice: "3.25",
      compareAtPrice: "3.25",
      currency: "USD",
      unitType: "order",
      unitSize: "Regular",
      minimumOrderQuantity: 1,
      image: "/api/uploads/product-7dfe9590-14c5-438a-b3a3-cc7b1609fe19.png",
      images: '["/api/uploads/product-7dfe9590-14c5-438a-b3a3-cc7b1609fe19.png"]',
      origin: "New York, USA",
      season: "Year-round",
      grade: "premium",
      organic: false,
      certifications: '["Halal"]',
      status: "active",
      tags: "fries, sides, crispy, potato",
      marketplaceVisible: true,
      showInFreshDeals: false,
      isFeatured: true,
      displayPriority: 1,
      categoryName: "Sides",
      supplierName: "Tex’s Chicken & Burgers",
      stock: 100,
      quantityOnHand: 100,
      quantityReserved: 0,
      reorderLevel: 20,
      inventoryStatus: "in_stock",
      createdAt: new Date("2026-09-21"),
      updatedAt: new Date("2026-09-21"),
    },
    {
      id: 65,
      name: "Mac N'Cheese",
      slug: "mac-n-cheese-tex-mac-n-cheese-npdc",
      sku: "TEX-MAC-01",
      description: "Creamy, rich, and cheesy macaroni pasta baked to perfection.",
      shortDescription: "Creamy cheesy macaroni",
      categoryId: 13,
      supplierId: 1,
      unitPrice: "3.25",
      compareAtPrice: "3.25",
      currency: "USD",
      unitType: "order",
      unitSize: "Regular",
      minimumOrderQuantity: 1,
      image: "/api/uploads/product-3509f65f-efcc-4cca-9a75-e6466f1d1ffd.png",
      images: '["/api/uploads/product-3509f65f-efcc-4cca-9a75-e6466f1d1ffd.png"]',
      origin: "New York, USA",
      season: "Year-round",
      grade: "premium",
      organic: false,
      certifications: '["Halal"]',
      status: "active",
      tags: "macaroni, cheese, sides",
      marketplaceVisible: true,
      showInFreshDeals: false,
      isFeatured: false,
      displayPriority: 2,
      categoryName: "Sides",
      supplierName: "Tex’s Chicken & Burgers",
      stock: 100,
      quantityOnHand: 100,
      quantityReserved: 0,
      reorderLevel: 20,
      inventoryStatus: "in_stock",
      createdAt: new Date("2026-09-21"),
      updatedAt: new Date("2026-09-21"),
    },
    {
      id: 66,
      name: "Mashed Potato",
      slug: "mashed-potato-tex-mashed-potato--vl8",
      sku: "TEX-POTATO-01",
      description: "Smooth and creamy mashed potatoes served with warm savory gravy.",
      shortDescription: "Smooth creamy mashed potatoes with gravy",
      categoryId: 13,
      supplierId: 1,
      unitPrice: "3.25",
      compareAtPrice: "3.25",
      currency: "USD",
      unitType: "order",
      unitSize: "Regular",
      minimumOrderQuantity: 1,
      image: "/api/uploads/product-ad977bc0-2165-445e-8b0f-cb3d4f29ce22.png",
      images: '["/api/uploads/product-ad977bc0-2165-445e-8b0f-cb3d4f29ce22.png"]',
      origin: "New York, USA",
      season: "Year-round",
      grade: "premium",
      organic: false,
      certifications: '["Halal"]',
      status: "active",
      tags: "potato, mashed, gravy, sides",
      marketplaceVisible: true,
      showInFreshDeals: false,
      isFeatured: false,
      displayPriority: 3,
      categoryName: "Sides",
      supplierName: "Tex’s Chicken & Burgers",
      stock: 100,
      quantityOnHand: 100,
      quantityReserved: 0,
      reorderLevel: 20,
      inventoryStatus: "in_stock",
      createdAt: new Date("2026-09-21"),
      updatedAt: new Date("2026-09-21"),
    },
    {
      id: 67,
      name: "Fire Roasted Corn",
      slug: "fire-roasted-corn-tex-fire-roasted-corn-hasg",
      sku: "TEX-CORN-01",
      description: "Sweet fire-roasted sweet corn seasoned with special butter and herbs.",
      shortDescription: "Sweet fire-roasted corn",
      categoryId: 13,
      supplierId: 1,
      unitPrice: "3.25",
      compareAtPrice: "3.25",
      currency: "USD",
      unitType: "order",
      unitSize: "Regular",
      minimumOrderQuantity: 1,
      image: "/api/uploads/product-5dbaf069-2c99-40a3-b49a-05fec7881027.png",
      images: '["/api/uploads/product-5dbaf069-2c99-40a3-b49a-05fec7881027.png"]',
      origin: "New York, USA",
      season: "Year-round",
      grade: "premium",
      organic: false,
      certifications: '["Halal"]',
      status: "active",
      tags: "corn, roasted, sides",
      marketplaceVisible: true,
      showInFreshDeals: false,
      isFeatured: false,
      displayPriority: 4,
      categoryName: "Sides",
      supplierName: "Tex’s Chicken & Burgers",
      stock: 100,
      quantityOnHand: 100,
      quantityReserved: 0,
      reorderLevel: 20,
      inventoryStatus: "in_stock",
      createdAt: new Date("2026-09-21"),
      updatedAt: new Date("2026-09-21"),
    },
    {
      id: 68,
      name: "Coleslaw",
      slug: "coleslaw-tex-coleslaw-iqqp",
      sku: "TEX-SLAW-01",
      description: "Crisp and fresh shredded cabbage and carrots in a tangy, creamy dressing.",
      shortDescription: "Crispy creamy coleslaw",
      categoryId: 13,
      supplierId: 1,
      unitPrice: "3.25",
      compareAtPrice: "3.25",
      currency: "USD",
      unitType: "order",
      unitSize: "Regular",
      minimumOrderQuantity: 1,
      image: "/api/uploads/product-0e4372e4-cd21-4f34-99f6-c92cf703af1c.png",
      images: '["/api/uploads/product-0e4372e4-cd21-4f34-99f6-c92cf703af1c.png"]',
      origin: "New York, USA",
      season: "Year-round",
      grade: "premium",
      organic: false,
      certifications: '["Halal"]',
      status: "active",
      tags: "coleslaw, salad, sides",
      marketplaceVisible: true,
      showInFreshDeals: false,
      isFeatured: false,
      displayPriority: 5,
      categoryName: "Sides",
      supplierName: "Tex’s Chicken & Burgers",
      stock: 100,
      quantityOnHand: 100,
      quantityReserved: 0,
      reorderLevel: 20,
      inventoryStatus: "in_stock",
      createdAt: new Date("2026-09-21"),
      updatedAt: new Date("2026-09-21"),
    },
  ];

  const inventory = [
    { id: 108, productId: 61, supplierId: 1, quantityOnHand: 100, quantityReserved: 0, quantityAvailable: 100, reorderLevel: 20, reorderQuantity: 50, warehouseLocation: "Tex’s Kitchen", batchNumber: "B2026-001", status: "in_stock", isActive: true, notes: "", createdAt: new Date("2026-09-21"), updatedAt: new Date("2026-09-21"), productName: "French Fries", productSlug: "french-fries-tex-french-fries-4ebo", productImage: "/api/uploads/product-7dfe9590-14c5-438a-b3a3-cc7b1609fe19.png", unitPrice: "3.25", compareAtPrice: "3.25", tags: "fries, sides", supplierName: "Tex’s Chicken & Burgers" },
    { id: 112, productId: 65, supplierId: 1, quantityOnHand: 100, quantityReserved: 0, quantityAvailable: 100, reorderLevel: 20, reorderQuantity: 50, warehouseLocation: "Tex’s Kitchen", batchNumber: "B2026-002", status: "in_stock", isActive: true, notes: "", createdAt: new Date("2026-09-21"), updatedAt: new Date("2026-09-21"), productName: "Mac N'Cheese", productSlug: "mac-n-cheese-tex-mac-n-cheese-npdc", productImage: "/api/uploads/product-3509f65f-efcc-4cca-9a75-e6466f1d1ffd.png", unitPrice: "3.25", compareAtPrice: "3.25", tags: "macaroni, cheese", supplierName: "Tex’s Chicken & Burgers" },
    { id: 113, productId: 66, supplierId: 1, quantityOnHand: 100, quantityReserved: 0, quantityAvailable: 100, reorderLevel: 20, reorderQuantity: 50, warehouseLocation: "Tex’s Kitchen", batchNumber: "B2026-003", status: "in_stock", isActive: true, notes: "", createdAt: new Date("2026-09-21"), updatedAt: new Date("2026-09-21"), productName: "Mashed Potato", productSlug: "mashed-potato-tex-mashed-potato--vl8", productImage: "/api/uploads/product-ad977bc0-2165-445e-8b0f-cb3d4f29ce22.png", unitPrice: "3.25", compareAtPrice: "3.25", tags: "potato, mashed", supplierName: "Tex’s Chicken & Burgers" },
    { id: 114, productId: 67, supplierId: 1, quantityOnHand: 100, quantityReserved: 0, quantityAvailable: 100, reorderLevel: 20, reorderQuantity: 50, warehouseLocation: "Tex’s Kitchen", batchNumber: "B2026-004", status: "in_stock", isActive: true, notes: "", createdAt: new Date("2026-09-21"), updatedAt: new Date("2026-09-21"), productName: "Fire Roasted Corn", productSlug: "fire-roasted-corn-tex-fire-roasted-corn-hasg", productImage: "/api/uploads/product-5dbaf069-2c99-40a3-b49a-05fec7881027.png", unitPrice: "3.25", compareAtPrice: "3.25", tags: "corn, roasted", supplierName: "Tex’s Chicken & Burgers" },
    { id: 115, productId: 68, supplierId: 1, quantityOnHand: 100, quantityReserved: 0, quantityAvailable: 100, reorderLevel: 20, reorderQuantity: 50, warehouseLocation: "Tex’s Kitchen", batchNumber: "B2026-005", status: "in_stock", isActive: true, notes: "", createdAt: new Date("2026-09-21"), updatedAt: new Date("2026-09-21"), productName: "Coleslaw", productSlug: "coleslaw-tex-coleslaw-iqqp", productImage: "/api/uploads/product-0e4372e4-cd21-4f34-99f6-c92cf703af1c.png", unitPrice: "3.25", compareAtPrice: "3.25", tags: "coleslaw, salad", supplierName: "Tex’s Chicken & Burgers" },
  ];

  const users = [
    {
      id: 1,
      unionId: "demo-owner",
      name: "Administrator",
      email: "mdsohail88008@gmail.com",
      role: "admin",
      phone: "+1 (212) 555-0199",
      passwordHash: "$2a$10$wT0o3q6nS7vBv0E6lQhM8eT0n8sLqfG2qB0Zz0wM6dF8kH7x8sK8q",
      companyId: 1,
      themePreference: "system",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ];

  const warehouse = [
    {
      id: 1,
      companyId: 1,
      name: "Tex’s Kitchen",
      code: "WH-TEXS",
      addressLine1: "Tex’s Kitchen",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      status: "active",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ];

  const deliveryZones = [
    {
      id: 1,
      companyId: 1,
      warehouseId: 1,
      name: "New York Metro",
      state: "New York",
      deliveryEstimate: "same_day",
      deliveryFee: "3.99",
      minimumOrderAmount: "0.00",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ];

  const gstRules = [
    {
      id: 1,
      companyId: 1,
      hsnCode: "2106",
      gstRate: "8.875",
      description: "Prepared Food & Beverage",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ];

  const shippingRules = [
    {
      id: 1,
      companyId: 1,
      name: "Local Delivery",
      rate: "3.99",
      freeAbove: "30.00",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ];

  const cartItems: any[] = [];
  const orders: any[] = [];
  const orderItems: any[] = [];
  const invoices: any[] = [];
  const invoiceItems: any[] = [];
  const warehouseStockMovements: any[] = [];
  const addresses: any[] = [];
  const customers: any[] = [];

  return {
    companies,
    categories,
    products: productsRaw,
    inventory,
    users,
    cartItems,
    orders,
    orderItems,
    invoices,
    invoiceItems,
    warehouse,
    warehouseStockMovements,
    deliveryZones,
    gstRules,
    shippingRules,
    addresses,
    customers,
    productImages: [],
  };
}

const globalStore = createInitialStore();

function resolveTableName(table: any): keyof MockStore {
  if (typeof table === "string") {
    return (table.toLowerCase() as keyof MockStore) in globalStore
      ? (table.toLowerCase() as keyof MockStore)
      : "products";
  }
  try {
    const name = getTableName(table);
    if (name && name in globalStore) {
      return name as keyof MockStore;
    }
  } catch (e) {
    // Ignore error
  }
  if (table && typeof table === "object") {
    if (table._ && table._.name && table._.name in globalStore) {
      return table._.name as keyof MockStore;
    }
  }
  return "products";
}

function parseWhereCondition(where: any): Record<string, any> {
  if (!where) return {};
  try {
    const query = dialect.sqlToQuery(where);
    const sql = query.sql || "";
    const params = query.params || [];
    const filters: Record<string, any> = {};

    // Match patterns like "table"."column" = $1
    const matches = [...sql.matchAll(/"?(\w+)"?\."?(\w+)"?\s*=\s*\$(\d+)/g)];
    for (const match of matches) {
      const col = match[2];
      const pIdx = parseInt(match[3], 10) - 1;
      const val = params[pIdx];
      // Convert snake_case to camelCase
      const camelCol = col.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      filters[camelCol] = val;
      filters[col] = val;
    }

    // Match patterns like "column" = $1
    const colMatches = [...sql.matchAll(/(?:^|and\s+|where\s+)"?(\w+)"?\s*=\s*\$(\d+)/gi)];
    for (const match of colMatches) {
      const col = match[1];
      const pIdx = parseInt(match[2], 10) - 1;
      const val = params[pIdx];
      const camelCol = col.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      filters[camelCol] = val;
      filters[col] = val;
    }

    return filters;
  } catch (e) {
    return {};
  }
}

function matchFilter(item: any, filters: Record<string, any>): boolean {
  for (const [key, val] of Object.entries(filters)) {
    if (val === undefined) continue;
    if (item[key] === undefined) continue;
    if (typeof val === "boolean") {
      if (Boolean(item[key]) !== val) return false;
    } else if (typeof val === "number") {
      if (Number(item[key]) !== val) return false;
    } else if (typeof val === "string") {
      if (String(item[key]).toLowerCase() !== val.toLowerCase()) return false;
    }
  }
  return true;
}

export function createMockDb() {
  const mockDb: any = {
    _store: globalStore,

    select(selection?: any) {
      let fromTableKey: keyof MockStore = "products";
      const joins: any[] = [];
      let whereConditions: any[] = [];
      let limitCount: number | null = null;
      let offsetCount: number | null = null;

      const builder: any = {
        from(table: any) {
          fromTableKey = resolveTableName(table);
          return builder;
        },
        leftJoin(table: any, condition: any) {
          joins.push({ table, condition, type: "left" });
          return builder;
        },
        innerJoin(table: any, condition: any) {
          joins.push({ table, condition, type: "inner" });
          return builder;
        },
        where(...conditions: any[]) {
          whereConditions = conditions.filter(Boolean);
          return builder;
        },
        groupBy(..._cols: any[]) {
          return builder;
        },
        having(..._conditions: any[]) {
          return builder;
        },
        distinct() {
          return builder;
        },
        orderBy(..._cols: any[]) {
          return builder;
        },
        limit(count: number) {
          limitCount = count;
          return builder;
        },
        offset(count: number) {
          offsetCount = count;
          return builder;
        },
        toSQL() {
          return { sql: "MOCK SQL", params: [] };
        },
        then(resolve: any, reject: any) {
          try {
            const tableData = globalStore[fromTableKey] || [];
            let results = [...tableData];

            // Apply where filters
            for (const cond of whereConditions) {
              const filters = parseWhereCondition(cond);
              if (Object.keys(filters).length > 0) {
                results = results.filter((item) => matchFilter(item, filters));
              }
            }

            // Handle aggregate selections like count(*) or sum(*)
            if (selection && typeof selection === "object") {
              const keys = Object.keys(selection);
              const isAggregate = keys.some((k) =>
                [
                  "count",
                  "total",
                  "revenue",
                  "orders",
                  "products",
                  "invoices",
                  "inventory",
                  "lowStock",
                  "outOfStock",
                  "dailyInvoiceCount",
                  "monthlyInvoiceCount",
                  "nextId",
                  "value",
                ].includes(k)
              );

              if (isAggregate) {
                const aggRecord: Record<string, any> = {};
                for (const k of keys) {
                  if (
                    [
                      "count",
                      "total",
                      "orders",
                      "products",
                      "invoices",
                      "dailyInvoiceCount",
                      "monthlyInvoiceCount",
                    ].includes(k)
                  ) {
                    aggRecord[k] = results.length;
                  } else if (k === "revenue") {
                    const sumRev = results.reduce(
                      (acc, r) => acc + Number(r.totalAmount ?? r.amount ?? 0),
                      0
                    );
                    aggRecord[k] = sumRev > 0 ? sumRev.toFixed(2) : "0.00";
                  } else if (k === "inventory") {
                    const sumInv = results.reduce(
                      (acc, r) => acc + Number(r.quantityAvailable ?? r.quantityOnHand ?? 0),
                      0
                    );
                    aggRecord[k] = sumInv;
                  } else if (k === "lowStock") {
                    aggRecord[k] = results.filter((r) => r.status === "low_stock").length;
                  } else if (k === "outOfStock") {
                    aggRecord[k] = results.filter((r) => r.status === "out_of_stock").length;
                  } else if (k === "nextId") {
                    const maxId = results.reduce((max, r) => Math.max(max, Number(r.id ?? 0)), 0);
                    aggRecord[k] = maxId + 1;
                  } else if (k === "value") {
                    const sumVal = results.reduce(
                      (acc, item) =>
                        acc +
                        Number(item.quantityOnHand ?? 10) * Number(item.unitPrice ?? 25),
                      0
                    );
                    aggRecord[k] = sumVal.toFixed(2);
                  } else {
                    aggRecord[k] = 0;
                  }
                }
                return Promise.resolve([aggRecord]).then(resolve, reject);
              }

              if (keys.includes("product") && keys.length === 1) {
                results = results.map((p) => ({ product: p }));
              }
            }

            // Ensure order items have relatedCompanyName and itemCount populated
            if (fromTableKey === "orders") {
              results = results.map((order) => {
                const supplier = globalStore.companies.find((c) => c.id === order.supplierId);
                const buyer = globalStore.companies.find((c) => c.id === order.buyerId);
                return {
                  ...order,
                  relatedCompanyName:
                    order.relatedCompanyName ?? supplier?.name ?? buyer?.name ?? "Partner Company",
                  itemCount: order.itemCount ?? 1,
                };
              });
            }

            if (offsetCount !== null) {
              results = results.slice(offsetCount);
            }
            if (limitCount !== null) {
              results = results.slice(0, limitCount);
            }

            return Promise.resolve(results).then(resolve, reject);
          } catch (err) {
            return Promise.resolve([]).then(resolve, reject);
          }
        },
      };

      return builder;
    },

    selectDistinct(selection?: any) {
      return this.select(selection);
    },

    insert(table: any) {
      const tableKey = resolveTableName(table);
      let insertedValues: any[] = [];

      const builder: any = {
        values(vals: any) {
          const items = Array.isArray(vals) ? vals : [vals];
          const tableStore = globalStore[tableKey] || (globalStore[tableKey] = []);
          const createdItems = items.map((val) => {
            const maxId = tableStore.reduce((max, item) => Math.max(max, item.id || 0), 0);
            const newItem = {
              id: maxId + 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              ...val,
            };
            tableStore.push(newItem);
            return newItem;
          });
          insertedValues = createdItems;
          return builder;
        },
        returning(fields?: any) {
          return builder;
        },
        onConflictDoUpdate({ target, set }: any) {
          return builder;
        },
        then(resolve: any, reject: any) {
          return Promise.resolve(insertedValues).then(resolve, reject);
        },
      };

      return builder;
    },

    update(table: any) {
      const tableKey = resolveTableName(table);
      let updates: any = {};
      let whereConditions: any[] = [];

      const builder: any = {
        set(data: any) {
          updates = data;
          return builder;
        },
        where(...conditions: any[]) {
          whereConditions = conditions.filter(Boolean);
          return builder;
        },
        returning(fields?: any) {
          return builder;
        },
        then(resolve: any, reject: any) {
          const tableStore = globalStore[tableKey] || [];
          let updatedItems: any[] = [];

          for (const cond of whereConditions) {
            const filters = parseWhereCondition(cond);
            for (let i = 0; i < tableStore.length; i++) {
              if (matchFilter(tableStore[i], filters)) {
                tableStore[i] = {
                  ...tableStore[i],
                  ...updates,
                  updatedAt: new Date(),
                };
                updatedItems.push(tableStore[i]);
              }
            }
          }

          if (updatedItems.length === 0 && tableStore.length > 0) {
            // If no specific match was found, update first item or mock returning
            tableStore[0] = { ...tableStore[0], ...updates, updatedAt: new Date() };
            updatedItems = [tableStore[0]];
          }

          return Promise.resolve(updatedItems).then(resolve, reject);
        },
      };

      return builder;
    },

    delete(table: any) {
      const tableKey = resolveTableName(table);
      let whereConditions: any[] = [];

      const builder: any = {
        where(...conditions: any[]) {
          whereConditions = conditions.filter(Boolean);
          return builder;
        },
        then(resolve: any, reject: any) {
          const tableStore = globalStore[tableKey] || [];
          for (const cond of whereConditions) {
            const filters = parseWhereCondition(cond);
            globalStore[tableKey] = tableStore.filter((item) => !matchFilter(item, filters));
          }
          return Promise.resolve([]).then(resolve, reject);
        },
      };

      return builder;
    },

    async transaction(callback: (tx: any) => Promise<any>) {
      return callback(mockDb);
    },

    query: new Proxy(
      {},
      {
        get(_, prop: string) {
          const tableKey = prop as keyof MockStore;
          const tableData = globalStore[tableKey] || [];

          return {
            findMany: async (options?: any) => {
              let results = [...tableData];
              if (options?.where) {
                const filters = parseWhereCondition(options.where);
                if (Object.keys(filters).length > 0) {
                  results = results.filter((item) => matchFilter(item, filters));
                }
              }
              if (options?.with) {
                // Populate relationships if requested
                results = results.map((item) => {
                  const populated = { ...item };
                  if (options.with.supplier && item.supplierId) {
                    populated.supplier = globalStore.companies.find((c) => c.id === item.supplierId) ?? null;
                  }
                  if (options.with.category && item.categoryId) {
                    populated.category = globalStore.categories.find((c) => c.id === item.categoryId) ?? null;
                  }
                  if (options.with.product && item.productId) {
                    populated.product = globalStore.products.find((p) => p.id === item.productId) ?? null;
                  }
                  return populated;
                });
              }
              if (options?.limit) {
                results = results.slice(0, options.limit);
              }
              return results;
            },
            findFirst: async (options?: any) => {
              let results = [...tableData];
              if (options?.where) {
                const filters = parseWhereCondition(options.where);
                if (Object.keys(filters).length > 0) {
                  results = results.filter((item) => matchFilter(item, filters));
                }
              }
              const item = results[0] ?? null;
              if (item && options?.with) {
                const populated = { ...item };
                if (options.with.supplier && item.supplierId) {
                  populated.supplier = globalStore.companies.find((c) => c.id === item.supplierId) ?? null;
                }
                if (options.with.category && item.categoryId) {
                  populated.category = globalStore.categories.find((c) => c.id === item.categoryId) ?? null;
                }
                if (options.with.product && item.productId) {
                  populated.product = globalStore.products.find((p) => p.id === item.productId) ?? null;
                }
                return populated;
              }
              return item;
            },
            findUnique: async (options?: any) => {
              let results = [...tableData];
              if (options?.where) {
                const filters = parseWhereCondition(options.where);
                if (Object.keys(filters).length > 0) {
                  results = results.filter((item) => matchFilter(item, filters));
                }
              }
              return results[0] ?? null;
            },
          };
        },
      },
    ),
  };

  return mockDb;
}

export const mockDbInstance = createMockDb();
