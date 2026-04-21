"use client";

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

import { LiquidationFormValues } from "../schema";

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
        Không có quy trình phê duyệt cho loại nghiệp vụ này.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {activeTemplate.steps.map((step, index) => (
          <div key={step.id}>
            <Controller
              name={`workflow_assignments.${index}.step_id`}
              control={form.control}
              render={({ field }) => (
                <input type="hidden" {...field} value={step.id} />
              )}
            />
            <Controller
              name={`workflow_assignments.${index}.user_id`}
              control={form.control}
              rules={{ required: "Approver is required" }}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel className="text-xs font-semibold text-muted-foreground block">
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
