"use client";

import MyAuditsTable from "./MyAuditsTable";
import AllAuditsTable from "./AllAuditsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuditsPage() {
    return (
        <div className="h-full flex flex-col gap-4">
            <Tabs defaultValue="my-audits" className="flex-1 flex flex-col min-h-0">
                <TabsList className="w-fit bg-card/60 backdrop-blur-md p-1 rounded-md border border-border/50 shadow-sm h-auto">
                    <TabsTrigger value="my-audits" className="px-6 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary/95 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground">
                        Nhiệm vụ của tôi
                    </TabsTrigger>
                    <TabsTrigger value="all-audits" className="px-6 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary/95 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground">
                        Quản lý tất cả
                    </TabsTrigger>
                </TabsList>

                <TabsContent
                    value="my-audits"
                    className="flex-1 mt-0 min-h-0 rounded-lg border border-border/50 shadow-sm overflow-hidden outline-none data-[state=active]:flex flex-col"
                >
                    <MyAuditsTable />
                </TabsContent>

                <TabsContent
                    value="all-audits"
                    className="flex-1 mt-0 min-h-0 rounded-lg border border-border/50 shadow-sm overflow-hidden outline-none data-[state=active]:flex flex-col"
                >
                    <AllAuditsTable />
                </TabsContent>
            </Tabs>
        </div>
    );
}
