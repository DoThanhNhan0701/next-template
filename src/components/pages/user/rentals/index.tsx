"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import RentalReturnTable from "./RentalReturnTable";
import RentalsTable from "./RentalsTable";

export default function RentalsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlTab = searchParams.get("tab");
  const activeTab = urlTab ?? "rentals";

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
        <TabsList className="w-fit bg-card/60 backdrop-blur-md p-1 rounded-md border border-border/50 shadow-sm h-auto">
          <TabsTrigger
            value="rentals"
            className="px-6 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary/95 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
          >
            Phiếu cho thuê
          </TabsTrigger>
          <TabsTrigger
            value="returns"
            className="px-6 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary/95 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
          >
            Biên bản hoàn trả
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="rentals"
          className="flex-1 mt-0 min-h-0 rounded-lg border border-border/50 shadow-sm overflow-hidden outline-none data-[state=active]:flex flex-col"
        >
          <RentalsTable />
        </TabsContent>

        <TabsContent
          value="returns"
          className="flex-1 mt-0 min-h-0 rounded-lg border border-border/50 shadow-sm overflow-hidden outline-none data-[state=active]:flex flex-col"
        >
          <RentalReturnTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
