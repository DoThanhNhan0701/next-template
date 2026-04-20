"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  PackageSearch,
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
import { IStockAdjustment } from "@/types/stock-adjustment";
import { formatDate } from "@/utils/date";

import StockAdjustmentModal from "./StockAdjustmentModal";

export default function StockAdjustmentTable({
  defaultType,
}: {
  defaultType: "INCREASE" | "DECREASE";
}) {
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);
  const [q, setQ] = useState("");
  const [isManualOpen, setIsManualOpen] = useState(false);
  const router = useRouter();

  // Also open when Redux prefill is set (from Inventory page)
  const { isOpen: isReduxOpen } = useSelector(
    (state: RootState) => state.stockAdjustment,
  );
  const isModalOpen = isManualOpen || isReduxOpen;

  const [appliedFilters, setAppliedFilters] = useState({ q: "" });

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
    adjustment_type: defaultType,
  });
  if (appliedFilters.q) queryParams.append("q", appliedFilters.q);

  const { response, pending, reFetch } = useGet<{
    items: IStockAdjustment[];
    total: number;
  }>({
    url: `${endpoints.STOCK_ADJUSTMENTS}?${queryParams.toString()}`,
  });

  const items = response?.items || [];
  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = items.length === limit;

  return (
    <div className="w-full h-full flex flex-col min-h-0 p-4 gap-4">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 z-10 w-full">
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            size={16}
          />
          <Input
            placeholder="Search by asset, record number..."
            className="pl-9 pr-10 h-10 bg-background/50 border-border/50 w-full"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button
              onClick={() => {
                setQ("");
                setAppliedFilters((p) => ({ ...p, q: "" }));
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2"></div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setSkip(0);
              setAppliedFilters({ q });
            }}
            className="h-10 px-6"
          >
            {pending ? "Searching..." : "Search"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => {
              setQ("");
              setAppliedFilters({ q: "" });
              setSkip(0);
            }}
            title="Clear filters"
          >
            <RotateCcw size={16} className="text-muted-foreground/70" />
          </Button>
          <Button
            onClick={() => setIsManualOpen(true)}
            className="h-10 bg-primary/95 hover:bg-primary"
          >
            Create
          </Button>
        </div>
      </div>

      <StockAdjustmentModal
        isOpen={isModalOpen}
        onClose={() => setIsManualOpen(false)}
        onSuccess={() => {
          reFetch();
        }}
      />

      {/* Table */}
      <div className="border border-(--surface-border-color) rounded-lg flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                No
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                Record No.
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">Asset</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center">
                Type
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center">
                Qty
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">Reason</TableHead>
              <TableHead className="font-semibold h-10 px-4">Date</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={8} rows={6} />
            ) : items.length === 0 ? (
              <TableEmptyRow
                colSpan={8}
                icon={PackageSearch}
                message="No stock in/out records found"
                description="Create a new adjustment using the button above."
              />
            ) : (
              items.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-primary/3 transition-colors cursor-pointer"
                  onClick={() => router.push(`/stock-in-out/${item.id}`)}
                >
                  <TableCell className="px-4 py-2 text-center text-sm text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <span className="font-mono text-xs bg-muted/50 px-1.5 py-0.5 rounded">
                      {item.record_number}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2 font-medium text-sm">
                    {item.asset_names}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    {item.adjustment_type === "INCREASE" ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold">
                        <ArrowUpCircle size={14} /> Increase
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-500 text-xs font-semibold">
                        <ArrowDownCircle size={14} /> Decrease
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center font-medium">
                    {item.total_quantity}
                  </TableCell>
                  <TableCell className="px-4 py-2 max-w-[220px]">
                    <span
                      className="text-sm truncate block"
                      title={item.reason}
                    >
                      {item.reason || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar
                        size={12}
                        className="text-muted-foreground/60"
                      />
                      <span className="text-xs">
                        {formatDate(item.adjustment_date)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    {item.status ? (
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${item.status_color}15`,
                          color: item.status_color,
                          borderColor: `${item.status_color}30`,
                        }}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-none"
                      >
                        {item.status}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="px-2.5 py-0.5 rounded-full text-[11px] text-muted-foreground"
                      >
                        —
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {items.length > 0 || skip > 0 ? (
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
