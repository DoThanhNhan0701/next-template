"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogout } from "@/hooks/useAuth";

export default function HomePage() {
  const logout = useLogout();

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="border border-(--surface-border-color) p-4 rounded-xl flex flex-col gap-4">
        {/* <p className="text-primary">User: {data?.username}</p> */}
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
        <Button variant="destructive">Loading</Button>
        <Button variant="destructive">Click me</Button>
        <Input />
      </div>
    </div>
  );
}
