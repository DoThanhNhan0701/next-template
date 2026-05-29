"use client";

import { useEffect, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "@/redux";
import { actionFetchTaskCounts } from "@/redux/slices/task";

import MyTasksTable from "./components/MyTasksTable";
import { SummarySection } from "./components/SummarySection";

function MyTasksContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { counts } = useSelector((state: RootState) => state.task);

  useEffect(() => {
    dispatch(actionFetchTaskCounts());
  }, [dispatch]);

  return (
    <div className="h-full flex flex-col gap-3">
      <SummarySection
        processingCount={counts.PENDING}
        pendingApprovalCount={counts.PENDING_APPROVAL}
        historyCount={counts.APPROVED + counts.REJECTED}
      />
      <MyTasksTable />
    </div>
  );
}

export default function MyTasksPage() {
  return (
    <Suspense fallback={null}>
      <MyTasksContent />
    </Suspense>
  );
}
