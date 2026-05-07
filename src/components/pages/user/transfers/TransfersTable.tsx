"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Building2,
  Calendar,
  FileText,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

import { TablePagination } from "@/components/common/TablePagination";
import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
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
import { IOrgUnit } from "@/types/org";
import { ITransfer } from "@/types/transfer";
import { formatDate } from "@/utils/date";

import TransferFormModal from "./TransferFormModal";

export default function TransfersTable() {
  const router = useRouter();
  const t = useTranslations("page_transfers");
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);

  // Filter state
  const [q, setQ] = useState("");
  const [unitId, setUnitId] = useState<string>("");

  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    unit_id: "",
  });

  // Fetch metadata for filters
  const { response: orgRes } = useGet<IOrgUnit[]>({
    url: endpoints.ORG_UNITS,
  });

  const orgUnits = orgRes || [];

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (appliedFilters.q) queryParams.append("q", appliedFilters.q);
  if (appliedFilters.unit_id)
    queryParams.append("unit_id", appliedFilters.unit_id);

  const { response, pending, reFetch } = useGet<{
    items: ITransfer[];
    total?: number;
    count?: number;
  }>({
    url: `${endpoints.TRANSFERS}?${queryParams.toString()}`,
  });
  const transfers = response?.items || [];
  const [isCreating, setIsCreating] = useState(false);

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
            <SelectTrigger className="min-w-[140px] max-w-[220px] w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <Building2
                  size={16}
                  className="text-muted-foreground/70 shrink-0"
                />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder={t("filters.all_units")} />
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
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setSkip(0);
              setAppliedFilters({
                q,
                unit_id: unitId,
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
              setAppliedFilters({
                q: "",
                unit_id: "",
              });
              setSkip(0);
            }}
            className="border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-95 shrink-0"
            title={t("filters.clear_all")}
          >
            <RotateCcw size={16} className="text-muted-foreground/70" />
          </Button>

          <Button
            onClick={() => setIsCreating(true)}
            className="flex-1 lg:flex-none bg-primary/95 hover:bg-primary shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {t("filters.create")}
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
              <TableHead className="font-semibold h-10 px-4 w-[130px] text-center">
                {t("table.record_number")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[110px] text-center">
                {t("table.transfer_type")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[120px] text-center">
                {t("table.date")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[220px]">
                {t("table.asset_details")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[240px]">
                {t("table.from_to")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[80px] text-center">
                {t("table.quantity")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[120px] text-center">
                {t("table.status")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[180px]">
                {t("table.reason")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={9} rows={6} />
            ) : transfers.length === 0 ? (
              <TableEmptyRow
                colSpan={9}
                icon={FileText}
                message={t("table.no_transfers_found")}
                description={t("table.no_transfers_description")}
              />
            ) : (
              transfers.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="group hover:bg-primary/3 transition-colors relative cursor-pointer"
                  onClick={() => router.push(`/transfers/${item.id}`)}
                >
                  <TableCell className="px-4 py-1.5 text-center text-sm text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
                    <div className="flex justify-center">
                      <span
                        className="text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit"
                        title={item.record_number}
                      >
                        {item.record_number}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
                    <span className="text-xs text-muted-foreground font-medium">
                      {item.transfer_type}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-sm text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Calendar
                        size={12}
                        className="text-muted-foreground/60 shrink-0"
                      />
                      <span>{formatDate(item.transfer_date)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                    <div className="flex flex-col gap-1">
                      <span
                        className="font-semibold text-sm truncate"
                        title={item.asset_name}
                      >
                        {item.asset_name}
                      </span>
                      <span className="text-xs text-muted-foreground/80 font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit">
                        {item.asset_code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`truncate ${item.from_name ? "font-medium" : "italic text-muted-foreground"}`}
                      >
                        {item.from_name || "—"}
                      </span>
                      <ArrowRight
                        size={12}
                        className="text-muted-foreground/50 shrink-0"
                      />
                      <span
                        className={`truncate ${item.to_name ? "font-medium" : "italic text-muted-foreground"}`}
                      >
                        {item.to_name || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center font-medium">
                    {item.total_assets}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-white shadow-sm"
                      style={{ backgroundColor: item.status_color }}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                    <span className="text-xs text-muted-foreground italic truncate block">
                      {item.reason || t("detail.no_reason")}
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
        count={transfers.length}
        total={response?.total ?? response?.count}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />

      {isCreating && (
        <TransferFormModal
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          onSuccess={() => reFetch()}
        />
      )}
    </div>
  );
}
