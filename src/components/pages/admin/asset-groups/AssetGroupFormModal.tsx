"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  GetAssetGroupSchema,
  IAssetGroupFormValues,
} from "@/components/schemas/admin/asset-group.schema";
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
import { IAssetGroup } from "@/types/asset-group";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

interface Props {
  assetGroupToEdit?: IAssetGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: unknown, method?: "post" | "patch" | "delete") => void;
}

export default function AssetGroupFormModal({
  assetGroupToEdit,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const t = useTranslations("page_asset_groups.form");
  const vt = useTranslations("page_asset_groups.validation");
  const isEditing = !!assetGroupToEdit;
  const { mutate, pending } = useMutation();

  const schema = GetAssetGroupSchema(vt);
  const form = useForm<IAssetGroupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      color: "#000000",
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (assetGroupToEdit) {
        form.reset({
          name: assetGroupToEdit.name,
          code: assetGroupToEdit.code,
          color: assetGroupToEdit.color,
          description: assetGroupToEdit.description || "",
          is_active: assetGroupToEdit.is_active,
        });
      } else {
        form.reset({
          name: "",
          code: "",
          color: "#000000",
          description: "",
          is_active: true,
        });
      }
    }
  }, [isOpen, assetGroupToEdit, form]);

  const onSubmit = async (data: IAssetGroupFormValues) => {
    const url = isEditing
      ? dynamicEndpoints.ASSET_GROUP_DETAIL(assetGroupToEdit.id)
      : endpoints.ASSET_GROUPS;
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
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>{t("code_label")}</FieldLabel>
                    <Input {...field} placeholder={t("code_placeholder")} />
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
                        {...field}
                        type="color"
                        className="w-12 h-10 p-1"
                      />
                      <Input {...field} placeholder={t("color_placeholder")} />
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
                    <FieldLabel>{t("description_label")}</FieldLabel>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder={t("description_placeholder")}
                    />
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
                      {t("active_status")}
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
