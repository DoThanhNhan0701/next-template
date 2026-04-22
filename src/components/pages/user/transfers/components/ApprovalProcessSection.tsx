"use client";

import { Controller, UseFormReturn } from "react-hook-form";

import { ApproverSelect } from "@/components/common/ApproverSelect";
import { TransferFormValues } from "@/components/schemas/user/transfer.schema";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { IUser } from "@/types/auth";
import { ITemplate, ITemplateStep } from "@/types/template";

interface ApprovalProcessSectionProps {
  form: UseFormReturn<TransferFormValues>;
  users: IUser[];
  activeTransferTemplate: ITemplate | undefined;
}

export function ApprovalProcessSection({
  form,
  users,
  activeTransferTemplate,
}: ApprovalProcessSectionProps) {
  if (
    !activeTransferTemplate?.steps ||
    activeTransferTemplate.steps.length === 0
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 pt-3">
      <h3 className="text-sm font-semibold text-primary flex items-center gap-2 tracking-tight">
        <span>4. Approval Process</span>
      </h3>

      <div className="bg-muted/20 border rounded-md p-3 space-y-3">
        <FieldGroup className="grid grid-cols-2 gap-8">
          {activeTransferTemplate.steps.map((step: ITemplateStep, idx) => {
            const name =
              idx === 0 ? "approver_step_1_id" : "approver_step_2_id";
            return (
              <Controller
                key={`transfer-approver-${step.id}`}
                name={name as keyof TransferFormValues}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel>{step.name}</FieldLabel>
                    <ApproverSelect
                      step={step}
                      allUsers={users}
                      value={field.value ? field.value.toString() : ""}
                      onChange={(val) =>
                        field.onChange(val === "none" ? null : Number(val))
                      }
                      triggerClassName="h-14 bg-white rounded-md border-muted-foreground/30 shadow-sm transition-all hover:border-primary/50 focus:ring-4 focus:ring-primary/5"
                    />
                    <FieldError errors={[fieldState.error]} />
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
