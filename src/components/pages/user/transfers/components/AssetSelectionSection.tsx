"use client";

import { Box, PlusIcon, RefreshCcw, Trash } from "lucide-react";
import {
  Controller,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormReturn,
} from "react-hook-form";

import { TransferFormValues } from "@/components/schemas/user/transfer.schema";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IPhysicalAsset } from "@/types/physical-asset";

interface AssetSelectionSectionProps {
  form: UseFormReturn<TransferFormValues>;
  fields: FieldArrayWithId<TransferFormValues, "details", "id">[];
  append: UseFieldArrayAppend<TransferFormValues, "details">;
  remove: UseFieldArrayRemove;
  assets: IPhysicalAsset[];
  assetsPending: boolean;
  reFetchAssets: () => void;
  watchedType: "holder" | "location";
}

export function AssetSelectionSection({
  form,
  fields,
  append,
  remove,
  assets,
  assetsPending,
  reFetchAssets,
  watchedType,
}: AssetSelectionSectionProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wider">
          <Box size={20} />
          <span>2. Assets Selection</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
            onClick={() => reFetchAssets()}
            disabled={assetsPending}
          >
            <RefreshCcw
              size={14}
              className={assetsPending ? "animate-spin" : ""}
            />
            Reload Assets
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => append({ asset_id: 0, quantity: 1 })}
          >
            <PlusIcon size={12} className="mr-1" /> Add Asset
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative bg-muted/30 border rounded-lg p-3 pr-10 flex flex-row items-start gap-3"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6 text-red-500 hover:bg-red-50"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              <Trash size={12} />
            </Button>

            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground tracking-wider block">
                Select Asset *
              </label>
              <Controller
                name={`details.${index}.asset_id`}
                control={form.control}
                render={({ field: detailField, fieldState }) => (
                  <div className="space-y-1">
                    <Select
                      onValueChange={(val) => detailField.onChange(Number(val))}
                      value={
                        detailField.value ? detailField.value.toString() : ""
                      }
                      disabled={
                        assetsPending || (!assetsPending && assets.length === 0)
                      }
                    >
                      <SelectTrigger className="h-9 text-xs w-full">
                        <SelectValue
                          placeholder={
                            assetsPending
                              ? "Loading..."
                              : assets.length === 0
                                ? "No assets available"
                                : "Select asset"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {assets.map((a) => (
                          <SelectItem
                            key={`asset-${a.id}`}
                            value={a.id.toString()}
                          >
                            {a.name} ({a.asset_code}) Quantity:{" "}
                            {watchedType === "holder"
                              ? (a?.holding_qty ?? 0)
                              : (a?.current_stock ?? 0)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </div>
                )}
              />
            </div>

            <div className="w-24 space-y-1 text-center">
              <label className="text-[11px] font-semibold text-muted-foreground tracking-wider block">
                Quantity *
              </label>
              <Controller
                name={`details.${index}.quantity`}
                control={form.control}
                render={({ field: qtyField, fieldState }) => (
                  <div className="space-y-1">
                    <Input
                      type="number"
                      className="h-9 text-xs text-center"
                      {...qtyField}
                      onChange={(e) =>
                        qtyField.onChange(Number(e.target.value))
                      }
                    />
                    <FieldError errors={[fieldState.error]} />
                  </div>
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
