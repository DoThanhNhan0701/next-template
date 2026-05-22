"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { Activity, EditIcon } from "lucide-react";

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
import { IUsageMode } from "@/types/usage-mode";

import UsageModeFormModal from "./UsageModeFormModal";

export default function UsageModeTable() {
  const t = useTranslations("page_usage_modes");
  const tt = useTranslations("page_usage_modes.table");
  const td = useTranslations("page_usage_modes.delete");
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

  const { response, pending, reFetch, setResponse } = useGet<IUsageMode[]>({
    url: `${endpoints.USAGE_MODES}?${queryParams.toString()}`,
  });
  const usageModes = response || [];

  const [isCreating, setIsCreating] = useState(false);
  const [usageModeToEdit, setUsageModeToEdit] = useState<IUsageMode | null>(
    null,
  );
  const [usageModeToDelete, setUsageModeToDelete] = useState<IUsageMode | null>(
    null,
  );

  const handleSuccess = (responseData?: unknown, method?: string) => {
    if (responseData && (method === "patch" || method === "post")) {
      reFetch();
      return;
    } else if (method === "delete" && usageModeToDelete) {
      setResponse((prev: IUsageMode[] | null) =>
        prev
          ? prev.filter((s: IUsageMode) => s.id !== usageModeToDelete.id)
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
        <Button onClick={() => setIsCreating(true)}>{t("add_mode")}</Button>
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
              <TableHead className="font-semibold h-10 px-4 w-[15%] text-center">
                {tt("color")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[25%]">
                {tt("description")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-center w-[10%]">
                {tt("status")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 text-right w-[15%]">
                {tt("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={7} rows={6} />
            ) : usageModes.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                icon={Activity}
                message={tt("no_modes_found")}
                description={tt("add_first_mode")}
              />
            ) : (
              usageModes.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="px-4 py-1.5 text-center text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 font-medium text-foreground">
                    {item.code}
                  </TableCell>
                  <TableCell className="px-4 py-1.5">{item.name}</TableCell>
                  <TableCell className="px-4 py-1.5">
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-border/50"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-mono text-xs uppercase">
                        {item.color}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 max-w-[200px] truncate">
                    {item.description}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-center">
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
                  <TableCell className="px-4 py-1.5 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setUsageModeToEdit(item)}
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
        count={usageModes.length}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />

      <UsageModeFormModal
        isOpen={isCreating || usageModeToEdit !== null}
        onClose={() => {
          setIsCreating(false);
          setUsageModeToEdit(null);
        }}
        usageModeToEdit={usageModeToEdit}
        onSuccess={handleSuccess}
      />
      <ConfirmDeleteModal
        isOpen={usageModeToDelete !== null}
        onClose={() => setUsageModeToDelete(null)}
        onSuccess={handleSuccess}
        title={td("title")}
        description={td.rich("confirm_message", {
          name: usageModeToDelete?.name || "this item",
          important: (chunks) => (
            <span className="font-semibold">{chunks}</span>
          ),
        })}
        url={
          usageModeToDelete
            ? dynamicEndpoints.USAGE_MODE_DETAIL(usageModeToDelete.id)
            : ""
        }
        method="delete"
        translationGroup="page_usage_modes.delete"
      />
    </div>
  );
}
