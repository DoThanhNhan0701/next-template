"use client";

import AllocationSummaryTable from "./AllocationSummaryTable";
import RecoverySummaryTable from "./RecoverySummaryTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SummaryPage() {
  return (
    <div className="h-full flex flex-col gap-4">
      <Tabs defaultValue="allocations" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-fit bg-card/60 backdrop-blur-md p-1 rounded-md border border-border/50 shadow-sm h-auto">
          <TabsTrigger value="allocations" className="px-6 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary/95 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground">
            Dispatch
          </TabsTrigger>
          <TabsTrigger value="recoveries" className="px-6 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary/95 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground">
            Recovery
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="allocations"
          className="flex-1 mt-0 min-h-0 rounded-lg border border-border/50 shadow-sm overflow-hidden outline-none data-[state=active]:flex flex-col"
        >
          <AllocationSummaryTable />
        </TabsContent>

        <TabsContent
          value="recoveries"
          className="flex-1 mt-0 min-h-0 rounded-lg border border-border/50 shadow-sm overflow-hidden outline-none data-[state=active]:flex flex-col"
        >
          <RecoverySummaryTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
