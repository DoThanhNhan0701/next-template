"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock,
  Info,
  MapPin,
  Package,
  User,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

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
import { WorkflowHistory } from "@/components/common/WorkflowHistory";
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import {
  IAuditDetailItem,
  IAuditDetailsResponse,
  IAuditSession,
} from "@/types/audit";
import { ApprovalHistory, ITask } from "@/types/task";
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
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<IAuditDetailItem | null>(
    null,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAuditCompleteModalOpen, setIsAuditCompleteModalOpen] =
    useState(false);
  const [isAuditRejectModalOpen, setIsAuditRejectModalOpen] = useState(false);
  const [isAuditApproveModalOpen, setIsAuditApproveModalOpen] = useState(false);

  const { response: session, pending: sessionPending, reFetch: sessionReFetch } = useGet<IAuditSession>({
    url: dynamicEndpoints.AUDIT_SESSION_DETAIL(Number(id)),
  });

  const { response: items, pending: itemsPending } =
    useGet<IAuditDetailsResponse>({
      url: dynamicEndpoints.AUDIT_SESSION_DETAILS(Number(id)),
    });

  // Fetch workflow history
  const { response: historyList, pending: historyPending } = useGet<
    ApprovalHistory[]
  >({
    url: dynamicEndpoints.WORKFLOW_HISTORY("audit", Number(id)),
  });

  // Check if current user has this audit assigned to them
  const { response: myAudits } = useGet<IAuditSession[]>(
    { url: endpoints.AUDIT_MY_AUDITS },
    { staleTime: 0 },
  );

  const { mutate, pending: mutatePending } = useMutation();

  // Check if this audit is assigned to current user
  const isMyAudit = myAudits?.some((audit) => audit.id === Number(id));

  // Debug: Log values to console
  console.log("🔍 AuditDetail Debug:", {
    auditId: Number(id),
    myAudits: myAudits?.map(a => ({ id: a.id, title: a.title, status: a.status_obj?.code })),
    isMyAudit,
    sessionStatus: session?.status_obj?.code,
  });

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

  // Create a mock task object for modals
  const mockTask: ITask | null = isMyAudit && session
    ? {
      id: Number(id) + 1000000,
      instance_id: Number(id),
      step_id: 0,
      user_id: session.assignee_id || 0,
      status: session.status_obj?.code as any,
      created_at: session.created_at || "",
      document_id: Number(id),
      document_record_number: session.title || "",
      document_type: "audit",
      requester_name: session.assignee?.full_name || "",
      step_name: session.audit_type === "unit" ? "Unit Audit" : "Location Audit",
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
      {/* Back & Header */}
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

        {/* Action Buttons */}
        {isMyAudit && ["PENDING", "COMPLETED"].includes(session?.status_obj?.code || "") && (
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (session?.status_obj?.code === "COMPLETED") {
                  setIsAuditApproveModalOpen(true);
                } else {
                  setIsAuditCompleteModalOpen(true);
                }
              }}
              disabled={mutatePending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Check size={16} />
              {tMyTasks("detail.approval_form.approve")}
            </Button>
            {session?.status_obj?.code === "COMPLETED" && (
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
            )}
          </div>
        )}
      </div>

      {/* Summary Card */}
      <Card className="border border-border/50 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80 rounded-r" />
        <CardContent className="p-3 pl-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: record info */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground font-semibold tracking-wider">
                  {t("table.audit_information")}
                </span>
                <span className="text-xl font-bold text-foreground tracking-tight">
                  {session.title}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock size={12} className="opacity-70" />
                  {t("table.created_at", { date: formatDate(session.created_at) })}
                </span>
              </div>
            </div>

            {/* Right: stats & status */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex flex-col items-center px-5 py-2.5 rounded-xl bg-primary/5 border border-primary/10 min-w-[80px]">
                <span className="text-xs text-muted-foreground font-semibold tracking-wider">
                  {t("detail.total_items")}
                </span>
                <span className="text-2xl font-bold text-primary">
                  {items?.length || 0}
                </span>
              </div>
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
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
        {/* Items table */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md h-full flex flex-col min-h-[400px]">
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
                        <TableCell colSpan={6} className="p-3">
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : !items || items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
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
                        {/* No */}
                        <TableCell className="px-4 py-3 text-center text-muted-foreground">
                          {index + 1}
                        </TableCell>

                        {/* 1. Asset Info */}
                        <TableCell className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.asset.name}
                            </span>
                            <code className="text-[10px] font-mono bg-muted/80 px-1.5 py-0.5 rounded w-fit text-muted-foreground">
                              {item.asset.asset_code}
                            </code>
                          </div>
                        </TableCell>

                        {/* 2. Current State */}
                        <TableCell className="px-4 py-3">
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

                        {/* 3. Audit Result */}
                        <TableCell className="px-4 py-3 text-center">
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

                        {/* 4. Action & Target */}
                        <TableCell className="px-4 py-3">
                          <div className="flex flex-col gap-1 max-w-[180px]">
                            {item.proposed_action ? (
                              <>
                                <span className="text-[10px] font-bold text-amber-500 tracking-tight">
                                  {item.proposed_action}
                                </span>
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded border border-border/40">
                                  {item.target_staff && <User size={10} />}
                                  {item.target_location_id && (
                                    <MapPin size={10} />
                                  )}
                                  <span className="truncate">
                                    {item.target_staff?.full_name ||
                                      item.target_holder_name ||
                                      t("table.system_update")}
                                  </span>
                                  {(item.transfer_quantity !== null ||
                                    item.unit_quantity !== null) && (
                                      <span className="ml-auto font-bold text-primary">
                                        {t("table.quantity", {
                                          value: item.transfer_quantity ?? item.unit_quantity,
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

                        {/* 5. Notes */}
                        <TableCell className="px-4 py-3 min-w-[150px]">
                          <div className="flex items-start gap-1.5 text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2 hover:line-clamp-none transition-all">
                            {item.notes ? (
                              <>
                                <Info
                                  size={12}
                                  className="shrink-0 mt-0.5 opacity-40 text-primary"
                                />
                                <span>{item.notes}</span>
                              </>
                            ) : (
                              <span className="opacity-40">—</span>
                            )}
                          </div>
                        </TableCell>

                        {/* 6. Verified Time */}
                        <TableCell className="px-4 py-3">
                          <div className="flex flex-col text-[10px] items-end justify-center">
                            <span className="font-bold text-foreground/70">
                              {formatDate(item.verified_at)}
                            </span>
                            <span className="text-muted-foreground font-mono">
                              {formatDate(item.verified_at, "HH:mm")}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-3">
          <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
              <Info className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-primary">
                {t("table.audit_information")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User size={15} className="shrink-0" />
                  <span className="text-xs font-semibold tracking-wider">
                    {t("table.assignee")}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {session.assignee?.full_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={15} className="shrink-0" />
                  <span className="text-xs font-semibold tracking-wider">
                    {t("table.due_date")}
                  </span>
                </div>
                <span className="text-sm font-bold text-red-500/80">
                  {formatDate(session.due_date)}
                </span>
              </div>
              <div className="pt-2 border-t border-border/50">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    {session.audit_type === "unit" ? (
                      <Building2 size={15} />
                    ) : (
                      <MapPin size={15} />
                    )}
                    <span className="text-xs font-semibold tracking-wider">
                      {t("detail.audit_target")}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <span className="text-xs text-muted-foreground block mb-0.5">
                      {session.audit_type === "unit"
                        ? t("filters.organization")
                        : t("filters.location")}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {session.audit_type === "unit"
                        ? session.unit_obj?.name
                        : session.location_obj?.name}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-start gap-3">
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              )}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold tracking-tight">
                  {t("table.status_note")}
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                  {isCompleted
                    ? t("table.finalized_note")
                    : t("table.active_note")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ViewAuditItemModal
        item={selectedItem}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />

      {/* Workflow History */}
      <WorkflowHistory
        historyList={historyList}
        pending={historyPending}
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
