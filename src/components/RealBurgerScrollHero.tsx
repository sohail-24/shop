import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ChevronDown, Utensils, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RealBurgerLayer {
  id: string;
  name: string;
  detail: string;
  badge: string;
  clipPath: string;
  yOffsetDesktop: number;
  yOffsetMobile: number;
  rotate: number;
  scaleOffset: number;
  side: "left" | "right";
  topPercent: number; // approximate vertical position for label
}

// Layer cuts using the authentic real burger photograph (/branding/texs-burger.png)
// Total image height: 1199px.
// Overlapping inset slices ensure 100% seamless reconstruction when assembled (offset = 0).
const REAL_BURGER_LAYERS: RealBurgerLayer[] = [
  {
    id: "crown",
    name: "Golden Brioche Crown",
    detail: "Toasted golden-brown with roasted sesame seeds",
    badge: "Freshly Baked",
    clipPath: "inset(0% 0% 58% 0%)",
    yOffsetDesktop: -85,
    yOffsetMobile: -48,
    rotate: -2,
    scaleOffset: 0.02,
    side: "left",
    topPercent: 18,
  },
  {
    id: "sauce-pickles",
    name: "Signature Sauce & Pickles",
    detail: "Tangy southern spice blend with crisp crinkle pickles",
    badge: "House Secret",
    clipPath: "inset(36% 0% 48% 0%)",
    yOffsetDesktop: -42,
    yOffsetMobile: -24,
    rotate: 1.5,
    scaleOffset: 0.015,
    side: "right",
    topPercent: 36,
  },
  {
    id: "cheese",
    name: "Real Melted American Cheese",
    detail: "Gooey golden layer melting over sizzling seared beef",
    badge: "Rich & Gooey",
    clipPath: "inset(48% 0% 36% 0%)",
    yOffsetDesktop: -6,
    yOffsetMobile: -4,
    rotate: -0.6,
    scaleOffset: 0.01,
    side: "left",
    topPercent: 50,
  },
  {
    id: "patty",
    name: "100% Halal Smashed Beef Patty",
    detail: "Never frozen, seared hot with crispy lacy caramelized edges",
    badge: "100% Halal Beef",
    clipPath: "inset(58% 0% 18% 0%)",
    yOffsetDesktop: 38,
    yOffsetMobile: 22,
    rotate: 1.2,
    scaleOffset: 0.02,
    side: "right",
    topPercent: 66,
  },
  {
    id: "heel",
    name: "Toasted Brioche Heel",
    detail: "Buttery, pillowy soft foundation holding every juicy bite",
    badge: "Pillowy Soft",
    clipPath: "inset(80% 0% 0% 0%)",
    yOffsetDesktop: 85,
    yOffsetMobile: 48,
    rotate: -1,
    scaleOffset: 0.01,
    side: "left",
    topPercent: 84,
  },
];

export function RealBurgerScrollHero() {
  const containerRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Measure mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reversible scroll-linked animation listener
  useEffect(() => {
    let animationFrameId: number;

    const updateScrollProgress = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || 1;
      const totalScrollable = rect.height - windowHeight;

      if (totalScrollable <= 0) {
        setScrollProgress(0);
        return;
      }

      // currentScroll = how far container top has scrolled up past viewport top
      const currentScroll = -rect.top;
      const rawProgress = currentScroll / totalScrollable;
      const clamped = Math.max(0, Math.min(1, rawProgress));
      setScrollProgress(clamped);
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateScrollProgress);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateScrollProgress();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Animation progression curve:
  // Starts at 0 (assembled)
  // Reaches full exploded separation around progress 0.3 - 0.75
  // Stays exploded through middle scroll, then flows into Origin section
  const explodeFactor = Math.min(1, Math.max(0, (scrollProgress - 0.04) / 0.45));
  const labelsOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.15) / 0.3));
  const isExploded = explodeFactor > 0.15;

  return (
    <section
      id="about-hero"
      ref={containerRef}
      className="relative w-full bg-white text-slate-900 border-b border-stone-100 h-[175vh] sm:h-[195vh] selection:bg-emerald-800 selection:text-amber-200"
    >
      {/* Sticky Hero Viewport */}
      <div className="sticky top-0 h-[100dvh] w-full flex flex-col justify-between items-center py-4 sm:py-6 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto overflow-hidden">
        
        {/* Top Branding Block */}
        <div className="flex flex-col items-center text-center w-full z-20 shrink-0 pt-1 sm:pt-2">
          {/* Official Logo */}
          <div className="relative mb-2 sm:mb-3">
            <div className="inline-flex p-2 sm:p-2.5 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <img
                src="/branding/logo.png"
                alt="Tex’s Chicken & Burgers"
                className="h-10 sm:h-14 md:h-16 w-auto object-contain drop-shadow-xs"
              />
            </div>
          </div>

          {/* Main Brand Title: TEX'S / CHICKEN & BURGERS */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.06] text-slate-900 max-w-3xl">
            TEX’S
            <br />
            <span className="text-emerald-800">
              CHICKEN &amp; BURGERS
            </span>
          </h1>

          {/* Official Tagline */}
          <p className="mt-1.5 sm:mt-2 text-base sm:text-xl md:text-2xl font-extrabold text-amber-600 tracking-wide">
            Worth Every Bite
          </p>

          {/* Subtitle Pillars */}
          <div className="mt-1 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-slate-600 tracking-wider uppercase">
            <span>Fresh</span>
            <span className="text-amber-500">•</span>
            <span>Crispy</span>
            <span className="text-amber-500">•</span>
            <span>100% Halal</span>
          </div>
        </div>

        {/* Center: Visually Dominant Real Burger Photograph */}
        <div className="relative w-full flex-1 flex items-center justify-center my-auto min-h-0 z-10 select-none">
          {/* Burger Canvas Container */}
          <div className="relative w-full max-w-[280px] sm:max-w-[360px] md:max-w-[440px] lg:max-w-[500px] aspect-[1312/1199] flex items-center justify-center">
            
            {/* Soft Ambient Radial Vignette so real burger photo blends into white background */}
            <div
              className="absolute inset-[-8%] rounded-full pointer-events-none opacity-30 blur-2xl bg-amber-200/40"
              style={{
                transform: `scale(${1 + explodeFactor * 0.15})`,
                transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />

            {/* Base Full Assembled Real Burger Image (100% visible at scroll=0) */}
            <img
              src="/branding/texs-burger.png"
              alt="Tex’s Smash Burger Real Photograph"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              style={{
                opacity: Math.max(0, 1 - explodeFactor * 4),
                transition: "opacity 0.15s ease-out",
                // Soft radial mask to fade photo perimeter into white
                WebkitMaskImage: "radial-gradient(ellipse 75% 72% at 50% 50%, black 50%, transparent 92%)",
                maskImage: "radial-gradient(ellipse 75% 72% at 50% 50%, black 50%, transparent 92%)",
              }}
            />

            {/* Separating Real Food Layers */}
            {REAL_BURGER_LAYERS.map((layer) => {
              const yOffset = isMobile ? layer.yOffsetMobile : layer.yOffsetDesktop;
              const translateY = yOffset * explodeFactor;
              const rotate = layer.rotate * explodeFactor;
              const scale = 1 + layer.scaleOffset * explodeFactor;

              return (
                <div
                  key={layer.id}
                  id={`burger-layer-${layer.id}`}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{
                    clipPath: layer.clipPath,
                    transform: `translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                    transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                    willChange: "transform",
                    WebkitMaskImage: "radial-gradient(ellipse 75% 72% at 50% 50%, black 50%, transparent 92%)",
                    maskImage: "radial-gradient(ellipse 75% 72% at 50% 50%, black 50%, transparent 92%)",
                    filter: isExploded
                      ? "drop-shadow(0 8px 12px rgba(0,0,0,0.12))"
                      : "none",
                  }}
                >
                  <img
                    src="/branding/texs-burger.png"
                    alt={layer.name}
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />
                </div>
              );
            })}

            {/* Desktop Floating Ingredient Callouts */}
            {!isMobile && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{ opacity: labelsOpacity }}
              >
                {REAL_BURGER_LAYERS.map((layer) => {
                  const yOffset = layer.yOffsetDesktop * explodeFactor;
                  const isLeft = layer.side === "left";

                  return (
                    <div
                      key={`label-${layer.id}`}
                      className={`absolute flex items-center gap-2 ${
                        isLeft ? "-left-44 lg:-left-56 flex-row-reverse" : "-right-44 lg:-right-56 flex-row"
                      }`}
                      style={{
                        top: `${layer.topPercent}%`,
                        transform: `translateY(${yOffset}px)`,
                        transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      {/* Connecting line */}
                      <div className="w-8 lg:w-12 h-px bg-stone-300 shrink-0" />
                      {/* Label Card */}
                      <div className="bg-white/95 backdrop-blur-xs border border-stone-200 rounded-xl px-3 py-1.5 shadow-sm text-left max-w-[190px] lg:max-w-[220px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {layer.badge}
                          </span>
                        </div>
                        <div className="text-xs lg:text-sm font-bold text-slate-900 mt-0.5 leading-tight">
                          {layer.name}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {layer.detail}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Layer Summary Pills when Exploded */}
        {isMobile && (
          <div
            className="w-full flex items-center justify-center gap-1.5 flex-wrap px-2 py-1 transition-opacity duration-200 shrink-0 mb-1"
            style={{ opacity: labelsOpacity }}
          >
            {REAL_BURGER_LAYERS.map((layer) => (
              <span
                key={`mobile-pill-${layer.id}`}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-slate-800 border border-stone-200 whitespace-nowrap"
              >
                {layer.name.replace("100% Halal ", "").replace("Real Melted ", "")}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Hero Actions & Reversible Scroll Guide */}
        <div className="w-full flex flex-col items-center z-20 shrink-0 pb-1 sm:pb-2">
          {/* Interactive Scroll Status */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 mb-3">
            <ChevronDown className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
            <span>
              {scrollProgress < 0.15
                ? "Scroll down to see the real food craft"
                : scrollProgress < 0.85
                ? "Scroll up to assemble • Scroll down for NYC story"
                : "Continuing to Section 01 • Origin"}
            </span>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <a href="#born-in-nyc">
              <Button
                size="sm"
                className="h-10 sm:h-11 px-5 sm:px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs gap-1.5 transition-transform hover:scale-[1.02]"
              >
                <ChevronDown className="h-4 w-4" />
                Explore Our Story
              </Button>
            </a>
            <Link to="/products">
              <Button
                size="sm"
                variant="outline"
                className="h-10 sm:h-11 px-5 sm:px-6 border border-stone-300 bg-white hover:bg-stone-50 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl shadow-2xs gap-1.5"
              >
                <Utensils className="h-4 w-4" />
                Explore Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
