"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, PackageCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { useTranslations } from "next-intl";

import { DatePickerField } from "@/components/common/DatePickerField";
import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { SelectField } from "@/components/common/SelectField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { IUser } from "@/types/auth";
import { getTodayISO } from "@/utils/date";

const GetReturnSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    return_date: z.string().min(1, t("validation.return_date_required")),
    return_handover_person: z.string().min(1, t("validation.return_handover_person_required")),
    actual_cost: z.number().min(0),
    notes: z.string().optional(),
  });

type ReturnFormValues = z.infer<ReturnType<typeof GetReturnSchema>>;

interface MaintenanceReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    return_date: string;
    return_handover_person: string;
    actual_cost: number;
    notes?: string;
  }) => Promise<void>;
  pending: boolean;
}

export default function MaintenanceReturnModal({
  isOpen,
  onClose,
  onConfirm,
  pending,
}: MaintenanceReturnModalProps) {
  const t = useTranslations("MaintenanceReturnModal");

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(GetReturnSchema(t)),
    defaultValues: {
      return_date: getTodayISO(),
      return_handover_person: "",
      actual_cost: 0,
      notes: "",
    },
  });

  const { response: userRes } = useGet<IUser[]>(
    { url: endpoints.USERS },
    { disabled: !isOpen },
  );
  const users = userRes || [];

  useEffect(() => {
    if (isOpen) {
      form.reset({
        return_date: getTodayISO(),
        return_handover_person: "",
        actual_cost: 0,
        notes: "",
      });
    }
  }, [isOpen, form]);

  const onSubmit = (values: ReturnFormValues) => {
    onConfirm({
      return_date: values.return_date,
      return_handover_person: values.return_handover_person,
      actual_cost: values.actual_cost,
      notes: values.notes,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="px-5 pt-5 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <DialogTitle className="text-base font-bold leading-tight">
              {t("title")}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <div className="px-5 pb-4 flex flex-col gap-3.5">
            <FieldGroup className="flex flex-col gap-3.5">
              {/* Return Date */}
              <Controller
                name="return_date"
                control={form.control}
                render={({ fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                      {t("return_date")} <span className="text-destructive">*</span>
                    </FieldLabel>
                    <div className="[&_input]:h-10 [&_button]:h-10">
                      <DatePickerField form={form} name="return_date" />
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Return Person */}
              <Controller
                name="return_handover_person"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                      {t("return_handover_person")}
                    </FieldLabel>
                    <SelectField
                      options={users.map((s) => ({
                        label: `${s.full_name} (${s.username})`,
                        value: s.full_name || s.username || "",
                      }))}
                      value={field.value || null}
                      onChange={(val) => field.onChange(val)}
                      placeholder={t("placeholder_person")}
                      searchable
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Actual Cost */}
              <Controller
                name="actual_cost"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                      {t("actual_cost")}
                    </FieldLabel>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-muted-foreground text-sm font-semibold select-none z-10">
                        ₫
                      </span>
                      <FormattedNumberInput
                        {...field}
                        value={field.value ?? 0}
                        onChange={(val) => field.onChange(val ?? 0)}
                        placeholder="0"
                        className="bg-background border-border/60 h-10 pl-7 text-sm font-semibold text-emerald-600 focus:border-emerald-500"
                        aria-invalid={fieldState.invalid}
                      />
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Notes */}
              <Controller
                name="notes"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                      {t("notes")}
                    </FieldLabel>
                    <Input
                      {...field}
                      placeholder={t("placeholder_notes")}
                      className="bg-background border-border/60 h-10 text-sm"
                    />
                  </Field>
                )}
              />
            </FieldGroup>

            {/* Info note */}
            <p className="text-[11px] text-muted-foreground leading-relaxed bg-muted/40 rounded-lg px-3 py-2.5 border border-border/30">
              {t.rich("info_note", {
                inuse: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>,
                available: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>,
              })}
            </p>
          </div>

          <DialogFooter className="px-5 py-3.5 shrink-0 border-t flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
              className="h-9"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="h-9 bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5"
            >
              <PackageCheck className="w-4 h-4" />
              {pending ? t("processing") : t("confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
