import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  Home,
  Utensils,
  LayoutGrid,
  Image as ImageIcon,
  Search,
  ShoppingCart,
  Star,
  UserRound,
  Heart,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
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
  categoryId?: number;
}

const ALL_PRODUCTS_CATEGORY: CategoryNavItem = {
  key: "all",
  name: "All Products",
  icon: LayoutGrid,
  emoji: "▦",
};

export function toCategoryNavItem(category: MarketplaceCategory): CategoryNavItem {
  return {
    key: `category-${category.id}`,
    name: category.name,
    icon: Utensils,
    emoji: "🍽",
    categoryId: category.id,
  };
}

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const guestCart = useGuestCart();
  const [search, setSearch] = useState("");
  const [selectedCategoryKey, setSelectedCategoryKey] = useState("all");
  const [sort, setSort] = useState<"newest" | "price" | "name">("newest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const utils = trpc.useUtils();

  const categoriesQuery = trpc.category.list.useQuery(undefined, { retry: false });
  const categoriesRaw = categoriesQuery.data;
  const categories = useMemo(
    () => (categoriesRaw ?? []) as MarketplaceCategory[],
    [categoriesRaw],
  );
  const sidebarCategories = useMemo(
    () => [ALL_PRODUCTS_CATEGORY, ...categories.map(toCategoryNavItem)],
    [categories],
  );

  const selectedNavItem = useMemo(
    () => sidebarCategories.find((item) => item.key === selectedCategoryKey) ?? ALL_PRODUCTS_CATEGORY,
    [selectedCategoryKey, sidebarCategories],
  );

  useEffect(() => {
    if (selectedCategoryKey !== "all" && !sidebarCategories.some((item) => item.key === selectedCategoryKey)) {
      setSelectedCategoryKey("all");
    }
  }, [selectedCategoryKey, sidebarCategories]);

  const productsQuery = trpc.product.list.useQuery(
    {
      search: search.trim() || undefined,
      categoryId: selectedNavItem.categoryId,
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

  const cartCount = isAuthenticated ? (cartQuery.data?.count ?? 0) : guestCart.count;

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
      {/* 1. MOBILE LEFT CATEGORY PANEL (~28% WIDTH, PERMANENTLY VISIBLE)        */}
      {/* ====================================================================== */}
      <aside
        id="mobile-category-sidebar"
        style={{
          background: "linear-gradient(to bottom, #0F5132 0%, #062E1F 50%, #0F5132 100%)",
        }}
        className="md:hidden w-[28%] shrink-0 sticky top-0 h-screen border-r border-[#062E1F] text-white p-1 xs:p-1.5 pt-2.5 xs:pt-3 flex flex-col justify-between overflow-y-auto hide-scrollbar z-30 select-none"
      >
        <div className="flex flex-col">
          {/* AM FRUITS logo */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center p-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 mb-1 shadow-xs">
              <img
                src="/branding/am-fruits-logo.png"
                alt="Shah's Halal Food"
                className="h-8 xs:h-9 w-auto object-contain"
              />
            </div>

            {/* Shah's Halal */}
            <h2 className="text-xs xs:text-sm font-extrabold tracking-tight text-white leading-tight">
              Shah&apos;s Halal
            </h2>

            {/* Fresh Food · Pure Taste */}
            <p className="mt-0.5 text-[8px] xs:text-[9px] font-semibold text-emerald-300 tracking-wide text-center leading-tight">
              Fresh Food · Pure Taste
            </p>
          </div>

          {/* Divider */}
          <div className="w-full my-2 border-b border-emerald-800/60" />

          {/* Categories */}
          <nav className="flex flex-col gap-1 xs:gap-1.5">
            {sidebarCategories.map((item) => {
              const isActive = selectedCategoryKey === item.key;
              const isAllProducts = item.key === "all";
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
                    isAllProducts ? "mb-3.5 xs:mb-4" : ""
                  } ${
                    isActive
                      ? "bg-[#0b6e54] text-white font-bold shadow-xs ring-1 ring-emerald-400/50"
                      : "text-emerald-100/90 hover:bg-[#075c46]/60 hover:text-white"
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

        {/* Good Food Brings Good People & ☪ HALAL CERTIFIED HALAL */}
        <div className="pt-2.5 mt-2.5 border-t border-emerald-800/60 flex flex-col items-center text-center gap-1.5 pb-1 shrink-0">
          <div className="text-[9px] xs:text-[10px] italic text-emerald-200 font-medium leading-tight">
            <p>Good Food</p>
            <p>Brings Good People</p>
          </div>
          <div className="inline-flex flex-col items-center gap-0.5 rounded-lg bg-[#042d22] border border-amber-400/40 px-2 py-0.5 text-amber-300 shadow-xs">
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
          <nav className="mt-4 flex flex-col gap-1.5">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-emerald-300/70">
              Menu Categories
            </div>
            {sidebarCategories.map((item) => {
              const isActive = selectedCategoryKey === item.key;
              const isAllProducts = item.key === "all";
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
                    isAllProducts ? "mb-4" : ""
                  } ${
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
      <div className="w-[72%] md:w-auto flex-1 min-w-0 flex flex-col">
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
              <Link to="/" className="flex items-center gap-1.5 min-w-0">
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
        <main className="flex-1 p-1.5 xs:p-2 sm:p-5 md:p-6 lg:p-8 w-full pb-20 md:pb-8">
          <div className="space-y-3 sm:space-y-5 lg:space-y-6">
            {/* HERO BANNER */}
            <HeroBanner onOrderNow={handleOrderNow} />

            {/* PRODUCTS SECTION HEADER & SORTING */}
            <div
              id="products-grid"
              className="flex items-center justify-between gap-1.5 sm:gap-2 pt-0.5 sm:pt-2"
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

              {/* Sorting Control - Hidden on mobile, preserved on desktop */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
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

        {/* ==================================================================== */}
        {/* FIXED MOBILE BOTTOM NAVIGATION (< md screens)                        */}
        {/* ==================================================================== */}
        <nav
          id="mobile-bottom-nav"
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] border-t border-[#E5E7EB] shadow-[0_-1px_6px_rgba(0,0,0,0.04)] px-2 py-1"
        >
          <div className="grid grid-cols-4 items-center max-w-md mx-auto">
            {/* 1. Home */}
            <Link
              to="/"
              id="mobile-nav-home"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex flex-col items-center justify-center py-0.5 text-emerald-700 font-bold transition-colors group"
            >
              <Home className="h-5 w-5 text-emerald-700 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] xs:text-[11px] font-bold mt-0.5 leading-none">Home</span>
            </Link>

            {/* 2. Categories */}
            <Link
              to="/products"
              id="mobile-nav-categories"
              className="flex flex-col items-center justify-center py-0.5 text-slate-500 hover:text-slate-800 font-medium transition-colors group"
            >
              <LayoutGrid className="h-5 w-5 text-slate-500 group-hover:text-slate-800 group-hover:scale-110 transition-all" />
              <span className="text-[10px] xs:text-[11px] mt-0.5 leading-none">Categories</span>
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

            {/* 4. Login */}
            <Link
              to="/admin/login"
              id="mobile-nav-login"
              className="flex flex-col items-center justify-center py-0.5 text-slate-500 hover:text-slate-800 font-medium transition-colors group"
            >
              <UserRound className="h-5 w-5 text-slate-500 group-hover:text-slate-800 group-hover:scale-110 transition-all" />
              <span className="text-[10px] xs:text-[11px] mt-0.5 leading-none">Login</span>
            </Link>
          </div>
        </nav>
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
    <>
      {/* ================================================================ */}
      {/* MOBILE HERO: PREMIUM RESTAURANT ADVERTISEMENT (sm:hidden)        */}
      {/* ================================================================ */}
      <div className="sm:hidden relative overflow-hidden rounded-xl bg-emerald-950 text-white shadow-md border border-emerald-900/60 min-h-[160px] flex items-center">
        {/* Existing appetizing food image positioned prominently on the right */}
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 h-full w-full object-cover object-[80%_center] transition-all duration-700"
        />

        {/* Directional subtle dark gradient: deep emerald on left behind text, fading smoothly to 100% transparent on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/85 to-transparent w-[70%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/35 to-transparent" />

        {/* Content Container (Left Side) */}
        <div className="relative z-10 p-2.5 xs:p-3 max-w-[65%] flex flex-col justify-center">
          {/* Top Small Badge: 100% HALAL */}
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/60 px-1.5 py-0.5 text-[8.5px] font-bold text-amber-300 backdrop-blur-xs leading-none w-fit shadow-xs">
            <ShieldCheck className="h-2.5 w-2.5 text-amber-400 shrink-0" />
            <span>100% HALAL</span>
          </div>

          {/* Main Headline: DELICIOUS HALAL FOOD */}
          <h2 className="text-[13px] xs:text-[14px] font-black tracking-tight text-white leading-[1.12] uppercase mt-1">
            DELICIOUS<br />HALAL FOOD
          </h2>

          {/* Taste the Difference */}
          <p className="text-[10px] font-bold text-amber-300 mt-0.5 leading-tight">
            Taste the Difference
          </p>

          {/* Supporting Copy */}
          <div className="mt-1 text-[8px] xs:text-[8.5px] font-medium text-emerald-100/90 leading-tight">
            <p>Fresh Ingredients</p>
            <p className="text-emerald-200/80">Great Taste · Always Halal</p>
          </div>

          {/* Single Strong CTA: ORDER NOW → */}
          <div className="mt-2">
            <button
              type="button"
              onClick={onOrderNow}
              className="inline-flex items-center justify-center bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-2.5 py-1 text-[9px] xs:text-[9.5px] rounded-md shadow-md active:scale-95 transition-transform leading-none"
            >
              ORDER NOW →
            </button>
          </div>
        </div>

        {/* Carousel Indicator: ● ○ ○ (Unobtrusive in bottom right) */}
        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-full border border-white/10">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`rounded-full transition-all ${
                currentSlide === index
                  ? "h-1.5 w-2.5 bg-amber-400"
                  : "h-1.5 w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* DESKTOP HERO: UNCHANGED (hidden sm:flex)                          */}
      {/* ================================================================ */}
      <div className="hidden sm:flex relative overflow-hidden rounded-xl sm:rounded-3xl bg-emerald-950 text-white shadow-lg border border-emerald-900/60 min-h-[320px] md:min-h-[380px] items-center">
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
    </>
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
    <Card id={`product-card-${product.id}`} className="group overflow-hidden rounded-lg sm:rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between p-0 py-0 gap-0">
      <div className="flex flex-col flex-1">
        {/* Food Image with Zoom effect */}
        <div className="relative aspect-square sm:aspect-[4/3] md:aspect-[16/10] bg-slate-100 overflow-hidden shrink-0">
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
            <span className="absolute top-1 left-1 xs:top-1.5 xs:left-1.5 sm:top-3 sm:left-3 z-10 rounded-full bg-amber-500 px-1 xs:px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 text-[7.5px] xs:text-[8.5px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-950 shadow-xs">
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
            className="absolute top-1 right-1 xs:top-1.5 xs:right-1.5 sm:top-3 sm:right-3 z-10 flex h-5 w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs text-slate-700 shadow-xs transition-transform hover:scale-110 active:scale-95 hover:bg-white"
          >
            <Heart
              className={`h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 transition-colors ${
                isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-600"
              }`}
            />
          </button>
        </div>

        {/* ============================================================== */}
        {/* MOBILE PRODUCT INFORMATION (sm:hidden)                          */}
        {/* Exact 6-line compact design directly following the image        */}
        {/* ============================================================== */}
        <div className="sm:hidden p-1.5 xs:p-2 pt-1 xs:pt-1.5 pb-1.5 xs:pb-2 flex flex-col gap-1">
          {/* LINE 1 & 2: PRODUCT NAME & CONTINUATION */}
          <Link
            id={`product-name-mobile-${product.id}`}
            to={`/products/${product.slug}`}
            className="font-bold text-[11px] xs:text-xs text-slate-900 leading-tight line-clamp-2 hover:text-emerald-700 transition-colors break-words"
          >
            {product.name}
          </Link>

          {/* LINE 3: SHOP NAME */}
          <p className="text-[9px] xs:text-[10px] font-normal text-slate-500 leading-none truncate">
            Shah's Halal Food
          </p>

          {/* LINE 4: PRICE + ORIGINAL PRICE */}
          <div className="flex items-baseline justify-between gap-1 pt-0.5 min-w-0">
            <span className="text-xs xs:text-sm font-extrabold text-emerald-700 leading-none shrink-0">
              {formatCurrency(price)}
            </span>
            {compareAt > price ? (
              <span className="text-[9.5px] xs:text-[10.5px] text-black font-medium line-through leading-none truncate">
                {formatCurrency(compareAt)}
              </span>
            ) : null}
          </div>

          {/* LINE 5: RATING + CERTIFIED HALAL */}
          <div className="flex items-center justify-between gap-0.5 pt-0.5 min-w-0">
            <div className="flex items-center gap-0.5 text-[9px] xs:text-[10px] font-bold text-slate-800 shrink-0">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400 shrink-0" />
              <span>{product.rating ?? "4.8"}</span>
            </div>
            <div className="inline-flex items-center gap-0.5 rounded bg-emerald-50 border border-emerald-200/80 px-1 py-0.5 text-[7px] xs:text-[8px] font-semibold text-emerald-700 shrink-0 whitespace-nowrap">
              <CheckCircle2 className="h-2 w-2 xs:h-2.5 xs:w-2.5 text-emerald-600 shrink-0" />
              <span>Certified Halal</span>
            </div>
          </div>

          {/* LINE 6: QUANTITY + ADD */}
          <div className="flex items-center justify-between gap-1 pt-1 min-w-0">
            <div className="flex items-center rounded border border-slate-200 bg-slate-50 p-0.5 shrink-0">
              <button
                id={`product-qty-minus-mobile-${product.id}`}
                type="button"
                className="h-4 w-4 p-0 flex items-center justify-center rounded text-slate-600 hover:bg-white hover:text-slate-900 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                onClick={() => setQuantity(Math.max(moq, quantity - 1))}
                disabled={quantity <= moq || isOutOfStock}
                aria-label="Decrease quantity"
              >
                <Minus className="h-2.5 w-2.5" />
              </button>
              <span className="w-3 text-center text-[10px] font-bold text-slate-800 leading-none select-none">
                {quantity}
              </span>
              <button
                id={`product-qty-plus-mobile-${product.id}`}
                type="button"
                className="h-4 w-4 p-0 flex items-center justify-center rounded text-slate-600 hover:bg-white hover:text-slate-900 transition-colors disabled:opacity-30 disabled:pointer-events-none"
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
              id={`product-add-btn-mobile-${product.id}`}
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-[22px] px-2 text-[10px] rounded shadow-xs active:scale-[0.98] shrink-0 flex items-center justify-center leading-none transition-colors disabled:opacity-50 disabled:pointer-events-none"
              onClick={() => onAdd(product, quantity)}
              disabled={pending || isOutOfStock}
            >
              Add
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DESKTOP PRODUCT INFORMATION (hidden sm:block)                  */}
        {/* ============================================================== */}
        <CardContent className="hidden sm:block p-4 md:p-5 space-y-2.5">
          <div>
            <Link
              to={`/products/${product.slug}`}
              className="font-bold text-base md:text-lg text-slate-900 line-clamp-1 hover:text-emerald-700 transition-colors leading-snug"
            >
              {product.name}
            </Link>
            <p className="text-xs text-slate-400 truncate">
              {product.supplierName ?? "Shah's Halal Food"}
            </p>
          </div>

          {/* Price and Comparison */}
          <div className="flex items-baseline flex-wrap gap-1.5">
            <span className="text-xl md:text-2xl font-extrabold text-emerald-700 leading-tight">
              {formatCurrency(price)}
            </span>
            {compareAt > price && (
              <span className="text-sm text-slate-400 line-through">
                {formatCurrency(compareAt)}
              </span>
            )}
            {product.unitSize ? (
              <span className="text-xs text-slate-500">({product.unitSize})</span>
            ) : unitLabel && unitLabel !== "item" && unitLabel !== "order" ? (
              <span className="text-xs text-slate-500">/{unitLabel}</span>
            ) : null}
          </div>

          {/* Rating and Certified Halal Badge */}
          <div className="flex items-center justify-between gap-1 pt-1">
            <div className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Halal</span>
            </div>

            {product.rating ? (
              <div className="flex items-center gap-0.5 text-xs font-bold text-slate-700 shrink-0">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </div>

      {/* ============================================================== */}
      {/* DESKTOP ACTION CONTROLS (hidden sm:block)                      */}
      {/* ============================================================== */}
      <div className="hidden sm:block p-4 md:p-5 pt-0">
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded hover:bg-white text-slate-700 transition-colors"
              onClick={() => setQuantity(Math.max(moq, quantity - 1))}
              disabled={quantity <= moq || isOutOfStock}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-8 text-center text-xs font-bold text-slate-800">
              {quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded hover:bg-white text-slate-700 transition-colors"
              onClick={() => {
                if (quantity >= stock) {
                  toast.error(`Only ${stock} available.`);
                } else {
                  setQuantity(quantity + 1);
                }
              }}
              disabled={isOutOfStock}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            type="button"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-9 text-xs md:text-sm rounded-lg shadow-xs gap-1 transition-all active:scale-[0.98] px-3"
            onClick={() => onAdd(product, quantity)}
            disabled={pending || isOutOfStock}
          >
            <ShoppingCart className="h-4 w-4 shrink-0" />
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
