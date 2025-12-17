"use client";

import { fetcher } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";

export default function SearchPage() {
  const getDogs = useQuery({
    queryKey: ["dogs"],
    queryFn: () => fetcher("https://dog.ceo/api/breeds/list/all"),
  });

  console.log("getDogs Search:", getDogs.data);

  return <div>Search Page</div>;
}
