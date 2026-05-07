"use client";

import { useTranslations } from "next-intl";
import { Package, Plus } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dynamicEndpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { IAssetModule } from "@/types/physical-asset";
import { formatDate } from "@/utils/date";
import { formatNumberWithCommas } from "@/utils/number";
import { Button } from "@/components/ui/button";
import ModuleFormModal from "./ModuleFormModal";

interface ModulesTableProps {
  assetId: number;
}

export default function ModulesTable({ assetId }: ModulesTableProps) {
  const t = useTranslations("page_physical_assets");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    response: modules = [],
    pending,
    reFetch,
  } = useGet<IAssetModule[]>({
    url: dynamicEndpoints.PHYSICAL_ASSET_MODULES(assetId),
  });

  if (pending) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden festivals-loading">
        <div className="animate-pulse">
          <div className="h-10 bg-muted/50 w-full" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 border-t border-border/50 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            <span className="text-sm font-semibold">
              {t("detail.modules.form.add_button")}
            </span>
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 rounded-xl border-2 border-dashed border-border/50 bg-muted/5">
          <div className="p-4 rounded-full bg-muted/20">
            <Package className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {t("detail.modules.no_modules")}
            </p>
          </div>
        </div>

        <ModuleFormModal
          assetId={assetId}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={reFetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          <span className="text-sm font-semibold">
            {t("detail.modules.form.add_button")}
          </span>
        </Button>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border/50 hover:bg-muted/30">
              <TableHead className="w-[50px] text-center font-semibold h-11 px-2 whitespace-nowrap">
                {t("table.no")}
              </TableHead>
              <TableHead className="min-w-[180px] font-semibold h-11 px-3 whitespace-nowrap">
                {t("detail.modules.table.name")}
              </TableHead>
              <TableHead className="w-[120px] font-semibold h-11 px-2 whitespace-nowrap">
                {t("detail.modules.table.code")}
              </TableHead>
              <TableHead className="w-[120px] font-semibold h-11 px-2 whitespace-nowrap">
                {t("detail.modules.table.serial")}
              </TableHead>
              <TableHead className="w-[120px] font-semibold h-11 px-2 whitespace-nowrap">
                {t("detail.modules.table.model")}
              </TableHead>
              <TableHead className="w-[80px] text-center font-semibold h-11 px-2 whitespace-nowrap">
                {t("detail.modules.table.quantity")}
              </TableHead>
              <TableHead className="w-[120px] text-right font-semibold h-11 px-2 whitespace-nowrap">
                {t("detail.modules.table.cost")}
              </TableHead>
              <TableHead className="w-[110px] font-semibold h-11 px-2 whitespace-nowrap">
                {t("detail.modules.table.purchase_date")}
              </TableHead>
              <TableHead className="w-[110px] font-semibold h-11 px-2 whitespace-nowrap">
                {t("detail.modules.table.warranty")}
              </TableHead>
              <TableHead className="w-[110px] font-semibold h-11 px-2 whitespace-nowrap">
                {t("detail.modules.table.attached_date")}
              </TableHead>
              <TableHead className="w-[120px] text-center font-semibold h-11 px-2 whitespace-nowrap">
                {t("detail.modules.table.status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.map((module, index) => {
              let statusStyle = "bg-amber-50 text-amber-600 border-amber-200";
              if (module.status === "active") {
                statusStyle = "bg-emerald-50 text-emerald-600 border-emerald-200";
              } else if (module.status === "damaged") {
                statusStyle = "bg-rose-50 text-rose-600 border-rose-200";
              } else if (module.status === "lost") {
                statusStyle = "bg-slate-50 text-slate-600 border-slate-200";
              }

              return (
                <TableRow
                  key={module.id}
                  className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <TableCell className="text-center text-xs text-muted-foreground px-2">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-sm px-3 max-w-[250px] truncate">
                    {module.name}
                  </TableCell>
                  <TableCell className="text-sm font-mono px-2 text-primary/80">
                    {module.module_code || "—"}
                  </TableCell>
                  <TableCell className="text-sm px-2 text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                    {module.serial_number || "—"}
                  </TableCell>
                  <TableCell className="text-sm px-2 truncate max-w-[120px]">
                    {module.model || "—"}
                  </TableCell>
                  <TableCell className="text-center text-sm font-medium px-2">
                    {module.quantity}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium px-2 tabular-nums">
                    {formatNumberWithCommas(module.cost)}
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap px-2">
                    {formatDate(module.purchase_date)}
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap px-2">
                    {formatDate(module.warranty_expiration)}
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap px-2">
                    {formatDate(module.attached_date)}
                  </TableCell>
                  <TableCell className="text-center px-2">
                    <Badge
                      variant="outline"
                      className={`whitespace-nowrap px-2 py-0 h-5 text-[10px] font-semibold uppercase tracking-wider ${statusStyle}`}
                    >
                      {t("detail.modules.form.statuses." + (module.status || "active"))}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ModuleFormModal
        assetId={assetId}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={reFetch}
      />
    </div>
  );
}
