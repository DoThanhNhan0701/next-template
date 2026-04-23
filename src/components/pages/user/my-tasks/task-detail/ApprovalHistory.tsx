"use client";

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
  return (
    <Card className="shadow-sm border-border/50 overflow-hidden bg-card/60 backdrop-blur-md mt-4">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
        <History className="w-4 h-4 text-amber-500" />
        <CardTitle className="text-sm font-semibold text-primary leading-none">
          Approval history
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-muted/10">
        {historyPending ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Skeleton className="w-12 h-12 rounded-full mb-4" />
            <Skeleton className="h-4 w-64" />
          </div>
        ) : !historyList || historyList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-muted-foreground/30 animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground italic max-w-xs text-center leading-relaxed">
              The record is in the initialization stage or has no approval
              updates yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {historyList.map((hist) => (
              <div
                key={hist.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border/50 shadow-sm"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {hist.status === "APPROVED" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : hist.status === "REJECTED" ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {hist.step_name}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatDateTime(hist.action_date)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    By{" "}
                    <span className="font-semibold text-foreground">
                      {hist.requester_name}
                    </span>
                  </div>
                  {hist.comment && (
                    <div className="mt-2 text-sm italic text-muted-foreground bg-muted p-3 rounded-lg border-l-2 border-primary/50 whitespace-pre-wrap">
                      {hist.comment}
                    </div>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={`${getStatusInfo(hist.status).color} px-3 py-1 font-bold text-xs`}
                >
                  {getStatusInfo(hist.status).label}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
