"use client";

import { ReactNode, useEffect, useMemo } from "react";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

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
import Sidebar, { SidebarItem } from "@/components/layouts/sidebar";
import AppBootstrap from "@/components/libs/app-bootstrap";
import { useFaviconBadge } from "@/hooks/useFaviconBadge";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { usePermissions } from "@/hooks/usePermissions";
import { AppDispatch, RootState } from "@/redux";
import { actionFetchPendingCount } from "@/redux/slices/task";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hasHydrated = useHasHydrated();

  const dispatch = useDispatch<AppDispatch>();
  const {
    user,
    isInitialized,
    loading: authLoading,
  } = useSelector((state: RootState) => state.auth);
  const { counts } = useSelector((state: RootState) => state.task);
  const { hasPermission, isReady } = usePermissions();
  const t = useTranslations("layout_user");

  useFaviconBadge(counts.PENDING, pathname);

  useEffect(() => {
    if (authLoading || !isReady || !isInitialized) return;
    if (pathname !== "/my-tasks") {
      dispatch(actionFetchPendingCount());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isReady, isInitialized]);

  const router = useRouter();
  const allItems: SidebarItem[] = useMemo(
    () => [
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
        title: t("inventory"),
        url: "/inventory",
        icon: Package,
      },
      {
        title: t("rentals"),
        url: "/rentals",
        icon: Key,
        permission: "rentals:manage",
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
    ],
    [counts.PENDING, t],
  );

  useEffect(() => {
    if (authLoading || !isReady || !isInitialized) return;

    const restrictedItem = allItems.find((item) => {
      const matches =
        item.url === "/"
          ? pathname === "/"
          : pathname === item.url || pathname.startsWith(item.url + "/");

      return matches && item.permission && !hasPermission(item.permission);
    });

    if (restrictedItem) {
      router.push("/dashboard");
    }
  }, [
    pathname,
    authLoading,
    hasPermission,
    router,
    allItems,
    isReady,
    isInitialized,
  ]);

  const isLayoutLoading = authLoading || !isInitialized || !hasHydrated;

  const sidebarItems = useMemo(
    () =>
      isLayoutLoading
        ? []
        : allItems.filter(
            (item) => !item.permission || hasPermission(item.permission),
          ),
    [isLayoutLoading, allItems, hasPermission],
  );

  return (
    <AppBootstrap>
      <div className="h-screen flex flex-col overflow-hidden">
        <Header user={user} items={sidebarItems} loading={isLayoutLoading} />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex flex-1 mx-2 mb-2 overflow-hidden rounded-md border border-(--surface-border-color) bg-(--surface-container)">
            <Sidebar items={sidebarItems} loading={isLayoutLoading} />
            <section className="relative flex-1 p-2 overflow-auto">
              {children}
            </section>
          </main>
        </div>
      </div>
    </AppBootstrap>
  );
}
