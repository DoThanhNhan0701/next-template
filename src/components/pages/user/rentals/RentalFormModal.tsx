"use client";

import { useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RentalCreateSchema } from "@/components/schemas/user/rental.schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { endpoints } from "@/config/endpoints";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { IOrgUnit } from "@/types/org";
import { ICustomer } from "@/types/customer";
import { IPhysicalAsset } from "@/types/physical-asset";
import { PlusIcon, Trash } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RentalFormModal({ isOpen, onClose, onSuccess }: Props) {
  const { mutate, pending } = useMutation();

  // Fetch metadata
  const { response: orgRes } = useGet<IOrgUnit[]>(
    { url: endpoints.ORG_UNITS },
    { disabled: !isOpen },
  );
  const { response: cusRes } = useGet<{ data: ICustomer[] }>(
    { url: endpoints.CUSTOMERS },
    { disabled: !isOpen },
  );
  const { response: assetRes } = useGet<IPhysicalAsset[]>(
    { url: endpoints.PHYSICAL_ASSETS },
    { disabled: !isOpen },
  );

  const orgUnits = orgRes || [];
  const customers = cusRes?.data || [];
  const assets = assetRes || [];

  const form = useForm({
    resolver: zodResolver(RentalCreateSchema),
    defaultValues: {
      record_number: "",
      unit_id: 0,
      customer_id: 0,
      lease_date: new Date().toISOString().split("T")[0],
      duration_days: 1,
      reason: "",
      total_revenue: 0,
      contract_number: "",
      notes: "",
      external_link: "",
      attachments: [],
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        record_number: "",
        unit_id: 0,
        customer_id: 0,
        lease_date: new Date().toISOString().split("T")[0],
        duration_days: 1,
        reason: "",
        total_revenue: 0,
        contract_number: "",
        notes: "",
        external_link: "",
        attachments: [],
        items: [
          {
            asset_id: 0,
            quantity: 1,
            from_location_id: 0,
            rental_revenue: 0,
            lessee_location: "",
          },
        ],
      });
    }
  }, [isOpen, form]);

  const onSubmit = async (data: z.infer<typeof RentalCreateSchema>) => {
    await mutate(
      {
        url: endpoints.RENTALS,
        method: "post",
        body: data,
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          onSuccess();
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
      <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b">
          <DialogTitle>Create Rental Record</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Fill in details to create a new rental record.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex flex-col gap-6 pb-4">
              {/* General Information */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">
                  General Information
                </h3>
                <FieldGroup className="grid grid-cols-2 gap-3">
                  <Controller
                    name="record_number"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1"
                      >
                        <FieldLabel>Record Number *</FieldLabel>
                        <Input {...field} placeholder="e.g. CT20240001" />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="contract_number"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Contract Number</FieldLabel>
                        <Input {...field} placeholder="e.g. HD/123" />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="unit_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Unit *</FieldLabel>
                        <Select
                          onValueChange={(val) => field.onChange(Number(val))}
                          value={field.value ? field.value.toString() : ""}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
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
                    name="customer_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Customer *</FieldLabel>
                        <Select
                          onValueChange={(val) => field.onChange(Number(val))}
                          value={field.value ? field.value.toString() : ""}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers?.map((c) => (
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
                    name="lease_date"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Lease Date *</FieldLabel>
                        <Input type="date" {...field} />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="duration_days"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Duration (Days) *</FieldLabel>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="total_revenue"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Total Revenue</FieldLabel>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="reason"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Reason</FieldLabel>
                        <Input {...field} placeholder="e.g. For event" />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </div>

              {/* Items Information */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <h3 className="text-sm font-semibold text-primary">
                    Rental Assets
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
                    <PlusIcon size={12} className="mr-1" /> Add Asset
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  {fields.map((item, index) => (
                    <div
                      key={item.id}
                      className="relative bg-muted/30 border rounded-lg p-3 grid grid-cols-2 gap-3"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6 text-red-500 hover:bg-red-50"
                        onClick={() => remove(index)}
                      >
                        <Trash size={12} />
                      </Button>
                      <Controller
                        name={`items.${index}.asset_id`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field className="gap-1 col-span-2 pr-6">
                            <FieldLabel>Asset *</FieldLabel>
                            <Select
                              onValueChange={(val) =>
                                field.onChange(Number(val))
                              }
                              value={field.value ? field.value.toString() : ""}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select asset" />
                              </SelectTrigger>
                              <SelectContent>
                                {assets.map((a) => (
                                  <SelectItem
                                    key={a.id}
                                    value={a.id.toString()}
                                  >
                                    {a.name} ({a.asset_code})
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
                        name={`items.${index}.quantity`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field className="gap-1">
                            <FieldLabel>Quantity *</FieldLabel>
                            <Input
                              type="number"
                              className="h-8 text-xs"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      <Controller
                        name={`items.${index}.rental_revenue`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field className="gap-1">
                            <FieldLabel>Item Revenue</FieldLabel>
                            <Input
                              type="number"
                              className="h-8 text-xs"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                  ))}
                  {form.formState.errors.items?.root && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.items.root.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t flex justify-end gap-3 shrink-0 bg-muted/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-24"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className="w-24">
              {pending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
