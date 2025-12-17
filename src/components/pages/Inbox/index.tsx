"use client";

import { useGet } from "@/hooks";

export default function InboxPage() {
  useGet("/api/breeds/list/all");

  return <div>Inbox Page</div>;
}
