"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { GetStatusSchema, IStatusFormValues } from "@/components/schemas/admin/status.schema";
import { useTranslations } from "next-intl";
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
import { IStatus } from "@/types/status";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

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
  const t = useTranslations("page_asset_statuses.form");
  const vt = useTranslations("page_asset_statuses.validation");
  const isEditing = !!statusToEdit;
  const isSystem = statusToEdit?.is_system;
  const { mutate, pending } = useMutation();

  const schema = GetStatusSchema(vt);
  const form = useForm<IStatusFormValues>({
    resolver: zodResolver(schema),
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

  const onSubmit = async (data: IStatusFormValues) => {
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
      <DialogContent className="sm:max-w-[425px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>
            {isEditing ? t("edit_title") : t("create_title")}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t("edit_description") : t("create_description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 px-6 pb-6 overflow-y-auto">
            <FieldGroup className="gap-3">
              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>{t("code_label")}</FieldLabel>
                    <Input
                      {...field}
                      disabled={isSystem}
                      placeholder={t("code_placeholder")}
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
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>{t("name_label")}</FieldLabel>
                    <Input {...field} placeholder={t("name_placeholder")} />
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
                    <FieldLabel>{t("color_label")}</FieldLabel>
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
          </div>

          <DialogFooter className="p-3 shrink-0 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
