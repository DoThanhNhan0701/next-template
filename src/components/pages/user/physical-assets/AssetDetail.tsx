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
  Printer,
  QrCode,
  Wrench,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useDispatch } from "react-redux";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  IAssetStock,
  IPhysicalAssetDetail,
} from "@/types/physical-asset";

import AssetFormModal from "./AssetFormModal";
import PrintQRModal from "./PrintQRModal";
import LifecycleTab from "./lifecycle/LifecycleTab";
import OverviewTab from "./overview/OverviewTab";

const AssetModulesTable = dynamic(() => import("./AssetModulesTable"), {
  ssr: false,
});

export default function AssetDetail({ id }: Readonly<{ id: string }>) {
  const router = useRouter();
  const t = useTranslations("page_physical_assets");
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";
  const [isEditOpen, setIsEditOpen] = useState(false);
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
            {canEdit && (
              <Button onClick={() => setIsEditOpen(true)}>
                {t("detail.edit")}
              </Button>
            )}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          {/* Tabs styled like mockup */}
          <div className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-16 p-1 bg-muted/40 rounded-lg">
              <TabsTrigger
                value="overview"
                className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
              >
                <Info className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("detail.tabs.overview")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("detail.tabs.history")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
              >
                <Wrench className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("detail.tabs.specs")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="docs"
                className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
              >
                <QrCode className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("detail.tabs.docs")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="modules"
                className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
              >
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("detail.tabs.modules")}
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
          {/* Placeholder contents for other tabs */}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2">
                {asset.specifications ? (
                  <div className="rounded-xl border border-border/50 overflow-hidden h-full">
                    <div className="bg-muted/40 px-4 py-1.5 border-b border-border/50 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">
                        {t("detail.specs.title")}
                      </span>
                    </div>
                    <div className="px-4 py-4">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {asset.specifications}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground rounded-xl border border-border/50 bg-muted/10 h-full flex items-center justify-center">
                    {t("detail.specs.no_specs")}
                  </div>
                )}
              </div>
              <div className="lg:col-span-1">
                <Card className="border-border/40 shadow-sm bg-card/40 backdrop-blur-md rounded-lg h-full flex flex-col">
                  <CardHeader className="py-4 flex-none items-center justify-center border-b border-border/40">
                    <CardTitle className="text-sm font-semibold text-foreground/70">
                      {t("detail.specs.model_image")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 flex-1 flex flex-col">
                    <div className="aspect-square bg-muted/20 rounded-lg flex items-center justify-center border border-border/20 mb-6 max-h-62.5">
                      <Box className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-0.5 border-t border-border/20 pt-3">
                        <span className="text-sm text-muted-foreground">
                          {t("detail.specs.model")}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {asset.model || "—"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 border-t border-border/20 pt-3">
                        <span className="text-sm text-muted-foreground">
                          {t("detail.specs.serial_number")}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {asset.serial_number || "—"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 border-t border-border/20 pt-3">
                        <span className="text-sm text-muted-foreground">
                          {t("detail.specs.management_type")}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {asset.management_type || "—"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 border-t border-border/20 pt-3">
                        <span className="text-sm text-muted-foreground">
                          {t("detail.specs.quantity")}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {asset.quantity ?? "—"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent
            value="docs"
            className="mt-3 outline-none focus-visible:ring-0"
          >
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("detail.docs.qr_title")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("detail.docs.qr_description", { code: asset.asset_code })}
                </p>
              </div>
              <div
                id="qr-print-area"
                className="flex gap-3 items-center p-6 bg-white rounded-xl border border-border/60 shadow-sm max-w-lg"
              >
                {/* QR Code */}
                <div className="shrink-0">
                  <QRCodeSVG value={asset.asset_code} size={160} level="H" />
                </div>

                {/* Info */}
                <div className="flex flex-col gap-3 flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5 pb-3 border-b border-gray-100">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                      {t("detail.docs.preview.code")}
                    </span>
                    <span className="font-mono text-base font-bold text-gray-900 tracking-wider">
                      {asset.asset_code}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 pb-3 border-b border-gray-100">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                      {t("detail.docs.preview.owner")}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {holders?.[0]?.name || "—"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 pb-3 border-b border-gray-100">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                      {t("detail.docs.preview.importance")}
                    </span>
                    {asset.importance_obj ? (
                      <span
                        className="text-sm font-bold w-fit"
                        style={{ color: asset.importance_obj.color }}
                      >
                        {asset.importance_obj.name}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-gray-800">
                        —
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 text-center">
                    RAINSCALES VIETNAM JSC.
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setIsPrintModalOpen(true)}
              >
                <Printer className="w-4 h-4" />
                {t("detail.docs.print_qr")}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="modules" className="mt-0">
            <AssetModulesTable assetId={asset.id} />
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
