import { IPhysicalAssetDetail } from "@/types/physical-asset";
import { IRental } from "@/types/rental";
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
  ExternalLink,
  Paperclip,
  FileSpreadsheet,
  FileText,
  FileArchive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image";
import { useGet } from "@/hooks/useGet";
import { endpoints } from "@/config/endpoints";

const formatUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  return `${baseUrl.replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
};

const isImage = (url: string) => /\.(png|jpg|jpeg|gif|webp)$/i.test(url);

const getFileIcon = (url: string) => {
  const ext = url.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png": case "jpg": case "jpeg": return <ImageIcon size={14} className="text-blue-500" />;
    case "xls": case "xlsx": case "csv": return <FileSpreadsheet size={14} className="text-green-500" />;
    case "doc": case "docx": case "txt": return <FileText size={14} className="text-blue-600" />;
    case "pdf": return <FileText size={14} className="text-red-500" />;
    case "zip": case "rar": return <FileArchive size={14} className="text-purple-500" />;
    default: return <Paperclip size={14} className="text-primary" />;
  }
};

export default function OverviewTab({ asset }: Readonly<{ asset: IPhysicalAssetDetail }>) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { response: rentalRes } = useGet<{ items: IRental[] }>(
    { url: `${endpoints.RENTALS}?asset_id=${asset.id}&status=ACTIVE` },
    { deps: [asset.id] },
  );
  const activeRental = rentalRes?.items?.[0] ?? null;
  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Stats Bar */}
        <Card className="border-border/40 shadow-sm bg-card/40 backdrop-blur-md rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-6 divide-y lg:divide-y-0 lg:divide-x divide-border/40">
            <StatItem icon={<Box className="w-4 h-4 text-slate-400" />} label="Registered" value={asset.total_quantity} />
            <StatItem icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />} label="In stock" value={asset.in_stock_quantity} valueColor="text-emerald-600" />
            <StatItem icon={<UserCheck className="w-4 h-4 text-blue-500" />} label="Dispatch" value={asset.allocated_quantity} valueColor="text-blue-600" />
            <StatItem icon={<Clock className="w-4 h-4 text-amber-500" />} label="Rented" value={asset.rented_quantity} />
            <StatItem icon={<Wrench className="w-4 h-4 text-rose-400" />} label="Maintenance" value={asset.maintenance_quantity} />
            <StatItem icon={<Trash2 className="w-4 h-4 text-red-500" />} label="Liquidated" value={asset.liquidated_quantity} />
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
                  <InfoRow icon="📦" label="Asset category" value={asset.category?.name || "-"} />
                  <InfoRow icon="🗂️" label="Catalog group" value={(asset as unknown as { catalog_group_name?: string }).catalog_group_name || "-"} />
                  <InfoRow icon="🏷️" label="Asset group" value={(asset as unknown as { group_name?: string }).group_name || "-"} />
                  <InfoRow icon="🛡️" label="Importance level" value={asset.importance_obj?.name || "-"} />
                  <InfoRow icon="⚡" label="Usage mode" value={asset.usage_mode?.name || "-"} />
                  <InfoRow icon="🏷️" label="Old asset code" value={asset.old_code || "-"} highlight />
                  <InfoRow icon="🏢" label="Managing unit" value={asset.unit?.name || "-"} />
                  <InfoRow icon="👤" label="Current holder" value={asset.holder_name || "-"} />
                  <InfoRow icon="📍" label="Current location" value={asset.location_obj?.name || "-"} />
                  {activeRental && (
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span className="text-base opacity-70">🔑</span>
                        Đang cho thuê
                      </div>
                      <div className="pl-6 flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-amber-600">
                          {activeRental.customer_name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          #{activeRental.record_number}
                        </span>
                      </div>
                    </div>
                  )}
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
                  <InfoRow icon="📅" label="Purchase date" value={asset.purchase_date?.split("T")[0] || "N/A"} />
                  <InfoRow icon="🗓️" label="Declaration date" value={asset.system_declaration_date?.split("T")[0] || "N/A"} />
                  <InfoRow icon="💵" label="Original cost" value={asset.cost ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(asset.cost) : "N/A"} bold />
                  <InfoRow icon="📉" label="Depreciation period" value={asset.depreciation_period ? `${asset.depreciation_period} months` : "N/A"} />
                  <InfoRow icon="✅" label="Warranty expiration" value={asset.warranty_expiration?.split("T")[0] || "N/A"} />
                  <InfoRow icon="🏢" label="Supplier" value={asset.supplier?.name || "-"} />
                  {asset.purchase_ticket && (
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span className="text-base opacity-70">🔗</span>
                        Purchase ticket
                      </div>
                      <div className="pl-6">
                        <a href={asset.purchase_ticket} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1 truncate max-w-[200px]">
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{asset.purchase_ticket}</span>
                        </a>
                      </div>
                    </div>
                  )}
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
                <CardContent className="p-4">
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{asset.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            <Card className="border-border/40 shadow-sm bg-card/40 backdrop-blur-md rounded-lg border-dashed">
              <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/5 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Asset documents & images
                </CardTitle>
                <Button variant="outline" size="sm" className="h-7 gap-1.5 border-primary/20 text-primary hover:bg-primary/10 px-2 text-xs">
                  <UploadCloud className="w-3.5 h-3.5" />
                  Upload record
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                {asset.attachments && asset.attachments.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {asset.attachments.map((url, i) => {
                      const full = formatUrl(url);
                      return (
                        <div key={i} className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-md border border-border/50 text-xs">
                          {getFileIcon(url)}
                          <a
                            href={full}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => { if (isImage(url)) { e.preventDefault(); setPreviewUrl(full); } }}
                            className="truncate max-w-[200px] hover:underline hover:text-primary transition-colors cursor-pointer"
                            title={isImage(url) ? "Click to preview" : "Click to view"}
                          >
                            {url.split("/").pop()}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/50 bg-muted/10 min-h-30 flex flex-col items-center justify-center gap-2 hover:bg-muted/20 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-background/60 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-3.5 h-3.5 text-muted-foreground/60" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground/60">No attached documents</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1">
            <Card className="border-border/40 shadow-sm bg-card/40 backdrop-blur-md rounded-lg h-full flex flex-col">
              <CardHeader className="py-4 flex-none items-center justify-center border-b border-border/40">
                <CardTitle className="text-sm font-semibold text-foreground/70">Model image</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="aspect-square bg-muted/20 rounded-lg flex items-center justify-center border border-border/20 mb-6 max-h-62.5">
                  <Box className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-0.5 border-t border-border/20 pt-3">
                    <span className="text-sm text-muted-foreground">Asset model</span>
                    <span className="text-sm font-medium text-foreground">{asset.model || "—"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-t border-border/20 pt-3">
                    <span className="text-sm text-muted-foreground">Serial number</span>
                    <span className="text-sm font-medium text-foreground">{asset.serial_number || "—"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-t border-border/20 pt-3">
                    <span className="text-sm text-muted-foreground">Management type</span>
                    <span className="text-sm font-medium text-foreground capitalize">{asset.management_type || "—"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-t border-border/20 pt-3">
                    <span className="text-sm text-muted-foreground">Quantity</span>
                    <span className="text-sm font-semibold text-foreground">{asset.quantity ?? "—"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl w-[90vw] h-[85vh] p-1 bg-transparent border-none shadow-none flex items-center justify-center">
          <DialogHeader className="hidden">
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>Attachment image preview</DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-full flex items-center justify-center">
            {previewUrl && (
              <Image src={previewUrl} alt="Preview" fill className="object-contain rounded-md" sizes="(max-width: 768px) 100vw, 80vw" unoptimized />
            )}
          </div>
        </DialogContent>
      </Dialog>
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
}: Readonly<{
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
  bold?: boolean;
}>) {
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
