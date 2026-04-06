"use client";

import { useState } from "react";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { IRole } from "@/types/rbac";
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
import RoleFormModal from "./RoleFormModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function RoleTable() {
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);
  const [isActiveFilter, setIsActiveFilter] = useState("all");

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (isActiveFilter !== "all") {
    queryParams.append("is_active", isActiveFilter);
  }

  const { response, pending, reFetch, setResponse } = useGet<IRole[]>({
    url: `${endpoints.RBAC_ROLES}?${queryParams.toString()}`,
  });

  const roles = response || [];
  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = roles.length === limit;

  const [isCreating, setIsCreating] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<IRole | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<IRole | null>(null);

  const handleSuccess = (responseData?: unknown, method?: string) => {
    if (responseData && method === "patch") {
      const resp = responseData as { data?: IRole } | IRole;
      const updatedItem = ("data" in resp ? resp.data : resp) as
        | IRole
        | undefined;
      if (updatedItem?.id) {
        setResponse((prev: IRole[] | null) =>
          prev
            ? prev.map((r: IRole) =>
                r.id === updatedItem?.id ? { ...r, ...updatedItem } : r,
              )
            : null,
        );
        return;
      }
    } else if (responseData && method === "post") {
      const resp = responseData as { data?: IRole } | IRole;
      const newItem = ("data" in resp ? resp.data : resp) as IRole | undefined;
      if (newItem?.id) {
        setResponse((prev: IRole[] | null) =>
          prev ? [newItem, ...prev] : [newItem],
        );
        return;
      }
    }
    reFetch();
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-2">
      <div className="flex items-center justify-between w-full">
        <Select
          value={isActiveFilter}
          onValueChange={(val) => {
            setIsActiveFilter(val);
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
          Add Role
        </Button>
      </div>

      <div className="border border-(--surface-border-color) rounded-lg flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[25%]">
                Role Name
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[40%]">
                Description
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[15%]">
                Status
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right w-[20%]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableRow>
                <TableCell colSpan={4} className="px-4 py-3 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="px-4 py-3 text-center">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow
                  key={role.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="px-4 py-3 font-medium text-foreground">
                    {role.name}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {role.description}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {role.is_active ? (
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
                        onClick={() => setRoleToEdit(role)}
                      >
                        <EditIcon size={14} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                        onClick={() => setRoleToDelete(role)}
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

      {roles.length > 0 || skip > 0 ? (
        <Pagination className="flex w-full justify-end mt-1">
          <PaginationContent>
            {/* Pagination ... */}
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

      <RoleFormModal
        isOpen={isCreating || roleToEdit !== null}
        onClose={() => {
          setIsCreating(false);
          setRoleToEdit(null);
        }}
        roleToEdit={roleToEdit}
        onSuccess={handleSuccess}
      />

      <ConfirmDeleteModal
        isOpen={roleToDelete !== null}
        onClose={() => setRoleToDelete(null)}
        role={roleToDelete}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
