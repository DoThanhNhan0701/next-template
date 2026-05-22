"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Package } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { DatePickerField } from "@/components/common/DatePickerField";
import { FormAttachmentsSection } from "@/components/common/FormAttachmentsSection";
import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { SelectField } from "@/components/common/SelectField";
import { PhysicalAssetSchema } from "@/components/schemas/user/physical-asset.schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { ICatalogType } from "@/types/catalog-type";
import { ILocation } from "@/types/location";
import { IOrgUnit } from "@/types/org";
import { IPhysicalAsset } from "@/types/physical-asset";
import { IStaff } from "@/types/staff";
import { ISupplier } from "@/types/supplier";
import { IUsageMode } from "@/types/usage-mode";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { getTodayISO } from "@/utils/date";
import { cleanFormData } from "@/utils/form";

interface Props {
  assetToEdit?: IPhysicalAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: unknown, method?: "post" | "patch" | "delete") => void;
}

export default function AssetFormModal({
  assetToEdit,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const t = useTranslations("page_physical_assets");
  const isEditing = !!assetToEdit;
  const { mutate, pending } = useMutation();

  // Fetch metadata
  const { response: importanceRes } = useGet<
    { id: number; code: string; name: string; color: string }[]
  >({ url: endpoints.IMPORTANCES }, { disabled: !isOpen });
  const { response: locationRes } = useGet<ILocation[]>(
    {
      url: endpoints.LOCATIONS,
    },
    { disabled: !isOpen },
  );
  const { response: supplierRes } = useGet<ISupplier[]>(
    {
      url: endpoints.SUPPLIERS,
    },
    { disabled: !isOpen },
  );

  const { response: catalogRes } = useGet<ICatalogType[]>(
    {
      url: endpoints.CATALOG_TYPES,
    },
    { disabled: !isOpen },
  );
  const { response: usageModeRes } = useGet<IUsageMode[]>(
    {
      url: endpoints.USAGE_MODES,
    },
    { disabled: !isOpen },
  );

  const { response: orgRes } = useGet<IOrgUnit[]>(
    { url: endpoints.ORG_UNITS },
    { disabled: !isOpen },
  );
  const { response: staffRes } = useGet<{ items: IStaff[] }>(
    { url: endpoints.STAFFS },
    { disabled: !isOpen },
  );

  const locations = locationRes || [];
  const suppliers = supplierRes || [];
  const categories = catalogRes || [];
  const usageModes = usageModeRes || [];
  const orgUnits = orgRes || [];
  const staffs = staffRes?.items || [];
  const importances = importanceRes || [];

  const form = useForm({
    resolver: zodResolver(PhysicalAssetSchema),
    defaultValues: {
      asset_code: "",
      name: "",
      serial_number: "",
      model: "",
      request_ticket: "",
      importance_id: 2,
      cost: 0,
      quantity: null as number | null,
      measure_unit_id: 1,
      status_id: 1,
      notes: "",
      specifications: "",
      purchase_date: "",
      purchase_ticket: "",
      warranty_expiration: "",
      system_declaration_date: getTodayISO(),
      holder_id: null,
      holder_name: "",
      category_id: null,
      supplier_id: null,
      location_id: null,
      usage_mode_id: null,
      manager_id: null,
      staff_id: null,
      location: "",
      old_code: "",
      owner: "",
      unit_id: null,
      management_type: "unique" as const,
      attachments: [],
    },
  });

  const watchedLocationId = useWatch({
    control: form.control,
    name: "location_id",
  });
  const watchedLocation = useWatch({ control: form.control, name: "location" });
  const watchedStaffId = useWatch({ control: form.control, name: "staff_id" });
  const watchedUnitId = useWatch({ control: form.control, name: "unit_id" });
  const watchedManagementMethod = useWatch({
    control: form.control,
    name: "management_type",
  });

  const hasLocationValue = !!watchedLocationId || !!watchedLocation;
  const hasHolderValue = !!watchedStaffId;

  useEffect(() => {
    if (isOpen) {
      if (assetToEdit) {
        form.reset({
          ...assetToEdit,
          purchase_date: assetToEdit.purchase_date?.split("T")[0] || "",
          system_declaration_date:
            assetToEdit.system_declaration_date?.split("T")[0] || "",
          warranty_expiration:
            assetToEdit.warranty_expiration?.split("T")[0] || "",
          measure_unit_id: assetToEdit.measure_unit_id || 0,
          holder_id: assetToEdit.holder_id,
          holder_name: assetToEdit.holder_name || "",
          category_id: assetToEdit.category_id,
          unit_id: assetToEdit.unit_id,
          staff_id: assetToEdit.staff_id,
          management_type: assetToEdit.management_type || "unique",
          attachments: assetToEdit.attachments || [],
        } as unknown as z.infer<typeof PhysicalAssetSchema>);
      } else {
        form.reset({
          asset_code: "",
          name: "",
          serial_number: "",
          model: "",
          request_ticket: "",
          importance_id: 2,
          cost: 0,
          quantity: null,
          measure_unit_id: 1,
          status_id: 1,
          notes: "",
          specifications: "",
          purchase_date: "",
          purchase_ticket: "",
          warranty_expiration: "",
          system_declaration_date: getTodayISO(),
          supplier_id: null,
          category_id: null,
          location_id: null,
          usage_mode_id: null,
          holder_id: null,
          holder_name: "",
          manager_id: null,
          location: "",
          old_code: "",
          owner: "",
          unit_id: null,
          staff_id: null,
          management_type: "unique",
          attachments: [],
        } as unknown as z.infer<typeof PhysicalAssetSchema>);
      }
    }
  }, [isOpen, assetToEdit, form]);

  const onSubmit = async (data: z.infer<typeof PhysicalAssetSchema>) => {
    const url = isEditing
      ? dynamicEndpoints.PHYSICAL_ASSET_DETAIL(assetToEdit.id)
      : endpoints.PHYSICAL_ASSETS;
    const method = isEditing ? "patch" : "post";

    // Clean up data: exclude keys with "", null, undefined, or empty arrays
    const rawData = {
      ...data,
      purchase_date: data.purchase_date || null,
      system_declaration_date: data.system_declaration_date || null,
      warranty_expiration: data.warranty_expiration || null,
      purchase_ticket: data.purchase_ticket || null,
      request_ticket: data.request_ticket || null,
      staff_id: data.staff_id || null,
      old_code: data.old_code || null,
      unit_id: data.unit_id ?? 0,
      measure_unit_id: data.measure_unit_id ?? 0,
      initial_location_id: isEditing
        ? undefined
        : data.staff_id
          ? undefined
          : data.location_id || undefined,
    };

    const cleanedData = cleanFormData(rawData);

    await mutate(
      {
        url,
        method,
        body: cleanedData,
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          onSuccess(res, method);
          onClose();
        },
        onError: (err) => {
          getApiErrorMessage(err);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>
            {isEditing ? t("modals.edit_title") : t("modals.create_title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? t("modals.edit_description")
              : t("modals.create_description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="flex flex-col gap-3">
              {/* Section: General Information */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">
                  {t("modals.sections.general")}
                </h3>
                <FieldGroup className="grid grid-cols-2 gap-3">
                  <Controller
                    name="management_type"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-2 col-span-2">
                        <FieldLabel>
                          {t("modals.fields.management_method")}
                        </FieldLabel>
                        <Tabs
                          value={field.value}
                          onValueChange={(val) => {
                            field.onChange(val);
                            if (val === "unique") {
                              form.setValue("quantity", 1);
                            } else {
                              form.setValue("serial_number", "");
                              form.setValue("quantity", null);
                            }
                          }}
                          className="w-full"
                        >
                          <TabsList className="grid w-full grid-cols-2 h-16 p-1 bg-muted/30">
                            <TabsTrigger
                              value="unique"
                              disabled={isEditing}
                              className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm disabled:opacity-50"
                            >
                              <CircleAlert className="w-4 h-4" />
                              <span className="text-xs font-medium">
                                {t("modals.fields.unique")}
                              </span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="bulk"
                              disabled={isEditing}
                              className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm disabled:opacity-50"
                            >
                              <Package className="w-4 h-4" />
                              <span className="text-xs font-medium">
                                {t("modals.fields.bulk")}
                              </span>
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                        <div
                          className={`mt-3 flex items-start gap-2 text-xs px-3 py-2 rounded-md border ${field.value === "unique" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}
                        >
                          <CircleAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          {field.value === "unique" ? (
                            <span>
                              {t.rich("modals.fields.unique_help", {
                                important: (chunks) => (
                                  <strong>{chunks}</strong>
                                ),
                              })}
                            </span>
                          ) : (
                            <span>
                              {t.rich("modals.fields.bulk_help", {
                                important: (chunks) => (
                                  <strong>{chunks}</strong>
                                ),
                              })}
                            </span>
                          )}
                        </div>
                      </Field>
                    )}
                  />
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1 col-span-2"
                      >
                        <FieldLabel>{t("modals.fields.name")}</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t("modals.fields.placeholder_name")}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="category_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-1">
                        <FieldLabel>{t("modals.fields.category")}</FieldLabel>

                        <SelectField
                          options={(categories ?? [])
                            .filter((c) => c.is_active)
                            .map((c) => ({
                              label: `${c.name} (${c.code})`,
                              value: c.id,
                            }))}
                          value={field.value as number}
                          onChange={(val) => field.onChange(Number(val))}
                          placeholder={t("modals.fields.placeholder_category")}
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="old_code"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1 col-span-1"
                      >
                        <FieldLabel>{t("modals.fields.old_code")}</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t("modals.fields.placeholder_old_code")}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="serial_number"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-1">
                        <FieldLabel>{t("modals.fields.serial")}</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t("modals.fields.placeholder_serial")}
                          disabled={watchedManagementMethod === "bulk"}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="model"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-1">
                        <FieldLabel>{t("modals.fields.model")}</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t("modals.fields.placeholder_model")}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </div>

              {/* Section: Description & Notes */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">
                  {t("modals.sections.description")}
                </h3>
                <FieldGroup className="flex flex-col gap-3">
                  <Controller
                    name="specifications"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>
                          {t("modals.fields.specifications")}
                        </FieldLabel>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t(
                            "modals.fields.placeholder_specifications",
                          )}
                          className="min-h-[100px]"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="notes"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("modals.fields.notes")}</FieldLabel>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t("modals.fields.placeholder_notes")}
                          className="min-h-[100px]"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </div>

              {/* Section: Tracking & Management */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">
                  {t("modals.sections.tracking")}
                </h3>
                <FieldGroup className="grid grid-cols-3 gap-3">
                  <Controller
                    name="unit_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-3">
                        <FieldLabel>{t("modals.fields.unit")}</FieldLabel>

                        <SelectField
                          options={(orgUnits ?? [])
                            .filter((c) => c.is_active)
                            .map((c) => ({
                              label: `${c.name} (${c.code})`,
                              value: c.id,
                            }))}
                          value={field.value as number}
                          onChange={(val) => field.onChange(Number(val))}
                          placeholder={t("modals.fields.placeholder_unit")}
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="usage_mode_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("modals.fields.usage_mode")}</FieldLabel>

                        <SelectField
                          options={(usageModes ?? [])
                            .filter((c) => c.is_active)
                            .map((c) => ({
                              label: `${c.name} (${c.code})`,
                              value: c.id,
                            }))}
                          value={field.value as number}
                          onChange={(val) => field.onChange(Number(val))}
                          placeholder={t(
                            "modals.fields.placeholder_usage_mode",
                          )}
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="importance_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("modals.fields.importance")}</FieldLabel>
                        <SelectField
                          options={(importances ?? []).map((c) => ({
                            label: `${c.name} (${c.code})`,
                            value: c.id,
                          }))}
                          value={field.value as number}
                          onChange={(val) => field.onChange(Number(val))}
                          placeholder={t(
                            "modals.fields.placeholder_importance",
                          )}
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="location_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("modals.fields.location")}</FieldLabel>

                        <SelectField
                          disabled={hasHolderValue || isEditing}
                          options={(locations ?? []).map((c) => ({
                            label: `${c.name} (${c.code})`,
                            value: c.id,
                          }))}
                          value={field.value as number}
                          onChange={(val) => field.onChange(Number(val))}
                          placeholder={t("modals.fields.placeholder_location")}
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="staff_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-3">
                        <FieldLabel>{t("modals.fields.holder")}</FieldLabel>

                        <SelectField
                          disabled={hasLocationValue || isEditing}
                          options={(watchedUnitId
                            ? staffs.filter(
                                (s) => s.unit_id === Number(watchedUnitId),
                              )
                            : staffs
                          ).map((c) => ({
                            label: `${c.full_name} (${c.staff_code})`,
                            value: c.id,
                          }))}
                          value={field.value as number}
                          onChange={(val) => field.onChange(Number(val))}
                          placeholder={t("modals.fields.placeholder_location")}
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </div>

              {/* Section: Purchase & Value */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">
                  {t("modals.sections.purchase")}
                </h3>
                <FieldGroup className="grid grid-cols-3 gap-3">
                  <Controller
                    name="cost"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("modals.fields.cost")}</FieldLabel>
                        <FormattedNumberInput
                          {...field}
                          value={field.value as number | string | null}
                          onChange={(val) => field.onChange(val ?? 0)}
                          placeholder="0.00"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="quantity"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-2">
                        <FieldLabel>{t("modals.fields.quantity")}</FieldLabel>
                        <Input
                          type="number"
                          {...field}
                          value={(field.value as number) ?? ""}
                          placeholder="1"
                          disabled={watchedManagementMethod === "unique"}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="purchase_date"
                    control={form.control}
                    render={({ fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>
                          {t("modals.fields.purchase_date")}
                        </FieldLabel>
                        <DatePickerField form={form} name="purchase_date" />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="warranty_expiration"
                    control={form.control}
                    render={({ fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("modals.fields.warranty")}</FieldLabel>
                        <DatePickerField
                          form={form}
                          name="warranty_expiration"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="system_declaration_date"
                    control={form.control}
                    render={({ fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>
                          {t("modals.fields.declaration_date")}
                        </FieldLabel>
                        <DatePickerField
                          form={form}
                          name="system_declaration_date"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="purchase_ticket"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-1">
                        <FieldLabel>
                          {t("modals.fields.purchase_ticket")}
                        </FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t(
                            "modals.fields.placeholder_purchase_ticket",
                          )}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="supplier_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-2">
                        <FieldLabel>{t("modals.fields.supplier")}</FieldLabel>

                        <SelectField
                          options={(suppliers ?? [])
                            .filter((s) => s.is_active)
                            .map((s) => ({
                              label: `${s.name}`,
                              value: s.id,
                            }))}
                          value={field.value as number}
                          onChange={(val) => field.onChange(Number(val))}
                          placeholder={t("modals.fields.placeholder_supplier")}
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </div>

              {/* Section: Attachments */}
              <FormAttachmentsSection
                control={form.control}
                sectionNumber="5. "
              />
            </div>
          </div>

          <DialogFooter className="p-3 shrink-0 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              {t("modals.buttons.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("modals.buttons.saving") : t("modals.buttons.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
