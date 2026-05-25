"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  Building2,
  Calendar,
  Laptop,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

import { SelectField } from "@/components/common/SelectField";
import { TablePagination } from "@/components/common/TablePagination";
import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatDate } from "@/utils/date";
import { formatNumberWithCommas } from "@/utils/number";

import AssetFormModal from "../modals/AssetFormModal";

export default function AssetTable() {
  const router = useRouter();
  const t = useTranslations("page_physical_assets");
  const { hasPermission } = usePermissions();
  const hasHydrated = useHasHydrated();
  const canCreate = hasPermission("asset:create") && hasHydrated;

  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(100);

  const [q, setQ] = useState("");
  const [unitId, setUnitId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [statusCode, setStatusCode] = useState<string>("");
  const [managementType, setManagementType] = useState<string>("");

  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    unit_id: "",
    category_id: "",
    status_code: "",
    management_type: "",
  });

  const { response: catalogRes } = useGet<ICatalogType[]>({
    url: endpoints.CATALOG_TYPES,
  });
  const { response: orgRes } = useGet<IOrgUnit[]>({
    url: endpoints.ORG_UNITS,
  });
  const { response: statusRes } = useGet<IStatus[]>({
    url: endpoints.STATUSES + "?category=asset",
  });

  const categories = catalogRes || [];
  const statuses = statusRes || [];
  const orgUnits = orgRes || [];
  const getStatusInfo = (statusId: number) => {
    return statuses.find((s) => s.id === statusId);
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
  if (appliedFilters.management_type)
    queryParams.append("management_type", appliedFilters.management_type);

  const { response, pending, reFetch } = useGet<{
    items: IPhysicalAsset[];
    total?: number;
    count?: number;
  }>({
    url: `${endpoints.PHYSICAL_ASSETS}?${queryParams.toString()}`,
  });
  const assets = response?.items || [];

  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-2">
      <div className="flex flex-col gap-3 bg-card/60 backdrop-blur-md p-3 rounded-md border border-border/50 transition-all hover:border-border/80">
        {/* Row 1: Search + action buttons */}
        <div className="flex items-center gap-2">
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

          <Button
            onClick={() => {
              setSkip(0);
              setAppliedFilters({
                q,
                unit_id: unitId,
                category_id: categoryId,
                status_code: statusCode,
                management_type: managementType,
              });
            }}
            className="shrink-0 shadow-sm hover:shadow-md transition-all active:scale-95"
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
              setManagementType("");
              setAppliedFilters({
                q: "",
                unit_id: "",
                category_id: "",
                status_code: "",
                management_type: "",
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
              className="shrink-0 bg-primary/95 hover:bg-primary shadow-sm hover:shadow-md transition-all active:scale-95 hidden sm:flex"
            >
              {t("modals.create_title")}
            </Button>
          )}
        </div>

        {/* Row 2: Filters + create button on mobile */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-1 min-w-0">
            <SelectField
              className="w-full min-w-0"
              options={(orgUnits ?? [])
                .filter((c) => c.is_active)
                .map((c) => ({
                  label: `${c.name} (${c.code})`,
                  value: c.id.toString(),
                }))}
              value={unitId}
              onChange={(val) => setUnitId(val)}
              placeholder={t("filters.organization")}
            />

            <SelectField
              className="w-full min-w-0"
              options={(categories ?? [])
                .filter((c) => c.is_active)
                .map((c) => ({
                  label: `${c.name} (${c.code})`,
                  value: c.id.toString(),
                }))}
              value={categoryId}
              onChange={(val) => setCategoryId(val)}
              placeholder={t("filters.category")}
            />

            <SelectField
              className="w-full min-w-0"
              options={(statuses ?? []).map((c) => ({
                label: `${c.name} (${c.code})`,
                value: c.id.toString(),
              }))}
              value={statusCode}
              onChange={(val) => setStatusCode(val)}
              placeholder={t("filters.status")}
            />

            <SelectField
              className="w-full min-w-0"
              options={[
                { label: t("table.by_code"), value: "unique" },
                { label: t("table.by_quantity"), value: "bulk" },
              ]}
              value={managementType}
              onChange={(val) => setManagementType(val as "unique" | "bulk")}
              placeholder={t("filters.management_type")}
            />
          </div>

          {canCreate && (
            <Button
              onClick={() => setIsCreating(true)}
              className="sm:hidden bg-primary/95 hover:bg-primary shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              {t("modals.create_title")}
            </Button>
          )}
        </div>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-auto">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-3 w-12.5 text-center">
                {t("table.no")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-3 w-95">
                {t("table.asset")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-3 w-30 text-center">
                {t("table.asset_code")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-3 w-50 hidden lg:table-cell">
                {t("table.ownership")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-3 w-40 hidden lg:table-cell">
                {t("table.purchase_info")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-3 w-35 text-center">
                {t("table.management_type")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-3 w-55 text-center">
                {t("table.status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={7} rows={6} />
            ) : assets.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                icon={Laptop}
                message={t("table.no_assets_found")}
                description={t("table.add_first_asset")}
              />
            ) : (
              assets.map((asset, index) => {
                const status = getStatusInfo(asset.status_id);

                return (
                  <TableRow
                    key={asset.id}
                    onClick={() => router.push(`/assets/${asset.id}`)}
                    className="group hover:bg-primary/3 transition-colors relative cursor-pointer"
                  >
                    <TableCell className="px-4 py-1.5 text-center text-muted-foreground">
                      {skip + index + 1}
                    </TableCell>
                    <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="flex flex-col min-w-0 flex-1">
                          <span
                            className="font-semibold text-sm group-hover:text-primary transition-colors truncate"
                            title={asset.name}
                          >
                            {asset.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 text-center">
                      <div className="flex justify-center">
                        <span
                          className="text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit"
                          title={asset.asset_code}
                        >
                          {asset.asset_code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 hidden lg:table-cell">
                      <div className="flex items-start gap-2 text-sm text-foreground/80">
                        <Building2
                          size={16}
                          className="text-muted-foreground/60 shrink-0 mt-0.5"
                        />
                        <div className="flex flex-col gap-1">
                          <span
                            className="font-medium truncate max-w-50"
                            title={
                              getOrgUnitLabel(asset.unit_id) || t("table.none")
                            }
                          >
                            {getOrgUnitLabel(asset.unit_id) || t("table.none")}
                          </span>
                          {(asset?.holding_qty ?? 0) -
                            (asset?.in_stock_quantity ?? 0) >
                            0 && (
                              <span className="text-[10px] font-semibold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded-full border border-primary/10 w-fit">
                                {t("table.holders_count", {
                                  count:
                                    (asset?.holding_qty ?? 0) -
                                    (asset?.in_stock_quantity ?? 0),
                                })}
                              </span>
                            )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 hidden lg:table-cell">
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
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        skip={skip}
        limit={limit}
        count={assets.length}
        total={response?.total ?? response?.count}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />

      <AssetFormModal
        isOpen={isCreating}
        onClose={() => {
          setIsCreating(false);
        }}
        assetToEdit={null}
        onSuccess={() => reFetch()}
      />
    </div>
  );
}
