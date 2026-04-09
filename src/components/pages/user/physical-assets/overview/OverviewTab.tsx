import { IPhysicalAssetDetail } from "@/types/physical-asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Box,
  ShieldCheck,
  UserCheck,
  Clock,
  Wrench,
  Trash2,
  Info,
  DollarSign,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OverviewTab({ asset }: { asset: IPhysicalAssetDetail }) {
  return (
    <div className="flex flex-col gap-4">
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
            label="Allocated"
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Management Info */}
            <Card className="border-border/40 shadow-sm bg-card/40 backdrop-blur-md rounded-lg">
              <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/10">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                  <Info className="w-4 h-4" />
                  Management info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-3">
                <InfoRow
                  icon="📦"
                  label="Asset category"
                  value={asset.category?.name || "-"}
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
              <CardContent className="p-4 flex flex-col gap-3">
                <InfoRow
                  icon="📅"
                  label="Purchase date"
                  value={asset.purchase_date?.split("T")[0] || "N/A"}
                />
                <InfoRow
                  icon="💵"
                  label="Original cost"
                  value={new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(asset.cost)}
                  bold
                />
                <InfoRow
                  icon="✅"
                  label="Warranty expiration"
                  value={asset.warranty_expiration?.split("T")[0] || "N/A"}
                />
                <InfoRow
                  icon="🏢"
                  label="Supplier"
                  value={asset.supplier?.name || "-"}
                />
              </CardContent>
            </Card>
          </div>

          {/* Upload Documents Box */}
          <Card className="border-border/40 shadow-sm bg-card/40 backdrop-blur-md rounded-lg border-dashed">
            <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/5 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Asset documents & images
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 border-primary/20 text-primary hover:bg-primary/10 px-2 text-xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload record
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="rounded-lg border border-dashed border-border/50 bg-muted/10 min-h-[120px] flex flex-col items-center justify-center gap-2 hover:bg-muted/20 transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-background/60 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-3.5 h-3.5 text-muted-foreground/60" />
                </div>
                <span className="text-sm font-medium text-muted-foreground/60">
                  No attached documents
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Model Image */}
        <div className="xl:col-span-1">
          <Card className="border-border/40 shadow-sm bg-card/40 backdrop-blur-md rounded-lg h-full flex flex-col">
            <CardHeader className="py-4 flex-none items-center justify-center border-b border-border/40">
              <CardTitle className="text-sm font-semibold text-foreground/70">
                Model image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="aspect-square bg-muted/20 rounded-lg flex items-center justify-center border border-border/20 mb-6 max-h-[250px]">
                <Box className="w-12 h-12 text-muted-foreground/30" />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-0.5 border-t border-border/20 pt-3">
                  <span className="text-sm text-muted-foreground">
                    Asset model
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {asset.model || "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 border-t border-border/20 pt-3">
                  <span className="text-sm text-muted-foreground">
                    Serial number
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {asset.serial_number || "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
  valueColor = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors">
      <div className="shrink-0 w-8 h-8 rounded-full bg-background shadow-sm border border-border/30 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col gap-0">
        <span className="text-sm text-muted-foreground/80 font-medium">
          {label}
        </span>
        <span className={cn("text-base font-semibold leading-tight", valueColor)}>
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
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span className="text-base opacity-70">{icon}</span>
        {label}
      </div>
      <div className="pl-6">
        <span
          className={cn(
            "text-sm leading-tight",
            highlight
              ? "font-medium text-foreground"
              : bold
                ? "font-semibold text-primary"
                : "text-foreground/90",
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
