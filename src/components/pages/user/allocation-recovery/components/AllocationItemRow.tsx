"use client";

import { useEffect, useMemo } from "react";

import { useTranslations } from "next-intl";

import { Trash } from "lucide-react";
import {
  Control,
  Controller,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { z } from "zod";

import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { SelectField } from "@/components/common/SelectField";
import { AllocationCreateSchema } from "@/components/schemas/user/allocation.schema";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { ILocation } from "@/types/location";
import { IPhysicalAsset } from "@/types/physical-asset";

type AllocationFormValues = z.input<typeof AllocationCreateSchema>;

interface AllocationItemRowProps {
  disabled: boolean;
  index: number;
  control: Control<AllocationFormValues>;
  setValue: UseFormSetValue<AllocationFormValues>;
  locations: ILocation[];
  onRemove: () => void;
  prefillLocationId?: number;
  prefillAssetId?: number;
}

export function AllocationItemRow({
  disabled,
  index,
  control,
  setValue,
  locations,
  onRemove,
  prefillAssetId,
}: AllocationItemRowProps) {
  const t = useTranslations("page_allocation_recovery");
  const warehouseId = useWatch({
    control,
    name: `items.${index}.location_id`,
  }) as number;

  const { response: assetRes } = useGet<{
    items: IPhysicalAsset[];
  }>(
    {
      url: endpoints.PHYSICAL_ASSETS,
      config: {
        params: { location_id: warehouseId, limit: 200, status_code: "READY" },
      },
    },
    { disabled: !warehouseId, deps: [warehouseId] },
  );

  const assets = useMemo(() => assetRes?.items || [], [assetRes?.items]);

  useEffect(() => {
    if (prefillAssetId && assets.length > 0) {
      setValue(`items.${index}.asset_id`, prefillAssetId);
    }
  }, [prefillAssetId, assets, index, setValue]);

  return (
    <div className="relative bg-muted/30 border rounded-lg p-3 shadow-sm transition-all hover:bg-muted/40">
      {/* Delete button */}
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

      <div className="flex flex-col sm:flex-row sm:items-start gap-3 pr-7">
        {/* Issuing Warehouse */}
        <Controller
          name={`items.${index}.location_id`}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1 flex-1 min-w-0">
              <FieldLabel>{t("form.location")}</FieldLabel>
              <SelectField
                options={(locations ?? []).map((l) => ({
                  label: `${l.name} - (${l.code})`,
                  value: l.id,
                }))}
                value={field.value as number}
                onChange={(val) => {
                  field.onChange(Number(val));
                  setValue(`items.${index}.asset_id`, 0);
                }}
                placeholder={t("form.placeholder_location")}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Asset */}
        <Controller
          name={`items.${index}.asset_id`}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1 flex-1 min-w-0">
              <FieldLabel>{t("form.asset")}</FieldLabel>
              <SelectField
                options={(assets ?? []).map((a) => ({
                  label: `${a.name} - (${a.asset_code}) Quantity: ${a?.in_stock_quantity ?? 0}`,
                  value: a.id,
                }))}
                value={field.value as number}
                onChange={(val) => field.onChange(Number(val))}
                placeholder={t("form.placeholder_asset")}
                disabled={!warehouseId}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Quantity */}
        <Controller
          name={`items.${index}.quantity`}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1 sm:w-32">
              <FieldLabel>{t("form.quantity")}</FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value as number | string | null}
                onChange={(val) => field.onChange(val ?? 0)}
                placeholder={t("form.placeholder_quantity_value")}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </div>
  );
}
