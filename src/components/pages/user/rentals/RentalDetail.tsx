"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  Building2,
  Calendar,
  ChevronLeft,
  Clock,
  DollarSign,
  FileCheck,
  FileText,
  Link2,
  LucideIcon,
  Mail,
  MapPin,
  Package,
  Phone,
  User,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

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
import { AppDispatch, RootState } from "@/redux";
import { updateCount } from "@/redux/slices/task";
import { IRentalFull } from "@/types/rental";
import { ApprovalHistory } from "@/types/task";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { formatDate } from "@/utils/date";
import { formatNumberWithCommas } from "@/utils/number";

import RentalRenewModal from "./RentalRenewModal";
import RentalReturnModal from "./RentalReturnModal";

interface Props {
  id: string;
}

export default function RentalDetail({ id }: Props) {
  const t = useTranslations("page_rentals");
  const router = useRouter();
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { counts } = useSelector((state: RootState) => state.task);

  const {
    response: detail,
    pending,
    reFetch,
  } = useGet<IRentalFull>({
    url: dynamicEndpoints.RENTAL_DETAIL(Number(id)),
  });

  const { response: historyList, pending: historyPending } = useGet<
    ApprovalHistory[]
  >({
    url: dynamicEndpoints.WORKFLOW_HISTORY("rental", Number(id)),
  });
  const { mutate: updateRental, pending: updatePending } = useMutation();
  const { mutate: mutateReturn, pending: returnPending } = useMutation();
  const { mutate: mutateRenew, pending: renewPending } = useMutation();

  const handleRenewAction = async (data: {
    new_contract_number: string;
    new_lease_date: string;
    new_duration_days: number;
    new_total_revenue: number;
    notes?: string;
  }) => {
    const payload = {
      new_contract_number: data.new_contract_number,
      new_lease_date: data.new_lease_date,
      new_duration_days: data.new_duration_days,
      new_total_revenue: data.new_total_revenue,
      notes: data.notes,
    };
    const { response: res, error } = await mutateRenew({
      url: dynamicEndpoints.RENTAL_RENEW(Number(id)),
      method: "post",
      body: payload,
    });
    if (error) {
      getApiErrorMessage(error);
    } else {
      getApiSuccessMessage(res);
      setShowRenewModal(false);
      reFetch();
    }
  };

  const handleReturnAction = async (data: Record<string, unknown>) => {
    const { response: res, error } = await mutateReturn({
      url: dynamicEndpoints.RENTAL_RETURN(Number(id)),
      method: "post",
      body: data,
    });
    if (error) {
      getApiErrorMessage(error);
    } else {
      getApiSuccessMessage(res);

      const assignments = data.workflow_assignments as
        | Array<{ step_id: number; user_id: number }>
        | undefined;
      if (assignments?.[0]?.user_id === currentUser?.id) {
        dispatch(updateCount({ status: "PENDING", count: counts.PENDING + 1 }));
      }

      setShowReturnModal(false);
      reFetch();
    }
  };

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

  const isActive = ["PARTIALLY_RETURNED", "ACTIVE"].includes(
    detail.status_obj?.code,
  );
  const totalAssets = detail.details.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const returnDate = new Date(detail.lease_date);
  returnDate.setDate(returnDate.getDate() + detail.duration_days);

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

        <div className="flex gap-2 items-center">
          {isActive && (
            <Button onClick={() => setShowReturnModal(true)} size="sm">
              {t("detail.btn_return")}
            </Button>
          )}

          {detail.status_obj?.code !== "PENDING" &&
            detail.status_obj?.code !== "REJECTED" &&
            detail.status_obj?.code !== "RENEWED" &&
            !detail.is_renewed && (
              <Button onClick={() => setShowRenewModal(true)} size="sm">
                Tái ký hợp đồng
              </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-9 flex flex-col gap-3">
          <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md h-full rounded-md">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 py-2 px-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <CardTitle className="text-xs font-semibold text-primary tracking-wider">
                  {t("detail.record_number")}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                <InfoItem
                  icon={FileCheck}
                  color="bg-primary/10 text-primary"
                  label={t("detail.contract_number")}
                  value={detail.contract_number || "—"}
                />
                <InfoItem
                  icon={User}
                  color="bg-emerald-500/10 text-emerald-500"
                  label={t("detail.creator")}
                  value={detail?.creator?.full_name ?? ""}
                />
                <InfoItem
                  icon={Calendar}
                  color="bg-emerald-500/10 text-emerald-500"
                  label={t("detail.lease_date")}
                  value={formatDate(detail.lease_date)}
                />
                <InfoItem
                  icon={Clock}
                  color="bg-amber-500/10 text-amber-500"
                  label={t("detail.duration")}
                  value={t("detail.duration_days", {
                    days: detail.duration_days,
                  })}
                />
                <InfoItem
                  icon={Calendar}
                  color="bg-rose-500/10 text-rose-500"
                  label={t("detail.return_date")}
                  value={formatDate(returnDate)}
                />
                <InfoItem
                  icon={DollarSign}
                  color="bg-indigo-500/10 text-indigo-500"
                  label={t("detail.total_revenue")}
                  value={
                    <span className="font-bold text-emerald-600">
                      {formatNumberWithCommas(detail.total_revenue)}
                    </span>
                  }
                />
                <InfoItem
                  icon={Package}
                  color="bg-purple-500/10 text-purple-500"
                  label={t("detail.total_assets")}
                  value={totalAssets}
                />
                {detail.external_link && (
                  <InfoItem
                    icon={Link2}
                    color="bg-cyan-500/10 text-cyan-500"
                    label={t("form.external_link")}
                    value={
                      <a
                        href={detail.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline hover:underline-offset-2"
                      >
                        {t("detail.view_link")}
                      </a>
                    }
                  />
                )}
                {detail.notes && (
                  <InfoItem
                    icon={FileText}
                    color="bg-orange-500/10 text-orange-500"
                    label={t("detail.notes")}
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
        </div>

        <div className="lg:col-span-3">
          <Card className="shadow-sm border-border/50 overflow-hidden bg-card/60 backdrop-blur-md group h-full rounded-md">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/40 py-2 px-3">
              <Building2 className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
              <CardTitle className="text-xs font-semibold text-primary tracking-wider">
                {t("detail.customer_info")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider leading-none">
                    {t("detail.customer_name")}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {detail.customer.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {detail.customer.name}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-border/40 pt-2">
                  <SidebarContactItem
                    icon={Phone}
                    value={detail.customer.phone}
                  />
                  <SidebarContactItem
                    icon={Mail}
                    value={detail.customer.email}
                  />
                  <SidebarContactItem
                    icon={MapPin}
                    value={detail.customer.address || "—"}
                  />
                </div>

                <div className="pt-2 border-t border-border/40">
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider leading-none mb-1 block">
                    {t("detail.identifier")}
                  </span>
                  <code className="text-xs font-mono bg-muted/60 px-2 py-1 rounded block text-foreground/80 break-all border border-border/30">
                    {detail.customer.identifier}
                  </code>
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
            {t("detail.rental_items")}
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
                  {t("detail.col_asset")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold">
                  {t("detail.col_from_location")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold text-center">
                  {t("table.total_assets")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold text-center">
                  {t("detail.col_returned_quantity")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold text-right">
                  {t("form.item_revenue")}
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
                      {item.from_location.name}
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
                  <TableCell className="px-3 py-1.5 text-center">
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 px-1.5 py-0 min-w-8 justify-center text-[11px] font-bold h-5 border-emerald-500/20"
                    >
                      {item.returned_quantity}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-1.5 text-right">
                    <span className="text-[12px] font-bold text-emerald-600">
                      {formatNumberWithCommas(item.rental_revenue)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RecordAttachmentsCard
        title={t("detail.attachments")}
        className="rounded-md"
        initialAttachments={detail.attachments}
        isPending={updatePending}
        onSave={async (newAttachments) => {
          await updateRental(
            {
              url: dynamicEndpoints.UPLOAD_ATTACHMENTS("rentals", Number(id)),
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
          {isActive ? t("detail.active_msg") : t("detail.completed_msg")}
        </p>
      </div>

      <RentalReturnModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onConfirm={handleReturnAction}
        pending={returnPending}
        rentalDetail={detail}
      />

      <RentalRenewModal
        isOpen={showRenewModal}
        onClose={() => setShowRenewModal(false)}
        onConfirm={handleRenewAction}
        pending={renewPending}
        rentalDetail={detail}
      />
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

const SidebarContactItem = ({
  icon: Icon,
  value,
}: {
  icon: LucideIcon | React.ElementType;
  value: string;
}) => (
  <div className="flex items-center gap-2.5 group/contact">
    <div className="w-6 h-6 rounded bg-muted/50 flex items-center justify-center text-muted-foreground group-hover/contact:bg-primary/10 group-hover/contact:text-primary transition-colors">
      <Icon size={12} />
    </div>
    <span className="text-[11px] font-medium text-foreground/70 group-hover/contact:text-foreground transition-colors truncate">
      {value}
    </span>
  </div>
);
