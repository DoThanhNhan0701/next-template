"use client";

import { useTranslations } from "next-intl";

import { Controller, UseFormReturn } from "react-hook-form";

import { DatePickerField } from "@/components/common/DatePickerField";
import { FormAttachmentsSection } from "@/components/common/FormAttachmentsSection";
import { SelectField } from "@/components/common/SelectField";
import { TransferFormValues } from "@/components/schemas/user/transfer.schema";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ILocation } from "@/types/location";
import { IStaff } from "@/types/staff";

interface TargetDestinationSectionProps {
  form: UseFormReturn<TransferFormValues>;
  staffs: IStaff[];
  locations: ILocation[];
  watchedType: "holder" | "location";
}

export function TargetDestinationSection({
  form,
  staffs,
  locations,
  watchedType,
}: TargetDestinationSectionProps) {
  const t = useTranslations("page_transfers");
  return (
    <div className="flex flex-col gap-3 pt-3">
      <h3 className="text-sm font-semibold text-primary flex items-center gap-2 tracking-tight">
        <span>{t("form.target_destination")}</span>
      </h3>

      <div className="bg-muted/20 border rounded-md p-3 space-y-3">
        {watchedType === "holder" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <Controller
              name="target_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="gap-1">
                  <FieldLabel>{t("form.select_specific_personnel")}</FieldLabel>
                  <SelectField
                    options={(staffs ?? []).map((a) => ({
                      label: `${a.full_name} - (${a?.staff_code ?? ""})`,
                      value: a.id,
                    }))}
                    value={field.value as number}
                    onChange={(val) => field.onChange(Number(val))}
                    placeholder={t("form.select_specific_personnel")}
                  />

                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>
        )}

        {watchedType === "location" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <Controller
              name="target_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="gap-1">
                  <FieldLabel>{t("form.select_target_location")}</FieldLabel>
                  <SelectField
                    options={(locations ?? []).map((a) => ({
                      label: `${a.name} - (${a.code})`,
                      value: a.id,
                    }))}
                    value={field.value as number}
                    onChange={(val) => field.onChange(Number(val))}
                    placeholder={t("form.select_target_location")}
                  />

                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <Controller
          name="transfer_date"
          control={form.control}
          render={({ fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("form.transfer_date")}</FieldLabel>
              <DatePickerField form={form} name="transfer_date" />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="external_link"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="sm:col-span-1 md:col-span-2 gap-1">
              <FieldLabel>{t("form.external_link")}</FieldLabel>
              <Input
                placeholder={t("form.placeholder_link")}
                {...field}
                value={field.value || ""}
                className="bg-white rounded-md border-muted-foreground/20"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="reason"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="col-span-full gap-1">
              <FieldLabel>{t("form.reason_notes")}</FieldLabel>
              <Textarea
                placeholder={t("form.enter_reason")}
                {...field}
                value={field.value || ""}
                className="bg-white rounded-md border-muted-foreground/20 min-h-[100px] resize-none"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
      <FormAttachmentsSection
        className="[&>h3]:text-xs [&>h3]:font-semibold [&>h3]:tracking-wider [&>h3]:text-muted-foreground"
        control={form.control}
      />
    </div>
  );
}
