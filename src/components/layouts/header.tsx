"use client";

import React from "react";
import { useTheme } from "next-themes";
import {
  LucideIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { IUser } from "@/types/auth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux";
import { actionLogout } from "@/redux/slices/auth";
import { type SidebarItem, defaultItems } from "./sidebar";
import LanguageSwitcher from "../common/LanguageSwitcher";

interface MenuToolbar {
  name: string;
  icon: LucideIcon | null;
  onClick: () => void;
}

interface Props {
  user?: IUser | null;
  items?: SidebarItem[];
}

export default function Header({ user, items = defaultItems }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const onSettingsClick = (
    value: "REFRESH" | "SETTINGS" | "HELP" | "NOTIFICATIONS",
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "REFRESH") {
      router.refresh();
      return;
    }

    const nextTabMap = {
      HELP: "help",
      SETTINGS: "settings",
      NOTIFICATIONS: "notifications",
    } as const;

    const nextTab = nextTabMap[value];
    params.set("layout-tab", nextTab);
    router.push(`?${params.toString()}`);
  };

  const menuToolbar: MenuToolbar[] = [
    {
      name: mounted ? (theme === "dark" ? "Light" : "Dark") : "",
      icon: mounted ? (theme === "dark" ? SunIcon : MoonIcon) : null,
      onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
    {
      name: "Settings",
      icon: SettingsIcon,
      onClick: () => onSettingsClick("SETTINGS"),
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
    [...items]
      .filter((item) =>
        item.url === "/"
          ? pathname === "/"
          : pathname === item.url || pathname.startsWith(item.url + "/"),
      )
      .sort((a, b) => b.url.length - a.url.length)[0] || items[0];

  return (
    <header className="flex items-center px-4 min-h-10">
      <div className="h-full flex-1">
        <section className="flex items-center gap-1 h-full cursor-pointer">
          {activeItem.icon && <activeItem.icon size={13} />}
          <p className="text-sm leading-none">{activeItem.title}</p>
          {activeItem.badge && activeItem.badge > 0 ? (
            <div className="bg-red-500 text-white text-[9px] font-bold rounded-full size-4 flex items-center justify-center shrink-0 ml-1">
              {activeItem.badge}
            </div>
          ) : null}
        </section>
      </div>
      <div className="ml-auto flex items-center shrink-0 gap-1">
        <p className="text-sm leading-none mr-2">{user?.username}</p>
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
            <User className="rounded-full cursor-pointer hover:bg-accent p-1 box-content" size={20} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                Admin
              </Link>
            </DropdownMenuItem>
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
