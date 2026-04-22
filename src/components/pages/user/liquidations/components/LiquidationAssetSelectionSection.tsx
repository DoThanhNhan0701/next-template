import { PlusIcon, Trash } from "lucide-react";
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
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { ILocation } from "@/types/location";
import { IPhysicalAsset } from "@/types/physical-asset";

import { LiquidationFormValues } from "../schema";

interface AssetListItemProps {
  index: number;
  form: UseFormReturn<LiquidationFormValues>;
  remove: (index: number) => void;
  isOnlyItem: boolean;
  locations: ILocation[];
}

function AssetListItem({
  index,
  form,
  remove,
  isOnlyItem,
  locations,
}: AssetListItemProps) {
  const selectedLocationId = form.watch(`items.${index}.from_location_id`);

  const { response: assetRes, pending: assetsPending } = useGet<{
    items: IPhysicalAsset[];
  }>(
    {
      url: `${endpoints.PHYSICAL_ASSETS}?location_id=${selectedLocationId}&limit=1000`,
    },
    { disabled: !selectedLocationId, deps: [selectedLocationId] },
  );

  const assets = assetRes?.items || [];

  return (
    <div className="relative bg-muted/20 border border-border/40 rounded-lg p-5 pr-12 space-y-4 transition-all hover:bg-muted/30">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
        onClick={() => remove(index)}
        disabled={isOnlyItem}
      >
        <Trash size={14} />
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
        <Controller
          name={`items.${index}.from_location_id`}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>Locations</FieldLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(Number(val));
                  form.setValue(`items.${index}.asset_id`, 0);
                }}
                value={field.value ? field.value.toString() : ""}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name={`items.${index}.asset_id`}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>Select asset</FieldLabel>
              <Select
                onValueChange={(val) => field.onChange(Number(val))}
                value={field.value ? field.value.toString() : ""}
                disabled={!selectedLocationId || assetsPending}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue
                    placeholder={
                      assetsPending ? "Loading assets..." : "Select asset"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.name} ({a.asset_code}) Quantity:{" "}
                      {a?.current_stock ?? 0}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        <Controller
          name={`items.${index}.quantity`}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>Quantity</FieldLabel>
              <Input
                type="number"
                className="bg-white"
                {...field}
                value={field.value ?? 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name={`items.${index}.unit_value`}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>Unit price</FieldLabel>
              <Input
                type="number"
                className="bg-white"
                {...field}
                value={field.value ?? 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name={`items.${index}.remaining_value`}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>Remaining value</FieldLabel>
              <Input
                type="number"
                className="bg-white"
                {...field}
                value={field.value ?? 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>

      <Controller
        name={`items.${index}.notes`}
        control={form.control}
        render={({ field, fieldState }) => (
          <Field className="gap-1">
            <FieldLabel>Item notes</FieldLabel>
            <Input
              {...field}
              placeholder="Detailed notes for this asset..."
              className="bg-white"
              value={field.value || ""}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </div>
  );
}

interface LiquidationAssetSelectionSectionProps {
  form: UseFormReturn<LiquidationFormValues>;
  fields: FieldArrayWithId<LiquidationFormValues, "items", "id">[];
  append: UseFieldArrayAppend<LiquidationFormValues, "items">;
  remove: UseFieldArrayRemove;
  locations: ILocation[];
}

export function LiquidationAssetSelectionSection({
  form,
  fields,
  append,
  remove,
  locations,
}: LiquidationAssetSelectionSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between border-b border-dashed pb-3">
        <label className="text-xs font-semibold text-primary">
          Select assets for liquidation
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() =>
              append({
                asset_id: 0,
                quantity: 1,
                unit_value: 0,
                remaining_value: 0,
                notes: "",
                from_location_id: 0,
                from_staff_id: 0,
                from_unit_id: 0,
              })
            }
          >
            <PlusIcon size={12} className="mr-1" /> Add asset
          </Button>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        {fields.map((field, index) => (
          <AssetListItem
            key={field.id}
            index={index}
            form={form}
            remove={remove}
            isOnlyItem={fields.length === 1}
            locations={locations}
          />
        ))}
      </div>
    </div>
  );
}
