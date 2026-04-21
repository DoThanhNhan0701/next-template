"use client";

import { useState } from "react";

import { CheckCircle2 } from "lucide-react";

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

interface ApproveTaskModalProps {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  isSubmitting?: boolean;
}

export function ApproveTaskModal({
  task,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}: ApproveTaskModalProps) {
  const [comment, setComment] = useState("");

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b bg-background">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <DialogTitle className="text-xl font-semibold">
              Approve request
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            You are approving the request for record{" "}
            {task.document_record_number}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="grid grid-cols-1 gap-3 mb-1">
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
                Processing note
              </Label>
              <Textarea
                placeholder="Enter your comments or reason here..."
                className="min-h-[120px] bg-background border-border/60 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50 resize-none rounded-md text-sm transition-all shadow-sm"
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
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(comment)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
