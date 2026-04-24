"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { GetStaffSchema } from "@/components/schemas/admin/staff.schema";
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
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { IStaff, IUnit } from "@/types/staff";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

interface Props {
  staffToEdit?: IStaff | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: unknown, method?: "post" | "patch" | "delete") => void;
}

export default function StaffFormModal({
  staffToEdit,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!staffToEdit;
  const t = useTranslations("page_staff");
  const { mutate, pending } = useMutation();
  const { response: units = [] } = useGet<IUnit[]>({
    url: endpoints.ORG_UNITS,
  });

  const schema = GetStaffSchema(t);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      staff_code: "",
      full_name: "",
      email: "",
      phone: "",
      unit_id: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (staffToEdit) {
        form.reset({
          staff_code: staffToEdit.staff_code,
          full_name: staffToEdit.full_name,
          email: staffToEdit.email,
          phone: staffToEdit.phone || "",
          unit_id: staffToEdit.unit_id,
          is_active: staffToEdit.is_active,
        });
      } else {
        form.reset({
          staff_code: "",
          full_name: "",
          email: "",
          phone: "",
          unit_id: 0,
          is_active: true,
        });
      }
    }
  }, [isOpen, staffToEdit, form]);

  const onSubmit = async (data: z.infer<ReturnType<typeof GetStaffSchema>>) => {
    const url = isEditing
      ? dynamicEndpoints.STAFF_DETAIL(staffToEdit.id)
      : endpoints.STAFFS;
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
      <DialogContent className="sm:max-w-[450px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>{isEditing ? t("edit_staff") : t("add_staff")}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? t("update_staff_info")
              : t("register_new_staff")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 px-6 pb-6 overflow-y-auto">
            <FieldGroup className="gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="staff_code"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel>{t("staff_code")}</FieldLabel>
                      <Input
                        {...field}
                        disabled={isEditing}
                        placeholder={t("code_placeholder")}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="full_name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel>{t("full_name")}</FieldLabel>
                      <Input {...field} placeholder={t("name_placeholder")} />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>{t("email")}</FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t("email_placeholder")}
                    />
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
                    <FieldLabel>{t("phone_optional")}</FieldLabel>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder={t("phone_placeholder")}
                    />
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
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>{t("organization")}</FieldLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value?.toString() || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("select_organization")} />
                      </SelectTrigger>
                      <SelectContent>
                        {units
                          ?.filter((unit) => unit.is_active)
                          .map((unit) => (
                            <SelectItem
                              key={unit.id}
                              value={unit.id.toString()}
                            >
                              {unit.name} ({unit.code})
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
                name="is_active"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1 flex items-center mt-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 rounded border-(--surface-border-color) text-primary focus:ring-primary"
                      />
                      {t("active")}
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
