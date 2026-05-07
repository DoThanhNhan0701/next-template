"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  Calendar,
  FileText,
  Package,
  RotateCcw,
  Search,
  Wrench,
  X,
} from "lucide-react";

import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/common/TablePagination";
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
import { IMaintenance } from "@/types/maintenance";
import { formatDate } from "@/utils/date";

import MaintenanceFormModal from "./MaintenanceFormModal";

export default function MaintenanceTable() {
  const router = useRouter();
  const t = useTranslations("page_maintenance.table");
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

  const { response, pending, reFetch } = useGet<{ items: IMaintenance[]; total?: number; count?: number; }>({
    url: `${endpoints.MAINTENANCES}?${queryParams.toString()}`,
  });
  const maintenances = response?.items || [];
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

        {/* Action Group */}
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
                {t("maintenance_info")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[200px] text-center">
                {t("date")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[250px]">
                {t("asset_details")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[180px]">
                {t("service_provider")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[80px] text-center">
                {t("quantity")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[140px] text-center">
                {t("status")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[180px]">
                {t("reason")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={8} rows={6} />
            ) : maintenances.length === 0 ? (
              <TableEmptyRow
                colSpan={8}
                icon={Wrench}
                message={t("empty_title")}
                description={t("empty_desc")}
              />
            ) : (
              maintenances.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="group hover:bg-primary/3 transition-colors relative cursor-pointer"
                  onClick={() => router.push(`/maintenance/${item.id}`)}
                >
                  <TableCell className="px-4 py-1.5 text-center text-sm text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 relative text-center">
                    <div className="flex items-center justify-center gap-3 overflow-hidden">
                      <div className="bg-primary/5 p-2 rounded-lg text-primary shrink-0 opacity-70">
                        <FileText size={18} />
                      </div>
                      <div className="flex flex-col gap-0.5 overflow-hidden text-left">
                        <span className="font-semibold text-sm truncate block">
                          {t("record_number", { value: item.record_number })}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium truncate block">
                          {t("ticket_number", { value: item.ticket_number })}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-center">
                    <div className="flex flex-col gap-1 overflow-hidden items-center">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <Calendar
                          size={12}
                          className="text-muted-foreground/60 shrink-0"
                        />
                        <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                          {t("outing")}
                        </span>
                        <span className="truncate">{formatDate(item.outing_date)}</span>
                      </div>
                      {item.return_date && (
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <RotateCcw
                            size={12}
                            className="text-muted-foreground/60 shrink-0"
                          />
                          <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                            {t("return")}
                          </span>
                          <span className="truncate">{formatDate(item.return_date)}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 max-w-0 overflow-hidden">
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Package
                          size={14}
                          className="text-muted-foreground/60 shrink-0"
                        />
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
                  <TableCell
                    className="px-4 py-3 text-sm max-w-0 overflow-hidden"
                  >
                    <span className="truncate block" title={item.service_provider_name}>
                      {item.service_provider_name || t("none")}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm font-medium text-center">
                    {item.total_assets}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-white shadow-sm"
                      style={{ backgroundColor: item.status_color }}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 max-w-0 overflow-hidden">
                    <span className="truncate block text-xs text-muted-foreground italic" title={item.reason || t("no_reason")}>
                      {item.reason || t("no_reason")}
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
        count={maintenances.length} total={response?.total ?? response?.count} pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />

      {isCreating && (
        <MaintenanceFormModal
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          onSuccess={() => reFetch()}
        />
      )}
    </div>
  );
}
