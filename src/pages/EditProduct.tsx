import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatCurrency, getProductMeta, toNumber } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  ImagePlus,
  Package,
  Save,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  Utensils,
  ChefHat,
  Eye,
  X,
} from "lucide-react";

type ImageRow = {
  id: string;
  url: string;
  failed?: boolean;
};

async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/products/upload", {
    method: "POST",
    body: formData,
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    url?: string;
  };
  if (!response.ok || !payload.url) {
    throw new Error(payload.error || `Could not upload ${file.name}.`);
  }

  return payload.url;
}

function parseImages(images?: string | null, primary?: string | null): ImageRow[] {
  const urls = new Set<string>();
  if (primary) urls.add(primary);
  if (images) {
    try {
      const parsed = JSON.parse(images) as unknown;
      if (Array.isArray(parsed)) {
        parsed
          .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
          .forEach((url) => urls.add(url));
      }
    } catch {
      if (images.trim()) urls.add(images.trim());
    }
  }
  return Array.from(urls).map((url, index) => ({ id: `${index}-${url}`, url }));
}

export default function EditProduct() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [images, setImages] = useState<ImageRow[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Restaurant form fields
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    description: "",
    unitSize: "1 Platter",
    sellingPrice: "",
    compareAtPrice: "",
    purchasePrice: "",
    dailyStock: "100",
    status: "active" as "draft" | "active" | "archived",
    isHalal: true,
    isVegetarian: false,
    spiceLevel: "mild",
    isFeatured: false,
    tags: "",
    // Compatibility fields
    sku: "",
    supplierId: "",
    warehouse: "Shah's Halal Kitchen",
  });

  const productQuery = trpc.product.bySlug.useQuery({ slug: slug! }, { enabled: !!slug, retry: false });
  const categoriesQuery = trpc.category.list.useQuery(undefined, { retry: false });
  const companiesQuery = trpc.company.list.useQuery(undefined, { retry: false });
  const productId = productQuery.data?.id;
  const inventoryQuery = trpc.inventory.byProduct.useQuery(
    { productId: productId ?? 0 },
    { enabled: !!productId, retry: false }
  );

  const updateProduct = trpc.product.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.product.list.invalidate(),
        utils.product.bySlug.invalidate(),
        utils.product.stats.invalidate(),
        utils.inventory.list.invalidate(),
        utils.inventory.stats.invalidate(),
      ]);
      toast.success("Menu item updated successfully!");
      navigate("/products");
    },
    onError: (error) => {
      toast.error(error.message || "Could not update menu item. Please try again.");
    },
  });

  const product = productQuery.data;
  const categories = categoriesQuery.data ?? [];
  const suppliers = (companiesQuery.data ?? []).filter(
    (company) => company.type === "supplier" || company.type === "both"
  );
  const inventoryRecord = inventoryQuery.data?.[0];

  useEffect(() => {
    if (!product) return;
    const meta = getProductMeta(product);
    const existingTags = meta.tags ?? [];
    const isHalalTag = existingTags.includes("halal") || true;
    const isVegTag = Boolean(product.organic) || existingTags.includes("vegetarian");
    const isFeatTag = existingTags.includes("featured") || (product as any).featured === true;
    const detectedSpice = existingTags.find((t) => ["mild", "medium", "hot", "extra-hot"].includes(t)) || "mild";

    setForm({
      name: product.name ?? "",
      categoryId: String(product.categoryId ?? ""),
      description: product.description ?? "",
      unitSize: product.unitSize ?? "1 Portion",
      sellingPrice: String(toNumber(product.unitPrice)),
      compareAtPrice: product.compareAtPrice ? String(toNumber(product.compareAtPrice)) : "",
      purchasePrice: String(toNumber(product.purchasePrice ?? +(toNumber(product.unitPrice) * 0.35).toFixed(2))),
      dailyStock: inventoryRecord ? String(inventoryRecord.quantityOnHand) : "100",
      status: (product.status as "draft" | "active" | "archived") || "active",
      isHalal: isHalalTag,
      isVegetarian: isVegTag,
      spiceLevel: detectedSpice,
      isFeatured: isFeatTag,
      tags: existingTags.join(", "),
      sku: meta.sku ?? product.sku ?? "",
      supplierId: String(product.supplierId ?? ""),
      warehouse: inventoryRecord?.warehouseLocation || "Shah's Halal Kitchen",
    });
    setImages(parseImages(product.images, product.image));
  }, [product, inventoryRecord]);

  const errors = {
    name: form.name.trim() ? "" : "Item name is required.",
    categoryId: form.categoryId ? "" : "Category is required.",
    sellingPrice: toNumber(form.sellingPrice) > 0 ? "" : "Selling price must be greater than $0.00.",
  };
  const isFormValid = Object.values(errors).every((error) => !error);

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;

    setIsUploading(true);
    try {
      const url = await uploadProductImage(file);
      setImages((current) => [...current, { id: `${Date.now()}-${url}`, url }].slice(0, 8));
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (images.some((image) => image.url === url)) {
      toast.error("This image URL is already attached.");
      return;
    }
    setImages((current) => [...current, { id: `${Date.now()}-${url}`, url }].slice(0, 8));
    setNewImageUrl("");
  };

  const setPrimaryImage = (id: string) => {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (!target) return current;
      return [target, ...current.filter((image) => image.id !== id)];
    });
  };

  const removeImage = (id: string) => {
    setImages((current) => current.filter((image) => image.id !== id));
  };

  const saveProduct = () => {
    setAttemptedSubmit(true);
    if (!product || !isFormValid) {
      toast.error("Please complete all required fields (Name, Category, Selling Price).");
      return;
    }

    const tagList = form.tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (form.isHalal && !tagList.includes("halal")) tagList.push("halal");
    if (form.isVegetarian && !tagList.includes("vegetarian")) tagList.push("vegetarian");
    if (form.isFeatured && !tagList.includes("featured")) tagList.push("featured");
    if (form.spiceLevel && !tagList.includes(form.spiceLevel)) tagList.push(form.spiceLevel);

    const selling = toNumber(form.sellingPrice);
    const purchase = toNumber(form.purchasePrice) > 0
      ? toNumber(form.purchasePrice)
      : Math.max(1, +(selling * 0.35).toFixed(2));
    const portions = Math.max(0, Math.floor(toNumber(form.dailyStock)));

    updateProduct.mutate({
      id: product.id,
      name: form.name.trim(),
      sku: form.sku.trim() || undefined,
      categoryId: Number(form.categoryId),
      supplierId: form.supplierId ? Number(form.supplierId) : undefined,
      description: form.description.trim() || undefined,
      purchasePrice: purchase,
      sellingPrice: selling,
      discount: toNumber(form.compareAtPrice) > selling
        ? Math.round(((toNumber(form.compareAtPrice) - selling) / toNumber(form.compareAtPrice)) * 100)
        : 0,
      openingStock: portions,
      availableStock: portions,
      warehouse: form.warehouse.trim() || "Shah's Halal Kitchen",
      status: form.status,
      unitType: "each",
      unitSize: form.unitSize.trim() || "1 Portion",
      minimumOrderQuantity: 1,
      organic: form.isVegetarian,
      images: images.map((image) => image.url),
      tags: tagList,
    });
  };

  if (productQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1300px] space-y-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Skeleton className="h-[520px]" />
          <Skeleton className="h-[360px]" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
        <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h1 className="text-xl font-semibold">Dish not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This menu item may have been deleted or moved.</p>
        <Link to="/products">
          <Button className="mt-5">Back to Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            to="/products"
            className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Edit Menu Item</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update dish details, photos, pricing, ingredients, and storefront availability.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/products/${product.slug}`}>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View on Storefront
            </Button>
          </Link>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={saveProduct}
            disabled={!isFormValid || updateProduct.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {updateProduct.isPending ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {/* Section 1: Dish Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Utensils className="h-4 w-4 text-primary" />
                Dish Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Dish Name" required error={attemptedSubmit ? errors.name : ""}>
                <Input value={form.name} onChange={(event) => updateField("name", event.target.value)} />
              </Field>

              <Field label="Menu Category" required error={attemptedSubmit ? errors.categoryId : ""}>
                <Select
                  value={form.categoryId}
                  onValueChange={(value) => updateField("categoryId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Serving Portion / Size">
                <Input
                  value={form.unitSize}
                  onChange={(event) => updateField("unitSize", event.target.value)}
                  placeholder="e.g. 1 Platter with Rice & Salad"
                />
              </Field>

              <Field label="Spice Level">
                <Select
                  value={form.spiceLevel}
                  onValueChange={(value) => updateField("spiceLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild (No heat)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hot">Hot (Red hot sauce)</SelectItem>
                    <SelectItem value="extra-hot">Extra Hot 🔥</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <div className="md:col-span-2">
                <Field label="Description & Ingredients">
                  <Textarea
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    className="min-h-24"
                    placeholder="Describe ingredients, marinades, and serving accompaniments."
                  />
                </Field>
              </div>

              {/* Dietary Flags */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <Label htmlFor="edit-halal-switch" className="flex items-center gap-2 text-sm cursor-pointer">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    100% Halal
                  </Label>
                  <Switch
                    id="edit-halal-switch"
                    checked={form.isHalal}
                    onCheckedChange={(checked) => updateField("isHalal", checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <Label htmlFor="edit-veg-switch" className="flex items-center gap-2 text-sm cursor-pointer">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    Vegetarian
                  </Label>
                  <Switch
                    id="edit-veg-switch"
                    checked={form.isVegetarian}
                    onCheckedChange={(checked) => updateField("isVegetarian", checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <Label htmlFor="edit-feat-switch" className="flex items-center gap-2 text-sm cursor-pointer">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                    Chef's Special
                  </Label>
                  <Switch
                    id="edit-feat-switch"
                    checked={form.isFeatured}
                    onCheckedChange={(checked) => updateField("isFeatured", checked)}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Field label="Search & Filter Tags">
                  <Input
                    value={form.tags}
                    onChange={(event) => updateField("tags", event.target.value)}
                    placeholder="e.g. popular, platter, rice, chicken"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Pricing & Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Pricing & Menu Status
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <Field label="Menu Selling Price ($)" required error={attemptedSubmit ? errors.sellingPrice : ""}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.sellingPrice}
                    onChange={(event) => updateField("sellingPrice", event.target.value)}
                    className="pl-8"
                  />
                </div>
              </Field>

              <Field label="Compare At / Original Price ($)">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.compareAtPrice}
                    onChange={(event) => updateField("compareAtPrice", event.target.value)}
                    className="pl-8"
                  />
                </div>
              </Field>

              <Field label="Menu Status">
                <Select
                  value={form.status}
                  onValueChange={(value) => updateField("status", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (On Menu)</SelectItem>
                    <SelectItem value="draft">Draft (Hidden)</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Daily Portion Stock">
                <Input
                  type="number"
                  min="0"
                  value={form.dailyStock}
                  onChange={(event) => updateField("dailyStock", event.target.value)}
                />
              </Field>
            </CardContent>
          </Card>

          {/* Section 3: Dish Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImagePlus className="h-4 w-4 text-primary" />
                Dish Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={newImageUrl}
                  onChange={(event) => setNewImageUrl(event.target.value)}
                  placeholder="Paste image URL (https://images.unsplash.com/...)"
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addImageUrl}
                  disabled={images.length >= 8}
                >
                  Add URL
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || images.length >= 8}
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {isUploading ? "Uploading..." : "Upload File"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>

              {images.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {images.map((image, index) => (
                    <div key={image.id} className="group relative overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={image.url}
                        alt={`${form.name} photo`}
                        className="aspect-square w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-background/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 text-destructive"
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(image.id)}
                        className={`absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-background/90 shadow-sm ${
                          index === 0 ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                        aria-label="Set primary cover image"
                      >
                        <Star className={`h-4 w-4 ${index === 0 ? "fill-amber-400 text-amber-500" : "text-muted-foreground"}`} />
                      </button>
                      {index === 0 && (
                        <div className="absolute inset-x-0 bottom-0 bg-amber-500/90 py-1 text-center text-[10px] font-semibold text-white">
                          Cover Photo
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-xs text-muted-foreground">
                  No dish photos attached yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Kitchen & Stock Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
                <ChefHat className="h-4 w-4" />
                Kitchen & Inventory Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Kitchen Location">
                <Input
                  value={form.warehouse}
                  onChange={(event) => updateField("warehouse", event.target.value)}
                  placeholder="Shah's Halal Kitchen"
                />
              </Field>

              <Field label="Item SKU">
                <Input
                  value={form.sku}
                  onChange={(event) => updateField("sku", event.target.value)}
                  placeholder="e.g. SHAH-CHK-PLTR-01"
                />
              </Field>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Menu Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Snapshot
                label="Category"
                value={
                  categories.find((c) => String(c.id) === form.categoryId)?.name ??
                  product.categoryName ??
                  "Uncategorized"
                }
              />
              <Snapshot label="Menu Price" value={formatCurrency(form.sellingPrice)} />
              <Snapshot label="Kitchen Stock" value={`${form.dailyStock || "0"} portions`} />
              <Separator />
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-1 flex items-center justify-between">
                  <Badge
                    variant={form.status === "active" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {form.status}
                  </Badge>
                  {form.isFeatured && (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs">
                      Special
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Storefront Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="overflow-hidden rounded-lg border bg-muted">
                {images.length > 0 ? (
                  <img
                    src={images[0].url}
                    alt="Preview"
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-muted/60 text-muted-foreground text-xs">
                    No photo uploaded
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground text-sm">{form.name || "Delicious Halal Dish"}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {form.description || "Freshly prepared halal ingredients with signature sauces."}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                    {form.sellingPrice ? formatCurrency(form.sellingPrice) : "$0.00"}
                  </span>
                  <Badge variant="outline" className="text-[10px] text-emerald-700 dark:text-emerald-400 border-emerald-400/30">
                    100% Halal
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Snapshot({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium">{value}</p>
    </div>
  );
}
