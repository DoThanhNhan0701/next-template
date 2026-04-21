"use client";

import { useEffect } from "react";

import { useDispatch } from "react-redux";

import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { updateCount } from "@/redux/slices/task";
import { IAuditSession } from "@/types/audit";
import { ITask } from "@/types/task";

import MyTasksTable from "./components/MyTasksTable";
import { SummarySection } from "./components/SummarySection";

export default function MyTasksPage() {
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

  const getAuditCount = (status: string) => {
    return (audits || []).filter((a) => {
      if (status === "PENDING") {
        return (
          a.status_obj?.code === "PENDING" || a.status_obj?.code === "COMPLETED"
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
  }, [pendingCount, dispatch]);

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
