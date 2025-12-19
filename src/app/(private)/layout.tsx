import Header from "@/components/layouts/header";
import Sidebar from "@/components/layouts/sidebar";
import { API_ENDPOINTS } from "@/lib/constants";
import { httpGet } from "@/lib/http.server";
import { User } from "@/types/user";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await httpGet<User>(API_ENDPOINTS.AUTH.ME);

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header user={user} />
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
