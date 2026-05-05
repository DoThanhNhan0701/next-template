"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import {
  AlertTriangle,
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  HelpCircle,
  Info,
  MapPin,
  Package,
  RotateCcw,
  ShieldAlert,
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
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { endpoints } from "@/config/endpoints";
import { dynamicEndpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { IAuditDetailItem } from "@/types/audit";
import { ILocation } from "@/types/location";
import { IOrgUnit } from "@/types/org";
import { IStaff } from "@/types/staff";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

interface Props {
  item: IAuditDetailItem | null;
  isOpen: boolean;
  onClose: () => void;
  assigneeUsername?: string;
  onRefresh?: () => void;
  isLocked?: boolean;
}

export default function ViewAuditItemModal({
  item,
  isOpen,
  onClose,
  assigneeUsername,
  onRefresh,
  isLocked,
}: Props) {
  const t = useTranslations("page_audits");
  const { user } = usePermissions();

  const [localStatus, setLocalStatus] = useState<string | null>(
    item?.status_obj?.code?.toUpperCase() || null,
  );
  const [localAction, setLocalAction] = useState<string | null>(
    item?.proposed_action?.toUpperCase() || null,
  );
  const [localNotes, setLocalNotes] = useState<string>(item?.notes || "");

  const [targetUnitId, setTargetUnitId] = useState<number | null>(
    item?.target_unit_id || null,
  );
  const [targetStaffId, setTargetStaffId] = useState<number | null>(
    item?.target_staff_id || null,
  );
  const [targetLocationId, setTargetLocationId] = useState<number | null>(
    item?.target_location_id || null,
  );

  const { response: orgUnits } = useGet<IOrgUnit[]>({
    url: endpoints.ORG_UNITS,
  });

  const { response: staffRes } = useGet<{ items: IStaff[] }>(
    {
      url: endpoints.STAFFS,
      config: {
        params: {
          unit_id: targetUnitId,
        },
      },
    },
    { disabled: !targetUnitId, deps: [targetUnitId] },
  );

  const staffs = staffRes?.items || [];

  const { response: locations } = useGet<ILocation[]>({
    url: endpoints.LOCATIONS,
  });

  const { mutate, pending: isSaving } = useMutation();

  const isAssignee = user?.username === assigneeUsername;
  const canEdit = isAssignee && !isLocked;

  if (!item) return null;

  const handleSave = async () => {
    if (!item || !localStatus) return;

    const queryParams = new URLSearchParams();
    queryParams.append("status", localStatus);
    if (localNotes) queryParams.append("notes", localNotes);
    if (localAction) queryParams.append("proposed_action", localAction);
    if (targetUnitId)
      queryParams.append("target_unit_id", targetUnitId.toString());
    if (targetStaffId)
      queryParams.append("target_staff_id", targetStaffId.toString());
    if (targetLocationId)
      queryParams.append("target_location_id", targetLocationId.toString());

    const url = `${dynamicEndpoints.AUDIT_DETAIL_UPDATE(item.id)}?${queryParams.toString()}`;

    await mutate(
      {
        url,
        method: "patch",
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          onRefresh?.();
          onClose();
        },
        onError: (err) => {
          getApiErrorMessage(err);
        },
      },
    );
  };

  const auditResults = [
    {
      code: "MATCHED",
      label: t("results.matched"),
      sub: t("results.matched_sub"),
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      activeShadow: "shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]",
    },
    {
      code: "MISSING",
      aliasCodes: ["MISSING"],
      label: t("results.lost"),
      sub: t("results.lost_sub"),
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      border: "border-red-500/20",
      bg: "bg-red-500/5",
      iconBg: "bg-red-500/10",
      activeShadow: "shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]",
    },
    {
      code: "DAMAGED",
      label: t("results.damaged"),
      sub: t("results.damaged_sub"),
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/5",
      iconBg: "bg-amber-500/10",
      activeShadow: "shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]",
    },
    {
      code: "UNEXPECTED",
      aliasCodes: ["MISMATCHED", "EXTRA", "COMPLETED", "PENDING", "UNEXPECTED"],
      label: t("results.unknown"),
      sub: t("results.unknown_sub"),
      icon: HelpCircle,
      color: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500/20",
      bg: "bg-blue-500/5",
      iconBg: "bg-blue-500/10",
      activeShadow: "shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]",
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
      aliasKeys: ["RECOVER", "RECOVER_ASSET", "RECALL_ASSET"],
      label: t("actions.recall"),
      sub: t("actions.recall_sub"),
      icon: RotateCcw,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[95vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-xl bg-background/80 backdrop-blur-xl">
        <DialogHeader className="p-4 px-6 shrink-0 border-b border-border/40 bg-muted/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Info size={20} />
            </div>
            <div className="flex flex-col">
              <DialogTitle className="text-lg font-bold tracking-tight">
                {t("detail_modal.title")}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-muted-foreground/70">
                {item.asset.asset_code} — {item.asset.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 px-6 pb-6 space-y-6 overflow-y-auto custom-scrollbar">
          {!isAssignee ? (
            <div className="bg-blue-500/5 border border-blue-500/10 text-blue-700 dark:text-blue-300 py-2.5 px-3.5 rounded-xl flex items-start gap-3 transition-all hover:bg-blue-500/10">
              <div className="p-1.5 rounded-lg bg-blue-500/10 shrink-0">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold tracking-tight">
                  {t("detail_modal.view_mode")}
                </span>
                <p className="text-[10px] leading-relaxed opacity-70 font-medium">
                  {t("detail_modal.not_assignee_notice")}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/5 border border-amber-500/15 text-amber-700 dark:text-amber-300 py-2.5 px-3.5 rounded-xl flex items-center gap-3 transition-all hover:bg-amber-500/10">
              <div className="p-1.5 rounded-lg bg-amber-500/10 shrink-0 rotate-3">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="text-[11px] font-bold tracking-tight leading-normal">
                {t("detail_modal.view_mode_notice")}
              </div>
            </div>
          )}
          {isLocked && (
            <div className="bg-emerald-500/5 border border-emerald-500/15 text-emerald-700 dark:text-emerald-300 py-2.5 px-3.5 rounded-xl flex items-center gap-3 transition-all hover:bg-emerald-500/10">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-xs font-bold tracking-tight">
                  {t("detail_modal.view_mode")}
                </span>
                <p className="text-[10px] leading-relaxed opacity-70 font-medium">
                  {t("detail_modal.locked_mode_notice")}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-1 rounded-xl border border-border/40 bg-linear-to-b from-muted/20 to-transparent">
                <div className="p-4 rounded-xl bg-background/50 backdrop-blur-sm shadow-sm space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                    <Package size={14} className="text-primary" />
                    {t("detail_modal.current_info")}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-muted/10 text-primary/70 shrink-0 border border-border/20 shadow-inner">
                        <Info size={16} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                          {t("detail_modal.asset_name")}
                        </span>
                        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                          {item.asset.name}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                          {t("detail_modal.asset_code")}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="font-mono text-[11px] h-6 px-2.5 bg-muted/50 border-border/40"
                          >
                            {item.asset.asset_code}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                          {t("detail_modal.quantity")}
                        </span>
                        <span className="text-sm font-black text-primary drop-shadow-sm">
                          {item.transfer_quantity ?? item.unit_quantity ?? 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 p-4 rounded-xl bg-muted/10 border border-border/10 shadow-inner">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm border border-border/30">
                          <User size={15} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground/50 uppercase">
                            {t("detail_modal.holder")}
                          </span>
                          <span className="text-xs font-bold">
                            {item.asset.holder_name || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase">
                          {t("detail_modal.system_status")}
                        </span>
                        <Badge
                          variant="secondary"
                          className="w-fit px-3 py-1 text-[10px] font-black rounded-lg bg-primary/10 text-primary border-primary/20 shadow-sm uppercase tracking-tighter"
                        >
                          {item.asset.status_obj?.name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Field className="space-y-4">
                <FieldLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 px-1">
                  <div className="h-1 w-4 bg-primary rounded-full" />
                  {t("detail_modal.condition_notes")}
                </FieldLabel>
                {canEdit ? (
                  <Textarea
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                    placeholder={t("detail_modal.no_notes")}
                    className="min-h-[140px] rounded-xl bg-muted/10 border-border/30 focus:border-primary/40 focus:ring-primary/10 transition-all resize-none text-sm p-5 leading-relaxed font-medium placeholder:font-normal"
                  />
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-border/60 bg-muted/5 min-h-[120px] text-sm text-foreground/80 leading-relaxed italic whitespace-pre-wrap font-medium">
                    {item.notes || t("detail_modal.no_notes")}
                  </div>
                )}
              </Field>
            </div>

            <div className="space-y-6 flex flex-col h-full">
              <Field className="space-y-4">
                <FieldLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 px-1">
                  <div className="h-1 w-4 bg-primary rounded-full" />
                  {t("detail_modal.audit_result")}
                </FieldLabel>
                <div className="grid grid-cols-2 gap-4">
                  {auditResults.map((res) => {
                    const isSelected =
                      localStatus === res.code ||
                      (localStatus && res.aliasCodes?.includes(localStatus));

                    return (
                      <div
                        key={res.code}
                        className={cn(
                          "relative group p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300",
                          canEdit && "cursor-pointer active:scale-95",
                          isSelected
                            ? cn(
                                res.border,
                                res.bg,
                                res.activeShadow,
                                "ring-1",
                                res.border.replace("20", "40"),
                              )
                            : "border-border/30 bg-muted/5 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 hover:bg-muted/10",
                        )}
                        onClick={() => canEdit && setLocalStatus(res.code)}
                      >
                        {isSelected && (
                          <div
                            className="absolute top-2 right-2 h-2 w-2 rounded-full bg-current"
                            style={{ backgroundColor: "currentColor" }}
                          />
                        )}
                        <div
                          className={cn(
                            "p-3 rounded-xl transition-all duration-300 shadow-sm",
                            isSelected ? res.iconBg : "bg-muted/40",
                          )}
                        >
                          <res.icon
                            size={20}
                            className={cn(
                              "transition-all duration-300",
                              isSelected
                                ? res.color
                                : "text-muted-foreground/40",
                            )}
                          />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={cn(
                              "text-xs font-bold tracking-tight transition-all duration-300",
                              isSelected
                                ? res.color
                                : "text-muted-foreground/70",
                            )}
                          >
                            {res.label}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] font-bold text-center px-1 transition-all duration-300",
                              isSelected
                                ? "text-foreground/60"
                                : "text-muted-foreground/30",
                            )}
                          >
                            {res.sub}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Field>

              <Field className="space-y-4">
                <FieldLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 px-1">
                  <div className="h-1 w-4 bg-primary rounded-full" />
                  {t("detail_modal.proposed_action")}
                </FieldLabel>
                <div className="grid grid-cols-3 gap-3">
                  {proposedActions.map((action) => {
                    const isSelected =
                      (localAction === null && action.key === null) ||
                      localAction === action.key ||
                      (localAction && action.aliasKeys?.includes(localAction));
                    return (
                      <div
                        key={action.label}
                        className={cn(
                          "p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300",
                          canEdit && "cursor-pointer active:scale-95",
                          isSelected
                            ? "border-primary/40 bg-primary/5 shadow-[0_0_15px_-5px_rgba(var(--primary),0.2)] ring-1 ring-primary/20"
                            : "border-border/30 bg-muted/5 opacity-50 grayscale hover:opacity-100 hover:grayscale-0",
                        )}
                        onClick={() => {
                          if (canEdit) {
                            setLocalAction(action.key);
                            setTargetUnitId(null);
                            setTargetStaffId(null);
                            setTargetLocationId(null);
                          }
                        }}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-xl transition-all duration-300 shadow-sm",
                            isSelected ? "bg-primary/20" : "bg-muted/40",
                          )}
                        >
                          <action.icon
                            size={16}
                            className={cn(
                              "transition-all duration-300",
                              isSelected
                                ? "text-primary"
                                : "text-muted-foreground/40",
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-[11px] font-bold text-center leading-tight transition-all duration-300",
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground/70",
                          )}
                        >
                          {action.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Field>

              <div className="flex-1 min-h-[100px] flex flex-col justify-end">
                {localAction && localAction !== "NONE" && (
                  <Field className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl shadow-primary/5 border-dashed">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-1 bg-primary rounded-full animate-pulse" />
                      <h4 className="text-[10px] font-black text-primary/80 uppercase tracking-widest">
                        {localAction === "RECALL" ||
                        proposedActions
                          .find((a) => a.key === "RECALL")
                          ?.aliasKeys?.includes(localAction)
                          ? t("detail_modal.recall_info")
                          : t("detail_modal.transfer_info")}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      {(localAction === "RECALL" ||
                        proposedActions
                          .find((a) => a.key === "RECALL")
                          ?.aliasKeys?.includes(localAction)) && (
                        <div className="flex flex-col gap-2.5">
                          <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter flex items-center gap-1.5">
                            <MapPin size={12} className="text-primary/50" />
                            {t("detail_modal.receiving_warehouse")}
                          </span>
                          {canEdit ? (
                            <Select
                              value={targetLocationId?.toString() || ""}
                              onValueChange={(v) =>
                                setTargetLocationId(Number(v))
                              }
                            >
                              <SelectTrigger className="w-full h-11 bg-background border-border/40 focus:ring-primary/20 transition-all rounded-xl shadow-sm font-semibold">
                                <SelectValue
                                  placeholder={t(
                                    "detail_modal.select_location",
                                  )}
                                />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl shadow-2xl border-border/40">
                                {locations?.map((loc) => (
                                  <SelectItem
                                    key={loc.id}
                                    value={loc.id.toString()}
                                    className="rounded-xl my-1"
                                  >
                                    {loc.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="p-4 rounded-xl border border-border/40 bg-background/50 flex items-center gap-3 text-sm font-bold shadow-sm">
                              <MapPin size={16} className="text-primary" />
                              {item.target_holder_name ||
                                (item.target_location_id
                                  ? locations?.find(
                                      (l) => l.id === item.target_location_id,
                                    )?.name || `#${item.target_location_id}`
                                  : "N/A")}
                            </div>
                          )}
                        </div>
                      )}

                      {(localAction === "TRANSFER" ||
                        proposedActions
                          .find((a) => a.key === "TRANSFER")
                          ?.aliasKeys?.includes(localAction)) && (
                        <div className="space-y-4">
                          <div className="flex flex-col gap-2.5">
                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter flex items-center gap-1.5">
                              <Building2
                                size={12}
                                className="text-primary/50"
                              />
                              {t("detail_modal.recipient_unit")}
                            </span>
                            {canEdit ? (
                              <Select
                                value={targetUnitId?.toString() || ""}
                                onValueChange={(v) => {
                                  setTargetUnitId(Number(v));
                                  setTargetStaffId(null);
                                }}
                              >
                                <SelectTrigger className="w-full h-11 bg-background border-border/40 focus:ring-primary/20 transition-all rounded-xl shadow-sm font-semibold">
                                  <SelectValue
                                    placeholder={t("detail_modal.select_unit")}
                                  />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-2xl border-border/40">
                                  {orgUnits?.map((unit) => (
                                    <SelectItem
                                      key={unit.id}
                                      value={unit.id.toString()}
                                      className="rounded-xl my-1"
                                    >
                                      {unit.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="p-4 rounded-xl border border-border/40 bg-background/50 flex items-center gap-3 text-sm font-bold shadow-sm truncate">
                                <Building2 size={16} className="text-primary" />
                                {item.target_holder_name ||
                                  (item.target_unit_id
                                    ? orgUnits?.find(
                                        (u) => u.id === item.target_unit_id,
                                      )?.name || `#${item.target_unit_id}`
                                    : "N/A")}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2.5">
                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter flex items-center gap-1.5">
                              <User size={12} className="text-primary/50" />
                              {t("detail_modal.recipient_staff")}
                            </span>
                            {canEdit ? (
                              <Select
                                value={targetStaffId?.toString() || ""}
                                onValueChange={(v) =>
                                  setTargetStaffId(Number(v))
                                }
                                disabled={!targetUnitId}
                              >
                                <SelectTrigger className="w-full h-11 bg-background border-border/40 focus:ring-primary/20 transition-all rounded-xl shadow-sm font-semibold disabled:opacity-40">
                                  <SelectValue
                                    placeholder={
                                      !targetUnitId
                                        ? t("detail_modal.select_unit_first")
                                        : t("detail_modal.select_staff")
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-2xl border-border/40">
                                  {staffs?.map((staff) => (
                                    <SelectItem
                                      key={staff.id}
                                      value={staff.id.toString()}
                                      className="rounded-xl my-1"
                                    >
                                      {staff.full_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="p-4 rounded-xl border border-border/40 bg-background/50 flex items-center gap-3 text-sm font-bold shadow-sm truncate">
                                <User size={16} className="text-primary" />
                                {item.target_staff?.full_name ||
                                  item.target_holder_name ||
                                  "N/A"}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {(item.transfer_quantity !== null ||
                        item.unit_quantity !== null) && (
                        <div className="flex items-center justify-between gap-2 mt-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                            {t("detail_modal.quantity_to_handle")}
                          </span>
                          <span className="text-lg font-black tracking-tighter">
                            {item.transfer_quantity ?? item.unit_quantity}
                          </span>
                        </div>
                      )}
                    </div>
                  </Field>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 px-6 shrink-0 border-t border-border/40 bg-muted/5 flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="hover:bg-muted font-bold text-muted-foreground text-[10px] uppercase tracking-widest h-11 px-6 rounded-xl transition-all"
          >
            {t("detail_modal.close")}
          </Button>

          {canEdit && (
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] px-10 shadow-xl shadow-primary/20 h-11 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving ? "..." : t("detail_modal.save")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
