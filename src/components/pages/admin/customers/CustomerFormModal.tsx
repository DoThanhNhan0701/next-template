"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { CustomerSchema } from "@/components/schemas/admin/customer.schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { ICustomer } from "@/types/customer";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

interface Props {
  customerToEdit?: ICustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: unknown, method?: "post" | "patch" | "delete") => void;
}

export default function CustomerFormModal({
  customerToEdit,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!customerToEdit;
  const { mutate, pending } = useMutation();

  const form = useForm({
    resolver: zodResolver(CustomerSchema),
    defaultValues: {
      name: "",
      customer_type: "Individual",
      identifier: "",
      phone: "",
      email: "",
      address: "",
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (customerToEdit) {
        form.reset({
          name: customerToEdit.name,
          customer_type: customerToEdit.customer_type as
            | "Individual"
            | "Organization",
          identifier: customerToEdit.identifier,
          phone: customerToEdit.phone || "",
          email: customerToEdit.email || "",
          address: customerToEdit.address || "",
          description: customerToEdit.description || "",
          is_active: customerToEdit.is_active,
        });
      } else {
        form.reset({
          name: "",
          customer_type: "Individual",
          identifier: "",
          phone: "",
          email: "",
          address: "",
          description: "",
          is_active: true,
        });
      }
    }
  }, [isOpen, customerToEdit, form]);

  const onSubmit = async (data: z.infer<typeof CustomerSchema>) => {
    const url = isEditing
      ? dynamicEndpoints.CUSTOMER_DETAIL(customerToEdit.id)
      : endpoints.CUSTOMERS;
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
      <DialogContent className="sm:max-w-[600px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>
            {isEditing ? "Edit Customer" : "Add Customer"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the customer's information."
              : "Enter details for a new customer."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 px-6 pb-6 overflow-y-auto">
            <FieldGroup className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-2"
                  >
                    <FieldLabel>Customer name</FieldLabel>
                    <Input {...field} placeholder="e.g. Nguyen Van A" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="customer_type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>Customer type</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value?.toString() || ""}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="Organization">
                          Organization
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="identifier"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>Identifier (tax code/ID)</FieldLabel>
                    <Input {...field} placeholder="e.g. 0123456789 or TAX001" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>Phone</FieldLabel>
                    <Input {...field} value={field.value || ""} placeholder="e.g. 0123 456 789" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>Email</FieldLabel>
                    <Input {...field} value={field.value || ""} placeholder="e.g. contact@company.com" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-2"
                  >
                    <FieldLabel>Address</FieldLabel>
                    <Input {...field} value={field.value || ""} placeholder="e.g. 123 Nguyen Hue, District 1" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-2"
                  >
                    <FieldLabel>Description</FieldLabel>
                    <Input {...field} value={field.value || ""} placeholder="Optional notes about this customer" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="is_active"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1 flex justify-start items-center col-span-2 mt-2">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 rounded border-(--surface-border-color)"
                      />
                      Active
                    </label>
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <DialogFooter className="p-3 shrink-0 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
