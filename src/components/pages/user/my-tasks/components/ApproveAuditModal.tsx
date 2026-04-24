"use client";

import { useState } from "react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ITask } from "@/types/task";

interface ApproveAuditModalProps {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  isSubmitting?: boolean;
}

export function ApproveAuditModal({
  task,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}: ApproveAuditModalProps) {
  const t = useTranslations("page_my_tasks.modals.approve_audit");
  const [comment, setComment] = useState("");

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] flex flex-col p-0 overflow-hidden border-emerald-500/20 shadow-2xl transition-all">
        <DialogHeader className="p-3 shrink-0 border-b">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <DialogTitle className="text-lg font-bold tracking-tight text-emerald-500/90">
              {t("title")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-[10px] text-muted-foreground mt-0.5 tracking-wide">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-5 py-5 overflow-y-auto">
          <div className="bg-background/40 backdrop-blur-sm rounded-lg p-3 border border-border/40 shadow-inner mb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70">
                {t("record_label")}
              </span>
              <span className="text-sm font-bold text-foreground/90 leading-tight">
                {task.document_record_number}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
              {t("note_label")}
            </Label>
            <Textarea
              placeholder={t("placeholder")}
              className="min-h-[100px] bg-background/50 border-border/60 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50 resize-none rounded-lg text-sm transition-all shadow-sm"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="mt-3 flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-200/90">
            <AlertCircle
              size={14}
              className="mt-0.5 shrink-0 text-emerald-500"
            />
            <p className="text-[10px] font-medium leading-relaxed">
              {t("alert")}
            </p>
          </div>
        </div>

        <DialogFooter className="p-3 shrink-0 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(comment)}
            disabled={isSubmitting}
          >
            {isSubmitting ? t("submitting") : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
