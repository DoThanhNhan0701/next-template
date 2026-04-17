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

interface ServiceInfoSectionProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

export function ServiceInfoSection({ form }: ServiceInfoSectionProps) {
  return (
    <div className="flex flex-col gap-3 pt-6 mt-6 border-t">
      <h3 className="text-sm font-semibold text-primary border-b pb-2 tracking-tight">
        2. Service Provider Information
      </h3>

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          control={form.control}
          name="service_provider_name"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest uppercase">
                Service Provider Name *
              </FieldLabel>
              <Input {...field} className="h-12 bg-white" placeholder="e.g. Dell Warranty Center" />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="service_provider_address"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest uppercase">
                Service Provider Address
              </FieldLabel>
              <Input {...field} value={field.value || ""} className="h-12 bg-white" placeholder="Where is it located?" />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          control={form.control}
          name="taker_person_name"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest uppercase">
                Taker Name *
              </FieldLabel>
              <Input {...field} className="h-12 bg-white" placeholder="Who received the asset?" />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="taker_phone"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest uppercase">
                Taker Phone
              </FieldLabel>
              <Input {...field} value={field.value || ""} className="h-12 bg-white" placeholder="Phone number" />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          control={form.control}
          name="expected_cost"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest uppercase">
                Expected Cost
              </FieldLabel>
              <Input 
                {...field} 
                type="number" 
                className="h-12 bg-white"
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
            <Field>
              <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest uppercase">
                Actual Cost
              </FieldLabel>
              <Input 
                {...field} 
                type="number" 
                className="h-12 bg-white"
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
