"use client";

import { Suspense, useMemo } from "react";
import { useSelector } from "react-redux";

import { RootState } from "@/redux";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { ITask } from "@/types/task";
import { IAuditSession } from "@/types/audit";

import AllTasksTable from "./components/AllTasksTable";
import { AllSummarySection } from "./components/AllSummarySection";
import { getAllAuditDerivedStatus } from "./utils";

function AllTasksContent() {
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch workflow counts
  const { response: pendingWorkflows } = useGet<{ items: ITask[] }>({
    url: `${endpoints.WORKFLOW_TASKS}all?status=PENDING`,
  });
  const { response: approvedWorkflows } = useGet<{ items: ITask[] }>({
    url: `${endpoints.WORKFLOW_TASKS}all?status=APPROVED`,
  });
  const { response: rejectedWorkflows } = useGet<{ items: ITask[] }>({
    url: `${endpoints.WORKFLOW_TASKS}all?status=REJECTED`,
  });

  // Fetch all audit sessions
  const { response: auditsRes, pending: auditsPending } = useGet<
    IAuditSession[] | { items: IAuditSession[]; total?: number }
  >({
    url: endpoints.AUDIT_SESSIONS,
  });

  const rawAudits = useMemo(() => {
    if (!auditsRes) return [];
    return Array.isArray(auditsRes) ? auditsRes : auditsRes.items || [];
  }, [auditsRes]);

  const counts = useMemo(() => {
    const pendingCount = (pendingWorkflows?.items || []).filter(
      (task) => task.document_type !== "audit"
    ).length;
    const approvedCount = (approvedWorkflows?.items || []).filter(
      (task) => task.document_type !== "audit"
    ).length;
    const rejectedCount = (rejectedWorkflows?.items || []).filter(
      (task) => task.document_type !== "audit"
    ).length;

    const auditCounts = { PENDING: 0, PENDING_APPROVAL: 0, APPROVED: 0, REJECTED: 0 };
    rawAudits.forEach((audit) => {
      const status = getAllAuditDerivedStatus(audit, user);
      if (status in auditCounts) {
        auditCounts[status as keyof typeof auditCounts]++;
      }
    });

    return {
      processing: pendingCount + auditCounts.PENDING,
      pendingApproval: auditCounts.PENDING_APPROVAL,
      history: approvedCount + rejectedCount + auditCounts.APPROVED + auditCounts.REJECTED,
    };
  }, [pendingWorkflows, approvedWorkflows, rejectedWorkflows, rawAudits, user]);

  return (
    <div className="h-full flex flex-col gap-3">
      <AllSummarySection
        processingCount={counts.processing}
        pendingApprovalCount={counts.pendingApproval}
        historyCount={counts.history}
      />
      <AllTasksTable rawAudits={rawAudits} isAuditPending={auditsPending} />
    </div>
  );
}

export default function AllTasksPage() {
  return (
    <Suspense fallback={null}>
      <AllTasksContent />
    </Suspense>
  );
}
