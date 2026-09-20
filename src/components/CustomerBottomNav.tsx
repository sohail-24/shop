import { Link } from "react-router";
import { Home, Info, LayoutGrid, ShoppingCart } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useGuestCart } from "@/lib/guestCart";

interface CustomerBottomNavProps {
  active?: "home" | "categories" | "cart" | "about" | "login" | "none";
}

export function CustomerBottomNav({ active = "categories" }: CustomerBottomNavProps) {
  const { user } = useAuth();
  const guestCart = useGuestCart();
  const isAuthenticated = !!user;
  const cartQuery = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  const cartCount = isAuthenticated
    ? (cartQuery.data?.count ?? 0)
    : guestCart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] border-t border-[#E5E7EB] shadow-[0_-1px_6px_rgba(0,0,0,0.04)] px-2 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-4 items-center max-w-md mx-auto">
        {/* 1. Home */}
        <Link
          to="/"
          id="mobile-nav-home"
          onClick={() => {
            if (window.location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className={`flex flex-col items-center justify-center py-0.5 transition-colors group ${
            active === "home"
              ? "text-emerald-700 font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
        >
          <Home
            className={`h-5 w-5 transition-all ${
              active === "home"
                ? "text-emerald-700 group-hover:scale-110"
                : "text-slate-500 group-hover:text-slate-800 group-hover:scale-110"
            }`}
          />
          <span className={`text-[10px] xs:text-[11px] mt-0.5 leading-none ${active === "home" ? "font-bold" : ""}`}>
            Home
          </span>
        </Link>

        {/* 2. Categories */}
        <Link
          to="/products"
          id="mobile-nav-categories"
          className={`flex flex-col items-center justify-center py-0.5 transition-colors group ${
            active === "categories"
              ? "text-emerald-700 font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
        >
          <LayoutGrid
            className={`h-5 w-5 transition-all ${
              active === "categories"
                ? "text-emerald-700 group-hover:scale-110"
                : "text-slate-500 group-hover:text-slate-800 group-hover:scale-110"
            }`}
          />
          <span
            className={`text-[10px] xs:text-[11px] mt-0.5 leading-none ${
              active === "categories" ? "font-bold" : ""
            }`}
          >
            Categories
          </span>
        </Link>

        {/* 3. Cart */}
        <Link
          to="/cart"
          id="mobile-nav-cart"
          className={`relative flex flex-col items-center justify-center py-0.5 transition-colors group ${
            active === "cart"
              ? "text-emerald-700 font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
        >
          <div className="relative">
            <ShoppingCart
              className={`h-5 w-5 transition-all ${
                active === "cart"
                  ? "text-emerald-700 group-hover:scale-110"
                  : "text-slate-500 group-hover:text-slate-800 group-hover:scale-110"
              }`}
            />
            {!!cartCount && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] xs:text-[11px] mt-0.5 leading-none ${active === "cart" ? "font-bold" : ""}`}>
            Cart
          </span>
        </Link>

        {/* 4. About */}
        <Link
          to="/about"
          id="mobile-nav-about"
          className={`flex flex-col items-center justify-center py-0.5 transition-colors group ${
            active === "about"
              ? "text-emerald-700 font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
        >
          <Info
            className={`h-5 w-5 transition-all ${
              active === "about"
                ? "text-emerald-700 group-hover:scale-110"
                : "text-slate-500 group-hover:text-slate-800 group-hover:scale-110"
            }`}
          />
          <span className={`text-[10px] xs:text-[11px] mt-0.5 leading-none ${active === "about" ? "font-bold" : ""}`}>
            About
          </span>
        </Link>
      </div>
    </nav>
  );
}

export default CustomerBottomNav;
