"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  Building2,
  Calendar,
  ClipboardList,
  Filter,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";

import { TablePagination } from "@/components/common/TablePagination";
import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { RootState } from "@/redux";
import { IOrgUnit } from "@/types/org";
import { IRecoverySummary } from "@/types/recovery";
import { IStatus } from "@/types/status";
import { formatDate } from "@/utils/date";

import RecoveryVoucherModal from "./RecoveryVoucherModal";

export default function RecoverySummaryTable() {
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
    (state: RootState) => state.recovery,
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
    url: endpoints.STATUSES + "?category=recovery",
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

  const { response, pending } = useGet<{
    items: IRecoverySummary[];
    total?: number;
    count?: number;
  }>({
    url: `${endpoints.RECOVERIES}summary?${queryParams.toString()}`,
  });
  const recoveries = response?.items || [];
  return (
    <div className="w-full h-full flex flex-col min-h-0 p-3 gap-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 z-10 w-full transition-all">
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            size={16}
          />
          <Input
            placeholder={t("table.search_recovery_placeholder")}
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

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={unitId}
            onValueChange={(val) => setUnitId(val === "none" ? "" : val)}
          >
            <SelectTrigger className="min-w-[140px] max-w-[220px] w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <Building2
                  size={16}
                  className="text-muted-foreground/70 shrink-0"
                />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder={t("form.organization")} />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-muted-foreground italic">
                {t("form.none")}
              </SelectItem>
              {orgUnits.map((o) => (
                <SelectItem key={o.id} value={o.id.toString()}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusCode}
            onValueChange={(val) => setStatusCode(val === "none" ? "" : val)}
          >
            <SelectTrigger className="min-w-[140px] max-w-[220px] w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <Filter
                  size={16}
                  className="text-muted-foreground/70 shrink-0"
                />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder={t("table.all_statuses")} />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-muted-foreground italic">
                {t("form.none")}
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

          <Button
            onClick={() => setIsManualOpen(true)}
            className="flex-1 lg:flex-none bg-primary/95 hover:bg-primary shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {t("table.create")}
          </Button>
        </div>
      </div>

      <RecoveryVoucherModal
        isOpen={isModalOpen}
        onClose={() => setIsManualOpen(false)}
        onSuccess={() => setAppliedFilters((prev) => ({ ...prev }))}
      />

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[50px] text-center">
                {t("table.no")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[200px]">
                {t("table.asset")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[110px] text-center">
                {t("table.asset_code")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[180px]">
                {t("table.recovered_from")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[200px]">
                {t("table.from_to")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[80px] text-center">
                {t("table.quantity")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[180px]">
                {t("table.notes")}
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
              <TableLoadingRows colSpan={9} rows={6} />
            ) : recoveries.length === 0 ? (
              <TableEmptyRow
                colSpan={9}
                icon={ClipboardList}
                message={t("table.empty_recovery_title")}
                description={t("table.empty_recovery_desc")}
              />
            ) : (
              recoveries.map((recovery, index) => {
                return (
                  <TableRow
                    key={recovery.id}
                    className="group hover:bg-primary/3 transition-colors relative cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/allocation-recovery/${recovery.id}?tab=recovery`,
                      )
                    }
                  >
                    <TableCell className="px-4 py-1.5 text-center text-muted-foreground">
                      {skip + index + 1}
                    </TableCell>
                    <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                      <span
                        className="font-semibold text-sm truncate block"
                        title={recovery.asset_name}
                      >
                        {recovery.asset_name || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 text-center">
                      <span className="text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded inline-block">
                        {recovery.asset_code || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                      <div className="flex flex-col gap-0.5 text-sm">
                        <span className="font-medium text-foreground/80 truncate block">
                          {recovery.recovered_from_name ||
                            t("table.unassigned")}
                        </span>
                        <div className="text-[11px] text-muted-foreground truncate block">
                          {recovery.unit_name || "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 text-sm overflow-hidden">
                        <span
                          className="text-muted-foreground truncate"
                          title={recovery.from_name || "-"}
                        >
                          {recovery.from_name || "-"}
                        </span>
                        <span className="text-muted-foreground/30 shrink-0">
                          →
                        </span>
                        <span
                          className="text-foreground/80 font-medium truncate"
                          title={recovery.to_name || "-"}
                        >
                          {recovery.to_name || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 text-center font-medium">
                      {recovery.total_quantity || 0}
                    </TableCell>
                    <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                      <span
                        className="text-sm truncate block"
                        title={recovery.notes || "-"}
                      >
                        {recovery.notes || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs">
                        <Calendar
                          size={12}
                          className="text-muted-foreground/60 shrink-0"
                        />
                        <span>{formatDate(recovery.recovery_date)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 text-center">
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${recovery.status_color}15`,
                          color: recovery.status_color,
                          borderColor: `${recovery.status_color}30`,
                        }}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-none"
                      >
                        {recovery.status}
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
        count={recoveries.length}
        total={response?.total ?? response?.count}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />
    </div>
  );
}
