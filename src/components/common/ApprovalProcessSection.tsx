"use client";

import { useCallback, useMemo } from "react";

import { Control, Controller, FieldValues, Path } from "react-hook-form";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { IUser } from "@/types/auth";
import { ITemplateStep } from "@/types/template";

import { SelectField } from "./SelectField";

interface ApprovalProcessSectionProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  steps: ITemplateStep[];
  users: IUser[];
  title?: string | React.ReactNode;
  useApproverSelect?: boolean;
  showStepNumber?: boolean;
  triggerClassName?: string;
  className?: string;
  gridClassName?: string;
  fallbackMessage?: string;
}

export function ApprovalProcessSection<TFieldValues extends FieldValues>({
  control,
  steps,
  users,
  title = "3. Approval Process",
  className,
  gridClassName,
  fallbackMessage,
}: ApprovalProcessSectionProps<TFieldValues>) {
  const availableUsers = useMemo(
    () => users.filter((u) => u.is_active),
    [users],
  );

  const getUserByStep = useCallback(
    (step: ITemplateStep) => {
      if (step.default_assignee_user_id) {
        return availableUsers.filter(
          (u) => u.id === step.default_assignee_user_id,
        );
      }

      if (step.default_assignee_role_id) {
        return availableUsers.filter(
          (u) => u.role_id === step.default_assignee_role_id,
        );
      }

      return availableUsers;
    },
    [availableUsers],
  );

  if (steps.length === 0) {
    if (fallbackMessage) {
      return (
        <div className="py-10 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
          {fallbackMessage}
        </div>
      );
    }
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {title && (
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2 tracking-tight">
          {title}
        </h3>
      )}

      <div className="bg-muted/20 border rounded-md p-3 space-y-3">
        <FieldGroup
          className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", gridClassName)}
        >
          {steps.map((step, idx) => {
            const name = `approvals.step_${idx}` as Path<TFieldValues>;
            return (
              <Controller
                key={step.id}
                name={name}
                defaultValue={(step?.default_assignee_user_id ?? undefined) as never}
                control={control}
                render={({ field, fieldState }) => {
                  return (
                    <Field className="gap-1">
                      <FieldLabel>{step.name}</FieldLabel>
                      <SelectField
                        options={(getUserByStep(step) ?? []).map((c) => ({
                          label: `${c.full_name} (${c.username})`,
                          value: c.id,
                        }))}
                        value={field.value as number}
                        onChange={(val) => field.onChange(Number(val))}
                        placeholder={`e.g. ${step.name}`}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />
            );
          })}
        </FieldGroup>
      </div>
    </div>
  );
}
