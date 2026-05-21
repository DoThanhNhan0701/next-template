"use client";

import { useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { Contact, EditIcon } from "lucide-react";
import { toast } from "sonner";

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
import { useMutation } from "@/hooks/useMutation";
import { IStaff } from "@/types/staff";
import { getApiErrorMessage } from "@/utils/api-error";
import { axiosInstance } from "@/utils/axiosInstance";

import StaffFormModal from "./StaffFormModal";

export default function StaffTable() {
  const t = useTranslations("page_staff");
  const tc = useTranslations("Common");
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { mutate: importExcel, pending: importPending } = useMutation();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await axiosInstance.get("/api/v1/staffs/export/excel", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `staffs_export_${new Date().getTime()}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      getApiErrorMessage(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["xls", "xlsx"].includes(extension)) {
      toast.error(
        t("invalid_file_format"),
      );
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    await importExcel(
      {
        url: "/api/v1/staffs/import/excel",
        method: "post",
        body: formData,
        config: {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      },
      {
        onSuccess: (res) => {
          const typedRes = res as { message?: string } | undefined;
          toast.success(typedRes?.message || t("import_success"));
          reFetch();
        },
        onError: (err) => {
          getApiErrorMessage(err);
        },
      },
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSuccess = (responseData?: unknown, method?: string) => {
    if (responseData && method === "put") {
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
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".xls,.xlsx"
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={importPending}
            className="gap-2"
          >
            {t("import_excel")}
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            {t("export_excel")}
          </Button>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            {t("add_staff")}
          </Button>
        </div>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                {tc("stt")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[12%]">
                {t("staff_code")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[18%]">
                {t("full_name")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%]">
                {t("email")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[15%]">
                {t("account")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[15%]">
                {t("unit")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[15%]">
                {t("office")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[10%]">
                {t("status")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right w-[5%]">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={8} rows={6} />
            ) : staffs.length === 0 ? (
              <TableEmptyRow
                colSpan={8}
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
                  <TableCell className="px-4 py-1.5 text-center text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 font-medium text-foreground">
                    {staff.staff_code}
                  </TableCell>
                  <TableCell className="px-4 py-1.5">
                    {staff.full_name}
                  </TableCell>
                  <TableCell className="px-4 py-1.5">{staff.email}</TableCell>
                  <TableCell className="px-4 py-1.5">
                    {staff.login_username ? (
                      <div className="flex flex-col">
                        <p>{staff.login_username ?? ""}</p>
                        <span className="text-green-600 text-xs">
                          {t("linked")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-red-600 text-xs">
                        {t("not_linked")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-1.5">
                    {staff.unit?.name || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-1.5">
                    {staff.office?.name || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
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
                  <TableCell className="px-4 py-1.5 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setStaffToEdit(staff)}
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
