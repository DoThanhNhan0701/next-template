"use client";

import { useTranslations } from "next-intl";

import { PlusIcon, RefreshCcw, Trash } from "lucide-react";
import {
  Controller,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormReturn,
} from "react-hook-form";

import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { TransferFormValues } from "@/components/schemas/user/transfer.schema";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IPhysicalAsset } from "@/types/physical-asset";

interface AssetSelectionSectionProps {
  form: UseFormReturn<TransferFormValues>;
  fields: FieldArrayWithId<TransferFormValues, "details", "id">[];
  append: UseFieldArrayAppend<TransferFormValues, "details">;
  remove: UseFieldArrayRemove;
  assets: IPhysicalAsset[];
  assetsPending: boolean;
  reFetchAssets: () => void;
  watchedType: "holder" | "location";
}

export function AssetSelectionSection({
  form,
  fields,
  append,
  remove,
  assets,
  assetsPending,
  reFetchAssets,
  watchedType,
}: AssetSelectionSectionProps) {
  const t = useTranslations("page_transfers");
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wider">
          <span>{t("form.assets_selection")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
            onClick={() => reFetchAssets()}
            disabled={assetsPending}
          >
            <RefreshCcw
              size={14}
              className={assetsPending ? "animate-spin" : ""}
            />
            {t("form.reload_assets")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => append({ asset_id: 0, quantity: 1 })}
          >
            <PlusIcon size={12} className="mr-1" /> {t("form.add_asset")}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative bg-muted/30 border rounded-lg p-3 flex flex-row items-start gap-3"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6 text-red-500 hover:bg-red-50"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              <Trash size={12} />
            </Button>

            <div className="flex-1 space-y-1">
              <FieldGroup className="gap-3">
                <Controller
                  name={`details.${index}.asset_id`}
                  control={form.control}
                  render={({ field: detailField, fieldState }) => (
                    <Field className="gap-1">
                      <FieldLabel>{t("form.select_asset")}</FieldLabel>
                      <Select
                        onValueChange={(val) =>
                          detailField.onChange(val === "none" ? 0 : Number(val))
                        }
                        value={
                          detailField.value ? detailField.value.toString() : undefined
                        }
                        disabled={
                          assetsPending ||
                          (!assetsPending && assets.length === 0)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              assetsPending
                                ? t("form.loading")
                                : assets.length === 0
                                  ? t("form.no_assets")
                                  : t("form.select_asset")
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="text-muted-foreground italic">
                            {t("filters.none")}
                          </SelectItem>
                          {assets.map((a) => (
                            <SelectItem
                              key={`asset-${a.id}`}
                              value={a.id.toString()}
                            >
                              {a.name} ({a.asset_code}) {t("form.quantity")}:{" "}
                              {watchedType === "holder"
                                ? (a?.holding_qty ?? 0)
                                : (a?.current_stock ?? 0)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            <div className="w-32 space-y-1 text-center">
              <FieldGroup className="gap-3">
                <Controller
                  name={`details.${index}.quantity`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1">
                      <FieldLabel>{t("form.quantity")}</FieldLabel>
                      <FormattedNumberInput
                        {...field}
                        value={field.value as number | string | null}
                        onChange={(val) => field.onChange(val ?? 0)}
                        placeholder={t("form.placeholder_quantity")}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
