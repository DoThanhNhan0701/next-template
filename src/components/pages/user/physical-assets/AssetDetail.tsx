"use client";

import { useGet } from "@/hooks/useGet";
import { dynamicEndpoints } from "@/config/endpoints";
import { IPhysicalAssetDetail } from "@/types/physical-asset";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Clock, Wrench, Info, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import LifecycleTab from "./lifecycle/LifecycleTab";
import OverviewTab from "./overview/OverviewTab";

export default function AssetDetail({ id }: Readonly<{ id: string }>) {
  const router = useRouter();
  const { response: asset, pending } = useGet<IPhysicalAssetDetail>({
    url: dynamicEndpoints.PHYSICAL_ASSET_DETAIL(Number(id)),
  });

  if (pending) {
    return (
      <div className="p-4 flex flex-col gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-100 w-full" />
      </div>
    );
  }

  if (!asset) return null;

  return (
    <div className="w-full h-full flex flex-col gap-4 px-4 py-3 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="rounded shadow-sm shrink-0 border-border/50 w-8 h-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                {asset.name}
              </h1>
              {asset.status_obj && (
                <Badge
                  variant="outline"
                  className="font-medium text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: `${asset.status_obj.color}1a`,
                    color: asset.status_obj.color,
                    borderColor: `${asset.status_obj.color}40`,
                  }}
                >
                  {asset.status_obj.name}
                </Badge>
              )}
              <Badge
                variant="outline"
                className="font-medium text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              >
                {asset.management_type === "bulk"
                  ? "Bulk management"
                  : "Unique management"}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <QrCode className="w-3.5 h-3.5" />
              <span>
                ID:{" "}
                <strong className="text-foreground">{asset.asset_code}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <Button className="gap-1.5 bg-primary/90 hover:bg-primary text-white shadow-sm text-sm h-8 px-3">
            <Edit className="w-4 h-4" />
            Edit profile
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        {/* Tabs styled like mockup */}
        <div className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-16 p-1 bg-muted/40 rounded-lg">
            <TabsTrigger
              value="overview"
              className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
            >
              <Info className="w-4 h-4" />
              <span className="text-sm font-medium">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Lifecycle history</span>
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
            >
              <Wrench className="w-4 h-4" />
              <span className="text-sm font-medium">Specifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="docs"
              className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
            >
              <QrCode className="w-4 h-4" />
              <span className="text-sm font-medium">Documents & QR</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="overview"
          className="mt-4 flex flex-col gap-4 outline-none focus-visible:ring-0"
        >
          <OverviewTab asset={asset} />
        </TabsContent>
        {/* Placeholder contents for other tabs */}
        <TabsContent
          value="history"
          className="pt-2 flex-1 outline-none focus-visible:ring-0"
        >
          <LifecycleTab assetId={Number(id)} />
        </TabsContent>
        <TabsContent
          value="specs"
          className="mt-4 outline-none focus-visible:ring-0"
        >
          {asset.specifications ? (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <div className="bg-muted/40 px-4 py-3 border-b border-border/50 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Technical Specifications</span>
              </div>
              <div className="px-4 py-4">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{asset.specifications}</p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No technical specifications available.
            </div>
          )}
        </TabsContent>
        <TabsContent
          value="docs"
          className="p-8 text-center text-sm text-muted-foreground"
        >
          No QR documents available.
        </TabsContent>
      </Tabs>
    </div>
  );
}
