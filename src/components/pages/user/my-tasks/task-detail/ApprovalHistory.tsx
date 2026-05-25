"use client";

import { useTranslations } from "next-intl";

import { CheckCircle2, Clock, History, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApprovalHistory as IApprovalHistory } from "@/types/task";
import { formatDateTime } from "@/utils/date";

interface ApprovalHistoryProps {
  historyPending: boolean;
  historyList: IApprovalHistory[] | null;
  getStatusInfo: (status: string) => { label: string; color: string };
}

export const ApprovalHistory = ({
  historyPending,
  historyList,
  getStatusInfo,
}: ApprovalHistoryProps) => {
  const t = useTranslations("page_my_tasks.detail.approval_history");
  return (
    <Card className="shadow-sm border-border/50 overflow-hidden bg-card/60 backdrop-blur-md mt-3 rounded-md">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-2 px-3">
        <History className="w-4 h-4 text-amber-500" />
        <CardTitle className="text-sm font-semibold text-primary">
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 bg-muted/5">
        {historyPending ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Skeleton className="w-12 h-12 rounded-full mb-4" />
            <Skeleton className="h-4 w-64" />
          </div>
        ) : !historyList || historyList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-muted-foreground/30 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground italic max-w-xs text-center leading-relaxed">
              {t("no_history")}
            </p>
          </div>
        ) : (
          <div className="relative space-y-0 pl-1">
            {/* Vertical Line */}
            <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-border/40" />

            {historyList.map((hist) => {
              const statusInfo = getStatusInfo(hist.status);
              const isApproved = hist.status === "APPROVED";
              const isRejected = hist.status === "REJECTED";

              return (
                <div
                  key={hist.id}
                  className="relative pl-9 pb-4 last:pb-0 group"
                >
                  {/* Timeline Dot */}
                  <div
                    className={`absolute left-0 top-1 w-7 h-7 rounded-full border-2 bg-background flex items-center justify-center z-10 transition-colors shadow-sm
                    ${isApproved ? "border-emerald-500/50 text-emerald-500" : isRejected ? "border-rose-500/50 text-rose-500" : "border-amber-500/50 text-amber-500"}`}
                  >
                    {isApproved ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : isRejected ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground leading-none">
                          {hist.step_name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] h-3.5 bg-muted/50 text-muted-foreground px-1 border-0 font-bold uppercase tracking-tight"
                        >
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground/50 uppercase">
                        {formatDateTime(hist.action_date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 grayscale-[0.5] opacity-80">
                      <span className="text-[10px] text-muted-foreground">
                        {t("by")}{" "}
                        <span className="font-bold text-foreground/80">
                          {hist.requester_name}
                        </span>
                      </span>
                    </div>

                    {hist.comment && (
                      <div className="mt-1 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/20 rounded-full" />
                        <div className="pl-2.5 py-1 pr-2 bg-muted/10 rounded-r-md border-y border-r border-border/5">
                          <p className="text-[11px] italic text-muted-foreground/90 whitespace-pre-wrap leading-relaxed">
                            {hist.comment}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
