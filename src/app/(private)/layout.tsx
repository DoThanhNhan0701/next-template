"use client";

import Header from "@/components/layouts/header";
import Sidebar from "@/components/layouts/sidebar";
import { AppDispatch, RootState } from "@/redux";
import { actionFetchUser } from "@/redux/slices/auth";
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
} from "lucide-react";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const t = useTranslations("Menu");

  useEffect(() => {
    const promise = dispatch(actionFetchUser());
    return () => {
      promise.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sidebarItems = [
    { title: t("dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("myTasks"), url: "/my-tasks", icon: ClipboardList },
    { title: t("assets"), url: "/assets", icon: Laptop },
    { title: t("rentals"), url: "/rentals", icon: Key },
    { title: t("inventory"), url: "/inventory", icon: Package },
    { title: t("transfers"), url: "/transfers", icon: ArrowRightLeft },
    { title: t("stockInOut"), url: "/stock-in-out", icon: PackageSearch },
    {
      title: t("allocationRecovery"),
      url: "/allocation-recovery",
      icon: BarChart3,
    },
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
