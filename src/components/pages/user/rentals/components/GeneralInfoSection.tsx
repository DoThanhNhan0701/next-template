"use client";

import { useTranslations } from "next-intl";

import { Controller, type UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { DatePickerField } from "@/components/common/DatePickerField";
import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { SelectField } from "@/components/common/SelectField";
import { RentalCreateSchema } from "@/components/schemas/user/rental.schema";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ICustomer } from "@/types/customer";
import { IOrgUnit } from "@/types/org";

type RentalFormValues = z.input<typeof RentalCreateSchema>;

interface GeneralInfoSectionProps {
  form: UseFormReturn<RentalFormValues>;
  orgUnits: IOrgUnit[];
  customers: ICustomer[];
}

export function GeneralInfoSection({
  form,
  orgUnits,
  customers,
}: GeneralInfoSectionProps) {
  const t = useTranslations("page_rentals");

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-primary border-b pb-1">
        {t("form.general_info")}
      </h3>
      <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Controller
          name="contract_number"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("form.contract_number")}</FieldLabel>
              <Input {...field} placeholder={t("form.placeholder_contract")} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="external_link"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-1">
              <FieldLabel>{t("form.external_link")}</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder={t("form.placeholder_link")}
              />
            </Field>
          )}
        />
        <Controller
          name="unit_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("form.organization")}</FieldLabel>

              <SelectField
                className="w-full min-w-0"
                options={(orgUnits ?? [])
                  .filter((c) => c.is_active)
                  .map((c) => ({
                    label: `${c.name} (${c.code})`,
                    value: c.id,
                  }))}
                value={field.value as number}
                onChange={(val) => field.onChange(Number(val))}
                placeholder={t("form.placeholder_org")}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="customer_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("form.customer")}</FieldLabel>
              <SelectField
                className="w-full min-w-0"
                options={(customers ?? [])
                  .filter((c) => c.is_active)
                  .map((c) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                value={field.value as number}
                onChange={(val) => field.onChange(Number(val))}
                placeholder={t("form.placeholder_customer")}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="lease_date"
          control={form.control}
          render={({ fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("form.lease_date")}</FieldLabel>
              <DatePickerField form={form} name="lease_date" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="duration_days"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("form.duration")}</FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value as number | string | null}
                onChange={(val) => field.onChange(val ?? 0)}
                placeholder={t("form.placeholder_duration")}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="total_revenue"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("form.total_revenue")}</FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value as number | string | null}
                onChange={(val) => field.onChange(val ?? 0)}
                placeholder={t("form.placeholder_revenue")}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="reason"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1 col-span-full">
              <FieldLabel>{t("form.reason")}</FieldLabel>
              <Textarea
                {...field}
                placeholder={t("form.placeholder_reason")}
                className="min-h-[80px]"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </div>
  );
}
