"use client";

import { fetcher } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";

export default function InboxPage() {
  const getDogs = useQuery({
    queryKey: ["dogs"],
    queryFn: () => fetcher("https://dog.ceo/api/breeds/list/all"),
  });

  console.log("getDogs Home:", getDogs.data);

  return <div>Inbox Page</div>;
}
