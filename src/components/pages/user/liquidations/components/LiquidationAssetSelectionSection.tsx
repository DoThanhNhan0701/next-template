import { useTranslations } from "next-intl";

import { Trash } from "lucide-react";
import {
  Controller,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormReturn,
} from "react-hook-form";

import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { SelectField } from "@/components/common/SelectField";
import { LiquidationFormValues } from "@/components/schemas/user/liquidation.schema";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { ILocation } from "@/types/location";
import { IPhysicalAsset } from "@/types/physical-asset";

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
  const t = useTranslations("page_liquidations.form");
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
              <FieldLabel>{t("location")}</FieldLabel>

              <SelectField
                options={(locations ?? []).map((a) => ({
                  label: `${a.name} - (${a.code})`,
                  value: a.id,
                }))}
                value={field.value as number}
                onChange={(val) => field.onChange(Number(val))}
                placeholder={t("placeholder_location")}
              />

              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name={`items.${index}.asset_id`}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("asset")}</FieldLabel>

              <SelectField
                options={(assets ?? []).map((a) => ({
                  label: `${a.name} - (${a.asset_code}) Quantity: ${a?.current_stock ?? 0}`,
                  value: a.id,
                }))}
                value={field.value as number}
                onChange={(val) => field.onChange(Number(val))}
                placeholder={t("placeholder_asset")}
                disabled={!selectedLocationId || assetsPending}
              />

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
              <FieldLabel>{t("quantity")}</FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value ?? 0}
                onChange={(val) => field.onChange(val ?? 0)}
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
              <FieldLabel>{t("unit_price")}</FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value ?? 0}
                onChange={(val) => field.onChange(val ?? 0)}
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
              <FieldLabel>{t("remaining_value")}</FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value ?? 0}
                onChange={(val) => field.onChange(val ?? 0)}
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
            <FieldLabel>{t("item_notes")}</FieldLabel>
            <Input
              {...field}
              placeholder={t("placeholder_item_notes")}
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
  const t = useTranslations("page_liquidations.form");
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end">
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
            {t("add_asset")}
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
