import React from "react";
import { nanoid } from "nanoid";
import { formatCurrency, toNumber } from "@/lib/i18n";
import type { ProductOption } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Flame, Layers, Plus, Sparkles, Trash2, Utensils } from "lucide-react";

interface ProductOptionsEditorProps {
  options: ProductOption[];
  onChange: (options: ProductOption[]) => void;
  basePrice?: number | string;
  onBasePriceChange?: (price: string) => void;
}

export function ProductOptionsEditor({
  options,
  onChange,
  basePrice,
  onBasePriceChange,
}: ProductOptionsEditorProps) {
  const addOption = () => {
    const newOption: ProductOption = {
      id: nanoid(6),
      name: `Option ${options.length + 1}`,
      price: toNumber(basePrice) || 9.99,
      compareAtPrice: null,
      mealPrice: null,
      onlyPrice: null,
    };
    onChange([...options, newOption]);
  };

  const updateOption = (id: string, updates: Partial<ProductOption>) => {
    const next = options.map((opt) => (opt.id === id ? { ...opt, ...updates } : opt));
    onChange(next);
  };

  const removeOption = (id: string) => {
    onChange(options.filter((opt) => opt.id !== id));
  };

  const applyPreset = (presetName: string) => {
    let presetOptions: ProductOption[] = [];
    if (presetName === "signature-chicken") {
      presetOptions = [
        { id: nanoid(6), name: "2 PC", price: 7.49, mealPrice: 10.49, onlyPrice: 7.49 },
        { id: nanoid(6), name: "3 PC", price: 9.49, mealPrice: 12.49, onlyPrice: 9.49 },
        { id: nanoid(6), name: "4 PC", price: 11.49, mealPrice: 14.49, onlyPrice: 11.49 },
      ];
    } else if (presetName === "fiery-wings") {
      presetOptions = [
        { id: nanoid(6), name: "6 PC", price: 8.99, mealPrice: 11.99, onlyPrice: 8.99 },
        { id: nanoid(6), name: "15 PC", price: 19.99, mealPrice: 22.99, onlyPrice: 19.99 },
      ];
    } else if (presetName === "sandwich") {
      presetOptions = [
        { id: nanoid(6), name: "Classic", price: 6.99, mealPrice: 9.99, onlyPrice: 6.99 },
        { id: nanoid(6), name: "Deluxe", price: 7.99, mealPrice: 10.99, onlyPrice: 7.99 },
        { id: nanoid(6), name: "Grilled", price: 8.49, mealPrice: 11.49, onlyPrice: 8.49 },
      ];
    } else if (presetName === "tenders") {
      presetOptions = [
        { id: nanoid(6), name: "3 PC", price: 6.49, mealPrice: 9.49, onlyPrice: 6.49 },
        { id: nanoid(6), name: "5 PC", price: 9.99, mealPrice: 12.99, onlyPrice: 9.99 },
      ];
    } else if (presetName === "meal-only") {
      presetOptions = [
        { id: nanoid(6), name: "Regular Order", price: 7.99, mealPrice: 10.99, onlyPrice: 7.99 },
      ];
    }

    if (presetOptions.length > 0) {
      onChange(presetOptions);
      if (onBasePriceChange && presetOptions[0]) {
        onBasePriceChange(String(presetOptions[0].price));
      }
    }
  };

  return (
    <Card className="border-emerald-200/60 bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Layers className="h-4 w-4 text-emerald-600" />
              Multiple Price Options & Product Variants
            </CardTitle>
            <CardDescription className="text-xs">
              Configure multiple options (e.g. 2 PC, 3 PC, 4 PC or Classic/Deluxe) sharing the same product image.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 shrink-0"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Option
          </Button>
        </div>

        {/* Quick Menu Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[11px] font-medium text-muted-foreground mr-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Quick Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset("signature-chicken")}
            className="text-[11px] bg-muted/60 hover:bg-muted text-foreground px-2 py-0.5 rounded border border-border transition-colors"
          >
            Signature (2, 3, 4 PC)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("fiery-wings")}
            className="text-[11px] bg-muted/60 hover:bg-muted text-foreground px-2 py-0.5 rounded border border-border transition-colors"
          >
            Wings (6, 15 PC)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("sandwich")}
            className="text-[11px] bg-muted/60 hover:bg-muted text-foreground px-2 py-0.5 rounded border border-border transition-colors"
          >
            Sandwiches (Classic, Deluxe)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("tenders")}
            className="text-[11px] bg-muted/60 hover:bg-muted text-foreground px-2 py-0.5 rounded border border-border transition-colors"
          >
            Tenders (3, 5 PC)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("meal-only")}
            className="text-[11px] bg-muted/60 hover:bg-muted text-foreground px-2 py-0.5 rounded border border-border transition-colors"
          >
            Meal vs Only
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {options.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-6 text-center">
            <Utensils className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-foreground">Single Standard Price (No Variants)</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
              Currently this item has one standard price. If this dish comes in multiple portions or sizes (like 2 PC / 3 PC / 4 PC), click &ldquo;Add Option&rdquo; or pick a preset above.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="mt-3 text-xs"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Enable Multiple Options
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>{options.length} {options.length === 1 ? "Option" : "Options"} Defined</span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-destructive hover:underline text-[11px]"
              >
                Clear all options (revert to single price)
              </button>
            </div>

            <div className="space-y-2.5">
              {options.map((opt, index) => (
                <div
                  key={opt.id}
                  className="rounded-lg border border-border bg-card p-3 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        Option #{index + 1}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeOption(opt.id)}
                      title="Remove option"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Option Label *</Label>
                      <Input
                        value={opt.name}
                        onChange={(e) => updateOption(opt.id, { name: e.target.value })}
                        placeholder="e.g. 2 PC, Classic, 15 Wings"
                        className="h-8 text-xs font-medium mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-[11px] text-muted-foreground">Primary Price ($) *</Label>
                      <div className="relative mt-1">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={opt.price ?? ""}
                          onChange={(e) =>
                            updateOption(opt.id, { price: e.target.value ? Number(e.target.value) : 0 })
                          }
                          placeholder="9.99"
                          className="h-8 text-xs font-medium pl-6"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-[11px] text-muted-foreground">Combo Meal Price ($)</Label>
                      <div className="relative mt-1">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={opt.mealPrice ?? ""}
                          onChange={(e) =>
                            updateOption(opt.id, {
                              mealPrice: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          placeholder="Optional (e.g. 12.99)"
                          className="h-8 text-xs pl-6"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-[11px] text-muted-foreground">Only Price ($)</Label>
                      <div className="relative mt-1">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={opt.onlyPrice ?? ""}
                          onChange={(e) =>
                            updateOption(opt.id, {
                              onlyPrice: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          placeholder="Optional (e.g. 8.99)"
                          className="h-8 text-xs pl-6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Storefront Customer View Summary */}
            <div className="mt-3 rounded-lg border border-emerald-200/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
              <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Storefront Customer Experience:
              </p>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400 mt-1">
                Customers on the product page will see radio selection buttons for each option (
                {options.map((o) => `${o.name}: ${formatCurrency(o.price)}`).join(", ")}) and cannot add the item to cart without selecting their option.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
