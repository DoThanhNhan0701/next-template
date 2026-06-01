"use client";

import { useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { Building2, EditIcon, Mail, Phone, User, Users } from "lucide-react";
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
import { ICustomer } from "@/types/customer";
import { getApiErrorMessage } from "@/utils/api-error";
import { axiosInstance } from "@/utils/axiosInstance";

import CustomerFormModal from "./CustomerFormModal";

export default function CustomerTable() {
  const t = useTranslations("page_customers");
  const tt = useTranslations("page_customers.table");
  const td = useTranslations("page_customers.delete");
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

  const { response, pending, reFetch, setResponse } = useGet<{
    data: ICustomer[];
    total: number;
    count: number;
  }>({
    url: `${endpoints.CUSTOMERS}?${queryParams.toString()}`,
  });

  // Note: The image shows response wrapped in { data: [...] }
  const customers = response?.data || [];

  const [isCreating, setIsCreating] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<ICustomer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<ICustomer | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { mutate: importExcel, pending: importPending } = useMutation();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await axiosInstance.get(endpoints.CUSTOMERS_EXPORT_EXCEL, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `customers_export_${new Date().getTime()}.xlsx`,
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
        url: endpoints.CUSTOMERS_IMPORT_EXCEL,
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
    if (responseData && (method === "patch" || method === "post")) {
      reFetch();
      return;
    } else if (method === "delete" && customerToDelete) {
      setResponse((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          data: prev.data.filter(
            (s: ICustomer) => s.id !== customerToDelete.id,
          ),
        };
      });
      return;
    }
    reFetch();
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-2">
      <div className="flex items-center justify-between w-full gap-2 flex-wrap">
        <Select value={isActive} onValueChange={(val) => { setIsActive(val); setSkip(0); }}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder={t("all_statuses")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all_statuses")}</SelectItem>
            <SelectItem value="true">{t("active")}</SelectItem>
            <SelectItem value="false">{t("inactive")}</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 flex-wrap">
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
            {t("add_customer")}
          </Button>
        </div>
      </div>
      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="w-full">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-10 text-center">{tt("no")}</TableHead>
              <TableHead className="font-semibold h-10 px-4">{tt("customer")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 hidden md:table-cell">{tt("contact")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 hidden lg:table-cell">{tt("identifier")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 hidden lg:table-cell">{tt("address")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center hidden sm:table-cell">{tt("status")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right">{tt("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? <TableLoadingRows colSpan={7} rows={6} /> : customers.length === 0 ? (
              <TableEmptyRow colSpan={7} icon={Users} message={tt("no_customers_found")} description={tt("add_first_customer")} />
            ) : customers.map((item: ICustomer, index) => (
              <TableRow key={item.id} className="hover:bg-primary/5 transition-colors">
                <TableCell className="px-4 py-1.5 text-center text-muted-foreground">{skip + index + 1}</TableCell>
                <TableCell className="px-4 py-1.5 font-medium text-foreground">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      {item.customer_type === "Individual" ? <User size={14} className="text-blue-500" /> : <Building2 size={14} className="text-orange-500" />}
                      <span>{item.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-normal truncate max-w-[200px]">{item.description || item.customer_type}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-1.5 hidden md:table-cell">
                  <div className="flex flex-col gap-1 text-sm">
                    {item.phone && <div className="flex items-center gap-1.5"><Phone size={12} className="text-muted-foreground" /><span>{item.phone}</span></div>}
                    {item.email && <div className="flex items-center gap-1.5"><Mail size={12} className="text-muted-foreground" /><span className="text-xs">{item.email}</span></div>}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-1.5 font-mono text-xs uppercase hidden lg:table-cell">{item.identifier}</TableCell>
                <TableCell className="px-4 py-1.5 max-w-[200px] truncate hidden lg:table-cell">{item.address || "-"}</TableCell>
                <TableCell className="px-4 py-1.5 text-center hidden sm:table-cell">
                  {item.is_active ? <span className="text-green-600 bg-green-500/10 px-2 py-1 rounded-md text-sm font-medium">{t("active")}</span> : <span className="text-red-600 bg-red-500/10 px-2 py-1 rounded-md text-sm font-medium">{t("inactive")}</span>}
                </TableCell>
                <TableCell className="px-4 py-1.5 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setCustomerToEdit(item)}><EditIcon size={14} /></Button>
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
        count={customers.length}
        total={response?.total ?? response?.count}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />

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
        onSuccess={handleSuccess}
        title={td("title")}
        description={td.rich("confirm_message", {
          name: customerToDelete?.name || "this customer",
          important: (chunks) => (
            <span className="font-semibold">{chunks}</span>
          ),
        })}
        url={
          customerToDelete
            ? dynamicEndpoints.CUSTOMER_DETAIL(customerToDelete.id)
            : ""
        }
        method="delete"
        translationGroup="page_customers.delete"
      />
    </div>
  );
}
