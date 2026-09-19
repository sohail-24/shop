import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  Utensils,
  Beef,
  Sandwich,
  Flame,
  Cookie,
  CupSoda,
  LayoutGrid,
  Image as ImageIcon,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  UserRound,
  Heart,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { addGuestCartItem, useGuestCart } from "@/lib/guestCart";
import { formatCurrency, formatNumber, toNumber, unitLabels } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type MarketplaceProduct = {
  id: number;
  slug: string;
  name: string;
  image?: string | null;
  supplierName?: string | null;
  categoryName?: string | null;
  unitPrice?: string | number | null;
  compareAtPrice?: string | number | null;
  unitType?: string | null;
  unitSize?: string | null;
  minimumOrderQuantity?: number | null;
  stock?: number | string | null;
  rating?: string | number | null;
  grade?: string | null;
  organic?: boolean | null;
  status?: string | null;
};

type MarketplaceCategory = {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
};

interface CategoryNavItem {
  key: string;
  name: string;
  icon: React.ElementType;
  emoji: string;
  dbCategorySlug?: string;
  subSearch?: string;
}

const SIDEBAR_CATEGORIES: CategoryNavItem[] = [
  { key: "all", name: "All Products", icon: LayoutGrid, emoji: "▦" },
  { key: "platters", name: "Platters", icon: Utensils, emoji: "🍛", dbCategorySlug: "platters" },
  { key: "gyros", name: "Gyros", icon: Beef, emoji: "🌯", dbCategorySlug: "gyros" },
  { key: "burgers", name: "Burgers", icon: Sandwich, emoji: "🍔", subSearch: "burger" },
  { key: "party-wings", name: "Party Wings", icon: Flame, emoji: "🍗", dbCategorySlug: "party-wings" },
  { key: "rice-bowls", name: "Rice Bowls", icon: Utensils, emoji: "🍚", dbCategorySlug: "platters" },
  { key: "sandwiches", name: "Sandwiches", icon: Sandwich, emoji: "🥪", subSearch: "sandwich" },
  { key: "salads", name: "Salads", icon: Sparkles, emoji: "🥗", subSearch: "salad" },
  { key: "sides", name: "Sides", icon: Cookie, emoji: "🍟", dbCategorySlug: "sides" },
  { key: "beverages", name: "Beverages", icon: CupSoda, emoji: "🥤", dbCategorySlug: "drinks" },
  { key: "desserts", name: "Desserts", icon: Cookie, emoji: "🍰", subSearch: "baklava" },
];

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const guestCart = useGuestCart();
  const [search, setSearch] = useState("");
  const [selectedCategoryKey, setSelectedCategoryKey] = useState("all");
  const [sort, setSort] = useState<"newest" | "price" | "name">("newest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true);
  const utils = trpc.useUtils();

  const categoriesQuery = trpc.category.list.useQuery(undefined, { retry: false });
  const categoriesRaw = categoriesQuery.data;
  const categories = useMemo(
    () => (categoriesRaw ?? []) as MarketplaceCategory[],
    [categoriesRaw],
  );

  const selectedNavItem = useMemo(
    () => SIDEBAR_CATEGORIES.find((item) => item.key === selectedCategoryKey) ?? SIDEBAR_CATEGORIES[0],
    [selectedCategoryKey],
  );

  const effectiveCategoryId = useMemo(() => {
    if (selectedNavItem.key === "all" || !selectedNavItem.dbCategorySlug) return undefined;
    const match = categories.find(
      (c) =>
        c.slug === selectedNavItem.dbCategorySlug ||
        c.name.toLowerCase().includes(selectedNavItem.dbCategorySlug!),
    );
    return match ? match.id : undefined;
  }, [categories, selectedNavItem]);

  const effectiveSearch = useMemo(() => {
    const parts = [search.trim(), selectedNavItem.subSearch].filter(Boolean);
    return parts.join(" ") || undefined;
  }, [search, selectedNavItem]);

  const productsQuery = trpc.product.list.useQuery(
    {
      search: effectiveSearch,
      categoryId: effectiveCategoryId,
      status: "active",
      sortBy: sort,
      sortOrder: sortOrder,
    },
    { retry: false },
  );

  const cartQuery = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: async () => {
      await utils.cart.list.invalidate();
      toast.success("Product added to cart.");
    },
    onError: (error) => toast.error(error.message || "Could not add product to cart."),
  });

  const products = (productsQuery.data ?? []) as MarketplaceProduct[];

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const grid = document.getElementById("products-grid");
    if (grid) {
      grid.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleOrderNow() {
    setSelectedCategoryKey("all");
    const grid = document.getElementById("products-grid");
    if (grid) {
      grid.scrollIntoView({ behavior: "smooth" });
    }
  }

  function addProductToCart(product: MarketplaceProduct, quantity: number) {
    if (isAuthenticated) {
      addToCart.mutate({ productId: product.id, quantity });
      return;
    }
    addGuestCartItem({
      id: product.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productImage: product.image ?? null,
      productUnitType: product.unitType ?? "order",
      productUnitSize: product.unitSize ?? product.unitType ?? "1 order",
      quantity,
      unitPrice: String(product.unitPrice ?? 0),
    });
    toast.success("Product added to cart.");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-row">
      {/* ====================================================================== */}
      {/* 1. MOBILE LEFT CATEGORY PANEL (~31% WIDTH, OPEN BY DEFAULT ON PHONE)   */}
      {/* ====================================================================== */}
      {mobileMenuOpen && (
        <aside className="md:hidden w-[31%] shrink-0 sticky top-0 h-screen bg-[#033b2c] border-r border-[#022c22] text-white p-1.5 xs:p-2 flex flex-col justify-between overflow-y-auto hide-scrollbar z-30 select-none">
          <div className="flex flex-col">
            {/* 1. Close button ✕ */}
            <div className="flex justify-end pb-1">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-md transition-colors"
                aria-label="Close categories panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 2. AM FRUITS logo */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center p-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 mb-1 shadow-xs">
                <img
                  src="/branding/am-fruits-logo.png"
                  alt="AM Fruits - Shah's Halal"
                  className="h-8 xs:h-9 w-auto object-contain"
                />
              </div>

              {/* 3. Shah's Halal */}
              <h2 className="text-xs xs:text-sm font-extrabold tracking-tight text-white leading-tight">
                Shah&apos;s Halal
              </h2>

              {/* 4. Fresh Food · Pure Taste */}
              <p className="mt-0.5 text-[8px] xs:text-[9px] font-semibold text-emerald-300/90 tracking-wide text-center leading-tight">
                Fresh Food · Pure Taste
              </p>
            </div>

            {/* 5. Divider */}
            <div className="w-full my-2 border-b border-emerald-800/60" />

            {/* 6-16. Categories */}
            <nav className="space-y-0.5">
              {SIDEBAR_CATEGORIES.map((item) => {
                const isActive = selectedCategoryKey === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryKey(item.key);
                      const grid = document.getElementById("products-grid");
                      if (grid) {
                        grid.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className={`w-full flex items-center gap-1.5 px-1.5 xs:px-2 py-1.5 rounded-lg text-left transition-all ${
                      isActive
                        ? "bg-emerald-700 text-white font-bold shadow-xs ring-1 ring-emerald-400/50"
                        : "text-emerald-100/80 hover:bg-emerald-800/60 hover:text-white"
                    }`}
                  >
                    <span className="text-xs xs:text-sm select-none leading-none shrink-0">{item.emoji}</span>
                    <span className="text-[10px] xs:text-[11px] font-medium leading-tight truncate">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 17. Good Food Brings Good People & 18/19. ☪ HALAL CERTIFIED HALAL */}
          <div className="pt-2.5 mt-2.5 border-t border-emerald-800/60 flex flex-col items-center text-center gap-1.5 pb-1 shrink-0">
            <div className="text-[9px] xs:text-[10px] italic text-emerald-200/90 font-medium leading-tight">
              <p>Good Food</p>
              <p>Brings Good People</p>
            </div>
            <div className="inline-flex flex-col items-center gap-0.5 rounded-lg bg-emerald-950/90 border border-amber-400/40 px-2 py-0.5 text-amber-300 shadow-xs">
              <div className="flex items-center gap-1 text-[9px] xs:text-[10px] font-bold">
                <span className="text-amber-400 text-xs">☪</span>
                <span>HALAL</span>
              </div>
              <span className="text-[7.5px] xs:text-[8px] font-semibold text-emerald-300 uppercase tracking-wider">
                CERTIFIED HALAL
              </span>
            </div>
          </div>
        </aside>
      )}

      {/* ====================================================================== */}
      {/* 2. PERMANENT LEFT VERTICAL CATEGORY SIDEBAR (DESKTOP / TABLET)         */}
      {/* ====================================================================== */}
      <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 md:sticky md:top-0 md:h-screen bg-[#033b2c] border-r border-[#022c22] text-white p-5 flex-col justify-between overflow-y-auto hide-scrollbar z-30 select-none">
        <div>
          {/* Top Brand Header */}
          <div className="flex flex-col items-center text-center pb-4 border-b border-emerald-800/60">
            <Link to="/" className="group flex flex-col items-center">
              <div className="flex items-center justify-center p-2 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 mb-2.5 shadow-md transition-transform group-hover:scale-105">
                <img
                  src="/branding/am-fruits-logo.png"
                  alt="Shah's Halal"
                  className="h-14 w-auto object-contain"
                />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                Shah's Halal
              </h2>
              <p className="mt-0.5 text-xs font-medium text-emerald-300/90 tracking-wide">
                Fresh Food • Pure Taste
              </p>
            </Link>
          </div>

          {/* Category Navigation Items */}
          <nav className="mt-4 space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-emerald-300/70">
              Menu Categories
            </div>
            {SIDEBAR_CATEGORIES.map((item) => {
              const isActive = selectedCategoryKey === item.key;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryKey(item.key);
                    const grid = document.getElementById("products-grid");
                    if (grid) {
                      grid.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className={`w-full group flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                    isActive
                      ? "bg-emerald-700 text-white font-semibold shadow-xs ring-1 ring-emerald-400/50"
                      : "text-emerald-100/80 hover:bg-emerald-800/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base select-none leading-none">{item.emoji}</span>
                    <span>{item.name}</span>
                  </div>
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-amber-300" : "text-emerald-400/60"
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Brand Statement & Halal Certification */}
        <div className="pt-5 mt-5 border-t border-emerald-800/60 flex flex-col items-center text-center gap-2">
          <p className="text-xs italic text-emerald-200/90 font-medium">
            &ldquo;Good Food Brings Good People&rdquo;
          </p>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/90 border border-amber-400/40 px-3 py-1 text-[11px] font-bold text-amber-300 shadow-xs">
            <span className="text-amber-400 text-xs">☪</span>
            <span>HALAL • CERTIFIED HALAL</span>
          </div>
        </div>
      </aside>

      {/* ====================================================================== */}
      {/* 3. RIGHT MAIN CONTENT AREA (TAKES ALL REMAINING SPACE)                 */}
      {/* ====================================================================== */}
      <div className={`${mobileMenuOpen ? "w-[69%]" : "w-full"} md:w-auto flex-1 min-w-0 flex flex-col`}>
        {/* ==================================================================== */}
        {/* DESKTOP HEADER (>= md screens)                                       */}
        {/* ==================================================================== */}
        <header className="hidden md:block sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-xs px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side: Shah's Halal branding */}
            <div>
              <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
                Shah's Halal
              </h1>
              <p className="text-xs lg:text-sm font-medium text-emerald-700 mt-1">
                Fresh Food • Pure Taste • Always Halal
              </p>
            </div>

            {/* Right side: Login and Cart buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-slate-700 hover:text-emerald-700 font-semibold">
                    <UserRound className="h-4 w-4" />
                    <span>{user?.name ?? "Dashboard"}</span>
                  </Button>
                </Link>
              )}
              <Link to="/admin/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 gap-2 border-slate-300 text-slate-800 hover:border-emerald-600 hover:text-emerald-700 font-semibold rounded-xl"
                >
                  <UserRound className="h-4 w-4 text-emerald-700" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link to="/cart">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative h-10 px-4 gap-2 border-slate-300 text-slate-800 hover:border-emerald-600 hover:text-emerald-700 font-semibold rounded-xl"
                >
                  <ShoppingCart className="h-4 w-4 text-emerald-700" />
                  <span>Cart</span>
                  {!!(isAuthenticated ? cartQuery.data?.count : guestCart.count) && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-bold text-white shadow-xs">
                      {isAuthenticated ? cartQuery.data?.count : guestCart.count}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar on Desktop */}
          <form onSubmit={handleSearchSubmit} className="relative mt-3.5 w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, platters, burgers, and more..."
              className="h-11 w-full rounded-xl border-slate-300 bg-slate-50/80 pl-11 pr-24 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-4 shadow-xs"
            >
              Search
            </Button>
          </form>
        </header>

        {/* ==================================================================== */}
        {/* MOBILE HEADER (< md screens)                                         */}
        {/* ==================================================================== */}
        <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
          <div className="flex items-center justify-between gap-1.5 px-2 xs:px-3 py-2">
            <div className="flex items-center gap-1 xs:gap-1.5 min-w-0">
              {!mobileMenuOpen && (
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-1 -ml-1 text-slate-700 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5 xs:h-6 xs:w-6 text-slate-800" />
                </button>
              )}
              <Link to="/" className="flex items-center gap-1.5 min-w-0">
                {!mobileMenuOpen && (
                  <div className="flex items-center justify-center p-1 rounded-lg bg-emerald-900 border border-emerald-800 shrink-0">
                    <img
                      src="/branding/am-fruits-logo.png"
                      alt="Shah's Halal"
                      className="h-5 xs:h-6 w-auto object-contain"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="block text-xs xs:text-sm font-extrabold tracking-tight text-slate-900 leading-tight truncate">
                    Shah&apos;s Halal
                  </span>
                  <span className="block text-[8px] xs:text-[9.5px] font-semibold text-emerald-700 leading-none truncate">
                    Fresh Food • Pure Taste
                  </span>
                </div>
              </Link>
            </div>

            {/* Mobile Header Right Actions: Login & Cart */}
            <div className="flex items-center gap-1 xs:gap-1.5 shrink-0">
              <Link to="/admin/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 xs:h-8 px-1.5 xs:px-2.5 text-[11px] xs:text-xs font-semibold border-slate-300 text-slate-800 hover:border-emerald-600 hover:text-emerald-700 rounded-lg gap-1 shadow-xs"
                >
                  <UserRound className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-emerald-700" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link to="/cart">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative h-7 xs:h-8 px-1.5 xs:px-2.5 text-[11px] xs:text-xs font-semibold border-slate-300 text-slate-800 hover:border-emerald-600 hover:text-emerald-700 rounded-lg gap-1 shadow-xs"
                >
                  <ShoppingCart className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-emerald-700" />
                  <span>Cart</span>
                  {!!(isAuthenticated ? cartQuery.data?.count : guestCart.count) && (
                    <span className="flex h-3.5 min-w-3.5 xs:h-4 xs:min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] xs:text-[10px] font-bold text-white shadow-xs">
                      {isAuthenticated ? cartQuery.data?.count : guestCart.count}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Search Input */}
          <div className="px-2 xs:px-3 pb-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="h-8 xs:h-9 w-full rounded-lg border-slate-300 bg-slate-50 pl-8 pr-16 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 h-6 xs:h-7 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] xs:text-[11px] font-semibold rounded-md px-2 shadow-xs"
              >
                Search
              </Button>
            </form>
          </div>
        </header>

        {/* ==================================================================== */}
        {/* HOMEPAGE BODY: TWO-COLUMN PRODUCT GRID & HERO                        */}
        {/* ==================================================================== */}
        <main className="flex-1 p-1.5 xs:p-2 sm:p-5 md:p-6 lg:p-8 w-full">
          <div className="space-y-3 sm:space-y-5 lg:space-y-6">
            {/* HERO BANNER */}
            <HeroBanner onOrderNow={handleOrderNow} />

            {/* PRODUCTS SECTION HEADER & SORTING */}
            <div
              id="products-grid"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 pt-0.5 sm:pt-2"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm xs:text-base sm:text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Fresh Halal Products
                </h2>
                {selectedNavItem.key !== "all" && (
                  <span className="inline-flex items-center rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-800">
                    {selectedNavItem.name}
                  </span>
                )}
              </div>

              {/* Sorting Control */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <span className="text-[11px] sm:text-xs font-medium text-slate-500">Sort by:</span>
                <select
                  value={`${sort}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSort, newOrder] = e.target.value.split("-") as [
                      "newest" | "price" | "name",
                      "asc" | "desc",
                    ];
                    setSort(newSort);
                    setSortOrder(newOrder);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-0.5 text-[11px] sm:text-sm font-semibold text-slate-700 shadow-xs hover:border-emerald-500 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="newest-desc">Popular ▼</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* TWO PRODUCTS PER ROW GRID (BOTH PHONE AND DESKTOP) */}
            <ProductGrid
              products={products}
              loading={productsQuery.isLoading}
              emptyMessage="No halal items match your current selection."
              onAdd={addProductToCart}
              pending={addToCart.isPending}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

{/* ====================================================================== */}
{/* HERO BANNER CAROUSEL COMPONENT                                         */}
{/* ====================================================================== */}
function HeroBanner({ onOrderNow }: { onOrderNow: () => void }) {
  const slides = [
    {
      title: "DELICIOUS HALAL FOOD",
      tagline: "Fresh Ingredients • Great Taste • Always Halal",
      description:
        "Authentic NYC-style chicken & lamb platters over spiced basmati rice, warm pita, crisp salad, and Shah's world-famous white and hot sauces.",
      image: "/products/chicken-platter.jpg",
      badge: "100% HALAL",
      cta: "ORDER NOW →",
    },
    {
      title: "AUTHENTIC GYROS & PLATTERS",
      tagline: "Wrapped Fresh in Warm Pita Bread",
      description:
        "Tender seasoned lamb, chicken shawarma, and golden falafel with cool garlic yogurt and fiery red hot sauce.",
      image: "/products/combo-platter.jpg",
      badge: "100% HALAL",
      cta: "ORDER NOW →",
    },
    {
      title: "SIGNATURE WINGS & SIDES",
      tagline: "Crispy • Saucy • Authentic Flavor",
      description:
        "Tossed in Sweet Chili, Honey BBQ, Buffalo, or Lemon Pepper with loaded seasoned fries, hummus, and golden baklava.",
      image: "/products/catering.jpg",
      badge: "100% HALAL",
      cta: "ORDER NOW →",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-3xl bg-emerald-950 text-white shadow-lg border border-emerald-900/60 min-h-[170px] sm:min-h-[320px] md:min-h-[380px] flex items-center">
      {/* Background image & gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={slide.image}
          alt={slide.title}
          className="h-full w-full object-cover object-center transition-all duration-700 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/85 to-emerald-950/50 md:to-transparent" />
        <div className="absolute inset-0 bg-radial from-transparent via-emerald-950/40 to-emerald-950/80" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 p-3 xs:p-4 sm:p-8 md:p-10 max-w-xl">
        <div className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-amber-300 backdrop-blur-xs mb-1.5 sm:mb-3 shadow-xs">
          <ShieldCheck className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-amber-400" />
          <span>{slide.badge}</span>
        </div>

        <h2 className="text-sm xs:text-base sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
          {slide.title}
        </h2>

        <p className="mt-0.5 sm:mt-2 text-[10px] xs:text-xs sm:text-base font-semibold text-emerald-300 line-clamp-1">
          {slide.tagline}
        </p>

        <p className="hidden sm:block mt-1 text-xs sm:text-sm text-emerald-100/80 line-clamp-2 max-w-md">
          {slide.description}
        </p>

        <div className="mt-2.5 sm:mt-6 flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            onClick={onOrderNow}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-3 py-1.5 h-7 xs:h-8 sm:h-11 text-[10px] xs:text-xs sm:text-sm rounded-lg sm:rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <span>{slide.cta}</span>
          </Button>
          <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-200 font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ready for Pickup & Delivery</span>
          </div>
        </div>
      </div>

      {/* Carousel Dots & Controls */}
      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-10 flex items-center gap-1 sm:gap-1.5 bg-black/40 backdrop-blur px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full border border-white/10">
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="text-white/70 hover:text-white transition-colors p-0.5"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-1 sm:h-2 rounded-full transition-all ${
              currentSlide === index ? "w-3 sm:w-6 bg-amber-400" : "w-1 sm:w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="text-white/70 hover:text-white transition-colors p-0.5"
          aria-label="Next slide"
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  );
}

{/* ====================================================================== */}
{/* PRODUCT GRID COMPONENT (TWO PRODUCTS PER ROW)                           */}
{/* ====================================================================== */}
function ProductGrid({
  products,
  loading,
  emptyMessage,
  onAdd,
  pending,
}: {
  products: MarketplaceProduct[];
  loading: boolean;
  emptyMessage: string;
  onAdd: (product: MarketplaceProduct, quantity: number) => void;
  pending?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-1.5 xs:gap-2 sm:gap-4 md:gap-5 lg:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[220px] xs:h-[260px] sm:h-[360px] md:h-[400px] rounded-lg sm:rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-2 gap-1.5 xs:gap-2 sm:gap-4 md:gap-5 lg:gap-6">
      {products.map((product) => (
        <FoodProductCard
          key={product.id}
          product={product}
          onAdd={onAdd}
          pending={pending}
        />
      ))}
    </div>
  );
}

{/* ====================================================================== */}
{/* PREMIUM FOOD PRODUCT CARD COMPONENT                                    */}
{/* ====================================================================== */}
function FoodProductCard({
  product,
  onAdd,
  pending,
}: {
  product: MarketplaceProduct;
  onAdd: (product: MarketplaceProduct, quantity: number) => void;
  pending?: boolean;
}) {
  const price = toNumber(product.unitPrice);
  const compareAt = toNumber(product.compareAtPrice);
  const moq = product.minimumOrderQuantity ?? 1;
  const unit = product.unitType ?? "order";
  const stock = typeof product.stock === "number" ? product.stock : 100;
  const isOutOfStock = stock < moq && typeof product.stock === "number";
  const [quantity, setQuantity] = useState(moq);
  const [imageFailed, setImageFailed] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const unitLabel = unitLabels[unit] ?? unit;

  return (
    <Card className="group overflow-hidden rounded-lg sm:rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Food Image with Zoom effect */}
        <div className="relative aspect-square sm:aspect-[4/3] md:aspect-[16/10] bg-slate-100 overflow-hidden">
          <Link to={`/products/${product.slug}`} className="block h-full w-full">
            {product.image && !imageFailed ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
            )}
          </Link>

          {/* SPECIAL OFFER Badge */}
          {compareAt > price && (
            <span className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-10 rounded-full bg-amber-500 px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 text-[8.5px] xs:text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-950 shadow-xs">
              Offer
            </span>
          )}

          {/* Wishlist Heart Toggle */}
          <button
            type="button"
            aria-label="Save to favorites"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
              if (!isWishlisted) {
                toast.success(`Saved "${product.name}" to favorites`);
              } else {
                toast.info(`Removed "${product.name}" from favorites`);
              }
            }}
            className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-10 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs text-slate-700 shadow-xs transition-transform hover:scale-110 active:scale-95 hover:bg-white"
          >
            <Heart
              className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors ${
                isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-600"
              }`}
            />
          </button>
        </div>

        {/* Product Information */}
        <CardContent className="p-1.5 xs:p-2 sm:p-4 md:p-5 space-y-1 sm:space-y-2.5">
          <div>
            <Link
              to={`/products/${product.slug}`}
              className="font-bold text-xs xs:text-sm sm:text-base md:text-lg text-slate-900 line-clamp-1 hover:text-emerald-700 transition-colors leading-snug"
            >
              {product.name}
            </Link>
            <p className="text-[9px] xs:text-[10px] sm:text-xs text-slate-400 truncate hidden xs:block">
              {product.supplierName ?? "Shah's Halal Food"}
            </p>
          </div>

          {/* Price and Comparison */}
          <div className="flex items-baseline flex-wrap gap-1 sm:gap-1.5">
            <span className="text-xs xs:text-sm sm:text-xl md:text-2xl font-extrabold text-emerald-700 leading-tight">
              {formatCurrency(price)}
            </span>
            {compareAt > price && (
              <span className="text-[9px] xs:text-xs sm:text-sm text-slate-400 line-through">
                {formatCurrency(compareAt)}
              </span>
            )}
            {product.unitSize ? (
              <span className="text-[9px] xs:text-[10px] sm:text-xs text-slate-500">({product.unitSize})</span>
            ) : unitLabel && unitLabel !== "item" && unitLabel !== "order" ? (
              <span className="text-[9px] xs:text-[10px] sm:text-xs text-slate-500">/{unitLabel}</span>
            ) : null}
          </div>

          {/* Rating and Certified Halal Badge */}
          <div className="flex items-center justify-between gap-1 pt-0.5 sm:pt-1">
            <div className="inline-flex items-center gap-0.5 xs:gap-1 rounded bg-emerald-50 border border-emerald-200/80 px-1 xs:px-1.5 py-0.5 text-[8.5px] xs:text-[9.5px] sm:text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Halal</span>
            </div>

            {product.rating ? (
              <div className="flex items-center gap-0.5 text-[9px] xs:text-[10px] sm:text-xs font-bold text-slate-700 shrink-0">
                <Star className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </div>

      {/* Action Controls: Quantity Selector and Add to Cart */}
      <div className="p-1.5 xs:p-2 sm:p-4 md:p-5 pt-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2 pt-1 sm:pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between sm:justify-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 self-stretch sm:self-auto">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 rounded hover:bg-white text-slate-700 transition-colors"
              onClick={() => setQuantity(Math.max(moq, quantity - 1))}
              disabled={quantity <= moq || isOutOfStock}
            >
              <Minus className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
            <span className="w-4 xs:w-6 sm:w-8 text-center text-[10px] xs:text-xs font-bold text-slate-800">
              {quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 rounded hover:bg-white text-slate-700 transition-colors"
              onClick={() => {
                if (quantity >= stock) {
                  toast.error(`Only ${stock} available.`);
                } else {
                  setQuantity(quantity + 1);
                }
              }}
              disabled={isOutOfStock}
            >
              <Plus className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
          </div>

          <Button
            type="button"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-6.5 xs:h-7.5 sm:h-9 text-[10px] xs:text-[11px] sm:text-xs md:text-sm rounded-lg shadow-xs gap-1 transition-all active:scale-[0.98] px-1 xs:px-1.5 sm:px-3"
            onClick={() => onAdd(product, quantity)}
            disabled={pending || isOutOfStock}
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Add to Cart</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

