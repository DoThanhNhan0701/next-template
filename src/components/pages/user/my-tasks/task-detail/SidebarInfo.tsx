"use client";

import { useTranslations } from "next-intl";

import { Clock, History, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AllocationDocument,
  DocumentDetail,
  isAllocationDocument,
} from "@/types/task";
import { formatDateTime } from "@/utils/date";

interface SidebarInfoProps {
  detail: DocumentDetail;
}

export const SidebarInfo = ({ detail }: SidebarInfoProps) => {
  const t = useTranslations("page_my_tasks.detail.sidebar_info");
  return (
    <Card className="shadow-sm border-border/50 overflow-hidden bg-card/60 backdrop-blur-md group h-full rounded-md">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-border/40 py-2 px-3">
        <History className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
        <CardTitle className="text-xs font-semibold text-primary">
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between pb-2 border-b border-border/20 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                {t("creator")}
              </span>
            </div>
            <span className="text-xs font-semibold text-foreground truncate ml-2 text-right">
              {detail.creator?.full_name ||
                (isAllocationDocument(detail)
                  ? (detail as AllocationDocument).issuer_name
                  : "N/A")}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-border/20 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                {t("created_time")}
              </span>
            </div>
            <div className="flex flex-col items-end ml-2">
              <span className="text-xs font-semibold text-foreground text-right">
                {formatDateTime(detail.created_at)}
              </span>
            </div>
          </div>

          {isAllocationDocument(detail) &&
            (detail as AllocationDocument).issuer && (
              <div className="flex items-center justify-between pb-2 border-b border-border/20 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                    {t("issuer_details")}
                  </span>
                </div>
                <div className="flex flex-col items-end ml-2">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {(detail as AllocationDocument).issuer.full_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase">
                    {(detail as AllocationDocument).issuer.role}
                  </span>
                </div>
              </div>
            )}

          <div className="mt-1- p-2 rounded-lg bg-muted/30 border border-border/40 flex flex-col gap-1">
            <span className="text-[10px] font-black text-muted-foreground tracking-[0.15em] text-center uppercase">
              {t("system_notes")}
            </span>
            <p className="text-[11px] text-muted-foreground italic text-center leading-tight">
              {t("system_notes_description")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
