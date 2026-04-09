"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { XCircle } from "lucide-react";
import { ITask } from "@/types/task";
import { Label } from "@/components/ui/label";

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
  const [comment, setComment] = useState("");

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b bg-background">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive" />
            <DialogTitle className="text-xl font-semibold">
              Reject request
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            You are rejecting the request for record{" "}
            {task.document_record_number}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="grid grid-cols-1 gap-4 mb-1">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Record number
              </span>
              <span className="text-sm font-semibold">
                {task.document_record_number}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Current step
              </span>
              <span className="text-sm font-bold text-blue-600">
                {task.step_name}
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <Label className="text-xs font-semibold text-muted-foreground tracking-wider">
                Rejection reason
              </Label>
              <Textarea
                placeholder="Enter the reason for rejection here..."
                className="min-h-[120px] bg-background border-border/60 focus-visible:ring-destructive/20 focus-visible:border-destructive/50 resize-none rounded-md text-sm transition-all shadow-sm"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 shrink-0 border-t bg-background">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(comment)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Confirm rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
