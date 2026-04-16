"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux";
import { updateCount } from "@/redux/slices/task";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { ITask, TaskStatus } from "@/types/task";
import { IAuditSession } from "@/types/audit";
import {
  Search,
  Filter,
  X,
  RotateCcw,
  Check,
  CheckCircle2,
  XCircle,
  X as CloseIcon,
  Clock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  TableLoadingRows,
  TableEmptyRow,
} from "@/components/common/TableStateDisplay";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApproveTaskModal } from "./ApproveTaskModal";
import { RejectTaskModal } from "./RejectTaskModal";
import { CompleteAuditModal } from "./CompleteAuditModal";
import { RejectAuditModal } from "./RejectAuditModal";
import { ApproveAuditModal } from "./ApproveAuditModal";
import { endpoints, dynamicEndpoints } from "@/config/endpoints";
import { getApiSuccessMessage } from "@/utils/api-success";
import { getApiErrorMessage } from "@/utils/api-error";

export default function MyTasksTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TaskStatus>(
    (searchParams.get("tab") as TaskStatus) || "PENDING",
  );
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [skip, setSkip] = useState(0);
  const limit = 10;
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAuditCompleteModalOpen, setIsAuditCompleteModalOpen] =
    useState(false);
  const [isAuditRejectModalOpen, setIsAuditRejectModalOpen] = useState(false);
  const [isAuditApproveModalOpen, setIsAuditApproveModalOpen] = useState(false);

  const queryParams = new URLSearchParams();
  queryParams.append("skip", skip.toString());
  queryParams.append("limit", limit.toString());

  // Status filtering based on active tab
  queryParams.append("status", activeTab);
  const dispatch = useDispatch<AppDispatch>();

  if (appliedQ) queryParams.append("q", appliedQ);

  const { response, pending, reFetch } = useGet<ITask[]>(
    { url: `${endpoints.WORKFLOW_TASKS}me?${queryParams.toString()}` },
    { staleTime: 0 },
  );

  const {
    response: auditResponse,
    pending: auditPending,
    reFetch: auditReFetch,
  } = useGet<IAuditSession[]>(
    { url: endpoints.AUDIT_MY_AUDITS },
    { staleTime: 0 },
  );

  const { mutate, pending: mutatePending } = useMutation();

  const tasks = response || [];

  const filteredAudits = (auditResponse || []).filter((audit) => {
    if (activeTab === "PENDING") {
      return (
        audit.status_obj.code === "PENDING" ||
        audit.status_obj.code === "COMPLETED"
      );
    }
    return audit.status_obj.code === activeTab;
  });

  const mappedAudits: ITask[] = filteredAudits.map((audit) => ({
    id: audit.id + 1000000, // Offset ID to avoid collisions with workflow tasks
    instance_id: audit.id,
    step_id: 0,
    user_id: audit.assignee_id,
    status: audit.status_obj.code as TaskStatus,
    created_at: audit.created_at,
    document_id: audit.id,
    document_record_number: audit.title,
    document_type: "audit",
    requester_name: audit.assignee.full_name,
    step_name: audit.audit_type === "unit" ? "Unit Audit" : "Location Audit",
    reason: "",
  }));

  const allTasks = [...tasks, ...mappedAudits].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = tasks.length === limit;
  const isPending = pending || auditPending;

  // Sync current tab count to Redux
  useEffect(() => {
    if (response) {
      dispatch(
        updateCount({
          status: activeTab,
          count: response.length + (filteredAudits?.length || 0),
        }),
      );
    }
  }, [response, filteredAudits, activeTab, dispatch]);

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-500/10 text-orange-600 border-orange-200/50";
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200/50";
      case "REJECTED":
        return "bg-red-500/10 text-red-600 border-red-200/50";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200/50";
    }
  };

  const getProcessIcon = (type?: string) => {
    if (type === "audit") {
      return <FileText size={14} className="text-blue-500" />;
    }
    return <Check size={14} className="text-emerald-500" />;
  };

  const handleApprove = (task: ITask) => {
    setSelectedTask(task);
    if (task.document_type === "audit") {
      if (task.status === "COMPLETED") {
        setIsAuditApproveModalOpen(true);
      } else {
        setIsAuditCompleteModalOpen(true);
      }
    } else {
      setIsApproveModalOpen(true);
    }
  };

  const onAuditApproveConfirm = async (comment: string) => {
    if (!selectedTask) return;

    await mutate(
      {
        url: dynamicEndpoints.AUDIT_APPROVE(selectedTask.instance_id),
        method: "post",
        body: { comment },
      },
      {
        onSuccess: (response) => {
          getApiSuccessMessage(response);
          setIsAuditApproveModalOpen(false);
          auditReFetch();
        },
        onError: (error) => {
          getApiErrorMessage(error);
        },
      },
    );
  };

  const onAuditCompleteConfirm = async () => {
    if (!selectedTask) return;

    await mutate(
      {
        url: dynamicEndpoints.AUDIT_COMPLETE(selectedTask.instance_id),
        method: "post",
      },
      {
        onSuccess: (response) => {
          getApiSuccessMessage(response);
          setIsAuditCompleteModalOpen(false);
          auditReFetch();
        },
        onError: (error) => {
          getApiErrorMessage(error);
        },
      },
    );
  };

  const onApproveConfirm = async (comment: string) => {
    if (!selectedTask) return;

    await mutate(
      {
        url: dynamicEndpoints.WORKFLOW_TASK_COMPLETE(selectedTask.id),
        method: "post",
        body: {
          status: "APPROVED",
          comment: comment,
        },
      },
      {
        onSuccess: (response) => {
          getApiSuccessMessage(response);
          setIsApproveModalOpen(false);
          reFetch();
        },
        onError: (error) => {
          getApiErrorMessage(error);
        },
      },
    );
  };

  const handleReject = (task: ITask) => {
    setSelectedTask(task);
    if (task.document_type === "audit") {
      setIsAuditRejectModalOpen(true);
    } else {
      setIsRejectModalOpen(true);
    }
  };

  const onAuditRejectConfirm = async (reason: string) => {
    if (!selectedTask) return;

    await mutate(
      {
        url: dynamicEndpoints.AUDIT_REJECT(selectedTask.instance_id, reason),
        method: "post",
      },
      {
        onSuccess: (response) => {
          getApiSuccessMessage(response);
          setIsAuditRejectModalOpen(false);
          auditReFetch();
        },
        onError: (error) => {
          getApiErrorMessage(error);
        },
      },
    );
  };

  const onRejectConfirm = async (comment: string) => {
    if (!selectedTask) return;

    await mutate(
      {
        url: dynamicEndpoints.WORKFLOW_TASK_COMPLETE(selectedTask.id),
        method: "post",
        body: {
          status: "REJECTED",
          comment: comment,
        },
      },
      {
        onSuccess: (response) => {
          getApiSuccessMessage(response);
          setIsRejectModalOpen(false);
          reFetch();
        },
        onError: (error) => {
          getApiErrorMessage(error);
        },
      },
    );
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-2">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-card/60 backdrop-blur-md p-4 rounded-md border border-border/50 shadow-sm transition-all hover:border-border/80">
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val as TaskStatus);
            setSkip(0);
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", val);
            router.replace(`${pathname}?${params.toString()}`);
          }}
          className="w-full lg:w-fit h-full"
        >
          <TabsList className="grid grid-cols-3 p-1 bg-muted/30 w-[360px] h-full!">
            <TabsTrigger
              value="PENDING"
              className="flex items-center justify-center gap-0.5 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <Clock size={14} />
              <span className="text-[10px] font-bold uppercase tracking-tight">
                Pending
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="APPROVED"
              className="flex items-center justify-center gap-0.5 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <CheckCircle2 size={14} />
              <span className="text-[10px] font-bold uppercase tracking-tight">
                Approved
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="REJECTED"
              className="flex items-center justify-center gap-0.5 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <XCircle size={14} />
              <span className="text-[10px] font-bold uppercase tracking-tight">
                Rejected
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Group */}
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            size={16}
          />
          <Input
            placeholder="Search record number, requester..."
            className="pl-9 pr-10 h-10 bg-background/50 border-border/50 focus-visible:ring-primary/20 transition-all w-full"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setAppliedQ(q)}
          />
          {q && (
            <button
              onClick={() => {
                setQ("");
                setAppliedQ("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Group */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-10 px-4 bg-background/50 border-border/50 transition-all hover:bg-background/80 flex items-center gap-2 text-xs font-semibold"
          >
            <Filter size={14} className="text-muted-foreground/70" />
            <span>All Processes</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setQ("");
              setAppliedQ("");
              setSkip(0);
            }}
            className="h-10 w-10 border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-95 shrink-0"
            title="Clear all filters"
          >
            <RotateCcw size={16} className="text-muted-foreground/70" />
          </Button>
        </div>
      </div>

      <div className="border border-(--surface-border-color) rounded-lg flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 text-[11px] uppercase tracking-wider">
                Record Number
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-[11px] uppercase tracking-wider">
                Process Type
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-[11px] uppercase tracking-wider">
                Current Step
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-[11px] uppercase tracking-wider">
                Requester
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-[11px] uppercase tracking-wider">
                Created Date
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-[11px] uppercase tracking-wider text-center">
                Status
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-[11px] uppercase tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {isPending ? (
              <TableLoadingRows colSpan={7} rows={6} />
            ) : allTasks.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                icon={FileText}
                message="No tasks found"
                description="Everything is caught up! No tasks match your filters."
              />
            ) : (
              allTasks.map((task) => (
                <TableRow
                  key={task.id}
                  onClick={() => {
                    // if (task.document_type === "audit") {
                    //   router.push(`/audit/sessions/${task.document_id}`);
                    //   return;
                    // }
                    router.push(
                      `/my-tasks/${task.document_id}?status=${task.status}&document_type=${task.document_type}`,
                    );
                  }}
                  className="group hover:bg-primary/3 transition-colors relative cursor-pointer"
                >
                  <TableCell className="px-4 py-2 relative overflow-hidden">
                    {/* Status Accent */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 opacity-80",
                        task.status === "PENDING"
                          ? "bg-orange-500"
                          : task.status === "APPROVED"
                            ? "bg-emerald-500"
                            : "bg-red-500",
                      )}
                    />
                    <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {task.document_record_number}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/5 p-1.5 rounded-lg text-primary shrink-0 opacity-70">
                        {getProcessIcon(task.document_type)}
                      </div>
                      <span className="text-xs font-bold text-foreground/80 capitalize">
                        {task.document_type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <Badge
                      variant="outline"
                      className="px-2.5 py-0.5 rounded-md bg-secondary/30 border-secondary/50 text-[10px] font-bold text-foreground/70 uppercase"
                    >
                      {task.step_name}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-[11px] font-bold uppercase text-secondary-foreground">
                        {task.requester_name.charAt(0)}
                      </div>
                      <span className="font-medium text-foreground/80">
                        {task.requester_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock size={12} className="opacity-60" />
                        <span>
                          {new Date(task.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/80 ml-4 font-mono font-medium">
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shadow-none",
                        getStatusBadge(task.status),
                      )}
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {["PENDING", "COMPLETED"].includes(task.status) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(task);
                            }}
                            className="h-8 w-8 rounded-full hover:bg-emerald-50 text-emerald-600 transition-all active:scale-90"
                            title="Approve"
                          >
                            <Check size={16} />
                          </Button>
                          {(task.document_type !== "audit" ||
                            task.status === "COMPLETED") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(task);
                              }}
                              className="h-8 w-8 rounded-full hover:bg-red-50 text-red-600 transition-all active:scale-90"
                              title="Reject"
                            >
                              <CloseIcon size={16} />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {allTasks.length > 0 || skip > 0 ? (
        <Pagination className="flex w-full justify-end mt-1">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (skip > 0 && !isPending)
                    setSkip(Math.max(0, skip - limit));
                }}
                className={
                  skip === 0 || isPending
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                {currentPage}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (hasMore && !isPending) setSkip(skip + limit);
                }}
                className={
                  !hasMore || isPending ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      <ApproveTaskModal
        task={selectedTask}
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={onApproveConfirm}
        isSubmitting={mutatePending}
      />

      <RejectTaskModal
        task={selectedTask}
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={onRejectConfirm}
        isSubmitting={mutatePending}
      />

      <CompleteAuditModal
        task={selectedTask}
        isOpen={isAuditCompleteModalOpen}
        onClose={() => setIsAuditCompleteModalOpen(false)}
        onConfirm={onAuditCompleteConfirm}
        isSubmitting={mutatePending}
      />

      <RejectAuditModal
        task={selectedTask}
        isOpen={isAuditRejectModalOpen}
        onClose={() => setIsAuditRejectModalOpen(false)}
        onConfirm={onAuditRejectConfirm}
        isSubmitting={mutatePending}
      />

      <ApproveAuditModal
        task={selectedTask}
        isOpen={isAuditApproveModalOpen}
        onClose={() => setIsAuditApproveModalOpen(false)}
        onConfirm={onAuditApproveConfirm}
        isSubmitting={mutatePending}
      />
    </div>
  );
}
