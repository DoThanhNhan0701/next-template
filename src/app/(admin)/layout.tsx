"use client";

import Header from "@/components/layouts/header";
import Sidebar from "@/components/layouts/sidebar";
import { RootState } from "@/redux";
import { ReactNode } from "react";
import { useSelector } from "react-redux";
import AppBootstrap from "@/components/libs/app-bootstrap";

import {
  Users,
  Shield,
  SquareDashedKanbanIcon,
  MapPin,
  Layers,
  Grid,
  Activity,
  MousePointerClick,
  Store,
  Contact,
  Building2,
  GitBranch,
} from "lucide-react";

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { user } = useSelector((state: RootState) => state.auth);

  const adminSidebarItems = [
    { title: "Dashboard", url: "/admin", icon: SquareDashedKanbanIcon },
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Staff", url: "/admin/staff", icon: Contact },
    { title: "Roles", url: "/admin/roles", icon: Shield },
    { title: "Organization", url: "/admin/organization", icon: Building2 },
    { title: "Locations", url: "/admin/locations", icon: MapPin },
    { title: "Asset groups", url: "/admin/asset-groups", icon: Layers },
    { title: "Catalog types", url: "/admin/catalog-types", icon: Grid },
    { title: "Asset statuses", url: "/admin/asset-statuses", icon: Activity },
    { title: "Usage modes", url: "/admin/usage-modes", icon: MousePointerClick },
    { title: "Suppliers", url: "/admin/suppliers", icon: Store },
    { title: "Customers", url: "/admin/customers", icon: Users },
    { title: "Approval workflows", url: "/admin/workflow-templates", icon: GitBranch },
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
