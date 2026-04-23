"use client";

import { useState } from "react";

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

import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
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
import { IOrgUnit } from "@/types/org";
import { ITransfer } from "@/types/transfer";
import { formatDate } from "@/utils/date";

import TransferFormModal from "./TransferFormModal";

export default function TransfersTable() {
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);

  // Filter state
  const [q, setQ] = useState("");
  const [unitId, setUnitId] = useState<string>("all");

  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    unit_id: "all",
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
  if (appliedFilters.unit_id !== "all")
    queryParams.append("unit_id", appliedFilters.unit_id);

  const { response, pending, reFetch } = useGet<{ items: ITransfer[] }>({
    url: `${endpoints.TRANSFERS}?${queryParams.toString()}`,
  });
  const transfers = response?.items || [];

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = transfers.length === limit;

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
            placeholder="Search record number, asset..."
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
          <Select value={unitId} onValueChange={setUnitId}>
            <SelectTrigger className="min-w-[140px] max-w-[220px] w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <Building2
                  size={16}
                  className="text-muted-foreground/70 shrink-0"
                />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder="All units" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
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
            {pending ? "Searching..." : "Search"}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setQ("");
              setUnitId("all");
              setAppliedFilters({
                q: "",
                unit_id: "all",
              });
              setSkip(0);
            }}
            className="border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-95 shrink-0"
            title="Clear all filters"
          >
            <RotateCcw size={16} className="text-muted-foreground/70" />
          </Button>

          <Button
            onClick={() => setIsCreating(true)}
            className="flex-1 lg:flex-none bg-primary/95 hover:bg-primary shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            Create
          </Button>
        </div>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                No
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                Transfer Info
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">Date</TableHead>
              <TableHead className="font-semibold h-10 px-4">
                Asset Details
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">From/To</TableHead>
              <TableHead className="font-semibold h-10 px-4">Quantity</TableHead>
              <TableHead className="font-semibold h-10 px-4">Status</TableHead>
              <TableHead className="font-semibold h-10 px-4">Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={8} rows={6} />
            ) : transfers.length === 0 ? (
              <TableEmptyRow
                colSpan={8}
                icon={FileText}
                message="No transfers found"
                description="No transfer records match your search."
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
                  <TableCell className="px-4 py-3 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/5 p-2 rounded-lg text-primary shrink-0 opacity-70">
                        <FileText size={18} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm">
                          {item.record_number}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Type: {item.transfer_type}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar
                        size={12}
                        className="text-muted-foreground/60"
                      />
                      <span>{formatDate(item.transfer_date)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm">
                        {item.asset_name}
                      </span>
                      <span className="text-xs text-muted-foreground/80 font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit">
                        {item.asset_code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={
                          item.from_name
                            ? "font-medium"
                            : "italic text-muted-foreground"
                        }
                      >
                        {item.from_name || "N/A"}
                      </span>
                      <ArrowRight
                        size={12}
                        className="text-muted-foreground/50"
                      />
                      <span
                        className={
                          item.to_name
                            ? "font-medium"
                            : "italic text-muted-foreground"
                        }
                      >
                        {item.to_name || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm font-medium">
                    {item.total_assets}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-white shadow-sm"
                      style={{ backgroundColor: item.status_color }}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 max-w-[200px] truncate text-xs text-muted-foreground italic">
                    {item.reason || "No reason"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {transfers.length > 0 || skip > 0 ? (
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
