"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { Eye, ScrollText } from "lucide-react";

import { TablePagination } from "@/components/common/TablePagination";
import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { IActivityLog } from "@/types/activity-log";
import { formatDate } from "@/utils/date";

const TARGET_MODELS = [
  { value: "all", labelKey: "all_models" },
  { value: "User", labelKey: "model_user" },
  { value: "Staff", labelKey: "model_staff" },
  { value: "Office", labelKey: "model_office" },
  { value: "AssetCategory", labelKey: "model_asset_category" },
  { value: "Unit", labelKey: "model_unit" },
] as const;

export default function ActivityLogsTable() {
  const t = useTranslations("page_activity_logs");
  const tt = useTranslations("page_activity_logs.table");
  const dm = useTranslations("page_activity_logs.details_modal");
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(100);
  const [targetModel, setTargetModel] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<IActivityLog | null>(null);

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });
  if (targetModel !== "all") {
    queryParams.append("target_model", targetModel);
  }

  const { response, pending } = useGet<{
    items: IActivityLog[];
    total: number;
  }>({
    url: `${endpoints.LOGS}?${queryParams.toString()}`,
  });
  const logs = response?.items || [];

  const getActionBadgeClass = (action: string) => {
    const act = action.toUpperCase();
    if (
      act.includes("CREATE") ||
      act.includes("INSERT") ||
      act.includes("ADD")
    ) {
      return "text-green-600 bg-green-500/10 border-green-500/20";
    }
    if (
      act.includes("UPDATE") ||
      act.includes("PATCH") ||
      act.includes("EDIT")
    ) {
      return "text-amber-600 bg-amber-500/10 border-amber-500/20";
    }
    if (act.includes("DELETE") || act.includes("REMOVE")) {
      return "text-rose-600 bg-rose-500/10 border-rose-500/20";
    }
    return "text-blue-600 bg-blue-500/10 border-blue-500/20";
  };

  const getChangedFields = (log: IActivityLog) => {
    const oldData = log.old_data || {};
    const newData = log.new_data || {};
    const allKeys = Array.from(
      new Set([...Object.keys(oldData), ...Object.keys(newData)]),
    );

    return allKeys
      .map((key) => {
        const oldValue =
          oldData[key] !== undefined && oldData[key] !== null
            ? String(oldData[key])
            : "-";
        const newValue =
          newData[key] !== undefined && newData[key] !== null
            ? String(newData[key])
            : "-";
        const isChanged =
          JSON.stringify(oldData[key]) !== JSON.stringify(newData[key]);
        return { key, oldValue, newValue, isChanged };
      })
      .filter((field) => field.isChanged);
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-2">
      <div className="flex items-center justify-between w-full">
        <Select
          value={targetModel}
          onValueChange={(val) => {
            setTargetModel(val);
            setSkip(0);
          }}
        >
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder={t("all_models")} />
          </SelectTrigger>
          <SelectContent>
            {TARGET_MODELS.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {t(model.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                {tt("no")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[15%]">
                {tt("timestamp")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[15%]">
                {tt("actor")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[15%]">
                {tt("action")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%]">
                {tt("target_model")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%]">
                {tt("details")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[10%] text-right">
                {tt("actions") || "Actions"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={7} rows={6} />
            ) : logs.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                icon={ScrollText}
                message={t("no_logs_found")}
                description={t("no_logs_description")}
              />
            ) : (
              logs.map((log, index) => (
                <TableRow
                  key={log.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="px-4 py-1.5 text-center text-muted-foreground">
                    {skip + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-muted-foreground text-sm">
                    {formatDate(log.created_at, "DD/MM/YYYY HH:mm:ss")}
                  </TableCell>
                  <TableCell className="px-4 py-1.5">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {log.user?.full_name ||
                          log.username ||
                          `User #${log.user_id}`}
                      </span>
                      {log.ip_address && (
                        <span className="text-xs text-muted-foreground">
                          {log.ip_address}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getActionBadgeClass(log.action)}`}
                    >
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-1.5">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {log.target_model}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {log.target_name
                          ? `${log.target_name} (#${log.target_id})`
                          : `ID: ${log.target_id}`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-sm max-w-[250px] truncate text-muted-foreground">
                    {log.target_name
                      ? `${log.action} ${log.target_model}: ${log.target_name}`
                      : `${log.action} ${log.target_model}`}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye size={14} />
                    </Button>
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
        count={logs.length}
        total={response?.total}
        pending={pending}
        onPageChange={setSkip}
        onLimitChange={setLimit}
      />

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-[600px] flex flex-col p-0 overflow-hidden max-h-[85vh]">
          <DialogHeader className="p-4 shrink-0 border-b">
            <DialogTitle>{dm("title")}</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase font-medium">
                    {dm("action")}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border mt-1 ${getActionBadgeClass(selectedLog.action)}`}
                  >
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase font-medium">
                    {dm("actor")}
                  </span>
                  <span className="font-semibold block mt-1">
                    {selectedLog.user?.full_name ||
                      selectedLog.username ||
                      `User #${selectedLog.user_id}`}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase font-medium">
                    {dm("time")}
                  </span>
                  <span className="block mt-1 text-muted-foreground">
                    {formatDate(selectedLog.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase font-medium">
                    {dm("ip_address")}
                  </span>
                  <span className="block mt-1 text-muted-foreground font-mono">
                    {selectedLog.ip_address || "-"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-xs uppercase font-medium">
                    {dm("target")}
                  </span>
                  <span className="block mt-1 font-medium">
                    {selectedLog.target_model}{" "}
                    {selectedLog.target_name
                      ? ` - ${selectedLog.target_name} (#${selectedLog.target_id})`
                      : `(#${selectedLog.target_id})`}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-semibold block">Changes</span>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead className="w-[30%] font-medium py-2">
                          {dm("field")}
                        </TableHead>
                        <TableHead className="w-[35%] font-medium py-2">
                          {dm("old_value")}
                        </TableHead>
                        <TableHead className="w-[35%] font-medium py-2">
                          {dm("new_value")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getChangedFields(selectedLog).length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center py-4 text-muted-foreground text-sm"
                          >
                            {dm("no_changes")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        getChangedFields(selectedLog).map((field) => (
                          <TableRow key={field.key}>
                            <TableCell className="font-mono text-xs py-2 font-medium">
                              {field.key}
                            </TableCell>
                            <TableCell className="py-2 text-xs text-rose-600 bg-rose-500/5 max-w-[180px] break-all">
                              {field.oldValue}
                            </TableCell>
                            <TableCell className="py-2 text-xs text-green-600 bg-green-500/5 max-w-[180px] break-all">
                              {field.newValue}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 shrink-0 border-t flex justify-end">
            <Button variant="outline" onClick={() => setSelectedLog(null)}>
              {dm("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
