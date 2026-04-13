"use client";

import {
  Laptop,
  Package,
  Key,
  ClipboardList,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/redux";

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  const stats = [
    {
      title: "Total Assets",
      value: "1,284",
      change: "+12.5%",
      trend: "up",
      icon: Laptop,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Rentals",
      value: "42",
      change: "+4.3%",
      trend: "up",
      icon: Key,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Pending Tasks",
      value: "18",
      change: "-2.1%",
      trend: "down",
      icon: ClipboardList,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Inventory Stocks",
      value: "856",
      change: "+1.2%",
      trend: "up",
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "transfer",
      title: "Asset Transfer",
      description: "MacBook Pro M2 transferred to Marketing Team",
      time: "2 hours ago",
      icon: ArrowRightLeft,
      iconColor: "text-blue-600",
    },
    {
      id: 2,
      type: "checkout",
      title: "Item Checkout",
      description: "Canon EOS R5 checked out by John Doe",
      time: "5 hours ago",
      icon: Key,
      iconColor: "text-amber-600",
    },
    {
      id: 3,
      type: "maintenance",
      title: "Maintenance",
      description: "Projector XR-500 scheduled for maintenance",
      time: "Yesterday",
      icon: Clock,
      iconColor: "text-emerald-600",
    },
    {
      id: 4,
      type: "success",
      title: "Asset Registered",
      description: "5 new Dell XPS 15 added to primary catalog",
      time: "2 days ago",
      icon: CheckCircle2,
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back,{" "}
            <span className="text-primary">{user?.full_name || "User"}</span>!
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here&apos;s your daily asset overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 border-border/50 bg-background/50 backdrop-blur-sm shadow-sm font-semibold"
          >
            Download report
          </Button>
          <Button
            size="sm"
            className="h-9 px-4 shadow-md shadow-primary/20 font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            New asset
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <CardContent className="p-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px] font-bold"
              >
                Week
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-7 px-2 text-[10px] font-bold shadow-sm bg-background"
              >
                Month
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px] font-bold"
              >
                Year
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-61px)] flex flex-col justify-end gap-6 pb-6 pt-4 px-4 overflow-hidden">
            {/* Visual Chart Bars Mockup */}
            <div className="flex items-end justify-between h-full gap-2 md:gap-4 lg:gap-6 px-2">
              {[65, 45, 75, 55, 90, 40, 60, 80, 70, 85].map((height, i) => (
                <div key={i} className="flex-1 group relative">
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all duration-500 bg-primary/20 group-hover:bg-primary/40",
                      i === 4 &&
                        "bg-primary shadow-[0_-4px_12px_rgba(var(--primary),0.2)]",
                    )}
                    style={{ height: `${height}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-10 group-hover:-translate-y-1">
                    {height}%
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between px-2 text-[10px] font-bold text-muted-foreground/60 tracking-tight">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
            </div>
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
          <CardContent className="p-4">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3 group">
                  <div
                    className={cn(
                      "p-1.5 rounded-lg bg-background shadow-sm ring-1 ring-border/50 shrink-0 group-hover:scale-105 transition-transform",
                    )}
                  >
                    <activity.icon
                      className={cn("h-3.5 w-3.5", activity.iconColor)}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-bold truncate tracking-tight">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                      {activity.description}
                    </p>
                    <span className="text-[10px] font-semibold text-muted-foreground/50 mt-0.5">
                      {activity.time}
                    </span>
                  </div>
                </div>
              ))}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/10 flex flex-col md:flex-row items-center gap-6 group overflow-hidden relative">
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

        <Card className="border-none shadow-sm ring-1 ring-border/50 bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-border/40">
            <CardTitle className="text-sm font-semibold text-primary">
              Critical tasks
            </CardTitle>
            <Badge className="bg-rose-500/15 text-rose-500 border-none font-bold text-[10px] animate-pulse">
              3 Action required
            </Badge>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 group hover:bg-rose-500/10 transition-colors">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-500" />
                <span className="text-sm font-bold tracking-tight">
                  Laptop rental overdue
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] font-bold text-rose-600"
              >
                Reschedule
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 group hover:bg-amber-500/10 transition-colors">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-bold tracking-tight">
                  Inventory stock low
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] font-bold text-amber-700"
              >
                Restock
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
