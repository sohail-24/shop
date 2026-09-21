import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/const";
import { getAppRole, getRoleLabel, type AppRole } from "@/lib/roles";
import { trpc } from "@/providers/trpc";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { AuthLayoutSkeleton } from "./AuthLayoutSkeleton";
import {
  BarChart3,
  Bell,
  Boxes,
  ClipboardList,
  Command,
  FolderTree,
  Gift,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  ReceiptText,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sun,
  Truck,
  User,
  Users,
  Warehouse,
} from "lucide-react";
import { useTheme } from "@/providers/theme";
import { type ElementType } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

type NavItem = {
  icon: ElementType;
  label: string;
  path: string;
  badge?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const roleNavigation: Record<AppRole, NavGroup[]> = {
  buyer: [
    {
      label: "Procurement",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: ShoppingBag, label: "Browse Products", path: "/products" },
        { icon: ShoppingCart, label: "My Cart", path: "/cart", badge: "cart" },
        { icon: ClipboardList, label: "Purchase Orders", path: "/orders" },
      ],
    },
    {
      label: "Workspace",
      items: [
        { icon: User, label: "Profile", path: "/profile" },
        { icon: Settings, label: "Settings", path: "/settings" },
      ],
    },
  ],
  business_owner: [
    {
      label: "Operations",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: Package, label: "Product Catalog", path: "/products" },
        { icon: FolderTree, label: "Categories", path: "/categories" },
        { icon: Warehouse, label: "Inventory", path: "/inventory" },
        { icon: Warehouse, label: "Warehouse", path: "/warehouse" },
        { icon: ClipboardList, label: "Orders", path: "/orders" },
        { icon: ReceiptText, label: "Invoices", path: "/invoices" },
        { icon: Users, label: "Customers", path: "/customers" },
        { icon: Truck, label: "Delivery Zones", path: "/delivery-zones" },
        { icon: ReceiptText, label: "GST Rules", path: "/gst-rules" },
        { icon: SlidersHorizontal, label: "Shipping Rules", path: "/shipping-rules" },
        { icon: Gift, label: "Coupons", path: "/coupons" },
        { icon: BarChart3, label: "Reports", path: "/reports" },
        { icon: Bell, label: "Notifications", path: "/notifications" },
        { icon: User, label: "Staff", path: "/staff" },
      ],
    },
    {
      label: "Administration",
      items: [
        { icon: Settings, label: "Settings", path: "/settings" },
        { icon: Plus, label: "Add Product", path: "/products/new" },
        { icon: User, label: "Profile", path: "/profile" },
      ],
    },
  ],
  platform_admin: [
    {
      label: "Platform",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: Package, label: "Product Catalog", path: "/products" },
        { icon: FolderTree, label: "Categories", path: "/categories" },
        { icon: Warehouse, label: "Inventory", path: "/inventory" },
        { icon: Warehouse, label: "Warehouse", path: "/warehouse" },
        { icon: ClipboardList, label: "Orders", path: "/orders" },
        { icon: ReceiptText, label: "Invoices", path: "/invoices" },
        { icon: Users, label: "Customers", path: "/customers" },
        { icon: Truck, label: "Delivery Zones", path: "/delivery-zones" },
        { icon: ReceiptText, label: "GST Rules", path: "/gst-rules" },
        { icon: SlidersHorizontal, label: "Shipping Rules", path: "/shipping-rules" },
        { icon: Gift, label: "Coupons", path: "/coupons" },
        { icon: BarChart3, label: "Reports", path: "/reports" },
        { icon: Bell, label: "Notifications", path: "/notifications" },
        { icon: User, label: "Staff", path: "/staff" },
      ],
    },
    {
      label: "Controls",
      items: [
        { icon: Settings, label: "Settings", path: "/settings" },
        { icon: User, label: "Profile", path: "/profile" },
      ],
    },
  ],
};

export default function AppLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLayoutSkeleton />;
  }

  // Public storefront pages share this route outlet but must not expose the
  // admin sidebar or wrap public pages in the SidebarProvider flex-wrapper.
  if (!user) {
    return <Outlet />;
  }

  return (
    <SidebarProvider>
      <AppLayoutContent />
    </SidebarProvider>
  );
}

function AppLayoutContent() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const companyQuery = trpc.company.byId.useQuery(
    { id: user?.companyId ?? 0 },
    { enabled: !!user?.companyId, retry: false },
  );
  const cartQuery = trpc.cart.list.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });

  const company = companyQuery.data ?? null;
  const role = getAppRole(user);
  const businessName = company?.name ?? "Tex’s Chicken & Burgers";
  const initials = (user?.name ?? businessName)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!user) {
    return <Outlet />;
  }

  const isActive = (path: string) => {
    if (path === "/products") {
      return location.pathname === "/products" || location.pathname.startsWith("/products/");
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      <Sidebar collapsible="icon" className="z-40 border-sidebar-border">
        <SidebarHeader className="h-16 border-b border-sidebar-border px-3">
          <Link to={role === "buyer" ? "/" : "/dashboard"} className="flex min-w-0 items-center gap-3 rounded-md px-1 py-1.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-sidebar-border overflow-hidden shadow-sm p-0.5">
              <img
                src="/branding/logo.png"
                alt="Tex’s Chicken & Burgers"
                className="h-full w-full object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-sidebar-foreground">
                  {businessName}
                </div>
                <div className="truncate text-[11px] text-sidebar-foreground/60">
                  {getRoleLabel(role)}
                </div>
              </div>
            )}
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          {roleNavigation[role].map((group) => (
            <SidebarGroup key={group.label} className="px-0 py-1">
              <SidebarGroupLabel className="px-3 text-[11px] uppercase tracking-wide">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <SidebarMenuItem key={`${group.label}-${item.label}-${item.path}`}>
                        <SidebarMenuButton
                          isActive={active}
                          tooltip={item.label}
                          onClick={() => {
                            navigate(item.path);
                            setOpenMobile(false);
                          }}
                          className="h-9 rounded-lg"
                        >
                          <item.icon className={active ? "text-sidebar-primary" : undefined} />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                        {item.badge === "cart" && !!cartQuery.data?.count && (
                          <SidebarMenuBadge>{cartQuery.data.count}</SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-3">
          {user ? (
            <UserMenu
              initials={initials || "TC"}
              userName={user.name ?? "Tex’s Admin"}
              userDetail={user.email ?? user.phone ?? getRoleLabel(role)}
              role={role}
              onLogout={logout}
            />
          ) : (
            <Button onClick={() => navigate(LOGIN_PATH)} size="sm" className="w-full">
              <User className="mr-2 h-4 w-4" />
              Sign in
            </Button>
          )}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 lg:px-6">
          <SidebarTrigger className="h-9 w-9 md:hidden" />
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-9 w-9 md:inline-flex"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>

          <div className="relative hidden min-w-[260px] max-w-xl flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search Tex’s Chicken & Burgers"
              placeholder={role === "buyer" ? "Search dishes, platters, gyros, drinks..." : "Search menu items, orders, inventory..."}
              className="h-9 border-input bg-card pl-9 pr-10"
            />
            <div className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground lg:flex">
              <Command className="h-3 w-3" /> K
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="hidden h-8 items-center gap-1 rounded-md px-2 text-xs sm:flex">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              INR
            </Badge>
            <ThemeMenu />
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <UserMenu
              initials={initials || "FF"}
              userName={user?.name ?? "Guest"}
              userDetail={user?.email ?? user?.phone ?? "Not signed in"}
              role={role}
              onLogout={logout}
              compact
            />
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-5 pb-24 md:pb-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around bg-card border-t pb-safe md:hidden shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.05)]">
          <Link to={role === "buyer" ? "/" : "/dashboard"} className={`flex flex-col items-center gap-1 ${isActive(role === "buyer" ? "/" : "/dashboard") ? "text-primary" : "text-muted-foreground"}`}>
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/products" className={`flex flex-col items-center gap-1 ${isActive("/products") ? "text-primary" : "text-muted-foreground"}`}>
            <ShoppingBag className="h-5 w-5" />
            <span className="text-[10px] font-medium">Catalog</span>
          </Link>
          <Link to="/cart" className={`relative flex flex-col items-center gap-1 ${isActive("/cart") ? "text-primary" : "text-muted-foreground"}`}>
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {!!cartQuery.data?.count && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {cartQuery.data.count}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Cart</span>
          </Link>
          <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive("/profile") ? "text-primary" : "text-muted-foreground"}`}>
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </SidebarInset>
    </>
  );
}

function ThemeMenu() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({
  initials,
  userName,
  userDetail,
  role,
  onLogout,
  compact = false,
}: {
  initials: string;
  userName: string;
  userDetail: string;
  role: AppRole;
  onLogout: () => void;
  compact?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex min-w-0 items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-accent erp-focus">
          <Avatar className="h-8 w-8 border">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!compact && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{userName}</div>
              <div className="truncate text-xs text-muted-foreground">{getRoleLabel(role)}</div>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="space-y-1">
            <div className="truncate font-medium">{userName}</div>
            <div className="truncate text-xs font-normal text-muted-foreground">{userDetail}</div>
            <Badge variant="secondary" className="mt-1 rounded-md text-[11px]">
              {getRoleLabel(role)}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <User className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} variant="destructive">
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
