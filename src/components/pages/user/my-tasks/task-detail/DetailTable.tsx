"use client";

import React from "react";

import { LucideIcon, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column {
  key: string;
  label: string;
  align?: "center" | "left" | "right";
}

interface DetailTableProps {
  detailItems: {
    title: string;
    icon: LucideIcon | React.ElementType;
    columns: Column[];
    rows: Array<Record<string, string | number | null | undefined>>;
  };
}

export const DetailTable = ({ detailItems }: DetailTableProps) => {
  const IconComponent = detailItems.icon || Package;

  return (
    <div>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-primary w-full flex items-center gap-2 px-3 py-2">
          <IconComponent className="w-4 h-4" />
          {detailItems.title}
        </h3>
      </div>
      <div className="overflow-hidden">
        <Table>
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-border/50">
            <TableRow className="hover:bg-transparent border-border/50">
              {detailItems.columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`text-sm font-bold text-muted-foreground h-11 ${
                    col.key === detailItems.columns[0].key ? "px-4 w-[5%]" : ""
                  } ${col.align === "center" ? "text-center" : ""}`}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {detailItems.rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-border/50 hover:bg-muted/50 transition-colors"
              >
                {detailItems.columns.map((col, colIndex) => (
                  <TableCell
                    key={col.key}
                    className={`py-2 ${colIndex === 0 ? "px-4" : ""} ${
                      col.align === "center" ? "text-center" : ""
                    }`}
                  >
                    {renderCellContent(col.key, row[col.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const renderCellContent = (
  key: string,
  value: string | number | boolean | null | undefined,
): React.ReactNode => {
  if (key === "asset_code") {
    return (
      <code className="text-sm font-mono font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded">
        {value}
      </code>
    );
  }

  if (key === "quantity" || key === "quantity_diff") {
    return (
      <span className="inline-flex items-center justify-center w-10 h-6 bg-primary/10 text-primary rounded-lg text-sm font-bold px-1">
        {value}
      </span>
    );
  }

  if (key === "returned_quantity") {
    return (
      <span className="inline-flex items-center justify-center w-10 h-6 bg-emerald-500/10 text-emerald-600 rounded-lg text-sm font-bold px-1">
        {value}
      </span>
    );
  }

  if (key === "rental_revenue") {
    return <span className="text-sm font-bold text-foreground">{value}</span>;
  }

  if (key === "type") {
    return (
      <Badge
        variant="outline"
        className={`${
          value === "INCREASE"
            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
            : "bg-red-500/15 text-red-600 border-red-500/20"
        } px-2 py-0.5 font-bold text-xs`}
      >
        {value}
      </Badge>
    );
  }

  if (key === "condition") {
    return (
      <Badge
        variant="outline"
        className="bg-blue-500/15 text-blue-600 border-blue-500/20 px-2 py-0.5 font-bold text-xs"
      >
        {value}
      </Badge>
    );
  }

  if (key === "no") {
    return <span className="text-muted-foreground">{value}</span>;
  }

  if (key === "asset" || key === "asset_name") {
    return (
      <span className="text-sm font-semibold text-foreground">{value}</span>
    );
  }

  return (
    <span className="text-sm text-muted-foreground font-medium">{value}</span>
  );
};
