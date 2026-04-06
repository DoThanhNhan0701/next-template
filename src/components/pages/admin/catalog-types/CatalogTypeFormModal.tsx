"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CatalogTypeSchema } from "@/components/schemas/admin/catalog-type.schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { useMutation } from "@/hooks/useMutation";
import { endpoints, dynamicEndpoints } from "@/config/endpoints";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { ICatalogType } from "@/types/catalog-type";

interface Props {
  catalogTypeToEdit?: ICatalogType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: unknown, method?: "post" | "patch" | "delete") => void;
}

export default function CatalogTypeFormModal({
  catalogTypeToEdit,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!catalogTypeToEdit;
  const { mutate, pending } = useMutation();

  const form = useForm({
    resolver: zodResolver(CatalogTypeSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      is_active: true,
      catalog_group_id: 1, // Defaulting to 1 if required by API
      management_type: "by_quantity",
      has_warranty: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (catalogTypeToEdit) {
        form.reset({
          name: catalogTypeToEdit.name,
          code: catalogTypeToEdit.code,
          description: catalogTypeToEdit.description || "",
          is_active: catalogTypeToEdit.is_active,
          catalog_group_id: catalogTypeToEdit.catalog_group_id,
          management_type: catalogTypeToEdit.management_type,
          has_warranty: catalogTypeToEdit.has_warranty,
        });
      } else {
        form.reset({
          name: "",
          code: "",
          description: "",
          is_active: true,
          catalog_group_id: 1,
          management_type: "by_quantity",
          has_warranty: true,
        });
      }
    }
  }, [isOpen, catalogTypeToEdit, form]);

  const onSubmit = async (data: z.infer<typeof CatalogTypeSchema>) => {
    const url = isEditing
      ? dynamicEndpoints.CATALOG_TYPE_DETAIL(catalogTypeToEdit.id)
      : endpoints.CATALOG_TYPES;
    const method = isEditing ? "patch" : "post";
    const payload = { ...data };

    await mutate(
      {
        url,
        method,
        body: payload,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Catalog Type" : "Add Catalog Type"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>Name</FieldLabel>
                  <Input {...field} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>Code</FieldLabel>
                  <Input {...field} />
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
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>Description</FieldLabel>
                  <Input {...field} value={field.value || ""} />
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
                <Field className="gap-1 flex justify-start items-center">
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

          <DialogFooter>
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
