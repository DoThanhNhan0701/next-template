import { useTranslations } from "next-intl";
import Link from "next/link";

import {
  Clock,
  DollarSign,
  ExternalLink,
  Info,
  MapPin,
  UserCheck,
} from "lucide-react";

import { RecordAttachmentsCard } from "@/components/common/RecordAttachmentsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dynamicEndpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { cn } from "@/lib/utils";
import {
  IAssetHolder,
  IAssetStock,
  IPhysicalAssetDetail,
} from "@/types/physical-asset";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { formatDate } from "@/utils/date";
import { formatNumberWithCommas } from "@/utils/number";

export default function OverviewTab({
  asset,
  onUpdate,
  holders,
  stocks,
}: Readonly<{
  asset: IPhysicalAssetDetail;
  onUpdate?: () => void;
  holders: IAssetHolder[];
  stocks: IAssetStock[];
}>) {
  const t = useTranslations("page_physical_assets.overview");
  const { mutate: updateAsset, pending: updatePending } = useMutation();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Management Info */}
            <Card className="border-border/40 shadow-sm bg-card/40 backdrop-blur-md rounded-lg">
              <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/10">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                  <Info className="w-4 h-4" />
                  {t("management_info")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 flex flex-col gap-3">
                <InfoRow
                  icon="📦"
                  label={t("fields.category")}
                  value={asset.category?.name || "-"}
                />
                <InfoRow
                  icon="🗂️"
                  label={t("fields.catalog_group")}
                  value={
                    (asset as unknown as { catalog_group_name?: string })
                      .catalog_group_name || "-"
                  }
                />
                <InfoRow
                  icon="🏷️"
                  label={t("fields.asset_group")}
                  value={
                    (asset as unknown as { group_name?: string }).group_name ||
                    "-"
                  }
                />
                <InfoRow
                  icon="🛡️"
                  label={t("fields.importance")}
                  value={asset.importance_obj?.name || "-"}
                />
                <InfoRow
                  icon="⚡"
                  label={t("fields.usage_mode")}
                  value={asset.usage_mode?.name || "-"}
                />
                <InfoRow
                  icon="🏷️"
                  label={t("fields.old_code")}
                  value={asset.old_code || "-"}
                  highlight
                />
                <InfoRow
                  icon="🏢"
                  label={t("fields.unit")}
                  value={asset.unit?.name || "-"}
                />
                <InfoRow
                  icon="👤"
                  label={t("fields.holder")}
                  value={asset.holder_name || "-"}
                />
                <InfoRow
                  icon="📍"
                  label={t("fields.location")}
                  value={asset.location_obj?.name || "-"}
                />
                {(holders.length > 0 || stocks.length > 0) &&
                  (() => {
                    const userHolders = holders.filter(
                      (h) => h.type === "user",
                    );
                    const customerHolders = holders.filter(
                      (h) => h.type === "customer",
                    );
                    return (
                      <div className="flex flex-col gap-3 border-t border-border/30 pt-4">
                        {userHolders.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground tracking-wider">
                              <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                              {t("holders.current_users")}
                            </div>
                            <div className="flex flex-col gap-1">
                              {userHolders.map((h, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between bg-blue-500/5 rounded-lg px-2.5 py-1.5 border border-blue-500/15"
                                >
                                  <span className="text-sm font-medium text-foreground">
                                    {h.name}
                                  </span>
                                  <span className="text-xs font-bold bg-blue-500/15 text-blue-600 px-2 py-0.5 rounded-full min-w-[28px] text-center">
                                    {h.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {customerHolders.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground tracking-wider">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              {t("holders.currently_rented")}
                            </div>
                            <div className="flex flex-col gap-1">
                              {customerHolders.map((h, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between bg-amber-500/5 rounded-lg px-2.5 py-1.5 border border-amber-500/15"
                                >
                                  <span className="text-sm font-medium text-foreground">
                                    {h.name}
                                  </span>
                                  <span className="text-xs font-bold bg-amber-500/15 text-amber-600 px-2 py-0.5 rounded-full min-w-[28px] text-center">
                                    {h.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {stocks.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground tracking-wider">
                              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                              {t("holders.current_locations")}
                            </div>
                            <div className="flex flex-col gap-1">
                              {stocks.map((s, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between bg-emerald-500/5 rounded-lg px-2.5 py-1.5 border border-emerald-500/15"
                                >
                                  <span className="text-sm font-medium text-foreground">
                                    [{s.location_code}] {s.location_name}
                                  </span>
                                  <span className="text-xs font-bold bg-emerald-500/15 text-emerald-600 px-2 py-0.5 rounded-full min-w-[28px] text-center">
                                    {s.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </CardContent>
            </Card>

            {/* Financial & Warranty */}
            <Card className="border-border/40 shadow-sm bg-card/40 backdrop-blur-md rounded-lg">
              <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/10">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                  <DollarSign className="w-4 h-4" />
                  {t("finance.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 flex flex-col gap-3">
                <InfoRow
                  icon="📅"
                  label={t("finance.purchase_date")}
                  value={formatDate(asset.purchase_date)}
                />
                <InfoRow
                  icon="🗓️"
                  label={t("finance.declaration_date")}
                  value={formatDate(asset.system_declaration_date)}
                />
                <InfoRow
                  icon="💵"
                  label={t("finance.cost")}
                  value={formatNumberWithCommas(asset.cost)}
                  bold
                />
                <InfoRow
                  icon="📉"
                  label={t("finance.depreciation")}
                  value={
                    asset.depreciation_period
                      ? t("finance.months", {
                          count: asset.depreciation_period,
                        })
                      : "N/A"
                  }
                />
                <InfoRow
                  icon="✅"
                  label={t("finance.warranty")}
                  value={formatDate(asset.warranty_expiration)}
                />
                <InfoRow
                  icon="🏢"
                  label={t("finance.supplier")}
                  value={asset.supplier?.name || "-"}
                />

                <InfoRow
                  icon="🔗"
                  label={t("finance.purchase_ticket")}
                  type="link"
                  value={asset.purchase_ticket || "-"}
                />
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {asset.notes && (
            <Card className="border-border/40 shadow-sm bg-card/40 backdrop-blur-md rounded-lg">
              <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/10">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                  <Info className="w-4 h-4" />
                  {t("notes")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {asset.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Attachments Section */}
          <RecordAttachmentsCard
            title={t("attachments")}
            initialAttachments={asset.attachments}
            isPending={updatePending}
            onSave={async (newAttachments) => {
              await updateAsset(
                {
                  url: dynamicEndpoints.PHYSICAL_ASSET_DETAIL(asset.id),
                  method: "patch",
                  body: { attachments: newAttachments },
                },
                {
                  onSuccess: (res) => {
                    getApiSuccessMessage(res);
                    onUpdate?.();
                  },
                  onError: (err) => {
                    getApiErrorMessage(err);
                    throw err;
                  },
                },
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function StatItem({
  icon,
  label,
  value,
  valueColor = "text-foreground",
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: number;
  valueColor?: string;
}>) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors">
      <div className="shrink-0 w-8 h-8 rounded-full bg-background shadow-sm border border-border/30 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col gap-0">
        <span className="text-sm text-muted-foreground/80 font-medium">
          {label}
        </span>
        <span
          className={cn("text-base font-semibold leading-tight", valueColor)}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  highlight = false,
  bold = false,
  type = "text",
}: Readonly<{
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
  bold?: boolean;
  type?: "text" | "link";
}>) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-center gap-2 py-0.5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-base opacity-70 w-5 flex justify-center">
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      <div className="min-w-0">
        {type === "link" ? (
          <Link
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1 truncate max-w-[400px]"
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span className="truncate">{value}</span>
          </Link>
        ) : (
          <span
            className={cn(
              "text-sm leading-tight wrap-break-word",
              highlight
                ? "font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded"
                : bold
                  ? "font-semibold text-primary"
                  : "text-foreground/90",
            )}
          >
            {value}
          </span>
        )}
      </div>
    </div>
  );
}
