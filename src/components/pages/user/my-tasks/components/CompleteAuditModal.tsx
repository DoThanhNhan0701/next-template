"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ITask } from "@/types/task";

interface CompleteAuditModalProps {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function CompleteAuditModal({
  task,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}: CompleteAuditModalProps) {
  const t = useTranslations("page_my_tasks.modals.complete_audit");

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] flex flex-col p-0 overflow-hidden border-border/40 shadow-2xl">
        <DialogHeader className="p-3 shrink-0 border-b">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <DialogTitle className="text-lg font-bold tracking-tight">
              {t("title")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-[10px] text-muted-foreground mt-0.5 tracking-wide">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-5 py-5">
          <div className="bg-background/40 backdrop-blur-sm rounded-lg p-3 border border-border/40 shadow-inner">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70">
                  {t("audit_title")}
                </span>
                <span className="text-sm font-bold text-foreground/90 leading-tight">
                  {task.document_record_number}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70">
                  {t("process_type")}
                </span>
                <span className="text-xs font-extrabold text-primary/80">
                  {task.step_name}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2.5 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 text-orange-200/90">
            <AlertCircle
              size={14}
              className="mt-0.5 shrink-0 text-orange-500"
            />
            <p className="text-[10px] font-medium leading-relaxed">
              {t.rich("alert", {
                status: () => (
                  <span className="text-emerald-400 font-bold uppercase tracking-wider">
                    {t("status_complete")}
                  </span>
                ),
              })}
            </p>
          </div>
        </div>

        <DialogFooter className="p-3 shrink-0 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t("cancel")}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? t("submitting") : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
