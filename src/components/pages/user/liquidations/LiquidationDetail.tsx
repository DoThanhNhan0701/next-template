"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  ChevronLeft,
  ClipboardList,
  CreditCard,
  ExternalLink,
  FileText,
  Info,
  Link2,
  LucideIcon,
  MapPin,
  Package,
  User,
  Users,
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
import { ILiquidationFull } from "@/types/liquidation";
import { ApprovalHistory } from "@/types/task";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { formatDate } from "@/utils/date";
import { formatNumberWithCommas } from "@/utils/number";

interface Props {
  id: string;
}

export default function LiquidationDetail({ id }: Props) {
  const t = useTranslations("page_liquidations.detail");
  const router = useRouter();

  const {
    response: detail,
    pending,
    reFetch,
  } = useGet<ILiquidationFull>({
    url: dynamicEndpoints.LIQUIDATION_DETAIL(Number(id)),
  });

  const { mutate: updateLiquidation, pending: updatePending } = useMutation();

  const { response: historyList, pending: historyPending } = useGet<
    ApprovalHistory[]
  >({
    url: dynamicEndpoints.WORKFLOW_HISTORY("liquidation", Number(id)),
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

  const isPending = detail.status_obj?.code === "PENDING";

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
            {t("title")}
          </h1>
          <span className="text-xs text-muted-foreground font-medium">
            {t("subtitle")}
          </span>
        </div>
      </div>

      <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md h-full rounded-md">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 py-2 px-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <CardTitle className="text-xs font-semibold text-primary tracking-wider">
              {t("record_number")}
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
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
              {detail.status_obj?.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 mb-4">
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1 leading-none">
                {t("total_value")}
              </span>
              <span className="text-sm font-bold text-primary tabular-nums tracking-tight">
                {formatNumberWithCommas(detail.total_value ?? 0)}
              </span>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-border/40 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1 leading-none">
                {t("items_count")}
              </span>
              <span className="text-sm font-bold text-foreground tracking-tight">
                {detail.details?.length || 0}
              </span>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-border/40 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1 leading-none">
                {t("date")}
              </span>
              <span className="text-sm font-bold text-foreground tracking-tight">
                {formatDate(detail.liquidation_date)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
            <InfoItem
              icon={ClipboardList}
              color="bg-amber-500/10 text-amber-500"
              label={t("type")}
              value={<Badge variant="secondary" className="font-bold">{detail.liquidation_type}</Badge>}
            />
            <InfoItem
              icon={CreditCard}
              color="bg-indigo-500/10 text-indigo-500"
              label={t("buyer")}
              value={detail.buyer_name || "—"}
            />
            <InfoItem
              icon={User}
              color="bg-emerald-500/10 text-emerald-500"
              label={t("creator")}
              value={detail.creator?.full_name || "—"}
            />
            <InfoItem
              icon={Users}
              color="bg-purple-500/10 text-purple-500"
              label={t("committee")}
              value={
                <div className="flex flex-wrap gap-1">
                  {detail.committee?.split(",").map((name, idx) => (
                    <Badge key={idx} variant="outline" className="text-[10px] py-0 px-1 border-border/40">
                      {name.trim()}
                    </Badge>
                  ))}
                  {!detail.committee && "—"}
                </div>
              }
            />
            {detail.external_link && (
              <InfoItem
                icon={Link2}
                color="bg-pink-500/10 text-pink-500"
                label={t("link")}
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
            {detail.reason && (
              <InfoItem
                icon={Info}
                color="bg-orange-500/10 text-orange-500"
                label={t("reason")}
                value={
                  <span className="italic opacity-80 leading-relaxed font-medium">
                    {detail.reason}
                  </span>
                }
                fullWidth
              />
            )}
            {detail.notes && (
              <InfoItem
                icon={FileText}
                color="bg-blue-500/10 text-blue-500"
                label={t("notes")}
                value={
                  <span className="opacity-80 leading-relaxed font-medium">
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
            {t("disposal_items")}
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
                <TableHead className="px-3 h-8 text-[10px] font-bold">
                  {t("from_location")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold text-center">
                  {t("quantity")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold text-right">
                  {t("unit_value")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold text-right">
                  {t("remaining_value")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold">
                  {t("notes")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.details.map((item, index) => (
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
                  <TableCell className="px-3 py-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <MapPin size={12} className="text-primary/60" />
                      {item.from_location?.name || "—"}
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
                  <TableCell className="px-3 py-1.5 text-right font-medium text-[11px]">
                    {item.unit_value?.toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="px-3 py-1.5 text-right font-bold text-[11px] text-amber-600">
                    {item.remaining_value?.toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="px-3 py-1.5">
                    <div className="text-[11px] text-muted-foreground italic truncate max-w-[150px]" title={item.notes ?? undefined}>
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
        title={t("disposal_documents")}
        className="rounded-md"
        initialAttachments={detail.attachments || []}
        isPending={updatePending}
        onSave={async (newAttachments) => {
          await updateLiquidation(
            {
              url: dynamicEndpoints.UPLOAD_ATTACHMENTS(
                "liquidations",
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
        className="rounded-md"
      />

      <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 text-center">
        <p className="text-[11px] text-muted-foreground/80 italic font-medium">
          {isPending
            ? t("status_pending_desc")
            : t("status_processed_desc")}
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
