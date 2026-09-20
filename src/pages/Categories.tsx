import { useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowDown,
  ArrowUp,
  Edit,
  FolderTree,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FormState = {
  id?: number;
  name: string;
  description: string;
  isActive: boolean;
};

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  isActive: true,
};

export default function Categories() {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const utils = trpc.useUtils();
  const categoriesQuery = trpc.category.list.useQuery({ includeInactive: true }, { retry: false });
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const activeCategories = categories.filter((category) => category.isActive);
  const createCategory = trpc.category.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.category.list.invalidate(),
        utils.product.list.invalidate(),
        utils.product.stats.invalidate(),
      ]);
      toast.success("Category created.");
    },
    onError: (error) => toast.error(error.message || "Could not create category."),
  });
  const updateCategory = trpc.category.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.category.list.invalidate(),
        utils.product.list.invalidate(),
        utils.product.stats.invalidate(),
      ]);
      toast.success("Category updated.");
    },
    onError: (error) => toast.error(error.message || "Could not update category."),
  });
  const deleteCategory = trpc.category.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.category.list.invalidate(),
        utils.product.list.invalidate(),
        utils.product.stats.invalidate(),
      ]);
      toast.success("Category marked inactive.");
    },
    onError: (error) => toast.error(error.message || "Could not delete category."),
  });

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) =>
      [category.name, category.slug, category.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [categories, search]);

  const openCreate = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (category: CategoryRow) => {
    setForm({
      id: category.id,
      name: category.name,
      description: category.description ?? "",
      isActive: category.isActive,
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    if (form.id) {
      updateCategory.mutate({
        id: form.id,
        name: form.name.trim(),
        description: form.description.trim(),
        isActive: form.isActive,
      });
    } else {
      createCategory.mutate({
        name: form.name.trim(),
        description: form.description.trim(),
        isActive: form.isActive,
        sortOrder: categories.length + 1,
      });
    }
    setDialogOpen(false);
  };

  const reorderCategory = (category: CategoryRow, direction: "up" | "down") => {
    const index = categories.findIndex((item) => item.id === category.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= categories.length) return;
    const swap = categories[swapIndex];
    updateCategory.mutate({ id: category.id, sortOrder: swap.sortOrder ?? swapIndex });
    updateCategory.mutate({ id: swap.id, sortOrder: category.sortOrder ?? index });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize products into active buying and selling categories.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Metric label="Total Categories" value={categories.length} loading={categoriesQuery.isLoading} />
        <Metric label="Active" value={activeCategories.length} loading={categoriesQuery.isLoading} />
        <Metric label="Inactive" value={categories.length - activeCategories.length} loading={categoriesQuery.isLoading} />
      </section>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {categoriesQuery.isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="w-32">Order</TableHead>
                  <TableHead className="w-40 pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="pl-4">
                      <div className="flex min-w-[240px] items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <FolderTree className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{category.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {category.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{category.slug}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          category.isActive
                            ? "rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200"
                            : "rounded-md bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-200"
                        }
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-md">Database</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => reorderCategory(category, "up")}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => reorderCategory(category, "down")}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Switch
                          checked={category.isActive}
                          onCheckedChange={(checked) => updateCategory.mutate({ id: category.id, isActive: checked })}
                          aria-label="Toggle active state"
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => {
                            deleteCategory.mutate({ id: category.id });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
              <FolderTree className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="font-semibold">No categories found</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Create categories before adding products so your catalog stays organized.
              </p>
              <Button className="mt-5" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              Categories are used by product forms and catalog filters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Vegetables"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Leafy greens, root vegetables, and fresh market vegetables."
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="category-active">Active</Label>
                <p className="text-xs text-muted-foreground">Active categories appear in product forms.</p>
              </div>
              <Switch
                id="category-active"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((current) => ({ ...current, isActive: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.name.trim() || createCategory.isPending || updateCategory.isPending}>
              {form.id ? "Save Category" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? <Skeleton className="mt-3 h-7 w-20" /> : <p className="mt-2 text-2xl font-semibold">{value}</p>}
      </CardContent>
    </Card>
  );
}
