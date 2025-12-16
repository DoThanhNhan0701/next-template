"use client";

import Loading from "@/components/common/Loading";
import Header from "@/components/layouts/header";
import React, { ReactNode } from "react";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted)
    return (
      <Loading className="fixed inset-0 z-50 flex items-center justify-center bg-(--bg-container)" />
    );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex flex-1 mx-2 mb-2 overflow-hidden rounded-xl border border-(--surface-border-color) bg-(--surface-container)">
          <aside className="w-64 shrink-0 border-r border-(--surface-border-color) bg-(--surface-container)">
            Side bar
          </aside>
          <section className="flex-1 p-2 overflow-auto">{children}</section>
        </main>
      </div>
    </div>
  );
}
