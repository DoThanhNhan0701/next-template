"use client";

import { useTranslations } from "next-intl";
import { Controller, UseFormReturn } from "react-hook-form";

import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { MaintenanceFormValues } from "@/components/schemas/user/maintenance.schema";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";

interface ServiceInfoSectionProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

export function ServiceInfoSection({ form }: ServiceInfoSectionProps) {
  const t = useTranslations("page_maintenance.form");

  return (
    <div className="flex flex-col gap-3">
      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Controller
          control={form.control}
          name="service_provider_name"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("service_provider")}</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white"
                placeholder={t("placeholder_provider")}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="service_provider_address"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("service_provider_address")}</FieldLabel>
              <Input
                {...field}
                value={field.value || ""}
                className="bg-white"
                placeholder={t("placeholder_address")}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Controller
          control={form.control}
          name="taker_person_name"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("taker_person")}</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white"
                placeholder={t("placeholder_taker")}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="taker_phone"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("taker_phone")}</FieldLabel>
              <Input
                {...field}
                value={field.value || ""}
                className="bg-white"
                placeholder={t("placeholder_phone")}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Controller
          control={form.control}
          name="expected_cost"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("expected_cost")}</FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value as number | string | null}
                onChange={(val) => field.onChange(val ?? 0)}
                placeholder="e.g. 500,000"
                className="bg-white"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="actual_cost"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("actual_cost")}</FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value as number | string | null}
                onChange={(val) => field.onChange(val ?? 0)}
                placeholder="e.g. 500,000"
                className="bg-white"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>
    </div>
  );
}
