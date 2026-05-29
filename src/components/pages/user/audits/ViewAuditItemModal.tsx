"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import {
  AlertTriangle,
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Package,
  ShieldAlert,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { SelectField } from "@/components/common/SelectField";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
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
  auditType?: string;
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
  auditType,
  isLocked,
}: Props) {
  const t = useTranslations("page_audits");
  const { user } = usePermissions();

  const [localStatus, setLocalStatus] = useState<string | null>(() => {
    const code = item?.status_obj?.code?.toUpperCase();
    if (!code || code === "PENDING") {
      return "MATCHED";
    }
    return code;
  });
  const [localAction, setLocalAction] = useState<string | null>(() => {
    const action = item?.proposed_action?.toUpperCase() || null;
    if (action === "NONE") return null;
    return action;
  });
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
  const isItemAssignee =
    !!itemAssigneeUsername && user?.username === itemAssigneeUsername;

  // Creator được sửa tất cả; item assignee được sửa item của mình
  const canEdit =
    (isCreator || isSessionAssignee || isItemAssignee) && !isLocked;

  if (!item) return null;

  const auditResults = [
    {
      code: "MATCHED",
      label: t("results.matched"),
      sub: t("results.matched_sub"),
      icon: CheckCircle2,
      activeColor:
        "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      code: "MISSING",
      aliasCodes: ["MISSING"],
      label: t("results.lost"),
      sub: t("results.lost_sub"),
      icon: XCircle,
      activeColor:
        "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400",
    },
    {
      code: "DAMAGED",
      label: t("results.damaged"),
      sub: t("results.damaged_sub"),
      icon: AlertTriangle,
      activeColor:
        "border-amber-500 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400",
    },
    {
      code: "UNEXPECTED",
      aliasCodes: [],
      label: t("results.unknown"),
      sub: t("results.unknown_sub"),
      icon: HelpCircle,
      activeColor:
        "border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
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
    },
  ];

  const actionsToRender =
    auditType === "location"
      ? proposedActions.filter((action) => action.key !== "RECALL")
      : proposedActions;

  const isRecallAction =
    localAction === "RECALL" ||
    proposedActions
      .find((a) => a.key === "RECALL")
      ?.aliasKeys?.includes(localAction || "");

  const isTransferAction =
    localAction === "TRANSFER" ||
    proposedActions
      .find((a) => a.key === "TRANSFER")
      ?.aliasKeys?.includes(localAction || "");

  const handleSave = async () => {
    if (!item) return;

    if (!localStatus) {
      toast.error(t("detail_modal.result_required"));
      return;
    }

    if (isRecallAction || (isTransferAction && auditType === "location")) {
      if (!targetLocationId) {
        toast.error(t("detail_modal.warehouse_required"));
        return;
      }
    } else if (isTransferAction && auditType !== "location") {
      if (!targetUnitId) {
        toast.error(t("detail_modal.unit_required"));
        return;
      }
      if (!targetStaffId) {
        toast.error(t("detail_modal.staff_required"));
        return;
      }
    }

    const proposedActionValue =
      localAction === "TRANSFER"
        ? "transfer"
        : localAction === "RECALL"
          ? "recover"
          : null;

    const targetUnitIdValue =
      proposedActionValue === "transfer" ? targetUnitId : null;
    const targetStaffIdValue =
      proposedActionValue === "transfer" ? targetStaffId : null;
    const targetLocationIdValue =
      proposedActionValue === "recover" ||
      (proposedActionValue === "transfer" && auditType === "location")
        ? targetLocationId
        : null;

    // 1. Build Query Parameters (so FastAPI status is present)
    const queryParams = new URLSearchParams();
    queryParams.append("status", localStatus);
    if (localNotes) {
      queryParams.append("notes", localNotes);
    }
    if (proposedActionValue) {
      queryParams.append("proposed_action", proposedActionValue);
    }
    if (targetUnitIdValue) {
      queryParams.append("target_unit_id", targetUnitIdValue.toString());
    }
    if (targetStaffIdValue) {
      queryParams.append("target_staff_id", targetStaffIdValue.toString());
    }
    if (targetLocationIdValue) {
      queryParams.append(
        "target_location_id",
        targetLocationIdValue.toString(),
      );
    }

    // 2. Build JSON Request Body
    const body = {
      status: localStatus,
      notes: localNotes || "",
      proposed_action: proposedActionValue,
      target_unit_id: targetUnitIdValue,
      target_staff_id: targetStaffIdValue,
      target_location_id: targetLocationIdValue,
    };

    const url = `${dynamicEndpoints.AUDIT_DETAIL_UPDATE(item.id)}?${queryParams.toString()}`;

    await mutate(
      {
        url,
        method: "patch",
        body,
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header matching AssetFormModal concept */}
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle className="text-base font-semibold">
            {t("detail_modal.title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {item.asset.asset_code} - {item.asset.name}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable form matching AssetFormModal concept */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-5">
            {/* Note banner */}
            <div>
              {canEdit ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-2 rounded-md text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-semibold">
                    {t("detail_modal.edit_allowed")}
                  </span>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-3 py-2 rounded-md text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-semibold">
                    {t("detail_modal.edit_not_allowed")}
                  </span>
                </div>
              )}
            </div>

            {/* Section: General asset details */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-primary border-b pb-1">
                {t("detail_modal.current_info")}
              </h3>

              <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <Field className="gap-1">
                  <FieldLabel>{t("detail_modal.quantity")}</FieldLabel>
                  <Input
                    disabled
                    value={item.transfer_quantity ?? item.unit_quantity ?? 0}
                    className="bg-muted/40"
                  />
                </Field>

                <Field className="gap-1">
                  <FieldLabel>{t("detail_modal.system_status")}</FieldLabel>
                  <Input
                    disabled
                    value={item.asset.status_obj?.name || ""}
                    className="bg-muted/40"
                  />
                </Field>

                <Field className="gap-1">
                  <FieldLabel>{t("detail_modal.holder")}</FieldLabel>
                  <Input
                    disabled
                    value={item.asset.holder_name || "N/A"}
                    className="bg-muted/40"
                  />
                </Field>

                <Field className="gap-1 col-span-full">
                  <FieldLabel>{t("detail_modal.condition_notes")}</FieldLabel>
                  {canEdit ? (
                    <Textarea
                      value={localNotes}
                      onChange={(e) => setLocalNotes(e.target.value)}
                      placeholder={t("detail_modal.no_notes")}
                      className="min-h-[90px]"
                    />
                  ) : (
                    <div className="p-3 rounded-md bg-muted/20 border text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap min-h-[90px]">
                      {item.notes || t("detail_modal.no_notes")}
                    </div>
                  )}
                </Field>
              </FieldGroup>
            </div>

            {/* Section: Audit Results */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-primary border-b pb-1">
                {t("detail_modal.audit_result")}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {auditResults.map((res) => {
                  const isSelected =
                    localStatus === res.code ||
                    (localStatus && res.aliasCodes?.includes(localStatus));

                  return (
                    <button
                      key={res.code}
                      type="button"
                      disabled={!canEdit}
                      className={cn(
                        "p-3.5 rounded-lg border text-center flex flex-col items-center justify-center gap-2 transition-all",
                        isSelected
                          ? cn("border-2 font-semibold", res.activeColor)
                          : "border-border bg-card hover:bg-muted/50 text-muted-foreground",
                        canEdit
                          ? "cursor-pointer"
                          : "opacity-60 cursor-default",
                      )}
                      onClick={() => canEdit && setLocalStatus(res.code)}
                    >
                      <res.icon size={18} />
                      <span className="text-xs">{res.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section: Proposed Action */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-primary border-b pb-1">
                {t("detail_modal.proposed_action")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {actionsToRender.map((action) => {
                  const isSelected =
                    (localAction === null && action.key === null) ||
                    localAction === action.key ||
                    (localAction && action.aliasKeys?.includes(localAction));
                  const ActionIcon = action.icon;

                  return (
                    <button
                      key={action.label}
                      type="button"
                      disabled={!canEdit || !localStatus}
                      className={cn(
                        "p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 text-primary font-semibold border-2"
                          : "border-border bg-card hover:bg-muted/50 text-muted-foreground",
                        canEdit && localStatus
                          ? "cursor-pointer"
                          : "opacity-60 cursor-default",
                      )}
                      onClick={() => {
                        if (canEdit && localStatus) {
                          setLocalAction(action.key);
                          setTargetUnitId(null);
                          setTargetStaffId(null);
                          setTargetLocationId(null);
                        }
                      }}
                    >
                      {ActionIcon && (
                        <ActionIcon size={18} className="mt-0.5 shrink-0" />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs leading-none">
                          {action.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-1 leading-normal truncate">
                          {action.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {canEdit && !localStatus && (
                <p className="text-[11px] text-amber-600 dark:text-amber-500 italic mt-0.5 animate-pulse">
                  * {t("detail_modal.select_result_first")}
                </p>
              )}
            </div>

            {/* Section: Dynamic Action Fields (Transfer/Recall) */}
            {localAction && localAction !== "NONE" && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">
                  {isRecallAction
                    ? t("detail_modal.recall_info")
                    : t("detail_modal.transfer_info")}
                </h3>

                <FieldGroup className="grid grid-cols-1 gap-3">
                  {/* Recall target location selection or Transfer target location for location audits */}
                  {(isRecallAction ||
                    (isTransferAction && auditType === "location")) && (
                    <Field className="gap-1">
                      <FieldLabel className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-primary" />
                        {t("detail_modal.receiving_warehouse")}
                      </FieldLabel>

                      {canEdit ? (
                        <SelectField
                          options={(locations ?? []).map((loc) => ({
                            label: loc.name,
                            value: loc.id,
                          }))}
                          value={targetLocationId}
                          onChange={(v) => setTargetLocationId(Number(v))}
                          placeholder={t("detail_modal.select_location")}
                          searchable
                        />
                      ) : (
                        <Input
                          disabled
                          value={
                            item.target_holder_name ||
                            (item.target_location_id
                              ? locations?.find(
                                  (l) => l.id === item.target_location_id,
                                )?.name
                              : "N/A") ||
                            "N/A"
                          }
                          className="bg-muted/40"
                        />
                      )}
                    </Field>
                  )}

                  {/* Transfer recipient unit & staff selection (only when auditType is not location) */}
                  {isTransferAction && auditType !== "location" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field className="gap-1">
                        <FieldLabel className="flex items-center gap-1.5">
                          <Building2 size={14} className="text-primary" />
                          {t("detail_modal.recipient_unit")}
                        </FieldLabel>

                        {canEdit ? (
                          <SelectField
                            options={(orgUnits ?? [])
                              .filter((unit) => unit.is_active)
                              .map((unit) => ({
                                label: `${unit.name} (${unit.code})`,
                                value: unit.id,
                              }))}
                            value={targetUnitId}
                            onChange={(v) => {
                              setTargetUnitId(Number(v));
                              setTargetStaffId(null);
                            }}
                            placeholder={t("detail_modal.select_unit")}
                            searchable
                          />
                        ) : (
                          <Input
                            disabled
                            value={
                              item.target_holder_name ||
                              (item.target_unit_id
                                ? orgUnits?.find(
                                    (u) => u.id === item.target_unit_id,
                                  )?.name
                                : "N/A") ||
                              "N/A"
                            }
                            className="bg-muted/40"
                          />
                        )}
                      </Field>

                      <Field className="gap-1">
                        <FieldLabel className="flex items-center gap-1.5">
                          <User size={14} className="text-primary" />
                          {t("detail_modal.recipient_staff")}
                        </FieldLabel>

                        {canEdit ? (
                          <SelectField
                            disabled={!targetUnitId}
                            options={staffs.map((staff) => ({
                              label: staff.full_name,
                              value: staff.id,
                            }))}
                            value={targetStaffId}
                            onChange={(v) => setTargetStaffId(Number(v))}
                            placeholder={
                              !targetUnitId
                                ? t("detail_modal.select_unit_first")
                                : t("detail_modal.select_staff")
                            }
                            searchable
                          />
                        ) : (
                          <Input
                            disabled
                            value={
                              item.target_staff?.full_name ||
                              item.target_holder_name ||
                              "N/A"
                            }
                            className="bg-muted/40"
                          />
                        )}
                      </Field>
                    </div>
                  )}
                </FieldGroup>
              </div>
            )}

            {/* Read-only notice */}
            {!isCreator && !isSessionAssignee && !isItemAssignee && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 p-3 rounded-lg flex items-start gap-2.5">
                <ShieldAlert
                  size={16}
                  className="mt-0.5 shrink-0 text-blue-500"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold">
                    {t("detail_modal.view_mode")}
                  </span>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {t("detail_modal.not_assignee_notice")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer matching AssetFormModal concept */}
        <DialogFooter className="p-3 shrink-0 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            {t("detail_modal.close")}
          </Button>

          {canEdit && (
            <Button type="button" disabled={isSaving} onClick={handleSave}>
              {isSaving ? "Saving..." : t("detail_modal.save")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
