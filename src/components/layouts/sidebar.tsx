"use client";

import Link from "next/link";
import { Home } from "lucide-react";

import {
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Logo from "@public/icons/logo.png";
import Image from "next/image";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
];
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-(--surface-border-color) bg-(--surface-container)">
      <Image
        src={Logo}
        alt="Logo"
        width={100}
        height={20}
        loading="eager"
        className="mx-auto "
      />
      <SidebarProvider className="border-t border-(--surface-border-color) p-3">
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const isActive = pathname === item.url;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={isActive ? "bg-sidebar-accent" : ""}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
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
