"use client";

import { useState } from "react";
import { SummarySection } from "./components/SummarySection";
import MyTasksTable from "./components/MyTasksTable";

export default function MyTasksPage() {
  const [counts] = useState({
    pending: 4, // Mocked from user image
    approved: 16,
    rejected: 0,
  });

  return (
    <div className="h-full flex flex-col gap-4">
      <SummarySection
        pendingCount={counts.pending}
        approvedCount={counts.approved}
        rejectedCount={counts.rejected}
      />
      <MyTasksTable />
    </div>
  );
}
