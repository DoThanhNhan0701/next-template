"use client";

import { Controller, UseFormReturn } from "react-hook-form";

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
  return (
    <div className="flex flex-col gap-3">
      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Controller
          control={form.control}
          name="service_provider_name"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>Service provider name</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white"
                placeholder="e.g. Dell Warranty Center"
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
              <FieldLabel>Service provider address</FieldLabel>
              <Input
                {...field}
                value={field.value || ""}
                className="bg-white"
                placeholder="Where is it located?"
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
              <FieldLabel>Taker name</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white"
                placeholder="Who received the asset?"
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
              <FieldLabel>Taker phone</FieldLabel>
              <Input
                {...field}
                value={field.value || ""}
                className="bg-white"
                placeholder="Phone number"
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
              <FieldLabel>Expected cost</FieldLabel>
              <Input
                {...field}
                value={field.value ?? 0}
                type="number"
                className="bg-white"
                onChange={(e) => field.onChange(Number(e.target.value))}
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
              <FieldLabel>Actual cost</FieldLabel>
              <Input
                {...field}
                value={field.value ?? 0}
                type="number"
                className="bg-white"
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>
    </div>
  );
}
