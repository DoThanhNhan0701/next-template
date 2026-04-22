"use client";

import { useEffect, useMemo, useState } from "react";
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { Trash } from "lucide-react";
import { z } from "zod";

import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { AllocationCreateSchema } from "@/components/schemas/user/allocation.schema";
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
  prefillLocationId,
  prefillAssetId,
}: AllocationItemRowProps) {
  const [warehouseId, setWarehouseId] = useState<number>(
    prefillLocationId ?? 0,
  );

  const { response: assetRes, pending: assetsPending } = useGet<{
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
    setValue(`items.${index}.location_id`, warehouseId);
  }, [warehouseId, index, setValue]);

  useEffect(() => {
    if (prefillAssetId && assets.length > 0) {
      setValue(`items.${index}.asset_id`, prefillAssetId);
    }
  }, [prefillAssetId, assets, index, setValue]);

  return (
    <div className="relative bg-muted/30 border rounded-lg p-3 pr-10 flex flex-row items-start gap-3 shadow-sm transition-all hover:bg-muted/40">
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

      {/* Issuing Warehouse */}
      <Field className="gap-1 flex-1">
        <FieldLabel>Location</FieldLabel>
        <Select
          onValueChange={(val) => {
            const vid = Number(val);
            setWarehouseId(vid);
            setValue(`items.${index}.location_id`, vid);
            setValue(`items.${index}.asset_id`, 0);
          }}
          value={warehouseId ? warehouseId.toString() : ""}
        >
          <SelectTrigger className="h-9 text-xs">
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
      </Field>

      {/* Asset */}
      <Controller
        name={`items.${index}.asset_id`}
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1 flex-1">
            <FieldLabel>Asset</FieldLabel>
            <Select
              onValueChange={(val) => field.onChange(Number(val))}
              value={field.value ? field.value.toString() : ""}
              disabled={!warehouseId}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue
                  placeholder={
                    !warehouseId
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
                    {a.name} ({a.asset_code}) Qty: {a?.in_stock_quantity ?? 0}
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
          <Field className="gap-1 w-24">
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
