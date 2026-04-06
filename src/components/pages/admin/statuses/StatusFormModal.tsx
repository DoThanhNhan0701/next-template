"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StatusSchema } from "@/components/schemas/admin/status.schema";
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
import { IStatus } from "@/types/status";

interface Props {
  statusToEdit?: IStatus | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: unknown, method?: "post" | "patch" | "delete") => void;
}

export default function StatusFormModal({
  statusToEdit,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!statusToEdit;
  const isSystem = statusToEdit?.is_system;
  const { mutate, pending } = useMutation();

  const form = useForm({
    resolver: zodResolver(StatusSchema),
    defaultValues: {
      category: "asset",
      code: "",
      name: "",
      color: "#000000",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (statusToEdit) {
        form.reset({
          category: statusToEdit.category,
          code: statusToEdit.code,
          name: statusToEdit.name,
          color: statusToEdit.color,
        });
      } else {
        form.reset({
          category: "asset",
          code: "",
          name: "",
          color: "#000000",
        });
      }
    }
  }, [isOpen, statusToEdit, form]);

  const onSubmit = async (data: z.infer<typeof StatusSchema>) => {
    const url = isEditing
      ? dynamicEndpoints.STATUS_DETAIL(statusToEdit.id)
      : endpoints.STATUSES;
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
            {isEditing ? "Edit Asset Status" : "Add Asset Status"}
          </DialogTitle>
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
                  <Input {...field} disabled={isSystem} />
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
