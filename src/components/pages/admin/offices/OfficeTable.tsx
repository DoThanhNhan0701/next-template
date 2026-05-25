"use client";
import { useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { Building, EditIcon } from "lucide-react";
import { toast } from "sonner";

import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { TablePagination } from "@/components/common/TablePagination";
import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
import { Button } from "@/components/ui/button";
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
import { useMutation } from "@/hooks/useMutation";
import { IOffice } from "@/types/office";
import { getApiErrorMessage } from "@/utils/api-error";
import { axiosInstance } from "@/utils/axiosInstance";

import OfficeFormModal from "./OfficeFormModal";

export default function OfficeTable() {
  const t = useTranslations("page_offices");
  const tt = useTranslations("page_offices.table");
  const td = useTranslations("page_offices.delete");
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(100);
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

  const [isCreating, setIsCreating] = useState(false);
  const [officeToEdit, setOfficeToEdit] = useState<IOffice | null>(null);
  const [officeToDelete, setOfficeToDelete] = useState<IOffice | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { mutate: importExcel, pending: importPending } = useMutation();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await axiosInstance.get("/api/v1/offices/export/excel", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `offices_export_${new Date().getTime()}.xlsx`,
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
        "Format file không hợp lệ. Chỉ chấp nhận các định dạng: xls, xlsx",
      );
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    await importExcel(
      {
        url: "/api/v1/offices/import/excel",
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
          toast.success(typedRes?.message || "Nhập dữ liệu thành công");
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
      <div className="flex items-center justify-between w-full gap-2 flex-wrap">
        <Select value={isActiveFilter} onValueChange={(val) => { setIsActiveFilter(val); setSkip(0); }}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder={t("all_statuses")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all_statuses")}</SelectItem>
            <SelectItem value="true">{t("active")}</SelectItem>
            <SelectItem value="false">{t("inactive")}</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".xls,.xlsx" className="hidden" />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importPending} className="gap-2">{t("import_excel")}</Button>
          <Button variant="outline" onClick={handleExport} disabled={isExporting} className="gap-2">{t("export_excel")}</Button>
          <Button onClick={() => setIsCreating(true)} className="gap-2">{t("add_office")}</Button>
        </div>
      </div>
      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="w-full">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-10 text-center">{tt("no")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 hidden sm:table-cell">{tt("code")}</TableHead>
              <TableHead className="font-semibold h-10 px-4">{tt("name")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 hidden md:table-cell">{tt("address")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 hidden lg:table-cell">{tt("description")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center hidden sm:table-cell">{tt("status")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right">{tt("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? <TableLoadingRows colSpan={7} rows={6} /> : offices.length === 0 ? (
              <TableEmptyRow colSpan={7} icon={Building} message={tt("no_offices_found")} description={tt("add_first_office")} />
            ) : offices.map((off, index) => (
              <TableRow key={off.id} className="hover:bg-primary/5 transition-colors">
                <TableCell className="px-4 py-1.5 text-center text-muted-foreground">{skip + index + 1}</TableCell>
                <TableCell className="px-4 py-1.5 font-medium text-foreground hidden sm:table-cell">{off.code}</TableCell>
                <TableCell className="px-4 py-1.5 font-medium text-foreground">{off.name}</TableCell>
                <TableCell className="px-4 py-1.5 hidden md:table-cell">{off.address}</TableCell>
                <TableCell className="px-4 py-1.5 hidden lg:table-cell">{off.description}</TableCell>
                <TableCell className="px-4 py-1.5 text-center hidden sm:table-cell">
                  {off.is_active ? <span className="text-green-600 bg-green-500/10 px-2 py-1 rounded-md text-sm font-medium">{t("active")}</span> : <span className="text-red-600 bg-red-500/10 px-2 py-1 rounded-md text-sm font-medium">{t("inactive")}</span>}
                </TableCell>
                <TableCell className="px-4 py-1.5 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setOfficeToEdit(off)}><EditIcon size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        skip={skip}
        limit={limit}
        count={offices.length}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />

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
