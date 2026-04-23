"use client";

import { useMemo } from "react";

import {
  Clock,
  FileText,
  History,
  LucideIcon,
  Package,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AllocationDocument,
  DocumentDetail,
  LiquidationDocument,
  MaintenanceDocument,
  RecoveryDocument,
  RentalDocument,
  RentalReturnDocument,
  StockAdjustmentDocument,
  TransferDocument,
  getDocumentTitle,
  isAllocationDocument,
  isLiquidationDocument,
  isMaintenanceDocument,
  isRecoveryDocument,
  isRentalDocument,
  isRentalReturnDocument,
  isStockAdjustmentDocument,
  isTransferDocument,
} from "@/types/task";
import { formatDate } from "@/utils/date";
import { formatNumberWithCommas } from "@/utils/number";

import { DetailTable } from "./DetailTable";
import { getStatusInfo } from "./status-utils";

interface DocumentInfoProps {
  detail: DocumentDetail;
  documentType: string;
}

export const DocumentInfo = ({ detail, documentType }: DocumentInfoProps) => {
  const formattedData = useMemo(() => {
    if (!detail) return null;

    const fields: Array<{
      icon: LucideIcon | React.ElementType;
      iconColor: string;
      label: string;
      value: React.ReactNode;
      badge?: { label: string; variant?: string };
    }> = [];

    // Helper to push fields
    const addField = (
      icon: LucideIcon | React.ElementType,
      color: string,
      label: string,
      value: React.ReactNode,
      badge?: { label: string; variant?: string },
    ) => {
      fields.push({ icon, iconColor: color, label, value, badge });
    };

    if (documentType === "allocation" || isAllocationDocument(detail)) {
      const allocation = detail as AllocationDocument;
      addField(
        User,
        "bg-primary/10 text-primary",
        "Allocated to",
        allocation.allocated_to_name || allocation.staff?.full_name || "N/A",
        {
          label: allocation.allocated_to_type === "user" ? "User" : "Unit",
          variant: "secondary",
        },
      );

      if (allocation.unit?.name) {
        addField(
          User,
          "bg-blue-500/10 text-blue-500",
          "Unit",
          allocation.unit.name,
        );
      }

      addField(
        History,
        "bg-emerald-500/10 text-emerald-500",
        "Allocation date",
        formatDate(allocation.allocation_date),
      );

      if (allocation.issuer_name) {
        addField(
          User,
          "bg-indigo-500/10 text-indigo-500",
          "Issuer",
          allocation.issuer_name,
        );
      }

      if (allocation.staff?.staff_code) {
        addField(
          User,
          "bg-amber-500/10 text-amber-500",
          "Staff code",
          allocation.staff.staff_code,
        );
      }

      addField(
        Package,
        "bg-purple-500/10 text-purple-500",
        "Total quantity",
        allocation.total_quantity,
      );
    } else if (
      documentType === "stock_in" ||
      documentType === "stock_out" ||
      isStockAdjustmentDocument(detail)
    ) {
      const adjustment = detail as StockAdjustmentDocument;
      addField(
        History,
        "bg-emerald-500/10 text-emerald-500",
        "Adjustment date",
        formatDate(adjustment.adjustment_date),
      );
      addField(
        Package,
        "bg-purple-500/10 text-purple-500",
        "Total quantity",
        adjustment.total_quantity,
      );

      if (adjustment.external_link) {
        addField(
          FileText,
          "bg-cyan-500/10 text-cyan-500",
          "External link",
          <a
            href={adjustment.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View link
          </a>,
        );
      }
    } else if (documentType === "recovery" || isRecoveryDocument(detail)) {
      const recovery = detail as RecoveryDocument;
      addField(
        User,
        "bg-rose-500/10 text-rose-500",
        "Recovered from",
        recovery.recovered_from_name || recovery.staff?.full_name || "N/A",
        {
          label: recovery.recovered_from_type === "user" ? "User" : "Unit",
          variant: "secondary",
        },
      );

      if (recovery.unit?.name) {
        addField(
          User,
          "bg-blue-500/10 text-blue-500",
          "Unit",
          recovery.unit.name,
        );
      }

      addField(
        History,
        "bg-emerald-500/10 text-emerald-500",
        "Recovery date",
        formatDate(recovery.recovery_date),
      );
      addField(
        Package,
        "bg-purple-500/10 text-purple-500",
        "Total quantity",
        recovery.total_quantity,
      );

      if (recovery.notes) {
        addField(
          FileText,
          "bg-amber-500/10 text-amber-500",
          "Notes",
          <span className="text-sm font-medium text-muted-foreground italic">
            {recovery.notes}
          </span>,
        );
      }

      if (recovery.external_link) {
        addField(
          FileText,
          "bg-cyan-500/10 text-cyan-500",
          "External link",
          <a
            href={recovery.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View link
          </a>,
        );
      }
    } else if (documentType === "rental" || isRentalDocument(detail)) {
      const rental = detail as RentalDocument;
      addField(
        User,
        "bg-primary/10 text-primary",
        "Customer",
        rental.customer?.name || "N/A",
      );

      if (rental.unit?.name) {
        addField(
          User,
          "bg-blue-500/10 text-blue-500",
          "Organization",
          rental.unit.name,
        );
      }

      addField(
        History,
        "bg-emerald-500/10 text-emerald-500",
        "Lease date",
        formatDate(rental.lease_date),
      );
      addField(
        Clock,
        "bg-amber-500/10 text-amber-500",
        "Duration",
        `${rental.duration_days} days`,
      );
      addField(
        Package,
        "bg-purple-500/10 text-purple-500",
        "Total revenue",
        formatNumberWithCommas(rental.total_revenue),
      );

      if (rental.contract_number) {
        addField(
          FileText,
          "bg-indigo-500/10 text-indigo-500",
          "Contract number",
          rental.contract_number,
        );
      }

      if (rental.external_link) {
        addField(
          FileText,
          "bg-cyan-500/10 text-cyan-500",
          "External link",
          <a
            href={rental.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View link
          </a>,
        );
      }
    } else if (
      documentType === "rental_return" ||
      isRentalReturnDocument(detail)
    ) {
      const rReturn = detail as RentalReturnDocument;
      if (rReturn.record_number) {
        addField(
          FileText,
          "bg-blue-500/10 text-blue-500",
          "Record number",
          rReturn.record_number,
        );
      }
      if (rReturn.return_date) {
        addField(
          History,
          "bg-emerald-500/10 text-emerald-600",
          "Return date",
          formatDate(rReturn.return_date),
        );
      }
      const leaseRecord = rReturn.rental?.record_number;
      if (leaseRecord) {
        addField(
          FileText,
          "bg-purple-500/10 text-purple-500",
          "Lease record",
          leaseRecord,
        );
      }
      addField(
        FileText,
        "bg-amber-500/10 text-amber-500",
        "Notes",
        <span className="text-sm font-medium text-muted-foreground italic">
          {rReturn.notes || "-"}
        </span>,
      );
    } else if (documentType === "transfer" || isTransferDocument(detail)) {
      const transfer = detail as TransferDocument;
      const transferTypeLabel =
        transfer.transfer_type === "holder"
          ? "Holder"
          : transfer.transfer_type === "location"
            ? "Location"
            : "Unit";
      addField(
        Package,
        "bg-cyan-500/10 text-cyan-500",
        "Transfer type",
        transferTypeLabel,
        { label: transferTypeLabel, variant: "secondary" },
      );
      addField(
        User,
        "bg-orange-500/10 text-orange-500",
        "From",
        transfer.from_name,
      );
      addField(User, "bg-green-500/10 text-green-500", "To", transfer.to_name);
      addField(
        History,
        "bg-emerald-500/10 text-emerald-500",
        "Transfer date",
        formatDate(transfer.transfer_date),
      );
      addField(
        Package,
        "bg-purple-500/10 text-purple-500",
        "Total assets",
        transfer.total_assets,
      );

      if (transfer.external_link) {
        addField(
          FileText,
          "bg-cyan-500/10 text-cyan-500",
          "External link",
          <a
            href={transfer.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View link
          </a>,
        );
      }
    } else if (
      documentType === "maintenance" ||
      isMaintenanceDocument(detail)
    ) {
      const maintenance = detail as MaintenanceDocument;
      addField(
        FileText,
        "bg-blue-500/10 text-blue-500",
        "Ticket number",
        maintenance.ticket_number,
      );
      addField(
        User,
        "bg-indigo-500/10 text-indigo-500",
        "Service provider",
        maintenance.service_provider_name,
      );
      addField(
        History,
        "bg-emerald-500/10 text-emerald-500",
        "Outing date",
        formatDate(maintenance.outing_date),
      );

      if (maintenance.return_date) {
        addField(
          History,
          "bg-amber-500/10 text-amber-500",
          "Return date",
          formatDate(maintenance.return_date),
        );
      }

      addField(
        Package,
        "bg-purple-500/10 text-purple-500",
        "Expected cost",
        formatNumberWithCommas(maintenance.expected_cost),
      );

      if (maintenance.actual_cost) {
        addField(
          Package,
          "bg-emerald-500/10 text-emerald-500",
          "Actual cost",
          formatNumberWithCommas(maintenance.actual_cost),
        );
      }

      if (maintenance.handover_person) {
        addField(
          User,
          "bg-blue-500/10 text-blue-500",
          "Handover person",
          maintenance.handover_person,
        );
      }

      if (maintenance.taker_person_name) {
        addField(
          User,
          "bg-orange-500/10 text-orange-500",
          "Taker person",
          maintenance.taker_person_name,
        );
      }

      if (maintenance.external_link) {
        addField(
          FileText,
          "bg-cyan-500/10 text-cyan-500",
          "External link",
          <a
            href={maintenance.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View link
          </a>,
        );
      }

      if (maintenance.notes) {
        addField(
          FileText,
          "bg-orange-500/10 text-orange-500",
          "Notes",
          <span className="text-sm font-medium text-muted-foreground italic">
            {maintenance.notes}
          </span>,
        );
      }
    }

    // Common: Reason
    const commonDetail = detail as { reason?: string };
    if (commonDetail.reason) {
      addField(
        FileText,
        "bg-orange-500/10 text-orange-500",
        "Reason",
        <span className="text-sm font-medium text-muted-foreground italic">
          {commonDetail.reason}
        </span>,
      );
    }

    // Liquidation specific
    if (documentType === "liquidation" || isLiquidationDocument(detail)) {
      const liquidation = detail as LiquidationDocument;
      addField(
        History,
        "bg-emerald-500/10 text-emerald-500",
        "Liquidation date",
        formatDate(liquidation.liquidation_date),
      );
      addField(
        FileText,
        "bg-violet-500/10 text-violet-500",
        "Type",
        liquidation.liquidation_type.charAt(0).toUpperCase() +
          liquidation.liquidation_type.slice(1),
      );
      addField(
        Package,
        "bg-amber-500/10 text-amber-500",
        "Total value",
        formatNumberWithCommas(liquidation.total_value),
      );

      if (liquidation.buyer_name) {
        addField(
          User,
          "bg-blue-500/10 text-blue-500",
          "Buyer",
          liquidation.buyer_name,
        );
      }
      if (liquidation.committee) {
        addField(
          User,
          "bg-indigo-500/10 text-indigo-500",
          "Committee",
          liquidation.committee,
        );
      }
      if (liquidation.notes) {
        addField(
          FileText,
          "bg-slate-500/10 text-slate-500",
          "Notes",
          <span className="text-sm font-medium text-muted-foreground italic">
            {liquidation.notes}
          </span>,
        );
      }
      if (liquidation.external_link) {
        addField(
          FileText,
          "bg-cyan-500/10 text-cyan-500",
          "External link",
          <a
            href={liquidation.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View link
          </a>,
        );
      }
    }

    // Table Data (Detail Items)
    let detailItems = null;

    if (
      (documentType === "allocation" || isAllocationDocument(detail)) &&
      (detail as AllocationDocument).details?.length > 0
    ) {
      const d = detail as AllocationDocument;
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
        rows: d.details.map((item, index) => ({
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
      const d = detail as StockAdjustmentDocument;
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
        rows: d.details.map((item, index) => ({
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
      const d = detail as RecoveryDocument;
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
        rows: d.details.map((item, index) => ({
          id: item.id,
          no: index + 1,
          asset: item.asset.name,
          asset_code: item.asset.asset_code,
          location: item.location?.name || "-",
          quantity: item.quantity,
        })),
      };
    } else if (
      (documentType === "rental" || isRentalDocument(detail)) &&
      (detail as RentalDocument).details?.length > 0
    ) {
      const d = detail as RentalDocument;
      detailItems = {
        title: "Rental asset list",
        icon: Package,
        columns: [
          { key: "no", label: "No", align: "center" as const },
          { key: "asset", label: "Asset" },
          { key: "asset_code", label: "Asset Code" },
          { key: "location", label: "From Location" },
          { key: "quantity", label: "Qty", align: "center" as const },
          { key: "rental_revenue", label: "Revenue", align: "center" as const },
        ],
        rows: d.details.map((item, index) => ({
          id: item.id,
          no: index + 1,
          asset: item.asset.name,
          asset_code: item.asset.asset_code,
          location: item.from_location?.name || "-",
          quantity: item.quantity,
          rental_revenue: formatNumberWithCommas(item.rental_revenue),
        })),
      };
    } else if (
      (documentType === "rental_return" || isRentalReturnDocument(detail)) &&
      (detail as RentalReturnDocument).details?.length > 0
    ) {
      const d = detail as RentalReturnDocument;
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
        rows: d.details.map((item, index) => ({
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
      const d = detail as TransferDocument;
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
        rows: d.details.map((item, index) => ({
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
      const d = detail as MaintenanceDocument;
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
        rows: d.details.map((item, index) => ({
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
      const d = detail as LiquidationDocument;
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
        rows: d.details.map((item, index) => ({
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

    return {
      fields,
      detailItems,
      documentTitle: getDocumentTitle(documentType),
    };
  }, [detail, documentType]);

  if (!formattedData) return null;

  return (
    <Card className="shadow-sm border-border/50 h-full bg-card/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 py-3 px-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-semibold text-primary">
            {formattedData.documentTitle}
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
          {formattedData.fields.map((field, index) => {
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

        {formattedData.detailItems && (
          <DetailTable detailItems={formattedData.detailItems} />
        )}
      </CardContent>
    </Card>
  );
};
