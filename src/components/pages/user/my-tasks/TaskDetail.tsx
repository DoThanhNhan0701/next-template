"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileText,
  History,
  MessageSquare,
  Package,
  User,
  XCircle,
} from "lucide-react";
import { useDispatch } from "react-redux";

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
import { Textarea } from "@/components/ui/textarea";
import { dynamicEndpoints } from "@/config/endpoints";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { decrementPendingCount } from "@/redux/slices/task";
import {
  AllocationDocument,
  ApprovalHistory,
  DocumentDetail,
  ITask,
  LiquidationDocument,
  MaintenanceDocument,
  RecoveryDocument,
  RentalReturnDocument,
  StockAdjustmentDocument,
  TransferDocument,
  getDocumentTitle,
  isAllocationDocument,
  isLiquidationDocument,
  isMaintenanceDocument,
  isRecoveryDocument,
  isRentalReturnDocument,
  isStockAdjustmentDocument,
  isTransferDocument,
} from "@/types/task";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { formatDate, formatDateTime } from "@/utils/date";
import { formatNumberWithCommas } from "@/utils/number";

const getStatusInfo = (statusName: string | undefined) => {
  const name = (statusName || "").toLowerCase();
  if (
    name.includes("approve") ||
    name.includes("đã duyệt") ||
    name.includes("approved")
  )
    return {
      label: "Approved",
      color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
    };
  if (
    name.includes("pending") ||
    name.includes("chờ duyệt") ||
    name.includes("processing")
  )
    return {
      label: "Pending",
      color: "bg-amber-500/15 text-amber-600 border-amber-500/20",
    };
  if (
    name.includes("reject") ||
    name.includes("từ chối") ||
    name.includes("rejected")
  )
    return {
      label: "Rejected",
      color: "bg-red-500/15 text-red-600 border-red-500/20",
    };
  return {
    label: statusName || "Pending",
    color: "bg-primary/10 text-primary border-primary/20",
  };
};

interface TaskDetailProps {
  id: string;
}

export default function TaskDetail({ id }: TaskDetailProps) {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const documentType = searchParams.get("document_type") ?? "allocation";
  const router = useRouter();
  const dispatch = useDispatch();
  const [comment, setComment] = useState("");
  const { mutate, pending: mutatePending } = useMutation();

  const {
    response: detail,
    pending: detailPending,
    reFetch: reFetchDetail,
  } = useGet<DocumentDetail>(
    {
      url: dynamicEndpoints.DOCUMENT_DETAIL(documentType, Number(id)),
    },
    { staleTime: 0 },
  );

  const {
    response: historyList,
    pending: historyPending,
    reFetch: reFetchHistory,
  } = useGet<ApprovalHistory[]>(
    {
      url: dynamicEndpoints.WORKFLOW_HISTORY(documentType, Number(id)),
    },
    { staleTime: 0 },
  );

  const { response: myTasksResponse, reFetch: reFetchMyTasks } = useGet<
    ITask[]
  >(
    {
      url: `${endpoints.WORKFLOW_TASKS}me`,
      config: {
        params: { status: status },
      },
    },
    { staleTime: 0 },
  );

  const activeTask = (myTasksResponse || []).find(
    (t) => t.document_id === Number(id) && t.document_type === documentType,
  );

  const formattedData = useMemo(() => {
    if (!detail) return null;

    const fields: Array<{
      icon: React.ComponentType<{ className?: string }>;
      iconColor: string;
      label: string;
      value: React.ReactNode;
      badge?: { label: string; variant?: string };
    }> = [];

    if (documentType === "allocation" || isAllocationDocument(detail)) {
      const allocation = detail as AllocationDocument;
      fields.push({
        icon: User,
        iconColor: "bg-primary/10 text-primary",
        label: "Allocated to",
        value:
          allocation.allocated_to_name || allocation.staff?.full_name || "N/A",
        badge: {
          label: allocation.allocated_to_type === "user" ? "User" : "Unit",
          variant: "secondary",
        },
      });

      if (allocation.unit?.name) {
        fields.push({
          icon: User,
          iconColor: "bg-blue-500/10 text-blue-500",
          label: "Unit",
          value: allocation.unit.name,
        });
      }

      fields.push({
        icon: History,
        iconColor: "bg-emerald-500/10 text-emerald-500",
        label: "Allocation date",
        value: formatDate(allocation.allocation_date),
      });

      if (allocation.issuer_name) {
        fields.push({
          icon: User,
          iconColor: "bg-indigo-500/10 text-indigo-500",
          label: "Issuer",
          value: allocation.issuer_name,
        });
      }

      if (allocation.staff?.staff_code) {
        fields.push({
          icon: User,
          iconColor: "bg-amber-500/10 text-amber-500",
          label: "Staff code",
          value: allocation.staff.staff_code,
        });
      }

      fields.push({
        icon: Package,
        iconColor: "bg-purple-500/10 text-purple-500",
        label: "Total quantity",
        value: allocation.total_quantity,
      });
    } else if (
      documentType === "stock_in" ||
      documentType === "stock_out" ||
      isStockAdjustmentDocument(detail)
    ) {
      const adjustment = detail as StockAdjustmentDocument;
      fields.push({
        icon: History,
        iconColor: "bg-emerald-500/10 text-emerald-500",
        label: "Adjustment date",
        value: formatDate(adjustment.adjustment_date),
      });

      fields.push({
        icon: Package,
        iconColor: "bg-purple-500/10 text-purple-500",
        label: "Total quantity",
        value: adjustment.total_quantity,
      });

      if (adjustment.external_link) {
        fields.push({
          icon: FileText,
          iconColor: "bg-cyan-500/10 text-cyan-500",
          label: "External link",
          value: (
            <a
              href={adjustment.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View link
            </a>
          ),
        });
      }
    } else if (documentType === "recovery" || isRecoveryDocument(detail)) {
      const recovery = detail as RecoveryDocument;
      // Recovery specific fields
      fields.push({
        icon: User,
        iconColor: "bg-rose-500/10 text-rose-500",
        label: "Recovered from",
        value:
          recovery.recovered_from_name || recovery.staff?.full_name || "N/A",
        badge: {
          label: recovery.recovered_from_type === "user" ? "User" : "Unit",
          variant: "secondary",
        },
      });

      if (recovery.unit?.name) {
        fields.push({
          icon: User,
          iconColor: "bg-blue-500/10 text-blue-500",
          label: "Unit",
          value: recovery.unit.name,
        });
      }

      fields.push({
        icon: History,
        iconColor: "bg-emerald-500/10 text-emerald-500",
        label: "Recovery date",
        value: formatDate(recovery.recovery_date),
      });

      fields.push({
        icon: Package,
        iconColor: "bg-purple-500/10 text-purple-500",
        label: "Total quantity",
        value: recovery.total_quantity,
      });

      if (recovery.notes) {
        fields.push({
          icon: FileText,
          iconColor: "bg-amber-500/10 text-amber-500",
          label: "Notes",
          value: (
            <span className="text-sm font-medium text-muted-foreground italic">
              {recovery.notes}
            </span>
          ),
        });
      }

      if (recovery.external_link) {
        fields.push({
          icon: FileText,
          iconColor: "bg-cyan-500/10 text-cyan-500",
          label: "External link",
          value: (
            <a
              href={recovery.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View link
            </a>
          ),
        });
      }
    } else if (
      documentType === "rental_return" ||
      isRentalReturnDocument(detail)
    ) {
      const rReturn = detail as RentalReturnDocument;

      if (rReturn.record_number) {
        fields.push({
          icon: FileText,
          iconColor: "bg-blue-500/10 text-blue-500",
          label: "Record number",
          value: rReturn.record_number,
        });
      }

      if (rReturn.return_date) {
        fields.push({
          icon: History,
          iconColor: "bg-emerald-500/10 text-emerald-600",
          label: "Return date",
          value: formatDate(rReturn.return_date),
        });
      }

      const leaseRecord = rReturn.rental?.record_number;
      if (leaseRecord) {
        fields.push({
          icon: FileText,
          iconColor: "bg-purple-500/10 text-purple-500",
          label: "Lease record",
          value: leaseRecord,
        });
      }

      fields.push({
        icon: FileText,
        iconColor: "bg-amber-500/10 text-amber-500",
        label: "Notes",
        value: (
          <span className="text-sm font-medium text-muted-foreground italic">
            {rReturn.notes || "-"}
          </span>
        ),
      });
    } else if (documentType === "transfer" || isTransferDocument(detail)) {
      const transfer = detail as TransferDocument;
      // Transfer specific fields
      const transferTypeLabel =
        transfer.transfer_type === "holder"
          ? "Holder"
          : transfer.transfer_type === "location"
            ? "Location"
            : "Unit";

      fields.push({
        icon: Package,
        iconColor: "bg-cyan-500/10 text-cyan-500",
        label: "Transfer type",
        value: transferTypeLabel,
        badge: {
          label: transferTypeLabel,
          variant: "secondary",
        },
      });

      fields.push({
        icon: User,
        iconColor: "bg-orange-500/10 text-orange-500",
        label: "From",
        value: transfer.from_name,
      });

      fields.push({
        icon: User,
        iconColor: "bg-green-500/10 text-green-500",
        label: "To",
        value: transfer.to_name,
      });

      fields.push({
        icon: History,
        iconColor: "bg-emerald-500/10 text-emerald-500",
        label: "Transfer date",
        value: formatDate(transfer.transfer_date),
      });

      fields.push({
        icon: Package,
        iconColor: "bg-purple-500/10 text-purple-500",
        label: "Total assets",
        value: transfer.total_assets,
      });

      if (transfer.external_link) {
        fields.push({
          icon: FileText,
          iconColor: "bg-cyan-500/10 text-cyan-500",
          label: "External link",
          value: (
            <a
              href={transfer.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View link
            </a>
          ),
        });
      }
    } else if (
      documentType === "maintenance" ||
      isMaintenanceDocument(detail)
    ) {
      const maintenance = detail as MaintenanceDocument;
      // Maintenance specific fields
      fields.push({
        icon: FileText,
        iconColor: "bg-blue-500/10 text-blue-500",
        label: "Ticket number",
        value: maintenance.ticket_number,
      });

      fields.push({
        icon: User,
        iconColor: "bg-indigo-500/10 text-indigo-500",
        label: "Service provider",
        value: maintenance.service_provider_name,
      });

      fields.push({
        icon: History,
        iconColor: "bg-emerald-500/10 text-emerald-500",
        label: "Outing date",
        value: formatDate(maintenance.outing_date),
      });

      if (maintenance.return_date) {
        fields.push({
          icon: History,
          iconColor: "bg-amber-500/10 text-amber-500",
          label: "Return date",
          value: formatDate(maintenance.return_date),
        });
      }

      fields.push({
        icon: Package,
        iconColor: "bg-purple-500/10 text-purple-500",
        label: "Expected cost",
        value: formatNumberWithCommas(maintenance.expected_cost),
      });

      if (maintenance.actual_cost) {
        fields.push({
          icon: Package,
          iconColor: "bg-emerald-500/10 text-emerald-500",
          label: "Actual cost",
          value: formatNumberWithCommas(maintenance.actual_cost),
        });
      }

      if (maintenance.handover_person) {
        fields.push({
          icon: User,
          iconColor: "bg-blue-500/10 text-blue-500",
          label: "Handover person",
          value: maintenance.handover_person,
        });
      }

      if (maintenance.taker_person_name) {
        fields.push({
          icon: User,
          iconColor: "bg-orange-500/10 text-orange-500",
          label: "Taker person",
          value: maintenance.taker_person_name,
        });
      }

      if (maintenance.external_link) {
        fields.push({
          icon: FileText,
          iconColor: "bg-cyan-500/10 text-cyan-500",
          label: "External link",
          value: (
            <a
              href={maintenance.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View link
            </a>
          ),
        });
      }

      if (maintenance.notes) {
        fields.push({
          icon: FileText,
          iconColor: "bg-orange-500/10 text-orange-500",
          label: "Notes",
          value: (
            <span className="text-sm font-medium text-muted-foreground italic">
              {maintenance.notes}
            </span>
          ),
        });
      }
    }

    // Reason (common field)
    if (
      (documentType === "allocation" ||
        documentType === "stock_in" ||
        documentType === "stock_out" ||
        documentType === "transfer" ||
        documentType === "maintenance" ||
        documentType === "liquidation" ||
        documentType === "recovery" ||
        isAllocationDocument(detail) ||
        isStockAdjustmentDocument(detail) ||
        isTransferDocument(detail) ||
        isMaintenanceDocument(detail) ||
        isLiquidationDocument(detail) ||
        isRecoveryDocument(detail)) &&
      (detail as { reason?: string }).reason
    ) {
      fields.push({
        icon: FileText,
        iconColor: "bg-orange-500/10 text-orange-500",
        label: "Reason",
        value: (
          <span className="text-sm font-medium text-muted-foreground italic">
            {(detail as { reason?: string }).reason}
          </span>
        ),
      });
    }

    // Liquidation specific fields
    if (documentType === "liquidation" || isLiquidationDocument(detail)) {
      const liquidation = detail as LiquidationDocument;
      fields.push({
        icon: History,
        iconColor: "bg-emerald-500/10 text-emerald-500",
        label: "Liquidation date",
        value: formatDate(liquidation.liquidation_date),
      });
      fields.push({
        icon: FileText,
        iconColor: "bg-violet-500/10 text-violet-500",
        label: "Type",
        value:
          liquidation.liquidation_type.charAt(0).toUpperCase() +
          liquidation.liquidation_type.slice(1),
      });
      fields.push({
        icon: Package,
        iconColor: "bg-amber-500/10 text-amber-500",
        label: "Total value",
        value: formatNumberWithCommas(liquidation.total_value),
      });
      if (liquidation.buyer_name) {
        fields.push({
          icon: User,
          iconColor: "bg-blue-500/10 text-blue-500",
          label: "Buyer",
          value: liquidation.buyer_name,
        });
      }
      if (liquidation.committee) {
        fields.push({
          icon: User,
          iconColor: "bg-indigo-500/10 text-indigo-500",
          label: "Committee",
          value: liquidation.committee,
        });
      }
      if (liquidation.notes) {
        fields.push({
          icon: FileText,
          iconColor: "bg-slate-500/10 text-slate-500",
          label: "Notes",
          value: (
            <span className="text-sm font-medium text-muted-foreground italic">
              {liquidation.notes}
            </span>
          ),
        });
      }
      if (liquidation.external_link) {
        fields.push({
          icon: FileText,
          iconColor: "bg-cyan-500/10 text-cyan-500",
          label: "External link",
          value: (
            <a
              href={liquidation.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View link
            </a>
          ),
        });
      }
    }

    // Detail items (table data)
    let detailItems = null;

    if (
      (documentType === "allocation" || isAllocationDocument(detail)) &&
      (detail as AllocationDocument).details?.length > 0
    ) {
      const allocationDetail = detail as AllocationDocument;
      detailItems = {
        title: "Allocated asset list",
        icon: Package,
        columns: [
          { key: "no", label: "No", align: "center" as const },
          { key: "asset", label: "Asset" },
          { key: "asset_code", label: "Asset Code" },
          { key: "location", label: "Location" },
          { key: "quantity", label: "Quantity", align: "center" as const },
        ],
        rows: allocationDetail.details.map((item, index) => ({
          id: item.id,
          no: index + 1,
          asset: item.asset.name,
          asset_code: item.asset.asset_code,
          location: item.location?.name || "-",
          quantity: item.quantity,
        })),
      };
    } else if (
      (documentType === "stock_in" ||
        documentType === "stock_out" ||
        isStockAdjustmentDocument(detail)) &&
      (detail as StockAdjustmentDocument).details?.length > 0
    ) {
      const adjustmentDetail = detail as StockAdjustmentDocument;
      detailItems = {
        title: "Stock adjustment list",
        icon: Package,
        columns: [
          { key: "no", label: "No", align: "center" as const },
          { key: "asset", label: "Asset" },
          { key: "asset_code", label: "Asset Code" },
          { key: "location", label: "Location" },
          { key: "type", label: "Type", align: "center" as const },
          { key: "quantity", label: "Quantity Diff", align: "center" as const },
        ],
        rows: adjustmentDetail.details.map((item, index) => ({
          id: item.id,
          no: index + 1,
          asset: item.asset.name,
          asset_code: item.asset.asset_code,
          location: item.location?.name || "-",
          type: item.adjustment_type,
          quantity: item.quantity_diff,
        })),
      };
    } else if (
      (documentType === "recovery" || isRecoveryDocument(detail)) &&
      (detail as RecoveryDocument).details?.length > 0
    ) {
      const recoveryDetail = detail as RecoveryDocument;
      detailItems = {
        title: "Recovered asset list",
        icon: Package,
        columns: [
          { key: "no", label: "No", align: "center" as const },
          { key: "asset", label: "Asset" },
          { key: "asset_code", label: "Asset Code" },
          { key: "location", label: "Location" },
          { key: "quantity", label: "Quantity", align: "center" as const },
        ],
        rows: recoveryDetail.details.map((item, index) => ({
          id: item.id,
          no: index + 1,
          asset: item.asset.name,
          asset_code: item.asset.asset_code,
          location: item.location?.name || "-",
          quantity: item.quantity,
        })),
      };
    } else if (
      (documentType === "rental_return" || isRentalReturnDocument(detail)) &&
      (detail as RentalReturnDocument).details?.length > 0
    ) {
      const rentalDetail = detail as RentalReturnDocument;
      detailItems = {
        title: "Returned asset list",
        icon: Package,
        columns: [
          { key: "no", label: "No", align: "center" as const },
          { key: "asset", label: "Asset" },
          { key: "asset_code", label: "Asset Code" },
          { key: "quantity", label: "Qty", align: "center" as const },
          { key: "condition", label: "Condition", align: "center" as const },
        ],
        rows: rentalDetail.details.map((item, index) => ({
          id: item.id,
          no: index + 1,
          asset: item.asset.name,
          asset_code: item.asset.asset_code,
          quantity: item.quantity,
          condition: item.condition || "-",
        })),
      };
    } else if (
      (documentType === "transfer" || isTransferDocument(detail)) &&
      (detail as TransferDocument).details?.length > 0
    ) {
      const transferDetail = detail as TransferDocument;
      detailItems = {
        title: "Transferred asset list",
        icon: Package,
        columns: [
          { key: "no", label: "No", align: "center" as const },
          { key: "asset_name", label: "Asset" },
          { key: "asset_code", label: "Asset Code" },
          { key: "from_location_name", label: "From Location" },
          { key: "quantity", label: "Quantity", align: "center" as const },
        ],
        rows: transferDetail.details.map((item, index) => ({
          id: item.id,
          no: index + 1,
          asset_name: item.asset_name,
          asset_code: item.asset_code,
          from_location_name: item.from_location_name,
          quantity: item.quantity,
        })),
      };
    } else if (
      (documentType === "maintenance" || isMaintenanceDocument(detail)) &&
      (detail as MaintenanceDocument).details?.length > 0
    ) {
      const maintenanceDetail = detail as MaintenanceDocument;
      detailItems = {
        title: "Maintenance asset list",
        icon: Package,
        columns: [
          { key: "no", label: "No", align: "center" as const },
          { key: "asset", label: "Asset" },
          { key: "asset_code", label: "Asset Code" },
          { key: "quantity", label: "Quantity", align: "center" as const },
          { key: "notes", label: "Notes" },
        ],
        rows: maintenanceDetail.details.map((item, index) => ({
          id: item.id,
          no: index + 1,
          asset: item.asset.name,
          asset_code: item.asset.asset_code,
          quantity: item.quantity,
          notes: item.notes || "-",
        })),
      };
    } else if (
      (documentType === "liquidation" || isLiquidationDocument(detail)) &&
      (detail as LiquidationDocument).details?.length > 0
    ) {
      const liquidationDetail = detail as LiquidationDocument;
      detailItems = {
        title: "Disposal items",
        icon: Package,
        columns: [
          { key: "no", label: "No", align: "center" as const },
          { key: "asset", label: "Asset" },
          { key: "asset_code", label: "Asset Code" },
          { key: "from_location", label: "From Location" },
          { key: "quantity", label: "Quantity", align: "center" as const },
          { key: "unit_value", label: "Unit Value", align: "center" as const },
          {
            key: "remaining_value",
            label: "Remaining Value",
            align: "center" as const,
          },
        ],
        rows: liquidationDetail.details.map((item, index) => ({
          id: item.id,
          no: index + 1,
          asset: item.asset.name,
          asset_code: item.asset.asset_code,
          from_location: item.from_location?.name || "-",
          quantity: item.quantity,
          unit_value: formatNumberWithCommas(item.unit_value),
          remaining_value: formatNumberWithCommas(item.remaining_value),
        })),
      };
    }

    // Document title
    const documentTitle = getDocumentTitle(documentType);

    return {
      fields,
      detailItems,
      documentTitle,
    };
  }, [detail, documentType]);

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    if (!activeTask) return;

    await mutate(
      {
        url: dynamicEndpoints.WORKFLOW_TASK_COMPLETE(activeTask?.id),
        method: "post",
        body: {
          status: status,
          comment: comment,
        },
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          dispatch(decrementPendingCount());
          reFetchDetail();
          reFetchHistory();
          reFetchMyTasks();
        },
        onError: (error) => {
          getApiErrorMessage(error);
        },
      },
    );
  };

  if (detailPending && !detail) {
    return (
      <div className="p-6 flex flex-col gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="flex flex-col px-4 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              Task Detail
            </h1>
            <span className="text-xs text-muted-foreground">
              Task Management
            </span>
          </div>
        </div>
      </div>

      {/* Main Action Card */}
      <Card className="border border-border/50 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md relative mt-2">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80" />
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/60">
            {/* Action Info */}
            <div className="flex-1 p-3 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-primary">
                    Approval request
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    You are at step{" "}
                    <span className="font-bold text-primary">
                      {activeTask?.step_name ?? "Processing"}
                    </span>
                    . Please review the details and take action.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Controls */}
            {activeTask?.status === "PENDING" && (
              <div className="md:w-[400px] p-3 bg-muted/30 flex flex-col gap-3">
                <div className="relative group">
                  <MessageSquare className="absolute top-3 left-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Textarea
                    placeholder="Enter approval notes (optional)..."
                    className="pl-10 min-h-[80px] bg-background border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all resize-none shadow-sm text-sm"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-emerald-600/90 hover:bg-emerald-600 text-white gap-2 h-11 transition-all active:scale-95 shadow-sm"
                    onClick={() => handleAction("APPROVED")}
                    disabled={mutatePending}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {mutatePending ? "Processing..." : "Approve"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-border/50 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 gap-2 h-11 transition-all active:scale-95"
                    onClick={() => handleAction("REJECTED")}
                    disabled={mutatePending}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-4">
        {/* Left Column: Document Info */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <Card className="shadow-sm border-border/50 h-full bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 py-3 px-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold text-primary">
                  {formattedData?.documentTitle}
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className={`${getStatusInfo(detail.status_obj?.name).color} px-3 py-1 font-bold text-sm`}
              >
                {getStatusInfo(detail.status_obj?.name).label}
              </Badge>
            </CardHeader>
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-foreground mb-4 tracking-tight">
                {detail.record_number}
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-4">
                {formattedData?.fields.map((field, index) => {
                  const IconComponent = field.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${field.iconColor} flex items-center justify-center shrink-0`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-muted-foreground tracking-wider">
                          {field.label}
                        </span>
                        <div className="flex items-center gap-2">
                          {field.badge && (
                            <Badge
                              variant="secondary"
                              className="text-sm h-5 bg-muted text-muted-foreground px-2 font-bold"
                            >
                              {field.badge.label}
                            </Badge>
                          )}
                          {typeof field.value === "string" ||
                          typeof field.value === "number" ? (
                            <span className="text-sm font-bold text-foreground">
                              {field.value}
                            </span>
                          ) : (
                            field.value
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {formattedData?.detailItems && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-primary border-b pb-1 w-full flex items-center gap-2">
                      <formattedData.detailItems.icon className="w-4 h-4" />
                      {formattedData.detailItems.title}
                    </h3>
                  </div>
                  <div className="rounded-xl border border-border/50 overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-sidebar-accent text-foreground border-b border-border/50">
                        <TableRow className="hover:bg-transparent border-border/50">
                          {formattedData.detailItems.columns.map((col) => (
                            <TableHead
                              key={col.key}
                              className={`text-sm font-bold text-muted-foreground h-11 ${col.key === formattedData.detailItems!.columns[0].key ? "px-4 w-[5%]" : ""} ${col.align === "center" ? "text-center" : ""}`}
                            >
                              {col.label}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formattedData.detailItems.rows.map((row) => (
                          <TableRow
                            key={row.id}
                            className="border-border/50 hover:bg-muted/50 transition-colors"
                          >
                            {formattedData.detailItems!.columns.map(
                              (col, colIndex) => (
                                <TableCell
                                  key={col.key}
                                  className={`py-2 ${colIndex === 0 ? "px-4" : ""} ${col.align === "center" ? "text-center" : ""}`}
                                >
                                  {col.key === "asset_code" ? (
                                    <code className="text-sm font-mono font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded">
                                      {row[col.key as keyof typeof row]}
                                    </code>
                                  ) : col.key === "quantity" ? (
                                    <span className="inline-flex items-center justify-center w-10 h-6 bg-primary/10 text-primary rounded-lg text-sm font-bold px-1">
                                      {row[col.key as keyof typeof row]}
                                    </span>
                                  ) : col.key === "returned_quantity" ? (
                                    <span className="inline-flex items-center justify-center w-10 h-6 bg-emerald-500/10 text-emerald-600 rounded-lg text-sm font-bold px-1">
                                      {row[col.key as keyof typeof row]}
                                    </span>
                                  ) : col.key === "rental_revenue" ? (
                                    <span className="text-sm font-bold text-foreground">
                                      {row[col.key as keyof typeof row]}
                                    </span>
                                  ) : col.key === "type" ? (
                                    <Badge
                                      variant="outline"
                                      className={`${row[col.key as keyof typeof row] === "INCREASE" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" : "bg-red-500/15 text-red-600 border-red-500/20"} px-2 py-0.5 font-bold text-xs`}
                                    >
                                      {row[col.key as keyof typeof row]}
                                    </Badge>
                                  ) : col.key === "condition" ? (
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-500/15 text-blue-600 border-blue-500/20 px-2 py-0.5 font-bold text-xs"
                                    >
                                      {row[col.key as keyof typeof row]}
                                    </Badge>
                                  ) : col.key === "no" ? (
                                    <span className="text-muted-foreground">
                                      {row[col.key as keyof typeof row]}
                                    </span>
                                  ) : col.key === "asset" ? (
                                    <span className="text-sm font-semibold text-foreground">
                                      {row[col.key as keyof typeof row]}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-muted-foreground font-medium">
                                      {row[col.key as keyof typeof row]}
                                    </span>
                                  )}
                                </TableCell>
                              ),
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sidebar info */}
        <div className="flex flex-col gap-3">
          <Card className="shadow-sm border-border/50 overflow-hidden bg-card/60 backdrop-blur-md group h-full">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
              <History className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
              <CardTitle className="text-sm font-semibold text-primary">
                Additional information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-muted-foreground tracking-wider">
                      Creator
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {detail.creator?.full_name ||
                      (isAllocationDocument(detail)
                        ? detail.issuer_name
                        : "N/A")}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-muted-foreground tracking-wider">
                      Created time
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-foreground">
                      {formatDateTime(detail.created_at)}
                    </span>
                  </div>
                </div>

                {isAllocationDocument(detail) && detail.issuer && (
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-muted-foreground tracking-wider">
                        Issuer details
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold text-foreground">
                        {detail.issuer.full_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {detail.issuer.role}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border/50 flex flex-col gap-2">
                  <span className="text-sm font-black text-muted-foreground tracking-[0.2em] text-center">
                    System notes
                  </span>
                  <p className="text-sm text-muted-foreground italic text-center leading-relaxed">
                    All approval information is saved in the process history and
                    cannot be deleted.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <RecordAttachmentsCard
        title="Vouchers & documents"
        className="mt-4"
        initialAttachments={
          (detail.attachments || []).map(
            (a: string | { url?: string; file_path?: string }) =>
              typeof a === "string" ? a : a?.url || a?.file_path || String(a),
          ) as string[]
        }
        isPending={mutatePending}
        onSave={async (newAttachments) => {
          const url = dynamicEndpoints.UPLOAD_ATTACHMENTS(
            documentType + "s",
            Number(id),
          );
          await mutate(
            {
              url,
              method: "patch",
              body: newAttachments,
            },
            {
              onSuccess: (res) => {
                getApiSuccessMessage(res);
                reFetchDetail();
              },
              onError: (error) => {
                getApiErrorMessage(error);
              },
            },
          );
        }}
      />

      {/* Approval History section (Footer) */}
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
    </div>
  );
}
