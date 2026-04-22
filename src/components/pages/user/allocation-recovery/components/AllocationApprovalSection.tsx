"use client";

import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { ApproverSelect } from "@/components/common/ApproverSelect";
import { AllocationCreateSchema } from "@/components/schemas/user/allocation.schema";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { IUser } from "@/types/auth";
import { ITemplate, ITemplateStep } from "@/types/template";

type AllocationFormValues = z.input<typeof AllocationCreateSchema>;

interface AllocationApprovalSectionProps {
  form: UseFormReturn<AllocationFormValues>;
  users: IUser[];
  activeTemplate: ITemplate | null | undefined;
}

export function AllocationApprovalSection({
  form,
  users,
  activeTemplate,
}: AllocationApprovalSectionProps) {
  if (!activeTemplate || (activeTemplate.steps || []).length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-primary">
        3. Approval Process
      </h3>
      <div className="bg-muted/20 border rounded-md p-3 space-y-3 shadow-inner">
        <FieldGroup className="grid grid-cols-2 gap-3">
          {(activeTemplate.steps || []).map((step: ITemplateStep, idx) => {
            const name = `approvals.step_${idx}`;
            return (
              <Controller
                key={step.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                name={name as any}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel>{step.name}</FieldLabel>
                    <ApproverSelect
                      step={step}
                      allUsers={users}
                      value={field.value != null ? field.value.toString() : ""}
                      onChange={(val) =>
                        field.onChange(val === "none" ? null : Number(val))
                      }
                      triggerClassName="h-12 bg-white rounded-md border-muted-foreground/20 shadow-sm transition-all hover:border-primary/50 focus:ring-4 focus:ring-primary/5"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            );
          })}
        </FieldGroup>
      </div>
    </div>
  );
}
