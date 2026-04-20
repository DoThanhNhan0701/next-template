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
  Plus,
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
import { Textarea } from "@/components/ui/textarea";
import { dynamicEndpoints } from "@/config/endpoints";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import {
  ApprovalHistory,
  DocumentDetail,
  ITask,
  getDocumentTitle,
  isAllocationDocument,
  isLiquidationDocument,
  isRecoveryDocument,
  isRentalReturnDocument,
  isStockAdjustmentDocument,
  isTransferDocument,
} from "@/types/task";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { formatDate } from "@/utils/date";

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

  // Format data động dựa trên API response
  const formattedData = useMemo(() => {
    if (!detail) return null;

    // Document fields
    const fields: Array<{
      icon: React.ComponentType<{ className?: string }>;
      iconColor: string;
      label: string;
      value: React.ReactNode;
      badge?: { label: string; variant?: string };
    }> = [];

    // Check document type and format accordingly
    if (isAllocationDocument(detail)) {
      // Allocation specific fields
      fields.push({
        icon: User,
        iconColor: "bg-primary/10 text-primary",
        label: "Allocated to",
        value: detail.allocated_to_name,
        badge: {
          label: detail.allocated_to_type === "user" ? "User" : "Unit",
          variant: "secondary",
        },
      });

      if (detail.unit?.name) {
        fields.push({
          icon: User,
          iconColor: "bg-blue-500/10 text-blue-500",
          label: "Unit",
          value: detail.unit.name,
        });
      }

      fields.push({
        icon: History,
        iconColor: "bg-emerald-500/10 text-emerald-500",
        label: "Allocation date",
        value: formatDate(detail.allocation_date),
      });

      if (detail.issuer_name) {
        fields.push({
          icon: User,
          iconColor: "bg-indigo-500/10 text-indigo-500",
          label: "Issuer",
          value: detail.issuer_name,
        });
      }
    } else if (isStockAdjustmentDocument(detail)) {
      // Stock adjustment specific fields
      fields.push({
        icon: History,
        iconColor: "bg-emerald-500/10 text-emerald-500",
        label: "Adjustment date",
        value: formatDate(detail.adjustment_date),
      });

      fields.push({
        icon: Package,
        iconColor: "bg-purple-500/10 text-purple-500",
        label: "Total quantity",
        value: detail.total_quantity,
      });

      if (detail.external_link) {
        fields.push({
          icon: FileText,
          iconColor: "bg-cyan-500/10 text-cyan-500",
          label: "External link",
          value: (
            <a
              href={detail.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View link
            </a>
          ),
        });
      }
    } else if (isRecoveryDocument(detail)) {
      // Recovery specific fields
      fields.push({
        icon: User,
        iconColor: "bg-rose-500/10 text-rose-500",
        label: "Recovered from",
        value: detail.recovered_from_name || detail.staff?.full_name || "N/A",
        badge: {
          label: detail.recovered_from_type === "user" ? "User" : "Unit",
          variant: "secondary",
        },
      });

      if (detail.unit?.name) {
        fields.push({
          icon: User,
          iconColor: "bg-blue-500/10 text-blue-500",
          label: "Unit",
          value: detail.unit.name,
        });
      }

      fields.push({
        icon: History,
        iconColor: "bg-emerald-500/10 text-emerald-500",
        label: "Recovery date",
        value: formatDate(detail.recovery_date),
      });

      fields.push({
        icon: Package,
        iconColor: "bg-purple-500/10 text-purple-500",
        label: "Total quantity",
        value: detail.total_quantity,
      });

      if (detail.notes) {
        fields.push({
          icon: FileText,
          iconColor: "bg-amber-500/10 text-amber-500",
          label: "Notes",
          value: (
            <span className="text-sm font-medium text-muted-foreground italic">
              {detail.notes}
            </span>
          ),
        });
      }

      if (detail.external_link) {
        fields.push({
          icon: FileText,
          iconColor: "bg-cyan-500/10 text-cyan-500",
          label: "External link",
          value: (
            <a
              href={detail.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View link
            </a>
          ),
        });
      }
    } else if (isRentalReturnDocument(detail)) {
      // Rental Return specific fields
      fields.push({
        icon: User,
        iconColor: "bg-violet-500/10 text-violet-500",
        label: "Customer",
        value: detail.rental.customer.name,
        badge: {
          label:
            detail.rental.customer.customer_type === "individual"
              ? "Individual"
              : "Organization",
          variant: "secondary",
        },
      });

      fields.push({
        icon: FileText,
        iconColor: "bg-blue-500/10 text-blue-500",
        label: "Contract number",
        value: detail.rental.contract_number,
      });

      fields.push({
        icon: History,
        iconColor: "bg-emerald-500/10 text-emerald-500",
        label: "Return date",
        value: formatDate(detail.return_date),
      });

      fields.push({
        icon: Package,
        iconColor: "bg-indigo-500/10 text-indigo-500",
        label: "Return to location",
        value: detail.to_location.name,
      });

      if (detail.notes) {
        fields.push({
          icon: FileText,
          iconColor: "bg-amber-500/10 text-amber-500",
          label: "Notes",
          value: (
            <span className="text-sm font-medium text-muted-foreground italic">
              {detail.notes}
            </span>
          ),
        });
      }
    } else if (isTransferDocument(detail)) {
      // Transfer specific fields
      const transferTypeLabel =
        detail.transfer_type === "holder"
          ? "Holder"
          : detail.transfer_type === "location"
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
        value: detail.from_name,
      });

      fields.push({
        icon: User,
        iconColor: "bg-green-500/10 text-green-500",
        label: "To",
        value: detail.to_name,
      });

      fields.push({
        icon: History,
        iconColor: "bg-emerald-500/10 text-emerald-500",
        label: "Transfer date",
        value: formatDate(detail.transfer_date),
      });

      fields.push({
        icon: Package,
        iconColor: "bg-purple-500/10 text-purple-500",
        label: "Total assets",
        value: detail.total_assets,
      });

      if (detail.external_link) {
        fields.push({
          icon: FileText,
          iconColor: "bg-cyan-500/10 text-cyan-500",
          label: "External link",
          value: (
            <a
              href={detail.external_link}
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

    // Reason (common field for Allocation, Stock, and Transfer)
    if (
      (isAllocationDocument(detail) ||
        isStockAdjustmentDocument(detail) ||
        isTransferDocument(detail)) &&
      detail.reason
    ) {
      fields.push({
        icon: FileText,
        iconColor: "bg-orange-500/10 text-orange-500",
        label: "Reason",
        value: (
          <span className="text-sm font-medium text-muted-foreground italic">
            {detail.reason}
          </span>
        ),
      });
    }

    // Liquidation specific fields
    if (isLiquidationDocument(detail)) {
      fields.push({
        icon: History,
        iconColor: "bg-emerald-500/10 text-emerald-500",
        label: "Liquidation date",
        value: formatDate(detail.liquidation_date),
      });
      fields.push({
        icon: FileText,
        iconColor: "bg-violet-500/10 text-violet-500",
        label: "Type",
        value:
          detail.liquidation_type.charAt(0).toUpperCase() +
          detail.liquidation_type.slice(1),
      });
      fields.push({
        icon: Package,
        iconColor: "bg-amber-500/10 text-amber-500",
        label: "Total value",
        value: `${detail.total_value.toLocaleString("vi-VN")} VND`,
      });
      if (detail.buyer_name) {
        fields.push({
          icon: User,
          iconColor: "bg-blue-500/10 text-blue-500",
          label: "Buyer",
          value: detail.buyer_name,
        });
      }
      if (detail.committee) {
        fields.push({
          icon: User,
          iconColor: "bg-indigo-500/10 text-indigo-500",
          label: "Committee",
          value: detail.committee,
        });
      }
      if (detail.reason) {
        fields.push({
          icon: FileText,
          iconColor: "bg-orange-500/10 text-orange-500",
          label: "Reason",
          value: (
            <span className="text-sm font-medium text-muted-foreground italic">
              {detail.reason}
            </span>
          ),
        });
      }
      if (detail.notes) {
        fields.push({
          icon: FileText,
          iconColor: "bg-slate-500/10 text-slate-500",
          label: "Notes",
          value: (
            <span className="text-sm font-medium text-muted-foreground italic">
              {detail.notes}
            </span>
          ),
        });
      }
      if (detail.external_link) {
        fields.push({
          icon: FileText,
          iconColor: "bg-cyan-500/10 text-cyan-500",
          label: "External link",
          value: (
            <a
              href={detail.external_link}
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

    if (isAllocationDocument(detail) && detail.details.length > 0) {
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
        rows: detail.details.map((item, index) => ({
          id: item.id,
          no: index + 1,
          asset: item.asset.name,
          asset_code: item.asset.asset_code,
          location: item.location.name || "-",
          quantity: item.quantity,
        })),
      };
    } else if (isStockAdjustmentDocument(detail) && detail.details.length > 0) {
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
        rows: detail.details.map((item, index) => ({
          id: item.id,
          no: index + 1,
          asset: item.asset.name,
          asset_code: item.asset.asset_code,
          location: item.location.name || "-",
          type: item.adjustment_type,
          quantity: item.quantity_diff,
        })),
      };
    } else if (isRecoveryDocument(detail) && detail.details.length > 0) {
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
        rows: detail.details.map((item, index) => ({
          id: item.id,
          no: index + 1,
          asset: item.asset.name,
          asset_code: item.asset.asset_code,
          location: item.location.name || "-",
          quantity: item.quantity,
        })),
      };
    } else if (isRentalReturnDocument(detail) && detail.details.length > 0) {
      detailItems = {
        title: "Returned asset list",
        icon: Package,
        columns: [
          { key: "no", label: "No", align: "center" as const },
          { key: "asset", label: "Asset" },
          { key: "asset_code", label: "Asset Code" },
          { key: "quantity", label: "Quantity", align: "center" as const },
          { key: "condition", label: "Condition", align: "center" as const },
        ],
        rows: detail.details.map((item, index) => ({
          id: item.id,
          no: index + 1,
          asset: item.asset.name,
          asset_code: item.asset.asset_code,
          quantity: item.quantity,
          condition: item.condition,
        })),
      };
    } else if (isTransferDocument(detail) && detail.details.length > 0) {
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
        rows: detail.details.map((item, index) => ({
          id: item.id,
          no: index + 1,
          asset_name: item.asset_name,
          asset_code: item.asset_code,
          from_location_name: item.from_location_name,
          quantity: item.quantity,
        })),
      };
    } else if (isLiquidationDocument(detail) && detail.details.length > 0) {
      detailItems = {
        title: "Disposal items",
        icon: Package,
        columns: [
          { key: "no", label: "No", align: "center" as const },
          { key: "asset", label: "Asset" },
          { key: "asset_code", label: "Asset Code" },
          { key: "from_location", label: "From Location" },
          { key: "quantity", label: "Qty", align: "center" as const },
          { key: "unit_value", label: "Unit Value", align: "center" as const },
          {
            key: "remaining_value",
            label: "Remaining Value",
            align: "center" as const,
          },
        ],
        rows: detail.details.map((item, index) => ({
          id: item.id,
          no: index + 1,
          asset: item.asset.name,
          asset_code: item.asset.asset_code,
          from_location: item.from_location?.name || "-",
          quantity: item.quantity,
          unit_value: item.unit_value.toLocaleString("vi-VN"),
          remaining_value: item.remaining_value.toLocaleString("vi-VN"),
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
      <div className="p-6 flex flex-col gap-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="flex flex-col px-4 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Main Action Card */}
      <Card className="border border-border/50 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md relative mt-2">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80" />
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/60">
            {/* Action Info */}
            <div className="flex-1 p-4 flex flex-col gap-3">
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
              <div className="md:w-[400px] p-4 bg-muted/30 flex flex-col gap-3">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Left Column: Document Info */}
        <div className="lg:col-span-2 flex flex-col gap-4">
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
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground mb-4 tracking-tight">
                {detail.record_number}
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-4">
                {formattedData?.fields.map((field, index) => {
                  const IconComponent = field.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
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
                                    <span className="inline-flex items-center justify-center w-8 h-6 bg-primary/10 text-primary rounded-lg text-sm font-bold">
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
        <div className="flex flex-col gap-4">
          <Card className="shadow-sm border-border/50 overflow-hidden bg-card/60 backdrop-blur-md group">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
              <History className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
              <CardTitle className="text-sm font-semibold text-primary">
                Additional information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
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

                <div className="flex items-center justify-between">
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
                      {detail.created_at
                        ? new Date(detail.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "N/A"}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {detail.created_at
                        ? new Date(detail.created_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>

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

          <Card className="shadow-sm border-border/50 overflow-hidden bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
              <Package className="w-4 h-4 text-emerald-500" />
              <CardTitle className="text-sm font-semibold text-primary">
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-primary rounded-full" />
                  <span className="text-sm font-bold text-foreground">
                    Vouchers & documents
                  </span>
                </div>
                <Button
                  size="icon-sm"
                  variant="outline"
                  className="h-7 px-3 gap-2 w-auto border-border/50 text-primary hover:bg-primary/10 transition-all active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                  <span className="text-sm font-bold">Upload record</span>
                </Button>
              </div>
              <div className="min-h-[140px] rounded-xl border-2 border-dashed border-border/30 flex flex-col items-center justify-center gap-3 bg-muted/20 group hover:bg-muted/40 hover:border-primary/30 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-background shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <span className="text-sm font-bold text-muted-foreground/60 tracking-wider">
                  No attachments yet
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
            <div className="flex flex-col gap-4 w-full">
              {historyList.map((hist) => (
                <div
                  key={hist.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/50 shadow-sm"
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
                        {new Date(hist.action_date).toLocaleString()}
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
