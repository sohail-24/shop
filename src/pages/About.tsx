import { useState } from "react";
import { Link } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  Flame,
  Gift,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Utensils,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerBottomNav } from "@/components/CustomerBottomNav";
import { RealBurgerScrollHero } from "@/components/RealBurgerScrollHero";

export default function About() {
  const prefersReducedMotion = useReducedMotion();
  const [activeTier, setActiveTier] = useState<"bronze" | "silver" | "gold">("bronze");

  // Motion helper props
  const fadeIn = {
    initial: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased selection:bg-emerald-800 selection:text-amber-200 overflow-x-hidden">
      <main className="flex-1 pb-24 md:pb-16">
        {/* ==================================================================== */}
        {/* HERO: REAL BURGER PHOTOGRAPH WITH SCROLL-LINKED EXPLODE ANIMATION   */}
        {/* ==================================================================== */}
        <RealBurgerScrollHero />

        {/* ==================================================================== */}
        {/* SECTION 1: BORN IN NEW YORK (NYC STORY)                              */}
        {/* ==================================================================== */}
        <section id="born-in-nyc" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full mb-3">
              <MapPin className="h-3.5 w-3.5 text-emerald-700" />
              <span>Section 01 • Origin</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              BORN IN <span className="text-emerald-800">NEW YORK CITY</span>
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
              The Tex’s journey began in the late 1980s on the vibrant streets of New York City, rooted in neighborhood storefronts across the boroughs.
            </p>

            {/* Footprint Quick Stats Banner */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl mx-auto text-center">
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-emerald-800">Late 1980s</div>
                <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5">NYC Roots</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-emerald-800">55+</div>
                <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5">East Coast Locations</div>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-emerald-800">100%</div>
                <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Certified Halal</div>
              </div>
            </div>
          </motion.div>

          {/* Borough Timeline Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
            {/* The Bronx */}
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-300 select-none font-mono">
                    01
                  </div>
                  <div className="inline-flex items-center justify-center h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xs sm:text-base">
                    BX
                  </div>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 mb-1.5 sm:mb-2">The Bronx</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Small corner kitchens serving hungry local workers, bus drivers, and neighborhood families looking for fresh, hot, and honest comfort food.
                </p>
              </div>
            </motion.div>

            {/* Harlem */}
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-300 select-none font-mono">
                    02
                  </div>
                  <div className="inline-flex items-center justify-center h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-amber-100 text-amber-800 font-black text-xs sm:text-base">
                    HL
                  </div>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 mb-1.5 sm:mb-2">Harlem</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Developing distinctive seasoning blends that resonated with deep culinary traditions, perfecting the crunch of fried chicken with rich flavor.
                </p>
              </div>
            </motion.div>

            {/* Brooklyn */}
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-300 select-none font-mono">
                    03
                  </div>
                  <div className="inline-flex items-center justify-center h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xs sm:text-base">
                    BK
                  </div>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 mb-1.5 sm:mb-2">Brooklyn</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Expanding into diverse immigrant communities, demonstrating that American comfort food can be 100% halal without ever sacrificing taste or value.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 3: THE BEGINNING                                             */}
        {/* ==================================================================== */}
        <section className="py-16 sm:py-20 bg-white border-y border-stone-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeIn} className="max-w-3xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
                <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                <span>Section 02 • The Need</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                A SIMPLE, POWERFUL PURPOSE
              </h2>
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                In the late 1980s, a close-knit group of friends observed a glaring gap in the city’s bustling food scene. Working-class families, students, and immigrant communities wanted delicious, affordable, easy-to-grab American comfort food—yet certified halal options were virtually nonexistent.
              </p>
            </motion.div>

            {/* The 5 Pillars of The Beginning */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { title: "Affordable", desc: "Honest pricing for everyday working people" },
                { title: "Accessible", desc: "Conveniently located in local neighborhoods" },
                { title: "Always Fresh", desc: "Never pre-cooked under heat lamps" },
                { title: "100% Halal", desc: "Mindful preparation & verified sourcing" },
                { title: "Comfort Food", desc: "Golden chicken, juicy burgers & warm sides" },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  {...fadeIn}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  className={`p-4 rounded-2xl bg-white border border-stone-200 text-center shadow-xs ${
                    idx === 4 ? "col-span-2 sm:col-span-1" : ""
                  }`}
                >
                  <div className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
                    0{idx + 1}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base mt-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 4: THE CRAFT & BURGER ANIMATION                              */}
        {/* ==================================================================== */}
        <section id="the-craft" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full mb-3">
              <Flame className="h-3.5 w-3.5 text-emerald-700" />
              <span>Section 03 • Culinary Mastery</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              THE CRAFT BEHIND THE CRUNCH
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
              Great food isn’t an accident. For over three decades, Tex’s has refined southern-style frying traditions, proprietary breading blends, and hot flat-top smashing techniques to create dishes that are crispy on the outside, succulent on the inside.
            </p>
          </motion.div>

          {/* The 4 Craft Pillars */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <span className="text-2xl mb-2 block">🌾</span>
              <h4 className="font-black text-slate-900 text-base">Signature Breading</h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Hand-dipped and seasoned with a proprietary blend of southern spices that locks in juices during frying.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <span className="text-2xl mb-2 block">🌡️</span>
              <h4 className="font-black text-slate-900 text-base">Precise Frying</h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Fried in pure, clean vegetable oil at calibrated temperatures for that unforgettable golden snap.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <span className="text-2xl mb-2 block">🥩</span>
              <h4 className="font-black text-slate-900 text-base">Flat-Top Smashed</h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Fresh halal ground beef pressed firmly on a blistering grill to create crispy, caramelized edges.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <span className="text-2xl mb-2 block">🌿</span>
              <h4 className="font-black text-slate-900 text-base">Cooked Hot to Order</h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Every sandwich, tender, and burger is made when you request it, so your food is sizzling and fresh.
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 5: 2016 MILESTONE                                            */}
        {/* ==================================================================== */}
        <section className="py-16 sm:py-20 bg-white border-y border-stone-100 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div {...fadeIn}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-wider mb-6">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>Historic Milestone</span>
              </div>
              <div className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-amber-500 mb-4 select-none">
                2016
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
                TEXAS CHICKEN &amp; BURGERS
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                After decades of operating individual neighborhood spots, the founders formally unified their recipes, culinary standards, and hospitality under the <strong className="text-slate-900">Texas Chicken &amp; Burgers</strong> banner. A single, unmistakable standard for fresh halal comfort food was born.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 6: THEN → NOW (55+ LOCATIONS GROWTH)                         */}
        {/* ==================================================================== */}
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full mb-3">
              <Zap className="h-3.5 w-3.5 text-emerald-700" />
              <span>Section 04 • Growth</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              THEN <span className="text-emerald-800">→</span> NOW
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              From a humble single storefront in NYC to a beloved brand across the East Coast.
            </p>
          </motion.div>

          {/* Growth Journey Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              {
                step: "Phase 1",
                highlight: "1 Location",
                title: "Humble Beginnings",
                desc: "A single NYC storefront serving local residents and testing recipes.",
              },
              {
                step: "Phase 2",
                highlight: "Neighborhoods",
                title: "Local Favorites",
                desc: "Word spread rapidly across boroughs for unmatched crunch and halal purity.",
              },
              {
                step: "Phase 3",
                highlight: "Metro Expansion",
                title: "Multiple Locations",
                desc: "Standardized kitchens and dedicated supply chains supporting high demand.",
              },
              {
                step: "Phase 4",
                highlight: "55+ Locations",
                title: "East Coast Footprint",
                desc: "Over 55 thriving locations and counting across the East Coast with dedicated fans.",
              },
            ].map((node, i) => (
              <motion.div
                key={node.step}
                {...fadeIn}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`p-6 rounded-3xl border transition-all ${
                  i === 3
                    ? "bg-white border-2 border-emerald-600/30 text-slate-900 shadow-md ring-2 ring-emerald-500/10"
                    : "bg-white border-stone-200 text-slate-900 shadow-xs"
                }`}
              >
                <div
                  className={`text-xs font-bold uppercase tracking-wider ${
                    i === 3 ? "text-emerald-800" : "text-emerald-700"
                  }`}
                >
                  {node.step}
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-black my-2 ${
                    i === 3 ? "text-emerald-800" : "text-slate-900"
                  }`}
                >
                  {node.highlight}
                </div>
                <h4
                  className={`text-base font-bold mb-1 ${
                    i === 3 ? "text-slate-900" : "text-slate-800"
                  }`}
                >
                  {node.title}
                </h4>
                <p
                  className={`text-xs leading-relaxed ${
                    i === 3 ? "text-slate-600" : "text-slate-500"
                  }`}
                >
                  {node.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 7: WHY TEX’S? (THE STORY BEHIND THE NAME)                    */}
        {/* ==================================================================== */}
        <section className="py-16 sm:py-20 bg-white border-y border-stone-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
              <motion.div {...fadeIn} className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
                  <Heart className="h-3.5 w-3.5 text-emerald-700" />
                  <span>The Brand Identity</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                  WHY THE NAME <span className="text-emerald-800">&ldquo;TEX’S&rdquo;?</span>
                </h2>
                <p className="text-base text-slate-700 leading-relaxed">
                  People often ask how an NYC-born brand got the name <strong className="text-slate-900">Tex’s</strong>.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  The inspiration connects directly to the legendary, ultra-crispy, golden southern-style breading technique the founders spent years mastering. By combining southern cooking traditions with New York’s multicultural energy and an unbending commitment to 100% halal preparation, the brand established a flavor profile like no other.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Over time, regular patrons began affectionately shortening Texas Chicken &amp; Burgers to just <strong className="text-slate-900">&ldquo;Tex’s&rdquo;</strong>—a friendly, modern badge of flavor that honors our culinary heritage while driving our future forward.
                </p>
              </motion.div>

              <motion.div
                {...fadeIn}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white text-slate-900 shadow-sm border border-stone-200 text-center"
              >
                <div className="inline-flex p-3 rounded-2xl bg-stone-50 border border-stone-200 mb-4">
                  <img
                    src="/branding/logo.png"
                    alt="Tex’s Logo"
                    className="h-16 w-auto object-contain"
                  />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  Southern Craft. <br />NYC Heart.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Crispy golden breading meets 100% verified halal preparation in every single kitchen.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 8: QUALITY YOU CAN TASTE                                     */}
        {/* ==================================================================== */}
        <section id="quality" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              <span>Section 05 • Sourcing &amp; Purity</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              QUALITY YOU CAN TASTE
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              Transparent, uncompromising food standards you and your family can trust every day.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quality Pillar 1: 100% Halal */}
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.1 }}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wide mb-3">
                  <span>☪</span>
                  <span>100% Halal Certified</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                  Mindfully Raised &amp; Prepared
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tex’s works directly with certified halal suppliers and independent halal certification experts. Animals are raised with care, free from unnatural growth steroids or hormone additives, and processed under humane, stress-free halal guidelines.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero non-halal cross contamination guaranteed</span>
              </div>
            </motion.div>

            {/* Quality Pillar 2: Never Frozen */}
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wide mb-3">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>Never Frozen Meats</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                  Fresh Chicken &amp; Beef Daily
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We believe frozen meats ruin natural flavor and tenderness. Our chicken and ground beef arrive fresh to our kitchens, seasoned and prepared daily so every tender is juicy and every patty is seared with maximum crust.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cooked fresh on the spot — never pre-cooked</span>
              </div>
            </motion.div>

            {/* Quality Pillar 3: Fresh Produce */}
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.3 }}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wide mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fresh Ingredients</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                  Crisp Produce Chopped Daily
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every burger and sandwich is layered with crisp green leaf lettuce, vine-ripened red tomatoes, crunchy crinkle pickles, and fresh red onions. No bagged wilted greens or synthetic flavorings.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Farm-fresh ingredients washed &amp; sliced in-house</span>
              </div>
            </motion.div>

            {/* Quality Pillar 4: Zero Fillers / No Pink Slime */}
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.4 }}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wide mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Zero Fillers Commitment</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                  No Pink Slime &amp; No Ammonia Treatments
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tex’s ground beef is 100% pure beef. As a strict company quality policy, we do not source from companies that use ammonia treatments, and our meat contains absolutely zero lean finely textured beef (&ldquo;pink slime&rdquo;) or chemical fillers.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pure, wholesome beef with honest nutrition</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 9: MADE FOR THE MENU (REAL PRODUCTS SHOWCASE)                */}
        {/* ==================================================================== */}
        <section className="py-16 sm:py-24 bg-white border-y border-stone-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full mb-3">
                <Utensils className="h-3.5 w-3.5 text-emerald-700" />
                <span>Section 06 • The Lineup</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                MADE FOR THE MENU
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-600">
                A preview of genuine Tex’s classics prepared hot and fresh daily.
              </p>
            </motion.div>

            {/* Menu Highlights Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  title: "Signature Fried Chicken",
                  items: "2 PC, 3 PC, 4 PC Meals",
                  desc: "Bone-in chicken marinated in secret spices, coated in our legendary southern breading, and fried to golden perfection.",
                  icon: "🍗",
                  tag: "Customer Favorite",
                },
                {
                  title: "Tex’s Smash Burgers",
                  items: "Classic, Deluxe & Hell Smash",
                  desc: "Never-frozen halal beef patties smashed thin on the flat-top for crispy edges, topped with melted cheese and signature sauce.",
                  icon: "🍔",
                  tag: "100% Halal Beef",
                },
                {
                  title: "Crispy Chicken Sandwiches",
                  items: "Classic, Deluxe & Grilled",
                  desc: "Whole-muscle chicken breast fried crispy or grilled tender, served on a toasted brioche bun with house-made pickles.",
                  icon: "🥪",
                  tag: "Whole Muscle Breast",
                },
                {
                  title: "Fiery Wings & Tenders",
                  items: "6 PC, 15 PC Wings & 3–5 PC Tenders",
                  desc: "Tossed in spicy cayenne blends or served crisp with dipping sauces. Pure white-meat tenders hand-breaded daily.",
                  icon: "🔥",
                  tag: "Spicy & Crisp",
                },
                {
                  title: "Southern Comfort Sides",
                  items: "Fries, Mac & Cheese, Mash & Gravy",
                  desc: "Seasoned crinkle fries, creamy mac & cheese, velvety mashed potatoes topped with savory brown gravy, and crisp coleslaw.",
                  icon: "🍟",
                  tag: "Made from Scratch",
                },
                {
                  title: "Golden Honey Biscuits",
                  items: "Warm, Flaky & Buttery",
                  desc: "Baked fresh throughout the day and brushed with real golden honey butter. The quintessential southern finish.",
                  icon: "🍯",
                  tag: "Baked Hourly",
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  {...fadeIn}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                  className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-3xl">{item.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
                    <div className="text-xs font-semibold text-amber-700 mt-0.5">
                      {item.items}
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <Link
                      to="/products"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
                    >
                      <span>Explore Options</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link to="/products">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm sm:text-base rounded-xl shadow-md gap-2"
                >
                  <Utensils className="h-4 w-4" />
                  View Full Menu &amp; Order
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 10: TEX’S REWARDS (SPURS LOYALTY)                            */}
        {/* ==================================================================== */}
        <section id="rewards" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 border border-amber-300 px-3 py-1 rounded-full mb-3">
              <Gift className="h-3.5 w-3.5 text-amber-700" />
              <span>Section 07 • Loyalty Program</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              TEX’S REWARDS <span className="text-amber-600">• EARN SPURS</span>
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              Earn loyalty Spurs on every dollar spent and redeem them for free food, sides, and exclusive perks.
            </p>
          </motion.div>

          {/* How It Works Flow */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 mb-12">
            {[
              { step: "01", title: "Eat", desc: "Order online or scan in-store" },
              { step: "02", title: "Earn Spurs", desc: "Get Spurs for every $1 spent" },
              { step: "03", title: "Level Up", desc: "Climb Bronze, Silver & Gold" },
              { step: "04", title: "Redeem", desc: "Free food starting at 150 Spurs" },
            ].map((st, i) => (
              <div
                key={st.step}
                className="p-4 rounded-2xl bg-white border border-stone-200 text-center shadow-xs relative"
              >
                <div className="text-xs font-black text-amber-600 tracking-wider">
                  STEP {st.step}
                </div>
                <h4 className="text-base font-black text-slate-900 mt-1">{st.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{st.desc}</p>
              </div>
            ))}
          </div>

          {/* Tier Cards / Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Bronze Tier */}
            <div
              onClick={() => setActiveTier("bronze")}
              className={`cursor-pointer p-6 rounded-3xl border transition-all ${
                activeTier === "bronze"
                  ? "bg-gradient-to-b from-amber-50 to-white border-amber-400 shadow-md ring-2 ring-amber-400/30"
                  : "bg-white border-stone-200 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Tier 1
                </span>
                <span className="text-xs font-mono text-slate-400">0–999 Spurs</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">Bronze Member</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Start earning immediately when you create an account.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>1 Spur per $1 spent</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Welcome reward on signup</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Exclusive digital coupons</span>
                </li>
              </ul>
            </div>

            {/* Silver Tier */}
            <div
              onClick={() => setActiveTier("silver")}
              className={`cursor-pointer p-6 rounded-3xl border transition-all ${
                activeTier === "silver"
                  ? "bg-gradient-to-b from-slate-100 to-white border-slate-400 shadow-md ring-2 ring-slate-400/30"
                  : "bg-white border-stone-200 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-200 px-2.5 py-0.5 rounded-full">
                  Tier 2
                </span>
                <span className="text-xs font-mono text-slate-400">1,000–2,499 Spurs</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">Silver Member</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Accelerated rewards for frequent diners.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>1.1x Spurs multiplier</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Free Birthday treat</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Priority seasonal offers</span>
                </li>
              </ul>
            </div>

            {/* Gold Tier */}
            <div
              onClick={() => setActiveTier("gold")}
              className={`cursor-pointer p-6 rounded-3xl border transition-all ${
                activeTier === "gold"
                  ? "bg-gradient-to-b from-yellow-50 to-white border-yellow-500 shadow-md ring-2 ring-yellow-500/30"
                  : "bg-white border-stone-200 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-yellow-300 px-2.5 py-0.5 rounded-full">
                  VIP Tier 3
                </span>
                <span className="text-xs font-mono text-slate-400">2,500+ Spurs</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">Gold Member</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                The ultimate VIP experience with maximum perks.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>1.25x Spurs multiplier</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Exclusive tasting previews &amp; VIP gifts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Special surprise double Spurs days</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Official Redemption Ladder */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Official Redemption Menu</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <div className="text-amber-600 font-black text-xl">150 Spurs</div>
                <div className="text-xs font-bold text-slate-900 mt-1">Warm Biscuit</div>
                <div className="text-[10px] text-slate-500">Honey butter glaze</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <div className="text-amber-600 font-black text-xl">250 Spurs</div>
                <div className="text-xs font-bold text-slate-900 mt-1">Crispy Side</div>
                <div className="text-[10px] text-slate-500">Fries or coleslaw</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <div className="text-amber-600 font-black text-xl">400 Spurs</div>
                <div className="text-xs font-bold text-slate-900 mt-1">2 PC Chicken</div>
                <div className="text-[10px] text-slate-500">Signature bone-in</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <div className="text-amber-600 font-black text-xl">500 Spurs</div>
                <div className="text-xs font-bold text-slate-900 mt-1">Cheeseburger</div>
                <div className="text-[10px] text-slate-500">Halal beef &amp; brioche</div>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <div className="text-amber-600 font-black text-xl">750 Spurs</div>
                <div className="text-xs font-bold text-slate-900 mt-1">3 PC Tenders</div>
                <div className="text-[10px] text-slate-500">Hand-breaded strips</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-4 text-center">
              Spurs remain valid for 1 full year from the date earned. Terms apply.
            </p>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 11: FINAL BRAND STATEMENT & CINEMATIC CTA                   */}
        {/* ==================================================================== */}
        <section
          id="final-statement"
          className="relative py-20 sm:py-28 bg-white text-slate-900 border-t border-stone-200 overflow-hidden"
        >
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div {...fadeIn}>
              <div className="inline-flex p-3 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 mb-6 shadow-xs">
                <img
                  src="/branding/logo.png"
                  alt="Tex’s Chicken & Burgers"
                  className="h-16 sm:h-20 w-auto object-contain drop-shadow-xs"
                />
              </div>

              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-3">
                TEX’S CHICKEN &amp; BURGERS
              </h2>

              <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-amber-600 tracking-wide mb-4">
                Worth Every Bite
              </p>

              <blockquote className="text-lg sm:text-xl md:text-2xl italic text-slate-600 font-medium max-w-xl mx-auto mb-10">
                &ldquo;Good Food Brings Good People&rdquo;
              </blockquote>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/products">
                  <Button
                    size="lg"
                    className="h-14 px-8 sm:px-10 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-lg shadow-amber-400/25 gap-2 transition-transform hover:scale-[1.02]"
                  >
                    <Utensils className="h-5 w-5" />
                    Explore Menu
                  </Button>
                </Link>
                <Link to="/">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 sm:px-10 border border-stone-300 bg-white hover:bg-stone-50 text-slate-800 font-bold text-base sm:text-lg rounded-2xl shadow-xs gap-2"
                  >
                    Order Online
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center gap-6 text-xs text-slate-400 uppercase tracking-widest font-semibold">
                <span>NYC Born</span>
                <span>•</span>
                <span>100% Halal</span>
                <span>•</span>
                <span>55+ Locations</span>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Persistent Customer Bottom Navigation (Active tab = "about") */}
      <CustomerBottomNav active="about" />
    </div>
  );
}
