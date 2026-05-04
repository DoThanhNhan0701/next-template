import Link from "next/link";
import { useTranslations } from "next-intl";

import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ILifecycleLog } from "@/types/physical-asset";
import { formatDateTime } from "@/utils/date";

export default function SystemLogTab({
  logs,
}: Readonly<{ logs: ILifecycleLog[] }>) {
  const t = useTranslations("page_physical_assets.lifecycle");
  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="border border-(--surface-border-color) w-full flex flex-col flex-1 min-h-0 overflow-x-auto [&_div[data-slot=table-container]]:flex-1 [&_div[data-slot=table-container]]:min-h-0 [&_div[data-slot=table-container]]:overflow-y-auto">
      <Table className="whitespace-nowrap">
        <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
          <TableRow>
            <TableHead className="font-semibold h-10 px-4 w-16 text-center">
              {t("table.no")}
            </TableHead>
            <TableHead className="font-semibold h-10 px-4 min-w-25 w-32">
              {t("table.date")}
            </TableHead>
            <TableHead className="font-semibold h-10 px-4 min-w-37.5">
              {t("table.process_type")}
            </TableHead>
            <TableHead className="font-semibold h-10 px-4 min-w-37.5">
              {t("table.details")}
            </TableHead>
            <TableHead className="font-semibold h-10 px-4 w-40 text-center">
              {t("table.voucher")}
            </TableHead>
            <TableHead className="font-semibold h-10 px-4 w-40 text-right pr-6">
              {t("table.user")}
            </TableHead>
            <TableHead className="font-semibold h-10 px-4 w-20 text-center">
              {t("table.quantity")}
            </TableHead>
            <TableHead className="font-semibold h-10 px-4 w-36">
              {t("table.status")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-(--surface-border-color)">
          {logs.map((log, i) => (
            <TableRow
              key={log.ref_id + `${i}`}
              className="group hover:bg-primary/3 transition-colors relative"
            >
              <TableCell className="px-4 py-1.5 text-center font-medium text-muted-foreground text-sm">
                {i + 1}
              </TableCell>
              <TableCell className="px-4 py-1.5 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="text-foreground/80 font-medium tracking-wide">
                    {formatDateTime(log.date)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-4 py-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "px-3 py-1 font-semibold text-xs rounded-full shadow-none w-fit",
                    log.action_type === "Phê duyệt quy trình"
                      ? "border-amber-200 bg-amber-50 text-amber-600"
                      : "border-orange-200 bg-orange-50 text-orange-600",
                  )}
                >
                  {log.action_type || "-"}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-2">
                {log.status_name || log.notes || "-"}
              </TableCell>
              <TableCell className="px-4 py-1.5 text-center">
                {log.document_number ? (
                  <Link

                    href={"#"}
                    className="inline-flex items-center gap-1.5 text-primary hover:underline font-bold tracking-wide text-sm"
                  >
                    {log.document_number} <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <span className="text-muted-foreground text-xs italic">
                    {t("table.log_entry")}
                  </span>
                )}
              </TableCell>
              <TableCell className="px-4 py-1.5 text-right pr-6">
                <strong className="text-foreground text-sm font-bold tracking-wide whitespace-nowrap">
                  {log.user_name || "—"}
                </strong>
              </TableCell>
              <TableCell className="px-4 py-1.5 text-center text-sm font-semibold">
                {log.quantity ?? "-"}
              </TableCell>
              <TableCell className="px-4 py-1.5">
                {log.doc_status ? (
                  <Badge
                    variant="outline"
                    className="px-2 py-0.5 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: `${log.doc_status_color}1a`,
                      color: log.doc_status_color ?? undefined,
                      borderColor: `${log.doc_status_color}40`,
                    }}
                  >
                    {log.doc_status}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs italic">
                    -
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
