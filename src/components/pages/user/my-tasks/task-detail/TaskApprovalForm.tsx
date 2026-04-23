"use client";

import { CheckCircle2, MessageSquare, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface TaskApprovalFormProps {
  activeTask: {
    step_name?: string;
    status: string;
  } | null;
  comment: string;
  setComment: (comment: string) => void;
  mutatePending: boolean;
  onAction: (status: "APPROVED" | "REJECTED") => void;
}

export const TaskApprovalForm = ({
  activeTask,
  comment,
  setComment,
  mutatePending,
  onAction,
}: TaskApprovalFormProps) => {
  return (
    <Card className="border border-border/50 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md relative mt-2">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80" />
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/60">
          {/* Action Info */}
          <div className="flex-1 p-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-primary">
                  Approval request
                </h2>
                <p className="text-sm text-muted-foreground">
                  You are at step{" "}
                  <span className="font-bold text-primary">
                    {activeTask?.step_name ?? "Processing"}
                  </span>
                  . Please review the details and take action.
                </p>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          {activeTask?.status === "PENDING" && (
            <div className="md:w-[400px] p-3 bg-muted/30 flex flex-col gap-3">
              <div className="relative group">
                <MessageSquare className="absolute top-3 left-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all duration-200" />
                <Textarea
                  placeholder="Enter approval notes (optional)..."
                  className="pl-10 min-h-[80px] bg-background border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all resize-none shadow-sm text-sm"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-emerald-600/90 hover:bg-emerald-600 text-white gap-2 h-11 transition-all active:scale-95 shadow-sm"
                  onClick={() => onAction("APPROVED")}
                  disabled={mutatePending}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {mutatePending ? "Processing..." : "Approve"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-border/50 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 gap-2 h-11 transition-all active:scale-95"
                  onClick={() => onAction("REJECTED")}
                  disabled={mutatePending}
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
