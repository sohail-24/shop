import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles, Layers, ShieldCheck, Flame, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IngredientLayer {
  id: string;
  name: string;
  detail: string;
  badge: string;
  yOffset: number; // exploded position
  rotate: number;
  color: string;
}

const BURGER_LAYERS: IngredientLayer[] = [
  {
    id: "top-bun",
    name: "Golden Brioche Crown",
    detail: "Toasted golden-brown with roasted sesame seeds",
    badge: "Fresh Baked",
    yOffset: -120,
    rotate: -2,
    color: "#D97706",
  },
  {
    id: "sauce",
    name: "Tex’s Secret Signature Sauce",
    detail: "Creamy, tangy house blend crafted with southern spices",
    badge: "House Recipe",
    yOffset: -75,
    rotate: 1.5,
    color: "#F97316",
  },
  {
    id: "pickles-onions",
    name: "Crinkle Pickles & Crisp Onions",
    detail: "Tangy dill crunch with freshly sliced red onion rings",
    badge: "Crisp Cut",
    yOffset: -35,
    rotate: -1,
    color: "#16A34A",
  },
  {
    id: "cheese",
    name: "Real Melted American Cheese",
    detail: "Gooey golden layer melting over sizzling halal beef",
    badge: "Melted Rich",
    yOffset: 0,
    rotate: 1,
    color: "#F59E0B",
  },
  {
    id: "patty",
    name: "100% Halal Smashed Beef Patty",
    detail: "Never frozen, seared hot on the flat-top with crispy lacy edges. Strictly NO pink slime or ammonia fillers.",
    badge: "Never Frozen",
    yOffset: 45,
    rotate: -1.5,
    color: "#78350F",
  },
  {
    id: "lettuce-tomato",
    name: "Crisp Green Leaf & Vine Tomato",
    detail: "Hand-selected fresh produce washed and sliced daily",
    badge: "Farm Fresh",
    yOffset: 85,
    rotate: 2,
    color: "#22C55E",
  },
  {
    id: "bottom-bun",
    name: "Toasted Brioche Heel",
    detail: "Sturdy, buttery foundation holding every juicy bite together",
    badge: "Pillowy Soft",
    yOffset: 125,
    rotate: 0,
    color: "#D97706",
  },
];

export function BurgerExplodeAnimation() {
  const prefersReducedMotion = useReducedMotion();
  const [isExploded, setIsExploded] = useState(true);
  const [activeLayer, setActiveLayer] = useState<string>("patty");

  // Auto-expand on mount after a subtle delay if reduced motion is not preferred
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsExploded(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsExploded(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  const activeLayerData = BURGER_LAYERS.find((l) => l.id === activeLayer) || BURGER_LAYERS[4];

  return (
    <div className="w-full rounded-3xl bg-gradient-to-b from-[#0A3D28] via-[#062E1F] to-[#041F15] p-5 sm:p-8 md:p-10 text-white shadow-2xl border border-emerald-500/20 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-700/40 pb-5 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>Anatomy of Flavor</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
            The Tex’s Smash Burger
          </h3>
          <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 max-w-xl">
            Smashed on a 450° flat-top grill for maximum caramelized crust, built exclusively with 100% certified halal beef, fresh toppings, and toasted brioche.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-emerald-950/80 p-1 rounded-xl border border-emerald-700/60 shrink-0 self-start sm:self-center">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setIsExploded(false)}
            className={`h-8 px-3 text-xs font-semibold rounded-lg transition-all ${
              !isExploded
                ? "bg-amber-400 text-slate-950 shadow-xs"
                : "text-emerald-200 hover:text-white hover:bg-emerald-800/40"
            }`}
          >
            Assembled
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setIsExploded(true)}
            className={`h-8 px-3 text-xs font-semibold rounded-lg transition-all ${
              isExploded
                ? "bg-amber-400 text-slate-950 shadow-xs"
                : "text-emerald-200 hover:text-white hover:bg-emerald-800/40"
            }`}
          >
            <Layers className="w-3.5 h-3.5 mr-1" />
            Exploded View
          </Button>
        </div>
      </div>

      {/* Interactive Stage & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Visual Burger Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[440px] relative py-8 select-none">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] h-[340px] sm:h-[380px] flex items-center justify-center">
            {/* Ambient pedestal glow */}
            <div className="absolute bottom-4 w-44 h-8 bg-black/60 rounded-full blur-md" />

            {/* Layer 1: Top Bun */}
            <motion.div
              animate={
                isExploded && !prefersReducedMotion
                  ? { y: BURGER_LAYERS[0].yOffset, rotate: BURGER_LAYERS[0].rotate, scale: 1.02 }
                  : { y: -50, rotate: 0, scale: 1 }
              }
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              onClick={() => setActiveLayer("top-bun")}
              className={`absolute cursor-pointer transition-filter duration-300 z-50 ${
                activeLayer === "top-bun" ? "drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" : "drop-shadow-lg"
              }`}
            >
              <svg width="240" height="75" viewBox="0 0 240 75" fill="none" className="w-[210px] sm:w-[240px]">
                {/* Bun Top Dome */}
                <path
                  d="M15 70 C 15 20, 60 4, 120 4 C 180 4, 225 20, 225 70 Z"
                  fill="url(#bunTopGrad)"
                  stroke="#92400E"
                  strokeWidth="2"
                />
                {/* Bun highlight shine */}
                <ellipse cx="100" cy="22" rx="60" ry="12" fill="white" opacity="0.18" />
                {/* Sesame Seeds */}
                {[
                  [65, 30], [85, 20], [115, 18], [140, 22], [165, 32],
                  [50, 48], [95, 38], [125, 36], [150, 44], [180, 50],
                  [80, 52], [110, 50], [135, 54],
                ].map(([x, y], i) => (
                  <ellipse
                    key={i}
                    cx={x}
                    cy={y}
                    rx="3.2"
                    ry="1.8"
                    transform={`rotate(${(i * 25) % 40 - 20} ${x} ${y})`}
                    fill="#FEF3C7"
                    stroke="#D97706"
                    strokeWidth="0.5"
                  />
                ))}
                <defs>
                  <linearGradient id="bunTopGrad" x1="120" y1="4" x2="120" y2="72" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F59E0B" />
                    <stop offset="0.6" stopColor="#D97706" />
                    <stop offset="1" stopColor="#B45309" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            {/* Layer 2: Signature Sauce */}
            <motion.div
              animate={
                isExploded && !prefersReducedMotion
                  ? { y: BURGER_LAYERS[1].yOffset, rotate: BURGER_LAYERS[1].rotate, scale: 1.03 }
                  : { y: -26, rotate: 0, scale: 1 }
              }
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              onClick={() => setActiveLayer("sauce")}
              className={`absolute cursor-pointer transition-filter duration-300 z-40 ${
                activeLayer === "sauce" ? "drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" : "drop-shadow-md"
              }`}
            >
              <svg width="220" height="28" viewBox="0 0 220 28" fill="none" className="w-[190px] sm:w-[220px]">
                <path
                  d="M10 12 Q 35 24, 60 12 Q 85 28, 110 14 Q 140 26, 170 12 Q 195 24, 210 14 L 205 6 Q 160 2, 110 2 Q 60 2, 15 6 Z"
                  fill="#EA580C"
                />
                <path
                  d="M18 10 Q 40 20, 65 10 Q 90 22, 115 12 Q 145 22, 175 10 Q 195 20, 205 12"
                  stroke="#FDBA74"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>

            {/* Layer 3: Pickles & Red Onions */}
            <motion.div
              animate={
                isExploded && !prefersReducedMotion
                  ? { y: BURGER_LAYERS[2].yOffset, rotate: BURGER_LAYERS[2].rotate, scale: 1.02 }
                  : { y: -12, rotate: 0, scale: 1 }
              }
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              onClick={() => setActiveLayer("pickles-onions")}
              className={`absolute cursor-pointer transition-filter duration-300 z-30 ${
                activeLayer === "pickles-onions" ? "drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" : "drop-shadow-md"
              }`}
            >
              <svg width="230" height="26" viewBox="0 0 230 26" fill="none" className="w-[200px] sm:w-[230px]">
                {/* Pickles */}
                <ellipse cx="45" cy="13" rx="22" ry="9" fill="#15803D" stroke="#166534" strokeWidth="1.5" />
                <ellipse cx="45" cy="13" rx="16" ry="6" fill="#22C55E" />
                <ellipse cx="115" cy="12" rx="24" ry="10" fill="#15803D" stroke="#166534" strokeWidth="1.5" />
                <ellipse cx="115" cy="12" rx="18" ry="7" fill="#22C55E" />
                <ellipse cx="185" cy="13" rx="22" ry="9" fill="#15803D" stroke="#166534" strokeWidth="1.5" />
                <ellipse cx="185" cy="13" rx="16" ry="6" fill="#22C55E" />
                {/* Red Onion rings */}
                <path d="M70 14 C 80 4, 100 4, 110 14" stroke="#BE185D" strokeWidth="3" strokeLinecap="round" />
                <path d="M140 14 C 150 4, 170 4, 180 14" stroke="#BE185D" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </motion.div>

            {/* Layer 4: Melted Cheese */}
            <motion.div
              animate={
                isExploded && !prefersReducedMotion
                  ? { y: BURGER_LAYERS[3].yOffset, rotate: BURGER_LAYERS[3].rotate, scale: 1.04 }
                  : { y: -2, rotate: 0, scale: 1 }
              }
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              onClick={() => setActiveLayer("cheese")}
              className={`absolute cursor-pointer transition-filter duration-300 z-25 ${
                activeLayer === "cheese" ? "drop-shadow-[0_0_15px_rgba(245,158,11,0.9)]" : "drop-shadow-md"
              }`}
            >
              <svg width="245" height="34" viewBox="0 0 245 34" fill="none" className="w-[215px] sm:w-[245px]">
                <path
                  d="M10 6 L 235 6 L 210 24 Q 180 34, 160 14 Q 140 32, 115 16 Q 90 32, 60 14 Q 35 34, 10 6 Z"
                  fill="#F59E0B"
                  stroke="#D97706"
                  strokeWidth="1.5"
                />
                <path
                  d="M20 10 L 225 10"
                  stroke="#FDE68A"
                  strokeWidth="2"
                  opacity="0.8"
                />
              </svg>
            </motion.div>

            {/* Layer 5: Halal Smashed Beef Patty */}
            <motion.div
              animate={
                isExploded && !prefersReducedMotion
                  ? { y: BURGER_LAYERS[4].yOffset, rotate: BURGER_LAYERS[4].rotate, scale: 1.03 }
                  : { y: 12, rotate: 0, scale: 1 }
              }
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              onClick={() => setActiveLayer("patty")}
              className={`absolute cursor-pointer transition-filter duration-300 z-20 ${
                activeLayer === "patty" ? "drop-shadow-[0_0_18px_rgba(234,88,12,0.8)]" : "drop-shadow-lg"
              }`}
            >
              <svg width="245" height="42" viewBox="0 0 245 42" fill="none" className="w-[215px] sm:w-[245px]">
                {/* Irregular seared smash edges */}
                <path
                  d="M8 20 Q 2 12, 18 10 Q 40 6, 75 8 Q 110 5, 145 8 Q 185 5, 215 9 Q 242 12, 238 22 Q 244 32, 222 34 Q 180 36, 135 34 Q 90 37, 50 34 Q 15 35, 8 20 Z"
                  fill="url(#pattyGrad)"
                  stroke="#451A03"
                  strokeWidth="2"
                />
                {/* Charred sear lines & crust texture */}
                <path d="M40 18 Q 70 24, 105 16" stroke="#290E02" strokeWidth="3" strokeLinecap="round" />
                <path d="M125 16 Q 160 24, 195 18" stroke="#290E02" strokeWidth="3" strokeLinecap="round" />
                <path d="M70 26 Q 110 30, 150 25" stroke="#290E02" strokeWidth="2.5" strokeLinecap="round" />
                {/* Juicy sizzle highlights */}
                <ellipse cx="60" cy="14" rx="8" ry="2" fill="#F59E0B" opacity="0.4" />
                <ellipse cx="140" cy="13" rx="10" ry="2" fill="#F59E0B" opacity="0.4" />
                <defs>
                  <linearGradient id="pattyGrad" x1="120" y1="5" x2="120" y2="38" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#78350F" />
                    <stop offset="0.5" stopColor="#5B2207" />
                    <stop offset="1" stopColor="#3B1504" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            {/* Layer 6: Lettuce & Tomato */}
            <motion.div
              animate={
                isExploded && !prefersReducedMotion
                  ? { y: BURGER_LAYERS[5].yOffset, rotate: BURGER_LAYERS[5].rotate, scale: 1.02 }
                  : { y: 26, rotate: 0, scale: 1 }
              }
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              onClick={() => setActiveLayer("lettuce-tomato")}
              className={`absolute cursor-pointer transition-filter duration-300 z-15 ${
                activeLayer === "lettuce-tomato" ? "drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" : "drop-shadow-md"
              }`}
            >
              <svg width="240" height="30" viewBox="0 0 240 30" fill="none" className="w-[210px] sm:w-[240px]">
                {/* Ruffled Lettuce */}
                <path
                  d="M10 18 Q 20 8, 35 16 Q 50 6, 68 18 Q 85 8, 105 18 Q 125 6, 145 18 Q 165 8, 185 18 Q 205 8, 225 18 Q 215 28, 185 24 Q 140 26, 105 24 Q 60 26, 10 18 Z"
                  fill="#22C55E"
                  stroke="#15803D"
                  strokeWidth="1.5"
                />
                {/* Tomato peek */}
                <ellipse cx="65" cy="14" rx="30" ry="7" fill="#DC2626" />
                <ellipse cx="160" cy="13" rx="32" ry="7" fill="#DC2626" />
              </svg>
            </motion.div>

            {/* Layer 7: Bottom Bun */}
            <motion.div
              animate={
                isExploded && !prefersReducedMotion
                  ? { y: BURGER_LAYERS[6].yOffset, rotate: BURGER_LAYERS[6].rotate, scale: 1.01 }
                  : { y: 44, rotate: 0, scale: 1 }
              }
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              onClick={() => setActiveLayer("bottom-bun")}
              className={`absolute cursor-pointer transition-filter duration-300 z-10 ${
                activeLayer === "bottom-bun" ? "drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" : "drop-shadow-md"
              }`}
            >
              <svg width="230" height="40" viewBox="0 0 230 40" fill="none" className="w-[200px] sm:w-[230px]">
                <path
                  d="M12 4 L 218 4 Q 224 24, 205 32 Q 160 38, 115 38 Q 70 38, 25 32 Q 6 24, 12 4 Z"
                  fill="url(#bunBottomGrad)"
                  stroke="#92400E"
                  strokeWidth="2"
                />
                <path d="M25 8 L 205 8" stroke="#FDE68A" strokeWidth="2" opacity="0.6" />
                <defs>
                  <linearGradient id="bunBottomGrad" x1="115" y1="4" x2="115" y2="38" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F59E0B" />
                    <stop offset="0.6" stopColor="#D97706" />
                    <stop offset="1" stopColor="#B45309" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          </div>

          <p className="text-[11px] text-emerald-300/70 mt-3 italic text-center">
            {isExploded
              ? "Tap any ingredient above to inspect culinary details"
              : "Tap 'Exploded View' to inspect each layer"}
          </p>
        </div>

        {/* Layer Details & Information Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Active Layer Highlight Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-500/30 shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                {activeLayerData.badge}
              </span>
              <span className="text-xs text-emerald-300 font-mono">
                Layer {BURGER_LAYERS.findIndex((l) => l.id === activeLayer) + 1} of 7
              </span>
            </div>

            <h4 className="text-lg sm:text-xl font-extrabold text-white mb-2">
              {activeLayerData.name}
            </h4>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              {activeLayerData.detail}
            </p>

            {/* Special Callout for the Patty */}
            {activeLayer === "patty" && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white font-semibold">Quality Commitment:</strong> Ground fresh from 100% certified halal beef. No pink slime, no chemical rinses, and no ammonia fillers.
                </span>
              </div>
            )}
          </div>

          {/* Quick Layer Switcher Pills */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300/80 block">
              Ingredient Breakdown:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {BURGER_LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => {
                    setActiveLayer(layer.id);
                    if (!isExploded) setIsExploded(true);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    activeLayer === layer.id
                      ? "bg-amber-400 text-slate-950 font-bold shadow-xs scale-105"
                      : "bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/60 border border-emerald-700/40"
                  }`}
                >
                  {activeLayer === layer.id && <Check className="w-3 h-3" />}
                  <span>{layer.name.split(" ")[0]} {layer.name.split(" ")[1] || ""}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
