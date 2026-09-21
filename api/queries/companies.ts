import { getDb } from "./connection";
import { companies, type Company } from "@db/schema";
import { eq, like, and, or } from "drizzle-orm";

export const DEFAULT_BUSINESS_NAME = "Tex’s Chicken & Burgers";
export const DEFAULT_BUSINESS_SLUG = "texs-chicken-and-burgers";
export const DEFAULT_BUSINESS_TAGLINE = "Worth Every Bite";

let cachedDefaultBusiness: Company | null = null;

export async function ensureDefaultBusiness(): Promise<Company> {
  const db = getDb();

  try {
    // 1. Check if default company already exists by slug or name
    let defaultCompany = await db.query.companies.findFirst({
      where: or(
        eq(companies.slug, DEFAULT_BUSINESS_SLUG),
        eq(companies.slug, "texs-chicken-burgers"),
        eq(companies.name, DEFAULT_BUSINESS_NAME)
      ),
    });

    if (defaultCompany) {
      if (
        defaultCompany.name !== DEFAULT_BUSINESS_NAME ||
        defaultCompany.description !== DEFAULT_BUSINESS_TAGLINE ||
        defaultCompany.slug !== DEFAULT_BUSINESS_SLUG ||
        !defaultCompany.isActive
      ) {
        await db
          .update(companies)
          .set({
            name: DEFAULT_BUSINESS_NAME,
            slug: DEFAULT_BUSINESS_SLUG,
            description: DEFAULT_BUSINESS_TAGLINE,
            type: "supplier",
            logo: "/branding/logo.png",
            isActive: true,
            isVerified: true,
            updatedAt: new Date(),
          })
          .where(eq(companies.id, defaultCompany.id));

        defaultCompany = await db.query.companies.findFirst({
          where: eq(companies.id, defaultCompany.id),
        });
      }
      cachedDefaultBusiness = defaultCompany ?? null;
      if (defaultCompany) return defaultCompany;
    }

    // 2. Check if legacy placeholder company (e.g. id 1 or 'amfruits-warehouse') exists to migrate
    const legacyCompany = await db.query.companies.findFirst({
      where: or(
        eq(companies.slug, "amfruits-warehouse"),
        eq(companies.id, 1)
      ),
    });

    if (legacyCompany) {
      await db
        .update(companies)
        .set({
          name: DEFAULT_BUSINESS_NAME,
          slug: DEFAULT_BUSINESS_SLUG,
          description: DEFAULT_BUSINESS_TAGLINE,
          type: "supplier",
          logo: "/branding/logo.png",
          isActive: true,
          isVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(companies.id, legacyCompany.id));

      const updated = await db.query.companies.findFirst({
        where: eq(companies.id, legacyCompany.id),
      });
      cachedDefaultBusiness = updated ?? legacyCompany;
      return cachedDefaultBusiness!;
    }

    // 3. Otherwise insert fresh default business
    const [created] = await db
      .insert(companies)
      .values({
        name: DEFAULT_BUSINESS_NAME,
        slug: DEFAULT_BUSINESS_SLUG,
        type: "supplier",
        description: DEFAULT_BUSINESS_TAGLINE,
        logo: "/branding/logo.png",
        email: "contact@texschickenandburgers.com",
        phone: "+1 (212) 555-0199",
        addressLine1: "Tex’s Kitchen",
        isVerified: true,
        isActive: true,
      })
      .returning();

    cachedDefaultBusiness = created;
    return created;
  } catch (error) {
    console.warn("[CompanyQuery] ensureDefaultBusiness fallback:", error);
    const fallback: Company = {
      id: 1,
      name: DEFAULT_BUSINESS_NAME,
      slug: DEFAULT_BUSINESS_SLUG,
      type: "supplier",
      description: DEFAULT_BUSINESS_TAGLINE,
      logo: "/branding/logo.png",
      website: null,
      email: "contact@texschickenandburgers.com",
      phone: "+1 (212) 555-0199",
      addressLine1: "Tex’s Kitchen",
      addressLine2: null,
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      taxId: null,
      businessLicense: null,
      isVerified: true,
      isActive: true,
      minimumOrderAmount: "0.00",
      paymentTerms: "net_30",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    cachedDefaultBusiness = fallback;
    return fallback;
  }
}

export async function findDefaultBusiness(): Promise<Company> {
  if (cachedDefaultBusiness) return cachedDefaultBusiness;
  return ensureDefaultBusiness();
}

export async function findAllCompanies() {
  await ensureDefaultBusiness();
  return getDb().query.companies.findMany({
    where: eq(companies.isActive, true),
    orderBy: companies.name,
  });
}

export async function findCompaniesByType(type: string) {
  await ensureDefaultBusiness();
  return getDb().query.companies.findMany({
    where: and(eq(companies.type, type as any), eq(companies.isActive, true)),
    orderBy: companies.name,
  });
}

export async function findCompanyById(id: number) {
  const db = getDb();
  let company = await db.query.companies.findFirst({
    where: eq(companies.id, id),
  });
  if (!company && (id === 1 || id === cachedDefaultBusiness?.id)) {
    company = await ensureDefaultBusiness();
  }
  return company;
}

export async function findCompanyBySlug(slug: string) {
  const db = getDb();
  let company = await db.query.companies.findFirst({
    where: eq(companies.slug, slug),
  });

  if (
    !company &&
    (slug === DEFAULT_BUSINESS_SLUG ||
      slug === "texs-chicken-burgers" ||
      slug === "amfruits-warehouse")
  ) {
    company = await ensureDefaultBusiness();
  }

  return company;
}

export async function searchCompanies(query: string) {
  await ensureDefaultBusiness();
  const pattern = `%${query}%`;
  return getDb()
    .select()
    .from(companies)
    .where(
      and(
        eq(companies.isActive, true),
        or(like(companies.name, pattern), like(companies.city, pattern))
      )
    )
    .orderBy(companies.name);
}
