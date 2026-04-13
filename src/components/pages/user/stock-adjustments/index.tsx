"use client";

import StockAdjustmentTable from "./StockAdjustmentTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StockAdjustmentsPage() {
  return (
    <div className="h-full flex flex-col gap-4">
      <Tabs defaultValue="increase" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-fit bg-card/60 backdrop-blur-md p-1 rounded-md border border-border/50 shadow-sm h-auto">
          <TabsTrigger
            value="increase"
            className="px-6 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary/95 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
          >
            Increase (Nhập kho)
          </TabsTrigger>
          <TabsTrigger
            value="decrease"
            className="px-6 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary/95 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
          >
            Decrease (Xuất kho)
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="increase"
          className="flex-1 mt-0 min-h-0 rounded-lg border border-border/50 shadow-sm overflow-hidden outline-none data-[state=active]:flex flex-col"
        >
          <StockAdjustmentTable defaultType="INCREASE" />
        </TabsContent>

        <TabsContent
          value="decrease"
          className="flex-1 mt-0 min-h-0 rounded-lg border border-border/50 shadow-sm overflow-hidden outline-none data-[state=active]:flex flex-col"
        >
          <StockAdjustmentTable defaultType="DECREASE" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
