"use client";

import React from "react";
import { useTheme } from "next-themes";
import {
  HomeIcon,
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
import { IUser } from "@/types/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux";
import { actionLogout } from "@/redux/slices/auth";

interface MenuToolbar {
  name: string;
  icon: LucideIcon | null;
  onClick: () => void;
}

interface Props {
  user?: IUser | null;
}

export default function Header({ user }: Props) {
  const router = useRouter();
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

  return (
    <header className="flex items-center px-4 min-h-10">
      <div className="h-full flex-1">
        <section className="flex items-center gap-1 h-full cursor-pointer">
          <HomeIcon size={13} />
          <p className="text-sm leading-none">Home</p>
        </section>
      </div>
      <div className="ml-auto flex items-center shrink-0 gap-1">
        <p className="text-sm leading-none">{user?.username}</p>
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

        <User className="rounded-full cursor-pointer" size={20} />
      </div>
    </header>
  );
}
