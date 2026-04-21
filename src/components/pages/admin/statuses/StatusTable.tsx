"use client";

import { useState } from "react";

import { CircleDot, EditIcon, PlusIcon, Trash2Icon } from "lucide-react";

import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
import { Button } from "@/components/ui/button";
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

import ConfirmDeleteModal from "./ConfirmDeleteModal";
import StatusFormModal from "./StatusFormModal";

export default function StatusTable() {
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);

  const queryParams = new URLSearchParams({
    category: "asset",
    skip: skip.toString(),
    limit: limit.toString(),
  });

  const { response, pending, reFetch, setResponse } = useGet<IStatus[]>({
    url: `${endpoints.STATUSES}?${queryParams.toString()}`,
  });
  const statuses = response || [];

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = statuses.length === limit;

  const [isCreating, setIsCreating] = useState(false);
  const [statusToEdit, setStatusToEdit] = useState<IStatus | null>(null);
  const [statusToDelete, setStatusToDelete] = useState<IStatus | null>(null);

  const handleSuccess = (responseData?: unknown, method?: string) => {
    if (responseData && (method === "patch" || method === "post")) {
      reFetch();
      return;
    } else if (method === "delete" && statusToDelete) {
      setResponse((prev: IStatus[] | null) =>
        prev ? prev.filter((s: IStatus) => s.id !== statusToDelete.id) : null,
      );
      return;
    }
    reFetch();
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-2">
      <div className="flex items-center justify-end w-full">
        <Button onClick={() => setIsCreating(true)}>
          <PlusIcon size={16} className="mr-2" />
          Add Status
        </Button>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                No
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%]">
                Code
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[30%]">
                Name
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%]">
                Color
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[15%]">
                System
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right w-[15%]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={6} rows={6} />
            ) : statuses.length === 0 ? (
              <TableEmptyRow
                colSpan={6}
                icon={CircleDot}
                message="No statuses found"
                description="Add your first status using the button above."
              />
            ) : (
              statuses.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="px-4 py-3 text-center text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-foreground">
                    {item.code}
                  </TableCell>
                  <TableCell className="px-4 py-3">{item.name}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-border/50"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-mono text-xs uppercase">
                        {item.color}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {item.is_system ? (
                      <span className="text-blue-600 bg-blue-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        System
                      </span>
                    ) : (
                      <span className="text-gray-500 bg-gray-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        User
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setStatusToEdit(item)}
                      >
                        <EditIcon size={14} />
                      </Button>
                      {!item.is_system && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-500/10"
                          onClick={() => setStatusToDelete(item)}
                        >
                          <Trash2Icon size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {statuses.length > 0 || skip > 0 ? (
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

      <StatusFormModal
        isOpen={isCreating || statusToEdit !== null}
        onClose={() => {
          setIsCreating(false);
          setStatusToEdit(null);
        }}
        statusToEdit={statusToEdit}
        onSuccess={handleSuccess}
      />
      <ConfirmDeleteModal
        isOpen={statusToDelete !== null}
        onClose={() => setStatusToDelete(null)}
        status={statusToDelete}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
