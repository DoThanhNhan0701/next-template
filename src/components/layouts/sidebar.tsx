"use client";

import Link from "next/link";
import { Home, type LucideIcon } from "lucide-react";

import {
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@public/icons/logo.png";
import Image from "next/image";

export interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIcon | React.ElementType;
  badge?: number;
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
}

export default function Sidebar({ items = defaultItems }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-64 shrink-0 border-r border-(--surface-border-color) bg-(--surface-container)">
      <Image
        src={Logo}
        alt="Logo"
        width={100}
        height={20}
        loading="eager"
        priority
        className="mx-auto cursor-pointer"
        onClick={() => router.push("/")}
        style={{ width: "auto", height: "auto" }}
      />
      <SidebarProvider className="border-t border-(--surface-border-color) p-3">
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const matches =
                item.url === "/"
                  ? pathname === "/"
                  : pathname === item.url || pathname.startsWith(item.url + "/");

              // Only active if no other item has a longer (more specific) matching URL
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
                    <Link href={item.url} className="flex items-center justify-between w-full">
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
    </aside>
  );
}
