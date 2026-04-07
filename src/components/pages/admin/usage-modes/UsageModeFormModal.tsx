"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UsageModeSchema } from "@/components/schemas/admin/usage-mode.schema";
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
import { IUsageMode } from "@/types/usage-mode";

interface Props {
  usageModeToEdit?: IUsageMode | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: unknown, method?: "post" | "patch" | "delete") => void;
}

export default function UsageModeFormModal({
  usageModeToEdit,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!usageModeToEdit;
  const { mutate, pending } = useMutation();

  const form = useForm({
    resolver: zodResolver(UsageModeSchema),
    defaultValues: {
      code: "",
      name: "",
      color: "#000000",
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (usageModeToEdit) {
        form.reset({
          code: usageModeToEdit.code,
          name: usageModeToEdit.name,
          color: usageModeToEdit.color,
          description: usageModeToEdit.description || "",
          is_active: usageModeToEdit.is_active,
        });
      } else {
        form.reset({
          code: "",
          name: "",
          color: "#000000",
          description: "",
          is_active: true,
        });
      }
    }
  }, [isOpen, usageModeToEdit, form]);

  const onSubmit = async (data: z.infer<typeof UsageModeSchema>) => {
    const url = isEditing
      ? dynamicEndpoints.USAGE_MODE_DETAIL(usageModeToEdit.id)
      : endpoints.USAGE_MODES;
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Usage Mode" : "Add Usage Mode"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this usage mode."
              : "Create a new usage mode for assets."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
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
              name="color"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>Color</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      {...field}
                      className="w-12 h-9 p-1 rounded-md"
                    />
                    <Input
                      {...field}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
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
