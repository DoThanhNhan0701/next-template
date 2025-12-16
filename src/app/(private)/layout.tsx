import Header from "@/components/layouts/header";
import Sidebar from "@/components/layouts/sidebar";
import { ReactNode } from "react";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex flex-1 mx-2 mb-2 overflow-hidden rounded-xl border border-(--surface-border-color) bg-(--surface-container)">
          <Sidebar />
          <section className="relative flex-1 p-2 overflow-auto">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}
