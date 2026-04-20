"use client";

import React from "react";

import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { LogOut, LucideIcon, MoonIcon, SunIcon, User } from "lucide-react";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/hooks/usePermissions";
import { AppDispatch } from "@/redux";
import { actionLogout } from "@/redux/slices/auth";
import { IUser } from "@/types/auth";

import LanguageSwitcher from "../common/LanguageSwitcher";
import { type SidebarItem, defaultItems } from "./sidebar";

interface MenuToolbar {
  name: string;
  icon: LucideIcon | null;
  onClick: () => void;
}

interface Props {
  user?: IUser | null;
  items?: SidebarItem[];
  loading?: boolean;
}

export default function Header({
  user,
  items = defaultItems,
  loading = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const menuToolbar: MenuToolbar[] = [
    {
      name: mounted ? (theme === "dark" ? "Light" : "Dark") : "",
      icon: mounted ? (theme === "dark" ? SunIcon : MoonIcon) : null,
      onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
    {
      name: "Logout",
      icon: LogOut,
      onClick: () => {
        dispatch(actionLogout());
        router.push("/auth/login");
      },
    },
  ];

  const activeItem =
    items && items.length > 0
      ? [...items]
          .filter((item) =>
            item.url === "/"
              ? pathname === "/"
              : pathname === item.url || pathname.startsWith(item.url + "/"),
          )
          .sort((a, b) => b.url.length - a.url.length)[0] || items[0]
      : undefined;

  const { hasPermission } = usePermissions();

  return (
    <header className="flex items-center px-4 min-h-10">
      <div className="h-full flex-1">
          {loading ? (
            <div className="flex items-center gap-1 h-full">
              <Skeleton className="size-4 shrink-0" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : (
            activeItem && (
              <section className="flex items-center gap-1 h-full cursor-pointer">
                {activeItem.icon && <activeItem.icon size={13} />}
                <p className="text-sm leading-none">{activeItem.title}</p>
                {activeItem.badge && activeItem.badge > 0 ? (
                  <div className="bg-red-500 text-white text-[9px] font-bold rounded-full size-4 flex items-center justify-center shrink-0 ml-1">
                    {activeItem.badge}
                  </div>
                ) : null}
              </section>
            )
          )}
      </div>
      <div className="ml-auto flex items-center shrink-0 gap-1">
        <p className="text-sm leading-none mr-2" suppressHydrationWarning>
          {user?.username}
        </p>
        <LanguageSwitcher />
        {menuToolbar.map((item) => (
          <Tooltip key={item.name}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                onClick={item.onClick}
                className="p-0! cursor-pointer size-6 bg-transparent text-primary dark:hover:bg-primary/10 hover:bg-primary/10"
              >
                {item.icon && <item.icon size={13} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <User
              className="rounded-full cursor-pointer hover:bg-accent p-1 box-content"
              size={20}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {hasPermission("admin:manage") && (
              <DropdownMenuItem asChild>
                <Link href="/admin" className="cursor-pointer">
                  Admin
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href="/change-password" className="cursor-pointer">
                Change password
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
