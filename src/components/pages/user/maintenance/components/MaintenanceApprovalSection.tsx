"use client";

import { Controller, UseFormReturn } from "react-hook-form";

import { MaintenanceFormValues } from "@/components/schemas/user/maintenance.schema";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IUser } from "@/types/auth";
import { ITemplate } from "@/types/template";

interface MaintenanceApprovalSectionProps {
  form: UseFormReturn<MaintenanceFormValues>;
  users: IUser[];
  activeTemplate?: ITemplate;
}

export function MaintenanceApprovalSection({
  form,
  users,
  activeTemplate,
}: MaintenanceApprovalSectionProps) {
  if (!activeTemplate?.steps || activeTemplate.steps.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
        No approval workflow configured for this process type.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {activeTemplate.steps.map((step, index) => (
          <Controller
            key={step.id}
            name={`approvals.step_${index}`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="gap-1">
                <FieldLabel>
                  Step {index + 1}: {step.name}
                </FieldLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? field.value.toString() : ""}
                >
                  <SelectTrigger className="h-12 bg-white rounded-md border-muted-foreground/20 shadow-sm transition-all focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder={`Select ${step.name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.full_name} ({user.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ))}
      </FieldGroup>
    </div>
  );
}
