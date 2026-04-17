"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { IStock } from "@/types/stock";
import { ILocation } from "@/types/location";
import { Search, X, RotateCcw, MapPin, Package, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import {
  TableLoadingRows,
  TableEmptyRow,
} from "@/components/common/TableStateDisplay";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AppDispatch } from "@/redux";
import { openStockAdjustment } from "@/redux/slices/stockAdjustment";
import { useRouter } from "next/navigation";

export default function InventoryTable() {
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Filter state
  const [q, setQ] = useState("");
  const [locationId, setLocationId] = useState<string>("all");
  const [showZero, setShowZero] = useState<boolean>(false);

  // Applied filter state to avoid re-fetching on every keystroke
  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    location_id: "all",
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
  if (appliedFilters.location_id !== "all")
    queryParams.append("location_id", appliedFilters.location_id);

  queryParams.append("show_zero", appliedFilters.show_zero.toString());

  const { response, pending } = useGet<{ items: IStock[] }>({
    url: `${endpoints.STOCKS}?${queryParams.toString()}`,
  });

  const stocks = response?.items || [];

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = stocks.length === limit;

  const handleStockAction = (stock: IStock, type: "INCREASE" | "DECREASE") => {
    dispatch(openStockAdjustment({
      asset_id: stock.asset_id,
      location_id: stock.location_id,
      adjustment_type: type,
    }));
    router.push("/stock-in-out");
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-2">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-card/60 backdrop-blur-md p-4 rounded-md border border-border/50 shadow-sm transition-all hover:border-border/80">
        {/* Search Group */}
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            size={16}
          />
          <Input
            placeholder="Search by asset code or name..."
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
        <div className="flex flex-wrap items-center gap-4">
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger className="min-w-[140px] max-w-[240px] w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <MapPin
                  size={16}
                  className="text-muted-foreground/70 shrink-0"
                />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder="All Locations" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id.toString()}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2 bg-background/50 border border-border/50 h-10 px-3 rounded-md">
            <Checkbox
              id="show-zero"
              checked={showZero}
              onCheckedChange={(checked) => setShowZero(checked as boolean)}
            />
            <label
              htmlFor="show-zero"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Show Zero Quantity
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
            className="flex-1 lg:flex-none h-10 px-6 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {pending ? "Searching..." : "Search"}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setQ("");
              setLocationId("all");
              setShowZero(false);
              setAppliedFilters({
                q: "",
                location_id: "all",
                show_zero: false,
              });
              setSkip(0);
            }}
            className="h-10 w-10 border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-95 shrink-0"
            title="Clear all filters"
          >
            <RotateCcw size={16} className="text-muted-foreground/70" />
          </Button>
        </div>
      </div>

      <div className="border border-(--surface-border-color) rounded-lg flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                No
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[35%]">
                Asset Information
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%] text-center">
                Location
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[15%] text-center">
                Loại quản lý
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[10%]">
                Quantity
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[20%]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={6} rows={6} />
            ) : stocks.length === 0 ? (
              <TableEmptyRow
                colSpan={6}
                icon={Package}
                message="No inventory items found"
                description="No stock records match your current filters. Try adjusting your search or location."
              />
            ) : (
              stocks.map((stock, index) => (
                <TableRow
                  key={stock.id}
                  className="group hover:bg-primary/3 transition-colors relative"
                >
                  <TableCell className="px-4 py-3 text-center text-sm text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/5 p-2 rounded-lg text-primary transition-colors group-hover:bg-primary/10 shrink-0">
                        <Package size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {stock.asset_name}
                        </span>
                        <span className="text-xs text-muted-foreground/80 font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit mt-1">
                          {stock.asset_code}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2 px-2.5 py-1.5 bg-secondary/30 rounded-md w-fit mx-auto">
                      <MapPin size={14} className="text-primary/70 shrink-0" />
                      <span className="text-sm font-medium">
                        {stock.location_name || "Unknown Location"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {stock.management_type === "unique" ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-600">
                        Theo Mã
                      </span>
                    ) : stock.management_type === "bulk" ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600">
                        Theo SL
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground">
                        {stock.management_type || "—"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <div
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold ${stock.quantity > 0
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-600 border border-red-500/20"
                        }`}
                    >
                      {stock.quantity}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-green-600 hover:bg-green-500/10 hover:text-green-700 text-xs gap-1 disabled:opacity-40"
                        onClick={() => handleStockAction(stock, "INCREASE")}
                        disabled={stock.management_type === "unique"}
                      >
                        <ArrowUpCircle size={13} />
                        Stock In
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 text-xs gap-1 disabled:opacity-40"
                        onClick={() => handleStockAction(stock, "DECREASE")}
                        disabled={stock.management_type === "unique"}
                      >
                        <ArrowDownCircle size={13} />
                        Stock Out
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {stocks.length > 0 || skip > 0 ? (
        <Pagination className="flex w-full justify-end mt-1">
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
