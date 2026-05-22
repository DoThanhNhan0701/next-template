"use client";

import { useTranslations } from "next-intl";

import { Controller, UseFormReturn } from "react-hook-form";

import { DatePickerField } from "@/components/common/DatePickerField";
import { MaintenanceFormValues } from "@/components/schemas/user/maintenance.schema";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface GeneralInfoSectionProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

export function GeneralInfoSection({ form }: GeneralInfoSectionProps) {
  const t = useTranslations("page_maintenance.form");

  return (
    <div className="flex flex-col gap-3">
      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Controller
          control={form.control}
          name="record_number"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("record_number")}</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white"
                placeholder={t("placeholder_record")}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="external_link"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("external_link")}</FieldLabel>
              <Input
                {...field}
                value={field.value || ""}
                className="bg-white"
                placeholder={t("placeholder_link")}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Controller
          control={form.control}
          name="outing_date"
          render={({ fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("outing_date")}</FieldLabel>
              <DatePickerField form={form} name="outing_date" />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="handover_person"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("handover_person")}</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white"
                placeholder={t("placeholder_handover")}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <Controller
        control={form.control}
        name="reason"
        render={({ field, fieldState }) => (
          <Field className="gap-1">
            <FieldLabel>{t("reason")}</FieldLabel>
            <Textarea
              {...field}
              value={field.value ?? ""}
              className="min-h-[100px] bg-white"
              placeholder={t("placeholder_reason")}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="notes"
        render={({ field, fieldState }) => (
          <Field className="gap-1">
            <FieldLabel>{t("notes")}</FieldLabel>
            <Textarea
              {...field}
              value={field.value || ""}
              className="min-h-[80px] bg-white"
              placeholder={t("placeholder_notes")}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </div>
  );
}
