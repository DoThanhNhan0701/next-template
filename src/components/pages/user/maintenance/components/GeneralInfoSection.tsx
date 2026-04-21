"use client";

import { Controller, UseFormReturn } from "react-hook-form";

import { DatePickerField } from "@/components/common/DatePickerField";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { MaintenanceFormValues } from "../MaintenanceFormModal";

interface GeneralInfoSectionProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

export function GeneralInfoSection({ form }: GeneralInfoSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Controller
          control={form.control}
          name="record_number"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>
                Record number
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white"
                placeholder="e.g. BT20240001"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="ticket_number"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>
                Ticket number
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white"
                placeholder="e.g. TKT-10293"
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
              <FieldLabel>
                Outing date
              </FieldLabel>
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
              <FieldLabel>
                Handover person
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white"
                placeholder="Who handed over the asset?"
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
            <FieldLabel>
              Reason
            </FieldLabel>
            <Textarea
              {...field}
              value={field.value ?? ""}
              className="min-h-[100px] bg-white"
              placeholder="Why is this asset being maintained?"
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Controller
          control={form.control}
          name="external_link"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>
                External link
              </FieldLabel>
              <Input
                {...field}
                value={field.value || ""}
                className="bg-white"
                placeholder="https://..."
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <Controller
        control={form.control}
        name="notes"
        render={({ field, fieldState }) => (
          <Field className="gap-1">
            <FieldLabel>
              Notes
            </FieldLabel>
            <Textarea
              {...field}
              value={field.value || ""}
              className="min-h-[80px] bg-white"
              placeholder="Additional notes..."
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </div>
  );
}
