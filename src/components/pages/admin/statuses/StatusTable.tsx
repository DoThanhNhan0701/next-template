"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { CircleDot, EditIcon, Search, Trash2Icon } from "lucide-react";

import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { TablePagination } from "@/components/common/TablePagination";
import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useGet } from "@/hooks/useGet";
import { IStatus } from "@/types/status";

import StatusFormModal from "./StatusFormModal";

export default function StatusTable() {
  const t = useTranslations("page_asset_statuses");
  const tt = useTranslations("page_asset_statuses.table");
  const td = useTranslations("page_asset_statuses.delete");
  const tc = useTranslations("Common");
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(100);

  const { search, searchVal, setSearchVal } = useDebouncedSearch();

  useEffect(() => {
    setSkip(0);
  }, [search]);

  const queryParams = new URLSearchParams({
    category: "asset",
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (search) {
    queryParams.append("search", search);
  }

  const { response, pending, reFetch, setResponse } = useGet<IStatus[]>({
    url: `${endpoints.STATUSES}?${queryParams.toString()}`,
  });
  const statuses = response || [];

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
      <div className="flex items-center justify-between w-full gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap flex-1 max-w-md">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="search"
              placeholder={tc("search_placeholder") || "Tìm kiếm..."}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="pl-9 h-9 text-sm w-full"
            />
          </div>
        </div>
        <Button onClick={() => setIsCreating(true)}>{t("add_status")}</Button>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="w-full">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-10 text-center">{tt("no")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 hidden sm:table-cell">{tt("code")}</TableHead>
              <TableHead className="font-semibold h-10 px-4">{tt("name")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 hidden md:table-cell">{tt("color")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center hidden sm:table-cell">{tt("system")}</TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right">{tt("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={`divide-y divide-(--surface-border-color) transition-opacity duration-200 ${pending ? "opacity-60" : ""}`}>
            {pending && statuses.length === 0 ? (
              <TableLoadingRows colSpan={6} rows={6} />
            ) : statuses.length === 0 ? (
              <TableEmptyRow colSpan={6} icon={CircleDot} message={tt("no_statuses_found")} description={tt("add_first_status")} />
            ) : statuses.map((item, index) => (
              <TableRow key={item.id} className="hover:bg-primary/5 transition-colors">
                <TableCell className="px-4 py-1.5 text-center text-muted-foreground">{skip + index + 1}</TableCell>
                <TableCell className="px-4 py-1.5 font-medium text-foreground hidden sm:table-cell">{item.code}</TableCell>
                <TableCell className="px-4 py-1.5">{item.name}</TableCell>
                <TableCell className="px-4 py-1.5 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-border/50" style={{ backgroundColor: item.color }} />
                    <span className="font-mono text-xs uppercase">{item.color}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-1.5 text-center hidden sm:table-cell">
                  {item.is_system ? <span className="text-blue-600 bg-blue-500/10 px-2 py-1 rounded-md text-sm font-medium">{tt("badge_system")}</span> : <span className="text-gray-500 bg-gray-500/10 px-2 py-1 rounded-md text-sm font-medium">{tt("badge_user")}</span>}
                </TableCell>
                <TableCell className="px-4 py-1.5 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setStatusToEdit(item)}><EditIcon size={14} /></Button>
                    {!item.is_system && <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10" onClick={() => setStatusToDelete(item)}><Trash2Icon size={14} /></Button>}
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
        count={statuses.length}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />

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
        onSuccess={handleSuccess}
        title={td("title")}
        description={td.rich("confirm_message", {
          name: statusToDelete?.name || "this item",
          important: (chunks) => (
            <span className="font-semibold">{chunks}</span>
          ),
        })}
        url={
          statusToDelete
            ? dynamicEndpoints.STATUS_DETAIL(statusToDelete.id)
            : ""
        }
        method="delete"
        translationGroup="page_asset_statuses.delete"
      />
    </div>
  );
}
