"use client";

import Header from "@/components/layouts/header";
import Sidebar from "@/components/layouts/sidebar";
import Settings from "@/components/pages/layout-modals/Settings";
import { AppDispatch, RootState } from "@/redux";
import { actionFetchUser } from "@/redux/slices/auth";
import { ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const promise = dispatch(actionFetchUser());
    return () => {
      promise.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Settings />
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
    </>
  );
}
