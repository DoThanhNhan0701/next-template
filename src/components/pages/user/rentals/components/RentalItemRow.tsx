"use client";

import { useTranslations } from "next-intl";
import { Trash } from "lucide-react";
import { type Control, Controller, type UseFormSetValue, useWatch } from "react-hook-form";
import { z } from "zod";

import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { RentalCreateSchema } from "@/components/schemas/user/rental.schema";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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

type RentalFormValues = z.input<typeof RentalCreateSchema>;

interface RentalItemRowProps {
  index: number;
  disabled: boolean;
  control: Control<RentalFormValues>;
  setValue: UseFormSetValue<RentalFormValues>;
  locations: ILocation[];
  onRemove: () => void;
  selectedAssetIds?: number[];
}

export function RentalItemRow({
  disabled,
  index,
  control,
  setValue,
  locations,
  onRemove,
  selectedAssetIds = [],
}: RentalItemRowProps) {
  const t = useTranslations("page_rentals");
  const locationId = useWatch({
    control,
    name: `items.${index}.from_location_id`,
  });

  const currentAssetId = useWatch({
    control,
    name: `items.${index}.asset_id`,
  });

  const { response: assetRes, pending: assetsPending } = useGet<{
    items: IPhysicalAsset[];
  }>(
    {
      url: endpoints.PHYSICAL_ASSETS,
      config: {
        params: {
          location_id: locationId,
          status_code: "READY",
        },
      },
    },
    { disabled: !locationId, deps: [locationId] },
  );

  const assets = (assetRes?.items || []).filter(
    (a) => a.id === currentAssetId || !selectedAssetIds.includes(a.id),
  );

  return (
    <div className="bg-muted/30 border rounded-lg p-3 flex items-end gap-2">
      <div className="grid grid-cols-[0.7fr_1.3fr_110px_110px] gap-2 flex-1">
        {/* Location */}
        <Field className="gap-1 min-w-0">
          <FieldLabel>{t("form.location")}</FieldLabel>
          <Select
            onValueChange={(val) => {
              setValue(
                `items.${index}.from_location_id`,
                val === "none" ? 0 : Number(val),
              );
              setValue(`items.${index}.asset_id`, 0);
            }}
            value={locationId ? locationId.toString() : ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("form.placeholder_location")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-muted-foreground italic">
                {t("form.none")}
              </SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id.toString()}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Asset */}
        <Controller
          name={`items.${index}.asset_id`}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1 min-w-0">
              <FieldLabel>{t("form.asset")}</FieldLabel>
              <Select
                onValueChange={(val) =>
                  field.onChange(val === "none" ? 0 : Number(val))
                }
                value={field.value ? field.value.toString() : ""}
                disabled={!locationId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      !locationId
                        ? t("form.placeholder_select_location_first")
                        : assetsPending
                          ? t("form.placeholder_loading")
                          : t("form.placeholder_select_asset")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="none"
                    className="text-muted-foreground italic"
                  >
                    {t("form.none")}
                  </SelectItem>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.name} ({a.asset_code}) Quantity:{" "}
                      {a?.current_stock ?? 0}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Quantity */}
        <Controller
          name={`items.${index}.quantity`}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("form.quantity")}</FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value as number | string | null}
                onChange={(val) => field.onChange(val ?? 0)}
                placeholder={t("form.placeholder_quantity")}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Revenue */}
        <Controller
          name={`items.${index}.rental_revenue`}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("form.item_revenue")}</FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value as number | string | null}
                onChange={(val) => field.onChange(val ?? 0)}
                placeholder={t("form.placeholder_item_revenue")}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      {/* Delete */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        className="h-9 w-9 shrink-0 text-red-500 hover:bg-red-50"
        onClick={onRemove}
      >
        <Trash size={14} />
      </Button>
    </div>
  );
}
