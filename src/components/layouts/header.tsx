"use client";

import {
  Bell,
  HelpCircle,
  HomeIcon,
  LucideIcon,
  MoonIcon,
  RefreshCwIcon,
  SettingsIcon,
  SunIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { useTheme } from "next-themes";
import React from "react";

interface MenuToolbar {
  name: string;
  icon?: LucideIcon | null;
  onClick: () => void;
}

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const menuToolbar: MenuToolbar[] = [
    {
      name: mounted ? (theme === "dark" ? "Theme light" : "Theme dark") : "",
      icon: mounted ? (theme === "dark" ? SunIcon : MoonIcon) : null,
      onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
    {
      name: "Refresh",
      icon: RefreshCwIcon,
      onClick: () => {},
    },
    {
      name: "Settings",
      icon: SettingsIcon,
      onClick: () => {},
    },
    {
      name: "Help",
      icon: HelpCircle,
      onClick: () => {},
    },
    {
      name: "Notifications",
      icon: Bell,
      onClick: () => {},
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

        <Image
          className="rounded-full"
          src="https://lh3.googleusercontent.com/a/ACg8ocKIu3er68fp_p--Z3quhYGsQFZNOf-t_STeFuHdRsyRy_0FO1w=s96-c"
          width={24}
          height={24}
          alt=""
        />
      </div>
    </header>
  );
}
