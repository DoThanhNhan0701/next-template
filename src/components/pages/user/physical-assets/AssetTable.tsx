"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  Building2,
  Calendar,
  EditIcon,
  Filter,
  MapPin,
  RotateCcw,
  Search,
  Tag,
  X,
} from "lucide-react";
import { Laptop } from "lucide-react";

import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { ICatalogType } from "@/types/catalog-type";
import { IOrgUnit } from "@/types/org";
import { IPhysicalAsset } from "@/types/physical-asset";
import { IStatus } from "@/types/status";
import { IUsageMode } from "@/types/usage-mode";
import { formatDate } from "@/utils/date";
import { formatNumberWithCommas } from "@/utils/number";

import AssetFormModal from "./AssetFormModal";

export default function AssetTable() {
  const router = useRouter();
  const t = useTranslations("page_physical_assets");
  const { hasPermission } = usePermissions();
  const hasHydrated = useHasHydrated();
  const canEdit = hasPermission("asset:edit") && hasHydrated;
  const canCreate = hasPermission("asset:create") && hasHydrated;

  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);

  // Filter state
  const [q, setQ] = useState("");
  const [unitId, setUnitId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [statusCode, setStatusCode] = useState<string>("");

  // Applied filter state to avoid re-fetching on every keystroke
  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    unit_id: "",
    category_id: "",
    status_code: "",
  });

  // Fetch metadata for filters
  const { response: catalogRes } = useGet<ICatalogType[]>({
    url: endpoints.CATALOG_TYPES,
  });
  const { response: orgRes } = useGet<IOrgUnit[]>({
    url: endpoints.ORG_UNITS,
  });
  const { response: statusRes } = useGet<IStatus[]>({
    url: endpoints.STATUSES + "?category=asset",
  });
  const { response: usageModeRes } = useGet<IUsageMode[]>({
    url: endpoints.USAGE_MODES,
  });

  const categories = catalogRes || [];
  const statuses = statusRes || [];
  const usageModes = usageModeRes || [];
  const orgUnits = orgRes || [];

  // Helper for Status Badge
  const getStatusInfo = (statusId: number) => {
    return statuses.find((s) => s.id === statusId);
  };

  // Helper for Importance Accent (kept for future use)
  // const getImportanceColor = (id: number) => { ... }

  // Helper for Usage Mode
  const getUsageModeLabel = (id: number | null) => {
    if (!id) return null;
    return usageModes.find((m) => m.id === id)?.name || null;
  };

  const getOrgUnitLabel = (id: number | null) => {
    if (!id) return null;
    return orgUnits.find((o) => o.id === id)?.name || null;
  };

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (appliedFilters.q) queryParams.append("q", appliedFilters.q);
  if (appliedFilters.unit_id)
    queryParams.append("unit_id", appliedFilters.unit_id);
  if (appliedFilters.category_id)
    queryParams.append("category_id", appliedFilters.category_id);
  if (appliedFilters.status_code)
    queryParams.append("status_code", appliedFilters.status_code);

  const { response, pending, reFetch } = useGet<{ items: IPhysicalAsset[] }>({
    url: `${endpoints.PHYSICAL_ASSETS}?${queryParams.toString()}`,
  });
  const assets = response?.items || [];

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = assets.length === limit;

  const [isCreating, setIsCreating] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<IPhysicalAsset | null>(null);

  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-2">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 bg-card/60 backdrop-blur-md p-3 rounded-md border border-border/50 transition-all hover:border-border/80">
        {/* Search Group */}
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            size={16}
          />
          <Input
            placeholder={t("filters.search_placeholder")}
            className="pl-9 pr-10 bg-background/50 border-border/50 focus-visible:ring-primary/20 transition-all w-full"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button
              onClick={() => {
                setQ("");
                setAppliedFilters((prev) => ({ ...prev, q: "" }));
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={unitId}
            onValueChange={(val) => setUnitId(val === "none" ? "" : val)}
          >
            <SelectTrigger className="min-w-35 max-w-45 w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <Building2
                  size={16}
                  className="text-muted-foreground/70 shrink-0"
                />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder={t("filters.organization")} />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-muted-foreground italic">
                {t("filters.none")}
              </SelectItem>
              {orgUnits.map((o) => (
                <SelectItem key={o.id} value={o.id.toString()}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={categoryId}
            onValueChange={(val) => setCategoryId(val === "none" ? "" : val)}
          >
            <SelectTrigger className="min-w-35 max-w-45 w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <Tag size={16} className="text-muted-foreground/70 shrink-0" />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder={t("filters.category")} />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-muted-foreground italic">
                {t("filters.none")}
              </SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusCode}
            onValueChange={(val) => setStatusCode(val === "none" ? "" : val)}
          >
            <SelectTrigger className="min-w-35 max-w-45 w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <Filter
                  size={16}
                  className="text-muted-foreground/70 shrink-0"
                />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder={t("filters.status")} />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-muted-foreground italic">
                {t("filters.none")}
              </SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setSkip(0);
              setAppliedFilters({
                q,
                unit_id: unitId,
                category_id: categoryId,
                status_code: statusCode,
              });
            }}
            className="flex-1 lg:flex-none shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {pending ? t("filters.searching") : t("filters.search")}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setQ("");
              setUnitId("");
              setCategoryId("");
              setStatusCode("");
              setAppliedFilters({
                q: "",
                unit_id: "",
                category_id: "",
                status_code: "",
              });
              setSkip(0);
            }}
            className="border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-95 shrink-0"
            title={t("filters.clear")}
          >
            <RotateCcw size={16} className="text-muted-foreground/70" />
          </Button>

          {canCreate && (
            <Button
              onClick={() => setIsCreating(true)}
              className="flex-1 lg:flex-none bg-primary/95 hover:bg-primary shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              {t("modals.create_title")}
            </Button>
          )}
        </div>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-auto">
        <Table className="min-w-300">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-3 w-[50px] text-center">
                {t("table.no")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-3 w-[200px]">
                {t("table.asset")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-3 w-[180px]">
                {t("table.ownership")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-3 w-[150px]">
                {t("table.location")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-3 w-[140px]">
                {t("table.purchase_info")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-3 w-[130px] text-center">
                {t("table.management_type")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-3 w-[200px] text-center">
                {t("table.status")}
              </TableHead>
              {canEdit && (
                <TableHead className="font-semibold h-10 px-3 w-[80px] text-right sticky right-0 bg-sidebar-accent">
                  {t("table.actions")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={canEdit ? 8 : 7} rows={6} />
            ) : assets.length === 0 ? (
              <TableEmptyRow
                colSpan={canEdit ? 8 : 7}
                icon={Laptop}
                message={t("table.no_assets_found")}
                description={t("table.add_first_asset")}
              />
            ) : (
              assets.map((asset, index) => {
                const status = getStatusInfo(asset.status_id);
                const usageMode = getUsageModeLabel(asset.usage_mode_id);

                return (
                  <TableRow
                    key={asset.id}
                    onClick={() => router.push(`/assets/${asset.id}`)}
                    className="group hover:bg-primary/3 transition-colors relative cursor-pointer"
                  >
                    <TableCell className="px-4 py-1.5 text-center text-muted-foreground">
                      {skip + index + 1}
                    </TableCell>
                    <TableCell className="px-4 py-1.5">
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <div className="bg-primary/5 p-1.5 rounded-lg text-primary transition-colors group-hover:bg-primary/10 shrink-0">
                          <Laptop size={16} />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-semibold text-sm group-hover:text-primary transition-colors truncate" title={asset.name}>
                            {asset.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit mt-1">
                            {asset.asset_code}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold uppercase text-secondary-foreground">
                            {asset.holder_name?.substring(0, 2) || "NA"}
                          </div>
                          <span className="font-medium text-foreground/80">
                            {asset.holder_name || t("table.unassigned")}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 pl-8">
                          <span className="opacity-60 italic">
                            {t("table.unit")}
                          </span>
                          <span>
                            {getOrgUnitLabel(asset.unit_id) || t("table.none")}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5">
                      <div className="flex flex-col gap-1 text-sm">

                        {usageMode && (
                          <div className="text-[10px] text-muted-foreground pl-1 flex items-center gap-1">
                            <MapPin size={12} className="text-primary/70" />
                            <span>{usageMode}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar
                            size={12}
                            className="text-muted-foreground/60"
                          />
                          <span className="text-xs">
                            {formatDate(asset.purchase_date)}
                          </span>
                        </div>
                        <span className="font-bold text-sm text-foreground/90">
                          {formatNumberWithCommas(asset.cost)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-none whitespace-nowrap",
                          asset.management_type === "bulk"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/20",
                        )}
                      >
                        {asset.management_type === "bulk"
                          ? t("table.by_quantity")
                          : t("table.by_code")}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        {((asset.in_stock_quantity ?? 0) > 0 ||
                          (asset.allocated_quantity ?? 0) > 0 ||
                          (asset.rented_quantity ?? 0) > 0) &&
                          asset.management_type === "bulk" ? (
                          <div className="flex items-center gap-1 flex-wrap justify-center">
                            {(asset.in_stock_quantity ?? 0) > 0 && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 whitespace-nowrap">
                                {t("table.stock")}: {asset.in_stock_quantity}
                              </span>
                            )}
                            {(asset.allocated_quantity ?? 0) > 0 && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20 whitespace-nowrap">
                                {t("table.in_use")}: {asset.allocated_quantity}
                              </span>
                            )}
                            {(asset.rented_quantity ?? 0) > 0 && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/20 whitespace-nowrap">
                                {t("table.rented")}: {asset.rented_quantity}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            style={
                              status?.color
                                ? {
                                  backgroundColor: `${status.color}20`,
                                  color: status.color,
                                  borderColor: `${status.color}40`,
                                }
                                : {}
                            }
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-none whitespace-nowrap",
                              !status?.color &&
                              "bg-primary/10 text-primary border-primary/20",
                            )}
                          >
                            {status?.name || `Status ${asset.status_id}`}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    {canEdit && (
                      <TableCell className="px-4 py-1.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-amber-50 text-amber-600 transition-all active:scale-90"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssetToEdit(asset);
                            }}
                            title={t("table.edit_asset")}
                          >
                            <EditIcon size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {assets.length > 0 || skip > 0 ? (
        <Pagination className="flex w-full justify-end mt-1">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (skip > 0 && !pending) setSkip(Math.max(0, skip - limit));
                }}
                className={
                  skip === 0 || pending ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                {currentPage}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (hasMore && !pending) setSkip(skip + limit);
                }}
                className={
                  !hasMore || pending ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      <AssetFormModal
        isOpen={isCreating || assetToEdit !== null}
        onClose={() => {
          setIsCreating(false);
          setAssetToEdit(null);
        }}
        assetToEdit={assetToEdit}
        onSuccess={() => reFetch()}
      />
    </div>
  );
}
