"use client";
import { useState } from "react";

import { useTranslations } from "next-intl";

import { Building, EditIcon } from "lucide-react";

import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
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
import { IOffice } from "@/types/office";

import OfficeFormModal from "./OfficeFormModal";

export default function OfficeTable() {
  const t = useTranslations("page_offices");
  const tt = useTranslations("page_offices.table");
  const td = useTranslations("page_offices.delete");
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

  const { response, pending, reFetch, setResponse } = useGet<IOffice[]>({
    url: `${endpoints.OFFICES}?${queryParams.toString()}`,
  });

  const offices = response || [];
  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = offices.length === limit;

  const [isCreating, setIsCreating] = useState(false);
  const [officeToEdit, setOfficeToEdit] = useState<IOffice | null>(null);
  const [officeToDelete, setOfficeToDelete] = useState<IOffice | null>(null);

  const handleSuccess = (responseData?: unknown, method?: string) => {
    if (responseData && method === "patch") {
      const resp = responseData as { data?: IOffice } | IOffice;
      const updatedItem = ("data" in resp ? resp.data : resp) as
        | IOffice
        | undefined;
      if (updatedItem?.id) {
        setResponse((prev: IOffice[] | null) =>
          prev
            ? prev.map((off: IOffice) =>
                off.id === updatedItem?.id ? { ...off, ...updatedItem } : off,
              )
            : null,
        );
        return;
      }
    } else if (responseData && method === "post") {
      const resp = responseData as { data?: IOffice } | IOffice;
      const newItem = ("data" in resp ? resp.data : resp) as
        | IOffice
        | undefined;
      if (newItem?.id) {
        setResponse((prev: IOffice[] | null) =>
          prev ? [newItem, ...prev] : [newItem],
        );
        return;
      }
    } else if (responseData && method === "delete") {
      const resp = responseData as { data?: IOffice } | IOffice;
      const deletedItem = ("data" in resp ? resp.data : resp) as
        | IOffice
        | undefined;
      if (deletedItem?.id) {
        setResponse((prev: IOffice[] | null) =>
          prev
            ? prev.filter((off: IOffice) => off.id !== deletedItem.id)
            : null,
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
            <SelectValue placeholder={t("all_statuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all_statuses")}</SelectItem>
            <SelectItem value="true">{t("active")}</SelectItem>
            <SelectItem value="false">{t("inactive")}</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsCreating(true)}>{t("add_office")}</Button>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                {tt("no")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[15%]">
                {tt("code")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[25%]">
                {tt("name")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[25%]">
                {tt("address")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[15%]">
                {tt("description")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[10%]">
                {tt("status")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right w-[5%]">
                {tt("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={7} rows={6} />
            ) : offices.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                icon={Building}
                message={tt("no_offices_found")}
                description={tt("add_first_office")}
              />
            ) : (
              offices.map((off, index) => (
                <TableRow
                  key={off.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="px-4 py-1.5 text-center text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 font-medium text-foreground">
                    {off.code}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 font-medium text-foreground">
                    {off.name}
                  </TableCell>
                  <TableCell className="px-4 py-1.5">{off.address}</TableCell>
                  <TableCell className="px-4 py-1.5">
                    {off.description}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
                    {off.is_active ? (
                      <span className="text-green-600 bg-green-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        {t("active")}
                      </span>
                    ) : (
                      <span className="text-red-600 bg-red-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        {t("inactive")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setOfficeToEdit(off)}
                      >
                        <EditIcon size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {offices.length > 0 || skip > 0 ? (
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

      <OfficeFormModal
        isOpen={isCreating || officeToEdit !== null}
        onClose={() => {
          setIsCreating(false);
          setOfficeToEdit(null);
        }}
        officeToEdit={officeToEdit}
        onSuccess={handleSuccess}
      />

      <ConfirmDeleteModal
        isOpen={officeToDelete !== null}
        onClose={() => setOfficeToDelete(null)}
        onSuccess={() => handleSuccess(officeToDelete, "delete")}
        title={td("title")}
        description={
          <>
            {td.rich("confirm_message", {
              name: officeToDelete?.name || "this item",
              important: (chunks) => (
                <span className="font-semibold">{chunks}</span>
              ),
            })}{" "}
            {td("warning")}
          </>
        }
        url={
          officeToDelete
            ? dynamicEndpoints.OFFICE_DETAIL(officeToDelete.id)
            : ""
        }
        method="delete"
        translationGroup="page_offices.delete"
      />
    </div>
  );
}
