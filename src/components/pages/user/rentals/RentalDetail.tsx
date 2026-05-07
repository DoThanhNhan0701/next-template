"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  DollarSign,
  FileCheck,
  FileText,
  History,
  Link2,
  Mail,
  MapPin,
  Package,
  Phone,
  XCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { RecordAttachmentsCard } from "@/components/common/RecordAttachmentsCard";
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
import { formatDate, formatDateTime } from "@/utils/date";
import { formatNumberWithCommas } from "@/utils/number";

import RentalReturnModal from "./RentalReturnModal";

interface Props {
  id: string;
}

export default function RentalDetail({ id }: Props) {
  const t = useTranslations("page_rentals");
  const router = useRouter();
  const [showReturnModal, setShowReturnModal] = useState(false);

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

      // If the current user is the first-step approver, increment their PENDING task count
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
      {/* Back */}
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
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-semibold text-foreground">
              {t("detail.title")}
            </h1>
            <span className="text-xs text-muted-foreground">
              {t("detail.subtitle")}
            </span>
          </div>
        </div>

        {isActive && (
          <Button
            onClick={() => setShowReturnModal(true)}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all"
          >
            {t("detail.btn_return")}
          </Button>
        )}
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
                  {t("detail.record_number")}
                </span>
                <span className="text-xl font-bold text-foreground tracking-tight">
                  {detail.record_number}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("detail.contract", {
                    number: detail.contract_number || "—",
                  })}
                </span>
              </div>
            </div>

            {/* Right: stats */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex flex-col items-center px-5 py-2.5 rounded-xl bg-primary/5 border border-primary/10 min-w-20">
                <span className="text-xs text-muted-foreground font-semibold tracking-wider">
                  {t("detail.total_assets")}
                </span>
                <span className="text-2xl font-bold text-primary">
                  {totalAssets}
                </span>
              </div>
              <div className="flex flex-col items-center px-5 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 min-w-25">
                <span className="text-xs text-muted-foreground font-semibold tracking-wider">
                  {t("detail.return_date")}
                </span>
                <span className="text-2xl font-bold text-amber-600">
                  {formatDate(returnDate)}
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
                {t("detail.rental_items")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <Table className="whitespace-nowrap">
                <TableHeader className="bg-sidebar-accent border-b border-border/50">
                  <TableRow>
                    <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                      {t("table.no")}
                    </TableHead>
                    <TableHead className="px-4 h-10 text-xs font-semibold">
                      {t("detail.col_asset")}
                    </TableHead>
                    <TableHead className="px-4 h-10 text-xs font-semibold">
                      {t("detail.col_from_location")}
                    </TableHead>
                    {/* <TableHead className="px-4 h-10 text-xs font-semibold">
                      {t("form.location")}
                    </TableHead> */}
                    <TableHead className="px-4 h-10 text-xs font-semibold text-center">
                      {t("table.total_assets")}
                    </TableHead>
                    <TableHead className="px-4 h-10 text-xs font-semibold text-center">
                      {t("detail.col_return_date")}
                    </TableHead>
                    <TableHead className="px-4 h-10 text-xs font-semibold text-right">
                      {t("form.item_revenue")}
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
                      <TableCell className="px-4 py-1.5 text-center text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="px-4 py-1.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-foreground">
                            {item.asset.name}
                          </span>
                          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded w-fit text-muted-foreground">
                            {item.asset.asset_code}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-1.5">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin
                            size={13}
                            className="text-primary/60 shrink-0"
                          />
                          {item.from_location.name}
                        </div>
                      </TableCell>
                      {/* <TableCell className="px-4 py-1.5 text-sm text-muted-foreground">
                        {item.lessee_location || ""}
                      </TableCell> */}
                      <TableCell className="px-4 py-1.5 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-6 bg-primary/10 text-primary rounded-lg text-sm font-bold">
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-1.5 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-6 bg-emerald-500/10 text-emerald-600 rounded-lg text-sm font-bold">
                          {item.returned_quantity}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-1.5 text-right">
                        <span className="text-sm font-semibold text-emerald-600">
                          {formatNumberWithCommas(item.rental_revenue)}
                        </span>
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
          {/* Customer Info */}
          <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
              <Building2 className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-primary">
                {t("detail.customer_info")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                  {t("detail.customer_name")}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {detail.customer.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={14} className="shrink-0" />
                <span>{detail.customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={14} className="shrink-0" />
                <span className="truncate">{detail.customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={14} className="shrink-0" />
                <span>{detail.customer.address || "—"}</span>
              </div>
              <div className="flex flex-col gap-1 pt-2 border-t border-border/50">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                  {t("detail.identifier")}
                </span>
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground">
                  {detail.customer.identifier}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Rental Info */}
          <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
              <FileCheck className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-primary">
                {t("detail.rental_info")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={15} />
                  <span className="text-xs font-semibold tracking-wider">
                    {t("detail.lease_date")}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatDate(detail.lease_date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={15} />
                  <span className="text-xs font-semibold tracking-wider">
                    {t("detail.duration")}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {t("detail.duration_days", { days: detail.duration_days })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={15} />
                  <span className="text-xs font-semibold tracking-wider">
                    {t("detail.return_date")}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatDate(returnDate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign size={15} />
                  <span className="text-xs font-semibold tracking-wider">
                    {t("detail.total_revenue")}
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-600">
                  {formatNumberWithCommas(detail.total_revenue)}
                </span>
              </div>
              {detail.external_link && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Link2 size={15} />
                    <span className="text-xs font-semibold tracking-wider">
                      {t("form.external_link")}
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
              {detail.notes && (
                <div className="flex flex-col gap-1.5 pt-2 border-t border-border/50">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                    {t("detail.notes")}
                  </span>
                  <p className="text-sm text-foreground/80 leading-relaxed italic">
                    {detail.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              {isActive ? t("detail.active_msg") : t("detail.completed_msg")}
            </p>
          </div>
        </div>
      </div>
      <RecordAttachmentsCard
        title={t("detail.attachments")}
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

      {/* Workflow History */}
      <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
          <History className="w-4 h-4 text-amber-500" />
          <CardTitle className="text-sm font-semibold text-primary">
            {t("detail.approval_history")}
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
              <p className="text-sm italic">{t("detail.no_history")}</p>
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

      {/* Return Modal */}
      <RentalReturnModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onConfirm={handleReturnAction}
        pending={returnPending}
        rentalDetail={detail}
      />
    </div>
  );
}
