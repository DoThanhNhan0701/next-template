import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ClipboardCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { DatePickerField } from "@/components/common/DatePickerField";
import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { IRentalFull } from "@/types/rental";
import { getTodayISO } from "@/utils/date";

const RentalRenewSchema = z.object({
  contract_number: z.string().min(1, "Số hợp đồng mới là bắt buộc!"),
  lease_date: z.string().min(1, "Ngày bắt đầu là bắt buộc!"),
  duration_days: z.number().min(1, "Thời hạn thuê phải lớn hơn 0!"),
  total_revenue: z.number().min(0, "Tổng doanh thu mới không hợp lệ!"),
  notes: z.string().optional(),
});

type RentalRenewFormValues = z.infer<typeof RentalRenewSchema>;

interface RentalRenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    new_contract_number: string;
    new_lease_date: string;
    new_duration_days: number;
    new_total_revenue: number;
    notes?: string;
  }) => Promise<void>;
  pending: boolean;
  rentalDetail: IRentalFull;
}

export default function RentalRenewModal({
  isOpen,
  onClose,
  onConfirm,
  pending,
  rentalDetail,
}: RentalRenewModalProps) {
  const form = useForm<RentalRenewFormValues>({
    resolver: zodResolver(RentalRenewSchema),
    defaultValues: {
      contract_number: "",
      lease_date: getTodayISO(),
      duration_days: 30,
      total_revenue: rentalDetail?.total_revenue || 0,
      notes: "",
    },
  });

  const t = useTranslations('RentalRenewModal');
  useEffect(() => {
    if (isOpen && rentalDetail) {
      form.reset({
        contract_number: `${rentalDetail.record_number}-RENEW`,
        lease_date: getTodayISO(),
        duration_days: 30,
        total_revenue: rentalDetail.total_revenue || 0,
        notes: "",
      });
    }
  }, [isOpen, rentalDetail, form]);

  const onSubmit = (values: RentalRenewFormValues) => {
    onConfirm({
      new_contract_number: values.contract_number,
      new_lease_date: new Date(values.lease_date).toISOString(),
      new_duration_days: Number(values.duration_days),
      new_total_revenue: Number(values.total_revenue),
      notes: values.notes,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle className="text-base font-bold">{t('title')}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">{t('description')}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 px-6 py-4 overflow-y-auto flex flex-col gap-4">
            <FieldGroup className="flex flex-col gap-3">
              <Field className="gap-1">
                <FieldLabel className="text-[10px] font-bold text-muted-foreground tracking-wider">
                  {t('customer_info')}
                </FieldLabel>
                <Input
                  value={rentalDetail.customer?.name || ""}
                  disabled
                  className="bg-muted/40 text-foreground/80 font-bold border-border/50 h-10 select-none cursor-not-allowed"
                />
              </Field>

              {/* New Contract Number */}
              <Controller
                name="contract_number"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel className="text-[10px] font-bold text-muted-foreground tracking-wider">
                      {t('new_contract_number')} <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      placeholder="Nhập số hợp đồng mới..."
                      className="bg-white border-border/60 h-10 text-sm focus:border-emerald-500"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* 2-Column row: Start Date & Duration */}
              <div className="grid grid-cols-2 gap-3.5">
                <Controller
                  name="lease_date"
                  control={form.control}
                  render={({ fieldState }) => (
                    <Field className="gap-1">
                      <FieldLabel className="text-[10px] font-bold text-muted-foreground tracking-wider">
                        {t('lease_date')} <span className="text-destructive">*</span>
                      </FieldLabel>
                      <div className="[&_input]:h-10 [&_button]:h-10">
                        <DatePickerField form={form} name="lease_date" />
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="duration_days"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1">
                      <FieldLabel className="text-[10px] font-bold text-muted-foreground tracking-wider">
                        {t('duration_days')} <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                        placeholder="30"
                        className="bg-white border-border/60 h-10 text-sm"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              {/* New Total Revenue */}
              <Controller
                name="total_revenue"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel className="text-[10px] font-bold text-muted-foreground tracking-wider">
                      {t('total_revenue')}
                    </FieldLabel>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-muted-foreground text-sm font-semibold select-none">
                        ₫
                      </span>
                      <FormattedNumberInput
                        {...field}
                        value={field.value ?? 0}
                        onChange={(val) => field.onChange(val ?? 0)}
                        placeholder="0"
                        className="bg-white border-border/60 h-10 pl-7 text-sm font-semibold text-emerald-600 focus:border-emerald-500"
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
                    <FieldLabel className="text-[10px] font-bold text-muted-foreground tracking-wider">
                      {t('notes')}
                    </FieldLabel>
                    <Textarea
                      {...field}
                      placeholder="Nhập ghi chú hoặc lý do gia hạn..."
                      className="min-h-[85px] text-sm bg-white border-border/60 focus:border-emerald-500"
                    />
                  </Field>
                )}
              />
            </FieldGroup>

            {/* Warning Alert Container */}
            <div className="flex gap-2.5 items-start bg-amber-500/5 text-amber-800 border border-amber-500/20 rounded-lg p-3 text-xs leading-relaxed mt-1">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{t('warning_message', { record_number: rentalDetail.record_number })}</span>
            </div>
          </div>

          {/* Footer actions */}
          <DialogFooter className="p-3 shrink-0 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              <ClipboardCheck className="h-4 w-4 mr-2" />
              {pending ? t('processing') : t('confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
