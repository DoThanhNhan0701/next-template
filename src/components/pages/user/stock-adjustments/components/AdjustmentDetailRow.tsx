"use client";

import { useTranslations } from "next-intl";

import { Trash } from "lucide-react";
import {
  Control,
  Controller,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";

import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { StockAdjustmentFormValues } from "@/components/schemas/user/stock-adjustment.schema";
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

interface AdjustmentDetailRowProps {
  disabled: boolean;
  index: number;
  control: Control<StockAdjustmentFormValues>;
  setValue: UseFormSetValue<StockAdjustmentFormValues>;
  locations: ILocation[];
  onRemove: () => void;
  selectedAssetIds: number[];
}

export function AdjustmentDetailRow({
  disabled,
  index,
  control,
  setValue,
  locations,
  onRemove,
  selectedAssetIds,
}: AdjustmentDetailRowProps) {
  const t = useTranslations("page_stock_in_out");

  const locationId = useWatch({
    control,
    name: `details.${index}.location_id`,
  });

  const { response: assetRes, pending: assetsPending } = useGet<{
    items: IPhysicalAsset[];
  }>(
    {
      url: endpoints.PHYSICAL_ASSETS,
      config: {
        params: { location_id: locationId, limit: 200, status_code: "READY" },
      },
    },
    { disabled: !locationId || locationId === 0, deps: [locationId] },
  );

  const assets = assetRes?.items || [];

  const currentAssetId = useWatch({
    control,
    name: `details.${index}.asset_id`,
  });

  const filteredAssets = assets.filter(
    (a) => !selectedAssetIds.includes(a.id) || a.id === currentAssetId,
  );

  return (
    <div className="relative bg-muted/30 border rounded-lg p-3 flex flex-row flex-wrap items-start gap-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        className="absolute right-1 top-1 h-6 w-6 text-red-500 hover:bg-red-50"
        onClick={onRemove}
      >
        <Trash size={12} />
      </Button>

      <Controller
        name={`details.${index}.location_id`}
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1 flex-1 min-w-[140px]">
            <FieldLabel>{t("form.location")}</FieldLabel>
            <Select
              onValueChange={(val) => {
                field.onChange(val === "none" ? 0 : Number(val));
                setValue(`details.${index}.asset_id`, 0);
              }}
              value={field.value ? field.value.toString() : ""}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.select_location")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="none"
                  className="text-muted-foreground italic"
                >
                  {t("form.none")}
                </SelectItem>
                {locations.map((l) => (
                  <SelectItem key={l.id} value={l.id.toString()}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name={`details.${index}.asset_id`}
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1 flex-1 min-w-[160px]">
            <FieldLabel>{t("form.asset")}</FieldLabel>
            <Select
              onValueChange={(val) =>
                field.onChange(val === "none" ? 0 : Number(val))
              }
              value={field.value ? field.value.toString() : ""}
              disabled={!locationId || locationId === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !locationId || locationId === 0
                      ? t("form.select_location")
                      : assetsPending
                        ? t("form.loading")
                        : assets.length === 0
                          ? t("form.no_assets")
                          : t("form.select_asset")
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
                {filteredAssets.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.name} ({a.asset_code}) {t("form.quantity")}:{" "}
                    {a?.current_stock ?? 0}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name={`details.${index}.adjustment_type`}
        control={control}
        render={({ field }) => (
          <Field className="gap-1 w-32">
            <FieldLabel>{t("form.type")}</FieldLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCREASE">
                  <span className="text-green-600 font-medium">↑ {t("table.increase")}</span>
                </SelectItem>
                <SelectItem value="DECREASE">
                  <span className="text-red-500 font-medium">↓ {t("table.decrease")}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <Controller
        name={`details.${index}.quantity_diff`}
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1 w-32">
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

      <Controller
        name={`details.${index}.notes`}
        control={control}
        render={({ field }) => (
          <Field className="gap-1 w-full">
            <FieldLabel>{t("form.notes")}</FieldLabel>
            <Input
              {...field}
              value={field.value ?? ""}
              placeholder={t("form.optional")}
            />
          </Field>
        )}
      />
    </div>
  );
}
