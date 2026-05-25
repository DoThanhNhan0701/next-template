"use client";

import { useEffect, useMemo } from "react";

import { useTranslations } from "next-intl";

import { Trash } from "lucide-react";
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { z } from "zod";

import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { SelectField } from "@/components/common/SelectField";
import { RecoveryCreateSchema } from "@/components/schemas/user/recovery.schema";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { ILocation } from "@/types/location";
import { IPhysicalAsset } from "@/types/physical-asset";

type RecoveryFormValues = z.input<typeof RecoveryCreateSchema>;

interface RecoveryItemRowProps {
  disabled?: boolean;
  index: number;
  control: Control<RecoveryFormValues>;
  setValue: UseFormSetValue<RecoveryFormValues>;
  locations: ILocation[];
  unitId: number;
  staffId: string | null;
  onRemove: () => void;
  prefillAssetId?: number;
}

export function RecoveryItemRow({
  disabled,
  index,
  control,
  setValue,
  locations,
  unitId,
  staffId,
  onRemove,
  prefillAssetId,
}: RecoveryItemRowProps) {
  const t = useTranslations("page_allocation_recovery");
  const { response: assetRes, pending: assetsPending } = useGet<{
    items: IPhysicalAsset[];
  }>(
    {
      url: endpoints.PHYSICAL_ASSETS,
      config: {
        params: {
          ...(staffId ? { staff_id: staffId } : { unit_id: unitId }),
        },
      },
    },
    { disabled: !unitId && !staffId, deps: [unitId, staffId] },
  );

  const assets = useMemo(() => assetRes?.items || [], [assetRes?.items]);

  useEffect(() => {
    if (!prefillAssetId || assetsPending || !assets.length) return;
    setValue(`items.${index}.asset_id`, prefillAssetId);
  }, [prefillAssetId, assetsPending, assets, index, setValue]);

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
        {/* Asset */}
        <Controller
          name={`items.${index}.asset_id`}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1 flex-1 min-w-0">
              <FieldLabel>{t("form.asset")}</FieldLabel>
              <SelectField
                options={(assets ?? []).map((a) => ({
                  label: `${a.name} - (${a.asset_code}) Quantity: ${a?.holding_qty ?? 0}`,
                  value: a.id,
                }))}
                value={field.value as number}
                onChange={(val) => field.onChange(Number(val))}
                placeholder={t("form.placeholder_asset")}
                disabled={!unitId}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Location */}
        <Controller
          name={`items.${index}.location_id`}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1 flex-1 min-w-0">
              <FieldLabel>{t("form.location")}</FieldLabel>
              <SelectField
                options={(locations ?? []).map((a) => ({
                  label: `${a.name} - (${a.code})`,
                  value: a.id,
                }))}
                value={field.value as number}
                onChange={(val) => field.onChange(Number(val))}
                placeholder={t("form.placeholder_location")}
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
                className="h-9 text-xs font-medium"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </div>
  );
}
