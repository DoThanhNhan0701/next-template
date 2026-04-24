"use client";

import { useState } from "react";

import {
  EditIcon,
  Mail,
  Phone,
  PlusIcon,
  Trash2Icon,
  Truck,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";

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
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { ISupplier } from "@/types/supplier";

import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import SupplierFormModal from "./SupplierFormModal";

export default function SupplierTable() {
  const t = useTranslations("page_suppliers");
  const tt = useTranslations("page_suppliers.table");
  const td = useTranslations("page_suppliers.delete");
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

  const { response, pending, reFetch, setResponse } = useGet<ISupplier[]>({
    url: `${endpoints.SUPPLIERS}?${queryParams.toString()}`,
  });
  const suppliers = response || [];

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = suppliers.length === limit;

  const [isCreating, setIsCreating] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<ISupplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<ISupplier | null>(
    null,
  );

  const handleSuccess = (responseData?: unknown, method?: string) => {
    if (responseData && (method === "patch" || method === "post")) {
      reFetch();
      return;
    } else if (method === "delete" && supplierToDelete) {
      setResponse((prev: ISupplier[] | null) =>
        prev
          ? prev.filter((s: ISupplier) => s.id !== supplierToDelete.id)
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
            <SelectValue placeholder={t("all_statuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all_statuses")}</SelectItem>
            <SelectItem value="true">{t("active")}</SelectItem>
            <SelectItem value="false">{t("inactive")}</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsCreating(true)}>
          <PlusIcon size={16} className="mr-2" />
          {t("add_supplier")}
        </Button>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                {tt("no")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[25%] text-left">
                {tt("supplier")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%]">
                {tt("contact")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[15%]">
                {tt("tax_code")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%]">
                {tt("address")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[10%]">
                {tt("status")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right w-[10%]">
                {tt("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={7} rows={6} />
            ) : suppliers.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                icon={Truck}
                message={tt("no_suppliers_found")}
                description={tt("add_first_supplier")}
              />
            ) : (
              suppliers.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="px-4 py-3 text-center text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-foreground">
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      <span className="text-xs text-muted-foreground font-normal truncate max-w-[200px]">
                        {item.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-sm">
                      {item.contact_name && (
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-muted-foreground" />
                          <span>{item.contact_name}</span>
                        </div>
                      )}
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
                  <TableCell className="px-4 py-3">
                    {item.tax_code || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 max-w-[200px] truncate underline decoration-muted-foreground/30 underline-offset-2">
                    {item.address || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {item.is_active ? (
                      <span className="text-green-600 bg-green-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        {t("active")}
                      </span>
                    ) : (
                      <span className="text-red-600 bg-red-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        {t("inactive")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setSupplierToEdit(item)}
                      >
                        <EditIcon size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-500/10"
                        onClick={() => setSupplierToDelete(item)}
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

      {suppliers.length > 0 || skip > 0 ? (
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

      <SupplierFormModal
        isOpen={isCreating || supplierToEdit !== null}
        onClose={() => {
          setIsCreating(false);
          setSupplierToEdit(null);
        }}
        supplierToEdit={supplierToEdit}
        onSuccess={handleSuccess}
      />
      <ConfirmDeleteModal
        isOpen={supplierToDelete !== null}
        onClose={() => setSupplierToDelete(null)}
        onSuccess={handleSuccess}
        title={td("title")}
        description={td.rich("confirm_message", {
          name: supplierToDelete?.name || "this supplier",
          important: (chunks) => <span className="font-semibold">{chunks}</span>,
        })}
        url={
          supplierToDelete
            ? dynamicEndpoints.SUPPLIER_DETAIL(supplierToDelete.id)
            : ""
        }
        method="delete"
        translationGroup="page_suppliers.delete"
      />
    </div>
  );
}
