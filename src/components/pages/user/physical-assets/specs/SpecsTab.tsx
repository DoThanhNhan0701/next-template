"use client";

import { useTranslations } from "next-intl";
import { Box, Wrench } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IPhysicalAssetDetail } from "@/types/physical-asset";

interface SpecsTabProps {
  asset: IPhysicalAssetDetail;
}

export default function SpecsTab({ asset }: SpecsTabProps) {
  const t = useTranslations("page_physical_assets");

  return (
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
  );
}
