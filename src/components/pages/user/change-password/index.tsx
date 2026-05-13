"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

import { GetUserChangePasswordSchema } from "@/components/schemas/admin/user.schema";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { dynamicEndpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { AppDispatch, RootState } from "@/redux";
import { actionLogout } from "@/redux/slices/auth";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

export default function ChangePasswordPage() {
  const t = useTranslations("page_users");
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { mutate, pending } = useMutation();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const schema = GetUserChangePasswordSchema(t);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (
    data: z.infer<ReturnType<typeof GetUserChangePasswordSchema>>,
  ) => {
    if (!user?.id) return;

    await mutate(
      {
        url: dynamicEndpoints.USER_CHANGE_PASSWORD(user.id),
        method: "post",
        body: {
          old_password: data.old_password,
          new_password: data.new_password,
        },
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          dispatch(actionLogout());
          router.push("/auth/login");
        },
        onError: (err) => {
          getApiErrorMessage(err);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <KeyRound className="h-6 w-6 text-primary" />
          {t("change_password")}
        </h1>
        <p className="text-muted-foreground">
          {t("enter_new_password_description")}
        </p>
      </div>

      <div className="rounded-xl border border-(--surface-border-color) bg-(--surface-container-low) p-6 shadow-sm">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup className="gap-5">
            <Controller
              name="old_password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel className="text-sm font-medium">
                    {t("old_password")}
                  </FieldLabel>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      {...field}
                      type={showOldPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowOldPassword((prev) => !prev)}
                      tabIndex={-1}
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Controller
                name="new_password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel className="text-sm font-medium">
                      {t("new_password")}
                    </FieldLabel>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <Input
                        {...field}
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
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
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel className="text-sm font-medium">
                      {t("confirm_password")}
                    </FieldLabel>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={pending}
              className="px-6 font-medium transition-all hover:bg-muted"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
            >
              {pending ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  <span>{t("changing")}</span>
                </div>
              ) : (
                t("change_password")
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
