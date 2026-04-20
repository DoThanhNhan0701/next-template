"use client";

import Header from "@/components/layouts/header";
import Sidebar from "@/components/layouts/sidebar";
import { AppDispatch, RootState } from "@/redux";
import { actionFetchUser } from "@/redux/slices/auth";
import { actionFetchPendingCount } from "@/redux/slices/task";
import { ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Laptop,
  Package,
  Key,
  BarChart3,
  ArrowRightLeft,
  ClipboardList,
  PackageSearch,
  ClipboardCheck,
  Wrench,
  Trash2,
} from "lucide-react";

import { usePathname } from "next/navigation";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { counts } = useSelector((state: RootState) => state.task);
  const t = useTranslations("Menu");

  useEffect(() => {
    dispatch(actionFetchUser());

    if (pathname !== "/my-tasks") {
      dispatch(actionFetchPendingCount());
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);


  const sidebarItems = [
    { title: t("dashboard"), url: "/dashboard", icon: LayoutDashboard },
    {
      title: t("my_tasks"),
      url: "/my-tasks",
      icon: ClipboardList,
      badge: counts.PENDING,
    },
    { title: t("assets"), url: "/assets", icon: Laptop },
    { title: t("rentals"), url: "/rentals", icon: Key },
    { title: t("inventory"), url: "/inventory", icon: Package },
    { title: t("transfers"), url: "/transfers", icon: ArrowRightLeft },
    { title: t("stock_in_out"), url: "/stock-in-out", icon: PackageSearch },
    {
      title: t("allocation_recovery"),
      url: "/allocation-recovery",
      icon: BarChart3,
    },
    { title: t("audits"), url: "/audits", icon: ClipboardCheck },
    { title: t("maintenance"), url: "/maintenance", icon: Wrench },
    { title: t("liquidations"), url: "/liquidations", icon: Trash2 },
  ];

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
