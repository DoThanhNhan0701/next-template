"use client";

import { useMemo } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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

const PAGE_SIZE_OPTIONS = [50, 100, 200, 500];

interface TablePaginationProps {
  skip: number;
  limit: number;
  count: number; // number of items on the current page
  total?: number; // total number of items
  pending?: boolean;
  onPageChange: (newSkip: number) => void;
  onLimitChange: (newLimit: number) => void;
}

export function TablePagination({
  skip,
  limit,
  count,
  total,
  pending = false,
  onPageChange,
  onLimitChange,
}: TablePaginationProps) {
  const hasMore = total !== undefined ? skip + limit < total : count === limit;
  const currentPage = Math.floor(skip / limit) + 1;
  const from = skip + 1;
  const to = skip + count;

  const totalPages = total !== undefined ? Math.ceil(total / limit) : null;

  const pageNumbers = useMemo(() => {
    if (totalPages === null) return null;
    const pages: (number | string)[] = [];
    const showSearch = 1;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > showSearch + 2) {
        pages.push("ellipsis-1");
      }
      const start = Math.max(2, currentPage - showSearch);
      const end = Math.min(totalPages - 1, currentPage + showSearch);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - (showSearch + 1)) {
        pages.push("ellipsis-2");
      }
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  if (count === 0 && skip === 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="font-medium">
          {from} – {to} {total !== undefined ? `/ ${total}` : ""}
        </span>
        <Select
          value={limit.toString()}
          onValueChange={(val) => {
            onLimitChange(Number(val));
            onPageChange(0);
          }}
        >
          <SelectTrigger className="">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem
                key={size}
                value={size.toString()}
                className="text-xs"
              >
                {size} / trang
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right: pagination controls */}
      <Pagination className="w-auto mx-0">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (skip > 0 && !pending)
                  onPageChange(Math.max(0, skip - limit));
              }}
              className={
                skip === 0 || pending ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>

          {pageNumbers ? (
            pageNumbers.map((page) => (
              <PaginationItem
                key={typeof page === "string" ? page : `page-${page}`}
              >
                {typeof page === "string" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!pending && page !== currentPage) {
                        onPageChange((page - 1) * limit);
                      }
                    }}
                    isActive={page === currentPage}
                    className="h-8 w-8 text-xs"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))
          ) : (
            <PaginationItem>
              <PaginationLink href="#" isActive className="h-8 w-8 text-xs">
                {currentPage}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (hasMore && !pending) onPageChange(skip + limit);
              }}
              className={
                !hasMore || pending ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
