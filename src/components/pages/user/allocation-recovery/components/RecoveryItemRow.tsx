"use client";

import { useEffect, useMemo } from "react";

import { Trash } from "lucide-react";
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { z } from "zod";

import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { RecoveryCreateSchema } from "@/components/schemas/user/recovery.schema";
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
    <div className="relative bg-muted/30 border rounded-lg p-3 flex flex-row items-start gap-3 shadow-sm transition-all hover:bg-muted/40">
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

      {/* Asset */}
      <Controller
        name={`items.${index}.asset_id`}
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1 flex-1">
            <FieldLabel>Asset</FieldLabel>
            <Select
              onValueChange={(val) => {
                const aid = Number(val);
                field.onChange(aid);
                const selectedAsset = assets.find((a) => a.id === aid);
                if (selectedAsset?.location_id) {
                  setValue(
                    `items.${index}.location_id`,
                    selectedAsset.location_id,
                  );
                }
              }}
              value={field.value ? field.value.toString() : ""}
              disabled={!unitId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !unitId
                      ? "Select unit first"
                      : assetsPending
                        ? "Loading..."
                        : "Select asset"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a: IPhysicalAsset) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.name} ({a.asset_code}) Qty: {a?.holding_qty ?? 0}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Recovering Locations */}
      <Controller
        name={`items.${index}.location_id`}
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1 flex-1">
            <FieldLabel>Location</FieldLabel>
            <Select
              onValueChange={(val) => field.onChange(Number(val))}
              value={field.value ? field.value.toString() : ""}
            >
              <SelectTrigger>
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
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Quantity */}
      <Controller
        name={`items.${index}.quantity`}
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1 w-32">
            <FieldLabel>Quantity</FieldLabel>
            <FormattedNumberInput
              {...field}
              value={field.value as number | string | null}
              onChange={(val) => field.onChange(val ?? 0)}
              placeholder="e.g. 1"
              className="h-9 text-xs font-medium"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </div>
  );
}
