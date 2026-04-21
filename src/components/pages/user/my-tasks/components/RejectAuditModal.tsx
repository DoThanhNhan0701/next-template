"use client";

import { useState } from "react";

import { AlertCircle, XCircle } from "lucide-react";

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

interface RejectAuditModalProps {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isSubmitting?: boolean;
}

export function RejectAuditModal({
  task,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}: RejectAuditModalProps) {
  const [reason, setReason] = useState("");

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] flex flex-col p-0 overflow-hidden border-destructive/20 shadow-2xl">
        <DialogHeader className="p-5 pb-3 shrink-0 border-b bg-destructive/5">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive" />
            <DialogTitle className="text-lg font-bold tracking-tight text-destructive/90">
              Reject Audit
            </DialogTitle>
          </div>
          <DialogDescription className="text-[10px] text-muted-foreground mt-0.5 tracking-wide">
            Please provide a reason for rejecting this audit record.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-5 py-5 overflow-y-auto">
          <div className="bg-background/40 backdrop-blur-sm rounded-lg p-3 border border-border/40 shadow-inner mb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70">
                Audit Record
              </span>
              <span className="text-sm font-bold text-foreground/90 leading-tight">
                {task.document_record_number}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
              Rejection Reason
            </Label>
            <Textarea
              placeholder="Explain why this audit is being rejected..."
              className="min-h-[100px] bg-background/50 border-border/60 focus-visible:ring-destructive/20 focus-visible:border-destructive/50 resize-none rounded-lg text-sm transition-all shadow-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 text-orange-200/90">
            <AlertCircle
              size={14}
              className="mt-0.5 shrink-0 text-orange-500"
            />
            <p className="text-[10px] font-medium leading-relaxed">
              Rejecting this audit will notify the assignee and return it to a
              pending state for correction.
            </p>
          </div>
        </div>

        <DialogFooter className="p-5 pt-3 shrink-0 border-t bg-muted/5">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9 px-4 font-bold uppercase text-[9px] tracking-widest hover:bg-muted/20"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(reason)}
            disabled={isSubmitting || !reason.trim()}
            className="h-9 font-bold uppercase text-[9px] tracking-widest px-6 shadow-lg shadow-destructive/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
