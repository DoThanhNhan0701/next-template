import { PlusIcon, Trash } from "lucide-react";
import {
  UseFormReturn,
  Controller,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
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
import { LiquidationFormValues } from "../schema";
import { IPhysicalAsset } from "@/types/physical-asset";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { ILocation } from "@/types/location";

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name={`items.${index}.from_location_id`}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                Chọn kho *
              </FieldLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(Number(val));
                  form.setValue(`items.${index}.asset_id`, 0);
                }}
                value={field.value ? field.value.toString() : ""}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Chọn kho chứa" />
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
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                Chọn tài sản *
              </FieldLabel>
              <Select
                onValueChange={(val) => field.onChange(Number(val))}
                value={field.value ? field.value.toString() : ""}
                disabled={!selectedLocationId || assetsPending}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue
                    placeholder={
                      assetsPending ? "Đang tải tài sản..." : "Chọn tài sản"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.name} ({a.asset_code}) Quantity: {a?.holding_qty ?? 0}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Controller
          name={`items.${index}.quantity`}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                Số lượng *
              </FieldLabel>
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
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                Đơn giá (VND)
              </FieldLabel>
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
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                Giá trị còn lại
              </FieldLabel>
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
            <FieldLabel className="text-xs font-semibold text-muted-foreground">
              Ghi chú item
            </FieldLabel>
            <Input
              {...field}
              placeholder="Ghi chú chi tiết cho tài sản này..."
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-dashed pb-3">
        <label className="text-xs font-semibold text-primary">
          Chọn tài sản thanh lý
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold"
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
            <PlusIcon size={12} className="mr-1" /> Thêm dòng
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
