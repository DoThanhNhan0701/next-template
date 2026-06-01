import { useTranslations } from "next-intl";

import { Controller, UseFormReturn, useWatch } from "react-hook-form";

import { DatePickerField } from "@/components/common/DatePickerField";
import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { SelectField } from "@/components/common/SelectField";
import { LiquidationFormValues } from "@/components/schemas/user/liquidation.schema";
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
import { Textarea } from "@/components/ui/textarea";
import { IStaff } from "@/types/staff";

interface GeneralLiquidationSectionProps {
  form: UseFormReturn<LiquidationFormValues>;
  users: IStaff[];
}

export function GeneralLiquidationSection({
  form,
  users,
}: GeneralLiquidationSectionProps) {
  const t = useTranslations("page_liquidations.form");

  const selectedUserIds =
    useWatch({
      control: form.control,
      name: "committee",
    }) || [];

  return (
    <div className="flex flex-col gap-2">
      <FieldGroup className="grid grid-cols-1 gap-2">
        <Controller
          control={form.control}
          name="liquidation_date"
          render={({ fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("liquidation_date")}</FieldLabel>
              <DatePickerField form={form} name="liquidation_date" />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Controller
          control={form.control}
          name="liquidation_type"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("liquidation_method")}</FieldLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <SelectTrigger className="bg-white shadow-sm">
                  <SelectValue placeholder={t("placeholder_method")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sell">{t("method_sell")}</SelectItem>
                  <SelectItem value="destroy">{t("method_destroy")}</SelectItem>
                  <SelectItem value="give">{t("method_donate")}</SelectItem>
                  <SelectItem value="other">{t("method_other")}</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="total_value"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("total_value")}</FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value ?? 0}
                onChange={(val) => field.onChange(val ?? 0)}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <Field className="gap-1">
        <FieldLabel>{t("committee")}</FieldLabel>
        <SelectField
          options={users.map((u) => ({
            label: `${u.full_name} - (${u.staff_code})`,
            value: u.id,
          }))}
          value={selectedUserIds}
          onChange={(val) => form.setValue("committee", val)}
          placeholder={t("placeholder_committee")}
          searchable
          searchPlaceholder={t("search_member")}
          multiple
        />
        <FieldError errors={[form.formState.errors.committee]} />
      </Field>

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Controller
          control={form.control}
          name="buyer_name"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("buyer")}</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white"
                placeholder={t("placeholder_buyer")}
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
              <FieldLabel>{t("doc_link")}</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white"
                placeholder={t("placeholder_link")}
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
              className="min-h-[80px] bg-white resize-none"
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
              className="min-h-[60px] bg-white resize-none"
              placeholder={t("placeholder_notes")}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </div>
  );
}
