import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate } from "@/lib/i18n";
import { getAppRole } from "@/lib/roles";
import { PageHeader } from "@/components/freshflow/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Building2, FileText, MapPin, Package, Truck, User } from "lucide-react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "ready_for_dispatch"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

type DeliveryEstimate =
  | "same_day"
  | "next_day"
  | "within_2_days"
  | "within_3_5_days";

type OrderItemSnapshot = {
  id: number;
  productName: string;
  quantity: number;
  unitType: string;
  unitPrice: unknown;
  totalPrice: unknown;
};

type OrderDetailData = {
  id: number;
  orderNumber: string;
  buyerName: string | null;
  buyerPhone: string | null;
  buyerAddressLine1: string | null;
  buyerAddressLine2: string | null;
  buyerCity: string | null;
  buyerState: string | null;
  buyerPostalCode: string | null;
  buyerCountry: string | null;
  supplierName: string | null;
  supplierPhone: string | null;
  supplierEmail?: string | null;
  supplierAddressLine1: string | null;
  supplierAddressLine2: string | null;
  supplierCity: string | null;
  supplierState: string | null;
  supplierPostalCode: string | null;
  supplierCountry: string | null;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  deliveryEstimate: DeliveryEstimate | null;
  orderedAt: Date;
  subtotal: unknown;
  taxAmount: unknown;
  shippingAmount: unknown;
  totalAmount: unknown;
  shippingContactName: string | null;
  shippingMobileNumber: string | null;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingLandmark: string | null;
  shippingAreaLocality: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  buyerNotes: string | null;
  items: OrderItemSnapshot[];
};

const timeline: Array<{ status: OrderStatus; label: string }> = [
  { status: "pending", label: "Order Created" },
  { status: "confirmed", label: "Confirmed" },
  { status: "packed", label: "Packed" },
  { status: "ready_for_dispatch", label: "Ready for Dispatch" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  ready_for_dispatch: "Ready for Dispatch",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const deliveryLabels: Record<DeliveryEstimate, string> = {
  same_day: "Same Day",
  next_day: "Next Day",
  within_2_days: "Within 2 Days",
  within_3_5_days: "Within 3-5 Days",
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const ownerMode = getAppRole(user) !== "buyer";
  const orderId = Number(id ?? 0);
  const orderQuery = trpc.order.detail.useQuery(
    { orderId },
    { enabled: orderId > 0, retry: false, refetchInterval: ownerMode ? 10000 : false },
  );
  const order = orderQuery.data as OrderDetailData | undefined;

  const statusMutation = trpc.order.status.useMutation({
    onSuccess: async () => {
      await utils.order.detail.invalidate({ orderId });
      await utils.order.list.invalidate();
      await utils.order.recent.invalidate();
      await utils.order.stats.invalidate();
      await utils.inventory.list.invalidate();
      await utils.inventory.stats.invalidate();
      await utils.report.dashboardSummary.invalidate();
      toast.success("Order status updated.");
    },
    onError: (error) => toast.error(error.message),
  });
  const deliveryMutation = trpc.order.deliveryEstimate.useMutation({
    onSuccess: async () => {
      await utils.order.detail.invalidate({ orderId });
      await utils.order.list.invalidate();
      await utils.order.recent.invalidate();
      await utils.report.dashboardSummary.invalidate();
      toast.success("Delivery estimate updated.");
    },
    onError: (error) => toast.error(error.message),
  });
  const cancelMutation = trpc.order.cancel.useMutation({
    onSuccess: async () => {
      await utils.order.detail.invalidate({ orderId });
      await utils.order.list.invalidate();
      await utils.order.recent.invalidate();
      await utils.order.stats.invalidate();
      await utils.inventory.list.invalidate();
      await utils.inventory.stats.invalidate();
      await utils.report.dashboardSummary.invalidate();
      toast.success("Order cancelled.");
    },
    onError: (error) => toast.error(error.message),
  });

  if (orderQuery.isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (!order || orderQuery.isError) {
    return (
      <div className="mx-auto max-w-3xl py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load order</AlertTitle>
          <AlertDescription>{orderQuery.error?.message ?? "Order not found."}</AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" onClick={() => navigate(user ? "/orders" : "/")}>
          {user ? "Back to Orders" : "Back to Home"}
        </Button>
      </div>
    );
  }

  const editingDisabled = order.status === "delivered" || order.status === "cancelled";

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5">
      <PageHeader
        backTo={user ? "/orders" : "/"}
        backLabel={user ? "Back to Orders" : "Back to Home"}
        title={`Order #${order.orderNumber}`}
        actions={<OrderStatusBadge status={order.status} />}
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {ownerMode ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                {ownerMode ? "Buyer Information" : "Business Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              {ownerMode ? (
                <>
                  <ReadOnly label="Buyer" value={order.buyerName} />
                  <ReadOnly label="Phone" value={order.buyerPhone} />
                  <ReadOnly label="Buyer Address" value={formatCompanyAddress(order, "buyer")} />
                  <ReadOnly label="Delivery Address" value={formatAddress(order)} />
                </>
              ) : (
                <>
                  <ReadOnly label="Business Name" value={order.supplierName} />
                  <ReadOnly label="Phone / Contact" value={order.supplierPhone} />
                  {order.supplierEmail && <ReadOnly label="Email" value={order.supplierEmail} />}
                  <ReadOnly
                    label="Address"
                    value={[order.supplierAddressLine1, order.supplierAddressLine2].filter(Boolean).join(", ") || null}
                  />
                  {order.supplierCity && <ReadOnly label="City" value={order.supplierCity} />}
                  {order.supplierState && <ReadOnly label="State" value={order.supplierState} />}
                  {order.supplierPostalCode && <ReadOnly label="PIN / Postal Code" value={order.supplierPostalCode} />}
                  {order.supplierCountry && <ReadOnly label="Country" value={order.supplierCountry} />}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Package className="h-4 w-4" />Product Snapshots</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unitType}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="grid gap-3 p-3 md:hidden">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity} {item.unitType}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-4 w-4" />Delivery Information</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <SummaryRow label="Delivery Estimate" value={formatDelivery(order.deliveryEstimate)} />
              <SummaryRow label="Delivery Address" value={formatAddress(order)} />
              {order.buyerNotes && <SummaryRow label="Customer Notes" value={order.buyerNotes} />}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4" />Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <SummaryRow label="Order Date" value={formatDate(order.orderedAt)} />
              <SummaryRow label="Payment Method" value={order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'upi' ? 'UPI' : order.paymentMethod} />
              <SummaryRow label="Payment Status" value={order.paymentStatus} />
              {ownerMode ? (
                <>
                  <Control label="Order Status">
                    <Select
                      value={order.status}
                      disabled={editingDisabled || statusMutation.isPending}
                      onValueChange={(value) => statusMutation.mutate({ orderId, status: value as OrderStatus })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Control>
                  <Control label="Delivery Estimate">
                    <Select
                      value={order.deliveryEstimate ?? undefined}
                      disabled={editingDisabled || deliveryMutation.isPending}
                      onValueChange={(value) => deliveryMutation.mutate({ orderId, deliveryEstimate: value as DeliveryEstimate })}
                    >
                      <SelectTrigger><SelectValue placeholder="Set delivery estimate" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(deliveryLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Control>
                </>
              ) : (
                <>
                  <SummaryRow label="Order Status" value={statusLabels[order.status]} />
                  <SummaryRow label="Delivery Estimate" value={formatDelivery(order.deliveryEstimate)} />
                </>
              )}
              <Separator />
              <SummaryRow label="Subtotal" value={formatCurrency(order.subtotal)} />
              <SummaryRow label="GST" value={formatCurrency(order.taxAmount)} />
              <SummaryRow label="Shipping" value={formatCurrency(order.shippingAmount)} />
              <Separator />
              <SummaryRow label="Grand Total" value={formatCurrency(order.totalAmount)} strong />
              {ownerMode && order.status === "pending" && (
                <CancelOrderButton loading={cancelMutation.isPending} onCancel={() => cancelMutation.mutate({ orderId })} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Truck className="h-4 w-4" />Timeline</CardTitle></CardHeader>
            <CardContent>
              <OrderTimeline status={order.status} />
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function OrderTimeline({ status }: { status: OrderStatus }) {
  const activeIndex = timeline.findIndex((step) => step.status === status);
  return (
    <div className="space-y-3">
      {status === "cancelled" && <OrderStatusBadge status="cancelled" />}
      {timeline.map((step, index) => {
        const complete = status !== "cancelled" && activeIndex >= index;
        return (
          <div key={step.status} className="flex items-center gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${complete ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
              {index + 1}
            </div>
            <span className={complete ? "font-medium" : "text-muted-foreground"}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function CancelOrderButton({ loading, onCancel }: { loading: boolean; onCancel: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full" disabled={loading}>Cancel Order</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
          <AlertDialogDescription>
            Cancelled orders remain visible in customer history, reporting, and auditing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Order</AlertDialogCancel>
          <AlertDialogAction onClick={onCancel}>Cancel Order</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={status === "cancelled" ? "destructive" : status === "delivered" ? "default" : "secondary"} className="rounded-md">
      {statusLabels[status]}
    </Badge>
  );
}

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 text-sm ${strong ? "text-base font-semibold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value || "Not set"}</p>
    </div>
  );
}

function formatDelivery(value: DeliveryEstimate | null) {
  return value ? deliveryLabels[value] : "Not set";
}

function formatAddress(order: Partial<OrderDetailData>) {
  return [
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    order.shippingAreaLocality,
    order.shippingCity,
    order.shippingState,
    order.shippingPostalCode,
    order.shippingCountry,
  ].filter(Boolean).join(", ") || "Not set";
}

function formatCompanyAddress(order: OrderDetailData, party: "buyer" | "supplier") {
  const parts = party === "buyer"
    ? [
        order.buyerAddressLine1,
        order.buyerAddressLine2,
        order.buyerCity,
        order.buyerState,
        order.buyerPostalCode,
        order.buyerCountry,
      ]
    : [
        order.supplierAddressLine1,
        order.supplierAddressLine2,
        order.supplierCity,
        order.supplierState,
        order.supplierPostalCode,
        order.supplierCountry,
      ];
  return parts.filter(Boolean).join(", ") || "Not set";
}

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5">
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-[520px]" />
        <Skeleton className="h-[520px]" />
      </div>
    </div>
  );
}
