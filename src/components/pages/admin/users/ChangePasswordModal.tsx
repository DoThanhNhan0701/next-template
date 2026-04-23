"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { GetUserChangePasswordSchema } from "@/components/schemas/admin/user.schema";
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
import { dynamicEndpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

interface Props {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  userId,
  isOpen,
  onClose,
}: Props) {
  const { mutate, pending } = useMutation();
  const t = useTranslations("page_users");

  const schema = GetUserChangePasswordSchema(t);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  const onSubmit = async (
    data: z.infer<ReturnType<typeof GetUserChangePasswordSchema>>,
  ) => {
    if (!userId) return;

    await mutate(
      {
        url: dynamicEndpoints.USER_CHANGE_PASSWORD(userId),
        method: "post",
        body: {
          old_password: data.old_password,
          new_password: data.new_password,
        },
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
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
          <DialogTitle>{t("change_user_password")}</DialogTitle>
          <DialogDescription>
            {t("enter_new_password_description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
        >
          <FieldGroup>
            <Controller
              name="old_password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>{t("old_password")}</FieldLabel>
                  <Input {...field} type="password" placeholder="••••••••" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="new_password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>{t("new_password")}</FieldLabel>
                  <Input {...field} type="password" placeholder="••••••••" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="confirm_password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>{t("confirm_password")}</FieldLabel>
                  <Input {...field} type="password" placeholder="••••••••" />
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
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("changing") : t("change_password")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
