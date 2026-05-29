"use client";

import { useSyncExternalStore } from "react";

import { useTranslations } from "next-intl";

import { CheckCircle2, Clock } from "lucide-react";

import { cn } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value: number | string;
  description: string;
  icon: React.ElementType;
  color: "orange" | "green" | "red" | "yellow";
  className?: string;
}

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  color,
  className,
}: SummaryCardProps) {
  const colorMap = {
    orange: {
      bg: "bg-orange-500/5",
      border: "border-orange-500/20",
      text: "text-orange-500",
      icon: "text-orange-500/10",
      badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      label: "text-orange-500/80",
    },
    green: {
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
      text: "text-emerald-500",
      icon: "text-emerald-500/10",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      label: "text-emerald-500/80",
    },
    red: {
      bg: "bg-red-500/5",
      border: "border-red-500/20",
      text: "text-red-500",
      icon: "text-red-500/10",
      badge: "bg-red-500/10 text-red-400 border-red-500/20",
      label: "text-red-500/80",
    },
    yellow: {
      bg: "bg-yellow-500/5",
      border: "border-yellow-500/20",
      text: "text-yellow-500",
      icon: "text-yellow-500/10",
      badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      label: "text-yellow-500/80",
    },
  };

  const colors = colorMap[color];

  return (
    <div
      className={cn(
        "relative overflow-hidden group p-3 sm:p-5 rounded-xl border backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 bg-background/5",
        colors.bg,
        colors.border,
        className,
      )}
    >
      <div className="flex flex-col gap-1 relative z-10">
        <span
          className={cn(
            "text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-80",
            colors.label,
          )}
        >
          {label}
        </span>
        <span className="text-2xl sm:text-4xl font-bold text-foreground/90 tracking-tight">
          {value}
        </span>
        <div
          className={cn(
            "mt-1 sm:mt-3 hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border w-fit text-[10px] font-semibold",
            colors.badge,
          )}
        >
          {description}
        </div>
      </div>
      <Icon
        className={cn(
          "absolute -right-2 -bottom-2 w-12 h-12 sm:w-20 sm:h-20 transition-transform duration-500 group-hover:scale-110 opacity-20",
          colors.icon,
        )}
      />
    </div>
  );
}

interface SummarySectionProps {
  processingCount?: number;
  pendingApprovalCount?: number;
  historyCount?: number;
}

const emptySubscribe = () => () => {};

export function SummarySection({
  processingCount = 0,
  pendingApprovalCount = 0,
  historyCount = 0,
}: SummarySectionProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const displayProcessing = isClient ? processingCount : 0;
  const displayPendingApproval = isClient ? pendingApprovalCount : 0;
  const displayHistory = isClient ? historyCount : 0;

  const tSummary = useTranslations("page_my_tasks.summary");
  const tTabs = useTranslations("page_my_tasks.tabs");

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <SummaryCard
          label={tTabs("processing")}
          value={displayProcessing}
          description={tSummary("pending_desc")}
          icon={Clock}
          color="orange"
        />
        <SummaryCard
          label={tTabs("pending_approval")}
          value={displayPendingApproval}
          description={tSummary("pending_approval_desc")}
          icon={Clock}
          color="yellow"
        />
        <SummaryCard
          label={tTabs("history")}
          value={displayHistory}
          description={tSummary("history_desc")}
          icon={CheckCircle2}
          color="green"
        />
      </div>
    </div>
  );
}
