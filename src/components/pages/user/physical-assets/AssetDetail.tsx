"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  Box,
  Clock,
  Info,
  Package,
  QrCode,
  ShieldCheck,
  Trash2,
  UserCheck,
  Wrench,
} from "lucide-react";
import { useDispatch } from "react-redux";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dynamicEndpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { usePermissions } from "@/hooks/usePermissions";
import { AppDispatch } from "@/redux";
import { openAllocation } from "@/redux/slices/allocation";
import { openRecovery } from "@/redux/slices/recovery";
import { openRental } from "@/redux/slices/rental";
import {
  IAssetHolder,
  IAssetModule,
  IAssetStock,
  ICloneResponse,
  IPhysicalAssetDetail,
} from "@/types/physical-asset";

import PrintQRModal from "./docs/PrintQRModal";
import LifecycleTab from "./lifecycle/LifecycleTab";
import AssetFormModal from "./modals/AssetFormModal";
import CloneAssetModal from "./modals/CloneAssetModal";
import CloneSuccessModal from "./modals/CloneSuccessModal";
import OverviewTab, { StatItem } from "./overview/OverviewTab";

const AssetModulesTable = dynamic(() => import("./modules/AssetModulesTable"), {
  ssr: false,
});

const SpecsTab = dynamic(() => import("./specs/SpecsTab"), {
  ssr: false,
});

const DocsTab = dynamic(() => import("./docs/DocsTab"), {
  ssr: false,
});

export default function AssetDetail({ id }: Readonly<{ id: string }>) {
  const router = useRouter();
  const t = useTranslations("page_physical_assets");
  const t2 = useTranslations("page_physical_assets.overview");
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [clonedData, setClonedData] = useState<ICloneResponse | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("asset:edit");

  const handleDispatch = () => {
    if (!asset) return;
    dispatch(
      openAllocation({
        asset_id: asset.id,
        location_id: asset.location_id ?? 0,
        unit_id: asset.unit_id ?? 0,
        reason: t("detail.reasons.allocation", { name: asset.name }),
      }),
    );
    router.push("/allocation-recovery");
  };

  const handleRecovery = () => {
    if (!asset) return;
    dispatch(
      openRecovery({
        asset_id: asset.id,
        location_id: asset.location_id ?? 0,
        unit_id: asset.unit_id ?? 0,
        reason: t("detail.reasons.recovery", { name: asset.name }),
      }),
    );
    router.push("/allocation-recovery?tab=recoveries");
  };

  const handleRental = () => {
    if (!asset) return;
    dispatch(
      openRental({
        asset_id: asset.id,
        location_id: asset.location_id ?? 0,
        unit_id: asset.unit_id ?? 0,
        reason: t("detail.reasons.rental", { name: asset.name }),
      }),
    );
    router.push("/rentals");
  };

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const {
    response: asset,
    pending,
    reFetch,
  } = useGet<IPhysicalAssetDetail>(
    {
      url: dynamicEndpoints.PHYSICAL_ASSET_DETAIL(Number(id)),
    },
    {
      staleTime: 0,
    },
  );

  const { response: holders } = useGet<IAssetHolder[]>(
    { url: dynamicEndpoints.PHYSICAL_ASSET_HOLDERS(Number(id)) },
    { deps: [Number(id)] },
  );

  const { response: stocks } = useGet<IAssetStock[]>(
    { url: dynamicEndpoints.PHYSICAL_ASSET_STOCK(Number(id)) },
    { deps: [Number(id)] },
  );
  const {
    response: modules = [],
    pending: modulesPending,
    reFetch: modulesReFetch,
  } = useGet<IAssetModule[]>(
    { url: dynamicEndpoints.PHYSICAL_ASSET_MODULES(Number(id)) },
    { deps: [Number(id)] },
  );

  if (pending) {
    return (
      <div className="p-3 flex flex-col gap-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-100 w-full" />
      </div>
    );
  }

  if (!asset) return null;

  return (
    <>
      <div className="w-full h-full flex flex-col gap-3 px-3 pb-3 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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
                    ? t("modals.fields.bulk")
                    : t("modals.fields.unique")}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <QrCode className="w-3.5 h-3.5" />
                <span>
                  {t("detail.id")}{" "}
                  <strong className="text-foreground">
                    {asset.asset_code}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <Button variant="outline" onClick={handleRental}>
              {t("detail.rentals")}
            </Button>
            <Button variant="outline" onClick={handleDispatch}>
              {t("detail.allocation")}
            </Button>
            <Button variant="outline" onClick={handleRecovery}>
              {t("detail.recovery")}
            </Button>
            {asset.management_type === "unique" && (
              <Button
                variant="outline"
                onClick={() => setIsCloneModalOpen(true)}
              >
                {t("detail.clone")}
              </Button>
            )}
            {canEdit && (
              <Button onClick={() => setIsEditOpen(true)}>
                {t("detail.edit")}
              </Button>
            )}
          </div>
        </div>

        <Card className="border-border/40 shadow-sm bg-card/40 backdrop-blur-md rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y md:divide-y lg:divide-y-0 lg:divide-x divide-border/40">
            <StatItem
              icon={<Box className="w-4 h-4 text-slate-400" />}
              label={t2("stats.registered")}
              value={asset.total_quantity}
            />
            <StatItem
              icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
              label={t2("stats.in_stock")}
              value={asset.in_stock_quantity}
              valueColor="text-emerald-600"
            />
            <StatItem
              icon={<UserCheck className="w-4 h-4 text-blue-500" />}
              label={t2("stats.allocation")}
              value={asset.allocated_quantity}
              valueColor="text-blue-600"
            />
            <StatItem
              icon={<Clock className="w-4 h-4 text-amber-500" />}
              label={t2("stats.rented")}
              value={asset.rented_quantity}
            />
            <StatItem
              icon={<Wrench className="w-4 h-4 text-rose-400" />}
              label={t2("stats.maintenance")}
              value={asset.maintenance_quantity}
            />
            <StatItem
              icon={<Trash2 className="w-4 h-4 text-red-500" />}
              label={t2("stats.liquidated")}
              value={asset.liquidated_quantity}
            />
          </div>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="w-full pb-3">
            <TabsList className="grid w-full grid-cols-5 h-14 sm:h-16 p-1 bg-muted/40 rounded-lg">
              <TabsTrigger
                value="overview"
                className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:block text-sm font-medium">
                  {t("detail.tabs.overview")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="modules"
                className="relative flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:block text-sm font-medium">
                  {t("detail.tabs.modules")}
                </span>
                {modules && modules.length > 0 && (
                  <Badge
                    variant="outline"
                    className="absolute top-1 right-1 font-medium text-xs w-5 h-5 flex items-center justify-center rounded-full bg-red-600 text-white leading-none"
                  >
                    {modules.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:block text-sm font-medium">
                  {t("detail.tabs.history")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
              >
                <Wrench className="w-4 h-4" />
                <span className="hidden sm:block text-sm font-medium">
                  {t("detail.tabs.specs")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="docs"
                className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:block text-sm font-medium">
                  {t("detail.tabs.docs")}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="overview"
            className="mt-3 flex flex-col gap-3 outline-none focus-visible:ring-0"
          >
            <OverviewTab
              holders={holders ?? []}
              stocks={stocks ?? []}
              asset={asset}
              onUpdate={reFetch}
            />
          </TabsContent>
          <TabsContent value="modules" className="mt-3">
            <AssetModulesTable
              modules={modules ?? []}
              pending={modulesPending}
              reFetch={modulesReFetch}
              assetId={asset.id}
            />
          </TabsContent>
          <TabsContent
            value="history"
            className="pt-2 outline-none focus-visible:ring-0 h-[70svh]"
          >
            <LifecycleTab assetId={Number(id)} />
          </TabsContent>
          <TabsContent
            value="specs"
            className="mt-3 outline-none focus-visible:ring-0"
          >
            <SpecsTab asset={asset} />
          </TabsContent>
          <TabsContent
            value="docs"
            className="mt-3 outline-none focus-visible:ring-0"
          >
            <DocsTab
              asset={asset}
              holders={holders ?? []}
              onPrintQR={() => setIsPrintModalOpen(true)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {asset && (
        <AssetFormModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          assetToEdit={
            asset as unknown as import("@/types/physical-asset").IPhysicalAsset
          }
          onSuccess={() => {
            setIsEditOpen(false);
            reFetch();
          }}
        />
      )}

      {asset && (
        <CloneAssetModal
          isOpen={isCloneModalOpen}
          onClose={() => setIsCloneModalOpen(false)}
          assetId={asset.id}
          initialLocationId={asset.location_id}
          onSuccess={(res) => {
            setClonedData(res as ICloneResponse);
            setIsSuccessModalOpen(true);
          }}
        />
      )}

      <CloneSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        data={clonedData}
      />

      {asset && (
        <PrintQRModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          assetCode={asset.asset_code}
          assetId={asset.id}
          holders={holders ?? []}
          importanceLevel={asset.importance_obj}
        />
      )}
    </>
  );
}
