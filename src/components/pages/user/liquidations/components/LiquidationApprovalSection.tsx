"use client";

import { Controller, UseFormReturn } from "react-hook-form";

import { LiquidationFormValues } from "@/components/schemas/user/liquidation.schema";
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

interface LiquidationApprovalSectionProps {
  form: UseFormReturn<LiquidationFormValues>;
  users: IUser[];
  activeTemplate?: ITemplate;
}

export function LiquidationApprovalSection({
  form,
  users,
  activeTemplate,
}: LiquidationApprovalSectionProps) {
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
          <div key={step.id}>
            <Controller
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
          </div>
        ))}
      </FieldGroup>
    </div>
  );
}
