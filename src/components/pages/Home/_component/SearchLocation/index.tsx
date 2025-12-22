"use client";

import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchLocation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const keyword = searchParams.get("name") ?? "";

  const onSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("name", value);
    } else {
      params.delete("name");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div>
      <Input
        placeholder="Search location..."
        defaultValue={keyword}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
