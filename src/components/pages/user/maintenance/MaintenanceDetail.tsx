"use client";

import { useRouter } from "next/navigation";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock,
  ExternalLink,
  FileText,
  History,
  Info,
  MapPin,
  Package,
  Phone,
  StickyNote,
  Store,
  User,
  Wallet,
  XCircle,
} from "lucide-react";

import { RecordAttachmentsCard } from "@/components/common/RecordAttachmentsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { useMutation } from "@/hooks/useMutation";
import { IMaintenanceFull } from "@/types/maintenance";
import { ApprovalHistory } from "@/types/task";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { formatDate, formatDateTime } from "@/utils/date";

interface Props {
  id: string;
}

export default function MaintenanceDetail({ id }: Props) {
  const router = useRouter();

  const {
    response: detail,
    pending,
    reFetch,
  } = useGet<IMaintenanceFull>({
    url: dynamicEndpoints.MAINTENANCE_DETAIL(Number(id)),
  });

  const { mutate: updateMaintenance, pending: updatePending } = useMutation();

  const { response: historyList, pending: historyPending } = useGet<
    ApprovalHistory[]
  >({
    url: dynamicEndpoints.WORKFLOW_HISTORY("maintenance", Number(id)),
  });

  if (pending && !detail) {
    return (
      <div className="p-6 flex flex-col gap-3">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!detail) return null;

  const isCompleted = detail.status_obj?.code === "COMPLETED";

  return (
    <div className="flex flex-col px-3 pb-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            Maintenance Detail
          </h1>
          <span className="text-xs text-muted-foreground font-medium">
            Equipment Service Record
          </span>
        </div>
      </div>

      {/* Summary */}
      <Card className="border border-border/50 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80 rounded-r" />
        <CardContent className="p-3 pl-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: record info */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground font-semibold tracking-wider">
                  Ticket Number
                </span>
                <span className="text-xl font-bold text-foreground tracking-tight">
                  {detail.ticket_number}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays size={12} />
                  <span>Created: {formatDate(detail.create_date)}</span>
                </div>
              </div>
            </div>

            {/* Right: costs & status */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex flex-col items-center px-4 py-2 rounded-xl bg-muted/30 border border-border/50 min-w-[120px]">
                <span className="text-[10px] text-muted-foreground font-semibold tracking-wider">
                  Expected Cost
                </span>
                <span className="text-base font-bold text-muted-foreground">
                  {detail.expected_cost?.toLocaleString("vi-VN")} VND
                </span>
              </div>
              <div className="flex flex-col items-center px-5 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-510/10 min-w-[140px]">
                <span className="text-xs text-emerald-600 font-semibold tracking-wider">
                  Actual Cost
                </span>
                <span className="text-xl font-bold text-emerald-600">
                  {detail.actual_cost?.toLocaleString("vi-VN")} VND
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
        {/* Items table */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md h-full flex flex-col">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4 shrink-0">
              <Package className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-primary">
                Maintenance Items
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
                    <TableHead className="px-4 h-10 text-xs font-semibold text-center">
                      Qty
                    </TableHead>
                    <TableHead className="px-4 h-10 text-xs font-semibold">
                      Issue / Notes
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.details?.map((item, index) => (
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
                            {item.asset?.name}
                          </span>
                          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded w-fit text-muted-foreground">
                            {item.asset?.asset_code}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-6 bg-primary/10 text-primary rounded-lg text-sm font-bold">
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-muted-foreground italic max-w-xs truncate">
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
        <div className="flex flex-col gap-3">
          {/* Dates & Timeline */}
          <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
              <Clock className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-primary">
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold tracking-wider text-muted-foreground">
                  Outing Date
                </div>
                <span className="text-sm font-medium">
                  {formatDate(detail.outing_date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold tracking-wider text-muted-foreground">
                  Return Date
                </div>
                <span className="text-sm font-medium text-emerald-600">
                  {formatDate(detail.return_date)}
                </span>
              </div>
              <Separator className="bg-border/40" />
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={12} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground tracking-tight">
                      Outing Handover
                    </span>
                    <span className="text-sm font-semibold">
                      {detail.handover_person || "—"}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={12} className="text-emerald-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground tracking-tight">
                      Return Receiver
                    </span>
                    <span className="text-sm font-semibold">
                      {detail.return_handover_person || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Provider */}
          <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
              <Store className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-primary">
                Service Provider
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                  Vendor Name
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {detail.service_provider_name || "Internal / Not Specified"}
                </span>
              </div>
              {detail.service_provider_address && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground italic">
                  <MapPin size={14} className="shrink-0 mt-0.5" />
                  <span>{detail.service_provider_address}</span>
                </div>
              )}
              <Separator className="bg-border/40" />
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User size={14} />
                    <span className="text-xs font-semibold tracking-wider">
                      Taker
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {detail.taker_person_name || "—"}
                  </span>
                </div>
                {detail.taker_phone && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone size={14} />
                      <span className="text-xs font-semibold tracking-wider">
                        Phone
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {detail.taker_phone}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info & Notes */}
          <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
              <Info className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-primary">
                Additional Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Wallet size={14} />
                  <span className="text-xs font-semibold tracking-wider">
                    Reason
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed italic">
                  {detail.reason || "—"}
                </p>
              </div>
              {detail.notes && (
                <div className="flex flex-col gap-1.5 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <StickyNote size={14} />
                    <span className="text-xs font-semibold tracking-wider">
                      Notes
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {detail.notes}
                  </p>
                </div>
              )}
              {detail.external_link && (
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                    External Link
                  </span>
                  <a
                    href={detail.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1 truncate max-w-36"
                  >
                    View Link <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              {isCompleted
                ? "Maintenance record is archived and completed."
                : "Maintenance process is ongoing."}
            </p>
          </div>
        </div>
      </div>

      <RecordAttachmentsCard
        title="Maintenance Documents"
        initialAttachments={detail.attachments || []}
        isPending={updatePending}
        onSave={async (newAttachments) => {
          await updateMaintenance(
            {
              url: dynamicEndpoints.UPLOAD_ATTACHMENTS(
                "maintenance",
                Number(id),
              ),
              method: "patch",
              body: newAttachments,
            },
            {
              onSuccess: (res) => {
                getApiSuccessMessage(res);
                reFetch();
              },
              onError: (err) => {
                getApiErrorMessage(err);
                throw err;
              },
            },
          );
        }}
      />

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
            <div className="flex flex-col gap-2 p-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !historyList || historyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Clock className="w-8 h-8 opacity-30" />
              <p className="text-sm italic">No approval history available.</p>
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
                      {formatDateTime(hist.action_date)}
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
