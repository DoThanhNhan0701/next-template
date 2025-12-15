"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      className="border border-primary cursor-pointer rounded-2xl p-1"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition-all" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-all" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
