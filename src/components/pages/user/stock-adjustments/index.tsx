"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import StockAdjustmentTable from "./StockAdjustmentTable";

export default function StockAdjustmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const activeTab = searchParams.get("tab") || "increase";

  const onTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="h-full flex flex-col gap-3">
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="w-fit bg-card/60 backdrop-blur-md p-1 rounded-md border border-border/50 h-auto">
          <TabsTrigger
            value="increase"
            className="px-6 py-2 rounded-[6px] text-sm font-medium transition-all data-[state=active]:bg-primary/95 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
          >
            Stock In
          </TabsTrigger>
          <TabsTrigger
            value="decrease"
            className="px-6 py-2 rounded-[6px] text-sm font-medium transition-all data-[state=active]:bg-primary/95 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
          >
            Stock Out
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="increase"
          className="flex-1 mt-0 min-h-0 border border-border/50 overflow-hidden outline-none data-[state=active]:flex flex-col"
        >
          <StockAdjustmentTable defaultType="INCREASE" />
        </TabsContent>

        <TabsContent
          value="decrease"
          className="flex-1 mt-0 min-h-0 border border-border/50 overflow-hidden outline-none data-[state=active]:flex flex-col"
        >
          <StockAdjustmentTable defaultType="DECREASE" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
