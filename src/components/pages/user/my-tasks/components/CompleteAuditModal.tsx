"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";
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
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] flex flex-col p-0 overflow-hidden border-border/40 shadow-2xl">
        <DialogHeader className="p-5 pb-3 shrink-0 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <DialogTitle className="text-lg font-bold tracking-tight">
              Complete Audit
            </DialogTitle>
          </div>
          <DialogDescription className="text-[10px] text-muted-foreground mt-0.5 tracking-wide">
            Are you sure you want to mark this audit as complete?
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-5 py-5">
          <div className="bg-background/40 backdrop-blur-sm rounded-lg p-4 border border-border/40 shadow-inner">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70">
                  Audit Title
                </span>
                <span className="text-sm font-bold text-foreground/90 leading-tight">
                  {task.document_record_number}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70">
                  Process Type
                </span>
                <span className="text-xs font-extrabold text-primary/80">
                  {task.step_name}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 text-orange-200/90">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-orange-500" />
            <p className="text-[10px] font-medium leading-relaxed">
              Once completed, this audit will be moved to the <span className="text-emerald-400 font-bold uppercase tracking-wider">approved</span> status and can no longer be edited.
            </p>
          </div>
        </div>

        <DialogFooter className="p-5 pt-3 shrink-0 border-t bg-muted/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9 px-4 font-bold uppercase text-[9px] tracking-widest hover:bg-muted/20"
          >
            Go back
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-[9px] tracking-widest px-6 shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? "Completing..." : "Confirm & Complete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
