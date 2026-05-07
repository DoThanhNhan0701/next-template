"use client";

import { useTranslations } from "next-intl";

import { CheckCircle2, Clock, History, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApprovalHistory } from "@/types/task";
import { formatDateTime } from "@/utils/date";

interface WorkflowHistoryProps {
  historyList: ApprovalHistory[] | undefined | null;
  pending: boolean;
  title?: string;
  emptyMessage?: string;
}

/**
 * Reusable Workflow History Component
 * Displays approval/rejection history for documents
 *
 * @param historyList - Array of approval history items
 * @param pending - Loading state
 * @param title - Optional custom title (defaults to translation)
 * @param emptyMessage - Optional custom empty message (defaults to translation)
 */
export function WorkflowHistory({
  historyList,
  pending,
  title,
  emptyMessage,
}: WorkflowHistoryProps) {
  const t = useTranslations("page_my_tasks.detail.approval_history");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 size={12} /> {t("approved")}
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500">
            <XCircle size={12} /> {t("rejected")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600">
            <Clock size={12} /> {t("pending")}
          </span>
        );
    }
  };

  return (
    <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md rounded-md">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-2 px-3">
        <History className="w-4 h-4 text-amber-500" />
        <CardTitle className="text-sm font-semibold text-primary">
          {title || t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {pending ? (
          <div className="flex flex-col gap-2 p-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !historyList || historyList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <Clock className="w-8 h-8 opacity-30" />
            <p className="text-sm italic">{emptyMessage || t("no_history")}</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-sidebar-accent border-b border-border/50">
              <TableRow>
                <TableHead className="px-4 h-10 text-xs font-semibold">
                  {t("step")}
                </TableHead>
                <TableHead className="px-4 h-10 text-xs font-semibold">
                  {t("approver")}
                </TableHead>
                <TableHead className="px-4 h-10 text-xs font-semibold text-center">
                  {t("status")}
                </TableHead>
                <TableHead className="px-4 h-10 text-xs font-semibold">
                  {t("comment")}
                </TableHead>
                <TableHead className="px-4 h-10 text-xs font-semibold">
                  {t("date")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyList.map((hist) => (
                <TableRow
                  key={hist.id}
                  className="border-border/50 hover:bg-muted/30"
                >
                  <TableCell className="px-4 py-1.5 text-sm font-semibold">
                    {hist.step_name}
                  </TableCell>
                  <TableCell className="px-4 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                        {hist.requester_name?.charAt(0)}
                      </div>
                      <span className="text-sm">{hist.requester_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
                    {getStatusBadge(hist.status)}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-sm text-muted-foreground italic">
                    {hist.comment || "—"}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-xs text-muted-foreground">
                    {formatDateTime(hist.action_date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
