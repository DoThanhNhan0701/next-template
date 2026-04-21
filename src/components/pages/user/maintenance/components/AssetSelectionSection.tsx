"use client";

import { useState } from "react";

import { PlusIcon, RefreshCcw, Trash } from "lucide-react";
import { CheckCircle2, User, Warehouse } from "lucide-react";
import {
  Controller,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormReturn,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dynamicEndpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { cn } from "@/lib/utils";
import { ILocation } from "@/types/location";
import { IPhysicalAsset } from "@/types/physical-asset";
import { IAssetHolder, IAssetStock } from "@/types/physical-asset";

import { MaintenanceFormValues } from "../MaintenanceFormModal";

interface AssetStockSelectorProps {
  assetId: number;
  index: number;
  form: UseFormReturn<MaintenanceFormValues>;
}

function AssetStockSelector({ assetId, index, form }: AssetStockSelectorProps) {
  const [sourceType, setSourceType] = useState<"stock" | "holder">("stock");

  const { response: stockRes, pending: stockPending } = useGet<IAssetStock[]>(
    { url: dynamicEndpoints.PHYSICAL_ASSET_STOCK(assetId) },
    { disabled: !assetId, deps: [assetId] },
  );

  const { response: holderRes, pending: holderPending } = useGet<
    IAssetHolder[]
  >(
    { url: dynamicEndpoints.PHYSICAL_ASSET_HOLDERS(assetId) },
    { disabled: !assetId, deps: [assetId] },
  );

  const stocks = stockRes || [];
  const holders = holderRes || [];

  const currentSelection = form.watch(`items.${index}`);
  const isSelected = (id: number, type: "stock" | "holder") => {
    if (type === "stock")
      return (
        currentSelection.from_location_id === id &&
        currentSelection.from_staff_id === 0
      );
    const holderId = id; // holder ID passed is staff_id or unit_id
    return (
      currentSelection.from_staff_id === holderId ||
      currentSelection.from_unit_id === holderId
    );
  };

  if (!assetId) return null;

  return (
    <div className="mt-4 p-3 bg-muted/30 rounded-xl border border-border/40 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="space-y-3">
        <label className="text-xs font-semibold text-primary flex items-center gap-2">
          <CheckCircle2 size={12} className="text-primary" />
          Nguồn lấy tài sản *
        </label>

        {/* Source Pills Container */}
        <div className="flex flex-wrap gap-2">
          {stockPending || holderPending ? (
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-7 w-24 bg-muted animate-pulse rounded-full"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Stock Pills */}
              {stocks.map((s, i) => (
                <button
                  key={`stock-pill-${i}`}
                  type="button"
                  onClick={() => {
                    form.setValue(
                      `items.${index}.from_location_id`,
                      s.location_id,
                    );
                    form.setValue(`items.${index}.from_staff_id`, 0);
                    form.setValue(`items.${index}.from_unit_id`, 0);
                    setSourceType("stock");
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all",
                    isSelected(s.location_id, "stock")
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-md scale-105"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
                  )}
                >
                  <Warehouse size={12} />
                  {s.location_name}:{" "}
                  <span className="font-bold">{s.quantity}</span>
                </button>
              ))}

              {/* Holder Pills */}
              {holders.map((h, i) => {
                const holderId = h.staff_id || h.unit_id || 0;
                return (
                  <button
                    key={`holder-pill-${i}`}
                    type="button"
                    onClick={() => {
                      form.setValue(`items.${index}.from_location_id`, 0);
                      form.setValue(
                        `items.${index}.from_staff_id`,
                        h.staff_id || 0,
                      );
                      form.setValue(
                        `items.${index}.from_unit_id`,
                        h.unit_id || 0,
                      );
                      setSourceType("holder");
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all",
                      isSelected(holderId, "holder")
                        ? "bg-blue-600 border-blue-600 text-white shadow-md scale-105"
                        : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
                    )}
                  >
                    <User size={12} />
                    {h.name}: <span className="font-bold">{h.quantity}</span>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Action Toggle Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSourceType("stock")}
            className={cn(
              "px-4 rounded-lg flex items-center gap-2 font-bold transition-all",
              sourceType === "stock"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-lg scale-105"
                : "border-primary/20 text-muted-foreground bg-white",
            )}
          >
            <Warehouse size={16} /> Lấy từ kho
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSourceType("holder")}
            className={cn(
              "px-4 rounded-lg flex items-center gap-2 font-bold transition-all",
              sourceType === "holder"
                ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105"
                : "border-primary/20 text-muted-foreground bg-white",
            )}
          >
            <User size={16} /> Lấy từ người giữ
          </Button>
        </div>

        {/* Source Dropdown Selector */}
        <Field className="gap-1.5 pt-2">
          <FieldLabel
            className={cn(
              "text-xs font-semibold",
              sourceType === "stock" ? "text-emerald-700" : "text-blue-700",
            )}
          >
            {sourceType === "stock" ? "Chọn kho xuất" : "Chọn người giữ xuất"} *
          </FieldLabel>
          <Controller
            name={
              sourceType === "stock"
                ? `items.${index}.from_location_id`
                : `items.${index}.from_staff_id`
            }
            control={form.control}
            render={({ field: selectField }) => (
              <Select
                onValueChange={(val) => {
                  const id = Number(val);
                  if (sourceType === "stock") {
                    form.setValue(`items.${index}.from_location_id`, id);
                    form.setValue(`items.${index}.from_staff_id`, 0);
                    form.setValue(`items.${index}.from_unit_id`, 0);
                  } else {
                    const holder = holders.find(
                      (h) => (h.staff_id || h.unit_id) === id,
                    );
                    form.setValue(`items.${index}.from_location_id`, 0);
                    form.setValue(
                      `items.${index}.from_staff_id`,
                      holder?.staff_id || 0,
                    );
                    form.setValue(
                      `items.${index}.from_unit_id`,
                      holder?.unit_id || 0,
                    );
                  }
                }}
                value={selectField.value ? selectField.value.toString() : ""}
                disabled={
                  sourceType === "stock"
                    ? stocks.length === 0
                    : holders.length === 0
                }
              >
                <SelectTrigger className="bg-white rounded-md border-border/60 shadow-none transition-all">
                  <SelectValue
                    placeholder={
                      sourceType === "stock"
                        ? "-- Chọn kho --"
                        : "-- Chọn người giữ --"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {sourceType === "stock"
                    ? stocks.map((s, i) => (
                        <SelectItem
                          key={`s-opt-${i}`}
                          value={s.location_id.toString()}
                        >
                          [{s.location_code}] {s.location_name} - Qty:{" "}
                          {s.quantity}
                        </SelectItem>
                      ))
                    : holders.map((h, i) => {
                        const id = h.staff_id || h.unit_id || 0;
                        return (
                          <SelectItem key={`h-opt-${i}`} value={id.toString()}>
                            {h.name} ({h.type}) - Qty: {h.quantity}
                          </SelectItem>
                        );
                      })}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>
    </div>
  );
}

interface AssetSelectionSectionProps {
  form: UseFormReturn<MaintenanceFormValues>;
  fields: FieldArrayWithId<MaintenanceFormValues, "items", "id">[];
  append: UseFieldArrayAppend<MaintenanceFormValues, "items">;
  remove: UseFieldArrayRemove;
  assets: IPhysicalAsset[];
  assetsPending: boolean;
  reFetchAssets: () => void;
  locations: ILocation[];
}

export function AssetSelectionSection({
  form,
  fields,
  append,
  remove,
  assets,
  assetsPending,
  reFetchAssets,
  locations,
}: AssetSelectionSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-dashed pb-3">
        <label className="text-xs font-semibold text-primary">
          Asset selection & inventory
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            onClick={() => reFetchAssets()}
            disabled={assetsPending}
          >
            <RefreshCcw
              size={12}
              className={assetsPending ? "animate-spin" : ""}
            />
            Reload
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs font-semibold"
            onClick={() =>
              append({
                asset_id: 0,
                quantity: 1,
                notes: "",
                from_location_id: 0,
                from_staff_id: 0,
                from_unit_id: 0,
                return_to_location_id: 0,
              })
            }
          >
            <PlusIcon size={10} className="mr-1" /> Add Asset
          </Button>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative bg-muted/20 border border-border/40 rounded-lg p-5 pr-12 space-y-4 transition-all hover:bg-muted/30"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              <Trash size={14} />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-3">
                <Controller
                  name={`items.${index}.asset_id`}
                  control={form.control}
                  render={({ field: detailField, fieldState }) => (
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-semibold text-muted-foreground">
                        Chọn tài sản *
                      </FieldLabel>
                      <Select
                        onValueChange={(val) => {
                          const assetId = Number(val);
                          detailField.onChange(assetId);

                          // Handle unique asset rules
                          const selectedAsset = assets.find(
                            (a) => a.id === assetId,
                          );
                          const statusName =
                            selectedAsset?.status_obj?.name || "";
                          const isRestricted =
                            selectedAsset?.management_type === "unique" &&
                            statusName === "Đang cho thuê";

                          if (isRestricted) {
                            const noteText = `${statusName} - không thể bảo trì`;
                            form.setValue(`items.${index}.notes`, noteText);
                          }

                          // Reset stock selection when asset changes
                          form.setValue(`items.${index}.from_location_id`, 0);
                          form.setValue(`items.${index}.from_staff_id`, 0);
                          form.setValue(`items.${index}.from_unit_id`, 0);
                        }}
                        value={
                          detailField.value ? detailField.value.toString() : ""
                        }
                        disabled={
                          assetsPending ||
                          (!assetsPending && assets.length === 0)
                        }
                      >
                        <SelectTrigger className="bg-white rounded-md border-border/60 shadow-none">
                          <SelectValue
                            placeholder={
                              assetsPending
                                ? "Loading assets..."
                                : assets.length === 0
                                  ? "No assets available"
                                  : "Choose an asset to maintain"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {assets.map((a) => {
                            const sName = a.status_obj?.name || "";
                            const isUniqueRestricted =
                              a.management_type === "unique" &&
                              sName === "Đang cho thuê";

                            return (
                              <SelectItem
                                key={`asset-${a.id}`}
                                value={a.id.toString()}
                              >
                                <div className="flex flex-col items-start text-xs py-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">
                                      {a.name}
                                    </span>
                                    {a.management_type === "unique" && (
                                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">
                                        Unique
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-muted-foreground opacity-80 mt-0.5">
                                    {a.asset_code} | Holder:{" "}
                                    {a.holder_name || "N/A"}
                                    {isUniqueRestricted && (
                                      <span className="ml-2 text-destructive font-medium italic">
                                        - {sName} - không thể bảo trì
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {/* Visual indicator for unique assets */}
                      {(() => {
                        const selAsset = detailField.value
                          ? assets.find((a) => a.id === detailField.value)
                          : null;
                        const sName = selAsset?.status_obj?.name || "";
                        const isRestricted =
                          selAsset?.management_type === "unique" &&
                          sName === "Đang cho thuê";

                        if (!isRestricted) return null;

                        return (
                          <div className="mt-1.5 flex items-center gap-2 bg-amber-50/50 border border-amber-100 px-3 py-1.5 rounded-md">
                            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wide">
                              Note:
                            </span>
                            <span className="text-[11px] text-amber-600 font-medium italic">
                              {sName} - không thể bảo trì
                            </span>
                          </div>
                        );
                      })()}
                      <FieldError errors={[fieldState.error]} />

                      {/* Dynamic Stock Selection */}
                      {detailField.value > 0 && (
                        <AssetStockSelector
                          assetId={detailField.value}
                          index={index}
                          form={form}
                        />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div>
                <Controller
                  name={`items.${index}.quantity`}
                  control={form.control}
                  render={({ field: qtyField, fieldState }) => (
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-semibold text-muted-foreground">
                        Số lượng *
                      </FieldLabel>
                      <Input
                        type="number"
                        className="bg-white text-center font-semibold"
                        {...qtyField}
                        onChange={(e) =>
                          qtyField.onChange(Number(e.target.value))
                        }
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-dashed border-border/60">
              <Controller
                name={`items.${index}.return_to_location_id`}
                control={form.control}
                render={({ field: locField, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel className="text-xs font-semibold text-muted-foreground">
                      Vị trí trả về
                    </FieldLabel>
                    <p className="text-[10px] text-muted-foreground/70 italic -mt-0.5 mb-1">
                      Để trống trả về nguồn gốc ban đầu
                    </p>
                    <Select
                      onValueChange={(val) =>
                        locField.onChange(val === "none" ? null : Number(val))
                      }
                      value={
                        locField.value ? locField.value.toString() : "none"
                      }
                    >
                      <SelectTrigger className="bg-white rounded-md border-border/60 text-xs shadow-none">
                        <SelectValue placeholder="Chọn vị trí trả về" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="none"
                          className="text-muted-foreground italic text-xs"
                        >
                          (None) - Trả về nguồn gốc
                        </SelectItem>
                        {locations.map((l) => (
                          <SelectItem
                            key={l.id}
                            value={l.id.toString()}
                            className="text-xs"
                          >
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name={`items.${index}.notes`}
                control={form.control}
                render={({ field: notesField, fieldState }) => (
                  <Field className="gap-1 justify-end">
                    <FieldLabel className="text-xs font-semibold text-muted-foreground">
                      Ghi chú item
                    </FieldLabel>
                    <Input
                      {...notesField}
                      placeholder="Maintenance detail for this asset..."
                      className="bg-white/50 rounded-md border-muted-foreground/10 text-xs"
                      value={notesField.value || ""}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
