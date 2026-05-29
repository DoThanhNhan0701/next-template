"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock,
  LucideIcon,
  MapPin,
  Package,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { SelectField } from "@/components/common/SelectField";
import { WorkflowHistory } from "@/components/common/WorkflowHistory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { usePermissions } from "@/hooks/usePermissions";
import { AppDispatch, RootState } from "@/redux";
import { updateCount } from "@/redux/slices/task";
import {
  IAuditDetailItem,
  IAuditDetailsResponse,
  IAuditSession,
} from "@/types/audit";
import { IUser } from "@/types/auth";
import { ApprovalHistory, ITask, TaskStatus } from "@/types/task";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { formatDate, formatDateTime } from "@/utils/date";

import { ApproveAuditModal } from "../my-tasks/components/ApproveAuditModal";
import { CompleteAuditModal } from "../my-tasks/components/CompleteAuditModal";
import { RejectAuditModal } from "../my-tasks/components/RejectAuditModal";
import ViewAuditItemModal from "./ViewAuditItemModal";

interface Props {
  id: string;
}

export default function AuditDetail({ id }: Props) {
  const t = useTranslations("page_audits");
  const tMyTasks = useTranslations("page_my_tasks");
  const dispatch = useDispatch<AppDispatch>();
  const { counts } = useSelector((state: RootState) => state.task);
  const { user } = usePermissions();
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<IAuditDetailItem | null>(
    null,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAuditCompleteModalOpen, setIsAuditCompleteModalOpen] =
    useState(false);
  const [isAuditRejectModalOpen, setIsAuditRejectModalOpen] = useState(false);
  const [isAuditApproveModalOpen, setIsAuditApproveModalOpen] = useState(false);

  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(
    new Set(),
  );
  const [assignUserId, setAssignUserId] = useState<number | null>(null);
  const {
    response: session,
    pending: sessionPending,
    reFetch: sessionReFetch,
  } = useGet<IAuditSession>({
    url: dynamicEndpoints.AUDIT_SESSION_DETAIL(Number(id)),
  });

  const {
    response: itemsDetail,
    pending: itemsPending,
    reFetch: itemsReFetch,
  } = useGet<IAuditDetailsResponse>({
    url: dynamicEndpoints.AUDIT_SESSION_DETAILS(Number(id)),
  });

  const {
    response: historyList,
    pending: historyPending,
    reFetch: historyReFetch,
  } = useGet<ApprovalHistory[]>({
    url: dynamicEndpoints.WORKFLOW_HISTORY("audit", Number(id)),
  });

  const combineHistory = useMemo(() => {
    const isSubmitted = !!session?.submitted_at;

    const auditTaskHistory: ApprovalHistory = {
      id: -999,
      status: isSubmitted ? "APPROVED" : "PENDING",
      step_name: "Thực hiện kiểm kê",
      requester_name: session?.assignee?.full_name || "Chưa phân công",
      comment: `Đợt kiểm kê khởi tạo bởi: ${session?.creator?.full_name || "Hệ thống"}`,
      action_date: isSubmitted
        ? (session?.submitted_at as string)
        : (session?.created_at as string),
    };
    return [auditTaskHistory, ...(historyList || [])];
  }, [historyList, session]);

  const { response: myTasksResponse, reFetch: myTasksReFetch } = useGet<{
    items: ITask[];
    total: number;
  }>({
    url: `${endpoints.WORKFLOW_TASKS}me`,
  });

  const { response: usersRes } = useGet<IUser[]>({
    url: endpoints.USERS,
  });
  const activeTask = (myTasksResponse?.items || []).find(
    (t) => t.document_id === Number(id) && t.document_type === "audit",
  );

  const totalItems = itemsDetail?.length || 0;
  const verifiedItems =
    itemsDetail?.filter((item) => item.verified_at).length || 0;
  const progressPercentage =
    totalItems > 0 ? (verifiedItems / totalItems) * 100 : 0;

  const { mutate, pending: mutatePending } = useMutation();

  const isCreator = user?.id === session?.assignee_id;
  const isApprove = activeTask?.user_id === user?.id;
  const canAssign =
    isCreator &&
    (session?.status_obj?.code === "PENDING" ||
      session?.status_obj?.code === "IN_PROGRESS");

  const allItemIds = (itemsDetail || []).map((item) => item.id);
  const isAllSelected =
    allItemIds.length > 0 && allItemIds.every((id) => selectedItemIds.has(id));
  const isIndeterminate = selectedItemIds.size > 0 && !isAllSelected;

  const toggleItem = (itemId: number) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(allItemIds));
    }
  };

  const handleAssign = async () => {
    if (!assignUserId || selectedItemIds.size === 0) return;
    await mutate(
      {
        url: dynamicEndpoints.AUDIT_DETAIL_ASSIGN(),
        method: "post",
        body: {
          detail_ids: Array.from(selectedItemIds),
          assignee_id: assignUserId,
        },
      },
      {
        onSuccess: (response) => {
          getApiSuccessMessage(response);
          itemsReFetch();
          setSelectedItemIds(new Set());
          setAssignUserId(null);
        },
        onError: (error) => getApiErrorMessage(error),
      },
    );
  };

  const onAuditCompleteConfirm = async () => {
    await mutate(
      {
        url: dynamicEndpoints.AUDIT_COMPLETE(Number(id)),
        method: "post",
      },
      {
        onSuccess: (response) => {
          getApiSuccessMessage(response);
          setIsAuditCompleteModalOpen(false);
          sessionReFetch();

          if (!activeTask?.id) {
            dispatch(
              updateCount({ status: "PENDING", count: counts.PENDING - 1 }),
            );
          }
        },
        onError: (error) => {
          getApiErrorMessage(error);
        },
      },
    );
  };

  const onAuditRejectConfirm = async (reason: string) => {
    await mutate(
      {
        url: activeTask?.id
          ? dynamicEndpoints.WORKFLOW_TASK_COMPLETE(Number(activeTask.id))
          : dynamicEndpoints.AUDIT_REJECT(Number(id), reason),
        method: "post",
        body: activeTask?.id ? { comment: reason, status: "REJECTED" } : {},
      },
      {
        onSuccess: (response) => {
          getApiSuccessMessage(response);
          setIsAuditRejectModalOpen(false);
          sessionReFetch();
          historyReFetch();
          myTasksReFetch();
        },
        onError: (error) => {
          getApiErrorMessage(error);
        },
      },
    );
  };

  const onAuditApproveConfirm = async (comment: string) => {
    await mutate(
      {
        url: activeTask?.id
          ? dynamicEndpoints.WORKFLOW_TASK_COMPLETE(Number(activeTask.id))
          : dynamicEndpoints.AUDIT_APPROVE(Number(id)),
        method: "post",
        body: activeTask?.id ? { comment, status: "APPROVED" } : { comment },
      },
      {
        onSuccess: (response) => {
          dispatch(
            updateCount({ status: "PENDING", count: counts.PENDING - 1 }),
          );
          getApiSuccessMessage(response);
          setIsAuditApproveModalOpen(false);
          sessionReFetch();
          historyReFetch();
          myTasksReFetch();
        },
        onError: (error) => {
          getApiErrorMessage(error);
        },
      },
    );
  };

  const mockTask: ITask | null = session
    ? {
        id: Number(id) + 1000000,
        instance_id: Number(id),
        step_id: 0,
        user_id: session.assignee_id || 0,
        status: session.status_obj?.code as TaskStatus,
        created_at: session.created_at || "",
        document_id: Number(id),
        document_record_number: session.title || "",
        document_type: "audit",
        requester_name: session.assignee?.full_name || "",
        step_name:
          session.audit_type === "unit" ? "Unit Audit" : "Location Audit",
        reason: "",
      }
    : null;

  if (sessionPending && !session) {
    return (
      <div className="p-6 flex flex-col gap-3">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session) return null;

  const isCompleted = ["APPROVED", "COMPLETED"].includes(
    session.status_obj?.code,
  );

  return (
    <div className="flex flex-col px-3 pb-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-3 flex-wrap">
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
              {t("table.audit_information")}
            </h1>
            <span className="text-xs text-muted-foreground font-medium">
              {t("detail.inventory_verification")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {["PENDING", "IN_PROGRESS"].includes(session.status_obj?.code) &&
            !session.submitted_at &&
            isCreator && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsAuditCompleteModalOpen(true)}
                disabled={
                  mutatePending ||
                  (progressPercentage < 100 && (itemsDetail ?? [])?.length > 0)
                }
              >
                {t("detail.complete_audit")}
              </Button>
            )}

          {["COMPLETED", "WAITING_APPROVAL"].includes(
            session.status_obj?.code,
          ) &&
            isApprove && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsAuditApproveModalOpen(true)}
                  disabled={mutatePending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <Check size={14} />
                  {tMyTasks("detail.approval_form.approve")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAuditRejectModalOpen(true)}
                  disabled={mutatePending}
                  className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                >
                  <X size={14} />
                  {tMyTasks("detail.approval_form.reject")}
                </Button>
              </>
            )}
        </div>
      </div>

      {/* Main Info Card */}
      <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md h-full rounded-md">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 py-2 px-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            <CardTitle className="text-xs font-semibold text-primary tracking-wider">
              {t("detail.record_number")}
            </CardTitle>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-base font-bold text-foreground tracking-tight">
              #{session.id}
            </span>
            <Badge
              variant="outline"
              className="px-2 py-0.5 font-bold text-xs"
              style={{
                backgroundColor: `${session.status_obj?.color}18`,
                color: session.status_obj?.color,
                borderColor: `${session.status_obj?.color}40`,
              }}
            >
              {["WAITING_APPROVAL", "PENDING", "IN_PROGRESS"].includes(
                session.status_obj?.code,
              )
                ? "Process"
                : session.status_obj?.code}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 mb-4">
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1 leading-none">
                {t("detail.total_items")}
              </span>
              <span className="text-sm font-bold text-primary tracking-tight">
                {itemsDetail?.length || 0}
              </span>
            </div>
            <div className="md:col-span-1 lg:col-span-2 bg-muted/30 rounded-lg p-3 border border-border/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest leading-none">
                  {t("detail.audit_progress")}
                </span>
                <span className="text-xs font-bold text-primary">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress
                value={progressPercentage}
                className="h-1.5 bg-background/50"
              />
              <span className="text-[10px] text-muted-foreground font-medium text-center">
                {t("detail.assets_count", {
                  verified: verifiedItems,
                  total: totalItems,
                })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
            <InfoItem
              icon={ClipboardList}
              color="bg-primary/10 text-primary"
              label={t("table.title")}
              value={session.title}
              fullWidth
            />
            <InfoItem
              icon={session.audit_type === "unit" ? Building2 : MapPin}
              color="bg-amber-500/10 text-amber-500"
              label={t("detail.type")}
              value={
                <Badge variant="secondary" className="font-bold">
                  {session.audit_type.toUpperCase()}
                </Badge>
              }
            />
            <InfoItem
              icon={User}
              color="bg-emerald-500/10 text-emerald-500"
              label={t("table.creator")}
              value={session.creator?.full_name}
            />
            <InfoItem
              icon={User}
              color="bg-emerald-500/10 text-emerald-500"
              label={t("table.assignee")}
              value={session.assignee?.full_name}
            />
            <InfoItem
              icon={Calendar}
              color="bg-red-500/10 text-red-500"
              label={t("detail.due_date")}
              value={
                <span className="text-red-500 font-bold">
                  {formatDate(session.due_date)}
                </span>
              }
            />
            <InfoItem
              icon={session.audit_type === "unit" ? Building2 : MapPin}
              color="bg-purple-500/10 text-purple-500"
              label={t("detail.audit_target")}
              value={
                session.audit_type === "unit"
                  ? session.unit_obj?.name
                  : session.location_obj?.name
              }
            />
            <InfoItem
              icon={Clock}
              color="bg-indigo-500/10 text-indigo-500"
              label={t("table.created_at", { date: "" })
                .replace("{date}", "")
                .trim()}
              value={formatDate(session.created_at)}
            />
            <div className="md:col-span-2 lg:col-span-3 rounded-lg bg-primary/5 border border-primary/10 p-2 flex items-center gap-2 mt-2">
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <p className="text-[11px] text-muted-foreground leading-snug italic font-medium">
                {isCompleted
                  ? t("detail.status_processed_desc")
                  : t("detail.status_pending_desc")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md overflow-hidden rounded-md">
        <CardHeader className="flex flex-row items-center gap-2 border-b border-border/40 py-2 px-3">
          <Package className="w-4 h-4 text-primary" />
          <CardTitle className="text-xs font-semibold text-primary tracking-wider">
            {t("table.audited_assets")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="whitespace-nowrap">
            <TableHeader className="bg-muted/30 border-b border-border/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-3 h-8 w-10">
                  {canAssign && (
                    <Checkbox
                      checked={isAllSelected}
                      data-state={isIndeterminate ? "indeterminate" : undefined}
                      onCheckedChange={toggleAll}
                      aria-label="Chọn tất cả"
                      className="translate-y-0"
                    />
                  )}
                </TableHead>
                <TableHead className="font-bold h-8 px-3 w-[50px] text-center text-[10px]">
                  {t("table.no")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold">
                  {t("table.asset")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold">
                  {t("table.current_state")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold text-center">
                  {t("table.audit_result")}
                </TableHead>

                <TableHead className="px-3 h-8 text-[10px] font-bold">
                  {t("table.notes")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold">
                  {t("table.user_request")}
                </TableHead>
                <TableHead className="px-3 h-8 text-[10px] font-bold text-right">
                  {t("table.verified")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsPending ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={9} className="p-3">
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : !itemsDetail || itemsDetail.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-32 text-center text-muted-foreground italic text-xs"
                  >
                    {t("table.no_items_found")}
                  </TableCell>
                </TableRow>
              ) : (
                itemsDetail.map((item: IAuditDetailItem, index) => (
                  <TableRow
                    key={item.id}
                    className="border-border/20 hover:bg-muted/30 group cursor-pointer"
                    onClick={() => {
                      setSelectedItem(item);
                      setIsViewModalOpen(true);
                    }}
                  >
                    <TableCell
                      className="px-3 py-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canAssign && (
                        <Checkbox
                          checked={selectedItemIds.has(item.id)}
                          onCheckedChange={() => toggleItem(item.id)}
                          aria-label={`Chọn ${item.asset.name}`}
                        />
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-1.5 text-center text-[11px] font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12px] font-bold text-foreground group-hover:text-primary transition-colors">
                          {item.asset.name}
                        </span>
                        <code className="text-[10px] font-mono bg-muted/80 px-1.5 py-0.5 rounded w-fit text-muted-foreground opacity-70">
                          {item.asset.asset_code}
                        </code>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                          <User size={10} className="text-primary/60" />
                          <span className="truncate max-w-[120px]">
                            {item.asset.holder_name || "N/A"}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="w-fit text-[9px] px-1.5 py-0 rounded-sm font-bold border-0"
                          style={{
                            backgroundColor: `${item.asset.status_obj?.color}15`,
                            color: item.asset.status_obj?.color,
                          }}
                        >
                          {item.asset.status_obj?.name}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-center">
                      <Badge
                        variant="outline"
                        className="px-2 py-0.5 text-[9px] font-bold rounded-full border-0"
                        style={{
                          backgroundColor: `${item.status_obj?.color}18`,
                          color: item.status_obj?.color,
                        }}
                      >
                        {item.status_obj?.code === "MATCHED" && (
                          <CheckCircle2 size={10} className="mr-1" />
                        )}
                        {item.status_obj?.name}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <div
                        className="text-[11px] text-muted-foreground italic truncate max-w-[120px]"
                        title={item.notes ?? undefined}
                      >
                        {item.notes || "—"}
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <User size={10} className="text-primary/60 shrink-0" />
                        <span className="truncate max-w-[120px]">
                          {item?.assignee?.full_name || "—"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-right">
                      {item.verified_at ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[11px] font-bold text-foreground/80">
                            {formatDateTime(item.verified_at)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-black uppercase text-primary tracking-wider hover:underline underline-offset-2">
                          {t("table.inventory")}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <WorkflowHistory
        historyList={combineHistory}
        pending={historyPending}
        className="rounded-md"
      />

      {canAssign && selectedItemIds.size > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 bg-background/95 backdrop-blur-md border border-border/60 shadow-2xl rounded-2xl px-3 py-2">
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5">
              <UserCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs font-semibold text-primary whitespace-nowrap">
                {selectedItemIds.size} tài sản
              </span>
            </div>

            <span className="text-[11px] text-muted-foreground whitespace-nowrap hidden sm:block">
              Phân công cho
            </span>
            <SelectField
              options={(usersRes ?? []).map((s) => ({
                label: `${s.full_name} - (${s.username})`,
                value: s.id,
              }))}
              value={assignUserId}
              onChange={(v) => setAssignUserId(v as number | null)}
              placeholder="Chọn người quét..."
              searchable
              searchPlaceholder="Tìm nhân viên..."
              className="h-8 w-56 text-xs"
            />

            <Button
              size="sm"
              className="h-8 px-4 text-xs font-semibold gap-1.5 shrink-0"
              disabled={!assignUserId || mutatePending}
              onClick={handleAssign}
            >
              <UserCheck className="w-3.5 h-3.5" />
              {mutatePending ? "Đang giao..." : "Giao việc"}
            </Button>

            <div className="w-px h-5 bg-border/60 shrink-0" />
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg shrink-0"
              onClick={() => {
                setSelectedItemIds(new Set());
                setAssignUserId(null);
              }}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
      <ViewAuditItemModal
        key={`${selectedItem?.id}-${isViewModalOpen}`}
        item={selectedItem}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        assigneeUsername={session?.assignee?.username}
        creatorUsername={session?.creator?.username}
        itemAssigneeUsername={selectedItem?.assignee?.username}
        onRefresh={itemsReFetch}
        isLocked={
          session.status_obj?.code !== "PENDING" &&
          session.status_obj?.code !== "IN_PROGRESS"
        }
      />

      <CompleteAuditModal
        task={mockTask}
        isOpen={isAuditCompleteModalOpen}
        onClose={() => setIsAuditCompleteModalOpen(false)}
        onConfirm={onAuditCompleteConfirm}
        isSubmitting={mutatePending}
      />

      <RejectAuditModal
        task={mockTask}
        isOpen={isAuditRejectModalOpen}
        onClose={() => setIsAuditRejectModalOpen(false)}
        onConfirm={onAuditRejectConfirm}
        isSubmitting={mutatePending}
      />

      <ApproveAuditModal
        task={mockTask}
        isOpen={isAuditApproveModalOpen}
        onClose={() => setIsAuditApproveModalOpen(false)}
        onConfirm={onAuditApproveConfirm}
        isSubmitting={mutatePending}
      />
    </div>
  );
}

const InfoItem = ({
  icon: Icon,
  color,
  label,
  value,
  fullWidth = false,
}: {
  icon: LucideIcon | React.ElementType;
  color: string;
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) => (
  <div
    className={`flex items-center gap-2 border-b border-border/20 py-1.5 last:border-0 ${fullWidth ? "md:col-span-2 lg:col-span-3 transition-all" : ""}`}
  >
    <div
      className={`w-7 h-7 rounded-full ${color} flex items-center justify-center shrink-0`}
    >
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] font-bold text-muted-foreground tracking-wider leading-tight">
        {label}
      </span>
      <div className="truncate text-xs font-semibold text-foreground">
        {value}
      </div>
    </div>
  </div>
);
