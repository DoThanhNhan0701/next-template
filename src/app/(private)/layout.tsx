"use client";

import { ReactNode, useEffect } from "react";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import {
  ArrowRightLeft,
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  Key,
  Laptop,
  LayoutDashboard,
  Package,
  PackageSearch,
  Trash2,
  Wrench,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import Header from "@/components/layouts/header";
import Sidebar from "@/components/layouts/sidebar";
import { SidebarItem } from "@/components/layouts/sidebar";
import { usePermissions } from "@/hooks/usePermissions";
import { AppDispatch, RootState } from "@/redux";
import { actionFetchUser } from "@/redux/slices/auth";
import { actionFetchPendingCount } from "@/redux/slices/task";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { counts } = useSelector((state: RootState) => state.task);
  const { hasPermission } = usePermissions();
  const t = useTranslations("Menu");

  useEffect(() => {
    dispatch(actionFetchUser());

    if (pathname !== "/my-tasks") {
      dispatch(actionFetchPendingCount());
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const sidebarItems: SidebarItem[] = [
    { title: t("dashboard"), url: "/dashboard", icon: LayoutDashboard },
    {
      title: t("my_tasks"),
      url: "/my-tasks",
      icon: ClipboardList,
      badge: counts.PENDING,
    },
    {
      title: t("assets"),
      url: "/assets",
      icon: Laptop,
      permission: "assets:view",
    },
    {
      title: t("rentals"),
      url: "/rentals",
      icon: Key,
      permission: "rentals:manage",
    },
    {
      title: t("inventory"),
      url: "/inventory",
      icon: Package,
    },
    {
      title: t("transfers"),
      url: "/transfers",
      icon: ArrowRightLeft,
      permission: "transfers:manage",
    },
    {
      title: t("stock_in_out"),
      url: "/stock-in-out",
      icon: PackageSearch,
    },
    {
      title: t("allocation_recovery"),
      url: "/allocation-recovery",
      icon: BarChart3,
    },
    {
      title: t("audits"),
      url: "/audits",
      icon: ClipboardCheck,
      permission: "audits:manage",
    },
    {
      title: t("maintenance"),
      url: "/maintenance",
      icon: Wrench,
      permission: "maintenances:manage",
    },
    {
      title: t("liquidations"),
      url: "/liquidations",
      icon: Trash2,
      permission: "liquidations:manage",
    },
  ].filter((item) => !item.permission || hasPermission(item.permission));

  console.log(sidebarItems);
  console.log(user);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header user={user} items={sidebarItems} />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex flex-1 mx-2 mb-2 overflow-hidden rounded-md border border-(--surface-border-color) bg-(--surface-container)">
          <Sidebar items={sidebarItems} />
          <section className="relative flex-1 p-2 overflow-auto">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}
