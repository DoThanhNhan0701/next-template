"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import {
  AlertTriangle,
  ArrowRightLeft,
  Building2,
  CheckCircle,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  LucideIcon,
  MapPin,
  Package,
  RotateCcw,
  ShieldAlert,
  User,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
      border: "border-emerald-500/50",
      bg: "bg-emerald-500/20",
      iconBg: "bg-emerald-500/30",
      activeShadow: "shadow-[0_0_15px_-5px_rgba(16,185,129,0.5)]",
    },
    {
      code: "MISSING",
      aliasCodes: ["MISSING"],
      label: t("results.lost"),
      sub: t("results.lost_sub"),
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      border: "border-red-500/50",
      bg: "bg-red-500/20",
      iconBg: "bg-red-500/30",
      activeShadow: "shadow-[0_0_15px_-5px_rgba(239,68,68,0.5)]",
    },
    {
      code: "DAMAGED",
      label: t("results.damaged"),
      sub: t("results.damaged_sub"),
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/50",
      bg: "bg-amber-500/20",
      iconBg: "bg-amber-500/30",
      activeShadow: "shadow-[0_0_15px_-5px_rgba(245,158,11,0.5)]",
    },
    {
      code: "UNEXPECTED",
      aliasCodes: [],
      label: t("results.unknown"),
      sub: t("results.unknown_sub"),
      icon: HelpCircle,
      color: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500/50",
      bg: "bg-blue-500/20",
      iconBg: "bg-blue-500/30",
      activeShadow: "shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)]",
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
      <DialogContent className="sm:max-w-[1000px] max-h-[92vh] flex flex-col p-0 overflow-hidden border-border shadow-2xl rounded-xl bg-background backdrop-blur-none ring-1 ring-white/10">
        <DialogHeader className="p-4 px-6 shrink-0 bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 text-primary shadow-sm ring-1 ring-primary/30">
                <ClipboardList size={20} strokeWidth={3} />
              </div>
              <div className="flex flex-col gap-0">
                <DialogTitle className="text-xl font-black tracking-tight text-foreground">
                  {t("detail_modal.title")}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] px-2 py-0.5 h-5 bg-muted/80 border-border font-black text-foreground"
                  >
                    {item.asset.asset_code}
                  </Badge>
                  <span className="text-xs font-black text-foreground/90 truncate max-w-[250px]">
                    {item.asset.name}
                  </span>
                </div>
              </div>
            </div>
            {!isLocked && (
              <Badge
                variant="outline"
                className="px-2.5 py-1 text-[10px] font-black rounded-md bg-amber-500 text-white border-none shadow-lg tracking-wider"
              >
                {t("detail_modal.edit_mode")}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 px-6 py-5 overflow-y-auto custom-scrollbar bg-linear-to-b from-transparent via-muted/5 to-muted/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Asset Information */}
            <div className="lg:col-span-4 space-y-5">
              <Card className="border-none bg-card/40 shadow-none rounded-xl overflow-hidden group">
                <CardHeader className="py-2 px-1 border-none bg-transparent">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] text-primary flex items-center gap-2">
                    <Package size={14} strokeWidth={3} />
                    {t("detail_modal.current_info")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-3 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <StatItem
                      label={t("detail_modal.quantity")}
                      value={item.transfer_quantity ?? item.unit_quantity ?? 0}
                      color="text-primary"
                    />
                    <StatItem
                      label={t("detail_modal.system_status")}
                      value={item.asset.status_obj?.name}
                      color="text-emerald-600 dark:text-emerald-400"
                      isBadge
                    />
                  </div>

                  <div className="space-y-4">
                    <InfoItem
                      icon={User}
                      color="bg-primary/10 text-primary"
                      label={t("detail_modal.holder")}
                      value={item.asset.holder_name || "N/A"}
                    />
                  </div>

                  <Field className="space-y-2.5 pt-1">
                    <FieldLabel className="text-[10px] font-black tracking-widest text-foreground px-1">
                      {t("detail_modal.condition_notes")}
                    </FieldLabel>
                    {canEdit ? (
                      <Textarea
                        value={localNotes}
                        onChange={(e) => setLocalNotes(e.target.value)}
                        placeholder={t("detail_modal.no_notes")}
                        className="min-h-[120px] rounded-lg bg-muted/20 border-none focus:ring-primary/20 transition-all resize-none text-sm p-4 leading-relaxed font-bold text-foreground placeholder:font-medium shadow-none"
                      />
                    ) : (
                      <div className="p-4 rounded-lg bg-muted/10 min-h-[100px] text-sm text-foreground leading-relaxed italic whitespace-pre-wrap font-bold">
                        {item.notes || t("detail_modal.no_notes")}
                      </div>
                    )}
                  </Field>
                </CardContent>
              </Card>

              {!isAssignee && (
                <div className="bg-blue-600/10 border-none text-blue-700 dark:text-blue-300 p-4 rounded-xl flex items-start gap-4 transition-all hover:bg-blue-600/20 group">
                  <div className="p-2 rounded-lg bg-blue-600/20 shrink-0">
                    <ShieldAlert size={20} strokeWidth={3} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-black tracking-wider">
                      {t("detail_modal.view_mode")}
                    </span>
                    <p className="text-[11px] leading-relaxed font-bold italic">
                      {t("detail_modal.not_assignee_notice")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Audit Actions */}
            <div className="lg:col-span-8 space-y-6">
              {/* Audit Result Selection */}
              <Field className="space-y-4">
                <FieldLabel className="text-[10px] font-black tracking-[0.2em] text-foreground flex items-center gap-2 px-1">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  {t("detail_modal.audit_result")}
                </FieldLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {auditResults.map((res) => {
                    const isSelected =
                      localStatus === res.code ||
                      (localStatus && res.aliasCodes?.includes(localStatus));

                    return (
                      <button
                        key={res.code}
                        disabled={!canEdit}
                        className={cn(
                          "relative group p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 overflow-hidden shadow-sm",
                          canEdit &&
                            "cursor-pointer active:scale-[0.97]",
                          isSelected
                            ? cn(
                                "border-2",
                                res.border,
                                res.bg,
                                res.activeShadow,
                                "border-opacity-100 ring-2",
                                res.border.replace("border-", "ring-"),
                              )
                            : "border-none bg-muted/40 opacity-90 hover:opacity-100",
                        )}
                        onClick={() => canEdit && setLocalStatus(res.code)}
                      >
                        <div
                          className={cn(
                            "p-2.5 rounded-lg transition-all duration-300 shadow-md",
                            isSelected ? res.iconBg : "bg-muted/40",
                          )}
                        >
                          <res.icon
                            size={22}
                            strokeWidth={3}
                            className={cn(
                              "transition-all duration-300",
                              isSelected ? res.color : "text-foreground/40",
                            )}
                          />
                        </div>
                        <div className="flex flex-col items-center">
                          <span
                            className={cn(
                              "text-[11px] font-black tracking-tight transition-all duration-300",
                              isSelected ? res.color : "text-foreground/90",
                            )}
                          >
                            {res.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Proposed Action Selection */}
              <Field className="space-y-4">
                <FieldLabel className="text-[10px] font-black tracking-[0.2em] text-foreground flex items-center gap-2 px-1">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  {t("detail_modal.proposed_action")}
                </FieldLabel>
                <div className="grid grid-cols-3 gap-3">
                  {proposedActions.map((action) => {
                    const isSelected =
                      (localAction === null && action.key === null) ||
                      localAction === action.key ||
                      (localAction && action.aliasKeys?.includes(localAction));
                    return (
                      <button
                        key={action.label}
                        disabled={!canEdit}
                        className={cn(
                          "relative group p-3.5 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 overflow-hidden shadow-sm",
                          canEdit &&
                            "cursor-pointer active:scale-[0.97]",
                          isSelected
                            ? "border-2 border-primary bg-primary/20 shadow-xl shadow-primary/10 ring-2 ring-primary/40"
                            : "border-none bg-muted/40 opacity-90 hover:opacity-100",
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
                            "p-2.5 rounded-lg transition-all duration-300 shadow-md",
                            isSelected
                              ? "bg-primary/30 shadow-primary/20"
                              : "bg-muted/40",
                          )}
                        >
                          <action.icon
                            size={20}
                            strokeWidth={3}
                            className={cn(
                              "transition-all duration-300",
                              isSelected
                                ? "text-primary"
                                : "text-foreground/40",
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-[11px] font-black tracking-tight transition-all duration-300 leading-tight",
                            isSelected ? "text-primary" : "text-foreground/90",
                          )}
                        >
                          {action.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Dynamic Action Fields */}
              <div className="min-h-[120px]">
                {localAction && localAction !== "NONE" && (
                  <div className="p-5 rounded-xl bg-primary/5 flex flex-col gap-5 animate-in fade-in slide-in-from-top-3 duration-500 shadow-xl relative">
                    <div className="absolute -top-3 left-5 px-3 py-0.5 bg-primary rounded-full shadow-lg">
                      <span className="text-[10px] font-black text-white tracking-widest">
                        {localAction === "RECALL" ||
                        proposedActions
                          .find((a) => a.key === "RECALL")
                          ?.aliasKeys?.includes(localAction)
                          ? t("detail_modal.recall_info")
                          : t("detail_modal.transfer_info")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      {(localAction === "RECALL" ||
                        proposedActions
                          .find((a) => a.key === "RECALL")
                          ?.aliasKeys?.includes(localAction)) && (
                        <div className="flex flex-col gap-2.5">
                          <span className="text-[10px] font-black text-foreground tracking-widest flex items-center gap-2">
                            <MapPin
                              size={14}
                              strokeWidth={3}
                              className="text-primary"
                            />
                            {t("detail_modal.receiving_warehouse")}
                          </span>
                          {canEdit ? (
                            <Select
                              value={targetLocationId?.toString() || ""}
                              onValueChange={(v) =>
                                setTargetLocationId(Number(v))
                              }
                            >
                              <SelectTrigger className="w-full h-11 bg-background border-none focus:ring-primary/20 transition-all rounded-lg shadow-sm font-black text-sm">
                                <SelectValue
                                  placeholder={t(
                                    "detail_modal.select_location",
                                  )}
                                />
                              </SelectTrigger>
                              <SelectContent className="rounded-lg shadow-2xl border-none">
                                {locations?.map((loc) => (
                                  <SelectItem
                                    key={loc.id}
                                    value={loc.id.toString()}
                                    className="rounded-md my-1 text-sm font-black"
                                  >
                                    {loc.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="p-4 rounded-lg bg-background flex items-center gap-3 text-sm font-black">
                              <MapPin
                                size={18}
                                strokeWidth={3}
                                className="text-primary"
                              />
                              {item.target_holder_name ||
                                (item.target_location_id
                                  ? locations?.find(
                                      (l) => l.id === item.target_location_id,
                                    )?.name
                                  : "N/A")}
                            </div>
                          )}
                        </div>
                      )}

                      {(localAction === "TRANSFER" ||
                        proposedActions
                          .find((a) => a.key === "TRANSFER")
                          ?.aliasKeys?.includes(localAction)) && (
                        <div className="space-y-5">
                          <div className="flex flex-col gap-2.5">
                            <span className="text-[10px] font-black text-foreground tracking-widest flex items-center gap-2">
                              <Building2
                                size={14}
                                strokeWidth={3}
                                className="text-primary"
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
                                <SelectTrigger className="w-full h-11 bg-background border-none focus:ring-primary/20 transition-all rounded-lg shadow-sm font-black text-sm">
                                  <SelectValue
                                    placeholder={t("detail_modal.select_unit")}
                                  />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg shadow-2xl border-none">
                                  {orgUnits?.map((unit) => (
                                    <SelectItem
                                      key={unit.id}
                                      value={unit.id.toString()}
                                      className="rounded-md my-1 text-sm font-black"
                                    >
                                      {unit.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="p-4 rounded-lg bg-background flex items-center gap-3 text-sm font-black">
                                <Building2
                                  size={18}
                                  strokeWidth={3}
                                  className="text-primary"
                                />
                                {item.target_holder_name ||
                                  (item.target_unit_id
                                    ? orgUnits?.find(
                                        (u) => u.id === item.target_unit_id,
                                      )?.name
                                    : "N/A")}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2.5">
                            <span className="text-[10px] font-black text-foreground tracking-widest flex items-center gap-2">
                              <User
                                size={14}
                                strokeWidth={3}
                                className="text-primary"
                              />
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
                                <SelectTrigger className="w-full h-11 bg-background border-none focus:ring-primary/20 transition-all rounded-lg shadow-sm font-black disabled:opacity-50 text-sm">
                                  <SelectValue
                                    placeholder={
                                      !targetUnitId
                                        ? t("detail_modal.select_unit_first")
                                        : t("detail_modal.select_staff")
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg shadow-2xl border-none">
                                  {staffs?.map((staff) => (
                                    <SelectItem
                                      key={staff.id}
                                      value={staff.id.toString()}
                                      className="rounded-md my-1 text-sm font-black"
                                    >
                                      {staff.full_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="p-4 rounded-lg bg-background flex items-center gap-3 text-sm font-black">
                                <User
                                  size={18}
                                  strokeWidth={3}
                                  className="text-primary"
                                />
                                {item.target_staff?.full_name ||
                                  item.target_holder_name ||
                                  "N/A"}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 px-6 shrink-0 bg-muted/20 flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="hover:bg-muted font-black text-[10px] tracking-[0.15em] h-11 px-8 rounded-lg transition-all border-none"
          >
            {t("detail_modal.close")}
          </Button>

          {canEdit && (
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] tracking-[0.15em] px-12 shadow-2xl shadow-primary/30 h-11 rounded-lg transition-all active:scale-95 disabled:opacity-50 group gap-3 border-none"
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving ? (
                <RotateCcw className="animate-spin w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4 transition-transform group-hover:scale-125" />
              )}
              {t("detail_modal.save")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const InfoItem = ({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: LucideIcon | React.ElementType;
  color: string;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 transition-all hover:bg-muted/30 group">
    <div
      className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm ring-1 ring-white/10",
        color.replace("text-", "bg-").replace(" primary", "primary/20"),
        color,
      )}
    >
      <Icon className="w-5 h-5" strokeWidth={3} />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] font-black text-foreground/70 tracking-widest leading-none mb-1">
        {label}
      </span>
      <div className="truncate text-sm font-black text-foreground">{value}</div>
    </div>
  </div>
);

const StatItem = ({
  label,
  value,
  color,
  isBadge = false,
}: {
  label: string;
  value: React.ReactNode;
  color: string;
  isBadge?: boolean;
}) => (
  <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-muted/20">
    <span className="text-[10px] font-black text-foreground/60 tracking-widest leading-none">
      {label}
    </span>
    {isBadge ? (
      <Badge
        variant="outline"
        className={cn(
          "w-fit px-2 py-0.5 h-5 text-[9px] font-black rounded border-none shadow-sm bg-background",
          color,
        )}
      >
        <span className={color}>{value}</span>
      </Badge>
    ) : (
      <span
        className={cn(
          "text-xl font-black tracking-tighter leading-none",
          color,
        )}
      >
        {value}
      </span>
    )}
  </div>
);
