"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useSelector } from "react-redux";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RootState } from "@/redux";

import AllocationSummaryTable from "./AllocationSummaryTable";
import RecoverySummaryTable from "./RecoverySummaryTable";

export default function AllocationRecoveryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read tab from URL, fallback to Redux state if recovery is open
  const { isOpen: isRecoveryOpen } = useSelector(
    (state: RootState) => state.recovery,
  );
  const urlTab = searchParams.get("tab");
  const activeTab = urlTab ?? (isRecoveryOpen ? "recoveries" : "allocations");

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="h-full flex flex-col gap-3">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="w-fit bg-card/60 backdrop-blur-md p-1 rounded-md border border-border/50 h-auto">
          <TabsTrigger
            value="allocations"
            className="px-6 py-2 rounded-[6px] text-sm font-medium transition-all data-[state=active]:bg-primary/95 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
          >
            Allocation
          </TabsTrigger>
          <TabsTrigger
            value="recoveries"
            className="px-6 py-2 rounded-[6px] text-sm font-medium transition-all data-[state=active]:bg-primary/95 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
          >
            Recovery
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="allocations"
          className="flex-1 mt-0 min-h-0 border border-border/50 overflow-hidden outline-none data-[state=active]:flex flex-col"
        >
          <AllocationSummaryTable />
        </TabsContent>

        <TabsContent
          value="recoveries"
          className="flex-1 mt-0 min-h-0 border border-border/50 overflow-hidden outline-none data-[state=active]:flex flex-col"
        >
          <RecoverySummaryTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
