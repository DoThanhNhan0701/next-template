"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  Calendar,
  ClipboardList,
  Filter,
  Mail,
  MapPin,
  RotateCcw,
  Search,
  User,
  X,
} from "lucide-react";

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
import { IStatus } from "@/types/status";
import { RentalReturnDocument } from "@/types/task";
import { formatDate } from "@/utils/date";

export default function RentalReturnTable() {
  const t = useTranslations("page_rental_returns");
  const tRentals = useTranslations("page_rentals");
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);

  // Filter state
  const [q, setQ] = useState("");
  const [statusCode, setStatusCode] = useState<string>("");

  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    status_code: "",
  });

  const { response: statusRes } = useGet<IStatus[]>({
    url: endpoints.STATUSES + "?category=rental_return",
  });

  const statuses = statusRes || [];

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (appliedFilters.q) queryParams.append("q", appliedFilters.q);
  if (appliedFilters.status_code)
    queryParams.append("status_code", appliedFilters.status_code);

  const { response, pending } = useGet<{
    items: RentalReturnDocument[];
    total: number;
  }>({
    url: `/api/v1/rentals/returns/all?${queryParams.toString()}`,
  });

  const rentalReturns = response?.items || [];
  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = rentalReturns.length === limit;

  return (
    <div className="w-full h-full flex flex-col min-h-0 p-3 gap-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 z-10 w-full transition-all">
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
            value={statusCode}
            onValueChange={(val) => setStatusCode(val === "none" ? "" : val)}
          >
            <SelectTrigger className="min-w-35 max-w-45 w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <Filter
                  size={16}
                  className="text-muted-foreground/70 shrink-0"
                />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder={t("all_statuses")} />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-muted-foreground italic">
                {tRentals("none")}
              </SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={s.code}>
                  {s.name}
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
                status_code: statusCode,
              });
            }}
            className="flex-1 lg:flex-none shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {pending ? tRentals("btn_searching") : tRentals("btn_search")}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setQ("");
              setStatusCode("");
              setAppliedFilters({
                q: "",
                status_code: "",
              });
              setSkip(0);
            }}
            className="border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-95 shrink-0"
            title="Clear all filters"
          >
            <RotateCcw size={16} className="text-muted-foreground/70" />
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
                {t("table.record_number")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                {t("table.customer")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                {t("table.contract")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                {t("table.return_location")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                {t("table.return_date")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center">
                {t("table.status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={7} rows={6} />
            ) : rentalReturns.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                icon={ClipboardList}
                message={t("table.no_returns_found")}
                description={t("table.no_returns_description")}
              />
            ) : (
              rentalReturns.map((rentalReturn, index) => {
                return (
                  <TableRow
                    key={rentalReturn.id}
                    className="group hover:bg-primary/3 transition-colors relative cursor-pointer"
                    onClick={() =>
                      router.push(`/rentals/returns/${rentalReturn.id}`)
                    }
                  >
                    <TableCell className="px-4 py-1.5 text-center text-muted-foreground">
                      {skip + index + 1}
                    </TableCell>
                    <TableCell className="px-4 py-1.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {rentalReturn.record_number}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit mt-1">
                          {rentalReturn.rental.record_number}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2">
                          <User size={12} className="text-muted-foreground" />
                          <span className="font-medium text-foreground/80">
                            {rentalReturn.rental.customer.name}
                          </span>
                        </div>
                        {rentalReturn.rental.customer.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-muted-foreground" />
                            <span className="text-xs">
                              {rentalReturn.rental.customer.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5">
                      <span className="text-sm font-medium">
                        {rentalReturn.rental.contract_number}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin
                          size={12}
                          className="text-muted-foreground/60"
                        />
                        <span className="text-sm">
                          {rentalReturn.to_location.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar
                          size={12}
                          className="text-muted-foreground/60"
                        />
                        <span className="text-xs">
                          {formatDate(rentalReturn.return_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1.5 text-center">
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${rentalReturn.status_obj.color}15`,
                          color: rentalReturn.status_obj.color,
                          borderColor: `${rentalReturn.status_obj.color}30`,
                        }}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-none"
                      >
                        {rentalReturn.status_obj.name}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {rentalReturns.length > 0 || skip > 0 ? (
        <Pagination className="flex w-full justify-end">
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
