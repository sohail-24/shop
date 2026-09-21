import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useGuestCart } from "@/lib/guestCart";
import { formatCurrency } from "@/lib/i18n";
import { PageHeader } from "@/components/freshflow/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Minus, Package, Plus, ShoppingCart, Trash2 } from "lucide-react";

export default function Cart() {
  const { user } = useAuth();
  const guestCart = useGuestCart();
  const isAuthenticated = !!user;
  const cartQuery = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const utils = trpc.useUtils();
  const updateMutation = trpc.cart.update.useMutation({ onSuccess: () => utils.cart.list.invalidate() });
  const removeMutation = trpc.cart.remove.useMutation({ onSuccess: () => utils.cart.list.invalidate() });
  const clearMutation = trpc.cart.clear.useMutation({ onSuccess: () => utils.cart.list.invalidate() });
  const items = isAuthenticated ? (cartQuery.data?.items ?? []) : guestCart.items;
  const subtotal = isAuthenticated ? (cartQuery.data?.total ?? 0) : guestCart.total;
  const isLoading = isAuthenticated && cartQuery.isLoading;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        backTo="/"
        backLabel="Back to Home"
        title="Cart"
        description="Review items before checkout."
        actions={items.length > 0 ? (
          <Button variant="outline" size="sm" onClick={() => (isAuthenticated ? clearMutation.mutate() : guestCart.clear())}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        ) : null}
      />

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-24" />)}</div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">Your cart is empty</h3>
            <p className="mb-6 mt-1 text-sm text-muted-foreground">Browse Products to add items.</p>
            <Link to="/products"><Button>Browse Products</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            {items.map((item) => {
              const unitPrice = Number(item.unitPrice ?? 0);
              const itemTotal = unitPrice * item.quantity;
              return (
                <Card key={item.id}>
                  <CardContent className="flex gap-4 p-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {item.productImage ? <img src={item.productImage} alt={item.productName ?? ""} className="h-full w-full object-cover" /> : <Package className="h-8 w-8 text-muted-foreground/40" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link to={`/products/${item.productSlug}`} className="font-medium hover:text-primary">{item.productName}</Link>
                          {item.selectedOption ? (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200/80">
                                {item.selectedOption}
                              </span>
                              <span className="text-xs text-muted-foreground font-medium">
                                ({formatCurrency(unitPrice)} each)
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-0.5">{item.productUnitSize}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => (isAuthenticated ? removeMutation.mutate({ cartItemId: item.id }) : guestCart.remove(item.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => (isAuthenticated ? updateMutation.mutate({ cartItemId: item.id, quantity: Math.max(1, item.quantity - 1) }) : guestCart.update(item.id, Math.max(1, item.quantity - 1)))}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => (isAuthenticated ? updateMutation.mutate({ cartItemId: item.id, quantity: item.quantity + 1 }) : guestCart.update(item.id, item.quantity + 1))}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-semibold">{formatCurrency(itemTotal)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="h-fit">
            <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
              <Separator />
              <SummaryRow label="Total" value={formatCurrency(subtotal)} strong />
              <Link to="/info"><Button className="h-11 w-full bg-emerald-600 hover:bg-emerald-700">Checkout<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/"><Button variant="outline" className="w-full">Continue Shopping</Button></Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, muted, strong }: { label: string; value: string; muted?: boolean; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 text-sm ${strong ? "text-base font-semibold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "text-muted-foreground" : ""}>{value}</span>
    </div>
  );
}
