"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  ArrowDown,
  Calendar,
  ClipboardList,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";

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
import { RootState } from "@/redux";
import { IAllocationSummary } from "@/types/allocation";
import { IOrgUnit } from "@/types/org";
import { IStatus } from "@/types/status";
import { formatDate } from "@/utils/date";

import AllocationVoucherModal from "./AllocationVoucherModal";

export default function AllocationSummaryTable() {
  const t = useTranslations("page_allocation_recovery");
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);

  // Filter state
  const [q, setQ] = useState("");
  const [unitId, setUnitId] = useState<string>("");
  const [statusCode, setStatusCode] = useState<string>("");
  const [isManualOpen, setIsManualOpen] = useState(false);
  const { isOpen: isReduxOpen } = useSelector(
    (state: RootState) => state.allocation,
  );
  const isModalOpen = isManualOpen || isReduxOpen;

  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    unit_id: "",
    status_code: "",
  });

  const { response: orgRes } = useGet<IOrgUnit[]>({
    url: endpoints.ORG_UNITS,
  });
  const { response: statusRes } = useGet<IStatus[]>({
    url: endpoints.STATUSES + "?category=allocation",
  });

  const statuses = statusRes || [];
  const orgUnits = orgRes || [];

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (appliedFilters.q) queryParams.append("q", appliedFilters.q);
  if (appliedFilters.unit_id)
    queryParams.append("unit_id", appliedFilters.unit_id);
  if (appliedFilters.status_code)
    queryParams.append("status_code", appliedFilters.status_code);

  const { response, pending, reFetch } = useGet<{
    items: IAllocationSummary[];
    total?: number;
    count?: number;
  }>({
    url: `${endpoints.ALLOCATIONS}summary?${queryParams.toString()}`,
  });
  const allocations = response?.items || [];

  return (
    <div className="w-full h-full flex flex-col min-h-0 p-3 gap-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 z-10 w-full transition-all">
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            size={16}
          />
          <Input
            placeholder={t("table.search_allocation_placeholder")}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 min-w-0 flex-1">
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
            placeholder={t("form.organization")}
          />

          <SelectField
            className="w-full min-w-0"
            options={(statuses ?? []).map((c) => ({
              label: c.name,
              value: c.id.toString(),
            }))}
            value={statusCode}
            onChange={(val) => setStatusCode(val)}
            placeholder={t("table.all_statuses")}
          />

          <div className="flex items-center gap-1">
            <Button
              onClick={() => {
                setSkip(0);
                setAppliedFilters({
                  q,
                  unit_id: unitId,
                  status_code: statusCode,
                });
              }}
              className="flex-1 lg:flex-none shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              {pending ? t("table.searching") : t("table.search")}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setQ("");
                setUnitId("");
                setStatusCode("");
                setAppliedFilters({
                  q: "",
                  unit_id: "",
                  status_code: "",
                });
                setSkip(0);
              }}
              className="border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-95 shrink-0"
              title={t("table.clear_filters")}
            >
              <RotateCcw size={16} className="text-muted-foreground/70" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsManualOpen(true)}
            className="flex-1 lg:flex-none bg-primary/95 hover:bg-primary shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {t("table.create")}
          </Button>
        </div>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[50px] text-center">
                {t("table.no")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[120px]">
                {t("table.record_number")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[320px]">
                {t("table.asset")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[180px]">
                {t("table.allocated_to")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[200px]">
                {t("table.from_to")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[80px] text-center">
                {t("table.quantity")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[130px] text-center">
                {t("table.date")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[140px] text-center">
                {t("table.status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={8} rows={6} />
            ) : allocations.length === 0 ? (
              <TableEmptyRow
                colSpan={8}
                icon={ClipboardList}
                message={t("table.empty_allocation_title")}
                description={t("table.empty_allocation_desc")}
              />
            ) : (
              allocations.map((alloc, index) => {
                return (
                  <TableRow
                    key={`${alloc.id}-${index}`}
                    className="group hover:bg-primary/3 transition-colors relative cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/allocation-recovery/${alloc.id}?tab=allocation`,
                      )
                    }
                  >
                    <TableCell className="px-4 py-1.5 text-center text-sm text-muted-foreground">
                      {skip + index + 1}
                    </TableCell>
                    <TableCell className="px-4 py-2 text-center">
                      <div className="flex justify-center">
                        <span
                          className="text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit"
                          title={alloc.record_number}
                        >
                          {alloc.record_number}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className="font-semibold text-sm truncate block"
                          title={alloc.asset_name}
                        >
                          {alloc.asset_name || "-"}
                        </span>
                        <span className="text-muted-foreground font-mono">
                          {alloc.asset_code || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                      <div className="flex flex-col gap-0.5 text-sm">
                        <span className="font-medium text-foreground/80 truncate block">
                          {alloc.allocated_to_name || t("table.unassigned")}
                        </span>
                        <div className="text-[11px] text-muted-foreground truncate block">
                          {alloc.unit_name || "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1 max-w-0 overflow-hidden">
                      <div className="flex flex-col gap-0 text-xs leading-tight">
                        <span
                          className={`truncate ${alloc.from_name ? "text-muted-foreground" : "italic text-muted-foreground/60"}`}
                          title={alloc.from_name || "-"}
                        >
                          {alloc.from_name || "-"}
                        </span>
                        <span
                          className={`truncate text-xs text-foreground/80 font-medium flex items-center gap-1 mt-0.5`}
                          title={alloc.to_name || "-"}
                        >
                          <ArrowDown
                            size={10}
                            className="shrink-0 text-muted-foreground/40"
                          />
                          {alloc.to_name || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 text-center font-medium">
                      {alloc.total_quantity || 0}
                    </TableCell>
                    <TableCell className="px-4 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs">
                        <Calendar
                          size={12}
                          className="text-muted-foreground/60 shrink-0"
                        />
                        <span>{formatDate(alloc.allocation_date)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 text-center">
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${alloc.status_color}15`,
                          color: alloc.status_color,
                          borderColor: `${alloc.status_color}30`,
                        }}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-none"
                      >
                        {alloc.status}
                      </Badge>
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
        count={allocations.length}
        total={response?.total ?? response?.count}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />

      <AllocationVoucherModal
        isOpen={isModalOpen}
        onClose={() => setIsManualOpen(false)}
        onSuccess={() => {
          reFetch();
        }}
      />
    </div>
  );
}
