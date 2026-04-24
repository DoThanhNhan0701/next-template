"use client";

import { Clock, History, User } from "lucide-react";

import { useTranslations } from "next-intl";

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
    <Card className="shadow-sm border-border/50 overflow-hidden bg-card/60 backdrop-blur-md group h-full">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3 px-4">
        <History className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
        <CardTitle className="text-sm font-semibold text-primary">
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-muted-foreground tracking-wider">
                {t("creator")}
              </span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {detail.creator?.full_name ||
                (isAllocationDocument(detail)
                  ? (detail as AllocationDocument).issuer_name
                  : "N/A")}
            </span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-muted-foreground tracking-wider">
                {t("created_time")}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-foreground">
                {formatDateTime(detail.created_at)}
              </span>
            </div>
          </div>

          {isAllocationDocument(detail) &&
            (detail as AllocationDocument).issuer && (
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground tracking-wider">
                    {t("issuer_details")}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-foreground">
                    {(detail as AllocationDocument).issuer.full_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase">
                    {(detail as AllocationDocument).issuer.role}
                  </span>
                </div>
              </div>
            )}

          <div className="mt-3 p-3 rounded-xl bg-muted/30 border border-border/50 flex flex-col gap-2">
            <span className="text-sm font-black text-muted-foreground tracking-[0.2em] text-center">
              {t("system_notes")}
            </span>
            <p className="text-sm text-muted-foreground italic text-center leading-relaxed">
              {t("system_notes_description")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
