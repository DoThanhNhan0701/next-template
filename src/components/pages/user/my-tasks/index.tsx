"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux";
import { actionFetchTaskCounts } from "@/redux/slices/task";
import { SummarySection } from "./components/SummarySection";
import MyTasksTable from "./components/MyTasksTable";

export default function MyTasksPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { counts } = useSelector((state: RootState) => state.task);

  useEffect(() => {
    dispatch(actionFetchTaskCounts());
  }, [dispatch]);

  return (
    <div className="h-full flex flex-col gap-4">
      <SummarySection
        pendingCount={counts.PENDING}
        approvedCount={counts.APPROVED}
        rejectedCount={counts.REJECTED}
      />
      <MyTasksTable />
    </div>
  );
}
