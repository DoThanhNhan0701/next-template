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
import { ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BusinessProcessTab({
  history,
}: {
  history: ILifecycleLog[];
}) {
  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Không có lịch sử quy trình.
      </div>
    );
  }

  const formatVietnameseDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date
        .toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(",", "");
    } catch {
      return isoString;
    }
  };

  return (
    <div className="border border-(--surface-border-color) rounded-lg w-full overflow-hidden [&_div[data-slot=table-container]]:max-h-[450px] [&_div[data-slot=table-container]]:overflow-auto">
      <Table className="whitespace-nowrap">
        <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm outline outline-border/20">
          <TableRow>
            <TableHead className="font-semibold h-10 px-4 w-16 text-center">
              STT
            </TableHead>
            <TableHead className="font-semibold h-10 px-4 w-40">Ngày</TableHead>
            <TableHead className="font-semibold h-10 px-4 min-w-[150px]">
              Nghiệp vụ
            </TableHead>
            <TableHead className="font-semibold h-10 px-4 w-40">
              Số chứng từ
            </TableHead>
            <TableHead className="font-semibold h-10 px-4">
              Người dùng/Vị trí
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-(--surface-border-color)">
          {history.map((log, i) => (
            <TableRow
              key={i}
              className="group hover:bg-primary/3 transition-colors relative"
            >
              <TableCell className="px-4 py-1.5 text-center font-medium text-muted-foreground text-sm">
                {i + 1}
              </TableCell>
              <TableCell className="px-4 py-1.5 text-sm text-foreground/80 font-medium">
                {formatVietnameseDate(log.date)}
              </TableCell>
              <TableCell className="px-4 py-1.5">
                <Badge
                  variant="outline"
                  className="px-3 py-1 font-semibold text-xs border-blue-200 bg-blue-50 text-blue-600 rounded-full shadow-none w-fit"
                >
                  {log.action_type || "-"}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-1.5">
                {log.document_number ? (
                  <Link
                    href={log.external_link || "#"}
                    className="flex w-fit items-center gap-1.5 text-primary hover:underline font-bold tracking-wide text-sm"
                  >
                    {log.document_number} <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <span className="text-muted-foreground text-xs italic">
                    -
                  </span>
                )}
              </TableCell>
              <TableCell className="px-4 py-1.5">
                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground w-max">
                  <div className="flex items-center gap-1.5 opacity-80">
                    <span>
                      {log.old_location_name ||
                        log.old_user_name ||
                        "Kho / Mặc định"}
                    </span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <strong className="text-foreground text-sm font-bold tracking-wide">
                    {log.user_name || log.location_name || "—"}
                  </strong>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
