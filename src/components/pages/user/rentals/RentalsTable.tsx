"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  Calendar,
  ClipboardList,
  RotateCcw,
  Search,
  User,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { SelectField } from "@/components/common/SelectField";
import { TablePagination } from "@/components/common/TablePagination";
import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
import { Badge } from "@/components/ui/badge";
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
  const [limit, setLimit] = useState(20);

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

  const { response, pending, reFetch } = useGet<{
    items: IRentalSummary[];
    total?: number;
    count?: number;
  }>({
    url: `${endpoints.RENTALS}?${queryParams.toString()}`,
  });
  const rentals = response?.items || [];
  return (
    <div className="w-full h-full flex flex-col min-h-0 p-3 gap-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-2 backdrop-blur-md rounded-md transition-all hover:border-border/80">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 min-w-0 flex-1">
          <SelectField
            className="w-full min-w-0"
            options={(orgUnits ?? [])
              .filter((c) => c.is_active)
              .map((c) => ({
                label: `${c.name} (${c.code})`,
                value: c.id.toString(),
              }))}
            value={unitId}
            onChange={(val) => setUnitId(val)}
            placeholder={t("organization")}
          />

          <SelectField
            className="w-full min-w-0"
            options={(customers ?? [])
              .filter((c) => c.is_active)
              .map((c) => ({
                label: c.name,
                value: c.id.toString(),
              }))}
            value={customerId}
            onChange={(val) => setUnitId(val)}
            placeholder={t("all_customers")}
          />

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
              className="lg:flex-none shadow-sm hover:shadow-md transition-all active:scale-95 w-max"
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
          </div>
        </div>

        <div className="flex items-center gap-2">
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
                {t("table.no")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[120px] text-center">
                {t("table.rental_record")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[320px]">
                {t("table.asset")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[160px]">
                {t("table.customer")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[80px] text-center">
                {t("table.total_assets")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[130px] text-center">
                {t("table.lease_date")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[140px]">
                {t("table.status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={7} rows={6} />
            ) : rentals.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
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
                  <TableCell className="px-4 py-1.5 text-center">
                    <div className="flex justify-center">
                      <span
                        className="text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit"
                        title={rental.record_number}
                      >
                        {rental.record_number}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                    <div className="flex flex-col">
                      <span
                        className="font-medium text-sm text-foreground/90 group-hover:text-primary transition-colors truncate"
                        title={rental.asset_name}
                      >
                        {rental.asset_name}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit mt-1">
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
                  <TableCell className="px-4 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Calendar
                        size={12}
                        className="text-muted-foreground/60 shrink-0"
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

      <TablePagination
        skip={skip}
        limit={limit}
        count={rentals.length}
        total={response?.total ?? response?.count}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />

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
