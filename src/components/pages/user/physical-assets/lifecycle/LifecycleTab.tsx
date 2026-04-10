import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dynamicEndpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { ILifecycleLog } from "@/types/physical-asset";
import BusinessProcessTab from "./BusinessProcessTab";
import SystemLogTab from "./SystemLogTab";

interface LifecycleTabProps {
  assetId: number;
}

export default function LifecycleTab({ assetId }: Readonly<LifecycleTabProps>) {
  const { response: data } = useGet<{
    change_log?: ILifecycleLog[];
    process_history?: ILifecycleLog[];
  }>({
    url: dynamicEndpoints.PHYSICAL_ASSET_LIFECYCLE(assetId),
  });

  const processHistory = data?.process_history || [];
  const changeLog = data?.change_log || [];
  return (
    <div className="mt-2 h-full">
      <Tabs defaultValue="process" className="w-full h-full">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground/80">
            Lịch sử biến động
          </p>
          <TabsList className="bg-muted/40 p-1 rounded-md h-auto gap-1 border border-border/20 shadow-sm">
            <TabsTrigger
              value="process"
              className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded text-xs font-semibold px-4 py-2 hover:bg-muted/60 transition-colors"
            >
              Quy trình nghiệp vụ
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded text-xs font-semibold px-4 py-2 hover:bg-muted/60 transition-colors"
            >
              Nhật ký hệ thống
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="process" className="m-0 border-none outline-none">
          <BusinessProcessTab history={processHistory} />
        </TabsContent>
        <TabsContent value="system" className="m-0 border-none outline-none flex-1">
          <SystemLogTab logs={changeLog} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
