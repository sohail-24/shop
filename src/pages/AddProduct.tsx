import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatCurrency, toNumber } from "@/lib/i18n";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Flame,
  ImagePlus,
  Package,
  Save,
  Sparkles,
  Star,
  Tag,
  UploadCloud,
  Utensils,
  X,
  ChefHat,
  Eye,
} from "lucide-react";

type ImagePreview = {
  id: string;
  name: string;
  size: number;
  url: string;
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

export default function AddProduct() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [publish, setPublish] = useState(true);

  // Restaurant menu form fields
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    description: "",
    unitSize: "1 Platter",
    sellingPrice: "",
    compareAtPrice: "",
    purchasePrice: "",
    dailyStock: "100",
    isHalal: true,
    isVegetarian: false,
    spiceLevel: "mild",
    isFeatured: false,
    tags: "halal, fresh, platter",
    // Backend technical compatibility fields
    sku: "",
    supplierId: "",
    warehouse: "Shah's Halal Kitchen",
  });

  const utils = trpc.useUtils();
  const categoriesQuery = trpc.category.list.useQuery(undefined, { retry: false });
  const companiesQuery = trpc.company.list.useQuery(undefined, { retry: false });
  const suppliers = (companiesQuery.data ?? []).filter(
    (company) => company.type === "supplier" || company.type === "both"
  );
  const activeCategories = categoriesQuery.data ?? [];

  const createProduct = trpc.product.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.product.list.invalidate(),
        utils.product.stats.invalidate(),
        utils.inventory.list.invalidate(),
        utils.inventory.stats.invalidate(),
      ]);
      toast.success("Menu item added successfully!");
      navigate("/products");
    },
    onError: (error) => {
      toast.error(error.message || "Could not save menu item. Please try again.");
    },
  });

  // Auto-select Shah's Halal supplier if available
  useEffect(() => {
    if (!form.supplierId && suppliers.length > 0) {
      const shahsSupplier = suppliers.find((s) => s.name.toLowerCase().includes("shah"));
      const defaultSupplier = shahsSupplier || suppliers[0];
      if (defaultSupplier) {
        setForm((curr) => ({ ...curr, supplierId: String(defaultSupplier.id) }));
      }
    }
  }, [form.supplierId, suppliers]);

  // Validation rules
  const errors = {
    name: form.name.trim() ? "" : "Menu item name is required.",
    categoryId: form.categoryId ? "" : "Category is required.",
    sellingPrice: toNumber(form.sellingPrice) > 0 ? "" : "Selling price must be greater than $0.00.",
  };
  const isFormValid = Object.values(errors).every((error) => !error);

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const addFiles = async (files: FileList | File[]) => {
    const selectedFiles = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, Math.max(0, 8 - images.length));
    if (!selectedFiles.length) return;

    setIsUploadingImages(true);
    try {
      const nextImages = await Promise.all(
        selectedFiles.map(async (file) => ({
          id: `${file.name}-${file.lastModified}-${nanoid()}`,
          name: file.name,
          size: file.size,
          url: await uploadProductImage(file),
        }))
      );

      setImages((current) => {
        const merged = [...current, ...nextImages].slice(0, 8);
        if (!primaryImageId && merged[0]) setPrimaryImageId(merged[0].id);
        return merged;
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload food images.");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const addImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      toast.error("Please enter a valid HTTP or HTTPS image URL.");
      return;
    }
    const newImage: ImagePreview = {
      id: nanoid(),
      name: "Web Image",
      size: 1024,
      url: trimmed,
    };
    setImages((curr) => {
      const updated = [...curr, newImage];
      if (!primaryImageId) setPrimaryImageId(newImage.id);
      return updated;
    });
    setImageUrlInput("");
  };

  const removeImage = (id: string) => {
    setImages((current) => {
      const next = current.filter((image) => image.id !== id);
      if (primaryImageId === id) setPrimaryImageId(next[0]?.id ?? null);
      return next;
    });
  };

  const saveProduct = (status: "draft" | "active") => {
    setAttemptedSubmit(true);
    if (isUploadingImages) {
      toast.error("Please wait for images to finish uploading.");
      return;
    }
    if (!isFormValid) {
      toast.error("Please complete all required fields (Name, Category, Selling Price).");
      return;
    }

    const orderedImages = [
      ...images.filter((image) => image.id === primaryImageId),
      ...images.filter((image) => image.id !== primaryImageId),
    ];

    // Compute tags with dietary flags
    const tagList = form.tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (form.isHalal && !tagList.includes("halal")) tagList.push("halal");
    if (form.isVegetarian && !tagList.includes("vegetarian")) tagList.push("vegetarian");
    if (form.isFeatured && !tagList.includes("featured")) tagList.push("featured");
    if (form.spiceLevel && !tagList.includes(form.spiceLevel)) tagList.push(form.spiceLevel);

    // Auto-generate safe SKU if not given
    const cleanNameSlug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const safeSku = form.sku.trim() || `SHAH-${cleanNameSlug.slice(0, 20).toUpperCase()}-${nanoid(4).toUpperCase()}`;

    // Estimated prep cost (purchase price)
    const selling = toNumber(form.sellingPrice);
    const purchase = toNumber(form.purchasePrice) > 0
      ? toNumber(form.purchasePrice)
      : Math.max(1, +(selling * 0.35).toFixed(2));

    const portions = Math.max(1, Math.floor(toNumber(form.dailyStock) || 50));

    createProduct.mutate({
      name: form.name.trim(),
      sku: safeSku,
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
      reservedStock: 0,
      minimumStock: 5,
      reorderQuantity: 20,
      warehouse: form.warehouse.trim() || "Shah's Halal Kitchen",
      status,
      unitType: "each",
      unitSize: form.unitSize.trim() || "1 Portion",
      minimumOrderQuantity: 1,
      grade: "grade_a",
      organic: form.isVegetarian,
      images: orderedImages.map((image) => image.url),
      tags: tagList,
    });
  };

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
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Add Menu Item</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a new dish to Shah's Halal restaurant menu with photos, pricing, ingredients, and dietary options.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <Switch checked={publish} onCheckedChange={setPublish} id="publish-switch" />
            <Label htmlFor="publish-switch" className="text-sm cursor-pointer">
              {publish ? "Active on Menu" : "Save as Draft"}
            </Label>
          </div>
          <Button
            variant="outline"
            onClick={() => saveProduct("draft")}
            disabled={createProduct.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => saveProduct(publish ? "active" : "draft")}
            disabled={createProduct.isPending}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {createProduct.isPending ? "Adding Item..." : publish ? "Publish Menu Item" : "Save Item"}
          </Button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {/* Section 1: Item Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Utensils className="h-4 w-4 text-primary" />
                Dish Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Dish Name" required error={attemptedSubmit ? errors.name : ""}>
                <Input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="e.g. Chicken Over Rice Platter, Lamb Gyro Pita"
                />
              </Field>

              <Field label="Menu Category" required error={attemptedSubmit ? errors.categoryId : ""}>
                <Select
                  value={form.categoryId}
                  onValueChange={(value) => updateField("categoryId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select menu category" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCategories.length ? (
                      activeCategories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No categories found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Serving Portion / Size">
                <Input
                  value={form.unitSize}
                  onChange={(event) => updateField("unitSize", event.target.value)}
                  placeholder="e.g. 1 Platter with Rice & Salad, 1 Pita Wrap, 6 pcs"
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
                    placeholder="e.g. Tender marinated grilled chicken served over seasoned yellow basmati rice with fresh crisp salad, toasted pita bread, and our famous signature white and hot sauces."
                    className="min-h-24"
                  />
                </Field>
              </div>

              {/* Dietary Flags */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <Label htmlFor="halal-switch" className="flex items-center gap-2 text-sm cursor-pointer">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    100% Halal
                  </Label>
                  <Switch
                    id="halal-switch"
                    checked={form.isHalal}
                    onCheckedChange={(checked) => updateField("isHalal", checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <Label htmlFor="veg-switch" className="flex items-center gap-2 text-sm cursor-pointer">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    Vegetarian
                  </Label>
                  <Switch
                    id="veg-switch"
                    checked={form.isVegetarian}
                    onCheckedChange={(checked) => updateField("isVegetarian", checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <Label htmlFor="featured-switch" className="flex items-center gap-2 text-sm cursor-pointer">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                    Chef's Special
                  </Label>
                  <Switch
                    id="featured-switch"
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
                    placeholder="e.g. popular, platter, rice, chicken, gyro, lunch"
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
                Pricing & Menu Availability
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
                    placeholder="11.99"
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
                    placeholder="13.99"
                    className="pl-8"
                  />
                </div>
              </Field>

              <Field label="Daily Portion Stock">
                <Input
                  type="number"
                  min="0"
                  value={form.dailyStock}
                  onChange={(event) => updateField("dailyStock", event.target.value)}
                  placeholder="100"
                />
              </Field>
            </CardContent>
          </Card>

          {/* Section 3: Food Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImagePlus className="h-4 w-4 text-primary" />
                Dish Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "bg-muted/30 hover:bg-muted/50"
                }`}
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  addFiles(event.dataTransfer.files);
                }}
              >
                <UploadCloud className="mb-2 h-7 w-7 text-muted-foreground" />
                <p className="text-sm font-medium">Drop food photo here or click to browse</p>
                <p className="mt-1 text-xs text-muted-foreground">Upload appetizing photos of the dish</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    if (event.target.files) addFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
              </div>

              {/* Or paste image URL */}
              <div className="flex gap-2">
                <Input
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Or paste an image URL (https://images.unsplash.com/...)"
                  className="text-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={addImageUrl}>
                  Add URL
                </Button>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {images.map((image) => (
                    <div key={image.id} className="group relative overflow-hidden rounded-lg border bg-muted">
                      <img src={image.url} alt={image.name} className="aspect-square w-full object-cover" />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-background/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 text-destructive"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setPrimaryImageId(image.id)}
                        className={`absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-background/90 shadow-sm ${
                          primaryImageId === image.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                        aria-label="Set primary image"
                      >
                        <Star className={`h-4 w-4 ${primaryImageId === image.id ? "fill-amber-400 text-amber-500" : "text-muted-foreground"}`} />
                      </button>
                      {primaryImageId === image.id && (
                        <div className="absolute inset-x-0 bottom-0 bg-amber-500/90 py-1 text-center text-[10px] font-semibold text-white">
                          Cover Photo
                        </div>
                      )}
                    </div>
                  ))}
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

              <Field label="Item SKU (Auto-generated if blank)">
                <Input
                  value={form.sku}
                  onChange={(event) => updateField("sku", event.target.value)}
                  placeholder="e.g. SHAH-CHK-PLTR-01"
                />
              </Field>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Readiness & Preview */}
        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Menu Readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReadinessRow label="Dish name" complete={!!form.name.trim()} />
              <ReadinessRow label="Category selected" complete={!!form.categoryId} />
              <ReadinessRow label="Selling price" complete={toNumber(form.sellingPrice) > 0} />
              <ReadinessRow label="Photo added" complete={images.length > 0} />
              <Separator />
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Publishing Status</p>
                <div className="mt-1 flex items-center justify-between">
                  <Badge variant={publish ? "default" : "secondary"}>
                    {publish ? "Ready to Serve (Active)" : "Draft (Hidden)"}
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
                    src={(images.find((i) => i.id === primaryImageId) || images[0]).url}
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

function ReadinessRow({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground text-xs">{label}</span>
      <Badge variant={complete ? "default" : "outline"} className="text-xs h-5 py-0">
        {complete ? "Ready" : "Needed"}
      </Badge>
    </div>
  );
}
