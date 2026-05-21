"use client";

import { useEffect, useMemo } from "react";

import { useDispatch, useSelector } from "react-redux";

import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { RootState } from "@/redux";
import { updateCount } from "@/redux/slices/task";
import { IAuditSession } from "@/types/audit";
import { ITask } from "@/types/task";

import MyTasksTable from "./components/MyTasksTable";
import { SummarySection } from "./components/SummarySection";

export default function MyTasksPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { response: pendingTasks } = useGet<ITask[]>({
    url: `${endpoints.WORKFLOW_TASKS}me?status=PENDING`,
  });
  const { response: approvedTasks } = useGet<ITask[]>({
    url: `${endpoints.WORKFLOW_TASKS}me?status=APPROVED`,
  });
  const { response: rejectedTasks } = useGet<ITask[]>({
    url: `${endpoints.WORKFLOW_TASKS}me?status=REJECTED`,
  });
  const { response: audits } = useGet<IAuditSession[]>({
    url: endpoints.AUDIT_MY_AUDITS,
  });
  const { response: pendingApprovalAudits } = useGet<IAuditSession[]>({
    url: endpoints.AUDIT_PENDING_APPROVAL,
  });

  const allAudits = useMemo(() => {
    const combined = [...(audits || []), ...(pendingApprovalAudits || [])];
    const uniqueMap = new Map<number, IAuditSession>();
    combined.forEach((a) => uniqueMap.set(a.id, a));
    return Array.from(uniqueMap.values());
  }, [audits, pendingApprovalAudits]);

  const getAuditCount = (status: string) => {
    return allAudits.filter((a) => {
      if (status === "PENDING") {
        return (
          a.status_obj?.code === "PENDING" ||
          (a.status_obj?.code === "COMPLETED" && a.assignee_id !== user?.id)
        );
      }
      if (status === "APPROVED") {
        return (
          a.status_obj?.code === "APPROVED" ||
          (a.status_obj?.code === "COMPLETED" && a.assignee_id === user?.id)
        );
      }
      return a.status_obj?.code === status;
    }).length;
  };

  const pendingCount = (pendingTasks?.length || 0) + getAuditCount("PENDING");
  const approvedCount =
    (approvedTasks?.length || 0) + getAuditCount("APPROVED");
  const rejectedCount =
    (rejectedTasks?.length || 0) + getAuditCount("REJECTED");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateCount({ status: "PENDING", count: pendingCount }));
    dispatch(updateCount({ status: "APPROVED", count: approvedCount }));
    dispatch(updateCount({ status: "REJECTED", count: rejectedCount }));
  }, [pendingCount, approvedCount, rejectedCount, dispatch]);

  return (
    <div className="h-full flex flex-col gap-3">
      <SummarySection
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
      />
      <MyTasksTable />
    </div>
  );
}
