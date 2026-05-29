"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";

import { TablePagination } from "@/components/common/TablePagination";
import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { cn } from "@/lib/utils";
import { RootState } from "@/redux";
import { ITask, TaskStatus } from "@/types/task";
import { getAuditDerivedStatus } from "@/utils/audit";
import { formatDate } from "@/utils/date";

type SubTab = "processing" | "pending_approval" | "history";

export default function MyTasksTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const { myAudits, loading: taskLoading } = useSelector((state: RootState) => state.task);

  // Active Status Tab specific states
  const [activeStatusTab, setActiveStatusTab] = useState<SubTab>(
    (searchParams.get("tab") as SubTab) || "processing",
  );
  const [selectedProcessType, setSelectedProcessType] = useState<string>("all");

  // Audits specific states
  const [auditType, setAuditType] = useState<string>("all");

  // Shared filters & pagination
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");

  // Workflow tasks pagination
  const [workflowSkip, setWorkflowSkip] = useState(0);
  const [workflowLimit, setWorkflowLimit] = useState(100);

  // Audits pagination
  const [auditSkip, setAuditSkip] = useState(0);
  const [auditLimit, setAuditLimit] = useState(100);

  // Translation Hooks
  const tTabs = useTranslations("page_my_tasks.tabs");
  const tFilters = useTranslations("page_my_tasks.filters");
  const tTable = useTranslations("page_my_tasks.table");
  const tDocTypes = useTranslations("page_workflow_templates.table.doc_types");
  const tAudit = useTranslations("page_audits");

  // Query parameter strings for each API
  const workflowProcessingQueryParams = useMemo(() => {
    const params = new URLSearchParams({
      skip: workflowSkip.toString(),
      limit: workflowLimit.toString(),
      status: "PENDING",
    });
    if (appliedQ) params.append("q", appliedQ);
    if (selectedProcessType !== "all") {
      params.append("document_type", selectedProcessType);
    }
    return params.toString();
  }, [workflowSkip, workflowLimit, appliedQ, selectedProcessType]);

  const workflowHistoryQueryParams = useMemo(() => {
    const params = new URLSearchParams({
      skip: workflowSkip.toString(),
      limit: workflowLimit.toString(),
      status: "APPROVED,REJECTED,CANCELLED",
    });
    if (appliedQ) params.append("q", appliedQ);
    if (selectedProcessType !== "all") {
      params.append("document_type", selectedProcessType);
    }
    return params.toString();
  }, [workflowSkip, workflowLimit, appliedQ, selectedProcessType]);

  // APIs
  const { response: workflowProcessingResponse, pending: workflowProcessingPending } = useGet<{
    items: ITask[];
    total?: number;
  }>(
    { url: `${endpoints.WORKFLOW_TASKS}me?${workflowProcessingQueryParams}` },
    { disabled: activeStatusTab !== "processing" },
  );

  const { response: workflowHistoryResponse, pending: workflowHistoryPending } = useGet<{
    items: ITask[];
    total?: number;
  }>(
    { url: `${endpoints.WORKFLOW_TASKS}me?${workflowHistoryQueryParams}` },
    { disabled: activeStatusTab !== "history" },
  );

  // Derived Tasks Data
  const workflowTasks = useMemo(() => {
    if (auditType !== "all") return []; // Filter out workflow tasks if an audit type is selected

    if (activeStatusTab === "processing") {
      if (!workflowProcessingResponse) return [];
      return Array.isArray(workflowProcessingResponse)
        ? workflowProcessingResponse
        : workflowProcessingResponse.items || [];
    }
    if (activeStatusTab === "history") {
      if (!workflowHistoryResponse) return [];
      return Array.isArray(workflowHistoryResponse)
        ? workflowHistoryResponse
        : workflowHistoryResponse.items || [];
    }
    return [];
  }, [activeStatusTab, auditType, workflowProcessingResponse, workflowHistoryResponse]);

  const workflowTotal = useMemo(() => {
    if (auditType !== "all") return 0;

    if (activeStatusTab === "processing") {
      if (!workflowProcessingResponse) return 0;
      return Array.isArray(workflowProcessingResponse)
        ? workflowProcessingResponse.length
        : workflowProcessingResponse.total ?? workflowProcessingResponse.items?.length ?? 0;
    }
    if (activeStatusTab === "history") {
      if (!workflowHistoryResponse) return 0;
      return Array.isArray(workflowHistoryResponse)
        ? workflowHistoryResponse.length
        : workflowHistoryResponse.total ?? workflowHistoryResponse.items?.length ?? 0;
    }
    return 0;
  }, [activeStatusTab, auditType, workflowProcessingResponse, workflowHistoryResponse]);

  // Derived Audits Data
  const rawAudits = myAudits;

  // Mapped Audits to Workflow Tasks format
  const mappedAudits: ITask[] = useMemo(() => {
    if (selectedProcessType !== "all") return []; // Filter out audits if a workflow process is selected

    let filtered = rawAudits;

    // Filter by type
    if (auditType !== "all") {
      filtered = filtered.filter((audit) => audit.audit_type === auditType);
    }

    // Filter by search query
    if (appliedQ) {
      const qLower = appliedQ.toLowerCase().trim();
      filtered = filtered.filter(
        (audit) =>
          audit.title.toLowerCase().includes(qLower) ||
          audit.assignee?.full_name?.toLowerCase().includes(qLower)
      );
    }

    // Filter by active tab status
    filtered = filtered.filter((audit) => {
      const derived = getAuditDerivedStatus(audit, user);
      if (activeStatusTab === "processing") {
        return derived === "PENDING";
      }
      if (activeStatusTab === "pending_approval") {
        return derived === "PENDING_APPROVAL";
      }
      if (activeStatusTab === "history") {
        return derived === "APPROVED" || derived === "REJECTED";
      }
      return false;
    });

    const sorted = filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return sorted.map((audit) => ({
      id: audit.id + 1000000,
      instance_id: audit.id,
      step_id: 0,
      user_id: audit.assignee_id,
      status: getAuditDerivedStatus(audit, user),
      created_at: audit.created_at,
      document_id: audit.id,
      document_record_number: audit.title,
      document_type: "audit",
      requester_name: audit?.assignee?.full_name || "",
      step_name: audit.audit_type === "unit" ? "Unit Audit" : "Location Audit",
      reason: "",
      waiting_for_approval: getAuditDerivedStatus(audit, user) === "PENDING_APPROVAL",
    }));
  }, [rawAudits, selectedProcessType, activeStatusTab, user, auditType, appliedQ]);

  const auditTotal = useMemo(() => {
    return mappedAudits.length;
  }, [mappedAudits]);

  const currentAudits = useMemo(() => {
    return mappedAudits.slice(auditSkip, auditSkip + auditLimit);
  }, [mappedAudits, auditSkip, auditLimit]);

  // Active States for Table Rendering
  const isWorkflowPending =
    activeStatusTab === "processing"
      ? workflowProcessingPending
      : activeStatusTab === "history"
        ? workflowHistoryPending
        : false;

  const isAuditPending = taskLoading;

  const handleTabChange = (val: SubTab) => {
    setActiveStatusTab(val);
    setWorkflowSkip(0);
    setAuditSkip(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", val);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setQ("");
    setAppliedQ("");
    setSelectedProcessType("all");
    setAuditType("all");
    setWorkflowSkip(0);
    setAuditSkip(0);
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-500/10 text-orange-600 border-orange-200/50";
      case "PENDING_APPROVAL":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200/50";
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

  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-3">
      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 bg-card/60 backdrop-blur-md p-3 rounded-md border border-border/50 transition-all hover:border-border/80">
        <Tabs
          value={activeStatusTab}
          onValueChange={(val) => handleTabChange(val as SubTab)}
          className="w-full lg:w-fit h-full"
        >
          <TabsList className="grid grid-cols-3 p-1 bg-muted/30 w-full lg:w-[360px] h-full!">
            <TabsTrigger
              value="processing"
              className="flex items-center justify-center gap-0.5 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <Clock size={14} />
              <span className="text-[10px] font-bold tracking-tight">
                {tTabs("processing")}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="pending_approval"
              className="flex items-center justify-center gap-0.5 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <Clock size={14} />
              <span className="text-[10px] font-bold tracking-tight">
                {tTabs("pending_approval")}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center justify-center gap-0.5 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <CheckCircle2 size={14} />
              <span className="text-[10px] font-bold tracking-tight">
                {tTabs("history")}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search + Filter Group */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              size={16}
            />
            <Input
              placeholder={tFilters("search_placeholder")}
              className="pl-9 pr-10 bg-background/50 border-border/50 focus-visible:ring-primary/20 transition-all w-full"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setAppliedQ(q);
                  setWorkflowSkip(0);
                  setAuditSkip(0);
                }
              }}
            />
            {q && (
              <button
                onClick={() => {
                  setQ("");
                  setAppliedQ("");
                  setWorkflowSkip(0);
                  setAuditSkip(0);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Group */}
          <div className="flex items-center gap-2 shrink-0">
            <Select
              value={selectedProcessType}
              onValueChange={(val) => {
                setSelectedProcessType(val);
                setWorkflowSkip(0);
              }}
            >
              <SelectTrigger className="h-10 px-4 bg-background/50 border-border/50 text-xs font-semibold hover:bg-background/80 transition-all w-10 sm:min-w-37.5 sm:w-auto overflow-hidden">
                <div className="flex items-center gap-2">
                  <Filter
                    size={14}
                    className="text-muted-foreground/70 shrink-0"
                  />
                  <span className="hidden sm:block truncate">
                    <SelectValue placeholder={tFilters("all_processes")} />
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {tFilters("all_processes")}
                </SelectItem>
                <SelectItem value="allocation">
                  {tDocTypes("allocation")}
                </SelectItem>
                <SelectItem value="liquidation">
                  {tDocTypes("liquidation")}
                </SelectItem>
                <SelectItem value="maintenance">
                  {tDocTypes("maintenance")}
                </SelectItem>
                <SelectItem value="recovery">
                  {tDocTypes("recovery")}
                </SelectItem>
                <SelectItem value="rental">{tDocTypes("rental")}</SelectItem>
                <SelectItem value="rental_return">
                  {tDocTypes("rental_return")}
                </SelectItem>
                <SelectItem value="stock_in">
                  {tDocTypes("stock_in")}
                </SelectItem>
                <SelectItem value="stock_out">
                  {tDocTypes("stock_out")}
                </SelectItem>
                <SelectItem value="transfer">
                  {tDocTypes("transfer")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={auditType}
              onValueChange={(val) => {
                setAuditType(val);
                setAuditSkip(0);
              }}
            >
              <SelectTrigger className="h-10 px-4 bg-background/50 border-border/50 text-xs font-semibold hover:bg-background/80 transition-all w-10 sm:min-w-37.5 sm:w-auto overflow-hidden">
                <div className="flex items-center gap-2">
                  <Filter
                    size={14}
                    className="text-muted-foreground/70 shrink-0"
                  />
                  <span className="hidden sm:block truncate">
                    <SelectValue placeholder={tAudit("filters.all_types")} />
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {tAudit("filters.all_types")}
                </SelectItem>
                <SelectItem value="unit">
                  {tAudit("filters.organization")}
                </SelectItem>
                <SelectItem value="location">
                  {tAudit("filters.location")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              className="border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-90 shrink-0"
              title={tFilters("clear_filters")}
            >
              <RotateCcw size={16} className="text-muted-foreground/70" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content scroll container containing both tables */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-1">
        
        {isWorkflowPending || isAuditPending ? (
          <div className="flex flex-col gap-6 animate-pulse">
            {/* Skeleton for Table 1 */}
            <div className="flex flex-col gap-2 bg-card/25 rounded-xl border border-border/40 p-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
                <div className="h-4 w-32 bg-muted/60 rounded" />
                <div className="h-4 w-20 bg-muted/60 rounded" />
              </div>
              <div className="border border-(--surface-border-color) rounded-lg overflow-hidden h-[360px]">
                <Table className="w-full">
                  <TableBody>
                    <TableLoadingRows colSpan={7} rows={4} />
                  </TableBody>
                </Table>
              </div>
            </div>
            {/* Skeleton for Table 2 */}
            <div className="flex flex-col gap-2 bg-card/25 rounded-xl border border-border/40 p-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
                <div className="h-4 w-32 bg-muted/60 rounded" />
                <div className="h-4 w-20 bg-muted/60 rounded" />
              </div>
              <div className="border border-(--surface-border-color) rounded-lg overflow-hidden h-[360px]">
                <Table className="w-full">
                  <TableBody>
                    <TableLoadingRows colSpan={7} rows={4} />
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : workflowTasks.length === 0 && currentAudits.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-card/25 rounded-xl border border-border/40 min-h-[300px]">
            <FileText className="text-muted-foreground/50 w-12 h-12 mb-3" />
            <p className="text-sm font-semibold text-foreground/80">{tTable("no_tasks")}</p>
            <p className="text-xs text-muted-foreground mt-1">{tTable("everything_caught_up")}</p>
          </div>
        ) : (
          <>
            {/* Table 1: Workflow Tasks */}
            {workflowTasks.length > 0 && (
              <div className="flex flex-col gap-2 bg-card/25 rounded-xl border border-border/40 p-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground/90 uppercase tracking-wider flex items-center gap-2">
                    <Check className="text-emerald-500" size={16} />
                    {tTabs("approval")}
                  </h3>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold">
                    {workflowTotal} {tTable("tasks_count").toLowerCase()}
                  </Badge>
                </div>

                <div className="border border-(--surface-border-color) rounded-lg overflow-hidden h-[360px] [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
                  <Table className="w-full">
                    <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color)">
                      <TableRow>
                        <TableHead className="font-semibold h-10 px-4 w-12.5 text-center">
                          {tTable("no")}
                        </TableHead>
                        <TableHead className="font-semibold h-10 px-4 w-45 text-center">
                          {tTable("record_number")}
                        </TableHead>
                        <TableHead className="font-semibold h-10 px-4 w-40 text-center hidden md:table-cell">
                          {tTable("process_type")}
                        </TableHead>
                        <TableHead className="font-semibold h-10 px-4 w-45 text-center hidden lg:table-cell">
                          {tTable("current_step")}
                        </TableHead>
                        <TableHead className="font-semibold h-10 px-4 w-50 hidden lg:table-cell">
                          {tTable("requester")}
                        </TableHead>
                        <TableHead className="font-semibold h-10 px-4 w-35 text-center hidden md:table-cell">
                          {tTable("created_date")}
                        </TableHead>
                        <TableHead className="font-semibold h-10 px-4 w-30 text-center">
                          {tTable("status")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-(--surface-border-color)">
                      {isWorkflowPending ? (
                        <TableLoadingRows colSpan={7} rows={4} />
                      ) : workflowTasks.length === 0 ? (
                        <TableEmptyRow
                          colSpan={7}
                          icon={FileText}
                          message={tTable("no_tasks")}
                          description={tTable("everything_caught_up")}
                        />
                      ) : (
                        workflowTasks.map((task, index) => (
                          <TableRow
                            key={task.id}
                            onClick={() => {
                              if (task.document_type === "audit") {
                                router.push(`/audits/sessions/${task.document_id}`);
                              } else {
                                router.push(
                                  `/my-tasks/${task.document_id}?status=${task.status}&document_type=${task.document_type}`,
                                );
                              }
                            }}
                            className="group hover:bg-primary/3 transition-colors relative cursor-pointer"
                          >
                            <TableCell className="px-4 py-2 text-center text-sm text-muted-foreground">
                              {workflowSkip + index + 1}
                            </TableCell>
                            <TableCell className="px-4 py-2 relative text-center text-sm">
                              <span
                                className="block font-semibold group-hover:text-primary transition-colors truncate"
                                title={task.document_record_number}
                              >
                                {task.document_record_number}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-2 text-center hidden md:table-cell">
                              <div className="flex items-center justify-center gap-2 overflow-hidden text-xs">
                                <div className="bg-primary/5 p-1.5 rounded-lg text-primary shrink-0 opacity-70">
                                  {getProcessIcon(task.document_type)}
                                </div>
                                <span className="font-bold text-foreground/80 truncate block">
                                  {tDocTypes(
                                    task.document_type as Parameters<typeof tDocTypes>[0],
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-2 max-w-0 overflow-hidden hidden lg:table-cell">
                              <Badge
                                variant="outline"
                                className="max-w-max mx-auto px-2.5 py-0.5 rounded-md bg-secondary/30 border-secondary/50 text-[10px] font-bold text-foreground/70 truncate block text-center"
                              >
                                {task.step_name}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-2 max-w-0 overflow-hidden hidden lg:table-cell">
                              <div className="flex items-center gap-2 text-sm overflow-hidden">
                                <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-[11px] font-bold text-secondary-foreground shrink-0">
                                  {task.requester_name
                                    ? task.requester_name.charAt(0)
                                    : "—"}
                                </div>
                                <span className="font-medium text-foreground/80 truncate block">
                                  {task.requester_name || "—"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-2 text-center hidden md:table-cell">
                              <div className="flex flex-col gap-0.5 text-xs overflow-hidden items-center">
                                <div className="flex items-center justify-center gap-1.5 text-muted-foreground overflow-hidden">
                                  <Clock size={12} className="opacity-60 shrink-0" />
                                  <span className="truncate">
                                    {formatDate(task.created_at, "HH:mm")}
                                  </span>
                                </div>
                                <span className="text-[10px] text-muted-foreground/80 font-mono font-medium truncate">
                                  {formatDate(task.created_at)}
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
                                {tTabs(
                                  task.status.toLowerCase() as Parameters<
                                    typeof tTabs
                                  >[0],
                                )}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <TablePagination
                  skip={workflowSkip}
                  limit={workflowLimit}
                  count={workflowTasks.length}
                  total={workflowTotal}
                  pending={isWorkflowPending}
                  onPageChange={setWorkflowSkip}
                  onLimitChange={setWorkflowLimit}
                />
              </div>
            )}

            {/* Table 2: Audits */}
            {currentAudits.length > 0 && (
              <div className="flex flex-col gap-2 bg-card/25 rounded-xl border border-border/40 p-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground/90 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="text-blue-500" size={16} />
                    {tTabs("my_audits")}
                  </h3>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold">
                    {auditTotal} {tTable("tasks_count").toLowerCase()}
                  </Badge>
                </div>

                <div className="border border-(--surface-border-color) rounded-lg overflow-hidden h-[360px] [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
                  <Table className="w-full">
                    <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color)">
                      <TableRow>
                        <TableHead className="font-semibold h-10 px-4 w-12.5 text-center">
                          {tTable("no")}
                        </TableHead>
                        <TableHead className="font-semibold h-10 px-4 w-45 text-center">
                          {tTable("record_number")}
                        </TableHead>
                        <TableHead className="font-semibold h-10 px-4 w-40 text-center hidden md:table-cell">
                          {tTable("process_type")}
                        </TableHead>
                        <TableHead className="font-semibold h-10 px-4 w-45 text-center hidden lg:table-cell">
                          {tTable("current_step")}
                        </TableHead>
                        <TableHead className="font-semibold h-10 px-4 w-50 hidden lg:table-cell">
                          {tTable("requester")}
                        </TableHead>
                        <TableHead className="font-semibold h-10 px-4 w-35 text-center hidden md:table-cell">
                          {tTable("created_date")}
                        </TableHead>
                        <TableHead className="font-semibold h-10 px-4 w-30 text-center">
                          {tTable("status")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-(--surface-border-color)">
                      {isAuditPending ? (
                        <TableLoadingRows colSpan={7} rows={4} />
                      ) : currentAudits.length === 0 ? (
                        <TableEmptyRow
                          colSpan={7}
                          icon={FileText}
                          message={tTable("no_tasks")}
                          description={tTable("everything_caught_up")}
                        />
                      ) : (
                        currentAudits.map((task, index) => (
                          <TableRow
                            key={task.id}
                            onClick={() => {
                              router.push(`/audits/sessions/${task.document_id}`);
                            }}
                            className="group hover:bg-primary/3 transition-colors relative cursor-pointer"
                          >
                            <TableCell className="px-4 py-2 text-center text-sm text-muted-foreground">
                              {auditSkip + index + 1}
                            </TableCell>
                            <TableCell className="px-4 py-2 relative text-center text-sm">
                              <div className="flex items-center justify-center gap-1.5 overflow-hidden">
                                {task.waiting_for_approval && (
                                  <div
                                    className="shrink-0 bg-emerald-500/10 text-emerald-600 rounded p-0.5"
                                    title={tTable("pending_approval")}
                                  >
                                    <Check size={12} strokeWidth={3} />
                                  </div>
                                )}
                                <span
                                  className="block font-semibold group-hover:text-primary transition-colors truncate"
                                  title={task.document_record_number}
                                >
                                  {task.document_record_number}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-2 text-center hidden md:table-cell">
                              <div className="flex items-center justify-center gap-2 overflow-hidden text-xs">
                                <div className="bg-primary/5 p-1.5 rounded-lg text-primary shrink-0 opacity-70">
                                  {getProcessIcon(task.document_type)}
                                </div>
                                <span className="font-bold text-foreground/80 truncate block">
                                  {tDocTypes(
                                    task.document_type as Parameters<typeof tDocTypes>[0],
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-2 max-w-0 overflow-hidden hidden lg:table-cell">
                              <Badge
                                variant="outline"
                                className="max-w-max mx-auto px-2.5 py-0.5 rounded-md bg-secondary/30 border-secondary/50 text-[10px] font-bold text-foreground/70 truncate block text-center"
                              >
                                {task.step_name}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-2 max-w-0 overflow-hidden hidden lg:table-cell">
                              <div className="flex items-center gap-2 text-sm overflow-hidden">
                                <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-[11px] font-bold text-secondary-foreground shrink-0">
                                  {task.requester_name
                                    ? task.requester_name.charAt(0)
                                    : "—"}
                                </div>
                                <span className="font-medium text-foreground/80 truncate block">
                                  {task.requester_name || "—"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-2 text-center hidden md:table-cell">
                              <div className="flex flex-col gap-0.5 text-xs overflow-hidden items-center">
                                <div className="flex items-center justify-center gap-1.5 text-muted-foreground overflow-hidden">
                                  <Clock size={12} className="opacity-60 shrink-0" />
                                  <span className="truncate">
                                    {formatDate(task.created_at, "HH:mm")}
                                  </span>
                                </div>
                                <span className="text-[10px] text-muted-foreground/80 font-mono font-medium truncate">
                                  {formatDate(task.created_at)}
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
                                {tTabs(
                                  task.status.toLowerCase() as Parameters<
                                    typeof tTabs
                                  >[0],
                                )}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <TablePagination
                  skip={auditSkip}
                  limit={auditLimit}
                  count={currentAudits.length}
                  total={auditTotal}
                  pending={isAuditPending}
                  onPageChange={setAuditSkip}
                  onLimitChange={setAuditLimit}
                />
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
