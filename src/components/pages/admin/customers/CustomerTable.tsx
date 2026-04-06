"use client";

import { useState } from "react";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { ICustomer } from "@/types/customer";
import { EditIcon, Trash2Icon, PlusIcon, Mail, Phone, User, Building2 } from "lucide-react";
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
import CustomerFormModal from "./CustomerFormModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function CustomerTable() {
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

  const { response, pending, reFetch, setResponse } = useGet<{
    data: ICustomer[];
  }>({
    url: `${endpoints.CUSTOMERS}?${queryParams.toString()}`,
  });
  
  // Note: The image shows response wrapped in { data: [...] }
  const customers = response?.data || [];

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = customers.length === limit;

  const [isCreating, setIsCreating] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<ICustomer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<ICustomer | null>(null);

  const handleSuccess = (responseData?: unknown, method?: string) => {
    if (responseData && (method === "patch" || method === "post")) {
      reFetch();
      return;
    } else if (method === "delete" && customerToDelete) {
      setResponse((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          data: prev.data.filter((s: ICustomer) => s.id !== customerToDelete.id),
        };
      });
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
          Add Customer
        </Button>
      </div>

      <div className="border border-(--surface-border-color) rounded-lg flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[25%] text-left">
                Customer
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%]">
                Contact
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[15%]">
                Identifier
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%]">
                Address
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[10%]">
                Status
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right w-[10%]">
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
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-3 text-center">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              customers.map((item: ICustomer) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="px-4 py-3 font-medium text-foreground">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        {item.customer_type === "Individual" ? (
                          <User size={14} className="text-blue-500" />
                        ) : (
                          <Building2 size={14} className="text-orange-500" />
                        )}
                        <span>{item.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-normal truncate max-w-[200px]">
                        {item.description || item.customer_type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-sm">
                      {item.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-muted-foreground" />
                          <span>{item.phone}</span>
                        </div>
                      )}
                      {item.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} className="text-muted-foreground" />
                          <span className="text-xs">{item.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 font-mono text-xs uppercase">
                    {item.identifier}
                  </TableCell>
                  <TableCell className="px-4 py-3 max-w-[200px] truncate underline decoration-muted-foreground/30 underline-offset-2">
                    {item.address || "-"}
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
                        onClick={() => setCustomerToEdit(item)}
                      >
                        <EditIcon size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                        onClick={() => setCustomerToDelete(item)}
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

      {customers.length > 0 || skip > 0 ? (
        <Pagination className="flex w-full justify-end mt-1">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (skip > 0 && !pending) setSkip(Math.max(0, skip - limit));
                }}
                className={skip === 0 || pending ? "pointer-events-none opacity-50" : ""}
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
                className={!hasMore || pending ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      <CustomerFormModal
        isOpen={isCreating || customerToEdit !== null}
        onClose={() => {
          setIsCreating(false);
          setCustomerToEdit(null);
        }}
        customerToEdit={customerToEdit}
        onSuccess={handleSuccess}
      />
      <ConfirmDeleteModal
        isOpen={customerToDelete !== null}
        onClose={() => setCustomerToDelete(null)}
        customer={customerToDelete}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
