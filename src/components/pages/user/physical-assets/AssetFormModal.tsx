"use client";

import { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PhysicalAssetSchema } from "@/components/schemas/user/physical-asset.schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@/hooks/useMutation";
import { useGet } from "@/hooks/useGet";
import { endpoints, dynamicEndpoints } from "@/config/endpoints";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { IPhysicalAsset } from "@/types/physical-asset";
import { IStatus } from "@/types/status";
import { ILocation } from "@/types/location";
import { ISupplier } from "@/types/supplier";
import { IUnit } from "@/types/unit";
import { ICatalogType } from "@/types/catalog-type";
import { IUsageMode } from "@/types/usage-mode";
import { IOrgUnit } from "@/types/org";
import { IStaff } from "@/types/staff";
import MultiAttachmentUpload from "@/components/common/MultiAttachmentUpload";

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
  const isEditing = !!assetToEdit;
  const { mutate, pending } = useMutation();

  // Fetch metadata
  const { response: statusRes } = useGet<IStatus[]>(
    {
      url: endpoints.STATUSES + "?category=asset",
    },
    { disabled: !isOpen },
  );
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
  const { response: unitRes } = useGet<IUnit[]>(
    { url: endpoints.UNITS },
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

  const statuses = statusRes || [];
  const locations = locationRes || [];
  const suppliers = supplierRes || [];
  const units = unitRes || [];
  const categories = catalogRes || [];
  const usageModes = usageModeRes || [];
  const orgUnits = orgRes || [];
  const staffs = staffRes?.items || [];

  const form = useForm({
    resolver: zodResolver(PhysicalAssetSchema),
    defaultValues: {
      asset_code: "",
      name: "",
      serial_number: "",
      model: "",
      request_ticket: "",
      importance_id: 2, // Standard
      cost: 0,
      quantity: 1,
      measure_unit_id: 1,
      status_id: 1,
      notes: "",
      specifications: "",
      purchase_date: "",
      purchase_ticket: "",
      warranty_expiration: "",
      system_declaration_date: "",
      holder_id: null,
      holder_name: "",
      category_id: null,
      supplier_id: undefined,
      location_id: undefined,
      usage_mode_id: undefined,
      manager_id: undefined,
      staff_id: null,
      location: "",
      old_code: "",
      owner: "",
      unit_id: null,
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
          attachments: assetToEdit.attachments || [],
        } as z.infer<typeof PhysicalAssetSchema>);
      } else {
        form.reset({
          asset_code: "",
          name: "",
          serial_number: "",
          model: "",
          request_ticket: "",
          importance_id: 2,
          cost: 0,
          quantity: 1,
          measure_unit_id: 1,
          status_id: 1,
          notes: "",
          specifications: "",
          purchase_date: "",
          purchase_ticket: "",
          warranty_expiration: "",
          system_declaration_date: "",
          supplier_id: undefined,
          category_id: null,
          location_id: undefined,
          usage_mode_id: undefined,
          holder_id: null,
          holder_name: "",
          manager_id: undefined,
          location: "",
          old_code: "",
          owner: "",
          unit_id: null,
          staff_id: null,
          attachments: [],
        } as z.infer<typeof PhysicalAssetSchema>);
      }
    }
  }, [isOpen, assetToEdit, form]);

  const onSubmit = async (data: z.infer<typeof PhysicalAssetSchema>) => {
    const url = isEditing
      ? dynamicEndpoints.PHYSICAL_ASSET_DETAIL(assetToEdit.id)
      : endpoints.PHYSICAL_ASSETS;
    const method = isEditing ? "patch" : "post";

    // Clean up empty strings to null for nullable/optional fields
    const cleanedData = {
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
    };

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
        <DialogHeader className="p-6 pb-4 shrink-0 border-b">
          <DialogTitle>
            {isEditing ? "Edit Physical Asset" : "Declare New Physical Asset"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modify the information of the selected physical asset."
              : "Fill in the required details to register a new physical asset in the system."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-8 pb-4">
              {/* Section: General Information */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">
                  1. General Information
                </h3>
                <FieldGroup className="grid grid-cols-2 gap-3">
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1 col-span-2"
                      >
                        <FieldLabel>Asset Name</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="e.g. MacBook Pro 2023"
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
                        <FieldLabel>Category</FieldLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "none" ? null : val)
                          }
                          value={field.value?.toString() || ""}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="none"
                              className="text-muted-foreground italic"
                            >
                              (None)
                            </SelectItem>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id.toString()}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <FieldLabel>Old Code</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="e.g. OLD-123"
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
                        <FieldLabel>Serial Number</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="e.g. SN12345678"
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
                        <FieldLabel>Model</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="e.g. MacBook Pro A2779"
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
                  2. Tracking & Management
                </h3>
                <FieldGroup className="grid grid-cols-3 gap-3">
                  <Controller
                    name="unit_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-3">
                        <FieldLabel>Owning/Managing Unit</FieldLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "none" ? null : val)
                          }
                          value={field.value?.toString() || ""}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="none"
                              className="text-muted-foreground italic"
                            >
                              (None)
                            </SelectItem>
                            {orgUnits.map((o) => (
                              <SelectItem key={o.id} value={o.id.toString()}>
                                {o.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="status_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Status</FieldLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "none" ? null : val)
                          }
                          value={field.value?.toString() || ""}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="none"
                              className="text-muted-foreground italic"
                            >
                              (None)
                            </SelectItem>
                            {statuses.map((s) => (
                              <SelectItem key={s.id} value={s.id.toString()}>
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: s.color }}
                                  />
                                  {s.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <FieldLabel>Usage Mode</FieldLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "none" ? null : val)
                          }
                          value={field.value?.toString() || ""}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="none"
                              className="text-muted-foreground italic"
                            >
                              (None)
                            </SelectItem>
                            {usageModes.map((m) => (
                              <SelectItem key={m.id} value={m.id.toString()}>
                                {m.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <FieldLabel>Importance</FieldLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "none" ? null : val)
                          }
                          value={field.value?.toString() || ""}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select importance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="none"
                              className="text-muted-foreground italic"
                            >
                              (None)
                            </SelectItem>
                            <SelectItem value="1">High</SelectItem>
                            <SelectItem value="2">Standard</SelectItem>
                            <SelectItem value="3">Low</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <FieldLabel>Location</FieldLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "none" ? null : val)
                          }
                          value={field.value?.toString() || ""}
                          disabled={hasHolderValue}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="none"
                              className="text-muted-foreground italic"
                            >
                              (None)
                            </SelectItem>
                            {locations.map((l) => (
                              <SelectItem key={l.id} value={l.id.toString()}>
                                {l.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="location"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-2">
                        <FieldLabel>Detailed Location</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="e.g. Floor 5, Desk 10"
                          disabled={hasHolderValue}
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
                        <FieldLabel>Holder (Staff List)</FieldLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "none" ? null : val)
                          }
                          value={field.value?.toString() || ""}
                          disabled={hasLocationValue}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select staff" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="none"
                              className="text-muted-foreground italic"
                            >
                              (None)
                            </SelectItem>
                            {(watchedUnitId
                              ? staffs.filter(
                                  (s) => s.unit_id === Number(watchedUnitId),
                                )
                              : staffs
                            ).map((s) => (
                              <SelectItem key={s.id} value={s.id.toString()}>
                                {s.full_name} ({s.staff_code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                  3. Purchase & Acquisition
                </h3>
                <FieldGroup className="grid grid-cols-3 gap-3">
                  <Controller
                    name="cost"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Cost</FieldLabel>
                        <Input
                          type="number"
                          {...field}
                          value={(field.value as number) ?? 0}
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
                      <Field className="gap-1">
                        <FieldLabel>Quantity</FieldLabel>
                        <Input
                          type="number"
                          {...field}
                          value={(field.value as number) ?? 1}
                          placeholder="1"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="measure_unit_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Unit</FieldLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "none" ? null : val)
                          }
                          value={field.value?.toString() || ""}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="none"
                              className="text-muted-foreground italic"
                            >
                              (None)
                            </SelectItem>
                            {units.map((u) => (
                              <SelectItem key={u.id} value={u.id.toString()}>
                                {u.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="purchase_date"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Purchase Date</FieldLabel>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ?? ""}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="warranty_expiration"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Warranty Expiration</FieldLabel>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ?? ""}
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
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>System Declaration Date</FieldLabel>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ?? ""}
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
                        <FieldLabel>Purchase Ticket</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Invoice, Receipt, or PO#"
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
                        <FieldLabel>Supplier</FieldLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "none" ? null : val)
                          }
                          value={field.value?.toString() || ""}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="none"
                              className="text-muted-foreground italic"
                            >
                              (None)
                            </SelectItem>
                            {suppliers.map((s) => (
                              <SelectItem key={s.id} value={s.id.toString()}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                  4. Description & Notes
                </h3>
                <FieldGroup className="flex flex-col gap-3">
                  <Controller
                    name="specifications"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Specifications</FieldLabel>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Technical details, configurations, etc."
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
                        <FieldLabel>Notes</FieldLabel>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Any additional remarks..."
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

              {/* Section: Attachments */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">
                  5. Attachments
                </h3>
                <Controller
                  name="attachments"
                  control={form.control}
                  render={({ field }) => (
                    <MultiAttachmentUpload
                      value={field.value || []}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 shrink-0 border-t bg-background">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
