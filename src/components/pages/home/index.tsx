"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useGet } from "@/hooks";

export default function HomePage() {
  useGet("/api/breeds/list/all");

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="border border-(--surface-border-color) p-4 rounded-xl flex flex-col gap-4">
        <p className="text-primary">Do Thanh Nhan</p>
        <Button
          variant="outline"
          onClick={() => toast.success("Call api successfully")}
        >
          Success
        </Button>
        <Button variant="destructive">Loading</Button>
        <Button variant="destructive">Click me</Button>
        <Input />
      </div>
    </div>
  );
}
