"use client";

import { UseFormReturn, Controller } from "react-hook-form";
import { MaintenanceFormValues } from "../MaintenanceFormModal";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface GeneralInfoSectionProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

export function GeneralInfoSection({ form }: GeneralInfoSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          control={form.control}
          name="record_number"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                Record Number *
              </FieldLabel>
              <Input
                {...field}
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
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                Ticket Number *
              </FieldLabel>
              <Input
                {...field}
                className="bg-white"
                placeholder="e.g. TKT-10293"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          control={form.control}
          name="outing_date"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                Outing Date *
              </FieldLabel>
              <Input {...field} type="date" className="bg-white" />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="handover_person"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                Handover Person *
              </FieldLabel>
              <Input
                {...field}
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
            <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest">
              Reason *
            </FieldLabel>
            <Textarea
              {...field}
              className="min-h-[100px] bg-white"
              placeholder="Why is this asset being maintained?"
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          control={form.control}
          name="external_link"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                External Link
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
            <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest">
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
