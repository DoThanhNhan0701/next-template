"use client";

import { useTranslations } from "next-intl";

import { RefreshCcw, Trash, User, Warehouse } from "lucide-react";
import {
  Controller,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormReturn,
} from "react-hook-form";

import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { SelectField } from "@/components/common/SelectField";
import { MaintenanceFormValues } from "@/components/schemas/user/maintenance.schema";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { dynamicEndpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { ILocation } from "@/types/location";
import {
  IAssetHolder,
  IAssetStock,
  IPhysicalAsset,
} from "@/types/physical-asset";

interface AssetStockSelectorProps {
  assetId: number;
}

function AssetStockSelector({ assetId }: AssetStockSelectorProps) {
  const { response: stockRes, pending: stockPending } = useGet<IAssetStock[]>(
    { url: dynamicEndpoints.PHYSICAL_ASSET_STOCK(assetId) },
    { disabled: !assetId, deps: [assetId] },
  );

  const { response: holderRes, pending: holderPending } = useGet<
    IAssetHolder[]
  >(
    { url: dynamicEndpoints.PHYSICAL_ASSET_HOLDERS(assetId) },
    { disabled: !assetId, deps: [assetId] },
  );

  const stocks = stockRes || [];
  const holders = holderRes || [];

  if (!assetId) return null;

  return (
    <div className="mt-2 rounded-md border border-border/50 bg-muted/20 p-3">
      <div className="flex flex-wrap gap-2 text-[11px]">
        {stockPending || holderPending ? (
          <>
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-6 w-28 rounded-md bg-muted animate-pulse"
              />
            ))}
          </>
        ) : (
          <>
            {stocks.map((s, i) => (
              <div
                key={`stock-${i}`}
                className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700"
              >
                <Warehouse size={11} />
                <span className="truncate max-w-[140px]">
                  {s.location_name}
                </span>
                <span className="font-semibold">({s.quantity})</span>
              </div>
            ))}

            {holders.map((h, i) => (
              <div
                key={`holder-${i}`}
                className="flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-blue-700"
              >
                <User size={11} />
                <span className="truncate max-w-[140px]">{h.name}</span>
                <span className="font-semibold">({h.quantity})</span>
              </div>
            ))}

            {stocks.length === 0 && holders.length === 0 && (
              <div className="text-[11px] text-muted-foreground">
                Không tìm thấy thông tin tồn kho hoặc người đang sử dụng tài
                sản.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface AssetSelectionSectionProps {
  form: UseFormReturn<MaintenanceFormValues>;
  fields: FieldArrayWithId<MaintenanceFormValues, "items", "id">[];
  append: UseFieldArrayAppend<MaintenanceFormValues, "items">;
  remove: UseFieldArrayRemove;
  assets: IPhysicalAsset[];
  assetsPending: boolean;
  reFetchAssets: () => void;
  locations: ILocation[];
}

export function AssetSelectionSection({
  form,
  fields,
  append,
  remove,
  assets,
  assetsPending,
  reFetchAssets,
  locations,
}: AssetSelectionSectionProps) {
  const t = useTranslations("page_maintenance.form");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            onClick={() => reFetchAssets()}
            disabled={assetsPending}
          >
            <RefreshCcw
              size={12}
              className={assetsPending ? "animate-spin" : ""}
            />
            {t("reload")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs font-semibold"
            onClick={() =>
              append({
                asset_id: 0,
                quantity: 1,
                notes: "",
                from_location_id: 0,
                from_staff_id: 0,
                from_unit_id: 0,
                return_to_location_id: 0,
              })
            }
          >
            {t("add_asset")}
          </Button>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative bg-muted/20 border border-border/40 rounded-lg p-5 space-y-4 transition-all hover:bg-muted/30"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              <Trash size={14} />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-3">
                <Controller
                  name={`items.${index}.asset_id`}
                  control={form.control}
                  render={({ field: detailField, fieldState }) => (
                    <Field className="gap-1">
                      <FieldLabel>{t("select_asset")}</FieldLabel>
                      <SelectField
                        value={detailField.value}
                        disabled={assetsPending}
                        placeholder={t("placeholder_select_asset")}
                        searchable
                        options={assets.map((a) => {
                          const status = a.status_obj?.name ?? "-";
                          const holder = a.holder_name ?? "-";

                          return {
                            value: a.id,
                            label: `${a.name} (${a.asset_code}) | ${status} | ${holder}`,
                            customRender: (
                              <div className="flex flex-col gap-1 py-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-foreground">
                                    {a.name}
                                  </span>
                                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                    {a.asset_code}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">
                                    {status}
                                  </span>
                                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">
                                    {a.management_type}
                                  </span>
                                  <span className="rounded bg-orange-100 px-1.5 py-0.5 text-orange-700">
                                    {holder}
                                  </span>
                                </div>
                              </div>
                            ),
                          };
                        })}
                        onChange={(val) => {
                          detailField.onChange(val);
                          form.setValue(`items.${index}.from_location_id`, 0);
                          form.setValue(`items.${index}.from_staff_id`, 0);
                          form.setValue(`items.${index}.from_unit_id`, 0);
                        }}
                      />
                      <FieldError errors={[fieldState.error]} />
                      {detailField.value > 0 && (
                        <AssetStockSelector assetId={detailField.value} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div>
                <Controller
                  name={`items.${index}.quantity`}
                  control={form.control}
                  render={({ field: qtyField, fieldState }) => (
                    <Field className="gap-1">
                      <FieldLabel>{t("quantity")}</FieldLabel>
                      <FormattedNumberInput
                        {...qtyField}
                        value={qtyField.value as number | string | null}
                        onChange={(val) => qtyField.onChange(val ?? 0)}
                        placeholder={t("placeholder_quantity")}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-dashed border-border/60">
              <Controller
                name={`items.${index}.return_to_location_id`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel>{t("return_location")}</FieldLabel>
                    <p className="text-[10px] text-muted-foreground/70 italic -mt-0.5 mb-1">
                      {t("return_location_hint")}
                    </p>

                    <SelectField
                      options={(locations ?? []).map((l) => ({
                        label: `${l.name} - (${l.code})`,
                        value: l.id,
                      }))}
                      value={field.value as number}
                      onChange={(val) => {
                        field.onChange(Number(val));
                      }}
                      placeholder={t("return_location")}
                    />

                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name={`items.${index}.notes`}
                control={form.control}
                render={({ field: notesField, fieldState }) => (
                  <Field className="gap-1 justify-end">
                    <FieldLabel>{t("item_notes")}</FieldLabel>
                    <Input
                      {...notesField}
                      placeholder={t("placeholder_item_notes")}
                      className="bg-white/50 rounded-md border-muted-foreground/10 text-xs"
                      value={notesField.value || ""}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
