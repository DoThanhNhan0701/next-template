"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logoutAction } from "./logout.action";

export default function HomePage() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/auth/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="border border-(--surface-border-color) p-4 rounded-xl flex flex-col gap-4">
        {/* <p className="text-primary">User: {data?.username}</p> */}
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
        <Button variant="destructive">Loading</Button>
        <Button variant="destructive">Click me</Button>
        <Input />
      </div>
    </div>
  );
}
