"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  ArrowRightLeft,
  Calendar,
  ChevronLeft,
  FileText,
  Link2,
  LucideIcon,
  MapPin,
  Package,
  ArrowRight,
  User,
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
import { ApprovalHistory } from "@/types/task";
import { ITransferFull } from "@/types/transfer";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { formatDate } from "@/utils/date";

interface Props {
  id: string;
}

export default function TransferDetail({ id }: Props) {
  const router = useRouter();
  const t = useTranslations("page_transfers");

  const {
    response: detail,
    pending,
    reFetch,
  } = useGet<ITransferFull>({
    url: dynamicEndpoints.TRANSFER_DETAIL(Number(id)),
  });

  const { mutate: updateTransfer, pending: updatePending } = useMutation();

  const { response: historyList, pending: historyPending } = useGet<
    ApprovalHistory[]
  >({
    url: dynamicEndpoints.WORKFLOW_HISTORY("transfer", Number(id)),
  });

  if (pending && !detail) {
    return (
      <div className="p-3 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-9 space-y-3">
            <Skeleton className="h-48 w-full rounded-md" />
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
      <div className="flex items-center justify-between gap-3">
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
              {t("detail.title")}
            </h1>
            <span className="text-[10px] text-muted-foreground font-bold tracking-wider opacity-70">
              {t("detail.subtitle")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-9 flex flex-col gap-3">
          <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md h-full rounded-md">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 py-2 px-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <CardTitle className="text-xs font-semibold text-primary tracking-wider">
                  {t("detail.record_number")}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                <InfoItem
                  icon={Calendar}
                  color="bg-emerald-500/10 text-emerald-500"
                  label={t("detail.transfer_date")}
                  value={formatDate(detail.transfer_date)}
                />
                <InfoItem
                  icon={User}
                  color="bg-amber-500/10 text-amber-500"
                  label={t("detail.creator")}
                  value={detail.creator?.full_name || "—"}
                />
                <InfoItem
                  icon={ArrowRightLeft}
                  color="bg-indigo-500/10 text-indigo-500"
                  label={t("detail.type")}
                  value={detail.transfer_type}
                />
                <InfoItem
                  icon={Package}
                  color="bg-purple-500/10 text-purple-500"
                  label={t("detail.total_assets")}
                  value={detail.total_assets}
                />
                {detail.external_link && (
                  <InfoItem
                    icon={Link2}
                    color="bg-cyan-500/10 text-cyan-500"
                    label={t("detail.link")}
                    value={
                      <a
                        href={detail.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline hover:underline-offset-2"
                      >
                        {detail.external_link}
                      </a>
                    }
                    fullWidth
                  />
                )}
                {detail.reason && (
                  <InfoItem
                    icon={FileText}
                    color="bg-orange-500/10 text-orange-500"
                    label={t("detail.reason")}
                    value={
                      <span className="italic opacity-80 leading-relaxed font-medium">
                        {detail.reason}
                      </span>
                    }
                    fullWidth
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="shadow-sm border-border/50 overflow-hidden bg-card/60 backdrop-blur-md group h-full rounded-md">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/40 py-2 px-3">
              <MapPin className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
              <CardTitle className="text-xs font-semibold text-primary tracking-wider">
                {t("detail.route_information")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider leading-none">
                    {t("detail.from")}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0 border border-orange-500/10">
                      <MapPin size={16} />
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {detail.from_name}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center -my-2 opacity-30">
                  <ArrowRight size={14} className="rotate-90 lg:rotate-0" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider leading-none">
                    {t("detail.to")}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-500/10">
                      <MapPin size={16} />
                    </div>
                    <span className="text-sm font-bold text-emerald-600">
                      {detail.to_name}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md overflow-hidden rounded-md">
        <CardHeader className="flex flex-row items-center gap-2 border-b border-border/40 py-2 px-3">
          <Package className="w-4 h-4 text-primary" />
          <CardTitle className="text-xs font-semibold text-primary tracking-wider">
            {t("detail.transferred_items")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="whitespace-nowrap">
            <TableHeader className="bg-muted/30 border-b border-border/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold h-8 px-3 w-[50px] text-center text-[10px]">
                  {t("table.no")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold">
                  {t("detail.asset")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold">
                  {t("detail.from_location")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold">
                  {t("detail.to_location")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold text-center">
                  {t("detail.quantity")}
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
                        {item.asset_name}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground leading-none">
                        {item.asset_code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <MapPin size={12} className="text-primary/60" />
                      {item.from_location_name}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <MapPin size={12} className="text-emerald-500/60" />
                      {item.to_location_name || detail.to_name || "—"}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RecordAttachmentsCard
        title={t("detail.transfer_documents")}
        className="rounded-md"
        initialAttachments={detail.attachments}
        isPending={updatePending}
        onSave={async (newAttachments) => {
          await updateTransfer(
            {
              url: dynamicEndpoints.UPLOAD_ATTACHMENTS("transfers", Number(id)),
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

      <WorkflowHistory historyList={historyList} pending={historyPending} />

      <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 text-center">
        <p className="text-[11px] text-muted-foreground/80 italic font-medium">
          {t("detail.transfer_record_is", {
            status: detail.status_obj?.name.toLowerCase(),
          })}
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
