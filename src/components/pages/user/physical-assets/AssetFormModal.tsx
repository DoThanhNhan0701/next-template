"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PhysicalAssetSchema } from "@/components/schemas/user/physical-asset.schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { IUser } from "@/types/auth";
import { ICatalogType } from "@/types/catalog-type";
import { IUsageMode } from "@/types/usage-mode";

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
  const { response: statusRes } = useGet<IStatus[]>({
    url: endpoints.STATUSES + "?category=asset",
  }, { disabled: !isOpen });
  const { response: locationRes } = useGet<ILocation[]>({
    url: endpoints.LOCATIONS,
  }, { disabled: !isOpen });
  const { response: supplierRes } = useGet<{ data: ISupplier[] }>({
    url: endpoints.SUPPLIERS,
  }, { disabled: !isOpen });
  const { response: unitRes } = useGet<IUnit[]>({ url: endpoints.UNITS }, { disabled: !isOpen });
  const { response: userRes } = useGet<IUser[]>({ url: endpoints.USERS }, { disabled: !isOpen });
  const { response: catalogRes } = useGet<ICatalogType[]>({
    url: endpoints.CATALOG_TYPES,
  }, { disabled: !isOpen });
  const { response: usageModeRes } = useGet<IUsageMode[]>({
    url: endpoints.USAGE_MODES,
  }, { disabled: !isOpen });

  const statuses = statusRes || [];
  const locations = locationRes || [];
  const suppliers = supplierRes?.data || [];
  const units = unitRes || [];
  const users = userRes || [];
  const categories = catalogRes || [];
  const usageModes = usageModeRes || [];

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
      unit_id: 1,
      status_id: 1,
      notes: "",
      specifications: "",
      purchase_date: "",
      purchase_ticket: "",
      warranty_expiration: "",
      system_declaration_date: "",
      supplier_id: undefined,
      category_id: undefined,
      location_id: undefined,
      usage_mode_id: undefined,
      holder_id: undefined,
      manager_id: undefined,
      location: "",
      old_code: "",
      owner: "",
    },
  });

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
          unit_id: 1,
          status_id: 1,
          notes: "",
          specifications: "",
          purchase_date: "",
          purchase_ticket: "",
          warranty_expiration: "",
          system_declaration_date: "",
          supplier_id: undefined,
          category_id: undefined,
          location_id: undefined,
          usage_mode_id: undefined,
          holder_id: undefined,
          manager_id: undefined,
          location: "",
          old_code: "",
          owner: "",
        } as z.infer<typeof PhysicalAssetSchema>);
      }
    }
  }, [isOpen, assetToEdit, form]);

  const onSubmit = async (data: z.infer<typeof PhysicalAssetSchema>) => {
    const url = isEditing
      ? dynamicEndpoints.PHYSICAL_ASSET_DETAIL(assetToEdit.id)
      : endpoints.PHYSICAL_ASSETS;
    const method = isEditing ? "patch" : "post";

    await mutate(
      {
        url,
        method,
        body: data,
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
                  General Information
                </h3>
                <FieldGroup className="grid grid-cols-3 gap-3">
                  <Controller
                    name="asset_code"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className="gap-1">
                        <FieldLabel>Asset Code</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="e.g. LAP001"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
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
                    name="serial_number"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Serial Number</FieldLabel>
                        <Input {...field} value={field.value ?? ""} />
                      </Field>
                    )}
                  />
                  <Controller
                    name="model"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Model</FieldLabel>
                        <Input {...field} value={field.value ?? ""} />
                      </Field>
                    )}
                  />
                  <Controller
                    name="category_id"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Category</FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id.toString()}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />
                </FieldGroup>
              </div>

              {/* Section: Tracking & Management */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">
                  Tracking & Management
                </h3>
                <FieldGroup className="grid grid-cols-3 gap-3">
                  <Controller
                    name="status_id"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Status</FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
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
                      </Field>
                    )}
                  />
                  <Controller
                    name="usage_mode_id"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Usage Mode</FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            {usageModes.map((m) => (
                              <SelectItem key={m.id} value={m.id.toString()}>
                                {m.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />
                  <Controller
                    name="importance_id"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Importance</FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select importance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">High</SelectItem>
                            <SelectItem value="2">Standard</SelectItem>
                            <SelectItem value="3">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />
                  <Controller
                    name="location_id"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Location</FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                        >
                          <SelectTrigger className="h-9">
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
                      </Field>
                    )}
                  />
                  <Controller
                    name="location"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1 col-span-2">
                        <FieldLabel>Detailed Location</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="e.g. Floor 5, Desk 10"
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name="holder_id"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1 col-span-1">
                        <FieldLabel>Holder</FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select holder" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((u) => (
                              <SelectItem key={u.id} value={u.id.toString()}>
                                {u.full_name || u.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />
                  <Controller
                    name="manager_id"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1 col-span-1">
                        <FieldLabel>Manager</FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((u) => (
                              <SelectItem key={u.id} value={u.id.toString()}>
                                {u.full_name || u.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />
                </FieldGroup>
              </div>

              {/* Section: Purchase & Value */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">
                  Purchase & Acquisition
                </h3>
                <FieldGroup className="grid grid-cols-3 gap-3">
                  <Controller
                    name="cost"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Cost</FieldLabel>
                        <Input
                          type="number"
                          {...field}
                          value={(field.value as number) ?? 0}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name="quantity"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Quantity</FieldLabel>
                        <Input
                          type="number"
                          {...field}
                          value={(field.value as number) ?? 1}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name="unit_id"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Unit</FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((u) => (
                              <SelectItem key={u.id} value={u.id.toString()}>
                                {u.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />
                  <Controller
                    name="purchase_date"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Purchase Date</FieldLabel>
                        <Input type="date" {...field} value={field.value ?? ""} />
                      </Field>
                    )}
                  />
                  <Controller
                    name="purchase_ticket"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Purchase Ticket</FieldLabel>
                        <Input {...field} value={field.value ?? ""} />
                      </Field>
                    )}
                  />
                  <Controller
                    name="warranty_expiration"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Warranty Expiration</FieldLabel>
                        <Input type="date" {...field} value={field.value ?? ""} />
                      </Field>
                    )}
                  />
                  <Controller
                    name="supplier_id"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1 col-span-3">
                        <FieldLabel>Supplier</FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((s) => (
                              <SelectItem key={s.id} value={s.id.toString()}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />
                </FieldGroup>
              </div>

              {/* Section: Description & Notes */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">
                  Description & Notes
                </h3>
                <FieldGroup className="flex flex-col gap-3">
                  <Controller
                    name="specifications"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Specifications</FieldLabel>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Technical details, configurations, etc."
                          className="min-h-[100px]"
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name="notes"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Notes</FieldLabel>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Any additional remarks..."
                          className="min-h-[100px]"
                        />
                      </Field>
                    )}
                  />
                </FieldGroup>
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
