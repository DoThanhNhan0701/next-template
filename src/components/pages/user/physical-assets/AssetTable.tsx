"use client";

import { useState } from "react";

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
  const { hasPermission } = usePermissions();
  const hasHydrated = useHasHydrated();
  const canEdit = hasPermission("asset:edit") && hasHydrated;
  const canCreate = hasPermission("asset:create") && hasHydrated;

  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);

  // Filter state
  const [q, setQ] = useState("");
  const [unitId, setUnitId] = useState<string>("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [statusCode, setStatusCode] = useState<string>("all");

  // Applied filter state to avoid re-fetching on every keystroke
  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    unit_id: "all",
    category_id: "all",
    status_code: "all",
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
  if (appliedFilters.unit_id !== "all")
    queryParams.append("unit_id", appliedFilters.unit_id);
  if (appliedFilters.category_id !== "all")
    queryParams.append("category_id", appliedFilters.category_id);
  if (appliedFilters.status_code !== "all")
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
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 bg-card/60 backdrop-blur-md p-3 rounded-md border border-border/50 shadow-sm transition-all hover:border-border/80">
        {/* Search Group */}
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            size={16}
          />
          <Input
            placeholder="Asset Code, Serial..."
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
          <Select value={unitId} onValueChange={setUnitId}>
            <SelectTrigger className="min-w-[140px] max-w-[220px] w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <Building2
                  size={16}
                  className="text-muted-foreground/70 shrink-0"
                />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder="Organization" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Organization</SelectItem>
              {orgUnits.map((o) => (
                <SelectItem key={o.id} value={o.id.toString()}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="min-w-[140px] max-w-[220px] w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <Tag size={16} className="text-muted-foreground/70 shrink-0" />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder="All Asset Types" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Asset Types</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusCode} onValueChange={setStatusCode}>
            <SelectTrigger className="min-w-[140px] max-w-[220px] w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <Filter
                  size={16}
                  className="text-muted-foreground/70 shrink-0"
                />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder="All Statuses" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
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
            {pending ? "Searching..." : "Search"}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setQ("");
              setUnitId("all");
              setCategoryId("all");
              setStatusCode("all");
              setAppliedFilters({
                q: "",
                unit_id: "all",
                category_id: "all",
                status_code: "all",
              });
              setSkip(0);
            }}
            className="border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-95 shrink-0"
            title="Clear all filters"
          >
            <RotateCcw size={16} className="text-muted-foreground/70" />
          </Button>

          {canCreate && (
            <Button
              onClick={() => setIsCreating(true)}
              className="flex-1 lg:flex-none bg-primary/95 hover:bg-primary shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              Create
            </Button>
          )}
        </div>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                No
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">Asset</TableHead>
              <TableHead className="font-semibold h-10 px-4">
                Ownership
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                Location
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                Purchase Info
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center">
                Management type
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center">
                Status
              </TableHead>
              {canEdit && (
                <TableHead className="font-semibold h-10 px-4 text-right">
                  Actions
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
                message="No assets declared yet"
                description="Declare your first asset using the button above to get started."
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
                    <TableCell className="px-4 py-1.5 relative overflow-hidden">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/5 p-1.5 rounded-lg text-primary transition-colors group-hover:bg-primary/10">
                          <Laptop size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm group-hover:text-primary transition-colors">
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
                            {asset.holder_name || "Unassigned"}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 pl-8">
                          <span className="opacity-60 italic">Unit:</span>
                          <span>
                            {getOrgUnitLabel(asset.unit_id) || "None"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2 px-2 py-1 bg-secondary/30 rounded-md w-fit">
                          <MapPin size={12} className="text-primary/70" />
                          <span className="text-xs font-medium">
                            {asset.location || "Floating"}
                          </span>
                        </div>
                        {usageMode && (
                          <div className="text-[10px] text-muted-foreground pl-1 flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
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
                          ? "By quantity"
                          : "By code"}
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
                                Stock: {asset.in_stock_quantity}
                              </span>
                            )}
                            {(asset.allocated_quantity ?? 0) > 0 && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20 whitespace-nowrap">
                                In use: {asset.allocated_quantity}
                              </span>
                            )}
                            {(asset.rented_quantity ?? 0) > 0 && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/20 whitespace-nowrap">
                                Rented: {asset.rented_quantity}
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
                            title="Edit Asset"
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
