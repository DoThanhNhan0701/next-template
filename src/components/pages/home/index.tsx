"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogout, useMe } from "@/hooks/useAuth";

export default function HomePage() {
  const { data: user, isLoading, isError } = useMe();
  const logout = useLogout();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading user info</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="border border-(--surface-border-color) p-4 rounded-xl flex flex-col gap-4">
        <p className="text-primary">User: {user?.username}</p>
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
