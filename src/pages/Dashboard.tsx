import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate, formatNumber } from "@/lib/i18n";
import { getAppRole } from "@/lib/roles";
import { MetricCard } from "@/components/freshflow/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveProductImageUrl } from "@/lib/image";
import {
  AlertTriangle,
  ChartNoAxesCombined,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderTree,
  IndianRupee,
  Package,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Warehouse,
} from "lucide-react";

const ownerNav = [
  "Dashboard",
  "Product Catalog",
  "Categories",
  "Inventory",
  "Warehouse",
  "Orders",
  "Invoices",
  "Customers",
  "Delivery Zones",
  "GST Rules",
  "Shipping Rules",
  "Coupons",
  "Reports",
  "Notifications",
  "Staff",
  "Settings",
];

export default function Dashboard() {
  const { user } = useAuth();
  const role = getAppRole(user);

  const featuredProductsQuery = trpc.product.featured.useQuery(undefined, {
    retry: false,
    enabled: role === "buyer",
  });
  const categoriesQuery = trpc.category.list.useQuery(undefined, { retry: false });
  const recentOrdersQuery = trpc.order.recent.useQuery({ limit: 5 }, { retry: false, enabled: !!user });
  const cartQuery = trpc.cart.list.useQuery(undefined, {
    retry: false,
    enabled: role === "buyer" && !!user,
  });

  if (role === "buyer") {
    return (
      <BuyerDashboard
        featuredProducts={featuredProductsQuery.data ?? []}
        featuredLoading={featuredProductsQuery.isLoading}
        categoryCount={categoriesQuery.data?.length ?? 0}
        recentOrders={recentOrdersQuery.data ?? []}
        ordersLoading={recentOrdersQuery.isLoading}
        cartCount={cartQuery.data?.count ?? 0}
        cartLoading={cartQuery.isLoading}
      />
    );
  }

  return <OwnerDashboard />;
}

function BuyerDashboard({
  featuredProducts,
  featuredLoading,
  categoryCount,
  recentOrders,
  ordersLoading,
  cartCount,
  cartLoading,
}: {
  featuredProducts: Array<{
    id: number;
    name: string;
    slug: string;
    supplierName: string | null;
    minimumOrderQuantity?: number | null;
    image?: string | null;
  }>;
  featuredLoading: boolean;
  categoryCount: number;
  recentOrders: Array<{ id: number; orderNumber: string; totalAmount: unknown; status: string; orderedAt: Date; relatedCompanyName: string | null }>;
  ordersLoading: boolean;
  cartCount: number;
  cartLoading: boolean;
}) {
  const featured = featuredProducts.slice(0, 4);

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <section className="rounded-xl border bg-card p-6 shadow-premium">
        <Badge variant="secondary" className="mb-3 rounded-md">Buyer Workspace</Badge>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Buy wholesale products, review recent orders, and continue to the product catalog.
            </p>
          </div>
          <Link to="/products">
            <Button>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Products
            </Button>
          </Link>
        </div>
        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-12 rounded-lg pl-12 text-base" placeholder="Search products..." />
        </div>
      </section>

      <section className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={ShoppingCart} title="Cart Items" value={formatNumber(cartCount)} caption="Current cart" loading={cartLoading} />
        <MetricCard icon={Truck} title="Pending Deliveries" value={formatNumber(recentOrders.filter((order) => order.status !== "delivered").length)} caption="From order history" loading={ordersLoading} />
        <MetricCard icon={FolderTree} title="Categories" value={formatNumber(categoryCount)} caption="Active catalog groups" />
        <MetricCard icon={ClipboardList} title="Recent Orders" value={formatNumber(recentOrders.length)} caption="Order history" loading={ordersLoading} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Featured Products</CardTitle>
          </CardHeader>
          <CardContent>
            {featuredLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-56" />)}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {featured.length ? featured.map((product) => (
                  <Link key={product.id} to={`/products/${product.slug}`} className="rounded-lg border bg-card p-3 shadow-sm hover:bg-muted/40">
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-muted text-lg font-semibold text-muted-foreground">
                      {product.image ? (
                        <img src={resolveProductImageUrl(product.image)} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-8 w-8" />
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.supplierName ?? "Supplier"} · MOQ {product.minimumOrderQuantity}
                      </p>
                    </div>
                  </Link>
                )) : (
                  <p className="rounded-lg border p-4 text-sm text-muted-foreground sm:col-span-2 xl:col-span-4">
                    Published products will appear here.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-56" />
            ) : recentOrders.length ? (
              <div className="divide-y rounded-lg border">
                {recentOrders.map((order) => (
                  <Link key={order.id} to={`/orders/${order.id}`} className="flex items-center justify-between gap-3 p-3 hover:bg-muted/60">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.relatedCompanyName ?? "Supplier"} · {formatDate(order.orderedAt)}</p>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(order.totalAmount)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border p-4 text-sm text-muted-foreground">Order history will appear here.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function OwnerDashboard() {
  const reportSummaryQuery = trpc.report.dashboardSummary.useQuery(
    { period: "today" },
    { retry: false, refetchInterval: 10000 },
  );
  const recentOrdersQuery = trpc.order.recent.useQuery(
    { limit: 5, type: "supplier" },
    { retry: false, refetchInterval: 10000 },
  );
  const lowStockQuery = trpc.inventory.list.useQuery(
    { status: "low_stock" },
    { retry: false, refetchInterval: 10000 },
  );
  const summary = reportSummaryQuery.data;
  const recentOrderItems = (recentOrdersQuery.data ?? []).map((order) => ({
    label: `${order.orderNumber}   ${order.relatedCompanyName ?? "Customer"}   ${formatCurrency(order.totalAmount)}`,
    to: `/orders/${order.id}`,
  }));
  const lowStockItems = (lowStockQuery.data ?? []).slice(0, 5).map((item) => ({
    label: `${item.productName ?? `Product #${item.productId}`}   ${formatNumber(item.quantityAvailable)} available`,
    to: `/inventory`,
  }));
  const ownerStats = [
    ["Revenue", formatCurrency(summary?.revenue ?? 0), IndianRupee],
    ["Orders", formatNumber(summary?.orders ?? 0), ClipboardList],
    ["Products", formatNumber(summary?.products ?? 0), Package],
    ["Inventory", formatNumber(summary?.inventory ?? 0), Warehouse],
    ["Invoices", formatNumber(summary?.invoices ?? 0), FileText],
    ["Low Stock", formatNumber(summary?.lowStock ?? 0), AlertTriangle],
  ] as const;

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="rounded-lg border bg-card p-3 shadow-sm">
        <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">Dashboard</p>
        <nav className="grid gap-1">
          {ownerNav.map((item) => (
            <Link
              key={item}
              to={ownerPath(item)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 space-y-6">
        <section className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome Back, Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">Monitor your wholesale business from one place.</p>
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search..." />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ownerStats.map(([title, value, Icon]) => (
            <MetricCard key={title} title={title} value={value} icon={Icon} loading={reportSummaryQuery.isLoading} />
          ))}
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ChartNoAxesCombined className="h-4 w-4" />
              Sales Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-72 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
              Weekly / Monthly Sales Chart placeholder
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 xl:grid-cols-2">
          <DashboardList title="Recent Orders" items={recentOrderItems} loading={recentOrdersQuery.isLoading} empty="New orders will appear here." />
          <DashboardList title="Low Stock Alerts" items={lowStockItems} loading={lowStockQuery.isLoading} empty="No low-stock products." />
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Add Product", to: "/products/new" },
              { label: "Product Catalog", to: "/products" },
              { label: "Inventory", to: "/inventory" },
              { label: "Orders", to: "/orders" },
            ].map((action) => (
              <Link key={action.label} to={action.to}>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {["Database", "Server", "Payment", "WhatsApp API", "Email Service", "Storage"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <span>{item}</span>
                <span className="inline-flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {item === "Storage" ? "Healthy" : item === "Server" ? "Running" : item === "Payment" ? "Active" : "Connected"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function DashboardList({
  title,
  items,
  icon: Icon,
  loading,
  empty = "No records found.",
}: {
  title: string;
  items: Array<string | { label: string; to?: string }>;
  icon?: typeof ClipboardList;
  loading?: boolean;
  empty?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-32" />
        ) : items.length ? (
          <div className="divide-y rounded-lg border">
            {items.map((item) => {
              const label = typeof item === "string" ? item : item.label;
              const content = <span className="block truncate px-3 py-2 text-sm">{label}</span>;
              return typeof item !== "string" && item.to ? (
                <Link key={`${item.to}-${label}`} to={item.to} className="block hover:bg-muted/60">
                  {content}
                </Link>
              ) : (
                <div key={label}>{content}</div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-lg border p-4 text-sm text-muted-foreground">{empty}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ownerPath(label: string) {
  const paths: Record<string, string> = {
    Dashboard: "/dashboard",
    "Product Catalog": "/products",
    Categories: "/categories",
    Inventory: "/inventory",
    Warehouse: "/warehouse",
    Orders: "/orders",
    Invoices: "/invoices",
    Reports: "/reports",
    Settings: "/settings",
  };
  return paths[label] ?? "/dashboard";
}
