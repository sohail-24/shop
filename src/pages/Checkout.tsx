import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useGuestCart } from "@/lib/guestCart";
import { getCheckoutPhone, setCheckoutPhone } from "@/lib/checkoutState";
import { citiesByState, indianStates } from "@/lib/freshflowData";
import { formatCurrency } from "@/lib/i18n";
import { isValidIndianMobileNumber } from "@/lib/utils";

import { PageHeader } from "@/components/freshflow/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Package, ShoppingCart, Truck, MapPin, Home, Briefcase } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const guestCart = useGuestCart();
  const isAuthenticated = !!user;

  const cartQuery = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const addressQuery = trpc.address.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);

  const createRazorpayOrder = trpc.order.createRazorpayOrder.useMutation({
    onError: (error) => toast.error(error.message || "Failed to initialize payment."),
  });

  const createOrder = trpc.order.create.useMutation({
    onSuccess: async (data) => {
      if (!isAuthenticated) {
        guestCart.clear();
        clearCheckoutPhone();
      }
      await Promise.all([
        utils.cart.list.invalidate(),
        utils.order.list.invalidate(),
        utils.order.recent.invalidate(),
        utils.order.stats.invalidate(),
        utils.inventory.list.invalidate(),
        utils.inventory.stats.invalidate(),
        utils.report.dashboardSummary.invalidate(),
      ]);
      navigate(`/orders/${data.orderId}`);
    },
    onError: (error) => toast.error(error.message || "Could not create order."),
  });
  const [form, setForm] = useState({
    contactName: "",
    mobileNumber: getCheckoutPhone(),
    state: "Telangana",
    city: "Hyderabad",
    address: "",
    addressLine2: "",
    landmark: "",
    areaLocality: "",
    slot: "",
    notes: "",
    confirmAddress: false,
    agreeTerms: false,
    paymentMethod: "cod" as "upi" | "cod",
  });

  useEffect(() => {
    const savedPhone = getCheckoutPhone();
    if (savedPhone) {
      setForm((prev) => (prev.mobileNumber ? prev : { ...prev, mobileNumber: savedPhone }));
    }
  }, []);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const authQuery = trpc.auth.me.useQuery(undefined, { retry: false });
  const hasAutoFilled = useRef(false);
  useEffect(() => {
    if (addressQuery.data && addressQuery.data.length > 0 && !hasAutoFilled.current) {
      const defaultAddr = addressQuery.data.find(a => a.isDefault) || addressQuery.data[0];
      setForm((prev) => ({
        ...prev,
        contactName: defaultAddr.fullName || "",
        mobileNumber: prev.mobileNumber || defaultAddr.mobileNumber || "",
        address: defaultAddr.addressLine1 || "",
        addressLine2: defaultAddr.addressLine2 || "",
        landmark: defaultAddr.landmark || "",
        areaLocality: defaultAddr.areaLocality || "",
        city: defaultAddr.city || "Hyderabad",
        state: defaultAddr.state || "Telangana",
      }));
      hasAutoFilled.current = true;
    }
  }, [addressQuery.data]);

  const cities = useMemo(() => citiesByState[form.state] ?? [], [form.state]);
  const items = isAuthenticated ? (cartQuery.data?.items ?? []) : guestCart.items;
  const subtotal = isAuthenticated ? (cartQuery.data?.total ?? 0) : guestCart.total;
  const quoteQuery = trpc.order.quote.useQuery(
    {
      shippingState: form.state,
      items: items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        selectedOption: it.selectedOption || undefined,
      })),
    },
    { enabled: items.length > 0 && !!form.state, retry: false },
  );
  const shippingAmount = quoteQuery.data?.shippingAmount ?? 0;
  const taxAmount = quoteQuery.data?.taxAmount ?? 0;
  const total = quoteQuery.data?.totalAmount ?? subtotal + shippingAmount + taxAmount;
  const deliveryUnavailable = quoteQuery.data ? !quoteQuery.data.deliveryAvailable : false;

  if (isAuthenticated && cartQuery.isLoading) {
    return <div className="py-16 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" /></div>;
  }


  function handleSelectAddress(addr: any) {
    setForm(prev => ({
      ...prev,
      contactName: addr.fullName,
      mobileNumber: addr.mobileNumber,
      address: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      landmark: addr.landmark || "",
      areaLocality: addr.areaLocality || "",
      city: addr.city,
      state: addr.state,
    }));
    setIsAddressModalOpen(false);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
        <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
        <Link to="/products"><Button>Browse Products</Button></Link>
      </div>
    );
  }

  if (isAuthenticated && !addressQuery.isLoading && addressQuery.data?.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
        <h2 className="mb-2 text-xl font-semibold">Address required</h2>
        <p className="mb-6 text-muted-foreground">Please complete your Address Book first to place an order.</p>
        <Link to="/profile"><Button>Add Delivery Address</Button></Link>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValidIndianMobileNumber(form.mobileNumber)) {
      toast.error("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    const trimmedAddress = form.address.trim();
    if (trimmedAddress.length < 10) {
      toast.error("Please enter your complete house/flat number and street address.");
      return;
    }

    const orderItemPayload = items.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      selectedOption: it.selectedOption || undefined,
      notes: it.notes || undefined,
    }));

    if (form.paymentMethod === "upi") {
      setIsPaymentInProgress(true);
      try {
        const razorpayOrder = await createRazorpayOrder.mutateAsync({
          shippingState: form.state,
          items: items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            selectedOption: it.selectedOption || undefined,
          })),
        });

        const scriptLoaded = await new Promise((resolve) => {
          if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
            resolve(true);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

        if (!scriptLoaded) {
          toast.error("Failed to load Razorpay checkout. Please check your connection.");
          setIsPaymentInProgress(false);
          return;
        }

        const options = {
          key: razorpayOrder.keyId || "rzp_test_invalid",
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Tex’s Chicken & Burgers",
          description: "Order Payment",
          order_id: razorpayOrder.id,
          prefill: {
            name: form.contactName,
            contact: form.mobileNumber,
            email: authQuery.data?.email || "",
          },
          theme: {
            color: "#059669",
          },
          handler: function (response: any) {
            createOrder.mutate({
              shippingContactName: form.contactName,
              shippingMobileNumber: form.mobileNumber,
              shippingAddressLine1: form.address,
              shippingAddressLine2: form.addressLine2 || undefined,
              shippingLandmark: form.landmark || undefined,
              shippingAreaLocality: form.areaLocality || undefined,
              shippingCity: form.city,
              shippingState: form.state,
              shippingCountry: "IND",
              shippingMethod: form.slot || undefined,
              buyerNotes: form.notes || undefined,
              paymentMethod: "upi",
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              items: orderItemPayload,
            }, {
              onSettled: () => setIsPaymentInProgress(false)
            });
          },
          modal: {
            ondismiss: function () {
              setIsPaymentInProgress(false);
              toast.error("Payment cancelled.");
            },
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.on('payment.failed', function (response: any) {
          setIsPaymentInProgress(false);
          toast.error(`Payment failed: ${response.error.description}`);
        });
        razorpayInstance.open();
      } catch (err) {
        setIsPaymentInProgress(false);
      }
    } else {
      createOrder.mutate({
        shippingContactName: form.contactName,
        shippingMobileNumber: form.mobileNumber,
        shippingAddressLine1: form.address,
        shippingAddressLine2: form.addressLine2 || undefined,
        shippingLandmark: form.landmark || undefined,
        shippingAreaLocality: form.areaLocality || undefined,
        shippingCity: form.city,
        shippingState: form.state,
        shippingCountry: "IND",
        shippingMethod: form.slot || undefined,
        buyerNotes: form.notes || undefined,
        paymentMethod: "cod",
        items: orderItemPayload,
      });
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader backTo="/info" backLabel="Back to Customer Info" title="Checkout" />
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base"><Truck className="h-4 w-4" />Shipping Information</CardTitle>
            {addressQuery.data && addressQuery.data.length > 0 && (
              <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Change Address</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select Address</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3 py-4">
                    {addressQuery.data.map(addr => (
                      <div key={addr.id} onClick={() => handleSelectAddress(addr)} className="cursor-pointer rounded-lg border p-3 hover:border-primary">
                        <div className="mb-1 flex items-center justify-between">
                          <div className="flex items-center gap-2 font-medium">
                            {addr.addressType === "home" ? <Home className="h-4 w-4 text-muted-foreground" /> : addr.addressType === "work" ? <Briefcase className="h-4 w-4 text-muted-foreground" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
                            {addr.fullName}
                          </div>
                          {addr.isDefault && <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">Default</span>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                          <br />
                          {addr.areaLocality ? `${addr.areaLocality}, ` : ""}{addr.city}, {addr.state} {addr.postalCode}
                          <br />
                          {addr.mobileNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Person Name</Label>
                <Input id="contactName" value={form.contactName} onChange={(event) => setForm({ ...form, contactName: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input
                  id="mobileNumber"
                  value={form.mobileNumber}
                  onChange={(event) => {
                    const val = event.target.value;
                    setForm({ ...form, mobileNumber: val });
                    setCheckoutPhone(val);
                  }}
                  required
                />
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>State *</Label>
                <Select value={form.state} onValueChange={(state) => setForm({ ...form, state, city: citiesByState[state]?.[0] ?? "" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{indianStates.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Select value={form.city} onValueChange={(city) => setForm({ ...form, city })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">House / Flat No. & Street Address *</Label>
              <Textarea id="address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input id="landmark" value={form.landmark} onChange={(event) => setForm({ ...form, landmark: event.target.value })} />
            </div>
            <Separator />
            <div className="space-y-3">
              <Label>Payment Method *</Label>
              <RadioGroup value={form.paymentMethod} onValueChange={(method: "upi" | "cod") => setForm({ ...form, paymentMethod: method })} className="grid gap-3 sm:grid-cols-2">
                <Label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer">
                  <RadioGroupItem value="upi" />
                  UPI
                </Label>
                <Label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer">
                  <RadioGroupItem value="cod" />
                  Cash on Delivery
                </Label>
              </RadioGroup>
            </div>
            <Separator />
            <div className="space-y-3">
              <Label>Delivery Slot (Optional)</Label>
              <RadioGroup value={form.slot} onValueChange={(slot) => setForm({ ...form, slot })} className="grid gap-3 sm:grid-cols-3">
                {["Morning", "Afternoon", "Evening"].map((slot) => (
                  <Label key={slot} className="flex items-center gap-2 rounded-lg border p-3">
                    <RadioGroupItem value={slot} />
                    {slot}
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea id="notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </div>
            <Separator />
            <Label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.confirmAddress} onCheckedChange={(checked) => setForm({ ...form, confirmAddress: checked === true })} />
              I confirm the delivery address is correct.
            </Label>
            <Label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.agreeTerms} onCheckedChange={(checked) => setForm({ ...form, agreeTerms: checked === true })} />
              I agree to the Terms & Conditions.
            </Label>
            <Button type="submit" className="h-11 w-full bg-emerald-600 hover:bg-emerald-700" disabled={createOrder.isPending || createRazorpayOrder.isPending || isPaymentInProgress || quoteQuery.isLoading || deliveryUnavailable || !form.confirmAddress || !form.agreeTerms}>
              {(createOrder.isPending || createRazorpayOrder.isPending || isPaymentInProgress) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {form.paymentMethod === "upi" ? "Pay Now" : "Place Order"}
            </Button>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-44 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted"><Package className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
            <SummaryRow label="Shipping" value={quoteQuery.isLoading ? "Calculating..." : formatCurrency(shippingAmount)} muted />
            <SummaryRow label="GST" value={quoteQuery.isLoading ? "Calculating..." : formatCurrency(taxAmount)} muted />
            {quoteQuery.data?.deliveryEstimate && (
              <SummaryRow label="Estimate" value={quoteQuery.data.deliveryEstimate.replaceAll("_", " ")} muted />
            )}
            {deliveryUnavailable && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                Delivery is not available for the selected state.
              </div>
            )}
            <Separator />
            <SummaryRow label="Total" value={formatCurrency(total)} strong />
          </CardContent>
        </Card>
      </form>
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
