"use client";

import { useRouter } from "next/navigation";

import { ChevronLeft } from "lucide-react";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export const ActionHeader = () => {
  const t = useTranslations("page_my_tasks.detail.action_header");
  const router = useRouter();

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded shadow-sm shrink-0 border-border/50 w-8 h-8"
          onClick={() => router.back()}
          title={t("back_to_list")}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold text-foreground">
            {t("task_detail")}
          </h1>
          <span className="text-xs text-muted-foreground">{t("back_to_list")}</span>
        </div>
      </div>
    </div>
  );
};
