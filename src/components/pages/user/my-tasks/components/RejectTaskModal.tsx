"use client";

import { useState } from "react";

import { XCircle } from "lucide-react";
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

interface RejectTaskModalProps {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  isSubmitting?: boolean;
}

export function RejectTaskModal({
  task,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}: RejectTaskModalProps) {
  const t = useTranslations("page_my_tasks.modals.reject_task");
  const [comment, setComment] = useState("");

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive" />
            <DialogTitle className="text-xl font-semibold">
              {t("title")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {t("description", { recordNumber: task.document_record_number })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="grid grid-cols-1 gap-3 mb-1">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {t("record_number", { fallback: "Record number" })}
              </span>
              <span className="text-sm font-semibold">
                {task.document_record_number}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {t("current_step", { fallback: "Current step" })}
              </span>
              <span className="text-sm font-bold text-blue-600">
                {task.step_name}
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <Label className="text-xs font-semibold text-muted-foreground tracking-wider">
                {t("reason_note")}
              </Label>
              <Textarea
                placeholder={t("placeholder")}
                className="min-h-[120px] bg-background border-border/60 focus-visible:ring-destructive/20 focus-visible:border-destructive/50 resize-none rounded-md text-sm transition-all shadow-sm"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
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
          <Button
            type="button"
            variant="destructive"
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
