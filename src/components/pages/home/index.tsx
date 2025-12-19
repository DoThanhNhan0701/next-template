"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { logoutAction } from "../auth/Login/logout.action";
import { useGet } from "@/hooks/useApi";
import { endpoints } from "@/config/endpoints";

export default function HomePage() {
  const handleLogout = async () => {
    await logoutAction();
    toast.success("Logged out successfully");
  };

  const { data, isLoading, error } = useGet(
    ["locations"],
    `${endpoints.LOCATIONS}`
  );
  console.log(data, "data locations");

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
