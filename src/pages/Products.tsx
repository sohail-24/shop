import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { addGuestCartItem, useGuestCart } from "@/lib/guestCart";
import { formatCurrency, toNumber, unitLabels } from "@/lib/i18n";
import { getAppRole } from "@/lib/roles";
import { MetricCard } from "@/components/freshflow/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle, DrawerHeader } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  CheckCircle2,
  Home,
  Image as ImageIcon,
  Info,
  LayoutGrid,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  UserRound,
  Eye,
  Pencil,
  Trash2,
  Utensils,
  Filter,
} from "lucide-react";
import { getCategoryEmoji } from "./LandingPage";

type CatalogProduct = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  supplierName?: string | null;
  unitPrice?: unknown;
  compareAtPrice?: unknown;
  unitType?: string | null;
  unitSize?: string | null;
  minimumOrderQuantity?: number | null;
  status?: string | null;
  stock?: number | null;
  rating?: string | number | null;
  tags?: string | null;
  description?: string | null;
};

export interface FoodCategoryItem {
  id: number;
  key: string;
  name: string;
  emoji: string;
  description: string;
  image: string;
  slug: string;
}

export function getCategoryImage(category: { name?: string | null; slug?: string | null }): string {
  const text = `${category.slug || ""} ${category.name || ""}`.toLowerCase();
  if (text.includes("platter")) return "/products/chicken-platter.jpg";
  if (text.includes("gyro") || text.includes("wrap") || text.includes("pita")) return "/products/combo-gyro.jpg";
  if (text.includes("burger") || text.includes("sandwich") || text.includes("cheesesteak") || text.includes("sub")) return "/products/cheeseburger.jpg";
  if (text.includes("wing")) return "/products/hot-wings.jpg";
  if (text.includes("rice bowl") || text.includes("bowl") || text.includes("rice")) return "/products/combo-platter.jpg";
  if (text.includes("side") || text.includes("fries") || text.includes("fry")) return "/products/fries.jpg";
  if (text.includes("drink") || text.includes("beverage") || text.includes("soda") || text.includes("juice")) return "/products/soda-bottle.jpg";
  if (text.includes("dessert") || text.includes("sweet") || text.includes("baklava")) return "/products/baklava.jpg";
  if (text.includes("catering") || text.includes("party") || text.includes("feast")) return "/products/catering.jpg";
  return "/products/chicken-platter.jpg";
}

export function getCategoryDescription(category: { name?: string | null; slug?: string | null; description?: string | null }): string {
  if (category.description?.trim()) return category.description.trim();
  const text = `${category.slug || ""} ${category.name || ""}`.toLowerCase();
  if (text.includes("platter")) return "Hearty meals, full of flavor";
  if (text.includes("gyro") || text.includes("wrap") || text.includes("pita")) return "Authentic & Delicious";
  if (text.includes("burger") || text.includes("sandwich")) return "Juicy & Satisfying";
  if (text.includes("wing")) return "Perfect for sharing";
  if (text.includes("rice bowl") || text.includes("bowl")) return "Served over fragrant seasoned rice";
  if (text.includes("side") || text.includes("fries")) return "The perfect add-ons";
  if (text.includes("drink") || text.includes("beverage")) return "Cool & Refreshing";
  if (text.includes("dessert") || text.includes("sweet")) return "Traditional sweet treats";
  if (text.includes("catering")) return "Feast packages & party platters";
  return "Fresh & delicious halal food";
}

export function getCategoryVisual(category: {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
}): FoodCategoryItem {
  const slug = (category.slug || "").toLowerCase().trim();
  const emoji = getCategoryEmoji(category);
  const image = getCategoryImage(category);
  const description = getCategoryDescription(category);

  return {
    id: category.id,
    key: String(category.id),
    name: category.name,
    emoji,
    description,
    image,
    slug: slug || String(category.id),
  };
}

function matchesSearch(product: CatalogProduct, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const name = product.name.toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const tags = (product.tags || "").toLowerCase();
  return name.includes(q) || desc.includes(q) || tags.includes(q);
}

export default function Products() {
  const { user } = useAuth();
  const role = getAppRole(user);
  const ownerMode = role !== "buyer";

  if (ownerMode) {
    return <OwnerProductCatalog />;
  }

  return <BuyerMarketplace />;
}

function BuyerMarketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const categoriesQuery = trpc.category.list.useQuery(undefined, { retry: false });

  // Only active categories for customer browsing
  const displayCategories = useMemo(() => {
    const list = ((categoriesQuery.data ?? []) as {
      id: number;
      name: string;
      slug?: string | null;
      description?: string | null;
      isActive?: boolean | null;
    }[]).filter((c) => c.isActive !== false);

    return list.map(getCategoryVisual);
  }, [categoriesQuery.data]);

  const isAllSelected = categoryParam === "all";

  // Resolve active category by database ID or slug or key
  const activeCategory = useMemo(() => {
    if (!categoryParam || isAllSelected) return null;
    return (
      displayCategories.find(
        (c) =>
          String(c.id) === categoryParam ||
          c.key === categoryParam ||
          (c.slug && c.slug.toLowerCase() === categoryParam.toLowerCase()),
      ) ?? null
    );
  }, [categoryParam, isAllSelected, displayCategories]);

  // If a category param is present, or if user is searching, stay in product catalog view.
  // When no category is selected and no search entered, show category overview cards.
  const isCategoriesOverview = !categoryParam && !search.trim();

  // Determine the categoryId to send to the server
  const targetCategoryId = useMemo(() => {
    if (isAllSelected) return undefined;
    if (activeCategory) return activeCategory.id;
    // If categoryParam is numeric, we can pass it directly to the server
    if (categoryParam) {
      const parsed = Number(categoryParam);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
    return undefined;
  }, [isAllSelected, activeCategory, categoryParam]);

  // Check if an invalid/inactive category was requested once categories have loaded
  const isInvalidCategory = Boolean(categoryParam) && !isAllSelected && categoriesQuery.isSuccess && !activeCategory;

  const apiSortBy: "price" | "name" | "newest" =
    sort === "price_asc" || sort === "price_desc" ? "price" : "newest";
  const apiSortOrder: "asc" | "desc" = sort === "price_asc" ? "asc" : "desc";

  const productsQuery = trpc.product.list.useQuery(
    {
      categoryId: isInvalidCategory ? -1 : targetCategoryId,
      search: search.trim() || undefined,
      status: "active",
      sortBy: apiSortBy,
      sortOrder: apiSortOrder,
    },
    { retry: false },
  );

  const cartQuery = trpc.cart.list.useQuery(undefined, { retry: false });
  const guestCart = useGuestCart();
  const cartCount = user
    ? (cartQuery.data?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0)
    : guestCart.items.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: async () => {
      await utils.cart.list.invalidate();
      toast.success("Product added to cart.");
    },
    onError: (error) => toast.error(error.message || "Could not add product to cart."),
  });

  const products = useMemo(() => {
    let list = (productsQuery.data ?? []) as CatalogProduct[];
    if (targetCategoryId !== undefined && !isInvalidCategory) {
      list = list.filter((p) => p.categoryId === targetCategoryId);
    }
    if (sort === "rating") {
      return [...list].sort((a, b) => (Number(b.rating) || 4.8) - (Number(a.rating) || 4.8));
    }
    return list;
  }, [productsQuery.data, targetCategoryId, isInvalidCategory, sort]);

  function addProductToCart(product: CatalogProduct, quantity: number) {
    if (quantity > (product.stock ?? 0)) {
      toast.error("Requested quantity exceeds available stock.");
      return;
    }

    if (user) {
      addToCart.mutate({ productId: product.id, quantity });
      return;
    }

    addGuestCartItem({
      id: product.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productImage: product.image ?? null,
      productUnitType: product.unitType ?? "kg",
      productUnitSize: product.unitSize ?? product.unitType ?? "kg",
      quantity,
      unitPrice: String(product.unitPrice ?? 0),
    });
    toast.success("Product added to cart.");
  }

  // ─────────────────────────────────────────────────────────────
  // 1. DEDICATED FOOD CATEGORIES PAGE (when no category is selected)
  // ─────────────────────────────────────────────────────────────
  if (isCategoriesOverview) {
    return (
      <div className="w-full min-h-screen bg-slate-50/50 flex flex-col justify-between overflow-x-hidden">
        {/* Header: Home Link + Tex’s Chicken & Burgers Logo & Name + Profile + Cart */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-2.5 py-2 sm:px-4 sm:py-2.5 shadow-xs">
          <div className="flex items-center justify-between gap-2 max-w-[1500px] mx-auto">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 group-hover:bg-emerald-100 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <img
                src="/branding/logo.png"
                alt="Tex’s Chicken & Burgers"
                className="h-7 w-7 sm:h-8 sm:w-8 object-contain rounded-md border border-slate-100 bg-white p-0.5 shadow-xs"
              />
              <div>
                <h1 className="text-xs sm:text-base font-extrabold text-slate-900 leading-tight">
                  Tex’s Chicken & Burgers
                </h1>
                <p className="text-[9px] sm:text-xs text-slate-500 font-medium leading-none mt-0.5">
                  Worth Every Bite
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/admin/login"
                id="header-user-button"
                aria-label="Account Login"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200/80 transition-colors"
              >
                <UserRound className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-700" />
              </Link>
              <Link
                to="/cart"
                id="header-cart-button"
                aria-label="View shopping cart"
                className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200/80 transition-colors"
              >
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white shadow-xs">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>

        {/* Categories Main Content */}
        <main className="w-full max-w-[1500px] mx-auto flex flex-col gap-2.5 sm:gap-3 px-2 sm:px-4 pt-2.5 sm:pt-3.5 pb-28 md:pb-8 flex-1 box-border">
          {/* Search Field */}
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 sm:h-10 pl-9 pr-9 rounded-xl border-slate-200 bg-white focus:bg-white text-xs sm:text-sm placeholder:text-slate-400 focus-visible:ring-emerald-600 shadow-xs"
              placeholder="Search for products, platters, burgers, and more..."
            />
            <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
          </div>

          {/* Section Title & Slogan */}
          <div className="text-center pt-0.5 pb-0.5 space-y-0.5">
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-900">
              <span className="text-base leading-none">🌿</span>
              <span>FOOD CATEGORIES</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Choose what you're craving
            </p>

            {/* Decorative Slogan */}
            <div className="pt-0.5 text-center">
              <p className="text-[11px] xs:text-xs font-serif italic text-emerald-800/80 tracking-wide">
                Good Food Brings Good People
              </p>
            </div>
          </div>

          {/* 2-Column Responsive Grid of Category Cards */}
          {categoriesQuery.isLoading ? (
            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5 box-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-36 xs:h-40 sm:h-44 md:h-48 w-full rounded-xl sm:rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5 box-border">
              {displayCategories.map((category) => (
                <button
                  key={category.id}
                  id={`food-category-card-${category.slug || category.id}`}
                  type="button"
                  onClick={() => {
                    setSearchParams({ category: String(category.id) });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group relative flex flex-col justify-end overflow-hidden rounded-xl sm:rounded-2xl h-36 xs:h-40 sm:h-44 md:h-48 w-full text-left shadow-xs hover:shadow-md transition-all active:scale-[0.98] border border-slate-200/80 cursor-pointer"
                >
                  {/* Full Card Food Image */}
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Dark Gradient Overlay: Transparent to Dark Green/Black */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 via-40% to-transparent" />

                  {/* Text OVER the image at bottom */}
                  <div className="relative z-10 p-2.5 sm:p-3 flex flex-col justify-end w-full">
                    <div className="flex items-center justify-between gap-1.5">
                      <h3 className="text-xs xs:text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1 drop-shadow-sm">
                        <span className="text-sm sm:text-base">{category.emoji}</span>
                        <span>{category.name}</span>
                      </h3>
                      <div className="flex h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full border border-white/70 bg-black/30 text-white backdrop-blur-xs group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-colors">
                        <ArrowRight className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5" />
                      </div>
                    </div>
                    <p className="text-[10px] xs:text-[11px] sm:text-xs font-medium text-emerald-100/90 line-clamp-1 mt-0.5 drop-shadow-xs">
                      {category.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 100% Certified Halal Trust Banner */}
          <div className="mt-1 rounded-xl border border-emerald-800/40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 px-4 py-3 text-center text-white shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-wide text-amber-300 uppercase">
              <span className="text-sm">☪</span>
              <span>100% CERTIFIED HALAL</span>
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-200/90 font-medium mt-0.5">
              Fresh • Healthy • Pure Taste
            </p>
          </div>
        </main>

        {/* Mobile Bottom Navigation - Categories is ACTIVE GREEN */}
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] border-t border-[#E5E7EB] shadow-[0_-1px_6px_rgba(0,0,0,0.04)] px-2 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]"
        >
          <div className="grid grid-cols-4 items-center max-w-md mx-auto">
            {/* 1. Home */}
            <Link
              to="/"
              id="mobile-nav-home"
              className="flex flex-col items-center justify-center py-0.5 text-slate-500 hover:text-slate-800 font-medium transition-colors group"
            >
              <Home className="h-5 w-5 text-slate-500 group-hover:text-slate-800 group-hover:scale-110 transition-all" />
              <span className="text-[10px] xs:text-[11px] mt-0.5 leading-none">Home</span>
            </Link>

            {/* 2. Categories - ACTIVE GREEN */}
            <Link
              to="/products"
              id="mobile-nav-categories"
              onClick={() => {
                setSearchParams({});
                setSearch("");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex flex-col items-center justify-center py-0.5 text-emerald-700 font-bold transition-colors group"
            >
              <LayoutGrid className="h-5 w-5 text-emerald-700 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] xs:text-[11px] font-bold mt-0.5 leading-none">Categories</span>
            </Link>

            {/* 3. Cart */}
            <Link
              to="/cart"
              id="mobile-nav-cart"
              className="relative flex flex-col items-center justify-center py-0.5 text-slate-500 hover:text-slate-800 font-medium transition-colors group"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-slate-500 group-hover:text-slate-800 group-hover:scale-110 transition-all" />
                {!!cartCount && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] xs:text-[11px] mt-0.5 leading-none">Cart</span>
            </Link>

            {/* 4. About */}
            <Link
              to="/about"
              id="mobile-nav-about"
              className="flex flex-col items-center justify-center py-0.5 text-slate-500 hover:text-slate-800 font-medium transition-colors group"
            >
              <Info className="h-5 w-5 text-slate-500 group-hover:text-slate-800 group-hover:scale-110 transition-all" />
              <span className="text-[10px] xs:text-[11px] mt-0.5 leading-none">About</span>
            </Link>
          </div>
        </nav>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. CATEGORY PRODUCTS VIEW (when category or search is active)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-slate-50/50 flex flex-col justify-between overflow-x-hidden">
      {/* Header: Back to Categories + Tex’s Chicken & Burgers + Profile + Cart */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-2.5 py-2 sm:px-4 sm:py-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-2 max-w-[1500px] mx-auto">
          <button
            type="button"
            onClick={() => {
              setSearchParams({});
              setSearch("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 group text-left"
          >
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 group-hover:bg-emerald-100 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <img
              src="/branding/logo.png"
              alt="Tex’s Chicken & Burgers"
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain rounded-md border border-slate-100 bg-white p-0.5 shadow-xs"
            />
            <div>
              <h1 className="text-xs sm:text-base font-extrabold text-slate-900 leading-tight">
                Tex’s Chicken & Burgers
              </h1>
              <p className="text-[9px] sm:text-xs text-slate-500 font-medium leading-none mt-0.5">
                Worth Every Bite
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/admin/login"
              id="header-user-button"
              aria-label="Account Login"
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200/80 transition-colors"
            >
              <UserRound className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-700" />
            </Link>
            <Link
              to="/cart"
              id="header-cart-button"
              aria-label="View shopping cart"
              className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200/80 transition-colors"
            >
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Container */}
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-2.5 sm:gap-3.5 px-2.5 sm:px-4 pt-2 sm:pt-3 pb-32 md:pb-8 flex-1">
        {/* Search Field */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-8.5 sm:h-10 pl-9 pr-3 rounded-lg sm:rounded-xl border-slate-200 bg-white focus:bg-white text-xs sm:text-sm placeholder:text-slate-400 focus-visible:ring-emerald-600 shadow-xs"
            placeholder={activeCategory ? `Search in ${activeCategory.name}...` : "Search menu items..."}
          />
        </div>

        {/* Back to Categories Link Bar */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => {
              setSearchParams({});
              setSearch("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Categories</span>
          </button>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 text-[10px] sm:text-xs">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            100% Certified Halal
          </span>
        </div>

        {/* Category Title & Horizontal Scrolling Tabs */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="space-y-0.5">
            <h2 className="text-xs sm:text-base font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <span>{isAllSelected ? "🍽️" : activeCategory ? activeCategory.emoji : (search.trim() ? "🔍" : "🍽️")}</span>
              <span>
                {isAllSelected
                  ? "All Products"
                  : activeCategory
                    ? activeCategory.name
                    : (search.trim()
                      ? "Search Results"
                      : (categoriesQuery.isLoading ? "Loading Category..." : "Halal Food Menu"))}
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-500 leading-tight">
              {isAllSelected
                ? "Showing all halal menu items"
                : activeCategory
                  ? activeCategory.description
                  : (search.trim()
                    ? `Showing results for "${search}"`
                    : (categoriesQuery.isLoading
                      ? "Fetching category items..."
                      : "Browse all certified halal dishes"))}
            </p>
          </div>

          {/* Horizontally scrollable row on mobile without wrapping */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              id="category-tab-back"
              onClick={() => {
                setSearchParams({});
                setSearch("");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="shrink-0 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1 border border-slate-200 cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Categories</span>
            </button>
            <button
              type="button"
              id="category-tab-all"
              onClick={() => {
                setSearchParams({ category: "all" });
              }}
              className={`shrink-0 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isAllSelected
                  ? "bg-emerald-700 text-white font-bold shadow-xs hover:bg-emerald-800 border border-emerald-700"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-950 font-medium"
              }`}
            >
              <span className="text-xs sm:text-sm leading-none">🍽️</span>
              <span>All Products</span>
            </button>
            {displayCategories.map((category) => {
              const isSelected = activeCategory?.id === category.id;
              return (
                <button
                  key={category.id}
                  id={`category-tab-${category.slug || category.id}`}
                  type="button"
                  onClick={() => {
                    setSearchParams({ category: String(category.id) });
                  }}
                  className={`shrink-0 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-700 text-white font-bold shadow-xs hover:bg-emerald-800 border border-emerald-700"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-950 font-medium"
                  }`}
                >
                  <span className="text-xs sm:text-sm leading-none">{category.emoji}</span>
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Count Row */}
        <div className="flex items-center justify-between text-xs px-0.5 pt-0.5">
          <span className="font-bold text-slate-900 text-xs sm:text-sm">
            {products.length} Products
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 text-[10px] sm:text-xs">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Fresh & Halal
          </span>
        </div>

        {/* Main Catalog Content Area */}
        <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Desktop Aside Filters (hidden on mobile) */}
          <aside className="hidden lg:block rounded-xl border border-slate-200 bg-white p-4 shadow-xs self-start">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Filters
            </h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">Category</Label>
                <Select
                  value={isAllSelected ? "all" : (activeCategory ? String(activeCategory.id) : "")}
                  onValueChange={(val) => {
                    setSearchParams({ category: val });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🍽️ All Products</SelectItem>
                    {displayCategories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.emoji} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FilterCheck label="100% Certified Halal" checked />
              <FilterCheck label="Platters Over Rice" />
              <FilterCheck label="Pita Gyros & Wraps" />
              <FilterCheck label="Wings & Sides" />
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">Price Range</Label>
                <div className="rounded-md border p-2.5 text-xs text-muted-foreground">$1.00 ───── $30.00</div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">Restaurant</Label>
                <Select defaultValue="all">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">Tex’s Chicken & Burgers</SelectItem></SelectContent>
                </Select>
              </div>
              <FilterCheck label="Available to Order" checked />
              <Button
                variant="outline"
                className="w-full text-xs font-medium cursor-pointer"
                onClick={() => {
                  setSearchParams({});
                  setSearch("");
                }}
              >
                Back to All Categories
              </Button>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="min-w-0 space-y-4">
            {/* Desktop-only sort bar */}
            <div className="hidden lg:flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Sort by:</span>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Featured & Newest</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs font-medium text-slate-600">{products.length} Products displayed</p>
            </div>

            {/* 2 Products Per Row on Mobile (grid-cols-2) */}
            {productsQuery.isLoading ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-56 sm:h-80 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={(quantity) => addProductToCart(product, quantity)}
                    pending={addToCart.isPending}
                  />
                ))}
              </div>
            )}

            {!productsQuery.isLoading && !products.length && (
              <Card className="border-dashed border-2 border-slate-200 bg-white">
                <CardContent className="flex min-h-60 flex-col items-center justify-center p-8 text-center">
                  <Package className="mb-3 h-10 w-10 text-slate-300" />
                  <h2 className="font-semibold text-slate-900 text-sm sm:text-base">
                    No products available in this category.
                  </h2>
                  <p className="mt-1 max-w-md text-xs sm:text-sm text-slate-500">
                    Try selecting another category or adjusting your search keywords.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      className="text-xs font-semibold cursor-pointer"
                      onClick={() => {
                        setSearchParams({});
                        setSearch("");
                      }}
                    >
                      Browse All Categories
                    </Button>
                    <Button
                      variant="default"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
                      onClick={() => {
                        setSearchParams({ category: "all" });
                      }}
                    >
                      View All Products
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 100% Certified Halal Trust Banner */}
            <div className="mt-4 rounded-xl border border-emerald-800/40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 px-4 py-3 text-center text-white shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-wide text-amber-300 uppercase">
                <span className="text-sm">☪</span>
                <span>100% CERTIFIED HALAL</span>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-200/90 font-medium mt-0.5">
                Fresh • Healthy • Pure Taste
              </p>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Filter + Sort Bar (directly above bottom nav) */}
      <div className="md:hidden fixed bottom-[calc(48px+max(0.25rem,env(safe-area-inset-bottom,0px)))] left-0 right-0 z-40 flex h-9.5 items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <Drawer>
          <DrawerTrigger asChild>
            <button
              type="button"
              id="mobile-filter-button"
              className="flex-1 flex items-center justify-center gap-1.5 h-full text-xs font-semibold text-slate-700 hover:text-slate-950 active:bg-slate-50 transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-600" />
              Filters
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Category</Label>
                <Select
                  value={isAllSelected ? "all" : (activeCategory ? String(activeCategory.id) : "")}
                  onValueChange={(val) => {
                    setSearchParams({ category: val });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🍽️ All Products</SelectItem>
                    {displayCategories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.emoji} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FilterCheck label="100% Certified Halal" checked />
              <FilterCheck label="In Stock" checked />
              <Button
                variant="outline"
                className="w-full text-xs font-semibold cursor-pointer"
                onClick={() => {
                  setSearchParams({});
                  setSearch("");
                }}
              >
                Back to All Categories
              </Button>
            </div>
          </DrawerContent>
        </Drawer>

        <div className="h-5 w-px bg-slate-200 shrink-0" />

        <Drawer>
          <DrawerTrigger asChild>
            <button
              type="button"
              id="mobile-sort-button"
              className="flex-1 flex items-center justify-center gap-1.5 h-full text-xs font-semibold text-slate-700 hover:text-slate-950 active:bg-slate-50 transition-colors"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-600" />
              Sort
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Sort Products</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-2">
              {[
                { key: "newest", label: "Featured & Newest" },
                { key: "price_asc", label: "Price: Low to High" },
                { key: "price_desc", label: "Price: High to Low" },
                { key: "rating", label: "Highest Rated (★)" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSort(opt.key)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    sort === opt.key
                      ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{opt.label}</span>
                  {sort === opt.key && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Mobile Bottom Navigation - Categories is ACTIVE GREEN */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] border-t border-[#E5E7EB] shadow-[0_-1px_6px_rgba(0,0,0,0.04)] px-2 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="grid grid-cols-4 items-center max-w-md mx-auto">
          {/* 1. Home */}
          <Link
            to="/"
            id="mobile-nav-home"
            className="flex flex-col items-center justify-center py-0.5 text-slate-500 hover:text-slate-800 font-medium transition-colors group"
          >
            <Home className="h-5 w-5 text-slate-500 group-hover:text-slate-800 group-hover:scale-110 transition-all" />
            <span className="text-[10px] xs:text-[11px] mt-0.5 leading-none">Home</span>
          </Link>

          {/* 2. Categories - ACTIVE GREEN */}
          <Link
            to="/products"
            id="mobile-nav-categories"
            onClick={() => {
              setSearchParams({});
              setSearch("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex flex-col items-center justify-center py-0.5 text-emerald-700 font-bold transition-colors group"
          >
            <LayoutGrid className="h-5 w-5 text-emerald-700 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] xs:text-[11px] font-bold mt-0.5 leading-none">Categories</span>
          </Link>

          {/* 3. Cart */}
          <Link
            to="/cart"
            id="mobile-nav-cart"
            className="relative flex flex-col items-center justify-center py-0.5 text-slate-500 hover:text-slate-800 font-medium transition-colors group"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5 text-slate-500 group-hover:text-slate-800 group-hover:scale-110 transition-all" />
              {!!cartCount && (
                <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] xs:text-[11px] mt-0.5 leading-none">Cart</span>
          </Link>

          {/* 4. About */}
          <Link
            to="/about"
            id="mobile-nav-about"
            className="flex flex-col items-center justify-center py-0.5 text-slate-500 hover:text-slate-800 font-medium transition-colors group"
          >
            <Info className="h-5 w-5 text-slate-500 group-hover:text-slate-800 group-hover:scale-110 transition-all" />
            <span className="text-[10px] xs:text-[11px] mt-0.5 leading-none">About</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

{/* ====================================================================== */}
{/* RESTAURANT PRODUCT CARD COMPONENT                                       */}
{/* ====================================================================== */}
function ProductCard({
  product,
  onAdd,
  pending,
}: {
  product: CatalogProduct;
  onAdd: (quantity: number) => void;
  pending?: boolean;
}) {
  const price = toNumber(product.unitPrice);
  const compareAt = toNumber((product as unknown as { compareAtPrice?: unknown }).compareAtPrice);
  const moq = product.minimumOrderQuantity ?? 1;
  const unit = product.unitType ?? "order";
  const stock = typeof product.stock === "number" ? product.stock : 100;
  const isOutOfStock = stock < moq && typeof product.stock === "number";
  const [quantity, setQuantity] = useState(moq);
  const [imageFailed, setImageFailed] = useState(false);
  const unitLabel = unitLabels[unit] ?? unit;

  return (
    <Card
      id={`product-card-${product.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between p-0 py-0 gap-0"
    >
      <div className="flex flex-col flex-1">
        {/* 1. Food Image - Compact on mobile (~35-40% of card) */}
        <div className="relative aspect-[16/10] sm:aspect-[4/3] bg-slate-100 overflow-hidden shrink-0">
          <Link to={`/products/${product.slug}`} className="block h-full w-full">
            {product.image && !imageFailed ? (
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <ImageIcon className="h-6 w-6 sm:h-10 sm:w-10" />
              </div>
            )}
          </Link>

          {/* 2. Offer badge */}
          {compareAt > price && (
            <span className="absolute top-1.5 left-1.5 z-10 rounded-full bg-amber-500 px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-950 shadow-xs leading-none">
              Offer
            </span>
          )}
        </div>

        {/* Product Information */}
        <div className="p-2 sm:p-3 flex flex-col gap-0.5 sm:gap-1 flex-1">
          {/* 3. Product Name */}
          <Link
            id={`product-name-${product.id}`}
            to={`/products/${product.slug}`}
            className="font-bold text-[11px] xs:text-xs sm:text-sm text-slate-900 leading-tight line-clamp-2 hover:text-emerald-700 transition-colors break-words min-h-[26px] xs:min-h-[28px] sm:min-h-[36px]"
          >
            {product.name}
          </Link>

          {/* 4. "Tex’s Chicken & Burgers" */}
          <p className="text-[9px] xs:text-[10px] sm:text-xs font-normal text-slate-500 leading-none truncate">
            {product.supplierName ?? "Tex’s Chicken & Burgers"}
          </p>

          {/* 5. Selling price + original price */}
          <div className="flex items-baseline justify-between gap-1 pt-0.5 min-w-0">
            <span className="text-xs xs:text-sm sm:text-base font-extrabold text-emerald-700 leading-none shrink-0">
              {formatCurrency(price)}
            </span>
            {compareAt > price ? (
              <span className="text-[9px] xs:text-[10px] sm:text-xs text-slate-400 font-medium line-through leading-none truncate">
                {formatCurrency(compareAt)}
              </span>
            ) : product.unitSize ? (
              <span className="text-[8.5px] xs:text-[9px] text-slate-400 truncate">({product.unitSize})</span>
            ) : null}
          </div>

          {/* 6. Rating + Certified Halal */}
          <div className="flex items-center justify-between gap-0.5 pt-0.5 min-w-0">
            <div className="flex items-center gap-0.5 text-[9px] xs:text-[10px] sm:text-xs font-bold text-slate-800 shrink-0">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-amber-400 text-amber-400 shrink-0" />
              <span>{product.rating ?? "4.8"}</span>
            </div>
            <div className="inline-flex items-center gap-0.5 rounded bg-emerald-50 border border-emerald-200/80 px-1 py-0.5 text-[7px] xs:text-[8px] sm:text-[9.5px] font-semibold text-emerald-700 shrink-0 whitespace-nowrap">
              <CheckCircle2 className="h-2 w-2 xs:h-2.5 xs:w-2.5 text-emerald-600 shrink-0" />
              <span>Halal</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Quantity control + Add button (Contained within card, no overflow) */}
      <div className="p-2 sm:p-3 pt-0">
        <div className="flex items-center justify-between gap-1 min-w-0">
          <div className="flex items-center rounded border border-slate-200 bg-slate-50 p-0.5 shrink-0">
            <button
              id={`product-qty-minus-${product.id}`}
              type="button"
              className="h-5 w-5 p-0 flex items-center justify-center rounded text-slate-600 hover:bg-white hover:text-slate-900 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              onClick={() => setQuantity(Math.max(moq, quantity - 1))}
              disabled={quantity <= moq || isOutOfStock}
              aria-label="Decrease quantity"
            >
              <Minus className="h-2.5 w-2.5" />
            </button>
            <span className="w-3.5 text-center text-[10px] sm:text-xs font-bold text-slate-800 leading-none select-none">
              {quantity}
            </span>
            <button
              id={`product-qty-plus-${product.id}`}
              type="button"
              className="h-5 w-5 p-0 flex items-center justify-center rounded text-slate-600 hover:bg-white hover:text-slate-900 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              onClick={() => {
                if (quantity >= stock) {
                  toast.error(`Only ${stock} available.`);
                } else {
                  setQuantity(quantity + 1);
                }
              }}
              disabled={isOutOfStock}
              aria-label="Increase quantity"
            >
              <Plus className="h-2.5 w-2.5" />
            </button>
          </div>

          <button
            id={`product-add-btn-${product.id}`}
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-6 sm:h-7 px-2 xs:px-2.5 text-[10px] sm:text-xs rounded shadow-xs active:scale-[0.98] shrink-0 flex items-center justify-center leading-none transition-colors disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => onAdd(quantity)}
            disabled={pending || isOutOfStock}
          >
            {isOutOfStock ? "Out" : "Add"}
          </button>
        </div>
      </div>
    </Card>
  );
}
function OwnerProductCatalog() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);

  const utils = trpc.useUtils();
  const categoriesQuery = trpc.category.list.useQuery(undefined, { retry: false });
  const productsQuery = trpc.product.list.useQuery(
    {
      search: search || undefined,
      categoryId: selectedCategory !== "all" ? Number(selectedCategory) : undefined,
      status: selectedStatus !== "all" ? selectedStatus : undefined,
      sortBy: "newest",
    },
    { retry: false }
  );

  const deleteProductMutation = trpc.product.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.product.list.invalidate(),
        utils.product.stats.invalidate(),
      ]);
      toast.success("Menu item removed successfully.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove menu item.");
    },
  });

  const rawProducts = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  const products = useMemo(() => {
    let list = rawProducts;
    if (featuredOnly) {
      list = list.filter((p) => p.isFeatured || p.showInFreshDeals || (typeof p.tags === "string" && p.tags.includes("featured")));
    }
    return list;
  }, [rawProducts, featuredOnly]);

  const stats = useMemo(() => ({
    total: rawProducts.length,
    active: rawProducts.filter((product) => product.status === "active").length,
    inactive: rawProducts.filter((product) => product.status !== "active" || (product.stock !== undefined && product.stock <= 0)).length,
    featured: rawProducts.filter((product) => product.isFeatured || product.showInFreshDeals || (typeof product.tags === "string" && product.tags.includes("featured"))).length,
  }), [rawProducts]);

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the menu?`)) {
      deleteProductMutation.mutate({ id });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Product Catalog</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage Tex’s Chicken & Burgers food menu items, categories, pricing, and availability.
          </p>
        </div>
        <Link to="/products/new">
          <Button className="bg-primary hover:bg-primary/90 shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Menu Items" value={stats.total} loading={productsQuery.isLoading} />
        <MetricCard title="Active on Menu" value={stats.active} loading={productsQuery.isLoading} />
        <MetricCard title="Out of Stock / Draft" value={stats.inactive} loading={productsQuery.isLoading} />
        <MetricCard title="Featured Specials" value={stats.featured} loading={productsQuery.isLoading} />
      </section>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
                placeholder="Search dishes by name, ingredients, or category..."
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active / Serving</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={featuredOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setFeaturedOnly(!featuredOnly)}
                className="h-10 gap-1.5"
              >
                <Star className={`h-4 w-4 ${featuredOnly ? "fill-current" : ""}`} />
                Featured Only
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {productsQuery.isLoading ? (
          Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-xl" />)
        ) : products.length ? (
          products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/60 text-muted-foreground">
                      <Utensils className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/products/${product.slug}`}
                      className="truncate font-semibold text-foreground hover:text-primary transition-colors text-base"
                    >
                      {product.name}
                    </Link>
                    {product.isFeatured && (
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 flex items-center gap-1 text-[11px] py-0 h-5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      {product.categoryName ?? "Halal Food"}
                    </span>
                    <span>•</span>
                    <Badge variant="outline" className="text-[11px] py-0 h-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-normal">
                      100% Halal
                    </Badge>
                    {product.unitSize && (
                      <>
                        <span>•</span>
                        <span>{product.unitSize}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-3 md:border-t-0 md:pt-0 md:justify-end">
                <div className="text-left md:text-right">
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(product.unitPrice)}
                  </p>
                  {toNumber(product.compareAtPrice) > toNumber(product.unitPrice) && (
                    <p className="text-xs text-muted-foreground line-through">
                      {formatCurrency(product.compareAtPrice)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={product.status === "active" ? "default" : "secondary"}
                    className={`capitalize ${
                      product.status === "active"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {product.status === "active" ? "Active" : product.status}
                  </Badge>

                  <Link to={`/products/${product.slug}/edit`}>
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </Link>

                  <Link to={`/products/${product.slug}`}>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={deleteProductMutation.isPending}
                    title="Delete menu item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground bg-card space-y-2">
            <Utensils className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="font-medium text-foreground">No menu items found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search query or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterCheck({ label, checked = false }: { label: string; checked?: boolean }) {
  return (
    <Label className="flex items-center gap-2 text-sm">
      <Checkbox defaultChecked={checked} />
      {label}
    </Label>
  );
}
