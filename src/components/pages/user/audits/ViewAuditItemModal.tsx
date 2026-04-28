"use client";

import {
  AlertTriangle,
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  HelpCircle,
  Info,
  Package,
  RotateCcw,
  User,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { IAuditDetailItem } from "@/types/audit";

import { useTranslations } from "next-intl";

interface Props {
  item: IAuditDetailItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewAuditItemModal({ item, isOpen, onClose }: Props) {
  const t = useTranslations("page_audits");

  if (!item) return null;

  const auditResults = [
    {
      code: "MATCHED",
      label: t("results.matched"),
      sub: t("results.matched_sub"),
      icon: CheckCircle2,
      color: "text-emerald-600",
      border: "border-emerald-500",
      bg: "bg-emerald-500/10",
      iconBg: "bg-emerald-500/20",
      ring: "ring-emerald-500",
    },
    {
      code: "LOST",
      label: t("results.lost"),
      sub: t("results.lost_sub"),
      icon: XCircle,
      color: "text-red-600",
      border: "border-red-500",
      bg: "bg-red-500/10",
      iconBg: "bg-red-500/20",
      ring: "ring-red-500",
    },
    {
      code: "DAMAGED",
      label: t("results.damaged"),
      sub: t("results.damaged_sub"),
      icon: AlertTriangle,
      color: "text-amber-600",
      border: "border-amber-500",
      bg: "bg-amber-500/10",
      iconBg: "bg-amber-500/20",
      ring: "ring-amber-500",
    },
    {
      code: "UNKNOWN",
      aliasCodes: ["MISMATCHED", "EXTRA", "COMPLETED"],
      label: t("results.unknown"),
      sub: t("results.unknown_sub"),
      icon: HelpCircle,
      color: "text-blue-600",
      border: "border-blue-500",
      bg: "bg-blue-500/10",
      iconBg: "bg-blue-500/20",
      ring: "ring-blue-500",
    },
  ];

  const proposedActions = [
    {
      key: null,
      label: t("actions.none"),
      sub: t("actions.none_sub"),
      icon: Package,
    },
    {
      key: "TRANSFER",
      label: t("actions.transfer"),
      sub: t("actions.transfer_sub"),
      icon: ArrowRightLeft,
    },
    {
      key: "RECALL",
      aliasKeys: ["RECOVER"],
      label: t("actions.recall"),
      sub: t("actions.recall_sub"),
      icon: RotateCcw,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>{t("detail_modal.title")}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {item.asset.asset_code} — {item.asset.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-6 pb-6 space-y-6 overflow-y-auto pt-6 custom-scrollbar">
          {/* Mode Notice */}
          <div className="bg-amber-50/50 border border-amber-200/50 text-amber-700 p-3 rounded-lg flex items-start gap-3 shadow-none">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-[12px] font-medium leading-relaxed">
              <span>{t("detail_modal.view_mode_notice")}</span>
            </div>
          </div>

          <FieldGroup className="gap-3">
            {/* Current Info */}
            <div className="p-5 rounded-xl bg-muted/30 border border-border/50 flex flex-col gap-5">
              <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Info size={14} className="text-primary/60" />
                {t("detail_modal.current_info")}
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">
                    {t("detail_modal.asset_code")}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {item.asset.asset_code}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">
                    {t("detail_modal.asset_name")}
                  </span>
                  <p className="text-sm font-bold text-foreground line-clamp-1">
                    {item.asset.name}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">
                    {t("detail_modal.holder")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-primary/60" />
                    <span className="text-sm font-bold text-foreground">
                      {item.asset.holder_name || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">
                    {t("detail_modal.quantity")}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {item.transfer_quantity ?? item.unit_quantity ?? 0}
                  </span>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">
                    {t("detail_modal.system_status")}
                  </span>
                  <Badge
                    variant="secondary"
                    className="w-fit px-2 py-0.5 text-[10px] font-bold rounded-md bg-primary/5 text-primary border-primary/20"
                  >
                    {item.asset.status_obj?.name}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Audit Result */}
            <Field className="gap-3">
              <FieldLabel>
                <span className="h-1 w-4 bg-primary rounded-full" />
                {t("detail_modal.audit_result")}
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                {auditResults.map((res) => {
                  const itemCode = item.status_obj?.code?.toUpperCase() || "";
                  const itemName = item.status_obj?.name?.toUpperCase() || "";
                  const isSelected =
                    itemCode === res.code ||
                    res.aliasCodes?.includes(itemCode) ||
                    itemName === res.label.toUpperCase();

                  return (
                    <div
                      key={res.code}
                      className={cn(
                        "p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-300",
                        isSelected
                          ? cn(
                            res.border,
                            res.bg,
                            res.ring,
                            "shadow-lg scale-[1.03] ring-2 ring-offset-2 ring-offset-background",
                          )
                          : "border-border/40 bg-muted/20 opacity-35 grayscale",
                      )}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-full",
                          isSelected ? res.iconBg : "bg-muted",
                        )}
                      >
                        <res.icon
                          size={20}
                          className={
                            isSelected ? res.color : "text-muted-foreground/50"
                          }
                        />
                      </div>
                      <span
                        className={cn(
                          "text-[14px] font-bold",
                          isSelected
                            ? cn(res.color, "opacity-90")
                            : "text-muted-foreground/60",
                        )}
                      >
                        {res.label}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] italic text-center",
                          isSelected
                            ? "text-foreground/60"
                            : "text-muted-foreground/50",
                        )}
                      >
                        {res.sub}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Field>

            {/* Proposed Action */}
            <Field className="gap-3">
              <FieldLabel>
                <span className="h-1 w-4 bg-primary rounded-full" />
                {t("detail_modal.proposed_action")}
              </FieldLabel>
              <div className="grid grid-cols-3 gap-3">
                {proposedActions.map((action) => {
                  const actionValue = item.proposed_action?.toUpperCase() || "";
                  const isSelected =
                    (item.proposed_action === null && action.key === null) ||
                    actionValue === action.key ||
                    action.aliasKeys?.includes(actionValue) ||
                    actionValue === action.label.toUpperCase();
                  return (
                    <div
                      key={action.label}
                      className={cn(
                        "p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-300",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.03]"
                          : "border-border/40 bg-muted/20 opacity-35 grayscale",
                      )}
                    >
                      <div
                        className={cn(
                          "p-1.5 rounded-full mb-0.5",
                          isSelected ? "bg-primary/20" : "bg-muted",
                        )}
                      >
                        <action.icon
                          size={16}
                          className={cn(
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground/50",
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-[12px] font-bold text-center",
                          isSelected
                            ? "text-primary"
                            : "text-muted-foreground/60",
                        )}
                      >
                        {action.label}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] truncate italic",
                          isSelected
                            ? "text-foreground/60"
                            : "text-muted-foreground/50",
                        )}
                      >
                        {action.sub}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Field>

            {/* Action Detail (Conditional) */}
            {item.proposed_action && (
              <Field className="p-3 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                  {item.proposed_action === "RECALL"
                    ? t("detail_modal.recall_info")
                    : t("detail_modal.transfer_info")}
                </h4>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest flex items-center gap-1">
                    {item.proposed_action === "RECALL"
                      ? t("detail_modal.receiving_warehouse")
                      : t("detail_modal.recipient_unit")}
                    <span className="text-red-500">*</span>
                  </span>
                  <div className="p-2.5 rounded-md border border-border/50 bg-background shadow-sm flex items-center gap-2 font-bold text-sm">
                    {item.proposed_action === "RECALL" ? (
                      <Building2 size={14} className="text-primary/60" />
                    ) : (
                      <User size={14} className="text-primary/60" />
                    )}
                    <span>
                      {item.target_holder_name ||
                        item.target_staff?.full_name ||
                        t("detail_modal.auto_assigned")}
                    </span>
                    {(item.transfer_quantity !== null ||
                      item.unit_quantity !== null) && (
                        <span className="ml-auto text-primary">
                          {t("detail_modal.quantity_label", {
                            value: item.transfer_quantity ?? item.unit_quantity,
                          })}
                        </span>
                      )}
                  </div>
                </div>
              </Field>
            )}

            {/* Notes */}
            <Field className="gap-2">
              <FieldLabel>
                {t("detail_modal.condition_notes")}
              </FieldLabel>
              <div className="p-3 rounded-xl border border-border bg-muted/5 min-h-[100px] text-sm text-foreground/80 leading-relaxed italic whitespace-pre-wrap">
                {item.notes || t("detail_modal.no_notes")}
              </div>
            </Field>
          </FieldGroup>
        </div>

        <DialogFooter className="p-3 shrink-0 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("detail_modal.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
