"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  MapPin,
  Package,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useDispatch } from "react-redux";

import { TablePagination } from "@/components/common/TablePagination";
import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { AppDispatch } from "@/redux";
import { openStockAdjustment } from "@/redux/slices/stockAdjustment";
import { ILocation } from "@/types/location";
import { IStock } from "@/types/stock";

export default function InventoryTable() {
  const t = useTranslations("page_inventory");
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Filter state
  const [q, setQ] = useState("");
  const [locationId, setLocationId] = useState<string>("");
  const [showZero, setShowZero] = useState<boolean>(false);

  // Applied filter state to avoid re-fetching on every keystroke
  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    location_id: "",
    show_zero: false,
  });

  // Fetch locations for filter
  const { response: locationRes } = useGet<ILocation[]>({
    url: endpoints.LOCATIONS,
  });
  const locations = locationRes || [];

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (appliedFilters.q) queryParams.append("q", appliedFilters.q);
  if (appliedFilters.location_id)
    queryParams.append("location_id", appliedFilters.location_id);

  queryParams.append("show_zero", appliedFilters.show_zero.toString());

  const { response, pending } = useGet<{
    items: IStock[];
    total?: number;
    count?: number;
  }>({
    url: `${endpoints.STOCKS}?${queryParams.toString()}`,
  });

  const stocks = response?.items || [];

  const handleStockAction = (stock: IStock, type: "INCREASE" | "DECREASE") => {
    dispatch(
      openStockAdjustment({
        asset_id: stock.asset_id,
        location_id: stock.location_id,
        adjustment_type: type,
      }),
    );
    router.push("/stock-in-out");
  };

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
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={locationId}
            onValueChange={(val) => setLocationId(val === "none" ? "" : val)}
          >
            <SelectTrigger className="min-w-[140px] max-w-[240px] w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <MapPin
                  size={16}
                  className="text-muted-foreground/70 shrink-0"
                />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder={t("filters.all_locations")} />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-muted-foreground italic">
                {t("filters.none")}
              </SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id.toString()}>
                  {loc.name} - ({loc.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2 bg-background/50 border border-border/50 h-9 px-3 rounded-md">
            <Checkbox
              id="show-zero"
              checked={showZero}
              onCheckedChange={(checked) => setShowZero(checked as boolean)}
            />
            <label
              htmlFor="show-zero"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {t("filters.show_zero_quantity")}
            </label>
          </div>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setSkip(0);
              setAppliedFilters({
                q,
                location_id: locationId,
                show_zero: showZero,
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
              setLocationId("");
              setShowZero(false);
              setAppliedFilters({
                q: "",
                location_id: "",
                show_zero: false,
              });
              setSkip(0);
            }}
            className="border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-95 shrink-0"
            title={t("filters.clear")}
          >
            <RotateCcw size={16} className="text-muted-foreground/70" />
          </Button>
        </div>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap table-fixed w-full">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[50px] text-center">
                {t("table.no")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[300px]">
                {t("table.asset_information")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[100px] text-center">
                {t("table.asset_code")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[220px] text-center">
                {t("table.location")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[140px] text-center">
                {t("table.management_type")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[100px]">
                {t("table.quantity")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[200px]">
                {t("table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={7} rows={6} />
            ) : stocks.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                icon={Package}
                message={t("table.no_items_found")}
                description={t("table.no_items_description")}
              />
            ) : (
              stocks.map((stock, index) => (
                <TableRow
                  key={stock.id}
                  className="group hover:bg-primary/3 transition-colors relative"
                >
                  <TableCell className="px-4 py-1.5 text-center text-sm text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className="font-semibold text-sm group-hover:text-primary transition-colors truncate"
                          title={stock.asset_name}
                        >
                          {stock.asset_name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
                    <div className="flex justify-center">
                      <span className="text-muted-foreground/80 font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit">
                        {stock.asset_code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 px-2.5 py-1.5 bg-secondary/30 rounded-md w-fit mx-auto">
                      <MapPin size={14} className="text-primary/70 shrink-0" />
                      <span className="text-sm font-medium">
                        {stock.location_name || t("table.unknown_location")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
                    {stock.management_type === "unique" ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-600">
                        {t("table.by_code")}
                      </span>
                    ) : stock.management_type === "bulk" ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600">
                        {t("table.by_quantity")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground">
                        {stock.management_type || "—"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
                    <div
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold ${
                        stock.quantity > 0
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 border border-red-500/20"
                      }`}
                    >
                      {stock.quantity}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/15 hover:text-emerald-600 text-xs gap-1.5 disabled:opacity-30 disabled:bg-transparent"
                        onClick={() => handleStockAction(stock, "INCREASE")}
                        disabled={stock.management_type === "unique"}
                      >
                        <ArrowUpCircle size={14} className="shrink-0" />
                        {t("table.stock_in")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-rose-500 bg-rose-500/5 hover:bg-rose-500/15 hover:text-rose-600 text-xs gap-1.5 disabled:opacity-30 disabled:bg-transparent"
                        onClick={() => handleStockAction(stock, "DECREASE")}
                        disabled={stock.management_type === "unique"}
                      >
                        <ArrowDownCircle size={14} className="shrink-0" />
                        {t("table.stock_out")}
                      </Button>
                    </div>
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
        count={stocks.length}
        total={response?.total ?? response?.count}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />
    </div>
  );
}
