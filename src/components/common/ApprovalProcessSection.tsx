"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { ApproverSelect } from "@/components/common/ApproverSelect";
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
import { ITemplateStep } from "@/types/template";
import { cn } from "@/lib/utils";

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
  useApproverSelect = true,
  showStepNumber = false,
  triggerClassName,
  className,
  gridClassName,
  fallbackMessage,
}: ApprovalProcessSectionProps<TFieldValues>) {
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
        <FieldGroup className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", gridClassName)}>
          {steps.map((step, idx) => {
            const name = `approvals.step_${idx}` as Path<TFieldValues>;
            return (
              <Controller
                key={step.id}
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel>
                      {showStepNumber ? `Step ${idx + 1}: ` : ""}
                      {step.name}
                    </FieldLabel>
                    {useApproverSelect ? (
                      <ApproverSelect
                        step={step}
                        allUsers={users}
                        value={field.value != null ? field.value.toString() : ""}
                        onChange={(val) =>
                          field.onChange(val === "none" ? null : Number(val))
                        }
                        triggerClassName={cn(
                          "h-12 bg-white rounded-md border-muted-foreground/20 shadow-sm transition-all hover:border-primary/50 focus:ring-4 focus:ring-primary/5",
                          triggerClassName
                        )}
                      />
                    ) : (
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value ? field.value.toString() : ""}
                      >
                        <SelectTrigger className={cn("h-12 bg-white rounded-md border-muted-foreground/20 shadow-sm transition-all focus:ring-2 focus:ring-primary/20", triggerClassName)}>
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
                    )}
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
