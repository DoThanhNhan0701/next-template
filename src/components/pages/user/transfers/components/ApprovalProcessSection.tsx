"use client";

import { UserCircle2 } from "lucide-react";
import { UseFormReturn, Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { TransferFormValues } from "../TransferFormModal";
import { IUser } from "@/types/auth";
import { ITemplate, ITemplateStep } from "@/types/template";
import { ApproverSelect } from "@/components/common/ApproverSelect";

interface ApprovalProcessSectionProps {
  form: UseFormReturn<TransferFormValues>;
  users: IUser[];
  activeTransferTemplate: ITemplate | undefined;
}

export function ApprovalProcessSection({ form, users, activeTransferTemplate }: ApprovalProcessSectionProps) {
  if (!activeTransferTemplate?.steps || activeTransferTemplate.steps.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 pt-4 border-t px-1">
      <h3 className="text-sm font-semibold text-primary pb-2 flex items-center gap-2 tracking-tight">
        <UserCircle2 className="w-5 h-5 text-primary" />
        <span>4. Approval Process</span>
      </h3>

      <div className="bg-muted/20 border rounded-md p-6 space-y-6">
        <FieldGroup className="grid grid-cols-2 gap-8">
          {activeTransferTemplate.steps.map((step: ITemplateStep, idx) => {
            const name = idx === 0 ? "approver_step_1_id" : "approver_step_2_id";
            return (
              <Controller
                key={`transfer-approver-${step.id}`}
                name={name as keyof TransferFormValues}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="gap-2.5">
                    <FieldLabel className="text-[10px] font-black text-muted-foreground/80 tracking-[0.15em] mb-1">
                      {step.name}
                    </FieldLabel>
                    <ApproverSelect
                      step={step}
                      allUsers={users}
                      value={field.value ? field.value.toString() : ""}
                      onChange={(val) => field.onChange(val === "none" ? null : Number(val))}
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
