"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import Logo from "@public/icons/logo.png";
import { Home, type LucideIcon } from "lucide-react";

import {
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIcon | React.ElementType;
  badge?: number;
  permission?: string;
}

export const defaultItems: SidebarItem[] = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
];

interface SidebarProps {
  items?: SidebarItem[];
  loading?: boolean;
  open?: boolean;
  onClose?: () => void;
}

function SidebarContent({
  items,
  loading,
  onClose,
}: {
  items: SidebarItem[];
  loading: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <Image
        src={Logo}
        alt="Logo"
        width={100}
        height={20}
        loading="eager"
        priority
        className="mx-auto cursor-pointer"
        onClick={() => {
          router.push("/dashboard");
          onClose?.();
        }}
        style={{ width: "auto", height: "auto" }}
      />
      <SidebarProvider className="border-t border-(--surface-border-color) p-3">
        <SidebarGroupContent>
          <SidebarMenu>
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                <SidebarMenuItem key={index}>
                  <div className="flex items-center gap-2 px-2 py-2">
                    <Skeleton className="size-5 shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </SidebarMenuItem>
              ))
              : items.map((item) => {
                const matches =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname === item.url ||
                    pathname.startsWith(item.url + "/");

                const isActive =
                  matches &&
                  !items.some(
                    (other) =>
                      other.url !== item.url &&
                      other.url.length > item.url.length &&
                      (pathname === other.url ||
                        pathname.startsWith(other.url + "/")),
                  );

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={isActive ? "bg-sidebar-accent" : ""}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center justify-between w-full"
                        onClick={onClose}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon size={18} />
                          <span>{item.title}</span>
                        </div>
                        {item.badge && item.badge > 0 ? (
                          <div className="bg-red-500 text-white text-[10px] font-bold rounded-full size-5 flex items-center justify-center shrink-0">
                            {item.badge}
                          </div>
                        ) : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarProvider>
    </>
  );
}

export default function Sidebar({
  items = defaultItems,
  loading = false,
  open = false,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-(--surface-border-color) bg-(--surface-container)">
        <SidebarContent items={items} loading={loading} />
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-(--surface-container) border-r border-(--surface-border-color) transition-transform duration-300 ease-in-out md:hidden ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <SidebarContent items={items} loading={loading} onClose={onClose} />
      </aside>
    </>
  );
}
