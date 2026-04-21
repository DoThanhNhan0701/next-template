"use client";

import { useEffect } from "react";

import { Controller, UseFormReturn } from "react-hook-form";

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

import { MaintenanceFormValues } from "../MaintenanceFormModal";

interface ApprovalProcessSectionProps {
  form: UseFormReturn<MaintenanceFormValues>;
  users: IUser[];
  activeTemplate?: ITemplate;
}

export function ApprovalProcessSection({
  form,
  users,
  activeTemplate,
}: ApprovalProcessSectionProps) {
  // Map steps to workflow_assignments in the form
  useEffect(() => {
    if (activeTemplate?.steps && activeTemplate.steps.length > 0) {
      const currentAssignments = form.getValues("workflow_assignments") || [];
      if (currentAssignments.length === 0) {
        const initialAssignments = activeTemplate.steps.map((step) => ({
          step_id: step.id,
          user_id: 0,
        }));
        form.setValue("workflow_assignments", initialAssignments);
      }
    }
  }, [activeTemplate, form]);

  if (
    !activeTemplate ||
    !activeTemplate.steps ||
    activeTemplate.steps.length === 0
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {activeTemplate.steps.map((step, index) => (
          <Controller
            key={step.id}
            name={`workflow_assignments.${index}.user_id`}
            control={form.control}
            rules={{ required: "Approver is required" }}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>
                  Step {index + 1}: {step.name}
                </FieldLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? field.value.toString() : ""}
                >
                  <SelectTrigger className="h-12 bg-white rounded-md border-muted-foreground/20 shadow-sm">
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
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        ))}
      </FieldGroup>
    </div>
  );
}
