import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  Building2,
  Calendar,
  ClipboardList,
  Filter,
  MapPin,
  Plus,
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
import { IMyAuditsResponse } from "@/types/audit";
import { formatDate } from "@/utils/date";

import AuditFormModal from "./AuditFormModal";

export default function MyAuditsTable() {
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [auditTypeInput, setAuditTypeInput] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Applied filters (only updated when Search button is clicked)
  const [q, setQ] = useState("");
  const [auditType, setAuditType] = useState<string>("all");

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (q) queryParams.append("q", q);

  const { response, pending, reFetch } = useGet<IMyAuditsResponse>({
    url: `${endpoints.AUDIT_MY_AUDITS}?${queryParams.toString()}`,
  });

  const allAudits = response || [];

  // Filter locally by audit_type
  const audits =
    auditType === "all"
      ? allAudits
      : allAudits.filter((audit) => audit.audit_type === auditType);

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = allAudits.length === limit;

  const handleSearch = () => {
    setQ(searchInput);
    setAuditType(auditTypeInput);
    setSkip(0);
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 p-4 gap-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 backdrop-blur-md rounded-md shadow-sm transition-all hover:border-border/80">
        {/* Search Group */}
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            size={16}
          />
          <Input
            placeholder="Search audits..."
            className="pl-9 pr-10 h-10 bg-background/50 border-border/50 focus-visible:ring-primary/20 transition-all w-full"
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
          <Select value={auditTypeInput} onValueChange={setAuditTypeInput}>
            <SelectTrigger className="min-w-35 max-w-55 w-full sm:w-fit h-10 bg-background/50 border-border/50 transition-all hover:bg-background/80">
              <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                <Filter
                  size={16}
                  className="text-muted-foreground/70 shrink-0"
                />
                <div className="truncate flex-1 min-w-0">
                  <SelectValue placeholder="All Types" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="unit">Organization</SelectItem>
              <SelectItem value="location">Location</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            onClick={handleSearch}
            className="h-10 px-4 transition-all active:scale-95 shrink-0"
          >
            <Search size={16} className="mr-2" />
            Search
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setSearchInput("");
              setAuditTypeInput("all");
              setQ("");
              setAuditType("all");
              setSkip(0);
            }}
            className="h-10 w-10 border-border/50 bg-background/50 hover:bg-background/80 transition-all active:scale-95 shrink-0"
            title="Clear all filters"
          >
            <RotateCcw size={16} className="text-muted-foreground/70" />
          </Button>
          <Button
            variant="default"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 px-4 transition-all active:scale-95 shrink-0"
          >
            <Plus size={16} className="mr-2" />
            Tạo mới
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
              <TableHead className="font-semibold h-10 px-4">Title</TableHead>
              <TableHead className="font-semibold h-10 px-4">
                Type / Target
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                Assignee
              </TableHead>
              <TableHead className="font-semibold h-10 px-4">
                Due Date
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center">
                Status
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
                message="No audits found"
                description="No audit sessions match your current search criteria."
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
                  <TableCell className="px-4 py-1.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {audit.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Created {formatDate(audit.created_at)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5">
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant="outline"
                        className="w-fit text-[10px] px-1.5 py-0"
                      >
                        {audit.audit_type === "unit"
                          ? "Organization"
                          : "Location"}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-sm">
                        {audit.audit_type === "unit" ? (
                          <>
                            <Building2
                              size={12}
                              className="text-muted-foreground"
                            />
                            <span className="text-foreground/80">
                              {audit.unit_obj?.name || "—"}
                            </span>
                          </>
                        ) : (
                          <>
                            <MapPin
                              size={12}
                              className="text-muted-foreground"
                            />
                            <span className="text-foreground/80">
                              {audit.location_obj?.name || "—"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground/80">
                        {audit.assignee.full_name}
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

      {audits.length > 0 || skip > 0 ? (
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

      <AuditFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => reFetch()}
      />
    </div>
  );
}
