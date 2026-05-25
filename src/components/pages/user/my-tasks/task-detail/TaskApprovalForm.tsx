"use client";

import { useTranslations } from "next-intl";

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
  const t = useTranslations("page_my_tasks.detail.approval_form");
  return (
    <Card className="border border-border/50 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md relative mt-2 rounded-md">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/60">
          {/* Action Info */}
          <div className="flex-1 p-2 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-primary/80">
                  {t("request_title")}
                </h2>
                <p className="text-sm font-medium text-foreground">
                  {t.rich("step_description", {
                    step: activeTask?.step_name ?? t("processing"),
                    b: (chunks) => (
                      <span className="font-bold text-primary">{chunks}</span>
                    ),
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          {activeTask?.status === "PENDING" && (
            <div className="md:w-[360px] p-2 bg-muted/30 flex flex-col gap-2 shrink-0">
              <div className="relative group">
                <MessageSquare className="absolute top-2.5 left-2.5 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-all duration-200" />
                <Textarea
                  placeholder={t("comment_placeholder")}
                  className="pl-8 min-h-[40px] h-[40px] bg-background border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all resize-none shadow-sm text-xs py-2"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-emerald-600/90 hover:bg-emerald-600 text-white gap-2 h-9 transition-all active:scale-95 shadow-sm text-xs font-bold"
                  onClick={() => onAction("APPROVED")}
                  disabled={mutatePending}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {mutatePending ? t("processing") : t("approve")}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-border/50 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 gap-2 h-9 transition-all active:scale-95 text-xs font-bold"
                  onClick={() => onAction("REJECTED")}
                  disabled={mutatePending}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {t("reject")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
