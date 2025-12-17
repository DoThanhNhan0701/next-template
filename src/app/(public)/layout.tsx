import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="h-screen bg-(--surface-container)">{children}</div>;
}
