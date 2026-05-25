"use client";

import { useTranslations } from "next-intl";
import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { IAssetHolder, IPhysicalAssetDetail } from "@/types/physical-asset";

interface DocsTabProps {
  asset: IPhysicalAssetDetail;
  holders: IAssetHolder[];
  onPrintQR: () => void;
}

export default function DocsTab({ asset, holders, onPrintQR }: DocsTabProps) {
  const t = useTranslations("page_physical_assets");

  return (
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
          <QRCodeSVG
            value={`${window.location.origin}/assets/${asset.id}`}
            size={160}
            level="H"
          />
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
              <span className="text-sm font-semibold text-gray-800">—</span>
            )}
          </div>
          <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 text-center">
            RAINSCALES VIETNAM JSC.
          </span>
        </div>
      </div>
      <Button variant="outline" size="sm" className="gap-2" onClick={onPrintQR}>
        <Printer className="w-4 h-4" />
        {t("detail.docs.print_qr")}
      </Button>
    </div>
  );
}
