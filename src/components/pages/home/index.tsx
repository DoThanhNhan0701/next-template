"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetcher } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function HomePage() {
  const getDogs = useQuery({
    queryKey: ["dogs"],
    queryFn: () => fetcher("https://dog.ceo/api/breeds/list/all"),
  });

  console.log("getDogs Home:", getDogs.data);

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
