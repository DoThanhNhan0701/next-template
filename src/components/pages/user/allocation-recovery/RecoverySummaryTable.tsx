"use client";

import { useState } from "react";

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
import { RootState } from "@/redux";
import { IOrgUnit } from "@/types/org";
import { IRecoverySummary } from "@/types/recovery";
import { IStatus } from "@/types/status";
import { formatDate } from "@/utils/date";

import RecoveryVoucherModal from "./RecoveryVoucherModal";

export default function RecoverySummaryTable() {
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);

  // Filter state
  const [q, setQ] = useState("");
  const [unitId, setUnitId] = useState<string>("all");
  const [statusCode, setStatusCode] = useState<string>("all");
  const [isManualOpen, setIsManualOpen] = useState(false);
  const { isOpen: isReduxOpen } = useSelector(
    (state: RootState) => state.recovery,
  );
  const isModalOpen = isManualOpen || isReduxOpen;

  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    unit_id: "all",
    status_code: "all",
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
  if (appliedFilters.unit_id !== "all")
    queryParams.append("unit_id", appliedFilters.unit_id);
  if (appliedFilters.status_code !== "all")
    queryParams.append("status_code", appliedFilters.status_code);

  const { response, pending } = useGet<{
    items: IRecoverySummary[];
  }>({
    url: `${endpoints.RECOVERIES}summary?${queryParams.toString()}`,
  });
  const recoveries = response?.items || [];

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = recoveries.length === limit;

  return (
    <div className="w-full h-full flex flex-col min-h-0 p-3 gap-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 z-10 w-full transition-all">
        {/* Search Group */}
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            size={16}
          />
          <Input
            placeholder="Search recoveries..."
            className="pl-9 pr-10 h-10 bg-background/50 border-border/50 focus-visible:ring-primary/20 transition-all w-full"
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
                status_code: statusCode,
              });
            }}
            className="flex-1 lg:flex-none h-10 px-6 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {pending ? "Searching..." : "Search"}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setQ("");
              setUnitId("all");
              setStatusCode("all");
              setAppliedFilters({
                q: "",
                unit_id: "all",
                status_code: "all",
              });
              setSkip(0);
            }}
            className="h-10 w-10 border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-95 shrink-0"
            title="Clear all filters"
          >
            <RotateCcw size={16} className="text-muted-foreground/70" />
          </Button>

          <Button
            onClick={() => setIsManualOpen(true)}
            className="flex-1 lg:flex-none h-10 bg-primary/95 hover:bg-primary shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            Create
          </Button>
        </div>
      </div>

      <RecoveryVoucherModal
        isOpen={isModalOpen}
        onClose={() => setIsManualOpen(false)}
        onSuccess={() => setAppliedFilters((prev) => ({ ...prev }))}
      />

      <div className="border border-(--surface-border-color) rounded-lg flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                No
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">Asset</TableHead>
              <TableHead className="font-semibold h-10 px-4">
                Recovered From
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center">
                Quantity
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">Notes</TableHead>
              <TableHead className="font-semibold h-10 px-4">Date</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={7} rows={6} />
            ) : recoveries.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                icon={ClipboardList}
                message="No recoveries found"
                description="Adjust filters to find recovery records."
              />
            ) : (
              recoveries.map((recovery, index) => {
                return (
                  <TableRow
                    key={recovery.id}
                    className="group hover:bg-primary/3 transition-colors relative"
                  >
                    <TableCell className="px-4 py-1.5 text-center text-muted-foreground">
                      {skip + index + 1}
                    </TableCell>
                    <TableCell className="px-4 py-1.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {recovery.asset_name || "-"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit mt-1">
                          {recovery.asset_code || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5">
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="font-medium text-foreground/80">
                          {recovery.recovered_from_name || "Unassigned"}
                        </span>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <span>{recovery.unit_name || "-"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 text-center font-medium">
                      {recovery.total_quantity || 0}
                    </TableCell>
                    <TableCell className="px-4 py-1.5">
                      <span
                        className="text-sm max-w-[200px] truncate block"
                        title={recovery.notes || "-"}
                      >
                        {recovery.notes || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar
                          size={12}
                          className="text-muted-foreground/60"
                        />
                        <span className="text-xs">
                          {formatDate(recovery.recovery_date)}
                        </span>
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

      {recoveries.length > 0 || skip > 0 ? (
        <Pagination className="flex w-full justify-end">
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
    </div>
  );
}
