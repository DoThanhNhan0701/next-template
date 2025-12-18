import Header from "@/components/layouts/header";
import Sidebar from "@/components/layouts/sidebar";
import { getMeServer } from "@/services/auth/auth.server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["me"],
    queryFn: getMeServer,
    retry: 1,
  });

  const user = queryClient.getQueryData(["me"]);

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
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
    </HydrationBoundary>
  );
}
