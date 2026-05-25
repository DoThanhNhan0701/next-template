"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  ChevronLeft,
  Clock,
  ExternalLink,
  FileText,
  Link2,
  LucideIcon,
  MapPin,
  Package,
  Phone,
  StickyNote,
  Store,
  Tag,
  User,
  UserCheck,
  Wallet,
} from "lucide-react";

import { RecordAttachmentsCard } from "@/components/common/RecordAttachmentsCard";
import { WorkflowHistory } from "@/components/common/WorkflowHistory";
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
import { useMutation } from "@/hooks/useMutation";
import { IMaintenanceFull } from "@/types/maintenance";
import { ApprovalHistory } from "@/types/task";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { formatDate } from "@/utils/date";
import { formatNumberWithCommas } from "@/utils/number";

interface Props {
  id: string;
}

export default function MaintenanceDetail({ id }: Props) {
  const router = useRouter();
  const t = useTranslations("page_maintenance.detail");

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
      <div className="p-3 flex flex-col gap-3">
        <Skeleton className="h-8 w-24 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-9 space-y-3">
            <Skeleton className="h-40 w-full rounded-md" />
            <Skeleton className="h-96 w-full rounded-md" />
          </div>
          <div className="lg:col-span-3 space-y-3">
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="flex flex-col px-3 pb-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded shadow-sm shrink-0 border-border/50 w-8 h-8"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-base font-bold text-foreground leading-tight">
            {t("title")}
          </h1>
          <span className="text-[10px] text-muted-foreground font-bold tracking-wider opacity-70">
            {t("subtitle")}
          </span>
        </div>
      </div>

      <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md h-full rounded-md">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 py-2 px-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <CardTitle className="text-xs font-semibold text-primary tracking-wider">
              {t("record_number")}
            </CardTitle>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-base font-bold text-foreground tracking-tight">
              {detail.record_number}
            </span>
            <Badge
              variant="outline"
              className="px-2 py-0.5 font-bold text-xs"
              style={{
                backgroundColor: `${detail.status_obj?.color}18`,
                color: detail.status_obj?.color,
                borderColor: `${detail.status_obj?.color}40`,
              }}
            >
              {detail.status_obj?.name === "PENDING"
                ? "Process"
                : detail.status_obj?.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 mb-4">
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1 leading-none">
                {t("expected_cost")}
              </span>
              <span className="text-sm font-bold text-primary tabular-nums tracking-tight">
                {formatNumberWithCommas(detail.expected_cost)}
              </span>
            </div>
            <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/10 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1 leading-none">
                {t("actual_cost")}
              </span>
              <span className="text-sm font-bold text-emerald-600 tabular-nums tracking-tight">
                {formatNumberWithCommas(detail.actual_cost)}
              </span>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-border/40 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1 leading-none">
                {t("created_at_label") || "Ngày tạo"}
              </span>
              <span className="text-sm font-bold text-foreground tracking-tight">
                {formatDate(detail.create_date)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
            <InfoItem
              icon={Tag}
              color="bg-amber-500/10 text-amber-500"
              label={t("ticket_number")}
              value={
                <span className="font-mono font-bold">
                  {detail.ticket_number}
                </span>
              }
            />
            <InfoItem
              icon={UserCheck}
              color="bg-emerald-500/10 text-emerald-500"
              label={t("creator")}
              value={
                detail.creator?.full_name || detail.creator?.username || "—"
              }
            />
            <InfoItem
              icon={Clock}
              color="bg-purple-500/10 text-purple-500"
              label={t("timeline")}
              value={
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground font-bold">
                      OUT:
                    </span>
                    <span>{formatDate(detail.outing_date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-emerald-500 font-bold">
                      IN:
                    </span>
                    <span className="text-emerald-600">
                      {formatDate(detail.return_date)}
                    </span>
                  </div>
                </div>
              }
            />
            <InfoItem
              icon={User}
              color="bg-indigo-500/10 text-indigo-500"
              label={t("handover_staff") || "Bàn giao/Tiếp nhận"}
              value={
                <div className="flex flex-col gap-0.5">
                  <div className="truncate" title={detail.handover_person}>
                    {detail.handover_person || "—"}
                  </div>
                  <div
                    className="truncate text-emerald-600"
                    title={detail.return_handover_person}
                  >
                    {detail.return_handover_person || "—"}
                  </div>
                </div>
              }
            />
            <InfoItem
              icon={Store}
              color="bg-purple-500/10 text-purple-500"
              label={t("service_provider")}
              value={
                <div className="flex flex-col gap-0.5">
                  <div className="truncate font-bold">
                    {detail.service_provider_name || t("internal_service")}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground italic truncate">
                    <MapPin size={10} />
                    {detail.service_provider_address || "—"}
                  </div>
                </div>
              }
            />
            <InfoItem
              icon={Phone}
              color="bg-cyan-500/10 text-cyan-500"
              label={t("taker") || "Người nhận & SĐT"}
              value={
                <div className="flex flex-col gap-0.5">
                  <div className="truncate">
                    {detail.taker_person_name || "—"}
                  </div>
                  <div className="text-[10px] font-mono">
                    {detail.taker_phone || "—"}
                  </div>
                </div>
              }
            />
            <InfoItem
              icon={Wallet}
              color="bg-blue-500/10 text-blue-500"
              label={t("reason")}
              value={detail.reason || "—"}
            />
            {detail.external_link && (
              <InfoItem
                icon={Link2}
                color="bg-pink-500/10 text-pink-500"
                label={t("external_link")}
                value={
                  <a
                    href={detail.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline hover:underline-offset-2 flex items-center gap-1"
                  >
                    {t("view_link")} <ExternalLink size={10} />
                  </a>
                }
              />
            )}
            {detail.notes && (
              <InfoItem
                icon={StickyNote}
                color="bg-orange-500/10 text-orange-500"
                label={t("notes")}
                value={
                  <span className="italic opacity-80 leading-relaxed font-medium">
                    {detail.notes}
                  </span>
                }
                fullWidth
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md overflow-hidden rounded-md">
        <CardHeader className="flex flex-row items-center gap-2 border-b border-border/40 py-2 px-3">
          <Package className="w-4 h-4 text-primary" />
          <CardTitle className="text-xs font-semibold text-primary tracking-wider">
            {t("maintenance_items")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="whitespace-nowrap">
            <TableHeader className="bg-muted/30 border-b border-border/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold h-8 px-3 w-[50px] text-center text-[10px]">
                  {t("no")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold">
                  {t("asset")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold text-center">
                  {t("quantity")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold">
                  {t("issue_notes") || "Vấn đề / Ghi chú"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.details?.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="border-border/20 hover:bg-muted/30 group"
                >
                  <TableCell className="px-3 py-1.5 text-center text-[11px] font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-3 py-1.5">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-foreground">
                        {item.asset?.name}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground leading-none">
                        {item.asset?.asset_code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-1.5 text-center">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/10 px-1.5 py-0 min-w-8 justify-center text-[11px] font-bold h-5 border-0"
                    >
                      {item.quantity}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-1.5">
                    <div
                      className="text-[11px] text-muted-foreground italic truncate max-w-[200px]"
                      title={item.notes ?? undefined}
                    >
                      {item.notes || "—"}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RecordAttachmentsCard
        title={t("maintenance_documents")}
        className="rounded-md"
        initialAttachments={detail.attachments || []}
        isPending={updatePending}
        onSave={async (newAttachments) => {
          await updateMaintenance(
            {
              url: dynamicEndpoints.UPLOAD_ATTACHMENTS(
                "maintenances",
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

      <WorkflowHistory
        historyList={historyList}
        pending={historyPending}
        className="h-full rounded-md"
      />

      <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 text-center">
        <p className="text-[11px] text-muted-foreground/80 italic font-medium">
          {detail.status_obj?.code === "COMPLETED"
            ? t("status_completed_desc")
            : t("status_ongoing_desc")}
        </p>
      </div>
    </div>
  );
}

const InfoItem = ({
  icon: Icon,
  color,
  label,
  value,
  fullWidth = false,
}: {
  icon: LucideIcon | React.ElementType;
  color: string;
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) => (
  <div
    className={`flex items-center gap-2 border-b border-border/20 py-1.5 last:border-0 ${fullWidth ? "md:col-span-2 lg:col-span-3" : ""}`}
  >
    <div
      className={`w-7 h-7 rounded-full ${color} flex items-center justify-center shrink-0`}
    >
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] font-bold text-muted-foreground tracking-wider leading-tight">
        {label}
      </span>
      <div className="truncate text-xs font-semibold text-foreground">
        {value}
      </div>
    </div>
  </div>
);
