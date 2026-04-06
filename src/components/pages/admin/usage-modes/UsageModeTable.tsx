"use client";

import { useState } from "react";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { IUsageMode } from "@/types/usage-mode";
import { EditIcon, Trash2Icon, PlusIcon } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import UsageModeFormModal from "./UsageModeFormModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function UsageModeTable() {
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);
  const [isActive, setIsActive] = useState<string>("all");

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });
  if (isActive !== "all") {
    queryParams.append("is_active", isActive);
  }

  const { response, pending, reFetch, setResponse } = useGet<IUsageMode[]>({
    url: `${endpoints.USAGE_MODES}?${queryParams.toString()}`,
  });
  const usageModes = response || [];

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = usageModes.length === limit;

  const [isCreating, setIsCreating] = useState(false);
  const [usageModeToEdit, setUsageModeToEdit] = useState<IUsageMode | null>(
    null,
  );
  const [usageModeToDelete, setUsageModeToDelete] = useState<IUsageMode | null>(
    null,
  );

  const handleSuccess = (responseData?: unknown, method?: string) => {
    if (responseData && (method === "patch" || method === "post")) {
      reFetch();
      return;
    } else if (method === "delete" && usageModeToDelete) {
      setResponse((prev: IUsageMode[] | null) =>
        prev
          ? prev.filter((s: IUsageMode) => s.id !== usageModeToDelete.id)
          : null,
      );
      return;
    }
    reFetch();
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-2">
      <div className="flex items-center justify-between w-full">
        <Select
          value={isActive}
          onValueChange={(val) => {
            setIsActive(val);
            setSkip(0);
          }}
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsCreating(true)}>
          <PlusIcon size={16} className="mr-2" />
          Add Usage Mode
        </Button>
      </div>

      <div className="border border-(--surface-border-color) rounded-lg flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[15%]">
                Code
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%]">
                Name
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[15%] text-center">
                Color
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[25%]">
                Description
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[10%]">
                Status
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right w-[15%]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-3 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : usageModes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-3 text-center">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              usageModes.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="px-4 py-3 font-medium text-foreground">
                    {item.code}
                  </TableCell>
                  <TableCell className="px-4 py-3">{item.name}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-border/50"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-mono text-xs uppercase">
                        {item.color}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 max-w-[200px] truncate">
                    {item.description}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {item.is_active ? (
                      <span className="text-green-600 bg-green-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="text-red-600 bg-red-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setUsageModeToEdit(item)}
                      >
                        <EditIcon size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                        onClick={() => setUsageModeToDelete(item)}
                      >
                        <Trash2Icon size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {usageModes.length > 0 || skip > 0 ? (
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

            {currentPage > 1 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSkip(0);
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>
            )}

            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {currentPage > 2 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSkip((currentPage - 2) * limit);
                  }}
                >
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationLink href="#" isActive>
                {currentPage}
              </PaginationLink>
            </PaginationItem>

            {hasMore && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSkip(currentPage * limit);
                  }}
                >
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {hasMore && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

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

      <UsageModeFormModal
        isOpen={isCreating || usageModeToEdit !== null}
        onClose={() => {
          setIsCreating(false);
          setUsageModeToEdit(null);
        }}
        usageModeToEdit={usageModeToEdit}
        onSuccess={handleSuccess}
      />
      <ConfirmDeleteModal
        isOpen={usageModeToDelete !== null}
        onClose={() => setUsageModeToDelete(null)}
        usageMode={usageModeToDelete}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
