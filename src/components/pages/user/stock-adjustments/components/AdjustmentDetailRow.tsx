"use client";

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
}

export function AdjustmentDetailRow({
  disabled,
  index,
  control,
  setValue,
  locations,
  onRemove,
}: AdjustmentDetailRowProps) {
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
            <FieldLabel>Location</FieldLabel>
            <Select
              onValueChange={(v) => {
                field.onChange(Number(v));
                setValue(`details.${index}.asset_id`, 0);
              }}
              value={field.value ? field.value.toString() : ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
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
            <FieldLabel>Asset</FieldLabel>
            <Select
              onValueChange={(v) => field.onChange(Number(v))}
              value={field.value ? field.value.toString() : ""}
              disabled={!locationId || locationId === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !locationId || locationId === 0
                      ? "Select location"
                      : assetsPending
                        ? "Loading..."
                        : assets.length === 0
                          ? "No assets found"
                          : "Select asset"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.name} ({a.asset_code}) Quantity: {a?.current_stock ?? 0}
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
            <FieldLabel>Type</FieldLabel>
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
                  <span className="text-green-600 font-medium">↑ Increase</span>
                </SelectItem>
                <SelectItem value="DECREASE">
                  <span className="text-red-500 font-medium">↓ Decrease</span>
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
            <FieldLabel>Quantity</FieldLabel>
            <FormattedNumberInput
              {...field}
              value={field.value as number | string | null}
              onChange={(val) => field.onChange(val ?? 0)}
              placeholder="e.g. 1"
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
            <FieldLabel>Notes</FieldLabel>
            <Input
              {...field}
              value={field.value ?? ""}
              placeholder="Optional"
            />
          </Field>
        )}
      />
    </div>
  );
}
