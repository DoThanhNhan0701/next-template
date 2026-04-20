"use client";

import { useRouter } from "next/navigation";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileText,
  History,
  Link2,
  MapPin,
  Package,
  User,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { dynamicEndpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { IStockAdjustmentFull } from "@/types/stock-adjustment";
import { ApprovalHistory } from "@/types/task";
import { formatDate } from "@/utils/date";

interface Props {
  id: string;
}

export default function StockAdjustmentDetail({ id }: Props) {
  const router = useRouter();

  const { response: detail, pending } = useGet<IStockAdjustmentFull>({
    url: dynamicEndpoints.STOCK_ADJUSTMENT_DETAIL(Number(id)),
  });

  const adjustmentType = detail?.details?.[0]?.adjustment_type;

  const { response: historyList, pending: historyPending } = useGet<
    ApprovalHistory[]
  >(
    {
      url: dynamicEndpoints.WORKFLOW_HISTORY(
        adjustmentType === "DECREASE" ? "stock_out" : "stock_in",
        Number(id),
      ),
    },
    { disabled: !adjustmentType },
  );

  if (pending && !detail) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!detail) return null;

  const isCompleted = detail.status_obj?.code === "COMPLETED";

  return (
    <div className="flex flex-col px-4 pb-6 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded shadow-sm shrink-0 border-border/50 w-8 h-8"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold text-foreground">
            Stock Adjustment Detail
          </h1>
          <span className="text-xs text-muted-foreground">
            Stock In / Stock Out
          </span>
        </div>
      </div>

      {/* Summary */}
      <Card className="border border-border/50 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80 rounded-r" />
        <CardContent className="p-5 pl-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: record info */}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground font-semibold tracking-wider">
                  Record Number
                </span>
                <span className="text-xl font-bold text-foreground tracking-tight">
                  {detail.record_number}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(detail.adjustment_date)}
                </span>
              </div>
            </div>

            {/* Right: stats */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex flex-col items-center px-5 py-2.5 rounded-xl bg-primary/5 border border-primary/10 min-w-[80px]">
                <span className="text-xs text-muted-foreground font-semibold tracking-wider">
                  Total Qty
                </span>
                <span className="text-2xl font-bold text-primary">
                  {detail.total_quantity}
                </span>
              </div>
              <div className="flex flex-col items-center px-5 py-2.5 rounded-xl bg-muted/40 border border-border/50 min-w-[80px]">
                <span className="text-xs text-muted-foreground font-semibold tracking-wider">
                  Items
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {detail.details.length}
                </span>
              </div>
              <Badge
                variant="outline"
                className="px-4 py-2 text-sm font-bold rounded-xl h-auto"
                style={{
                  backgroundColor: `${detail.status_obj?.color}18`,
                  color: detail.status_obj?.color,
                  borderColor: `${detail.status_obj?.color}40`,
                }}
              >
                {detail.status_obj?.name}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Items table */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md h-full flex flex-col">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4 shrink-0">
              <Package className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-primary">
                Adjustment Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <Table className="whitespace-nowrap">
                <TableHeader className="bg-sidebar-accent border-b border-border/50">
                  <TableRow>
                    <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                      No
                    </TableHead>
                    <TableHead className="px-4 h-10 text-xs font-semibold">
                      Asset
                    </TableHead>
                    <TableHead className="px-4 h-10 text-xs font-semibold">
                      Location
                    </TableHead>
                    <TableHead className="px-4 h-10 text-xs font-semibold text-center">
                      Type
                    </TableHead>
                    <TableHead className="px-4 h-10 text-xs font-semibold text-center">
                      Qty
                    </TableHead>
                    <TableHead className="px-4 h-10 text-xs font-semibold">
                      Notes
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.details.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className="border-border/50 hover:bg-muted/30"
                    >
                      {/* No */}
                      <TableCell className="px-4 py-3 text-center text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-foreground">
                            {item.asset.name}
                          </span>
                          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded w-fit text-muted-foreground">
                            {item.asset.asset_code}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin
                            size={13}
                            className="text-primary/60 shrink-0"
                          />
                          {item.location.name}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        {item.adjustment_type === "INCREASE" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
                            <ArrowUpCircle size={12} /> Stock In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500">
                            <ArrowDownCircle size={12} /> Stock Out
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-6 bg-primary/10 text-primary rounded-lg text-sm font-bold">
                          {item.quantity_diff}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-muted-foreground italic">
                        {item.notes || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
              <FileText className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-primary">
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User size={15} />
                  <span className="text-xs font-semibold tracking-wider">
                    Creator
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {detail.creator?.full_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={15} />
                  <span className="text-xs font-semibold tracking-wider">
                    Created
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-foreground">
                    {formatDate(detail.created_at, "HH:mm")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(detail.created_at)}
                  </span>
                </div>
              </div>
              {detail.external_link && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Link2 size={15} />
                    <span className="text-xs font-semibold tracking-wider">
                      Link
                    </span>
                  </div>
                  <a
                    href={detail.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline underline-offset-2 truncate max-w-36"
                  >
                    {detail.external_link}
                  </a>
                </div>
              )}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-border/50">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                  Reason
                </span>
                <p className="text-sm text-foreground/80 leading-relaxed italic">
                  {detail.reason || "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              {isCompleted
                ? "Phiếu đã hoàn tất và không thể chỉnh sửa."
                : "Phiếu đang được xử lý."}
            </p>
          </div>
        </div>
      </div>

      {/* Workflow History */}
      <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
          <History className="w-4 h-4 text-amber-500" />
          <CardTitle className="text-sm font-semibold text-primary">
            Approval History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {historyPending ? (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !historyList || historyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Clock className="w-8 h-8 opacity-30" />
              <p className="text-sm italic">Chưa có lịch sử phê duyệt.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-sidebar-accent border-b border-border/50">
                <TableRow>
                  <TableHead className="px-4 h-10 text-xs font-semibold">
                    Step
                  </TableHead>
                  <TableHead className="px-4 h-10 text-xs font-semibold">
                    Approver
                  </TableHead>
                  <TableHead className="px-4 h-10 text-xs font-semibold text-center">
                    Status
                  </TableHead>
                  <TableHead className="px-4 h-10 text-xs font-semibold">
                    Comment
                  </TableHead>
                  <TableHead className="px-4 h-10 text-xs font-semibold">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyList.map((hist) => (
                  <TableRow
                    key={hist.id}
                    className="border-border/50 hover:bg-muted/30"
                  >
                    <TableCell className="px-4 py-3 text-sm font-semibold">
                      {hist.step_name}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {hist.requester_name?.charAt(0)}
                        </div>
                        <span className="text-sm">{hist.requester_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      {hist.status === "APPROVED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      ) : hist.status === "REJECTED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500">
                          <XCircle size={12} /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground italic">
                      {hist.comment || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(hist.action_date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
