"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  Building2,
  Calendar,
  ClipboardList,
  RotateCcw,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

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
import { AppDispatch, RootState } from "@/redux";
import { closeRental } from "@/redux/slices/rental";
import { ICustomer } from "@/types/customer";
import { IOrgUnit } from "@/types/org";
import { IRentalSummary } from "@/types/rental";
import { formatDate } from "@/utils/date";

import RentalFormModal from "./RentalFormModal";

export default function RentalsTable() {
  const t = useTranslations("page_rentals");
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isOpen: rentalReduxOpen } = useSelector(
    (state: RootState) => state.rental,
  );

  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);

  // Filter state
  const [q, setQ] = useState("");
  const [unitId, setUnitId] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");

  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    unit_id: "",
    customer_id: "",
  });

  const [isCreating, setIsCreating] = useState(false);

  const isModalOpen = isCreating || rentalReduxOpen;

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
  if (appliedFilters.unit_id)
    queryParams.append("unit_id", appliedFilters.unit_id);
  if (appliedFilters.customer_id)
    queryParams.append("customer_id", appliedFilters.customer_id);

  const { response, pending, reFetch } = useGet<{ items: IRentalSummary[] }>({
    url: `${endpoints.RENTALS}?${queryParams.toString()}`,
  });
  const rentals = response?.items || [];

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = rentals.length === limit;

  return (
    <div className="w-full h-full flex flex-col min-h-0 p-3 gap-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 backdrop-blur-md rounded-md transition-all hover:border-border/80">
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

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={unitId}
            onValueChange={(val) => setUnitId(val === "none" ? "" : val)}
          >
            <SelectTrigger className="min-w-35 max-w-45 w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <Building2
                  size={16}
                  className="text-muted-foreground/70 shrink-0"
                />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder={t("organization")} />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-muted-foreground italic">
                {t("none")}
              </SelectItem>
              {orgUnits.map((o) => (
                <SelectItem key={o.id} value={o.id.toString()}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={customerId}
            onValueChange={(val) => setCustomerId(val === "none" ? "" : val)}
          >
            <SelectTrigger className="min-w-35 max-w-45 w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <Users
                  size={16}
                  className="text-muted-foreground/70 shrink-0"
                />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder={t("all_customers")} />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-muted-foreground italic">
                {t("none")}
              </SelectItem>
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
            className="flex-1 lg:flex-none shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {pending ? t("btn_searching") : t("btn_search")}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setQ("");
              setUnitId("");
              setCustomerId("");
              setAppliedFilters({
                q: "",
                unit_id: "",
                customer_id: "",
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
            {t("btn_create")}
          </Button>
        </div>
      </div>
      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                {t("table.no")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                {t("table.rental_record")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                {t("table.asset")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                {t("table.customer")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center">
                {t("table.total_assets")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                {t("table.reason")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                {t("table.lease_date")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center">
                {t("table.status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={8} rows={6} />
            ) : rentals.length === 0 ? (
              <TableEmptyRow
                colSpan={8}
                icon={ClipboardList}
                message={t("table.no_rentals_found")}
                description={t("table.no_rentals_description")}
              />
            ) : (
              rentals.map((rental, index) => (
                <TableRow
                  key={rental.id}
                  className="group hover:bg-primary/3 transition-colors relative cursor-pointer"
                  onClick={() => router.push(`/rentals/${rental.id}`)}
                >
                  <TableCell className="px-4 py-1.5 text-center text-sm text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-1.5">
                    <span className="font-semibold text-sm">
                      {rental.record_number}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-1.5">
                    <div className="flex flex-col max-w-[200px]">
                      <span
                        className="font-medium text-sm text-foreground/90 group-hover:text-primary transition-colors truncate"
                        title={rental.asset_name}
                      >
                        {rental.asset_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit mt-1">
                        {rental.asset_code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={12} className="text-muted-foreground" />
                      <span className="font-medium text-foreground/80">
                        {rental.customer_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center font-medium">
                    {rental.total_assets || 0}
                  </TableCell>
                  <TableCell className="px-4 py-1.5">
                    <span
                      className="text-xs text-muted-foreground italic truncate max-w-[200px] block"
                      title={rental.reason}
                    >
                      {rental.reason || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar
                        size={12}
                        className="text-muted-foreground/60"
                      />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(rental.lease_date)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: `${rental.status_color}15`,
                        color: rental.status_color,
                        borderColor: `${rental.status_color}30`,
                      }}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-none"
                    >
                      {rental.status}
                    </Badge>
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

      {isModalOpen && (
        <RentalFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsCreating(false);
            dispatch(closeRental());
          }}
          onSuccess={() => reFetch()}
        />
      )}
    </div>
  );
}
