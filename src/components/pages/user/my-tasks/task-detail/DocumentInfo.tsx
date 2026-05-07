"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";

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
  const t = useTranslations("page_my_tasks.detail.document_info");
  const tFields = useTranslations("page_my_tasks.detail.document_info.fields");

  const formattedData = useMemo(() => {
    if (!detail) return null;

    const fields: Array<{
      icon: LucideIcon | React.ElementType;
      iconColor: string;
      label: string;
      value: React.ReactNode;
      badge?: { label: string; variant?: string };
      fullWidth?: boolean;
    }> = [];

    // Helper to push fields
    const addField = (
      icon: LucideIcon | React.ElementType,
      color: string,
      label: string,
      value: React.ReactNode,
      badge?: { label: string; variant?: string },
      fullWidth?: boolean,
    ) => {
      fields.push({ icon, iconColor: color, label, value, badge, fullWidth });
    };

    if (documentType === "allocation" || isAllocationDocument(detail)) {
      const allocation = detail as AllocationDocument;
      addField(
        User,
        "bg-primary/10 text-primary",
        tFields("allocated_to"),
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
          tFields("unit"),
          allocation.unit.name,
        );
      }

      addField(
        History,
        "bg-emerald-500/10 text-emerald-500",
        tFields("allocation_date"),
        formatDate(allocation.allocation_date),
      );

      if (allocation.issuer_name) {
        addField(
          User,
          "bg-indigo-500/10 text-indigo-500",
          tFields("issuer"),
          allocation.issuer_name,
        );
      }

      if (allocation.staff?.staff_code) {
        addField(
          User,
          "bg-amber-500/10 text-amber-500",
          tFields("staff_code"),
          allocation.staff.staff_code,
        );
      }

      addField(
        Package,
        "bg-purple-500/10 text-purple-500",
        tFields("total_quantity"),
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
        tFields("adjustment_date"),
        formatDate(adjustment.adjustment_date),
      );
      addField(
        Package,
        "bg-purple-500/10 text-purple-500",
        tFields("total_quantity"),
        adjustment.total_quantity,
      );

      if (adjustment.external_link) {
        addField(
          FileText,
          "bg-cyan-500/10 text-cyan-500",
          tFields("external_link"),
          <a
            href={adjustment.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {tFields("view_link")}
          </a>,
        );
      }
    } else if (documentType === "recovery" || isRecoveryDocument(detail)) {
      const recovery = detail as RecoveryDocument;
      addField(
        User,
        "bg-rose-500/10 text-rose-500",
        tFields("recovered_from"),
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
          tFields("unit"),
          recovery.unit.name,
        );
      }

      addField(
        History,
        "bg-emerald-500/10 text-emerald-500",
        tFields("recovery_date"),
        formatDate(recovery.recovery_date),
      );
      addField(
        Package,
        "bg-purple-500/10 text-purple-500",
        tFields("total_quantity"),
        recovery.total_quantity,
      );

      if (recovery.notes) {
        addField(
          FileText,
          "bg-amber-500/10 text-amber-500",
          tFields("notes"),
          <span className="text-sm font-medium text-muted-foreground italic">
            {recovery.notes}
          </span>,
          undefined,
          true,
        );
      }

      if (recovery.external_link) {
        addField(
          FileText,
          "bg-cyan-500/10 text-cyan-500",
          tFields("external_link"),
          <a
            href={recovery.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {tFields("view_link")}
          </a>,
        );
      }
    } else if (documentType === "rental" || isRentalDocument(detail)) {
      const rental = detail as RentalDocument;
      addField(
        User,
        "bg-primary/10 text-primary",
        tFields("customer"),
        rental.customer?.name || "N/A",
      );

      if (rental.unit?.name) {
        addField(
          User,
          "bg-blue-500/10 text-blue-500",
          tFields("unit"),
          rental.unit.name,
        );
      }

      addField(
        History,
        "bg-emerald-500/10 text-emerald-500",
        tFields("lease_date"),
        formatDate(rental.lease_date),
      );
      addField(
        Clock,
        "bg-amber-500/10 text-amber-500",
        tFields("duration"),
        `${rental.duration_days} days`,
      );
      addField(
        Package,
        "bg-purple-500/10 text-purple-500",
        tFields("total_revenue"),
        formatNumberWithCommas(rental.total_revenue),
      );

      if (rental.contract_number) {
        addField(
          FileText,
          "bg-indigo-500/10 text-indigo-500",
          tFields("contract_number"),
          rental.contract_number,
        );
      }

      if (rental.external_link) {
        addField(
          FileText,
          "bg-cyan-500/10 text-cyan-500",
          tFields("external_link"),
          <a
            href={rental.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {tFields("view_link")}
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
          tFields("record_number"),
          rReturn.record_number,
        );
      }
      if (rReturn.return_date) {
        addField(
          History,
          "bg-emerald-500/10 text-emerald-600",
          tFields("return_date"),
          formatDate(rReturn.return_date),
        );
      }

      // To Location - Vị trí trả về
      if (rReturn.to_location?.name) {
        addField(
          Package,
          "bg-cyan-500/10 text-cyan-500",
          tFields("to_location"),
          rReturn.to_location.name,
        );
      }

      // Rental Information
      const leaseRecord = rReturn.rental?.record_number;
      if (leaseRecord) {
        addField(
          FileText,
          "bg-purple-500/10 text-purple-500",
          tFields("lease_record"),
          leaseRecord,
        );
      }

      // Customer from rental
      if (rReturn.rental?.customer?.name) {
        addField(
          User,
          "bg-primary/10 text-primary",
          tFields("customer"),
          rReturn.rental.customer.name,
        );
      }

      // Contract number from rental
      if (rReturn.rental?.contract_number) {
        addField(
          FileText,
          "bg-indigo-500/10 text-indigo-500",
          tFields("contract_number"),
          rReturn.rental.contract_number,
        );
      }

      // Lease date from rental
      if (rReturn.rental?.lease_date) {
        addField(
          History,
          "bg-teal-500/10 text-teal-500",
          tFields("lease_date"),
          formatDate(rReturn.rental.lease_date),
        );
      }

      addField(
        FileText,
        "bg-amber-500/10 text-amber-500",
        tFields("notes"),
        <span className="text-sm font-medium text-muted-foreground italic">
          {rReturn.notes || "-"}
        </span>,
        undefined,
        true,
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
        tFields("transfer_type"),
        transferTypeLabel,
        { label: transferTypeLabel, variant: "secondary" },
      );
      addField(
        User,
        "bg-orange-500/10 text-orange-500",
        tFields("from"),
        transfer.from_name,
      );
      addField(
        User,
        "bg-green-500/10 text-green-500",
        tFields("to"),
        transfer.to_name,
      );
      addField(
        History,
        "bg-emerald-500/10 text-emerald-500",
        tFields("transfer_date"),
        formatDate(transfer.transfer_date),
      );
      addField(
        Package,
        "bg-purple-500/10 text-purple-500",
        tFields("total_assets"),
        transfer.total_assets,
      );

      if (transfer.external_link) {
        addField(
          FileText,
          "bg-cyan-500/10 text-cyan-500",
          tFields("external_link"),
          <a
            href={transfer.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {tFields("view_link")}
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
        tFields("ticket_number"),
        maintenance.ticket_number,
      );
      addField(
        User,
        "bg-indigo-500/10 text-indigo-500",
        tFields("service_provider"),
        maintenance.service_provider_name,
      );
      addField(
        History,
        "bg-emerald-500/10 text-emerald-500",
        tFields("outing_date"),
        formatDate(maintenance.outing_date),
      );

      if (maintenance.return_date) {
        addField(
          History,
          "bg-amber-500/10 text-amber-500",
          tFields("return_date"),
          formatDate(maintenance.return_date),
        );
      }

      addField(
        Package,
        "bg-purple-500/10 text-purple-500",
        tFields("expected_cost"),
        formatNumberWithCommas(maintenance.expected_cost),
      );

      if (maintenance.actual_cost) {
        addField(
          Package,
          "bg-emerald-500/10 text-emerald-500",
          tFields("actual_cost"),
          formatNumberWithCommas(maintenance.actual_cost),
        );
      }

      if (maintenance.handover_person) {
        addField(
          User,
          "bg-blue-500/10 text-blue-500",
          tFields("handover_person"),
          maintenance.handover_person,
        );
      }

      if (maintenance.taker_person_name) {
        addField(
          User,
          "bg-orange-500/10 text-orange-500",
          tFields("taker_person"),
          maintenance.taker_person_name,
        );
      }

      if (maintenance.external_link) {
        addField(
          FileText,
          "bg-cyan-500/10 text-cyan-500",
          tFields("external_link"),
          <a
            href={maintenance.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {tFields("view_link")}
          </a>,
        );
      }

      if (maintenance.notes) {
        addField(
          FileText,
          "bg-orange-500/10 text-orange-500",
          tFields("notes"),
          <span className="text-sm font-medium text-muted-foreground italic">
            {maintenance.notes}
          </span>,
          undefined,
          true,
        );
      }
    }

    // Common: Reason
    const commonDetail = detail as { reason?: string };
    if (commonDetail.reason) {
      addField(
        FileText,
        "bg-orange-500/10 text-orange-500",
        tFields("reason"),
        <span className="text-sm font-medium text-muted-foreground italic">
          {commonDetail.reason}
        </span>,
        undefined,
        true,
      );
    }

    // Liquidation specific
    if (documentType === "liquidation" || isLiquidationDocument(detail)) {
      const liquidation = detail as LiquidationDocument;
      addField(
        History,
        "bg-emerald-500/10 text-emerald-500",
        tFields("liquidation_date"),
        formatDate(liquidation.liquidation_date),
      );
      addField(
        FileText,
        "bg-violet-500/10 text-violet-500",
        tFields("type"),
        liquidation.liquidation_type.charAt(0).toUpperCase() +
          liquidation.liquidation_type.slice(1),
      );
      addField(
        Package,
        "bg-amber-500/10 text-amber-500",
        tFields("total_value"),
        formatNumberWithCommas(liquidation.total_value),
      );

      if (liquidation.buyer_name) {
        addField(
          User,
          "bg-blue-500/10 text-blue-500",
          tFields("buyer"),
          liquidation.buyer_name,
        );
      }
      if (liquidation.committee) {
        addField(
          User,
          "bg-indigo-500/10 text-indigo-500",
          tFields("committee"),
          liquidation.committee,
        );
      }
      if (liquidation.notes) {
        addField(
          FileText,
          "bg-slate-500/10 text-slate-500",
          tFields("notes"),
          <span className="text-sm font-medium text-muted-foreground italic">
            {liquidation.notes}
          </span>,
          undefined,
          true,
        );
      }
      if (liquidation.external_link) {
        addField(
          FileText,
          "bg-cyan-500/10 text-cyan-500",
          tFields("external_link"),
          <a
            href={liquidation.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {tFields("view_link")}
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
        title: t("tables.allocated_assets.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.allocated_assets.cols.no"),
            align: "center" as const,
          },
          { key: "asset", label: t("tables.allocated_assets.cols.asset") },
          {
            key: "asset_code",
            label: t("tables.allocated_assets.cols.asset_code"),
          },
          {
            key: "location",
            label: t("tables.allocated_assets.cols.location"),
          },
          {
            key: "quantity",
            label: t("tables.allocated_assets.cols.quantity"),
            align: "center" as const,
          },
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
        title: t("tables.stock_adjustment.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.stock_adjustment.cols.no"),
            align: "center" as const,
          },
          { key: "asset", label: t("tables.stock_adjustment.cols.asset") },
          {
            key: "asset_code",
            label: t("tables.stock_adjustment.cols.asset_code"),
          },
          {
            key: "location",
            label: t("tables.stock_adjustment.cols.location"),
          },
          {
            key: "type",
            label: t("tables.stock_adjustment.cols.type"),
            align: "center" as const,
          },
          {
            key: "quantity",
            label: t("tables.stock_adjustment.cols.quantity"),
            align: "center" as const,
          },
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
        title: t("tables.recovered_assets.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.recovered_assets.cols.no"),
            align: "center" as const,
          },
          { key: "asset", label: t("tables.recovered_assets.cols.asset") },
          {
            key: "asset_code",
            label: t("tables.recovered_assets.cols.asset_code"),
          },
          {
            key: "location",
            label: t("tables.recovered_assets.cols.location"),
          },
          {
            key: "quantity",
            label: t("tables.recovered_assets.cols.quantity"),
            align: "center" as const,
          },
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
        title: t("tables.rental_assets.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.rental_assets.cols.no"),
            align: "center" as const,
          },
          { key: "asset", label: t("tables.rental_assets.cols.asset") },
          {
            key: "asset_code",
            label: t("tables.rental_assets.cols.asset_code"),
          },
          {
            key: "location",
            label: t("tables.rental_assets.cols.from_location"),
          },
          {
            key: "quantity",
            label: t("tables.rental_assets.cols.quantity"),
            align: "center" as const,
          },
          {
            key: "rental_revenue",
            label: t("tables.rental_assets.cols.revenue"),
            align: "center" as const,
          },
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
        title: t("tables.returned_assets.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.returned_assets.cols.no"),
            align: "center" as const,
          },
          { key: "asset", label: t("tables.returned_assets.cols.asset") },
          {
            key: "asset_code",
            label: t("tables.returned_assets.cols.asset_code"),
          },
          {
            key: "quantity",
            label: t("tables.returned_assets.cols.quantity"),
            align: "center" as const,
          },
          {
            key: "condition",
            label: t("tables.returned_assets.cols.condition"),
            align: "center" as const,
          },
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
        title: t("tables.transferred_assets.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.transferred_assets.cols.no"),
            align: "center" as const,
          },
          {
            key: "asset_name",
            label: t("tables.transferred_assets.cols.asset"),
          },
          {
            key: "asset_code",
            label: t("tables.transferred_assets.cols.asset_code"),
          },
          {
            key: "from_location_name",
            label: t("tables.transferred_assets.cols.from_location"),
          },
          {
            key: "quantity",
            label: t("tables.transferred_assets.cols.quantity"),
            align: "center" as const,
          },
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
        title: t("tables.maintenance_assets.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.maintenance_assets.cols.no"),
            align: "center" as const,
          },
          { key: "asset", label: t("tables.maintenance_assets.cols.asset") },
          {
            key: "asset_code",
            label: t("tables.maintenance_assets.cols.asset_code"),
          },
          {
            key: "quantity",
            label: t("tables.maintenance_assets.cols.quantity"),
            align: "center" as const,
          },
          { key: "notes", label: t("tables.maintenance_assets.cols.notes") },
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
        title: t("tables.disposal_items.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.disposal_items.cols.no"),
            align: "center" as const,
          },
          { key: "asset", label: t("tables.disposal_items.cols.asset") },
          {
            key: "asset_code",
            label: t("tables.disposal_items.cols.asset_code"),
          },
          {
            key: "from_location",
            label: t("tables.disposal_items.cols.from_location"),
          },
          {
            key: "quantity",
            label: t("tables.disposal_items.cols.quantity"),
            align: "center" as const,
          },
          {
            key: "unit_value",
            label: t("tables.disposal_items.cols.unit_value"),
            align: "center" as const,
          },
          {
            key: "remaining_value",
            label: t("tables.disposal_items.cols.remaining_value"),
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
      documentTitle: t(`titles.${documentType}`, {
        fallback: t("titles.default"),
      }),
    };
  }, [detail, documentType, t, tFields]);

  if (!formattedData) return null;

  return (
    <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md h-full rounded-md">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 py-2 px-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xs font-semibold text-primary">
            {formattedData.documentTitle}
          </CardTitle>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-foreground tracking-tight">
            {detail.record_number}
          </span>
          <Badge
            variant="outline"
            className={`${getStatusInfo(detail.status_obj?.name).color} px-2 py-0.5 font-bold text-xs`}
          >
            {getStatusInfo(detail.status_obj?.name).label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
            {formattedData.fields.map((field, index) => {
              const IconComponent = field.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 border-b border-border/20 py-1.5 last:border-0 ${field.fullWidth ? "md:col-span-2 lg:col-span-3" : ""}`}
                >
                <div
                  className={`w-7 h-7 rounded-full ${field.iconColor} flex items-center justify-center shrink-0`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-tight">
                    {field.label}
                  </span>
                  <div className="flex items-center gap-1 overflow-hidden">
                    {field.badge && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-4 bg-muted text-muted-foreground px-1 border-0"
                      >
                        {field.badge.label}
                      </Badge>
                    )}
                    <div className="truncate text-xs font-semibold text-foreground">
                      {typeof field.value === "string" ||
                      typeof field.value === "number"
                        ? field.value
                        : field.value}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export const DocumentDetailTable = ({
  detail,
  documentType,
}: DocumentInfoProps) => {
  const t = useTranslations("page_my_tasks.detail.document_info");

  const detailItems = useMemo(() => {
    if (!detail) return null;

    // Table Data (Detail Items) - Reusing logic from above but simplified
    if (
      (documentType === "allocation" || isAllocationDocument(detail)) &&
      (detail as AllocationDocument).details?.length > 0
    ) {
      const d = detail as AllocationDocument;
      return {
        title: t("tables.allocated_assets.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.allocated_assets.cols.no"),
            align: "center" as const,
          },
          { key: "asset", label: t("tables.allocated_assets.cols.asset") },
          {
            key: "asset_code",
            label: t("tables.allocated_assets.cols.asset_code"),
          },
          {
            key: "location",
            label: t("tables.allocated_assets.cols.location"),
          },
          {
            key: "quantity",
            label: t("tables.allocated_assets.cols.quantity"),
            align: "center" as const,
          },
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
      return {
        title: t("tables.stock_adjustment.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.stock_adjustment.cols.no"),
            align: "center" as const,
          },
          { key: "asset", label: t("tables.stock_adjustment.cols.asset") },
          {
            key: "asset_code",
            label: t("tables.stock_adjustment.cols.asset_code"),
          },
          {
            key: "location",
            label: t("tables.stock_adjustment.cols.location"),
          },
          {
            key: "type",
            label: t("tables.stock_adjustment.cols.type"),
            align: "center" as const,
          },
          {
            key: "quantity",
            label: t("tables.stock_adjustment.cols.quantity"),
            align: "center" as const,
          },
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
      return {
        title: t("tables.recovered_assets.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.recovered_assets.cols.no"),
            align: "center" as const,
          },
          { key: "asset", label: t("tables.recovered_assets.cols.asset") },
          {
            key: "asset_code",
            label: t("tables.recovered_assets.cols.asset_code"),
          },
          {
            key: "location",
            label: t("tables.recovered_assets.cols.location"),
          },
          {
            key: "quantity",
            label: t("tables.recovered_assets.cols.quantity"),
            align: "center" as const,
          },
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
      return {
        title: t("tables.rental_assets.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.rental_assets.cols.no"),
            align: "center" as const,
          },
          { key: "asset", label: t("tables.rental_assets.cols.asset") },
          {
            key: "asset_code",
            label: t("tables.rental_assets.cols.asset_code"),
          },
          {
            key: "location",
            label: t("tables.rental_assets.cols.from_location"),
          },
          {
            key: "quantity",
            label: t("tables.rental_assets.cols.quantity"),
            align: "center" as const,
          },
          {
            key: "rental_revenue",
            label: t("tables.rental_assets.cols.revenue"),
            align: "center" as const,
          },
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
      return {
        title: t("tables.returned_assets.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.returned_assets.cols.no"),
            align: "center" as const,
          },
          { key: "asset", label: t("tables.returned_assets.cols.asset") },
          {
            key: "asset_code",
            label: t("tables.returned_assets.cols.asset_code"),
          },
          {
            key: "quantity",
            label: t("tables.returned_assets.cols.quantity"),
            align: "center" as const,
          },
          {
            key: "condition",
            label: t("tables.returned_assets.cols.condition"),
            align: "center" as const,
          },
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
      return {
        title: t("tables.transferred_assets.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.transferred_assets.cols.no"),
            align: "center" as const,
          },
          {
            key: "asset_name",
            label: t("tables.transferred_assets.cols.asset"),
          },
          {
            key: "asset_code",
            label: t("tables.transferred_assets.cols.asset_code"),
          },
          {
            key: "from_location_name",
            label: t("tables.transferred_assets.cols.from_location"),
          },
          {
            key: "quantity",
            label: t("tables.transferred_assets.cols.quantity"),
            align: "center" as const,
          },
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
      return {
        title: t("tables.maintenance_assets.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.maintenance_assets.cols.no"),
            align: "center" as const,
          },
          { key: "asset", label: t("tables.maintenance_assets.cols.asset") },
          {
            key: "asset_code",
            label: t("tables.maintenance_assets.cols.asset_code"),
          },
          {
            key: "quantity",
            label: t("tables.maintenance_assets.cols.quantity"),
            align: "center" as const,
          },
          { key: "notes", label: t("tables.maintenance_assets.cols.notes") },
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
      return {
        title: t("tables.disposal_items.title"),
        icon: Package,
        columns: [
          {
            key: "no",
            label: t("tables.disposal_items.cols.no"),
            align: "center" as const,
          },
          { key: "asset", label: t("tables.disposal_items.cols.asset") },
          {
            key: "asset_code",
            label: t("tables.disposal_items.cols.asset_code"),
          },
          {
            key: "from_location",
            label: t("tables.disposal_items.cols.from_location"),
          },
          {
            key: "quantity",
            label: t("tables.disposal_items.cols.quantity"),
            align: "center" as const,
          },
          {
            key: "unit_value",
            label: t("tables.disposal_items.cols.unit_value"),
            align: "center" as const,
          },
          {
            key: "remaining_value",
            label: t("tables.disposal_items.cols.remaining_value"),
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
    return null;
  }, [detail, documentType, t]);

  if (!detailItems) return null;

  return (
    <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md mt-3 overflow-hidden rounded-md">
      <CardContent className="p-0">
        <DetailTable detailItems={detailItems} />
      </CardContent>
    </Card>
  );
};
