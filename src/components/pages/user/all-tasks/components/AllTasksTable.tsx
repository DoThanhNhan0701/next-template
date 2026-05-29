"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  CheckCircle2,
  Clock,
  Clock3,
  FileText,
  Layers,
  RotateCcw,
  Search,
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
import { RootState } from "@/redux";
import { IAuditSession } from "@/types/audit";
import { ITask, TaskStatus } from "@/types/task";
import { formatDate } from "@/utils/date";

import { getAllAuditDerivedStatus } from "../utils";

type SubTab = "processing" | "pending_approval" | "history";

interface AllTasksTableProps {
  rawAudits: IAuditSession[];
  isAuditPending: boolean;
}

export default function AllTasksTable({
  rawAudits,
  isAuditPending,
}: AllTasksTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);

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

  // Workflow query params memoization
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
  const {
    response: workflowProcessingResponse,
    pending: workflowProcessingPending,
  } = useGet<{
    items: ITask[];
    total?: number;
  }>(
    { url: `${endpoints.WORKFLOW_TASKS}all?${workflowProcessingQueryParams}` },
    { disabled: activeStatusTab !== "processing" },
  );

  const { response: workflowHistoryResponse, pending: workflowHistoryPending } =
    useGet<{
      items: ITask[];
      total?: number;
    }>(
      { url: `${endpoints.WORKFLOW_TASKS}all?${workflowHistoryQueryParams}` },
      { disabled: activeStatusTab !== "history" },
    );

  // Derived Tasks Data
  const workflowTasks = useMemo(() => {
    if (auditType !== "all") return []; // Filter out workflow tasks if an audit type is selected

    let tasks: ITask[] = [];
    if (activeStatusTab === "processing") {
      if (!workflowProcessingResponse) return [];
      tasks = Array.isArray(workflowProcessingResponse)
        ? workflowProcessingResponse
        : workflowProcessingResponse.items || [];
    } else if (activeStatusTab === "history") {
      if (!workflowHistoryResponse) return [];
      tasks = Array.isArray(workflowHistoryResponse)
        ? workflowHistoryResponse
        : workflowHistoryResponse.items || [];
    }
    return tasks.filter((task) => task.document_type !== "audit");
  }, [
    activeStatusTab,
    auditType,
    workflowProcessingResponse,
    workflowHistoryResponse,
  ]);

  const workflowTotal = useMemo(() => {
    if (auditType !== "all") return 0;

    let total = 0;
    let itemsCount = 0;
    const filteredCount = workflowTasks.length;

    if (activeStatusTab === "processing") {
      if (!workflowProcessingResponse) return 0;
      if (Array.isArray(workflowProcessingResponse)) {
        total = workflowProcessingResponse.length;
        itemsCount = total;
      } else {
        total = workflowProcessingResponse.total ?? 
                workflowProcessingResponse.items?.length ?? 
                0;
        itemsCount = workflowProcessingResponse.items?.length ?? 0;
      }
    } else if (activeStatusTab === "history") {
      if (!workflowHistoryResponse) return 0;
      if (Array.isArray(workflowHistoryResponse)) {
        total = workflowHistoryResponse.length;
        itemsCount = total;
      } else {
        total = workflowHistoryResponse.total ?? 
                workflowHistoryResponse.items?.length ?? 
                0;
        itemsCount = workflowHistoryResponse.items?.length ?? 0;
      }
    }

    const auditCountInFetched = itemsCount - filteredCount;
    return Math.max(0, total - auditCountInFetched);
  }, [
    activeStatusTab,
    auditType,
    workflowProcessingResponse,
    workflowHistoryResponse,
    workflowTasks,
  ]);

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
          audit.assignee?.full_name?.toLowerCase().includes(qLower),
      );
    }

    // Filter by active tab status
    filtered = filtered.filter((audit) => {
      const derived = getAllAuditDerivedStatus(audit, user);
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
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return sorted.map((audit) => ({
      id: audit.id + 1000000,
      instance_id: audit.id,
      step_id: 0,
      user_id: audit.assignee_id,
      status: getAllAuditDerivedStatus(audit, user),
      created_at: audit.created_at,
      document_id: audit.id,
      document_record_number: audit.title,
      document_type: "audit",
      requester_name: audit?.assignee?.full_name || "",
      step_name: audit.audit_type === "unit" ? "Unit Audit" : "Location Audit",
      reason: "",
      waiting_for_approval:
        getAllAuditDerivedStatus(audit, user) === "PENDING_APPROVAL",
    }));
  }, [
    rawAudits,
    selectedProcessType,
    activeStatusTab,
    user,
    auditType,
    appliedQ,
  ]);

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

  const getStatusBadge = (status: TaskStatus | string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[10px] font-bold px-2 py-0.5"
          >
            {tTabs("pending")}
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold px-2 py-0.5"
          >
            {tTabs("approved")}
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] font-bold px-2 py-0.5"
          >
            {tTabs("rejected")}
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 text-[10px] font-bold px-2 py-0.5"
          >
            {tTabs("cancelled")}
          </Badge>
        );
      case "PENDING_APPROVAL":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1 w-fit mx-auto"
          >
            <Clock3 size={10} />
            {tTabs("pending_approval")}
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="text-[10px] font-bold px-2 py-0.5"
          >
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header Tabs & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card/40 p-2 sm:p-3 rounded-xl border border-border/40">
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
              <Clock3 size={14} />
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

        {/* Action Filters Section */}
        <div className="flex flex-wrap items-center gap-2 flex-1 lg:justify-end">
          {/* Text Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setAppliedQ(q);
              setWorkflowSkip(0);
              setAuditSkip(0);
            }}
            className="relative flex-1 min-w-[200px] max-w-md"
          >
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 w-3.5 h-3.5" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={tFilters("search_placeholder")}
              className="pl-8 text-xs bg-background/5 border-border/60 focus-visible:ring-primary/20 focus-visible:border-primary/50 h-8.5"
            />
            {q !== appliedQ && (
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 px-2 text-[10px] font-bold bg-primary hover:bg-primary/95 text-primary-foreground"
              >
                Search
              </Button>
            )}
          </form>

          {/* Document / Process Type Dropdown (Workflow only if audits not filtered) */}
          {auditType === "all" && (
            <Select
              value={selectedProcessType}
              onValueChange={(val) => {
                setSelectedProcessType(val);
                setWorkflowSkip(0);
              }}
            >
              <SelectTrigger className="w-[160px] h-8.5 text-xs border-border/60 bg-background/5">
                <SelectValue placeholder={tFilters("all_processes")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tFilters("all_processes")}</SelectItem>
                <SelectItem value="allocation">
                  {tDocTypes("allocation")}
                </SelectItem>
                <SelectItem value="recovery">
                  {tDocTypes("recovery")}
                </SelectItem>
                <SelectItem value="transfer">
                  {tDocTypes("transfer")}
                </SelectItem>
                <SelectItem value="maintenance">
                  {tDocTypes("maintenance")}
                </SelectItem>
                <SelectItem value="liquidation">
                  {tDocTypes("liquidation")}
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Audit Type Filter Dropdown (Audits only if workflow not filtered) */}
          {selectedProcessType === "all" && (
            <Select
              value={auditType}
              onValueChange={(val) => {
                setAuditType(val);
                setAuditSkip(0);
              }}
            >
              <SelectTrigger className="w-[160px] h-8.5 text-xs border-border/60 bg-background/5">
                <SelectValue placeholder={tAudit("filters.all_types")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {tAudit("filters.all_types")}
                </SelectItem>
                <SelectItem value="unit">{tAudit("form.by_unit")}</SelectItem>
                <SelectItem value="location">
                  {tAudit("form.by_location")}
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Reset Filters Icon Button */}
          {(appliedQ ||
            selectedProcessType !== "all" ||
            auditType !== "all") && (
            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="icon"
              className="h-8.5 w-8.5 border-border/60 bg-background/5 text-muted-foreground hover:text-foreground"
              title={tFilters("clear_filters")}
            >
              <RotateCcw size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Tables Container */}
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
        <div className="flex flex-col items-center justify-center min-h-[360px] bg-card/20 rounded-xl border border-dashed border-border/60 p-8 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-sm font-bold text-foreground/80 mb-1">
            {tTable("no_tasks")}
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            {tTable("everything_caught_up")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Table 1: Workflow Tasks */}
          {workflowTasks.length > 0 && (
            <div className="flex flex-col gap-2 bg-card/25 rounded-xl border border-border/40 p-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
                <h3 className="text-xs sm:text-sm font-bold text-foreground/90  tracking-wider flex items-center gap-2">
                  <Layers className="text-primary" size={16} />
                  {tTabs("approval")}
                </h3>
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold"
                >
                  {workflowTotal} {tTable("tasks_count").toLowerCase()}
                </Badge>
              </div>

              <div className="border border-(--surface-border-color) rounded-lg overflow-hidden">
                <Table className="w-full" stickyHeader height="320px">
                  <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10">
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
                              router.push(
                                `/audits/sessions/${task.document_id}`,
                              );
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
                            <span className="font-semibold group-hover:text-primary transition-colors">
                              {task.document_record_number}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-2 text-center text-xs text-muted-foreground hidden md:table-cell">
                            {tDocTypes(task.document_type)}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-center text-xs font-medium text-primary hidden lg:table-cell">
                            {task.step_name}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-sm text-foreground/80 hidden lg:table-cell">
                            {task.requester_name}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-center text-xs text-muted-foreground hidden md:table-cell">
                            {formatDate(task.created_at)}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-center">
                            {getStatusBadge(task.status)}
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
                <h3 className="text-xs sm:text-sm font-bold text-foreground/90  tracking-wider flex items-center gap-2">
                  <FileText className="text-blue-500" size={16} />
                  {tTabs("all_audits")}
                </h3>
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold"
                >
                  {auditTotal} {tTable("tasks_count").toLowerCase()}
                </Badge>
              </div>

              <div className="border border-(--surface-border-color) rounded-lg overflow-hidden">
                <Table className="w-full" stickyHeader height="320px">
                  <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10">
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
                            <span className="font-semibold group-hover:text-primary transition-colors">
                              {task.document_record_number}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-2 text-center text-xs text-muted-foreground hidden md:table-cell">
                            {tDocTypes("audit")}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-center text-xs font-medium text-primary hidden lg:table-cell">
                            {task.step_name}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-sm text-foreground/80 hidden lg:table-cell">
                            {task.requester_name}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-center text-xs text-muted-foreground hidden md:table-cell">
                            {formatDate(task.created_at)}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-center">
                            {getStatusBadge(task.status)}
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
        </div>
      )}
    </div>
  );
}
