"use client";

import { useState } from "react";
import { endpoints, dynamicEndpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { IRental } from "@/types/rental";
import { IOrgUnit } from "@/types/org";
import { ICustomer } from "@/types/customer";
import {
  FileText,
  PlusIcon,
  Search,
  Building2,
  Users,
  X,
  RotateCcw,
  Calendar,
  Box,
  CornerDownLeft,
} from "lucide-react";
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
import RentalFormModal from "./RentalFormModal";
import { useMutation } from "@/hooks/useMutation";

export default function RentalsTable() {
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);

  // Filter state
  const [q, setQ] = useState("");
  const [unitId, setUnitId] = useState<string>("all");
  const [customerId, setCustomerId] = useState<string>("all");

  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    unit_id: "all",
    customer_id: "all",
  });

  // Fetch metadata for filters
  const { response: orgRes } = useGet<IOrgUnit[]>({
    url: endpoints.ORG_UNITS,
  });
  const { response: cusRes } = useGet<{ data: ICustomer[] }>({
    url: endpoints.CUSTOMERS,
  });

  const orgUnits = orgRes || [];
  const customers = cusRes?.data || [];

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (appliedFilters.q) queryParams.append("q", appliedFilters.q);
  if (appliedFilters.unit_id !== "all")
    queryParams.append("unit_id", appliedFilters.unit_id);
  if (appliedFilters.customer_id !== "all")
    queryParams.append("customer_id", appliedFilters.customer_id);

  const { response, pending, reFetch } = useGet<IRental[]>({
    url: `${endpoints.RENTALS}?${queryParams.toString()}`,
  });
  const rentals = response || [];

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = rentals.length === limit;

  const [isCreating, setIsCreating] = useState(false);
  const [rentalToReturn, setRentalToReturn] = useState<IRental | null>(null);

  const { mutate: mutateReturn } = useMutation();

  const handleReturnAction = async (rentalId: number) => {
    const { error } = await mutateReturn({
      url: dynamicEndpoints.RENTAL_RETURN(rentalId),
      method: "post",
    });
    if (error) {
      alert("Lỗi khi hoàn trả tài sản");
    } else {
      alert("Hoàn trả thành công!");
      reFetch();
    }
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-2">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-card/60 backdrop-blur-md p-4 rounded-xl border border-border/50 shadow-sm transition-all hover:border-border/80">
        {/* Search Group */}
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            size={16}
          />
          <Input
            placeholder="Record Number, Contract..."
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
                  <SelectValue placeholder="All Units" />
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

          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger className="min-w-[140px] max-w-[220px] w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <Users
                  size={16}
                  className="text-muted-foreground/70 shrink-0"
                />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder="All Customers" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers?.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
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
                customer_id: customerId,
              });
            }}
            className="flex-1 lg:flex-none h-10 px-6 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {pending ? "Searching..." : "Search Rentals"}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setQ("");
              setUnitId("all");
              setCustomerId("all");
              setAppliedFilters({
                q: "",
                unit_id: "all",
                customer_id: "all",
              });
              setSkip(0);
            }}
            className="h-10 w-10 border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-95 shrink-0"
            title="Clear all filters"
          >
            <RotateCcw size={16} className="text-muted-foreground/70" />
          </Button>

          <div className="hidden sm:block w-px h-6 bg-border/60 mx-1 shrink-0" />

          <Button
            onClick={() => setIsCreating(true)}
            className="flex-1 lg:flex-none h-10 bg-primary/95 hover:bg-primary shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <PlusIcon size={16} className="mr-2" />
            Create Rental
          </Button>
        </div>
      </div>

      <div className="border border-(--surface-border-color) rounded-lg flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4">
                Rental Info
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                Ownership / Customer
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                Lease Details
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">Items</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-3 text-center">
                  Loading rentals...
                </TableCell>
              </TableRow>
            ) : rentals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-3 text-center">
                  No rentals found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              rentals.map((rental) => (
                <TableRow
                  key={rental.id}
                  className="group hover:bg-primary/3 transition-colors relative"
                >
                  <TableCell className="px-4 py-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 opacity-80" />
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/5 p-2 rounded-lg text-primary transition-colors group-hover:bg-primary/10 shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {rental.record_number}
                        </span>
                        {rental.contract_number && (
                          <span className="text-xs text-muted-foreground/80 font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit">
                            HĐ: {rental.contract_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1.5 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2
                          size={14}
                          className="text-emerald-600/70 shrink-0"
                        />
                        <span className="font-medium text-foreground/80">
                          {rental.unit?.name || "No Unit"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users
                          size={14}
                          className="text-blue-600/70 shrink-0"
                        />
                        <span className="text-xs">
                          {rental.customer?.name || "No Customer"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar
                          size={12}
                          className="text-muted-foreground/60"
                        />
                        <span className="text-xs">
                          {rental.lease_date?.split("T")[0] || "N/A"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium ml-1">
                          ({rental.duration_days} days)
                        </span>
                      </div>
                      <span className="font-bold text-sm text-foreground/90 mt-1">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(rental.total_revenue || 0)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-xs">
                      {rental.details?.length > 0 ? (
                        <>
                          <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                            <Box size={14} className="text-orange-500/80" />
                            <span>{rental.details.length} Items</span>
                          </div>
                          <div className="text-muted-foreground truncate max-w-[200px]">
                            {rental.details
                              .map((d) => d.asset?.name)
                              .join(", ")}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground italic">
                          No items
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-primary hover:bg-primary/10 hover:text-primary transition-all rounded-md"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Hoàn trả các tài sản trong phiếu này?",
                          )
                        ) {
                          handleReturnAction(rental.id);
                        }
                      }}
                    >
                      <CornerDownLeft size={14} className="mr-1.5" />
                      Hoàn trả
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {rentals.length > 0 || skip > 0 ? (
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
        <RentalFormModal
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          onSuccess={() => reFetch()}
        />
      )}
    </div>
  );
}
