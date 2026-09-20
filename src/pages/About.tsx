import { useMemo } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Flame,
  Heart,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  Utensils,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomerBottomNav } from "@/components/CustomerBottomNav";
import { getCategoryEmoji } from "./LandingPage";
import { getCategoryDescription, getCategoryImage } from "./Products";

interface CategoryItem {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
}

const FALLBACK_CATEGORIES: CategoryItem[] = [
  { id: 1, name: "Platters", slug: "platters", description: "Chicken, Lamb, Combo & Falafel over rice" },
  { id: 2, name: "Gyros & Wraps", slug: "gyros", description: "Warm pita wrapped with fresh veggies" },
  { id: 3, name: "Burgers & Sandwiches", slug: "burgers", description: "Juicy patties & specialty cheesesteaks" },
  { id: 4, name: "Party Wings", slug: "party-wings", description: "Crispy wings in Buffalo, BBQ & Sweet Chili" },
  { id: 5, name: "Rice Bowls", slug: "rice-bowls", description: "Fragrant basmati rice topped to perfection" },
  { id: 6, name: "Fresh Salads", slug: "salads", description: "Crisp lettuce, tomato, cucumber & feta" },
  { id: 7, name: "Crispy Sides", slug: "sides", description: "Golden fries, falafel, hummus & pita" },
  { id: 8, name: "Beverages", slug: "beverages", description: "Chilled sodas, juices & cold drinks" },
  { id: 9, name: "Desserts", slug: "desserts", description: "Crispy sweet honey baklava" },
  { id: 10, name: "Catering", slug: "catering", description: "Feast platters for parties & gatherings" },
];

export default function About() {
  const categoriesQuery = trpc.category.list.useQuery(undefined, {
    retry: false,
  });

  const categories: CategoryItem[] = useMemo(() => {
    const data = (categoriesQuery.data ?? []) as CategoryItem[];
    if (data.length > 0) return data;
    return FALLBACK_CATEGORIES;
  }, [categoriesQuery.data]);

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-slate-900 flex flex-col antialiased selection:bg-emerald-800 selection:text-amber-200">
      {/* Main Content Container - Starts directly at the top */}
      <main className="flex-1 pb-24 md:pb-16">
        {/* ==================================================================== */}
        {/* HERO SECTION                                                         */}
        {/* ==================================================================== */}
        <section
          id="about-hero"
          className="relative overflow-hidden text-white pt-8 sm:pt-12 pb-14 sm:pb-20 lg:pb-24"
          style={{
            background: "linear-gradient(135deg, #062E1F 0%, #0B462C 45%, #0F5132 75%, #062E1F 100%)",
          }}
        >
          {/* Subtle Halal Pattern & Ambient Glows */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[520px] h-[340px] sm:h-[520px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-soft-glow" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Floating decorative food emoji badges */}
          <div className="hidden sm:flex absolute top-12 left-[10%] lg:left-[14%] items-center gap-2 bg-[#062E1F]/80 backdrop-blur-sm border border-emerald-700/50 text-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg animate-float-slow pointer-events-none">
            <span className="text-base">🍔</span> Fresh Burgers
          </div>

          <div className="hidden sm:flex absolute top-20 right-[10%] lg:right-[15%] items-center gap-2 bg-[#062E1F]/80 backdrop-blur-sm border border-emerald-700/50 text-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg animate-float-reverse pointer-events-none">
            <span className="text-base">🌯</span> Warm Gyros
          </div>

          <div className="hidden md:flex absolute bottom-14 left-[8%] items-center gap-2 bg-[#062E1F]/80 backdrop-blur-sm border border-amber-400/40 text-amber-300 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg animate-gentle-tilt pointer-events-none">
            <span className="text-base">🍗</span> Crispy Wings
          </div>

          <div className="hidden md:flex absolute bottom-16 right-[10%] items-center gap-2 bg-[#062E1F]/80 backdrop-blur-sm border border-emerald-700/50 text-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg animate-float-slow pointer-events-none">
            <span className="text-base">🍟</span> Golden Sides
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            {/* 100% Certified Halal Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/40 text-amber-300 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase mb-5 shadow-xs">
              <span className="text-amber-400 text-sm">☪</span>
              <span>100% Certified Halal</span>
              <span className="text-amber-400 text-xs">✨</span>
            </div>

            {/* Center Logo */}
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl scale-125" />
              <div className="relative inline-flex p-3 sm:p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                <img
                  src="/branding/am-fruits-logo.png"
                  alt="Shah's Halal Food"
                  className="h-12 sm:h-16 md:h-18 w-auto object-contain drop-shadow-md"
                />
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] max-w-3xl">
              ABOUT <span className="text-amber-300">SHAH&apos;S HALAL</span>
            </h1>

            {/* Tagline */}
            <p className="mt-3 sm:mt-4 text-lg sm:text-xl md:text-2xl font-semibold text-emerald-200 tracking-wide">
              Fresh Food · Pure Taste
            </p>

            {/* Motto */}
            <div className="mt-2 text-sm sm:text-base italic text-emerald-100/90 font-medium">
              &ldquo;Good Food Brings Good People&rdquo;
            </div>

            {/* Hero Center Food Showcase with Subtle Float */}
            <div className="relative mt-8 sm:mt-10 w-full max-w-sm sm:max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/30 to-amber-500/20 rounded-3xl blur-2xl transform scale-95" />
              <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-400/30 shadow-2xl bg-emerald-950/40 p-2 animate-float-slow">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-emerald-900/50">
                  <img
                    src="/products/chicken-platter.jpg"
                    alt="Shah's Halal Signature Chicken Platter"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-left flex items-end justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                        Signature Dish
                      </span>
                      <span className="text-sm sm:text-base font-bold text-white leading-tight">
                        Chicken &amp; Rice Platter
                      </span>
                    </div>
                    <span className="text-xs bg-emerald-600/90 text-white font-semibold px-2 py-0.5 rounded-md border border-emerald-400/40">
                      Made Fresh
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero CTA buttons */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link to="/products">
                <Button
                  size="lg"
                  className="h-12 px-6 sm:px-8 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-amber-400/20 gap-2 transition-all hover:scale-[1.02]"
                >
                  <Utensils className="h-4 w-4" />
                  Explore Our Menu
                </Button>
              </Link>
              <a href="#our-story">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 sm:px-8 border-emerald-400/40 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-100 font-semibold text-sm sm:text-base rounded-xl backdrop-blur-sm gap-2"
                >
                  Our Story
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 3. OUR STORY & OUR MISSION                                           */}
        {/* ==================================================================== */}
        <section id="our-story" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Story Text */}
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 border border-emerald-200/80 px-3 py-1 rounded-full mb-3">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Our Story &amp; Mission</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Authentic Halal Flavor, <br />
                  <span className="text-emerald-800">Crafted Fresh Daily.</span>
                </h2>
              </div>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                Shah&apos;s Halal is built around a simple idea —{" "}
                <strong className="text-slate-900 font-semibold">
                  fresh food, great taste, and a welcoming experience for everyone.
                </strong>
              </p>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                From sizzling marinated meats cooked right on the grill to our fragrant, spiced basmati rice, warm pita,
                crisp salad, and world-famous signature white and fiery red sauces, every order is prepared with care
                and authentic culinary pride.
              </p>

              {/* Three Culinary Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                    <Flame className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Freshly Grilled</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Cooked hot to order on the griddle</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
                    <Star className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Basmati Rice</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Long-grain rice with signature spices</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                    <Heart className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">House Sauces</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Famous white sauce &amp; fiery red sauce</p>
                </div>
              </div>
            </div>

            {/* Story Visual Frame */}
            <div className="relative">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-emerald-700/20 via-amber-400/20 to-emerald-800/10 blur-xl opacity-70" />
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl">
                <div className="aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-slate-100">
                  <img
                    src="/products/combo-platter.jpg"
                    alt="Shah's Halal Combo Platter with Lamb, Chicken and Basmati Rice"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-4 sm:p-5 bg-gradient-to-r from-[#062E1F] to-[#0F5132] text-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-300 block tracking-wide">100% QUALITY PROMISE</span>
                    <span className="text-sm sm:text-base font-extrabold text-white">
                      From Our Kitchen to Your Table
                    </span>
                  </div>
                  <Link to="/products">
                    <Button
                      size="sm"
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg"
                    >
                      View Menu
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 4. WHAT WE SERVE (DATABASE CATEGORIES VISUAL GRID)                    */}
        {/* ==================================================================== */}
        <section id="what-we-serve" className="py-14 sm:py-18 bg-[#F4F1EA]/70 border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 border border-emerald-200/80 px-3 py-1 rounded-full mb-3">
                <Utensils className="h-3.5 w-3.5 text-emerald-700" />
                <span>Our Specialties</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
                WHAT WE SERVE
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                From hearty platters and warm pita wraps to crispy wings and sweet desserts, explore our full halal menu.
              </p>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
              {categories.map((category) => {
                const emoji = getCategoryEmoji(category);
                const image = getCategoryImage(category);
                const description = getCategoryDescription(category);

                return (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                  >
                    {/* Category Image */}
                    <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                      <img
                        src={image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-slate-900 text-sm px-2 py-0.5 rounded-full shadow-xs">
                        {emoji}
                      </div>
                    </div>

                    {/* Category Details */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                          {category.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                          {description}
                        </p>
                      </div>

                      <div className="mt-2.5 flex items-center text-[11px] font-semibold text-emerald-700 group-hover:text-emerald-800">
                        <span>Order Now</span>
                        <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 sm:mt-10 text-center">
              <Link to="/products">
                <Button
                  variant="outline"
                  className="h-11 px-6 border-emerald-700/40 text-emerald-800 hover:bg-emerald-800 hover:text-white font-bold text-sm rounded-xl gap-2 transition-colors"
                >
                  <ShoppingBag className="h-4 w-4" />
                  View All Products &amp; Categories
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 5. FRESH • HALAL • TASTY (FOOD QUALITY & FRESHNESS WITH ANIMATION)   */}
        {/* ==================================================================== */}
        <section
          id="fresh-halal-tasty"
          className="py-16 sm:py-20 text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #062E1F 0%, #083825 50%, #0F5132 100%)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full mb-3">
                <span>☪</span>
                <span>Our Uncompromising Standards</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                FRESH • HALAL • TASTY
              </h2>
              <p className="mt-2 text-sm sm:text-base text-emerald-200/90">
                Every ingredient is prepared with the utmost respect for taste, freshness, and halal authenticity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Pillar 1 */}
              <div className="bg-white/5 border border-emerald-500/20 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/10 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl mb-3.5 group-hover:scale-110 transition-transform">
                  🥩
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-1.5">
                  100% Halal Certified
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
                  Strictly verified halal meats and wholesome kitchen standards you and your family can trust every day.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white/5 border border-emerald-500/20 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/10 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl mb-3.5 group-hover:scale-110 transition-transform">
                  🥗
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-1.5">
                  Fresh Vegetables
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
                  Crisp lettuce, ripe red tomatoes, cucumbers, and fragrant herbs chopped daily for refreshing balance.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white/5 border border-amber-400/30 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/10 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-xl mb-3.5 group-hover:scale-110 transition-transform">
                  🥣
                </div>
                <h3 className="text-base font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                  Iconic House Sauces
                  <Star className="h-4 w-4 text-amber-400 shrink-0" />
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
                  Our famous creamy white sauce and bold red hot sauce bring signature flavor to every single bite.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="bg-white/5 border border-emerald-500/20 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/10 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl mb-3.5 group-hover:scale-110 transition-transform">
                  🔥
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-1.5">
                  Cooked to Order
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
                  Grilled fresh when you order so your platters, gyros, and burgers are hot, juicy, and flavorful.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 6. WHY SHAH'S HALAL?                                                 */}
        {/* ==================================================================== */}
        <section id="why-us" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 border border-emerald-200/80 px-3 py-1 rounded-full mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              <span>The Shah&apos;s Difference</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              WHY SHAH&apos;S HALAL?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              We take pride in our food quality, authentic recipe traditions, and welcoming service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <Card className="border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="text-3xl mb-3">🥩</div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Quality Ingredients</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Carefully selected meats, real seasonings, and genuine ingredients prepared according to high standards.
                </p>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="text-3xl mb-3">🥗</div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Fresh Food Always</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Food cooked to order with crisp sides and hot breads, never sitting stale under heat lamps.
                </p>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="border-amber-400/40 bg-amber-50/30 shadow-xs hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="text-3xl mb-3">☪️</div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Halal Focus</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Consistent, verified halal dedication across our entire food catalog for peace of mind.
                </p>
              </CardContent>
            </Card>

            {/* Card 4 */}
            <Card className="border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="text-3xl mb-3">❤️</div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Made With Care</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Generous portions served with genuine friendliness, creating an inviting meal every time.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 7. CATERING SECTION                                                  */}
        {/* ==================================================================== */}
        <section id="catering" className="py-14 sm:py-18 bg-[#F4F1EA]/60 border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-[#062E1F] to-[#0F5132] text-white rounded-3xl overflow-hidden shadow-2xl border border-emerald-700/60 grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 space-y-5">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-full">
                  <Users className="h-3.5 w-3.5" />
                  <span>Events &amp; Gatherings</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  CATERING FOR EVERY OCCASION
                </h2>

                <p className="text-emerald-200 text-sm sm:text-base leading-relaxed">
                  Make every gathering special with authentic Shah&apos;s Halal catering trays, party platters, and custom
                  boxed meals. Perfect for groups of any size:
                </p>

                {/* Catering Events Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {["Family Events", "Parties", "Corporate Lunches", "Weddings", "Celebrations", "Community Feasts"].map(
                    (event) => (
                      <Badge
                        key={event}
                        variant="outline"
                        className="border-emerald-500/40 text-emerald-100 bg-emerald-950/40 font-medium px-3 py-1 text-xs"
                      >
                        ✓ {event}
                      </Badge>
                    ),
                  )}
                </div>

                <div className="pt-3">
                  <Link to="/products">
                    <Button
                      size="lg"
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm sm:text-base rounded-xl shadow-lg gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Explore Catering Menu
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 h-full min-h-[260px] sm:min-h-[340px] relative overflow-hidden bg-emerald-950">
                <img
                  src="/products/catering.jpg"
                  alt="Shah's Halal Catering Platter"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#062E1F] via-transparent to-transparent opacity-80" />
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 8. FINAL CTA                                                         */}
        {/* ==================================================================== */}
        <section id="final-cta" className="py-16 sm:py-20 max-w-4xl mx-auto px-4 text-center">
          <div className="relative p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative space-y-4">
              <span className="text-3xl sm:text-4xl block">🍽️</span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                GOOD FOOD <br />
                <span className="text-emerald-800">BRINGS GOOD PEOPLE</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
                Explore our full halal menu of platters, gyros, burgers, party wings, and sides.
              </p>

              <div className="pt-3">
                <Link to="/products">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base rounded-xl shadow-md gap-2"
                  >
                    View Categories
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ====================================================================== */}
      {/* 9. MOBILE BOTTOM NAVIGATION (ACTIVE = "about")                         */}
      {/* ====================================================================== */}
      <CustomerBottomNav active="about" />
    </div>
  );
}
