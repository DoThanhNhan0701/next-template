"use client";

import { useEffect, useState } from "react";

import {
  Activity,
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
  Laptop,
  ListTodo,
  MapPin,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { useSelector } from "react-redux";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { cn } from "@/lib/utils";
import { RootState } from "@/redux";
import {
  DashboardModuleStats,
  DashboardRecentActivity,
  DashboardStatusChart,
  DashboardSummaryResponse,
} from "@/types/dashboard";
import { formatDate } from "@/utils/date";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const { user } = useSelector((state: RootState) => state.auth);

  const { response } = useGet<DashboardSummaryResponse>({
    url: endpoints.DASHBOARD_SUMMARY,
  });
  const summary = response;

  const { response: activities } = useGet<{ data: DashboardRecentActivity[] }>({
    url: endpoints.DASHBOARD_RECENT_ACTIVITIES,
  });

  const { response: moduleStatsRes } = useGet<DashboardModuleStats>({
    url: endpoints.DASHBOARD_MODULE_STATS,
  });
  const moduleStats = moduleStatsRes;
  const totalPendingStats = Object.values(moduleStats || {}).reduce(
    (a, b) => a + Number(b),
    0,
  );

  const { response: statusChartRes } = useGet<{ data: DashboardStatusChart[] }>(
    {
      url: endpoints.DASHBOARD_STATUS_CHART,
    },
  );
  const statusChartData = statusChartRes?.data || [];
  const maxStatusCount = Math.max(...statusChartData.map((d) => d.count), 1);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);

  const stats = [
    {
      title: "Total Assets",
      value: summary?.total_assets_count || 0,
      change: "+12.5%",
      trend: "up",
      icon: Laptop,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Locations",
      value: summary?.total_locations_count || 0,
      change: "+4.3%",
      trend: "up",
      icon: MapPin,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Total Users",
      value: summary?.total_users_count || 0,
      change: "+1.2%",
      trend: "up",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Total Asset Value",
      value: formatCurrency(summary?.financials?.total_asset_value || 0),
      change: "+5.4%",
      trend: "up",
      icon: DollarSign,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Rental Revenue",
      value: formatCurrency(summary?.financials?.total_rental_revenue || 0),
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Maintenance Cost",
      value: formatCurrency(summary?.financials?.total_maintenance_cost || 0),
      change: "-1.5%",
      trend: "down",
      icon: Wrench,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="flex flex-col gap-3 px-3 pb-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back,{" "}
            <span className="text-primary" suppressHydrationWarning>
              {user?.full_name || "User"}
            </span>
            !
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here&apos;s your daily asset overview.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-sm ring-1 ring-border/50 bg-card/60 backdrop-blur-md hover:ring-primary/20 transition-all group relative overflow-hidden"
          >
            <div
              className={cn(
                "absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity",
                stat.color.replace("text-", "bg-"),
              )}
            />
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={cn("p-2 rounded-xl ring-1 ring-border/5", stat.bg)}
                >
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "px-2 py-0 h-5 text-[10px] font-bold border-none",
                    stat.trend === "up"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-rose-500/10 text-rose-500",
                  )}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-muted-foreground tracking-tight">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold tracking-tighter">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column: Visual Analytics Mockup */}
        <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-border/50 bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-border/40">
            <div>
              <CardTitle className="text-sm font-semibold text-primary">
                Asset status overview
              </CardTitle>
              <CardDescription className="text-xs">
                Visual distribution across departments.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-61px)] flex flex-col justify-end gap-6 pb-6 pt-10 px-4 overflow-hidden">
            <div className="flex items-end justify-between h-full gap-2 md:gap-3 lg:gap-6 px-2">
              {statusChartData.map((item) => {
                const heightPercentage = (item.count / maxStatusCount) * 100;
                return (
                  <div
                    key={item.status_code}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    <div
                      className="w-full rounded-t-md transition-all duration-1000 ease-out hover:opacity-100 relative flex justify-center"
                      style={{
                        height: mounted ? `${heightPercentage}%` : "0%",
                        backgroundColor: item.color,
                        opacity: 0.8,
                      }}
                    >
                      <span className="absolute -top-4 text-[10px] font-bold text-muted-foreground whitespace-nowrap opacity-100 transition-opacity duration-700">
                        {item.count}
                      </span>
                    </div>
                  </div>
                );
              })}
              {statusChartData.length === 0 && (
                <div className="w-full h-full flex flex-col items-center justify-center text-sm text-muted-foreground">
                  Đang tải biểu đồ...
                </div>
              )}
            </div>
            {statusChartData.length > 0 && (
              <div className="flex justify-between w-full text-[10px] font-bold text-muted-foreground/60 tracking-tight gap-1">
                {statusChartData.map((item) => (
                  <span
                    key={item.status_code}
                    className="flex-1 text-center truncate"
                    title={item.status_name}
                  >
                    {item.status_name}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Recent Activity */}
        <Card className="border-none shadow-sm ring-1 ring-border/50 bg-card/60 backdrop-blur-md">
          <CardHeader className="py-3 px-4 border-b border-border/40">
            <CardTitle className="text-sm font-semibold text-primary">
              Recent activity
            </CardTitle>
            <CardDescription className="text-xs">
              Latest updates across your portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {(activities?.data || []).map((activity) => {
                const Icon =
                  activity.action_type === "allocation"
                    ? Users
                    : activity.action_type === "workflow"
                      ? Activity
                      : CheckCircle2;

                return (
                  <div key={activity.id} className="flex gap-3 group">
                    <div className="p-1.5 rounded-lg bg-background shadow-sm ring-1 ring-border/50 shrink-0 group-hover:scale-105 transition-transform">
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{ color: activity.color }}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-bold truncate tracking-tight">
                        {activity.asset_name}
                      </p>
                      <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                        {activity.action_label} - {activity.asset_code} (Bởi:{" "}
                        {activity.performed_by})
                      </p>
                      <span
                        className="text-[10px] font-semibold text-muted-foreground/50 mt-0.5"
                        suppressHydrationWarning
                      >
                        {formatDate(activity.performed_at, "HH:mm")}{" "}
                        {formatDate(activity.performed_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 h-8 text-[11px] font-bold tracking-tight text-muted-foreground hover:text-primary border border-transparent hover:border-primary/10 transition-all"
            >
              View all activities
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* My Tasks Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-3 p-5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/10 flex flex-col md:flex-row items-center gap-6 group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="p-3.5 rounded-xl bg-white/10 shrink-0 group-hover:rotate-6 transition-transform duration-500 relative z-10">
            <TrendingUp className="h-8 w-8" />
          </div>
          <div className="space-y-1.5 text-center md:text-left relative z-10">
            <h2 className="text-xl font-bold tracking-tight leading-none">
              Your portfolio is growing
            </h2>
            <p className="text-sm text-primary-foreground/80 leading-snug">
              You&apos;ve added 12 new assets this month (+15% vs LY). Maintain
              data accuracy for better reporting.
            </p>
            <div className="pt-2">
              <Button
                variant="secondary"
                className="shadow-sm hover:translate-x-1 transition-transform h-8 text-xs font-bold"
                size="sm"
              >
                View analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Module Stats Card */}
        <Card className="lg:col-span-1 border-none shadow-sm ring-1 ring-border/50 bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-border/40">
            <CardTitle className="text-sm font-semibold text-primary">
              Module Tác vụ
            </CardTitle>
            {totalPendingStats > 0 && (
              <Badge className="bg-rose-500/15 text-rose-500 border-none font-bold text-[10px] animate-pulse">
                {totalPendingStats} Việc cần xử lý
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {(moduleStats?.pending_allocations ?? 0) > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 group hover:bg-blue-500/10 transition-colors">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-bold tracking-tight">
                    Cấp phát
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="h-6 font-bold text-blue-500 bg-blue-500/15 border-none"
                >
                  {moduleStats?.pending_allocations}
                </Badge>
              </div>
            )}
            {(moduleStats?.pending_transfers ?? 0) > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 group hover:bg-indigo-500/10 transition-colors">
                <div className="flex items-center gap-2.5">
                  <ArrowRightLeft className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-bold tracking-tight">
                    Điều chuyển
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="h-6 font-bold text-indigo-500 bg-indigo-500/15 border-none"
                >
                  {moduleStats?.pending_transfers}
                </Badge>
              </div>
            )}
            {(moduleStats?.pending_maintenances ?? 0) > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/10 group hover:bg-orange-500/10 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Wrench className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-bold tracking-tight">
                    Bảo trì
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="h-6 font-bold text-orange-500 bg-orange-500/15 border-none"
                >
                  {moduleStats?.pending_maintenances}
                </Badge>
              </div>
            )}
            {(moduleStats?.pending_liquidations ?? 0) > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-stone-500/5 border border-stone-500/10 group hover:bg-stone-500/10 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Trash2 className="h-4 w-4 text-stone-500" />
                  <span className="text-sm font-bold tracking-tight">
                    Thanh lý
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="h-6 font-bold text-stone-500 bg-stone-500/15 border-none"
                >
                  {moduleStats?.pending_liquidations}
                </Badge>
              </div>
            )}
            {(moduleStats?.pending_workflow_tasks ?? 0) > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 group hover:bg-emerald-500/10 transition-colors">
                <div className="flex items-center gap-2.5">
                  <ListTodo className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-bold tracking-tight">
                    Duyệt workflow
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="h-6 font-bold text-emerald-500 bg-emerald-500/15 border-none"
                >
                  {moduleStats?.pending_workflow_tasks}
                </Badge>
              </div>
            )}
            {totalPendingStats === 0 && (
              <div className="flex items-center justify-center p-3 text-sm text-muted-foreground/70">
                Không có việc cần xử lý.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
