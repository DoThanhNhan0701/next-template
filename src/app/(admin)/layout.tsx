"use client";

import { ReactNode } from "react";

import { useTranslations } from "next-intl";

import {
  Activity,
  Building,
  Building2,
  Contact,
  GitBranch,
  Grid,
  MapPin,
  MousePointerClick,
  Shield,
  Store,
  Users,
} from "lucide-react";
import { useSelector } from "react-redux";

import Header from "@/components/layouts/header";
import Sidebar from "@/components/layouts/sidebar";
import AppBootstrap from "@/components/libs/app-bootstrap";
import { RootState } from "@/redux";

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { user } = useSelector((state: RootState) => state.auth);
  const t = useTranslations("layout_admin");

  const adminSidebarItems = [
    { title: t("users"), url: "/admin/users", icon: Users },
    { title: t("staff"), url: "/admin/staff", icon: Contact },
    { title: t("roles"), url: "/admin/roles", icon: Shield },
    { title: t("organization"), url: "/admin/organization", icon: Building2 },
    { title: t("offices"), url: "/admin/offices", icon: Building },
    { title: t("locations"), url: "/admin/locations", icon: MapPin },
    // { title: t("asset_groups"), url: "/admin/asset-groups", icon: Layers },
    { title: t("catalog_types"), url: "/admin/catalog-types", icon: Grid },
    {
      title: t("asset_statuses"),
      url: "/admin/asset-statuses",
      icon: Activity,
    },
    {
      title: t("usage_modes"),
      url: "/admin/usage-modes",
      icon: MousePointerClick,
    },
    { title: t("suppliers"), url: "/admin/suppliers", icon: Store },
    { title: t("customers"), url: "/admin/customers", icon: Users },
    {
      title: t("approval_workflows"),
      url: "/admin/workflow-templates",
      icon: GitBranch,
    },
  ];

  return (
    <AppBootstrap>
      <div className="h-screen flex flex-col overflow-hidden">
        <Header user={user} items={adminSidebarItems} />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex flex-1 mx-2 mb-2 overflow-hidden rounded-md border border-(--surface-border-color) bg-(--surface-container)">
            <Sidebar items={adminSidebarItems} />
            <section className="relative flex-1 p-2 overflow-auto">
              {children}
            </section>
          </main>
        </div>
      </div>
    </AppBootstrap>
  );
}
