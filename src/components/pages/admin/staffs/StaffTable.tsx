"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { Contact, EditIcon, Trash2Icon } from "lucide-react";

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
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { IStaff } from "@/types/staff";

import StaffFormModal from "./StaffFormModal";

export default function StaffTable() {
  const t = useTranslations("page_staff");
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
    items: IStaff[];
  }>({
    url: `${endpoints.STAFFS}?${queryParams.toString()}`,
  });
  const staffs = response?.items || [];

  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = staffs.length === limit;

  const [isCreating, setIsCreating] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<IStaff | null>(null);

  const handleSuccess = (responseData?: unknown, method?: string) => {
    if (responseData && method === "patch") {
      const resp = responseData as { data?: IStaff } | IStaff;
      const updatedItem = ("data" in resp ? resp.data : resp) as
        | IStaff
        | undefined;
      if (updatedItem?.id) {
        setResponse((prev: { items: IStaff[] } | null) =>
          prev
            ? {
                ...prev,
                items: prev.items.map((u: IStaff) =>
                  u.id === updatedItem?.id ? { ...u, ...updatedItem } : u,
                ),
              }
            : null,
        );
        return;
      }
    } else if (responseData && method === "post") {
      const resp = responseData as { data?: IStaff } | IStaff;
      const newItem = ("data" in resp ? resp.data : resp) as IStaff | undefined;
      if (newItem?.id) {
        setResponse((prev: { items: IStaff[] } | null) =>
          prev
            ? {
                ...prev,
                items: [newItem, ...prev.items],
              }
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
        <Button onClick={() => setIsCreating(true)}>{t("add_staff")}</Button>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                Ref
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[15%]">
                {t("staff_code")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[25%]">
                {t("full_name")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[25%]">
                {t("email")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[15%]">
                {t("unit")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[10%]">
                {t("status")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right w-[10%]">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={7} rows={6} />
            ) : staffs.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                icon={Contact}
                message={t("no_staff_found")}
                description={t("add_first_staff_description")}
              />
            ) : (
              staffs.map((staff, index) => (
                <TableRow
                  key={staff.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="px-4 py-3 text-center text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-foreground">
                    {staff.staff_code}
                  </TableCell>
                  <TableCell className="px-4 py-3">{staff.full_name}</TableCell>
                  <TableCell className="px-4 py-3">{staff.email}</TableCell>
                  <TableCell className="px-4 py-3">
                    {staff.unit?.name || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {staff.is_active ? (
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
                        onClick={() => setStaffToEdit(staff)}
                      >
                        <EditIcon size={14} />
                      </Button>
                      {staff.is_active && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-500/10"
                          onClick={() => {}}
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

      {staffs.length > 0 || skip > 0 ? (
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

            <PaginationItem>
              <PaginationLink href="#" isActive>
                {currentPage}
              </PaginationLink>
            </PaginationItem>

            {hasMore && (
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
            )}
          </PaginationContent>
        </Pagination>
      ) : null}

      <StaffFormModal
        isOpen={isCreating || staffToEdit !== null}
        onClose={() => {
          setIsCreating(false);
          setStaffToEdit(null);
        }}
        staffToEdit={staffToEdit}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
