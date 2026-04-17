"use client";

import { RefreshCcw, PlusIcon, Trash } from "lucide-react";
import {
  UseFormReturn,
  Controller,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  FieldArrayWithId,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MaintenanceFormValues } from "../MaintenanceFormModal";
import { IPhysicalAsset } from "@/types/physical-asset";
import { ILocation } from "@/types/location";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

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
    <div className="flex flex-col gap-3 pt-6 mt-6 border-t">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-sm font-semibold text-primary tracking-tight">
          3. Asset Selection
        </h3>
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
            className="h-7 text-[10px] font-bold uppercase tracking-wider"
            onClick={() => append({ 
              asset_id: 0, 
              quantity: 1, 
              notes: "",
              from_location_id: 0,
              from_staff_id: 0,
              from_unit_id: 0,
              return_to_location_id: 0
            })}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Controller
                  name={`items.${index}.asset_id`}
                  control={form.control}
                  render={({ field: detailField, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest uppercase">
                        Select Asset *
                      </FieldLabel>
                      <Select
                        onValueChange={(val) => {
                          const assetId = Number(val);
                          detailField.onChange(assetId);
                          
                          // Handle unique asset rules
                          const selectedAsset = assets.find(a => a.id === assetId);
                          const statusName = selectedAsset?.status_obj?.name || "";
                          const isRestricted = 
                            selectedAsset?.management_type === "unique" && 
                            (statusName === "Dang cho thue" || statusName === "Đang cho thuê");

                          if (isRestricted) {
                            const noteText = `${statusName} - không thể bảo trì`;
                            form.setValue(`items.${index}.notes`, noteText);
                          }
                        }}
                        value={
                          detailField.value ? detailField.value.toString() : ""
                        }
                        disabled={
                          assetsPending || (!assetsPending && assets.length === 0)
                        }
                      >
                        <SelectTrigger className="h-12 bg-white rounded-md border-muted-foreground/20 shadow-sm">
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
                              (sName === "Dang cho thue" || sName === "Đang cho thuê");
                            
                            return (
                              <SelectItem
                                key={`asset-${a.id}`}
                                value={a.id.toString()}
                              >
                                <div className="flex flex-col items-start text-xs py-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">{a.name}</span>
                                    {a.management_type === "unique" && (
                                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">
                                        Unique
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-muted-foreground opacity-80 mt-0.5">
                                    {a.asset_code} | Holder: {a.holder_name || "N/A"}
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
                        const selAsset = detailField.value ? assets.find(a => a.id === detailField.value) : null;
                        const sName = selAsset?.status_obj?.name || "";
                        const isRestricted = 
                          selAsset?.management_type === "unique" && 
                          (sName === "Dang cho thue" || sName === "Đang cho thuê");
                        
                        if (!isRestricted) return null;

                        return (
                          <div className="mt-1.5 flex items-center gap-2 bg-amber-50/50 border border-amber-100 px-3 py-1.5 rounded-md">
                            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wide">Note:</span>
                            <span className="text-[11px] text-amber-600 font-medium italic">
                              {sName} - không thể bảo trì
                            </span>
                          </div>
                        );
                      })()}
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </div>

              <div>
                <Controller
                  name={`items.${index}.quantity`}
                  control={form.control}
                  render={({ field: qtyField, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest uppercase">
                        Quantity *
                      </FieldLabel>
                      <Input
                        type="number"
                        className="h-12 bg-white text-center font-semibold"
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
                  <Field>
                    <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest uppercase">
                      Return To Location
                    </FieldLabel>
                    <Select
                      onValueChange={(val) => locField.onChange(Number(val))}
                      value={locField.value ? locField.value.toString() : ""}
                    >
                      <SelectTrigger className="h-10 bg-white/50 rounded-md border-muted-foreground/10 text-xs">
                        <SelectValue placeholder="Keep original location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((l) => (
                          <SelectItem key={l.id} value={l.id.toString()} className="text-xs">
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
                  <Field>
                    <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest uppercase">
                      Item Notes
                    </FieldLabel>
                    <Input
                      {...notesField}
                      placeholder="Maintenance detail for this asset..."
                      className="h-10 bg-white/50 rounded-md border-muted-foreground/10 text-xs"
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
