"use client";

import { useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { EditIcon, Tag } from "lucide-react";
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
import { ICatalogType } from "@/types/catalog-type";
import { getApiErrorMessage } from "@/utils/api-error";
import { axiosInstance } from "@/utils/axiosInstance";

import CatalogTypeFormModal from "./CatalogTypeFormModal";

export default function CatalogTypeTable() {
  const t = useTranslations("page_catalog_types");
  const tt = useTranslations("page_catalog_types.table");
  const td = useTranslations("page_catalog_types.delete");
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(100);
  const [isActive, setIsActive] = useState<string>("all");

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });
  if (isActive !== "all") {
    queryParams.append("is_active", isActive);
  }

  const { response, pending, reFetch, setResponse } = useGet<ICatalogType[]>({
    url: `${endpoints.CATALOG_TYPES}?${queryParams.toString()}`,
  });
  const catalogTypes = response || [];

  const [isCreating, setIsCreating] = useState(false);
  const [catalogTypeToEdit, setCatalogTypeToEdit] =
    useState<ICatalogType | null>(null);
  const [catalogTypeToDelete, setCatalogTypeToDelete] =
    useState<ICatalogType | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { mutate: importExcel, pending: importPending } = useMutation();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await axiosInstance.get(
        "/api/v1/catalog-types/export/excel",
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `catalog_types_export_${new Date().getTime()}.xlsx`,
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
        url: "/api/v1/catalog-types/import/excel",
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
      const resp = responseData as { data?: ICatalogType } | ICatalogType;
      const updatedItem = ("data" in resp ? resp.data : resp) as
        | ICatalogType
        | undefined;
      if (updatedItem?.id) {
        setResponse((prev: ICatalogType[] | null) =>
          prev
            ? prev.map((u: ICatalogType) =>
                u.id === updatedItem?.id ? { ...u, ...updatedItem } : u,
              )
            : null,
        );
        return;
      }
    } else if (responseData && method === "post") {
      const resp = responseData as { data?: ICatalogType } | ICatalogType;
      const newItem = ("data" in resp ? resp.data : resp) as
        | ICatalogType
        | undefined;
      if (newItem?.id) {
        setResponse((prev: ICatalogType[] | null) =>
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
            {t("add_type")}
          </Button>
        </div>
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
              <TableHead className="font-semibold h-10 px-4 w-[20%]">
                {tt("name")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[25%]">
                {tt("group")}
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
              <TableLoadingRows colSpan={6} rows={6} />
            ) : catalogTypes.length === 0 ? (
              <TableEmptyRow
                colSpan={6}
                icon={Tag}
                message={tt("no_types_found")}
                description={tt("add_first_type")}
              />
            ) : (
              catalogTypes.map((type, index) => (
                <TableRow
                  key={type.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="px-4 py-1.5 text-center text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 font-medium text-foreground">
                    {type.code}
                  </TableCell>
                  <TableCell className="px-4 py-1.5">{type.name}</TableCell>
                  <TableCell className="px-4 py-1.5">
                    {type?.description ?? ""}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
                    {type.is_active ? (
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
                        onClick={() => setCatalogTypeToEdit(type)}
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

      <TablePagination
        skip={skip}
        limit={limit}
        count={catalogTypes.length}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />

      <CatalogTypeFormModal
        isOpen={isCreating || catalogTypeToEdit !== null}
        onClose={() => {
          setIsCreating(false);
          setCatalogTypeToEdit(null);
        }}
        catalogTypeToEdit={catalogTypeToEdit}
        onSuccess={handleSuccess}
      />
      <ConfirmDeleteModal
        isOpen={catalogTypeToDelete !== null}
        onClose={() => setCatalogTypeToDelete(null)}
        onSuccess={handleSuccess}
        title={td("title")}
        description={td.rich("confirm_message", {
          name: catalogTypeToDelete?.name || "this item",
          important: (chunks) => (
            <span className="font-semibold">{chunks}</span>
          ),
        })}
        url={
          catalogTypeToDelete
            ? dynamicEndpoints.CATALOG_TYPE_DETAIL(catalogTypeToDelete.id)
            : ""
        }
        method="patch"
        body={{ is_active: false }}
        translationGroup="page_catalog_types.delete"
      />
    </div>
  );
}
