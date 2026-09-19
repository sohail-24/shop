import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { addGuestCartItem } from "@/lib/guestCart";
import { formatCurrency, toNumber, unitLabels } from "@/lib/i18n";
import { getAppRole } from "@/lib/roles";
import { MetricCard } from "@/components/freshflow/MetricCard";
import { QuantitySelector } from "@/components/freshflow/QuantitySelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle, DrawerHeader } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Eye,
  Image as ImageIcon,
  Package,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
} from "lucide-react";

type CatalogProduct = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  supplierName?: string | null;
  unitPrice?: unknown;
  unitType?: string | null;
  unitSize?: string | null;
  minimumOrderQuantity?: number | null;
  status?: string | null;
  stock?: number | null;
  rating?: string | number | null;
};

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
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sort, setSort] = useState("newest");
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const productsQuery = trpc.product.list.useQuery(
    {
      search: search || undefined,
      categoryId: categoryId !== "all" ? Number(categoryId) : undefined,
      status: "active",
      sortBy: sort === "price" ? "price" : "newest",
    },
    { retry: false },
  );
  const categoriesQuery = trpc.category.list.useQuery(undefined, { retry: false });
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: async () => {
      await utils.cart.list.invalidate();
      toast.success("Product added to cart.");
    },
    onError: (error) => toast.error(error.message || "Could not add product to cart."),
  });

  const products = (productsQuery.data ?? []) as CatalogProduct[];
  const activeCategories = categoriesQuery.data ?? [];

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

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 md:gap-4 pb-16 md:pb-0">
      <section className="rounded-lg border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <ArrowLeft className="h-4 w-4" />
            Shah's Halal
          </Link>
          <div className="relative flex-1 lg:max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search menu items..." />
          </div>
          <div className="hidden lg:flex gap-2">
            <Button variant="outline" size="icon"><ShoppingCart className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon"><Star className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto p-3">
          <Button
            type="button"
            variant={categoryId === "all" ? "default" : "ghost"}
            className="shrink-0"
            onClick={() => setCategoryId("all")}
          >
            All Products
          </Button>
          {activeCategories.map((category) => (
            <Button
              key={category.id}
              type="button"
              variant={categoryId === String(category.id) ? "default" : "ghost"}
              className="shrink-0"
              onClick={() => setCategoryId(String(category.id))}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Filters</h2>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {activeCategories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FilterCheck label="100% Certified Halal" checked />
            <FilterCheck label="Platters Over Rice" />
            <FilterCheck label="Pita Gyros & Wraps" />
            <FilterCheck label="Wings & Sides" />
            <div className="space-y-2">
              <Label>Price Range</Label>
              <div className="rounded-md border p-3 text-sm text-muted-foreground">$1.00 ───── $30.00</div>
            </div>
            <div className="space-y-2">
              <Label>Restaurant</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">Shah's Halal Food</SelectItem></SelectContent>
              </Select>
            </div>
            <FilterCheck label="Available to Order" checked />
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="text-sm">★★★★★ 4.8+</div>
              <div className="text-sm">★★★★☆ 4.0+</div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setCategoryId("all"); setSearch(""); }}>Reset Filters</Button>
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="hidden md:flex flex-wrap gap-2">
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline"><SlidersHorizontal className="mr-2 h-4 w-4" />Price</Button>
                <Button variant="outline"><Star className="mr-2 h-4 w-4" />Rating</Button>
              </div>
              <p className="text-sm font-medium">{products.length} Products</p>
            </CardContent>
          </Card>

          {productsQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-80" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={(quantity) => addProductToCart(product, quantity)} pending={addToCart.isPending} />
              ))}
            </div>
          )}

          {!productsQuery.isLoading && !products.length && (
            <Card>
              <CardContent className="flex min-h-60 flex-col items-center justify-center p-8 text-center">
                <Package className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <h2 className="font-semibold">No active products found</h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Products created and published by the business owner will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
      {/* Mobile Bottom Filter Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 flex h-14 items-center justify-center gap-4 border-t bg-card px-4 shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.1)] lg:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="flex-1">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-6">
              <div className="space-y-3">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {activeCategories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FilterCheck label="In Stock" checked />
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="text-sm">★★★★★</div>
                <div className="text-sm">★★★★☆</div>
              </div>
              <Button variant="outline" className="w-full">Reset Filters</Button>
            </div>
          </DrawerContent>
        </Drawer>
        <div className="h-6 w-px bg-border" />
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="flex-1">
              <Star className="mr-2 h-4 w-4" />
              Sort
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Sort By</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-3">
               <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}


function ProductCard({ product, onAdd, pending }: { product: CatalogProduct; onAdd: (quantity: number) => void; pending?: boolean }) {
  const price = toNumber(product.unitPrice);
  const moq = product.minimumOrderQuantity ?? 1;
  const unit = product.unitType ?? "order";
  const stock = typeof product.stock === 'number' ? product.stock : 100;
  const isOutOfStock = stock < moq && typeof product.stock === 'number';
  const [quantity, setQuantity] = useState(moq);
  const [imageFailed, setImageFailed] = useState(false);
  const unitLabel = unitLabels[unit] ?? unit;

  return (
    <Card className="overflow-hidden rounded-xl shadow-sm hover:shadow-premium sm:hover:-translate-y-1 transition-all duration-300 border-border flex flex-col justify-between">
      <div>
        <Link to={`/products/${product.slug}`} className="block relative">
          <div className="flex aspect-[4/3] items-center justify-center bg-muted text-lg font-semibold text-muted-foreground overflow-hidden">
            {product.image && !imageFailed ? <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" onError={() => setImageFailed(true)} /> : <ImageIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
          </div>
        </Link>
        <CardContent className="space-y-1.5 p-2 sm:p-3 text-xs sm:text-sm">
          <div className="min-h-[40px] sm:min-h-[48px]">
            <Link to={`/products/${product.slug}`} className="text-sm font-semibold hover:text-primary line-clamp-2">{product.name}</Link>
            <p className="mt-0.5 sm:mt-1 truncate text-[10px] sm:text-xs text-muted-foreground">{product.supplierName ?? "Shah's Halal Food"}</p>
          </div>
          <div className="grid gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-muted-foreground">
            <p className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-primary">{formatCurrency(price)}</span>
              {product.unitSize ? (
                <span className="text-muted-foreground">({product.unitSize})</span>
              ) : unitLabel && unitLabel !== "item" && unitLabel !== "order" ? (
                <span className="text-muted-foreground">/ {unitLabel}</span>
              ) : null}
            </p>
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Certified Halal</span>
              {product.rating && <div className="flex items-center gap-0.5 font-medium"><Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {product.rating}</div>}
            </div>
          </div>
        </CardContent>
      </div>
      <div className="p-2 sm:p-3 pt-0 space-y-2">
        <QuantitySelector
          quantity={quantity}
          setQuantity={setQuantity}
          moq={moq}
          stock={stock}
          isOutOfStock={isOutOfStock}
          unitLabel={unitLabel}
        />
        <div className="grid gap-2">
          <Button onClick={() => onAdd(quantity)} disabled={pending || isOutOfStock} size="sm" className="w-full h-8 sm:h-9 bg-primary hover:bg-primary/90 text-xs sm:text-sm">
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            {isOutOfStock ? "Out of Stock" : "Add To Cart"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
function OwnerProductCatalog() {
  const [search, setSearch] = useState("");
  const productsQuery = trpc.product.list.useQuery({ search: search || undefined, sortBy: "newest" }, { retry: false });
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const stats = useMemo(() => ({
    active: products.filter((product) => product.status === "active").length,
    categories: new Set(products.map((product) => product.categoryId)).size,
    avgPrice: products.length ? products.reduce((sum, product) => sum + toNumber(product.unitPrice), 0) / products.length : 0,
  }), [products]);

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Product Catalog</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage wholesale SKUs, categories, pricing, and availability.</p>
        </div>
        <Link to="/products/new"><Button><Plus className="mr-2 h-4 w-4" />Add Product</Button></Link>
      </section>
      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard title="Products" value={products.length} loading={productsQuery.isLoading} />
        <MetricCard title="Active SKUs" value={stats.active} loading={productsQuery.isLoading} />
        <MetricCard title="Categories" value={stats.categories} loading={productsQuery.isLoading} />
        <MetricCard title="Avg Selling Price" value={formatCurrency(stats.avgPrice)} loading={productsQuery.isLoading} />
      </section>
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search products, SKU, category, supplier..." />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {productsQuery.isLoading ? (
          Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-xl" />)
        ) : products.length ? (
          products.map((product) => (
            <Link key={product.id} to={`/products/${product.slug}`} className="grid gap-3 p-4 sm:p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all md:grid-cols-[1fr_160px_120px_100px] items-center">
              <div className="min-w-0">
                <p className="truncate font-semibold">{product.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{product.categoryName ?? "Uncategorized"} · {product.supplierName ?? "Supplier"}</p>
              </div>
              <p className="font-semibold text-primary">{formatCurrency(product.unitPrice)}</p>
              <Badge variant="secondary" className="w-fit capitalize">{product.status}</Badge>
              <p className="text-sm text-muted-foreground font-medium">MOQ {product.minimumOrderQuantity}</p>
            </Link>
          ))
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground bg-card">No products found.</div>
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
