"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useDebouncedSearch(delay = 500, paramKey = "search") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams?.get(paramKey) || "";
  const [searchVal, setSearchVal] = useState(currentSearch);

  // Sync local input value with URL search parameter changes
  useEffect(() => {
    setSearchVal(currentSearch);
  }, [currentSearch]);

  // Debounce URL updates
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const activeSearch = searchParams?.get(paramKey) || "";
      if (searchVal === activeSearch) return;

      const params = new URLSearchParams(searchParams?.toString() || "");
      if (searchVal) {
        params.set(paramKey, searchVal);
      } else {
        params.delete(paramKey);
      }
      router.replace(`${pathname}?${params.toString()}`);
    }, delay);

    return () => clearTimeout(delayDebounceFn);
  }, [searchVal, pathname, router, searchParams, delay, paramKey]);

  return {
    search: currentSearch,
    searchVal,
    setSearchVal,
  };
}
