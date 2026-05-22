"use client";

import { useEffect, useMemo } from "react";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserCircle } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { SelectField } from "@/components/common/SelectField";
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
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { IUser } from "@/types/auth";
import { IOffice } from "@/types/office";
import { IStaff, IUnit } from "@/types/staff";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

interface Props {
  staffToEdit?: IStaff | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: unknown, method?: "post" | "put" | "delete") => void;
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
  const { mutate: createUser, pending: creatingUser } = useMutation();
  const { response: units = [] } = useGet<IUnit[]>({
    url: endpoints.ORG_UNITS,
  });
  const { response: offices = [] } = useGet<IOffice[]>({
    url: endpoints.OFFICES,
  });
  const { response: userRes } = useGet<IUser[]>(
    { url: endpoints.USERS },
    { disabled: !isOpen },
  );
  const users = useMemo(() => userRes || [], [userRes]);

  const schema = GetStaffSchema(t);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      staff_code: "",
      full_name: "",
      email: "",
      phone: "",
      unit_id: "" as unknown as number,
      office_id: "" as unknown as number,
      is_active: true,
      login_username: "",
      user_id: null as unknown as number,
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
          office_id: staffToEdit.office_id,
          is_active: staffToEdit.is_active,
          login_username: staffToEdit.login_username || "",
          user_id:
            users.find((user) => user.username === staffToEdit.login_username)
              ?.id || null,
        });
      } else {
        form.reset({
          staff_code: "",
          full_name: "",
          email: "",
          phone: "",
          unit_id: "" as unknown as number,
          office_id: "" as unknown as number,
          is_active: true,
          login_username: "",
          user_id: null as unknown as number,
        });
      }
    }
  }, [isOpen, staffToEdit, form, users]);

  const onSubmit = async (data: z.infer<ReturnType<typeof GetStaffSchema>>) => {
    const url = isEditing
      ? dynamicEndpoints.STAFF_DETAIL(staffToEdit.id)
      : endpoints.STAFFS;
    const method = isEditing ? "put" : "post";
    const payload = {
      ...data,
      login_username: data.login_username?.trim() || null,
      ...(data.user_id ? { user_id: data.user_id } : {}),
    };

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
      <DialogContent className="sm:max-w-[680px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>
            {isEditing ? t("edit_staff") : t("add_staff")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing ? t("update_staff_info") : t("register_new_staff")}
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
                    <SelectField
                      options={(units ?? [])
                        .filter((unit) => unit.is_active)
                        .map((unit) => ({
                          label: `${unit.name} (${unit.code})`,
                          value: unit.id,
                        }))}
                      value={field.value as number}
                      onChange={(val) => field.onChange(Number(val))}
                      placeholder={t("select_organization")}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="office_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>{t("office")}</FieldLabel>
                    <SelectField
                      options={(offices ?? [])
                        .filter((office) => office.is_active)
                        .map((office) => ({
                          label: `${office.name} (${office.code})`,
                          value: office.id,
                        }))}
                      value={field.value as number}
                      onChange={(val) => field.onChange(Number(val))}
                      placeholder={t("select_office")}
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

            {/* Tài khoản hệ thống (Liên kết) */}
            <div className="mt-4 pt-4 border-t border-dashed border-(--surface-border-color)">
              <div className="flex items-center gap-2 mb-3">
                <UserCircle size={18} className="text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">
                  {t("system_account_section")}
                </span>
              </div>

              <div className="space-y-3">
                <Controller
                  name="login_username"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="gap-1">
                      <FieldLabel className="text-xs text-muted-foreground">
                        {t("login_username_label")}
                      </FieldLabel>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="nphanh"
                      />
                    </Field>
                  )}
                />

                <div className="flex items-center gap-2">
                  <Controller
                    name="user_id"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1 flex-1">
                        <SelectField
                          options={(users ?? [])
                            .filter((user) => user.is_active)
                            .map((user) => ({
                              label: `${user.username} (${user.full_name})`,
                              value: user.id,
                            }))}
                          value={field.value as number}
                          onChange={(val) => field.onChange(Number(val))}
                          placeholder={t("select_account_placeholder")}
                        />
                      </Field>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    disabled={!isEditing || creatingUser}
                    onClick={async () => {
                      if (!isEditing) return;
                      const username = form.getValues("login_username");
                      if (!username) return;
                      await createUser(
                        {
                          url: dynamicEndpoints.STAFF_CREATE_USER(
                            staffToEdit.id,
                          ),
                          method: "post",
                          body: { username },
                        },
                        {
                          onSuccess: (res) => {
                            getApiSuccessMessage(res);
                            onSuccess(res, "put");
                          },
                          onError: (err) => {
                            getApiErrorMessage(err);
                          },
                        },
                      );
                    }}
                  >
                    {creatingUser ? t("saving") : t("create_account")}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  {t("account_link_hint")}
                </p>
              </div>
            </div>
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
