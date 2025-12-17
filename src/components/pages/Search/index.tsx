"use client";

import { useGet } from "@/hooks";

export default function SearchPage() {
  useGet("/api/breeds/list/all");
  return <div>Search Page</div>;
}
