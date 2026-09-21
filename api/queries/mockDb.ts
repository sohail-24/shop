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
}

export function createInitialStore(): MockStore {
  const companies = [
    {
      id: 1,
      name: "Tropical Direct Wholesale",
      slug: "tropical-direct-wholesale",
      type: "supplier",
      description: "Premium tropical fruit importer and distributor serving the North American market since 2008.",
      email: "sales@tropicaldirect.com",
      phone: "+1 (305) 555-0101",
      addressLine1: "4500 NW 36th St",
      city: "Miami",
      state: "FL",
      postalCode: "33166",
      country: "USA",
      isVerified: true,
      isActive: true,
      minimumOrderAmount: "500.00",
      paymentTerms: "net_30",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 2,
      name: "Citrus Kings Supply Co.",
      slug: "citrus-kings-supply",
      type: "supplier",
      description: "Family-owned citrus grower and packer from California's Central Valley. Specializing in oranges, lemons, and grapefruits.",
      email: "orders@citruskings.com",
      phone: "+1 (559) 555-0202",
      addressLine1: "8800 S Fruit Ave",
      city: "Fresno",
      state: "CA",
      postalCode: "93706",
      country: "USA",
      isVerified: true,
      isActive: true,
      minimumOrderAmount: "300.00",
      paymentTerms: "net_15",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 3,
      name: "Berry Fresh Farms",
      slug: "berry-fresh-farms",
      type: "supplier",
      description: "Organic berry specialist growing strawberries, blueberries, and raspberries in the Pacific Northwest.",
      email: "wholesale@berryfresh.com",
      phone: "+1 (503) 555-0303",
      addressLine1: "1200 NW Berry Rd",
      city: "Hillsboro",
      state: "OR",
      postalCode: "97124",
      country: "USA",
      isVerified: true,
      isActive: true,
      minimumOrderAmount: "250.00",
      paymentTerms: "net_30",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 4,
      name: "GreenGrocer Market Chain",
      slug: "greengrocer-market",
      type: "buyer",
      description: "Regional grocery chain with 45 stores across the Pacific Northwest. Focus on fresh, locally-sourced produce.",
      email: "procurement@greengrocer.com",
      phone: "+1 (206) 555-0404",
      addressLine1: "800 Elliott Ave",
      city: "Seattle",
      state: "WA",
      postalCode: "98109",
      country: "USA",
      isVerified: true,
      isActive: true,
      minimumOrderAmount: "0.00",
      paymentTerms: "net_45",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 5,
      name: "Metro Restaurant Supply",
      slug: "metro-restaurant-supply",
      type: "buyer",
      description: "Wholesale supplier to over 200 restaurants, hotels, and catering companies in the metropolitan area.",
      email: "buying@metrorestaurantsupply.com",
      phone: "+1 (212) 555-0505",
      addressLine1: "250 W 39th St",
      city: "New York",
      state: "NY",
      postalCode: "10018",
      country: "USA",
      isVerified: true,
      isActive: true,
      minimumOrderAmount: "0.00",
      paymentTerms: "net_30",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 6,
      name: "Global Fruit Traders LLC",
      slug: "global-fruit-traders",
      type: "both",
      description: "International fruit trading company. We both source from growers and distribute to retailers worldwide.",
      email: "trade@globalfruit.com",
      phone: "+1 (973) 555-0606",
      addressLine1: "1 Port Newark Way",
      city: "Newark",
      state: "NJ",
      postalCode: "07114",
      country: "USA",
      isVerified: true,
      isActive: true,
      minimumOrderAmount: "1000.00",
      paymentTerms: "net_30",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 7,
      name: "Tex’s Chicken & Burgers",
      slug: "texs-chicken-and-burgers",
      type: "supplier",
      description: "Worth Every Bite",
      logo: "/branding/logo.png",
      email: "contact@texschickenandburgers.com",
      addressLine1: "Tex’s Kitchen",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      isVerified: true,
      isActive: true,
      minimumOrderAmount: "0.00",
      paymentTerms: "net_30",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ];

  const categories = [
    { id: 1, name: "Citrus", slug: "citrus", description: "Oranges, lemons, limes, grapefruits, and other citrus fruits", icon: "citrus", color: "#F59E0B", sortOrder: 1, isActive: true, createdAt: new Date("2024-01-01") },
    { id: 2, name: "Tropical", slug: "tropical", description: "Mangoes, pineapples, bananas, coconuts, and exotic tropical fruits", icon: "tropical", color: "#10B981", sortOrder: 2, isActive: true, createdAt: new Date("2024-01-01") },
    { id: 3, name: "Berries", slug: "berries", description: "Strawberries, blueberries, raspberries, blackberries, and more", icon: "berries", color: "#8B5CF6", sortOrder: 3, isActive: true, createdAt: new Date("2024-01-01") },
    { id: 4, name: "Stone Fruits", slug: "stone-fruits", description: "Peaches, plums, cherries, apricots, nectarines", icon: "cherry", color: "#F43F5E", sortOrder: 4, isActive: true, createdAt: new Date("2024-01-01") },
    { id: 5, name: "Melons", slug: "melons", description: "Watermelons, cantaloupes, honeydews, and specialty melons", icon: "melon", color: "#06B6D4", sortOrder: 5, isActive: true, createdAt: new Date("2024-01-01") },
    { id: 6, name: "Apples & Pears", slug: "apples-pears", description: "All varieties of apples, pears, and related pomme fruits", icon: "apple", color: "#EF4444", sortOrder: 6, isActive: true, createdAt: new Date("2024-01-01") },
    { id: 7, name: "Grapes", slug: "grapes", description: "Table grapes, wine grapes, and specialty varieties", icon: "grapes", color: "#7C3AED", sortOrder: 7, isActive: true, createdAt: new Date("2024-01-01") },
    { id: 8, name: "Exotic & Specialty", slug: "exotic-specialty", description: "Dragon fruit, jackfruit, rambutan, and other specialty items", icon: "star", color: "#EC4899", sortOrder: 8, isActive: true, createdAt: new Date("2024-01-01") },
  ];

  const productsRaw = [
    {
      id: 1,
      name: "Valencia Oranges",
      slug: "valencia-oranges",
      sku: "OR-VAL-88",
      description: "Premium Valencia oranges, known for their sweet flavor and juiciness. Perfect for fresh juice and retail. Each case contains 88 count, approximately 40 lbs.",
      shortDescription: "Sweet, juicy Valencia oranges perfect for juicing",
      categoryId: 1,
      supplierId: 2,
      unitPrice: "32.50",
      compareAtPrice: "38.00",
      currency: "USD",
      unitType: "case",
      unitSize: "88 count / 40 lbs",
      minimumOrderQuantity: 5,
      image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=400&fit=crop",
      origin: "California, USA",
      season: "March - September",
      grade: "grade_a",
      organic: false,
      certifications: '["GFSI", "California Grown"]',
      status: "active",
      tags: "oranges, citrus, valencia, juice, california",
      marketplaceVisible: true,
      showInFreshDeals: true,
      isFeatured: true,
      displayPriority: 1,
      categoryName: "Citrus",
      supplierName: "Citrus Kings Supply Co.",
      stock: 450,
      quantityOnHand: 500,
      quantityReserved: 50,
      reorderLevel: 100,
      inventoryStatus: "in_stock",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 2,
      name: "Organic Navel Oranges",
      slug: "organic-navel-oranges",
      sku: "OR-NAV-ORG-56",
      description: "Certified organic navel oranges with easy-peel skin and seedless interior. Ideal snacking orange with exceptional sweetness.",
      shortDescription: "Certified organic, seedless, easy-peel navel oranges",
      categoryId: 1,
      supplierId: 2,
      unitPrice: "45.00",
      compareAtPrice: "52.00",
      currency: "USD",
      unitType: "case",
      unitSize: "56 count / 38 lbs",
      minimumOrderQuantity: 3,
      image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&h=400&fit=crop",
      origin: "California, USA",
      season: "November - June",
      grade: "premium",
      organic: true,
      certifications: '["USDA Organic", "California Grown", "Non-GMO"]',
      status: "active",
      tags: "oranges, navel, organic, citrus, seedless",
      marketplaceVisible: true,
      showInFreshDeals: true,
      isFeatured: true,
      displayPriority: 2,
      categoryName: "Citrus",
      supplierName: "Citrus Kings Supply Co.",
      stock: 105,
      quantityOnHand: 120,
      quantityReserved: 15,
      reorderLevel: 50,
      inventoryStatus: "in_stock",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 3,
      name: "Eureka Lemons",
      slug: "eureka-lemons",
      sku: "LEM-EUR-115",
      description: "Bright yellow Eureka lemons with high acidity and strong flavor. Consistent quality year-round. Popular for culinary and beverage applications.",
      shortDescription: "Bright yellow, high-acid lemons for culinary use",
      categoryId: 1,
      supplierId: 2,
      unitPrice: "28.00",
      compareAtPrice: "32.00",
      currency: "USD",
      unitType: "case",
      unitSize: "115 count / 40 lbs",
      minimumOrderQuantity: 5,
      image: "https://images.unsplash.com/photo-1609842947419-ba4f04d5d60f?w=600&h=400&fit=crop",
      origin: "California, USA",
      season: "Year-round",
      grade: "grade_a",
      organic: false,
      certifications: '["GFSI"]',
      status: "active",
      tags: "lemons, eureka, citrus, culinary",
      marketplaceVisible: true,
      showInFreshDeals: false,
      isFeatured: false,
      displayPriority: 3,
      categoryName: "Citrus",
      supplierName: "Citrus Kings Supply Co.",
      stock: 720,
      quantityOnHand: 800,
      quantityReserved: 80,
      reorderLevel: 150,
      inventoryStatus: "in_stock",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 4,
      name: "Kent Mangoes",
      slug: "kent-mangoes",
      sku: "MNG-KNT-12",
      description: "Sweet and fiberless Kent mangoes with rich golden flesh. Perfect for fresh consumption, smoothies, and desserts.",
      shortDescription: "Sweet, fiberless Kent mangoes with golden flesh",
      categoryId: 2,
      supplierId: 1,
      unitPrice: "18.75",
      compareAtPrice: "22.00",
      currency: "USD",
      unitType: "case",
      unitSize: "12 count / 9 lbs",
      minimumOrderQuantity: 10,
      image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&h=400&fit=crop",
      origin: "Mexico",
      season: "January - September",
      grade: "premium",
      organic: false,
      certifications: '["GlobalGAP"]',
      status: "active",
      tags: "mangoes, kent, tropical, mexico",
      marketplaceVisible: true,
      showInFreshDeals: true,
      isFeatured: true,
      displayPriority: 4,
      categoryName: "Tropical",
      supplierName: "Tropical Direct Wholesale",
      stock: 155,
      quantityOnHand: 200,
      quantityReserved: 45,
      reorderLevel: 80,
      inventoryStatus: "low_stock",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 5,
      name: "Organic Hass Avocados",
      slug: "organic-hass-avocados",
      sku: "AVO-HSS-ORG-48",
      description: "Creamy, buttery organic Hass avocados. Consistent quality with excellent shelf life. Perfect for retail and food service.",
      shortDescription: "Creamy organic Hass avocados with excellent shelf life",
      categoryId: 2,
      supplierId: 1,
      unitPrice: "42.00",
      compareAtPrice: "48.00",
      currency: "USD",
      unitType: "case",
      unitSize: "48 count / 25 lbs",
      minimumOrderQuantity: 4,
      image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&h=400&fit=crop",
      origin: "Mexico",
      season: "Year-round",
      grade: "grade_a",
      organic: true,
      certifications: '["USDA Organic", "Fair Trade", "GlobalGAP"]',
      status: "active",
      tags: "avocados, hass, organic, tropical, mexico",
      marketplaceVisible: true,
      showInFreshDeals: false,
      isFeatured: true,
      displayPriority: 5,
      categoryName: "Tropical",
      supplierName: "Tropical Direct Wholesale",
      stock: 320,
      quantityOnHand: 350,
      quantityReserved: 30,
      reorderLevel: 100,
      inventoryStatus: "in_stock",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 6,
      name: "Golden Pineapples",
      slug: "golden-pineapples",
      sku: "PIN-GLD-7",
      description: "Extra sweet golden pineapples with vibrant yellow flesh. Low acidity, high Brix. Ideal for fresh cut and juicing.",
      shortDescription: "Extra sweet golden pineapples, low acidity",
      categoryId: 2,
      supplierId: 1,
      unitPrice: "22.00",
      compareAtPrice: "26.00",
      currency: "USD",
      unitType: "case",
      unitSize: "7 count / 35 lbs",
      minimumOrderQuantity: 5,
      image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&h=400&fit=crop",
      origin: "Costa Rica",
      season: "Year-round",
      grade: "grade_a",
      organic: false,
      certifications: '["Rainforest Alliance", "GlobalGAP"]',
      status: "active",
      tags: "pineapples, golden, tropical, costa rica",
      marketplaceVisible: true,
      showInFreshDeals: true,
      isFeatured: false,
      displayPriority: 6,
      categoryName: "Tropical",
      supplierName: "Tropical Direct Wholesale",
      stock: 540,
      quantityOnHand: 600,
      quantityReserved: 60,
      reorderLevel: 120,
      inventoryStatus: "in_stock",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 7,
      name: "Organic Strawberries",
      slug: "organic-strawberries",
      sku: "STR-ORG-8FL",
      description: "Plump, sweet organic strawberries with vibrant red color. Grown in the fertile Willamette Valley. Excellent shelf life.",
      shortDescription: "Sweet, plump organic strawberries from Oregon",
      categoryId: 3,
      supplierId: 3,
      unitPrice: "36.00",
      compareAtPrice: "42.00",
      currency: "USD",
      unitType: "case",
      unitSize: "8 flats / 12 lbs",
      minimumOrderQuantity: 5,
      image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&h=400&fit=crop",
      origin: "Oregon, USA",
      season: "April - October",
      grade: "premium",
      organic: true,
      certifications: '["USDA Organic", "Oregon Tilth"]',
      status: "active",
      tags: "strawberries, berries, organic, oregon",
      marketplaceVisible: true,
      showInFreshDeals: true,
      isFeatured: true,
      displayPriority: 7,
      categoryName: "Berries",
      supplierName: "Berry Fresh Farms",
      stock: 55,
      quantityOnHand: 80,
      quantityReserved: 25,
      reorderLevel: 60,
      inventoryStatus: "low_stock",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 8,
      name: "Blueberries Jumbo",
      slug: "blueberries-jumbo",
      sku: "BLU-JMB-12PT",
      description: "Extra-large jumbo blueberries with excellent sweetness and firm texture. Perfect for retail premium packs and baking.",
      shortDescription: "Jumbo blueberries, extra-large and sweet",
      categoryId: 3,
      supplierId: 3,
      unitPrice: "48.00",
      compareAtPrice: "55.00",
      currency: "USD",
      unitType: "case",
      unitSize: "12 pints / 6 lbs",
      minimumOrderQuantity: 8,
      image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&h=400&fit=crop",
      origin: "Oregon, USA",
      season: "June - September",
      grade: "premium",
      organic: false,
      certifications: '["USDA Organic eligible", "GAP"]',
      status: "active",
      tags: "blueberries, jumbo, berries, oregon",
      marketplaceVisible: true,
      showInFreshDeals: false,
      isFeatured: true,
      displayPriority: 8,
      categoryName: "Berries",
      supplierName: "Berry Fresh Farms",
      stock: 130,
      quantityOnHand: 150,
      quantityReserved: 20,
      reorderLevel: 40,
      inventoryStatus: "in_stock",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 9,
      name: "Yellow Peaches",
      slug: "yellow-peaches",
      sku: "PCH-YEL-48",
      description: "Tree-ripened yellow peaches with juicy, sweet flesh. Perfect balance of sugar and acid. Great for fresh and canning.",
      shortDescription: "Tree-ripened, juicy yellow peaches",
      categoryId: 4,
      supplierId: 2,
      unitPrice: "28.50",
      compareAtPrice: "34.00",
      currency: "USD",
      unitType: "case",
      unitSize: "48 count / 25 lbs",
      minimumOrderQuantity: 5,
      image: "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=600&h=400&fit=crop",
      origin: "California, USA",
      season: "May - September",
      grade: "grade_a",
      organic: false,
      certifications: '["California Grown"]',
      status: "active",
      tags: "peaches, stone fruit, yellow, california",
      marketplaceVisible: true,
      showInFreshDeals: true,
      isFeatured: false,
      displayPriority: 9,
      categoryName: "Stone Fruits",
      supplierName: "Citrus Kings Supply Co.",
      stock: 210,
      quantityOnHand: 250,
      quantityReserved: 40,
      reorderLevel: 80,
      inventoryStatus: "in_stock",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 10,
      name: "Watermelon Seedless",
      slug: "watermelon-seedless",
      sku: "MEL-WML-SDL",
      description: "Large, oblong seedless watermelons with deep red, crisp flesh. High Brix, excellent shipping quality.",
      shortDescription: "Large seedless watermelons with deep red flesh",
      categoryId: 5,
      supplierId: 2,
      unitPrice: "15.00",
      compareAtPrice: "18.00",
      currency: "USD",
      unitType: "each",
      unitSize: "18-22 lbs avg",
      minimumOrderQuantity: 20,
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=400&fit=crop",
      origin: "Texas, USA",
      season: "May - August",
      grade: "grade_a",
      organic: false,
      certifications: '["Texas Department of Agriculture"]',
      status: "active",
      tags: "watermelon, melon, seedless, texas",
      marketplaceVisible: true,
      showInFreshDeals: true,
      isFeatured: false,
      displayPriority: 10,
      categoryName: "Melons",
      supplierName: "Citrus Kings Supply Co.",
      stock: 90,
      quantityOnHand: 100,
      quantityReserved: 10,
      reorderLevel: 30,
      inventoryStatus: "in_stock",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 11,
      name: "Honeycrisp Apples",
      slug: "honeycrisp-apples",
      sku: "APP-HNY-100",
      description: "Premium Honeycrisp apples with explosive crunch and juicily sweet flavor. Consumer favorite, high retail demand.",
      shortDescription: "Premium Honeycrisp, explosively crunchy and sweet",
      categoryId: 6,
      supplierId: 6,
      unitPrice: "52.00",
      compareAtPrice: "60.00",
      currency: "USD",
      unitType: "case",
      unitSize: "100 count / 40 lbs",
      minimumOrderQuantity: 5,
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&h=400&fit=crop",
      origin: "Washington, USA",
      season: "September - April",
      grade: "premium",
      organic: false,
      certifications: '["Washington State Apple Commission"]',
      status: "active",
      tags: "apples, honeycrisp, washington, premium",
      marketplaceVisible: true,
      showInFreshDeals: false,
      isFeatured: true,
      displayPriority: 11,
      categoryName: "Apples & Pears",
      supplierName: "Global Fruit Traders LLC",
      stock: 325,
      quantityOnHand: 400,
      quantityReserved: 75,
      reorderLevel: 100,
      inventoryStatus: "in_stock",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 12,
      name: "Red Seedless Grapes",
      slug: "red-seedless-grapes",
      sku: "GRP-RED-SDL-18",
      description: "Crisp, sweet red seedless grapes with excellent shelf life and attractive color. Popular retail variety.",
      shortDescription: "Crisp, sweet red seedless grapes",
      categoryId: 7,
      supplierId: 6,
      unitPrice: "24.50",
      compareAtPrice: "29.00",
      currency: "USD",
      unitType: "case",
      unitSize: "18 lbs",
      minimumOrderQuantity: 10,
      image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&h=400&fit=crop",
      origin: "California, USA",
      season: "June - December",
      grade: "grade_a",
      organic: false,
      certifications: '["California Grown"]',
      status: "active",
      tags: "grapes, red, seedless, california",
      marketplaceVisible: true,
      showInFreshDeals: true,
      isFeatured: false,
      displayPriority: 12,
      categoryName: "Grapes",
      supplierName: "Global Fruit Traders LLC",
      stock: 250,
      quantityOnHand: 300,
      quantityReserved: 50,
      reorderLevel: 80,
      inventoryStatus: "in_stock",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 13,
      name: "Dragon Fruit (Pitaya)",
      slug: "dragon-fruit-pitaya",
      sku: "EXO-DRG-10",
      description: "Stunning magenta dragon fruit with white flesh and tiny black seeds. Mild sweetness, kiwi-like texture. Instagram-worthy presentation.",
      shortDescription: "Vibrant magenta dragon fruit with white flesh",
      categoryId: 8,
      supplierId: 1,
      unitPrice: "48.00",
      compareAtPrice: "55.00",
      currency: "USD",
      unitType: "case",
      unitSize: "10 count / 8 lbs",
      minimumOrderQuantity: 3,
      image: "https://images.unsplash.com/photo-1527325678964-54921661f888?w=600&h=400&fit=crop",
      origin: "Vietnam",
      season: "Year-round",
      grade: "grade_a",
      organic: false,
      certifications: '["GlobalGAP", "VietGAP"]',
      status: "active",
      tags: "dragon fruit, pitaya, exotic, vietnam, specialty",
      marketplaceVisible: true,
      showInFreshDeals: false,
      isFeatured: true,
      displayPriority: 13,
      categoryName: "Exotic & Specialty",
      supplierName: "Tropical Direct Wholesale",
      stock: 30,
      quantityOnHand: 45,
      quantityReserved: 15,
      reorderLevel: 30,
      inventoryStatus: "low_stock",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ];

  const inventory = [
    { id: 1, productId: 1, supplierId: 2, quantityOnHand: 500, quantityReserved: 50, quantityAvailable: 450, reorderLevel: 100, reorderQuantity: 200, warehouseLocation: "CA-FRESNO-A12", batchNumber: "B2024-001", status: "in_stock", isActive: true, notes: "", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"), productName: "Valencia Oranges", productSlug: "valencia-oranges", productImage: "https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=400&fit=crop", unitPrice: "32.50", compareAtPrice: "38.00", tags: "oranges, citrus", supplierName: "Citrus Kings Supply Co." },
    { id: 2, productId: 2, supplierId: 2, quantityOnHand: 120, quantityReserved: 15, quantityAvailable: 105, reorderLevel: 50, reorderQuantity: 100, warehouseLocation: "CA-FRESNO-A14", batchNumber: "B2024-002", status: "in_stock", isActive: true, notes: "", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"), productName: "Organic Navel Oranges", productSlug: "organic-navel-oranges", productImage: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&h=400&fit=crop", unitPrice: "45.00", compareAtPrice: "52.00", tags: "oranges, organic", supplierName: "Citrus Kings Supply Co." },
    { id: 3, productId: 3, supplierId: 2, quantityOnHand: 800, quantityReserved: 80, quantityAvailable: 720, reorderLevel: 150, reorderQuantity: 300, warehouseLocation: "CA-FRESNO-B01", batchNumber: "B2024-003", status: "in_stock", isActive: true, notes: "", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"), productName: "Eureka Lemons", productSlug: "eureka-lemons", productImage: "https://images.unsplash.com/photo-1609842947419-ba4f04d5d60f?w=600&h=400&fit=crop", unitPrice: "28.00", compareAtPrice: "32.00", tags: "lemons, eureka", supplierName: "Citrus Kings Supply Co." },
    { id: 4, productId: 4, supplierId: 1, quantityOnHand: 200, quantityReserved: 45, quantityAvailable: 155, reorderLevel: 80, reorderQuantity: 150, warehouseLocation: "FL-MIAMI-T03", batchNumber: "B2024-004", status: "low_stock", isActive: true, notes: "", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"), productName: "Kent Mangoes", productSlug: "kent-mangoes", productImage: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&h=400&fit=crop", unitPrice: "18.75", compareAtPrice: "22.00", tags: "mangoes, kent", supplierName: "Tropical Direct Wholesale" },
    { id: 5, productId: 5, supplierId: 1, quantityOnHand: 350, quantityReserved: 30, quantityAvailable: 320, reorderLevel: 100, reorderQuantity: 200, warehouseLocation: "FL-MIAMI-T05", batchNumber: "B2024-005", status: "in_stock", isActive: true, notes: "", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"), productName: "Organic Hass Avocados", productSlug: "organic-hass-avocados", productImage: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&h=400&fit=crop", unitPrice: "42.00", compareAtPrice: "48.00", tags: "avocados, hass", supplierName: "Tropical Direct Wholesale" },
    { id: 6, productId: 6, supplierId: 1, quantityOnHand: 600, quantityReserved: 60, quantityAvailable: 540, reorderLevel: 120, reorderQuantity: 250, warehouseLocation: "FL-MIAMI-T08", batchNumber: "B2024-006", status: "in_stock", isActive: true, notes: "", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"), productName: "Golden Pineapples", productSlug: "golden-pineapples", productImage: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&h=400&fit=crop", unitPrice: "22.00", compareAtPrice: "26.00", tags: "pineapples, golden", supplierName: "Tropical Direct Wholesale" },
    { id: 7, productId: 7, supplierId: 3, quantityOnHand: 80, quantityReserved: 25, quantityAvailable: 55, reorderLevel: 60, reorderQuantity: 100, warehouseLocation: "OR-HILLS-C02", batchNumber: "B2024-007", status: "low_stock", isActive: true, notes: "", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"), productName: "Organic Strawberries", productSlug: "organic-strawberries", productImage: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&h=400&fit=crop", unitPrice: "36.00", compareAtPrice: "42.00", tags: "strawberries", supplierName: "Berry Fresh Farms" },
    { id: 8, productId: 8, supplierId: 3, quantityOnHand: 150, quantityReserved: 20, quantityAvailable: 130, reorderLevel: 40, reorderQuantity: 80, warehouseLocation: "OR-HILLS-C04", batchNumber: "B2024-008", status: "in_stock", isActive: true, notes: "", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"), productName: "Blueberries Jumbo", productSlug: "blueberries-jumbo", productImage: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&h=400&fit=crop", unitPrice: "48.00", compareAtPrice: "55.00", tags: "blueberries", supplierName: "Berry Fresh Farms" },
    { id: 9, productId: 9, supplierId: 2, quantityOnHand: 250, quantityReserved: 40, quantityAvailable: 210, reorderLevel: 80, reorderQuantity: 150, warehouseLocation: "CA-FRESNO-D06", batchNumber: "B2024-009", status: "in_stock", isActive: true, notes: "", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"), productName: "Yellow Peaches", productSlug: "yellow-peaches", productImage: "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=600&h=400&fit=crop", unitPrice: "28.50", compareAtPrice: "34.00", tags: "peaches", supplierName: "Citrus Kings Supply Co." },
    { id: 10, productId: 10, supplierId: 2, quantityOnHand: 100, quantityReserved: 10, quantityAvailable: 90, reorderLevel: 30, reorderQuantity: 60, warehouseLocation: "CA-FRESNO-D10", batchNumber: "B2024-010", status: "in_stock", isActive: true, notes: "", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"), productName: "Watermelon Seedless", productSlug: "watermelon-seedless", productImage: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=400&fit=crop", unitPrice: "15.00", compareAtPrice: "18.00", tags: "watermelon", supplierName: "Citrus Kings Supply Co." },
    { id: 11, productId: 11, supplierId: 6, quantityOnHand: 400, quantityReserved: 75, quantityAvailable: 325, reorderLevel: 100, reorderQuantity: 200, warehouseLocation: "NJ-NEWARK-F01", batchNumber: "B2024-011", status: "in_stock", isActive: true, notes: "", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"), productName: "Honeycrisp Apples", productSlug: "honeycrisp-apples", productImage: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&h=400&fit=crop", unitPrice: "52.00", compareAtPrice: "60.00", tags: "apples", supplierName: "Global Fruit Traders LLC" },
    { id: 12, productId: 12, supplierId: 6, quantityOnHand: 300, quantityReserved: 50, quantityAvailable: 250, reorderLevel: 80, reorderQuantity: 150, warehouseLocation: "NJ-NEWARK-F03", batchNumber: "B2024-012", status: "in_stock", isActive: true, notes: "", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"), productName: "Red Seedless Grapes", productSlug: "red-seedless-grapes", productImage: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&h=400&fit=crop", unitPrice: "24.50", compareAtPrice: "29.00", tags: "grapes", supplierName: "Global Fruit Traders LLC" },
    { id: 13, productId: 13, supplierId: 1, quantityOnHand: 45, quantityReserved: 15, quantityAvailable: 30, reorderLevel: 30, reorderQuantity: 60, warehouseLocation: "FL-MIAMI-T12", batchNumber: "B2024-013", status: "low_stock", isActive: true, notes: "", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01"), productName: "Dragon Fruit (Pitaya)", productSlug: "dragon-fruit-pitaya", productImage: "https://images.unsplash.com/photo-1527325678964-54921661f888?w=600&h=400&fit=crop", unitPrice: "48.00", compareAtPrice: "55.00", tags: "dragon fruit", supplierName: "Tropical Direct Wholesale" },
  ];

  const users = [
    {
      id: 1,
      unionId: "demo-owner",
      name: "FreshFlow Owner",
      email: "owner@freshflow.com",
      role: "admin",
      phone: "+919876543210",
      passwordHash: "$2a$10$wT0o3q6nS7vBv0E6lQhM8eT0n8sLqfG2qB0Zz0wM6dF8kH7x8sK8q",
      companyId: 1,
      themePreference: "system",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: 2,
      unionId: "demo-buyer",
      name: "FreshFlow Buyer",
      email: "buyer@freshflow.com",
      role: "user",
      phone: "+919876543211",
      passwordHash: "$2a$10$wT0o3q6nS7vBv0E6lQhM8eT0n8sLqfG2qB0Zz0wM6dF8kH7x8sK8q",
      companyId: 4,
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
      name: "Fresno Main Warehouse",
      code: "WH-FRESNO",
      addressLine1: "8800 S Fruit Ave",
      city: "Fresno",
      state: "CA",
      postalCode: "93706",
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
      name: "California",
      state: "California",
      deliveryEstimate: "next_day",
      deliveryFee: "25.00",
      minimumOrderAmount: "100.00",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ];

  const gstRules = [
    {
      id: 1,
      companyId: 1,
      hsnCode: "0808",
      gstRate: "0.00",
      description: "Fresh Edible Fruits",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ];

  const shippingRules = [
    {
      id: 1,
      companyId: 1,
      name: "Standard B2B Shipping",
      rate: "35.00",
      freeAbove: "500.00",
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
              if (keys.includes("count")) {
                const countVal = results.length;
                return Promise.resolve([{ count: countVal }]).then(resolve, reject);
              }
              if (keys.includes("value")) {
                const sumVal = results.reduce(
                  (acc, item) => acc + (Number(item.quantityOnHand ?? 10) * Number(item.unitPrice ?? 25)),
                  0,
                );
                return Promise.resolve([{ value: sumVal.toFixed(2) }]).then(resolve, reject);
              }
              if (keys.includes("product") && keys.length === 1) {
                results = results.map((p) => ({ product: p }));
              }
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
