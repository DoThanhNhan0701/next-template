import Header from "@/components/layouts/header";
import { ReactNode } from "react";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-full flex flex-1 flex-col justify-center items-center overflow-hidden">
      <div className="h-screen w-full flex flex-col flex-1 overflow-hidden">
        <div className="pb-2 flex flex-col w-screen h-full">
          <Header />
          <main className="mx-2 h-full border border-(--surface-border-color) rounded-xl bg-(--surface-container)">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
