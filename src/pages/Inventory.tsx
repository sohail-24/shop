import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate, formatNumber } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  ClipboardList,
  History,
  MapPin,
  Package,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  TrendingDown,
  Warehouse,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusConfig: Record<string, { label: string; className: string }> = {
  in_stock: {
    label: "In Stock",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200",
  },
  low_stock: {
    label: "Low Stock",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
  },
  out_of_stock: {
    label: "Out of Stock",
    className: "bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-200",
  },
};

type InventoryStatusFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";

type InventoryItem = {
  unitPrice?: string | null;
  compareAtPrice?: string | null;
  tags?: string | null;
  id: number;
  productId: number;
  productName: string | null;
  productImage: string | null;
  supplierName: string | null;
  warehouseLocation: string | null;
  batchNumber: string | null;
  receivedDate: Date | null;
  lastCountedAt: Date | null;
  updatedAt: Date;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderLevel: number;
  reorderQuantity: number;
  status: string;
  isActive?: boolean;
  notes: string | null;
};

type InventoryForm = {
  isActive: boolean;
  sellingPrice: string;
  purchasePrice: string;
  wholesalePrice: string;
  supplierId: string;
  quantityOnHand: string;
  quantityReserved: string;
  quantityAvailable: string;
  reorderLevel: string;
  reorderQuantity: string;
  warehouseLocation: string;
  batchNumber: string;
  notes: string;
};

type ActionForm = {
  quantity: string;
  warehouseLocation: string;
  notes: string;
};

type MarketplaceForm = {
  marketplaceVisible: boolean;
  showInFreshDeals: boolean;
  isFeatured: boolean;
  displayPriority: string;
};

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InventoryStatusFilter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<InventoryForm>(() => emptyInventoryForm());
  const [marketplaceForm, setMarketplaceForm] = useState<MarketplaceForm>(() => emptyMarketplaceForm());
  const [actionForm, setActionForm] = useState<ActionForm>({
    quantity: "1",
    warehouseLocation: "",
    notes: "",
  });
  const utils = trpc.useUtils();
  const inventoryQuery = trpc.inventory.list.useQuery(
    { status: status !== "all" ? status : undefined },
    { retry: false },
  );
  const statsQuery = trpc.inventory.stats.useQuery(undefined, { retry: false });
  const companiesQuery = trpc.company.list.useQuery(undefined, { retry: false });

  const afterInventoryChange = async (message: string) => {
    await Promise.all([
      utils.inventory.list.invalidate(),
      utils.inventory.stats.invalidate(),
      utils.product.list.invalidate(),
      utils.product.freshDeals.invalidate(),
      utils.product.featured.invalidate(),
      utils.product.marketplaceById.invalidate(),
      utils.product.stats.invalidate(),
      utils.order.list.invalidate(),
      utils.order.recent.invalidate(),
      utils.report.dashboardSummary.invalidate(),
    ]);
    toast.success(message);
  };

  const updateInventory = trpc.inventory.update.useMutation({
    onSuccess: () => afterInventoryChange("Inventory saved."),
    onError: (error) => toast.error(error.message || "Could not save inventory."),
  });
  const stockIn = trpc.inventory.stockIn.useMutation({
    onSuccess: () => afterInventoryChange("Stock received."),
    onError: (error) => toast.error(error.message || "Could not receive stock."),
  });
  const stockOut = trpc.inventory.stockOut.useMutation({
    onSuccess: () => afterInventoryChange("Stock removed."),
    onError: (error) => toast.error(error.message || "Could not remove stock."),
  });
  const adjustStock = trpc.inventory.adjustStock.useMutation({
    onSuccess: () => afterInventoryChange("Stock adjusted."),
    onError: (error) => toast.error(error.message || "Could not adjust stock."),
  });
  const transferStock = trpc.inventory.transfer.useMutation({
    onSuccess: () => afterInventoryChange("Stock transferred."),
    onError: (error) => toast.error(error.message || "Could not transfer stock."),
  });
  const updateMarketplace = trpc.product.updateMarketplace.useMutation({
    onSuccess: () => afterInventoryChange("Marketplace settings saved."),
    onError: (error) => toast.error(error.message || "Could not save marketplace settings."),
  });
  const deleteInventory = trpc.inventory.delete.useMutation({
    onSuccess: async () => {
      setSelectedId(null);
      await afterInventoryChange("Inventory record deleted successfully.");
    },
    onError: (error) => toast.error(error.message || "Could not delete inventory."),
  });

  const inventory = useMemo(() => inventoryQuery.data ?? [], [inventoryQuery.data]);
  const selected = inventory.find((item) => item.id === selectedId) ?? null;
  const marketplaceQuery = trpc.product.marketplaceById.useQuery(
    { id: selected?.productId ?? 0 },
    { enabled: !!selected?.productId, retry: false },
  );
  const suppliers = (companiesQuery.data ?? []).filter((company) => company.type === "supplier" || company.type === "both");
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return inventory;
    return inventory.filter((item) =>
      [item.productName, item.supplierName, item.warehouseLocation, item.batchNumber]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [inventory, search]);

  const lowStockItems = filtered.filter((item) => item.status === "low_stock" || item.status === "out_of_stock");
  const totalAvailable = filtered.reduce((total, item) => total + (item.quantityAvailable ?? 0), 0);
  const reserved = filtered.reduce((total, item) => total + (item.quantityReserved ?? 0), 0);

  useEffect(() => {
    if (!selected) return;

    let tagsObj: Record<string, unknown> = {};
    try {
      if (selected.tags && typeof selected.tags === 'string' && selected.tags.startsWith('{')) {
        tagsObj = JSON.parse(selected.tags) as Record<string, unknown>;
      }
    } catch {
      // ignore
    }

    setForm({
      isActive: selected.isActive ?? true,
      sellingPrice: selected.unitPrice ? String(selected.unitPrice) : "",
      purchasePrice: selected.compareAtPrice ? String(selected.compareAtPrice) : "",
      wholesalePrice: tagsObj.wholesalePrice ? String(tagsObj.wholesalePrice) : "",
      supplierId: String(selected.supplierId),
      quantityOnHand: String(selected.quantityOnHand),
      quantityReserved: String(selected.quantityReserved),
      quantityAvailable: String(selected.quantityAvailable),
      reorderLevel: String(selected.reorderLevel),
      reorderQuantity: String(selected.reorderQuantity),
      warehouseLocation: selected.warehouseLocation ?? "",
      batchNumber: selected.batchNumber ?? "",
      notes: selected.notes ?? "",
    });
    setActionForm({
      quantity: "1",
      warehouseLocation: selected.warehouseLocation ?? "",
      notes: "",
    });
  }, [selected]);

  useEffect(() => {
    setMarketplaceForm(emptyMarketplaceForm());
  }, [selected?.productId]);

  useEffect(() => {
    const marketplace = marketplaceQuery.data;
    if (!marketplace) return;
    setMarketplaceForm({
      marketplaceVisible: marketplace.marketplaceVisible,
      showInFreshDeals: marketplace.showInFreshDeals,
      isFeatured: marketplace.isFeatured,
      displayPriority: marketplace.displayPriority === null ? "" : String(marketplace.displayPriority),
    });
  }, [marketplaceQuery.data]);

  function saveSelectedInventory() {
    if (!selected) return;
    updateInventory.mutate({
      id: selected.id,
      data: {
        isActive: form.isActive,
        sellingPrice: form.sellingPrice ? Number(form.sellingPrice) : undefined,
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined,
        wholesalePrice: form.wholesalePrice ? Number(form.wholesalePrice) : undefined,
        supplierId: Number(form.supplierId),
        quantityOnHand: wholeNumber(form.quantityOnHand),
        quantityReserved: wholeNumber(form.quantityReserved),
        quantityAvailable: wholeNumber(form.quantityAvailable),
        reorderLevel: wholeNumber(form.reorderLevel),
        reorderQuantity: wholeNumber(form.reorderQuantity),
        warehouseLocation: form.warehouseLocation,
        batchNumber: form.batchNumber,
        notes: form.notes,
      },
    });
  }

  function runStockAction(action: "in" | "out" | "adjust-add" | "adjust-remove" | "transfer") {
    if (!selected) return;
    const quantity = Math.max(1, wholeNumber(actionForm.quantity));
    if (action === "in") {
      stockIn.mutate({
        id: selected.id,
        quantity,
        warehouseLocation: actionForm.warehouseLocation || undefined,
        notes: actionForm.notes || undefined,
      });
    }
    if (action === "out") {
      stockOut.mutate({ id: selected.id, quantity, notes: actionForm.notes || undefined });
    }
    if (action === "adjust-add" || action === "adjust-remove") {
      adjustStock.mutate({
        id: selected.id,
        quantity,
        adjustmentType: action === "adjust-add" ? "add" : "remove",
        reason: actionForm.notes || undefined,
      });
    }
    if (action === "transfer") {
      if (!actionForm.warehouseLocation.trim()) {
        toast.error("Enter the destination warehouse.");
        return;
      }
      transferStock.mutate({
        id: selected.id,
        warehouseLocation: actionForm.warehouseLocation,
        notes: actionForm.notes || undefined,
      });
    }
  }

  function saveMarketplaceSettings() {
    if (!selected) return;
    const priority = marketplaceForm.displayPriority.trim();
    updateMarketplace.mutate({
      id: selected.productId,
      marketplaceVisible: marketplaceForm.marketplaceVisible,
      showInFreshDeals: marketplaceForm.showInFreshDeals,
      isFeatured: marketplaceForm.isFeatured,
      displayPriority: priority ? wholeNumber(priority) : null,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track availability, low-stock risk, warehouse placement, and stock movements.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Stock Item
            </Button>
          </Link>
          <Button variant="outline">
            <ClipboardList className="mr-2 h-4 w-4" />
            Cycle Count
          </Button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <InventoryMetric label="Inventory Value" value={formatCurrency(statsQuery.data?.totalValue ?? 0)} loading={statsQuery.isLoading} icon={Warehouse} />
        <InventoryMetric label="Tracked Items" value={formatNumber(statsQuery.data?.totalItems ?? 0)} loading={statsQuery.isLoading} icon={Package} />
        <InventoryMetric label="Available Units" value={formatNumber(totalAvailable)} loading={inventoryQuery.isLoading} icon={ArrowUpRight} />
        <InventoryMetric label="Reserved Units" value={formatNumber(reserved)} loading={inventoryQuery.isLoading} icon={ArrowDownLeft} />
        <InventoryMetric label="Low Stock" value={formatNumber(statsQuery.data?.lowStock ?? 0)} loading={statsQuery.isLoading} icon={AlertTriangle} />
      </section>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, warehouse, batch, supplier..."
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value as InventoryStatusFilter)}>
            <SelectTrigger className="w-full lg:w-[190px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="gap-4 min-w-0 max-w-full">
        <TabsList className="w-full justify-start overflow-x-auto rounded-lg border bg-card p-1 sm:w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stock-in">Stock In</TabsTrigger>
          <TabsTrigger value="stock-out">Stock Out</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="min-w-0 max-w-full">
          <div className="grid gap-4 min-w-0 max-w-full xl:grid-cols-[minmax(0,1fr)_380px]">
            <InventoryTable
              items={filtered}
              loading={inventoryQuery.isLoading}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            <InventoryManager
              item={selected}
              form={form}
              actionForm={actionForm}
              marketplaceForm={marketplaceForm}
              suppliers={suppliers}
              saving={updateInventory.isPending}
              marketplaceSaving={updateMarketplace.isPending}
              marketplaceLoading={marketplaceQuery.isLoading}
              actionPending={stockIn.isPending || stockOut.isPending || adjustStock.isPending || transferStock.isPending}
              deleting={deleteInventory.isPending}
              onFormChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
              onActionChange={(field, value) => setActionForm((current) => ({ ...current, [field]: value }))}
              onMarketplaceChange={(field, value) => setMarketplaceForm((current) => ({ ...current, [field]: value }))}
              onSave={saveSelectedInventory}
              onSaveMarketplace={saveMarketplaceSettings}
              onAction={runStockAction}
              onDelete={() => selected && deleteInventory.mutate({ id: selected.id })}
            />
          </div>
        </TabsContent>
        <TabsContent value="stock-in">
          <MovementPanel
            icon={ArrowDownLeft}
            title="Stock In"
            description="Recently received batches and supplier replenishments."
            items={filtered.filter((item) => item.receivedDate || item.quantityOnHand > 0)}
            loading={inventoryQuery.isLoading}
            mode="in"
          />
        </TabsContent>
        <TabsContent value="stock-out">
          <MovementPanel
            icon={ArrowUpRight}
            title="Stock Out"
            description="Reserved and committed stock for active orders."
            items={filtered.filter((item) => item.quantityReserved > 0)}
            loading={inventoryQuery.isLoading}
            mode="out"
          />
        </TabsContent>
        <TabsContent value="adjustments">
          <MovementPanel
            icon={SlidersHorizontal}
            title="Adjustments"
            description="Stock records that need count review or reorder planning."
            items={filtered.filter((item) => item.quantityOnHand <= item.reorderLevel || item.lastCountedAt)}
            loading={inventoryQuery.isLoading}
            mode="adjust"
          />
        </TabsContent>
        <TabsContent value="transfers">
          <MovementPanel
            icon={ArrowRightLeft}
            title="Transfers"
            description="Warehouse placement and batch movement overview."
            items={filtered.filter((item) => item.warehouseLocation)}
            loading={inventoryQuery.isLoading}
            mode="transfer"
          />
        </TabsContent>
        <TabsContent value="history">
          <MovementPanel
            icon={History}
            title="Inventory History"
            description="Latest count, receipt, and update events."
            items={filtered}
            loading={inventoryQuery.isLoading}
            mode="history"
          />
        </TabsContent>
        <TabsContent value="low-stock" className="min-w-0 max-w-full">
          <InventoryTable items={lowStockItems} loading={inventoryQuery.isLoading} emptyTitle="No low-stock items" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InventoryMetric({
  label,
  value,
  loading,
  icon: Icon,
}: {
  label: string;
  value: string;
  loading: boolean;
  icon: typeof Package;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          {loading ? <Skeleton className="mt-3 h-7 w-24" /> : <p className="mt-2 truncate text-2xl font-semibold">{value}</p>}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function InventoryTable({
  items,
  loading,
  selectedId,
  onSelect,
  emptyTitle = "No inventory records found",
}: {
  items: InventoryItem[];
  loading: boolean;
  selectedId?: number | null;
  onSelect?: (id: number) => void;
  emptyTitle?: string;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card>
        <CardContent className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
          <Warehouse className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="font-semibold">{emptyTitle}</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Inventory records will appear here once products and warehouse stock are available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0 max-w-full overflow-hidden">
      <CardContent className="min-w-0 max-w-full overflow-x-auto p-0 [-webkit-overflow-scrolling:touch]">
        <Table className="min-w-[850px]">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Product</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>On Hand</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Reorder</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4">Last Count</TableHead>
              {onSelect && <TableHead className="pr-4 text-right">Manage</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className={selectedId === item.id ? "bg-muted/60" : ""}>
                <TableCell className="pl-4">
                  <div className="flex min-w-[240px] items-center gap-3">
                    <InventoryImage src={item.productImage} alt={item.productName ?? "Product"} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.productName ?? `Product #${item.productId}`}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.supplierName ?? "Unknown supplier"}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {item.warehouseLocation ?? "Unassigned"}
                  </span>
                </TableCell>
                <TableCell>{formatNumber(item.quantityOnHand)}</TableCell>
                <TableCell>{formatNumber(item.quantityReserved)}</TableCell>
                <TableCell className="font-medium">{formatNumber(item.quantityAvailable)}</TableCell>
                <TableCell>{formatNumber(item.reorderLevel)}</TableCell>
                <TableCell>
                  <InventoryStatus status={item.status} isActive={item.isActive} />
                </TableCell>
                <TableCell className="pr-4">{formatDate(item.lastCountedAt ?? item.updatedAt)}</TableCell>
                {onSelect && (
                  <TableCell className="pr-4 text-right">
                    <Button type="button" variant={selectedId === item.id ? "default" : "outline"} size="sm" onClick={() => onSelect(item.id)}>
                      Manage
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function InventoryManager({
  item,
  form,
  actionForm,
  marketplaceForm,
  suppliers,
  saving,
  marketplaceSaving,
  marketplaceLoading,
  actionPending,
  deleting,
  onFormChange,
  onActionChange,
  onMarketplaceChange,
  onSave,
  onSaveMarketplace,
  onAction,
  onDelete,
}: {
  item: InventoryItem | null;
  form: InventoryForm;
  actionForm: ActionForm;
  marketplaceForm: MarketplaceForm;
  suppliers: Array<{ id: number; name: string }>;
  saving: boolean;
  marketplaceSaving: boolean;
  marketplaceLoading: boolean;
  actionPending: boolean;
  deleting: boolean;
  onFormChange: (field: keyof InventoryForm, value: any) => void;
  onActionChange: (field: keyof ActionForm, value: string) => void;
  onMarketplaceChange: (field: keyof MarketplaceForm, value: any) => void;
  onSave: () => void;
  onSaveMarketplace: () => void;
  onAction: (action: "in" | "out" | "adjust-add" | "adjust-remove" | "transfer") => void;
  onDelete: () => void;
}) {
  if (!item) {
    return (
      <Card className="min-w-0 max-w-full">
        <CardContent className="flex min-h-[420px] flex-col items-center justify-center p-6 text-center">
          <Warehouse className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <h3 className="font-semibold">Select inventory</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose an item to edit stock, warehouse, supplier, batch, and reorder settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0 max-w-full">
      <CardHeader>
        <CardTitle className="text-base">Manage {item.productName ?? `Product #${item.productId}`}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Available stock is recalculated from on-hand and reserved quantities when saved.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center space-x-2">
          <Switch checked={form.isActive} onCheckedChange={(checked: boolean) => onFormChange("isActive", checked)} id="is-active" />
          <Label htmlFor="is-active">Active Inventory</Label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <InventoryField label="On Hand">
            <Input type="number" min="0" value={form.quantityOnHand} onChange={(event) => onFormChange("quantityOnHand", event.target.value)} />
          </InventoryField>
          <InventoryField label="Available">
            <Input type="number" min="0" value={form.quantityAvailable} onChange={(event) => onFormChange("quantityAvailable", event.target.value)} />
          </InventoryField>
          <InventoryField label="Reserved">
            <Input type="number" min="0" value={form.quantityReserved} onChange={(event) => onFormChange("quantityReserved", event.target.value)} />
          </InventoryField>
          <InventoryField label="Reorder Level">
            <Input type="number" min="0" value={form.reorderLevel} onChange={(event) => onFormChange("reorderLevel", event.target.value)} />
          </InventoryField>
          <InventoryField label="Reorder Qty">
            <Input type="number" min="0" value={form.reorderQuantity} onChange={(event) => onFormChange("reorderQuantity", event.target.value)} />
          </InventoryField>
          <InventoryField label="Selling Price">
            <Input type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(event) => onFormChange("sellingPrice", event.target.value)} />
          </InventoryField>
          <InventoryField label="Purchase Price">
            <Input type="number" min="0" step="0.01" value={form.purchasePrice} onChange={(event) => onFormChange("purchasePrice", event.target.value)} />
          </InventoryField>
          <InventoryField label="Wholesale Price">
            <Input type="number" min="0" step="0.01" value={form.wholesalePrice} onChange={(event) => onFormChange("wholesalePrice", event.target.value)} />
          </InventoryField>
          <InventoryField label="Supplier">
            <Select value={form.supplierId} onValueChange={(value) => onFormChange("supplierId", value)}>
              <SelectTrigger><SelectValue placeholder="Supplier" /></SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={String(supplier.id)}>{supplier.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </InventoryField>
          <InventoryField label="Warehouse">
            <Input value={form.warehouseLocation} onChange={(event) => onFormChange("warehouseLocation", event.target.value)} />
          </InventoryField>
          <InventoryField label="Batch">
            <Input value={form.batchNumber} onChange={(event) => onFormChange("batchNumber", event.target.value)} />
          </InventoryField>
        </div>
        <InventoryField label="Notes">
          <Textarea value={form.notes} onChange={(event) => onFormChange("notes", event.target.value)} />
        </InventoryField>
        <Button className="w-full" onClick={onSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Inventory Changes"}
        </Button>

        <div className="rounded-lg border p-3">
          <h4 className="text-sm font-semibold">Marketplace</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Buyer presentation settings are stored with this product. Inventory availability is managed separately.
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="marketplace-visible">Marketplace Visibility</Label>
                <p className="text-xs text-muted-foreground">
                  {marketplaceForm.marketplaceVisible
                    ? "Visible to buyers when inventory is active."
                    : "Hidden from every buyer marketplace surface."}
                </p>
              </div>
              <Switch id="marketplace-visible" checked={marketplaceForm.marketplaceVisible} disabled={marketplaceLoading} onCheckedChange={(checked) => onMarketplaceChange("marketplaceVisible", checked)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="fresh-deals">Show In Fresh Deals</Label>
                <p className="text-xs text-muted-foreground">Adds this product to Today&apos;s Fresh Deals.</p>
              </div>
              <Switch id="fresh-deals" checked={marketplaceForm.showInFreshDeals} disabled={marketplaceLoading} onCheckedChange={(checked) => onMarketplaceChange("showInFreshDeals", checked)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="featured-product">Featured Product</Label>
                <p className="text-xs text-muted-foreground">Used by the buyer Featured Products section.</p>
              </div>
              <Switch id="featured-product" checked={marketplaceForm.isFeatured} disabled={marketplaceLoading} onCheckedChange={(checked) => onMarketplaceChange("isFeatured", checked)} />
            </div>
            <InventoryField label="Display Priority">
              <Input type="number" min="0" placeholder="No priority" value={marketplaceForm.displayPriority} disabled={marketplaceLoading} onChange={(event) => onMarketplaceChange("displayPriority", event.target.value)} />
            </InventoryField>
            <p className="text-xs text-muted-foreground">Lower numbers appear first. Leave empty to keep the current order.</p>
            <Button className="w-full" variant="outline" onClick={onSaveMarketplace} disabled={marketplaceLoading || marketplaceSaving}>
              <Save className="mr-2 h-4 w-4" />
              {marketplaceLoading ? "Loading..." : marketplaceSaving ? "Saving..." : "Save Marketplace Settings"}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <h4 className="text-sm font-semibold">Stock Actions</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InventoryField label="Quantity">
              <Input type="number" min="1" value={actionForm.quantity} onChange={(event) => onActionChange("quantity", event.target.value)} />
            </InventoryField>
            <InventoryField label="Warehouse">
              <Input value={actionForm.warehouseLocation} onChange={(event) => onActionChange("warehouseLocation", event.target.value)} />
            </InventoryField>
          </div>
          <div className="mt-3">
            <InventoryField label="Reason">
              <Textarea value={actionForm.notes} onChange={(event) => onActionChange("notes", event.target.value)} />
            </InventoryField>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Button variant="outline" onClick={() => onAction("in")} disabled={actionPending}>Stock In</Button>
            <Button variant="outline" onClick={() => onAction("out")} disabled={actionPending}>Stock Out</Button>
            <Button variant="outline" onClick={() => onAction("adjust-add")} disabled={actionPending}>Adjust Up</Button>
            <Button variant="outline" onClick={() => onAction("adjust-remove")} disabled={actionPending}>Adjust Down</Button>
            <Button className="sm:col-span-2" variant="outline" onClick={() => onAction("transfer")} disabled={actionPending}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Transfer Warehouse
            </Button>
          </div>
        </div>
        <div className="border-t pt-4">
          <p className="mb-2 text-xs text-muted-foreground">Deleting inventory permanently removes this record and preserves existing orders.</p>
          <Button className="w-full" variant="destructive" onClick={onDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete Inventory"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InventoryImage({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
      {src && !failed ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50 text-emerald-700 dark:from-emerald-950/30 dark:to-sky-950/30 dark:text-emerald-200">
          <Package className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

function MovementPanel({
  icon: Icon,
  title,
  description,
  items,
  loading,
  mode,
}: {
  icon: typeof Package;
  title: string;
  description: string;
  items: InventoryItem[];
  loading: boolean;
  mode: "in" | "out" | "adjust" | "transfer" | "history";
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.productName ?? `Product #${item.productId}`}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.warehouseLocation ?? "Unassigned warehouse"}</p>
                  </div>
                  <InventoryStatus status={item.status} isActive={item.isActive} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <Mini label="On hand" value={formatNumber(item.quantityOnHand)} />
                  <Mini label={mode === "out" ? "Reserved" : "Available"} value={formatNumber(mode === "out" ? item.quantityReserved : item.quantityAvailable)} />
                  <Mini label="Reorder" value={formatNumber(item.reorderLevel)} />
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {mode === "history"
                    ? `Updated ${formatDate(item.updatedAt)}`
                    : mode === "in"
                      ? `Received ${formatDate(item.receivedDate)}`
                      : `Batch ${item.batchNumber ?? "not assigned"}`}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <TrendingDown className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <h3 className="font-semibold">No matching stock movements</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Matching inventory events will be grouped here as stock is received, reserved, counted, or transferred.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InventoryStatus({ status, isActive = true }: { status: string; isActive?: boolean }) {
  if (!isActive) return <Badge className="rounded-md bg-muted text-muted-foreground border-transparent">Inactive</Badge>;
  const config = statusConfig[status] ?? statusConfig.in_stock;
  return <Badge className={`rounded-md ${config.className}`}>{config.label}</Badge>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 p-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function InventoryField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function wholeNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

function emptyInventoryForm(): InventoryForm {
  return {
    isActive: true,
    sellingPrice: "",
    purchasePrice: "",
    wholesalePrice: "",
    supplierId: "",
    quantityOnHand: "0",
    quantityReserved: "0",
    quantityAvailable: "0",
    reorderLevel: "10",
    reorderQuantity: "100",
    warehouseLocation: "",
    batchNumber: "",
    notes: "",
  };
}

function emptyMarketplaceForm(): MarketplaceForm {
  return {
    marketplaceVisible: true,
    showInFreshDeals: false,
    isFeatured: false,
    displayPriority: "",
  };
}
