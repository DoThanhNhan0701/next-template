"use client";

import { useState } from "react";

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
import { IMaintenance } from "@/types/maintenance";
import { formatDate } from "@/utils/date";

import MaintenanceFormModal from "./MaintenanceFormModal";

export default function MaintenanceTable() {
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);

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

  const { response, pending, reFetch } = useGet<{ items: IMaintenance[] }>({
    url: `${endpoints.MAINTENANCES}?${queryParams.toString()}`,
  });
  const maintenances = response?.items || [];

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = maintenances.length === limit;

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
            placeholder="Search record number, asset..."
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

        {/* Action Group */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setSkip(0);
              setAppliedFilters({
                q,
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
              setAppliedFilters({
                q: "",
              });
              setSkip(0);
            }}
            className="h-10 w-10 border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-95 shrink-0"
            title="Clear all filters"
          >
            <RotateCcw size={16} className="text-muted-foreground/70" />
          </Button>
          <Button
            onClick={() => setIsCreating(true)}
            className="flex-1 lg:flex-none h-10 bg-primary/95 hover:bg-primary shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            Create
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
              <TableHead className="font-semibold h-10 px-4">
                Maintenance info
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">Date</TableHead>
              <TableHead className="font-semibold h-10 px-4">
                Asset details
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                Service provider
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">Quantity</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center">Status</TableHead>
              <TableHead className="font-semibold h-10 px-4">Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={8} rows={6} />
            ) : maintenances.length === 0 ? (
              <TableEmptyRow
                colSpan={8}
                icon={Wrench}
                message="No maintenance records found"
                description="No records match your search."
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
                          Ticket: {item.ticket_number}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar
                          size={12}
                          className="text-muted-foreground/60"
                        />
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Out:
                        </span>

                        <span>{formatDate(item.outing_date)}</span>
                      </div>
                      {item.return_date && (
                        <div className="flex items-center gap-1.5">
                          <RotateCcw
                            size={12}
                            className="text-muted-foreground/60"
                          />
                          <span className="text-[11px] font-medium text-muted-foreground">
                            In:
                          </span>
                          <span>{formatDate(item.return_date)}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Package
                          size={14}
                          className="text-muted-foreground/60"
                        />
                        <span className="font-semibold text-sm">
                          {item.asset_name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground/80 font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit">
                        {item.asset_code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    {item.service_provider_name || "N/A"}
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
                  <TableCell className="px-4 py-3 max-w-[200px] truncate text-xs text-muted-foreground italic">
                    {item.reason || "No reason"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {maintenances.length > 0 || skip > 0 ? (
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
        <MaintenanceFormModal
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          onSuccess={() => reFetch()}
        />
      )}
    </div>
  );
}
