import { ILifecycleLog } from "@/types/physical-asset";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SystemLogTab({ logs }: { logs: ILifecycleLog[] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Không có nhật ký hệ thống.
      </div>
    );
  }

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="border border-(--surface-border-color) rounded-lg flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
      <Table className="whitespace-nowrap">
        <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
          <TableRow>
            <TableHead className="font-semibold h-10 px-4 w-16 text-center">
              STT
            </TableHead>
            <TableHead className="font-semibold h-10 px-4 min-w-[100px] w-32">
              Ngày
            </TableHead>
            <TableHead className="font-semibold h-10 px-4 min-w-[300px]">
              Nghiệp vụ
            </TableHead>
            <TableHead className="font-semibold h-10 px-4 w-40 text-center">
              Số chứng từ
            </TableHead>
            <TableHead className="font-semibold h-10 px-4 w-40 text-right pr-6">
              Người dùng
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-(--surface-border-color)">
          {logs.map((log, i) => (
            <TableRow
              key={i}
              className="group hover:bg-primary/3 transition-colors relative"
            >
              <TableCell className="px-4 py-1.5 text-center font-medium text-muted-foreground text-sm">
                {i + 1}
              </TableCell>
              <TableCell className="px-4 py-1.5 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="text-foreground/80 font-medium tracking-wide">
                    {formatTime(log.date)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatDate(log.date)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-4 py-2">
                <div className="flex flex-col items-start gap-2.5 w-full">
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
                  <div className="bg-slate-50/70 border border-slate-200/60 rounded-md p-2.5 text-[11px] text-slate-700 leading-relaxed shadow-sm w-full font-medium whitespace-break-spaces">
                    {log.status_name || log.notes || "-"}
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-1.5 text-center">
                {log.document_number ? (
                  <Link
                    href={log.external_link || "#"}
                    className="inline-flex items-center gap-1.5 text-primary hover:underline font-bold tracking-wide text-sm"
                  >
                    {log.document_number} <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <span className="text-muted-foreground text-xs italic">
                    Nhật ký
                  </span>
                )}
              </TableCell>
              <TableCell className="px-4 py-1.5 text-right pr-6">
                <strong className="text-foreground text-sm font-bold tracking-wide whitespace-normal">
                  {log.user_name || "—"}
                </strong>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
