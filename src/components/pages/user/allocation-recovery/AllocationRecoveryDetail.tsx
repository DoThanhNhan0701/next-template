"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Building2,
  Calendar,
  ChevronLeft,
  FileCheck,
  Info,
  Link2,
  LucideIcon,
  MapPin,
  Package,
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
import { IAllocationFull } from "@/types/allocation";
import { IRecoveryFull } from "@/types/recovery";
import { ApprovalHistory } from "@/types/task";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { formatDate } from "@/utils/date";

interface Props {
  id: string;
}

export default function AllocationRecoveryDetail({ id }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type =
    (searchParams.get("type") as "allocation" | "recovery") || "allocation";
  const t = useTranslations("page_allocation_recovery");

  const {
    response: detail,
    pending,
    reFetch,
  } = useGet<IAllocationFull | IRecoveryFull>({
    url: dynamicEndpoints.DOCUMENT_DETAIL(type, Number(id)),
  });

  const { mutate: updateRecord, pending: updatePending } = useMutation();

  const { response: historyList, pending: historyPending } = useGet<
    ApprovalHistory[]
  >({
    url: dynamicEndpoints.WORKFLOW_HISTORY(type, Number(id)),
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

  const isAllocation = type === "allocation";
  const allocation = detail as IAllocationFull;
  const recovery = detail as IRecoveryFull;

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
              {isAllocation
                ? t("detail.allocation_title")
                : t("detail.recovery_title")}
            </h1>
            <span className="text-[10px] text-muted-foreground font-bold tracking-wider opacity-70">
              {isAllocation
                ? t("detail.allocation_subtitle")
                : t("detail.recovery_subtitle")}
            </span>
          </div>
        </div>
      </div>

      <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md h-full rounded-md">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 py-2 px-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-primary" />
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
              {detail.status_obj?.name === "PENDING"
                ? "Process"
                : detail.status_obj?.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
            <InfoItem
              icon={Calendar}
              color="bg-emerald-500/10 text-emerald-500"
              label={
                isAllocation
                  ? t("detail.allocation_date")
                  : t("detail.recovery_date")
              }
              value={formatDate(
                isAllocation
                  ? allocation.allocation_date
                  : recovery.recovery_date,
              )}
            />
            <InfoItem
              icon={User}
              color="bg-indigo-500/10 text-indigo-500"
              label={
                isAllocation
                  ? t("detail.recipient_staff")
                  : t("detail.recovered_from")
              }
              value={
                isAllocation
                  ? allocation.allocated_to_name ||
                    allocation.staff?.full_name ||
                    "—"
                  : recovery.recovered_from_name ||
                    recovery.staff?.full_name ||
                    "—"
              }
            />
            <InfoItem
              icon={Building2}
              color="bg-purple-500/10 text-purple-500"
              label={t("detail.unit")}
              value={detail.unit.name}
            />
            {detail.staff?.staff_code && (
              <InfoItem
                icon={Info}
                color="bg-amber-500/10 text-amber-500"
                label={
                  isAllocation
                    ? t("form.recipient_staff_code") || "Mã nhân viên"
                    : t("form.recovered_from_staff_code") || "Mã nhân viên"
                }
                value={
                  <span className="font-mono text-[11px] font-bold">
                    {detail.staff?.staff_code}
                  </span>
                }
              />
            )}
            {!isAllocation && recovery.from_location_obj && (
              <InfoItem
                icon={MapPin}
                color="bg-blue-500/10 text-blue-500"
                label={t("form.location") || "Vị trí"}
                value={recovery.from_location_obj?.name}
              />
            )}
            <InfoItem
              icon={User}
              color="bg-gray-500/10 text-gray-500"
              label={t("detail.issuer")}
              value={detail.issuer_name}
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
            {(isAllocation ? allocation.reason : recovery.notes) && (
              <InfoItem
                icon={Info}
                color="bg-orange-500/10 text-orange-500"
                label={isAllocation ? t("detail.reason") : t("detail.notes")}
                value={
                  <span className="italic opacity-80 leading-relaxed font-medium">
                    {isAllocation ? allocation.reason : recovery.notes}
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
            {isAllocation
              ? t("detail.allocated_items")
              : t("detail.recovered_items")}
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
                  {t("detail.location")}
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
                        {item.asset.name}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground leading-none">
                        {item.asset.asset_code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <MapPin size={12} className="text-primary/60" />
                      {item?.location?.name ?? "—"}
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
        title={t("form.attachments")}
        className="rounded-md"
        initialAttachments={detail.attachments}
        isPending={updatePending}
        onSave={async (newAttachments) => {
          await updateRecord(
            {
              url: dynamicEndpoints.UPLOAD_ATTACHMENTS(
                isAllocation ? "allocations" : "recoveries",
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
          {t("detail.record_is", {
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
