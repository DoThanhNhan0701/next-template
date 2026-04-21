import Link from "next/link";

import {
  Box,
  Clock,
  DollarSign,
  ExternalLink,
  Info,
  MapPin,
  ShieldCheck,
  Trash2,
  UserCheck,
  Wrench,
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
  const { mutate: updateAsset, pending: updatePending } = useMutation();

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Stats Bar */}
        <Card className="border-border/40 shadow-sm bg-card/40 backdrop-blur-md rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-6 divide-y lg:divide-y-0 lg:divide-x divide-border/40">
            <StatItem
              icon={<Box className="w-4 h-4 text-slate-400" />}
              label="Registered"
              value={asset.total_quantity}
            />
            <StatItem
              icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
              label="In stock"
              value={asset.in_stock_quantity}
              valueColor="text-emerald-600"
            />
            <StatItem
              icon={<UserCheck className="w-4 h-4 text-blue-500" />}
              label="Dispatch"
              value={asset.allocated_quantity}
              valueColor="text-blue-600"
            />
            <StatItem
              icon={<Clock className="w-4 h-4 text-amber-500" />}
              label="Rented"
              value={asset.rented_quantity}
            />
            <StatItem
              icon={<Wrench className="w-4 h-4 text-rose-400" />}
              label="Maintenance"
              value={asset.maintenance_quantity}
            />
            <StatItem
              icon={<Trash2 className="w-4 h-4 text-red-500" />}
              label="Liquidated"
              value={asset.liquidated_quantity}
            />
          </div>
        </Card>

        {/* Main Grid Layout */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Management Info */}
              <Card className="border-border/40 shadow-sm bg-card/40 backdrop-blur-md rounded-lg">
                <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/10">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                    <Info className="w-4 h-4" />
                    Management info
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 flex flex-col gap-3">
                  <InfoRow
                    icon="📦"
                    label="Asset category"
                    value={asset.category?.name || "-"}
                  />
                  <InfoRow
                    icon="🗂️"
                    label="Catalog group"
                    value={
                      (asset as unknown as { catalog_group_name?: string })
                        .catalog_group_name || "-"
                    }
                  />
                  <InfoRow
                    icon="🏷️"
                    label="Asset group"
                    value={
                      (asset as unknown as { group_name?: string })
                        .group_name || "-"
                    }
                  />
                  <InfoRow
                    icon="🛡️"
                    label="Importance level"
                    value={asset.importance_obj?.name || "-"}
                  />
                  <InfoRow
                    icon="⚡"
                    label="Usage mode"
                    value={asset.usage_mode?.name || "-"}
                  />
                  <InfoRow
                    icon="🏷️"
                    label="Old asset code"
                    value={asset.old_code || "-"}
                    highlight
                  />
                  <InfoRow
                    icon="🏢"
                    label="Managing unit"
                    value={asset.unit?.name || "-"}
                  />
                  <InfoRow
                    icon="👤"
                    label="Current holder"
                    value={asset.holder_name || "-"}
                  />
                  <InfoRow
                    icon="📍"
                    label="Current location"
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
                                Người đang dùng
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
                                Đang cho thuê
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
                                Vị trí hiện tại
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
                    Finance & warranty
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 flex flex-col gap-3">
                  <InfoRow
                    icon="📅"
                    label="Purchase date"
                    value={formatDate(asset.purchase_date)}
                  />
                  <InfoRow
                    icon="🗓️"
                    label="Declaration date"
                    value={formatDate(asset.system_declaration_date)}
                  />
                  <InfoRow
                    icon="💵"
                    label="Original cost"
                    value={
                      asset.cost
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(asset.cost)
                        : "N/A"
                    }
                    bold
                  />
                  <InfoRow
                    icon="📉"
                    label="Depreciation period"
                    value={
                      asset.depreciation_period
                        ? `${asset.depreciation_period} months`
                        : "N/A"
                    }
                  />
                  <InfoRow
                    icon="✅"
                    label="Warranty expiration"
                    value={formatDate(asset.warranty_expiration)}
                  />
                  <InfoRow
                    icon="🏢"
                    label="Supplier"
                    value={asset.supplier?.name || "-"}
                  />

                  <InfoRow
                    icon="🔗"
                    label="Purchase ticket"
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
                    Notes
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
              title="Asset documents & images"
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
    </>
  );
}

function StatItem({
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
