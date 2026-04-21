"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { SupplierSchema } from "@/components/schemas/admin/supplier.schema";
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
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { ISupplier } from "@/types/supplier";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

interface Props {
  supplierToEdit?: ISupplier | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: unknown, method?: "post" | "patch" | "delete") => void;
}

export default function SupplierFormModal({
  supplierToEdit,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!supplierToEdit;
  const { mutate, pending } = useMutation();

  const form = useForm({
    resolver: zodResolver(SupplierSchema),
    defaultValues: {
      name: "",
      tax_code: "",
      contact_name: "",
      phone: "",
      email: "",
      address: "",
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (supplierToEdit) {
        form.reset({
          name: supplierToEdit.name,
          tax_code: supplierToEdit.tax_code || "",
          contact_name: supplierToEdit.contact_name || "",
          phone: supplierToEdit.phone || "",
          email: supplierToEdit.email || "",
          address: supplierToEdit.address || "",
          description: supplierToEdit.description || "",
          is_active: supplierToEdit.is_active,
        });
      } else {
        form.reset({
          name: "",
          tax_code: "",
          contact_name: "",
          phone: "",
          email: "",
          address: "",
          description: "",
          is_active: true,
        });
      }
    }
  }, [isOpen, supplierToEdit, form]);

  const onSubmit = async (data: z.infer<typeof SupplierSchema>) => {
    const url = isEditing
      ? dynamicEndpoints.SUPPLIER_DETAIL(supplierToEdit.id)
      : endpoints.SUPPLIERS;
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
            {isEditing ? "Edit Supplier" : "Add Supplier"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update supplier contact information."
              : "Add a new vendor or supplier to the directory."}
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
                    <FieldLabel>Supplier name</FieldLabel>
                    <Input {...field} placeholder="e.g. ABC Technology Co." />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="tax_code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>Tax code</FieldLabel>
                    <Input {...field} value={field.value || ""} placeholder="e.g. 0123456789" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="contact_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>Contact name</FieldLabel>
                    <Input {...field} value={field.value || ""} placeholder="e.g. Nguyen Van B" />
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
                    <Input {...field} value={field.value || ""} placeholder="e.g. 0987 654 321" />
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
                    <Input {...field} value={field.value || ""} placeholder="e.g. supplier@email.com" />
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
                    <Input {...field} value={field.value || ""} placeholder="e.g. 456 Le Loi, District 3" />
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
                    <Input {...field} value={field.value || ""} placeholder="Optional notes about this supplier" />
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
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
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
