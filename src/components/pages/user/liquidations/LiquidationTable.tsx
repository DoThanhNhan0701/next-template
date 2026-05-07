"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Calendar, RotateCcw, Search, Trash2, X } from "lucide-react";

import { TablePagination } from "@/components/common/TablePagination";
import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
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
import { ILiquidation } from "@/types/liquidation";
import { formatDate } from "@/utils/date";

import LiquidationFormModal from "./LiquidationFormModal";

export default function LiquidationTable() {
  const t = useTranslations("page_liquidations.table");
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);

  // Filter state
  const [q, setQ] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
  });

  const [isCreating, setIsCreating] = useState(false);

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (appliedFilters.q) queryParams.append("q", appliedFilters.q);

  const { response, pending, reFetch } = useGet<{
    items: ILiquidation[];
    total?: number;
    count?: number;
  }>({
    url: `${endpoints.LIQUIDATIONS}?${queryParams.toString()}`,
  });
  const liquidations = response?.items || [];
  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-2">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 bg-card/60 backdrop-blur-md p-3 rounded-md border border-border/50 transition-all hover:border-border/80">
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            size={16}
          />
          <Input
            placeholder={t("search_placeholder")}
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

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setSkip(0);
              setAppliedFilters({
                q,
              });
            }}
            className="flex-1 lg:flex-none shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {pending ? t("searching") : t("btn_search")}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setQ("");
              setAppliedFilters({
                q: "",
              });
              setSkip(0);
            }}
            className="border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-95 shrink-0"
            title={t("btn_clear_filters")}
          >
            <RotateCcw size={16} className="text-muted-foreground/70" />
          </Button>
          <Button
            onClick={() => setIsCreating(true)}
            className="flex-1 lg:flex-none bg-primary/95 hover:bg-primary shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {t("btn_create")}
          </Button>
        </div>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[50px] text-center">
                {t("no")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[180px] text-center">
                {t("liquidation_info")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[150px] text-center">
                {t("date")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[320px]">
                {t("asset_details")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[80px] text-center">
                {t("quantity")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[140px] text-center">
                {t("status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={6} rows={6} />
            ) : liquidations.length === 0 ? (
              <TableEmptyRow
                colSpan={6}
                icon={Trash2}
                message={t("empty_title")}
                description={t("empty_desc")}
              />
            ) : (
              liquidations.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="group hover:bg-primary/3 transition-colors relative cursor-pointer"
                  onClick={() => router.push(`/liquidations/${item.id}`)}
                >
                  <TableCell className="px-4 py-1.5 text-center text-sm text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    <div className="flex justify-center">
                      <span
                        className="text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit"
                        title={item.record_number}
                      >
                        {item.record_number}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-sm text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs">
                      <Calendar
                        size={12}
                        className="text-muted-foreground/60 shrink-0"
                      />
                      <span>{formatDate(item.liquidation_date)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span
                          className="font-semibold text-sm truncate block"
                          title={item.asset_name}
                        >
                          {item.asset_name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground/80 font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit truncate block">
                        {item.asset_code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-sm font-medium text-center">
                    {item.total_assets}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
                      style={{ backgroundColor: item.status_color }}
                    >
                      {item.status}
                    </span>
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
        count={liquidations.length}
        total={response?.total ?? response?.count}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />

      {isCreating && (
        <LiquidationFormModal
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          onSuccess={() => reFetch()}
        />
      )}
    </div>
  );
}
