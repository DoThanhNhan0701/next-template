import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  Building2,
  Calendar,
  ClipboardList,
  MapPin,
  RotateCcw,
  Search,
  User,
  X,
} from "lucide-react";

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
import { IMyAuditsResponse } from "@/types/audit";
import { formatDate } from "@/utils/date";

import AuditFormModal from "./AuditFormModal";

export default function MyAuditsTable() {
  const t = useTranslations("page_audits");
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [auditTypeInput, setAuditTypeInput] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Applied filters (only updated when Search button is clicked)
  const [q, setQ] = useState("");
  const [auditType, setAuditType] = useState<string>("");

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (q) queryParams.append("q", q);

  const { response, pending, reFetch } = useGet<IMyAuditsResponse>({
    url: `${endpoints.AUDIT_MY_AUDITS}?${queryParams.toString()}`,
  });

  const allAudits = Array.isArray(response) ? response : response?.items || [];

  // Filter locally by audit_type
  const audits = !auditType
    ? allAudits
    : allAudits.filter((audit) => audit.audit_type === auditType);
  const handleSearch = () => {
    setQ(searchInput);
    setAuditType(auditTypeInput);
    setSkip(0);
  };

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
            placeholder={t("filters.search_placeholder")}
            className="pl-9 pr-10 bg-background/50 border-border/50 focus-visible:ring-primary/20 transition-all w-full"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Group */}
        <div className="flex flex-wrap items-center gap-2">
          <SelectField
            className="min-w-[200px]"
            value={auditTypeInput}
            onChange={(val) => setAuditTypeInput(val)}
            placeholder={t("filters.all_types")}
            options={[
              { label: t("filters.organization"), value: "unit" },
              { label: t("filters.location"), value: "location" },
            ]}
          />
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            onClick={handleSearch}
            className="transition-all active:scale-95 shrink-0"
          >
            {t("filters.btn_search")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setSearchInput("");
              setAuditTypeInput("");
              setQ("");
              setAuditType("");
              setSkip(0);
            }}
            className="border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-95 shrink-0"
            title="Clear all filters"
          >
            <RotateCcw size={16} className="text-muted-foreground/70" />
          </Button>
          <Button
            variant="default"
            onClick={() => setIsCreateModalOpen(true)}
            className="transition-all active:scale-95 shrink-0"
          >
            {t("filters.btn_create")}
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
              <TableHead className="font-semibold h-10 px-4 w-[300px]">
                {t("table.title")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[250px]">
                {t("table.type_target")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[180px]">
                {t("table.assignee")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[130px] text-center">
                {t("table.due_date")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[140px] text-center">
                {t("table.status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={6} rows={6} />
            ) : audits.length === 0 ? (
              <TableEmptyRow
                colSpan={6}
                icon={ClipboardList}
                message={t("table.no_audits_found")}
                description={t("table.no_audits_description")}
              />
            ) : (
              audits.map((audit, index) => (
                <TableRow
                  key={audit.id}
                  onClick={() => router.push(`/audits/sessions/${audit.id}`)}
                  className="group hover:bg-primary/3 transition-colors relative cursor-pointer"
                >
                  <TableCell className="px-4 py-1.5 text-center text-sm text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                    <div className="flex flex-col min-w-0">
                      <span
                        className="font-semibold text-sm truncate block"
                        title={audit.title}
                      >
                        {audit.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate block">
                        {t("table.created_at", {
                          date: formatDate(audit.created_at),
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <Badge
                        variant="outline"
                        className="w-fit text-[10px] px-1.5 py-0"
                      >
                        {audit.audit_type === "unit"
                          ? t("filters.organization")
                          : t("filters.location")}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-sm overflow-hidden">
                        {audit.audit_type === "unit" ? (
                          <>
                            <Building2
                              size={12}
                              className="text-muted-foreground shrink-0"
                            />
                            <span className="text-foreground/80 truncate block">
                              {audit.unit_obj?.name || "—"}
                            </span>
                          </>
                        ) : (
                          <>
                            <MapPin
                              size={12}
                              className="text-muted-foreground shrink-0"
                            />
                            <span className="text-foreground/80 truncate block">
                              {audit.location_obj?.name || "—"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 max-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <User
                        size={12}
                        className="text-muted-foreground shrink-0"
                      />
                      <span className="text-sm font-medium text-foreground/80 truncate block">
                        {audit.assignee?.full_name || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Calendar
                        size={12}
                        className="text-muted-foreground/60 shrink-0"
                      />
                      <span className="text-xs">
                        {formatDate(audit.due_date)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: `${audit.status_obj.color}15`,
                        color: audit.status_obj.color,
                        borderColor: `${audit.status_obj.color}30`,
                      }}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-none"
                    >
                      {audit.status_obj.name}
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
        count={audits.length}
        total={
          Array.isArray(response)
            ? undefined
            : ((response as { total?: number; count?: number })?.total ??
              (response as { total?: number; count?: number })?.count)
        }
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />

      <AuditFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => reFetch()}
      />
    </div>
  );
}
