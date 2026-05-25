"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
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
import { IStockAdjustment } from "@/types/stock-adjustment";
import { formatDate } from "@/utils/date";

import StockAdjustmentModal from "./StockAdjustmentModal";

export default function StockAdjustmentTable({
  defaultType,
}: {
  defaultType: "INCREASE" | "DECREASE";
}) {
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(100);
  const [q, setQ] = useState("");
  const [isManualOpen, setIsManualOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("page_stock_in_out");

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
    count?: number;
  }>({
    url: `${endpoints.STOCK_ADJUSTMENTS}?${queryParams.toString()}`,
  });

  const items = response?.items || [];

  return (
    <div className="w-full h-full flex flex-col min-h-0 p-3 gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 z-10 w-full">
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            size={16}
          />
          <Input
            placeholder={t("table.search_placeholder")}
            className="pl-9 pr-10 bg-background/50 border-border/50 w-full"
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

        <Button
          onClick={() => {
            setSkip(0);
            setAppliedFilters({ q });
          }}
          className="shrink-0"
        >
          {pending ? t("table.searching") : t("table.search")}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setQ("");
            setAppliedFilters({ q: "" });
            setSkip(0);
          }}
          title={t("table.clear_filters")}
          className="shrink-0"
        >
          <RotateCcw size={16} className="text-muted-foreground/70" />
        </Button>
        <Button
          onClick={() => setIsManualOpen(true)}
          className="shrink-0 bg-primary/95 hover:bg-primary"
        >
          {t("table.create")}
        </Button>
      </div>

      <StockAdjustmentModal
        isOpen={isModalOpen}
        onClose={() => setIsManualOpen(false)}
        onSuccess={() => {
          reFetch();
        }}
        defaultType={defaultType}
      />

      {/* Table */}
      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="w-full">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-12 text-center">
                {t("table.no")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-32 text-center hidden sm:table-cell">
                {t("table.record_no")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                {t("table.asset")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-28 text-center hidden md:table-cell">
                {t("table.type")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-20 text-center hidden sm:table-cell">
                {t("table.quantity")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-32 text-center hidden md:table-cell">
                {t("table.date")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-32 text-center">
                {t("table.status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={7} rows={6} />
            ) : items.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                icon={PackageSearch}
                message={t("table.empty_title")}
                description={t("table.empty_desc")}
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
                  <TableCell className="px-4 py-2 text-center hidden sm:table-cell">
                    <div className="flex justify-center">
                      <span
                        className="text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit"
                        title={item.record_number}
                      >
                        {item.record_number}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2 max-w-0 overflow-hidden">
                    <span
                      className="font-medium text-sm truncate block"
                      title={item.asset_names}
                    >
                      {item.asset_names}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center hidden md:table-cell">
                    {item.adjustment_type === "INCREASE" ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold">
                        <ArrowUpCircle size={14} /> {t("table.increase")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-500 text-xs font-semibold">
                        <ArrowDownCircle size={14} /> {t("table.decrease")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center font-medium hidden sm:table-cell">
                    {item.total_quantity}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center hidden md:table-cell">
                    <div className="flex items-center justify-center gap-1.5">
                      <Calendar
                        size={12}
                        className="text-muted-foreground/60 shrink-0"
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

      <TablePagination
        skip={skip}
        limit={limit}
        count={items.length}
        total={response?.total ?? response?.count}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />
    </div>
  );
}
