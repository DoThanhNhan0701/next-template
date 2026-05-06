"use client";

import { useTranslations } from "next-intl";
import { type Control, type UseFormSetValue, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";

import { RentalCreateSchema } from "@/components/schemas/user/rental.schema";
import { Button } from "@/components/ui/button";
import { ILocation } from "@/types/location";

import { RentalItemRow } from "./RentalItemRow";

type RentalFormValues = z.input<typeof RentalCreateSchema>;

interface RentalAssetsSectionProps {
  control: Control<RentalFormValues>;
  setValue: UseFormSetValue<RentalFormValues>;
  locations: ILocation[];
}

export function RentalAssetsSection({
  control,
  setValue,
  locations,
}: RentalAssetsSectionProps) {
  const t = useTranslations("page_rentals");
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({
    control,
    name: "items",
  }) as RentalFormValues["items"];

  const selectedAssetIds = (watchedItems || [])
    .map((item) => item?.asset_id)
    .filter((id): id is number => !!id);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b pb-1">
        <h3 className="text-sm font-semibold text-primary">
          {t("form.rental_assets")}
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() =>
            append({
              asset_id: 0,
              quantity: 1,
              from_location_id: 0,
              rental_revenue: 0,
              lessee_location: "",
            })
          }
        >
          {t("form.btn_add_asset")}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {fields.map((item, index) => (
          <RentalItemRow
            disabled={fields.length === 1}
            key={item.id}
            index={index}
            control={control}
            setValue={setValue}
            locations={locations}
            onRemove={() => remove(index)}
            selectedAssetIds={selectedAssetIds}
          />
        ))}
      </div>
    </div>
  );
}
