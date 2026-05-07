import { SearchX } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ─── Skeleton Loading Row ────────────────────────────────────────────────────

function SkeletonCell({ widths }: { widths: string[] }) {
  return (
    <>
      {widths.map((w, i) => (
        <div
          key={i}
          className={cn("h-3 rounded-full bg-muted animate-pulse", w)}
        />
      ))}
    </>
  );
}

const SKELETON_COLUMN_PATTERNS: string[][] = [
  ["w-1/2", "w-1/3"],
  ["w-2/3", "w-1/4"],
  ["w-1/3", "w-1/2"],
  ["w-3/5", "w-1/3"],
  ["w-2/5", "w-2/5"],
];

interface TableLoadingRowsProps {
  colSpan: number;
  rows?: number;
}

/**
 * Renders animated skeleton rows while data is loading.
 */
export function TableLoadingRows({ colSpan, rows = 6 }: TableLoadingRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow
          key={rowIdx}
          className="animate-pulse border-b border-(--surface-border-color)"
          style={{ animationDelay: `${rowIdx * 60}ms` }}
        >
          {/* First cell: icon skeleton + text skeletons */}
          <TableCell className="px-4 py-1.5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r bg-muted animate-pulse" />
            <div className="flex items-center gap-3 pl-2">
              <div className="h-9 w-9 rounded-lg bg-muted shrink-0" />
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <SkeletonCell
                  widths={
                    SKELETON_COLUMN_PATTERNS[
                      rowIdx % SKELETON_COLUMN_PATTERNS.length
                    ]
                  }
                />
              </div>
            </div>
          </TableCell>

          {/* Remaining cells */}
          {Array.from({ length: colSpan - 1 }).map((_, colIdx) => (
            <TableCell key={colIdx} className="px-4 py-1.5">
              <div className="flex flex-col gap-2">
                <SkeletonCell
                  widths={
                    SKELETON_COLUMN_PATTERNS[
                      (rowIdx + colIdx + 1) % SKELETON_COLUMN_PATTERNS.length
                    ]
                  }
                />
              </div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── Empty / No Data State ───────────────────────────────────────────────────

interface TableEmptyRowProps {
  colSpan: number;
  message?: string;
  description?: string;
  icon?: LucideIcon;
}

/**
 * Renders a polished empty-state row when there is no data to display.
 */
export function TableEmptyRow({
  colSpan,
  message = "No data found",
  description = "Try adjusting your search or filters to find what you're looking for.",
  icon: Icon = SearchX,
}: TableEmptyRowProps) {
  return (
    <TableRow className="hover:bg-transparent border-0">
      <TableCell colSpan={colSpan} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center gap-3 select-none">
          {/* Icon circle */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-20 w-20 rounded-full bg-muted/60 animate-pulse" />
            <div className="relative h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Icon
                size={28}
                className="text-muted-foreground/50"
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-sm font-semibold text-foreground/70">
              {message}
            </p>
            <p className="text-xs text-muted-foreground/60 max-w-[280px] leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
