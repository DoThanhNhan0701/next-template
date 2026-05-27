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
  creatorUsername?: string;
  itemAssigneeUsername?: string;
  onRefresh?: () => void;
  isLocked?: boolean;
}

export default function ViewAuditItemModal({
  item,
  isOpen,
  onClose,
  assigneeUsername,
  creatorUsername,
  itemAssigneeUsername,
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

  const isSessionAssignee = user?.username === assigneeUsername;
  const isCreator = user?.username === creatorUsername;
  const isItemAssignee = !!itemAssigneeUsername && user?.username === itemAssigneeUsername;

  // Creator được sửa tất cả; item assignee được sửa item của mình
  const canEdit = (isCreator || isSessionAssignee || isItemAssignee) && !isLocked;

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
      <DialogContent className="sm:max-w-[1000px] max-h-[92vh] flex flex-col p-0 overflow-hidden border shadow-lg rounded-2xl bg-background">
        <DialogHeader className="p-5 px-6 shrink-0 border-b bg-muted/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <ClipboardList size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col gap-1">
                <DialogTitle className="text-lg font-semibold text-foreground">
                  {t("detail_modal.title")}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] px-2 py-0.5 h-5 bg-muted border font-medium text-foreground/80"
                  >
                    {item.asset.asset_code}
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground truncate max-w-[250px]">
                    {item.asset.name}
                  </span>
                </div>
              </div>
            </div>
            {!isLocked && (
              <Badge
                variant="default"
                className="px-3 py-1 text-[10px] font-medium rounded-md bg-amber-500 hover:bg-amber-600 text-white border-none"
              >
                {t("detail_modal.edit_mode")}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 px-6 py-5 overflow-y-auto custom-scrollbar bg-muted/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Asset Information */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="border bg-card shadow-sm rounded-lg overflow-hidden">
                <CardHeader className="py-3 px-4 border-b bg-muted/50">
                  <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Package size={16} strokeWidth={2} />
                    {t("detail_modal.current_info")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
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

                  <Field className="space-y-2">
                    <FieldLabel className="text-xs font-medium text-foreground">
                      {t("detail_modal.condition_notes")}
                    </FieldLabel>
                    {canEdit ? (
                      <Textarea
                        value={localNotes}
                        onChange={(e) => setLocalNotes(e.target.value)}
                        placeholder={t("detail_modal.no_notes")}
                        className="min-h-[120px] rounded-md bg-background border focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm p-3 leading-relaxed font-normal text-foreground placeholder:text-muted-foreground"
                      />
                    ) : (
                      <div className="p-3 rounded-md bg-muted/50 border min-h-[100px] text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {item.notes || t("detail_modal.no_notes")}
                      </div>
                    )}
                  </Field>
                </CardContent>
              </Card>

              {!isCreator && !isSessionAssignee && !isItemAssignee && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 p-4 rounded-lg flex items-start gap-3">
                  <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/50 shrink-0">
                    <ShieldAlert size={18} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold">
                      {t("detail_modal.view_mode")}
                    </span>
                    <p className="text-xs leading-relaxed font-normal">
                      {t("detail_modal.not_assignee_notice")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Audit Actions */}
            <div className="lg:col-span-8 space-y-5">
              {/* Audit Result Selection */}
              <Field className="space-y-3">
                <FieldLabel className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
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
                          "relative group p-4 rounded-lg flex flex-col items-center justify-center gap-2.5 transition-all duration-200 border",
                          canEdit &&
                          "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                          isSelected
                            ? cn("border-2", res.border, res.bg, "shadow-md")
                            : "border-border bg-card hover:bg-muted/50",
                        )}
                        onClick={() => canEdit && setLocalStatus(res.code)}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-md transition-all duration-200",
                            isSelected ? res.iconBg : "bg-muted/50",
                          )}
                        >
                          <res.icon
                            size={20}
                            strokeWidth={2}
                            className={cn(
                              "transition-all duration-200",
                              isSelected ? res.color : "text-muted-foreground",
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-xs font-medium text-center transition-all duration-200",
                            isSelected ? res.color : "text-foreground",
                          )}
                        >
                          {res.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Proposed Action Selection */}
              <Field className="space-y-3">
                <FieldLabel className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
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
                          "relative group p-4 rounded-lg flex flex-col items-center justify-center gap-2.5 transition-all duration-200 border",
                          canEdit &&
                          "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                          isSelected
                            ? "border-2 border-primary bg-primary/10 shadow-md"
                            : "border-border bg-card hover:bg-muted/50",
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
                            "p-2 rounded-md transition-all duration-200",
                            isSelected ? "bg-primary/20" : "bg-muted/50",
                          )}
                        >
                          <action.icon
                            size={20}
                            strokeWidth={2}
                            className={cn(
                              "transition-all duration-200",
                              isSelected
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-xs font-medium text-center transition-all duration-200",
                            isSelected ? "text-primary" : "text-foreground",
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
                  <div className="p-5 rounded-lg bg-muted/30 border flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300 relative">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-xs font-semibold text-foreground">
                        {localAction === "RECALL" ||
                          proposedActions
                            .find((a) => a.key === "RECALL")
                            ?.aliasKeys?.includes(localAction)
                          ? t("detail_modal.recall_info")
                          : t("detail_modal.transfer_info")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {(localAction === "RECALL" ||
                        proposedActions
                          .find((a) => a.key === "RECALL")
                          ?.aliasKeys?.includes(localAction)) && (
                          <div className="flex flex-col gap-2">
                            <span className="text-xs font-medium text-foreground flex items-center gap-2">
                              <MapPin
                                size={14}
                                strokeWidth={2}
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
                                <SelectTrigger className="w-full h-10 bg-background border focus:ring-2 focus:ring-primary/20 transition-all rounded-md font-normal text-sm">
                                  <SelectValue
                                    placeholder={t(
                                      "detail_modal.select_location",
                                    )}
                                  />
                                </SelectTrigger>
                                <SelectContent className="rounded-md shadow-lg border">
                                  {locations?.map((loc) => (
                                    <SelectItem
                                      key={loc.id}
                                      value={loc.id.toString()}
                                      className="rounded-sm my-0.5 text-sm font-normal"
                                    >
                                      {loc.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="p-3 rounded-md bg-background border flex items-center gap-2 text-sm font-normal">
                                <MapPin
                                  size={16}
                                  strokeWidth={2}
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
                          <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                              <span className="text-xs font-medium text-foreground flex items-center gap-2">
                                <Building2
                                  size={14}
                                  strokeWidth={2}
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
                                  <SelectTrigger className="w-full h-10 bg-background border focus:ring-2 focus:ring-primary/20 transition-all rounded-md font-normal text-sm">
                                    <SelectValue
                                      placeholder={t("detail_modal.select_unit")}
                                    />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-md shadow-lg border">
                                    {orgUnits?.map((unit) => (
                                      <SelectItem
                                        key={unit.id}
                                        value={unit.id.toString()}
                                        className="rounded-sm my-0.5 text-sm font-normal"
                                      >
                                        {unit.name} ({unit.code})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="p-3 rounded-md bg-background border flex items-center gap-2 text-sm font-normal">
                                  <Building2
                                    size={16}
                                    strokeWidth={2}
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

                            <div className="flex flex-col gap-2">
                              <span className="text-xs font-medium text-foreground flex items-center gap-2">
                                <User
                                  size={14}
                                  strokeWidth={2}
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
                                  <SelectTrigger className="w-full h-10 bg-background border focus:ring-2 focus:ring-primary/20 transition-all rounded-md font-normal disabled:opacity-50 text-sm">
                                    <SelectValue
                                      placeholder={
                                        !targetUnitId
                                          ? t("detail_modal.select_unit_first")
                                          : t("detail_modal.select_staff")
                                      }
                                    />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-md shadow-lg border">
                                    {staffs?.map((staff) => (
                                      <SelectItem
                                        key={staff.id}
                                        value={staff.id.toString()}
                                        className="rounded-sm my-0.5 text-sm font-normal"
                                      >
                                        {staff.full_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="p-3 rounded-md bg-background border flex items-center gap-2 text-sm font-normal">
                                  <User
                                    size={16}
                                    strokeWidth={2}
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

        <DialogFooter className="p-4 px-6 shrink-0 border-t bg-muted/30 flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="hover:bg-muted font-medium text-sm h-10 px-6 rounded-md transition-all"
          >
            {t("detail_modal.close")}
          </Button>

          {canEdit && (
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm px-8 shadow-md h-10 rounded-md transition-all active:scale-95 disabled:opacity-50 gap-2"
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving ? (
                <RotateCcw className="animate-spin w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
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
  <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30 border transition-all hover:bg-muted/50">
    <div
      className={cn(
        "w-9 h-9 rounded-md flex items-center justify-center shrink-0",
        color.replace("text-", "bg-").replace(" primary", "primary/10"),
        color,
      )}
    >
      <Icon className="w-4 h-4" strokeWidth={2} />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide leading-none mb-1">
        {label}
      </span>
      <div className="truncate text-sm font-medium text-foreground">
        {value}
      </div>
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
  <div className="flex flex-col gap-1.5 p-3 rounded-md bg-muted/30 border">
    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide leading-none">
      {label}
    </span>
    {isBadge ? (
      <Badge
        variant="outline"
        className={cn(
          "w-fit px-2 py-0.5 h-5 text-[10px] font-medium rounded border bg-background",
          color,
        )}
      >
        <span className={color}>{value}</span>
      </Badge>
    ) : (
      <span
        className={cn(
          "text-xl font-semibold tracking-tight leading-none",
          color,
        )}
      >
        {value}
      </span>
    )}
  </div>
);
