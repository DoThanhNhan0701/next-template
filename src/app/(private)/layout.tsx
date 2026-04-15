"use client";

import Header from "@/components/layouts/header";
import Sidebar from "@/components/layouts/sidebar";
import { AppDispatch, RootState } from "@/redux";
import { actionFetchUser } from "@/redux/slices/auth";
import { ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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

  useEffect(() => {
    const promise = dispatch(actionFetchUser());
    return () => {
      promise.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sidebarItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "My Tasks", url: "/my-tasks", icon: ClipboardList },
    { title: "Assets", url: "/assets", icon: Laptop },
    { title: "Inventory", url: "/inventory", icon: Package },
    { title: "Stock In/Out", url: "/stock-in-out", icon: PackageSearch },
    { title: "Rentals", url: "/rentals", icon: Key },
    { title: "Dispatch & Recovery", url: "/dispatch-recovery", icon: BarChart3 },
    { title: "Transfers", url: "/transfers", icon: ArrowRightLeft },
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
