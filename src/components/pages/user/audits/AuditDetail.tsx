"use client";

import { useState } from "react";

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
  MapPin,
  Package,
  User,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { WorkflowHistory } from "@/components/common/WorkflowHistory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ApprovalHistory, ITask, TaskStatus } from "@/types/task";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { formatDate } from "@/utils/date";

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
  const { isSuperAdmin } = usePermissions();
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<IAuditDetailItem | null>(
    null,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAuditCompleteModalOpen, setIsAuditCompleteModalOpen] =
    useState(false);
  const [isAuditRejectModalOpen, setIsAuditRejectModalOpen] = useState(false);
  const [isAuditApproveModalOpen, setIsAuditApproveModalOpen] = useState(false);

  const {
    response: session,
    pending: sessionPending,
    reFetch: sessionReFetch,
  } = useGet<IAuditSession>({
    url: dynamicEndpoints.AUDIT_SESSION_DETAIL(Number(id)),
  });

  const {
    response: items,
    pending: itemsPending,
    reFetch: itemsReFetch,
  } = useGet<IAuditDetailsResponse>({
    url: dynamicEndpoints.AUDIT_SESSION_DETAILS(Number(id)),
  });

  const { response: historyList, pending: historyPending } = useGet<
    ApprovalHistory[]
  >({
    url: dynamicEndpoints.WORKFLOW_HISTORY("audit", Number(id)),
  });

  const { response: myAudits } = useGet<IAuditSession[]>({
    url: endpoints.AUDIT_MY_AUDITS,
  });

  const totalItems = items?.length || 0;
  const verifiedItems = items?.filter((item) => item.verified_at).length || 0;
  const progressPercentage =
    totalItems > 0 ? (verifiedItems / totalItems) * 100 : 0;

  const { mutate, pending: mutatePending } = useMutation();

  const isMyAudit = myAudits?.some((audit) => audit.id === Number(id));

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
        url: dynamicEndpoints.AUDIT_REJECT(Number(id), reason),
        method: "post",
      },
      {
        onSuccess: (response) => {
          getApiSuccessMessage(response);
          setIsAuditRejectModalOpen(false);
          sessionReFetch();
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
        url: dynamicEndpoints.AUDIT_APPROVE(Number(id)),
        method: "post",
        body: { comment },
      },
      {
        onSuccess: (response) => {
          dispatch(
            updateCount({ status: "PENDING", count: counts.PENDING - 1 }),
          );
          getApiSuccessMessage(response);
          setIsAuditApproveModalOpen(false);
          sessionReFetch();
        },
        onError: (error) => {
          getApiErrorMessage(error);
        },
      },
    );
  };

  const mockTask: ITask | null =
    (isMyAudit || isSuperAdmin) && session
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
              {t("table.audit_batch_title")}
            </h1>
            <span className="text-xs text-muted-foreground">
              {t("detail.inventory_verification")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session?.status_obj?.code === "PENDING" && isMyAudit && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsAuditCompleteModalOpen(true)}
              disabled={mutatePending || progressPercentage < 100}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Check size={16} />
              {t("detail.complete_audit")}
            </Button>
          )}

          {session?.status_obj?.code === "COMPLETED" && isSuperAdmin && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsAuditApproveModalOpen(true)}
                disabled={mutatePending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Check size={16} />
                {tMyTasks("detail.approval_form.approve")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAuditRejectModalOpen(true)}
                disabled={mutatePending}
                className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
              >
                <X size={16} />
                {tMyTasks("detail.approval_form.reject")}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="border border-border/50 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80 rounded-r" />
        <CardContent className="p-3 pl-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground font-semibold tracking-wider">
                  {t("table.audit_information")}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground tracking-tight">
                    {session.title}
                  </span>
                  <Badge
                    variant="outline"
                    className="h-5 px-1.5 text-[10px] font-mono font-bold bg-muted/50 text-muted-foreground border-border/50"
                  >
                    #{session.id}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock size={12} className="opacity-70" />
                  {t("table.created_at", {
                    date: formatDate(session.created_at),
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex flex-col items-center px-5 py-2.5 rounded-xl bg-primary/5 border border-primary/10 min-w-[80px]">
                <span className="text-xs text-muted-foreground font-semibold tracking-wider">
                  {t("detail.total_items")}
                </span>
                <span className="text-2xl font-bold text-primary">
                  {items?.length || 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg h-auto flex items-center gap-1.5 border-primary/20 bg-primary/5 text-primary"
                >
                  {session.audit_type === "unit" ? (
                    <Building2 size={12} />
                  ) : (
                    <MapPin size={12} />
                  )}
                  {session.audit_type.toUpperCase()}
                </Badge>
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-sm font-bold rounded-xl h-auto"
                  style={{
                    backgroundColor: `${session.status_obj?.color}18`,
                    color: session.status_obj?.color,
                    borderColor: `${session.status_obj?.color}40`,
                  }}
                >
                  {session.status_obj?.name}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/50 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden relative p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">
              {t("detail.audit_progress")}
            </span>
            <span className="text-sm font-bold text-primary">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-muted/50" />
          <span className="text-xs text-muted-foreground">
            {t("detail.assets_count", {
              verified: verifiedItems,
              total: totalItems,
            })}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
          <CardContent className="p-3 flex items-center gap-3 h-full">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <User size={20} className="text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                {t("table.assignee")}
              </span>
              <span className="text-sm font-bold text-foreground truncate">
                {session.assignee?.full_name}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono opacity-60 truncate">
                @{session.assignee?.username}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
          <CardContent className="p-3 flex items-center gap-3 h-full">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <Calendar size={20} className="text-red-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                {t("table.due_date")}
              </span>
              <span className="text-sm font-black text-red-500/80">
                {formatDate(session.due_date)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
          <CardContent className="p-3 flex items-center gap-3 h-full">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              {session.audit_type === "unit" ? (
                <Building2 size={20} className="text-primary" />
              ) : (
                <MapPin size={20} className="text-primary" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                {t("detail.audit_target")}
              </span>
              <span className="text-sm font-bold text-foreground truncate">
                {session.audit_type === "unit"
                  ? session.unit_obj?.name
                  : session.location_obj?.name}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-xl bg-muted/30 border border-border/50 p-3 h-full flex items-center gap-3">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-amber-500 shrink-0" />
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-foreground/70">
              {t("table.status_note")}
            </span>
            <p className="text-[11px] text-muted-foreground leading-snug italic line-clamp-2">
              {isCompleted ? t("table.finalized_note") : t("table.active_note")}
            </p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md flex flex-col h-full min-h-[400px]">
        <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4 shrink-0">
          <Package className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-semibold text-primary">
            {t("table.audited_assets")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          <Table className="whitespace-nowrap">
            <TableHeader className="bg-sidebar-accent border-b border-border/50">
              <TableRow>
                <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                  {t("table.no")}
                </TableHead>
                <TableHead className="px-4 h-10 text-xs font-semibold">
                  {t("table.asset")}
                </TableHead>
                <TableHead className="px-4 h-10 text-xs font-semibold">
                  {t("table.current_state")}
                </TableHead>
                <TableHead className="px-4 h-10 text-xs font-semibold text-center">
                  {t("table.audit_result")}
                </TableHead>
                <TableHead className="px-4 h-10 text-xs font-semibold">
                  {t("table.action_target")}
                </TableHead>
                <TableHead className="px-4 h-10 text-xs font-semibold">
                  {t("table.notes")}
                </TableHead>
                <TableHead className="px-4 h-10 text-xs font-semibold">
                  {t("table.verified")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsPending ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7} className="p-3">
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : !items || items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-40 text-center text-muted-foreground italic"
                  >
                    {t("table.no_items_found")}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item: IAuditDetailItem, index) => (
                  <TableRow
                    key={item.id}
                    className="border-border/50 hover:bg-muted/30 group cursor-pointer"
                    onClick={() => {
                      setSelectedItem(item);
                      setIsViewModalOpen(true);
                    }}
                  >
                    <TableCell className="px-4 py-1.5 text-center text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    <TableCell className="px-4 py-1.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {item.asset.name}
                        </span>
                        <code className="text-[10px] font-mono bg-muted/80 px-1.5 py-0.5 rounded w-fit text-muted-foreground">
                          {item.asset.asset_code}
                        </code>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-1.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <User
                            size={12}
                            className="text-muted-foreground opacity-70"
                          />
                          <span className="font-medium text-foreground/80">
                            {item.asset.holder_name || "N/A"}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="w-fit text-[9px] px-1.5 py-0 rounded-sm font-medium"
                          style={{
                            backgroundColor: `${item.asset.status_obj?.color}10`,
                            color: item.asset.status_obj?.color,
                            borderColor: `${item.asset.status_obj?.color}30`,
                          }}
                        >
                          {item.asset.status_obj?.name}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-1.5 text-center">
                      <Badge
                        variant="outline"
                        className="px-2.5 py-0.5 text-[10px] font-bold rounded-full shadow-sm"
                        style={{
                          backgroundColor: `${item.status_obj?.color}18`,
                          color: item.status_obj?.color,
                          borderColor: `${item.status_obj?.color}40`,
                        }}
                      >
                        {item.status_obj?.code === "MATCHED" && (
                          <CheckCircle2 size={10} className="mr-1" />
                        )}
                        {item.status_obj?.name}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 py-1.5">
                      <div className="flex flex-col gap-1 max-w-[180px]">
                        {item.proposed_action ? (
                          <>
                            <span className="text-[10px] font-bold text-amber-500 tracking-tight">
                              {item.proposed_action}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded border border-border/40">
                              {item.target_staff && <User size={10} />}
                              {item.target_location_id && <MapPin size={10} />}
                              <span className="truncate">
                                {item.target_staff?.full_name ||
                                  item.target_holder_name ||
                                  t("table.system_update")}
                              </span>
                              {(item.transfer_quantity !== null ||
                                item.unit_quantity !== null) && (
                                <span className="ml-auto font-bold text-primary">
                                  {t("table.quantity", {
                                    value:
                                      item.transfer_quantity ??
                                      item.unit_quantity,
                                  })}
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            {t("table.no_action_required")}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-1.5 min-w-[150px]">
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2 hover:line-clamp-none transition-all">
                        {item.notes ? (
                          <span>{item.notes}</span>
                        ) : (
                          <span className="opacity-40">—</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-1.5 min-w-[120px]">
                      <div className="flex flex-col text-[10px] items-end justify-center gap-1">
                        {item.verified_at ? (
                          <>
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-foreground/70">
                                {formatDate(item.verified_at)}
                              </span>
                              <span className="text-muted-foreground font-mono opacity-60">
                                {formatDate(item.verified_at, "HH:mm")}
                              </span>
                            </div>
                            <span className="text-primary font-black uppercase text-[9px] tracking-wider">
                              {t("table.edit")}
                            </span>
                          </>
                        ) : (
                          <span className="text-primary font-black uppercase text-[9px] tracking-wider group-hover:underline underline-offset-4 decoration-primary/30 transition-all">
                            {t("table.inventory")}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ViewAuditItemModal
        key={`${selectedItem?.id}-${isViewModalOpen}`}
        item={selectedItem}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        assigneeUsername={session?.assignee?.username}
        onRefresh={itemsReFetch}
        isLocked={session.status_obj?.code !== "PENDING"}
      />

      <WorkflowHistory historyList={historyList} pending={historyPending} />

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
