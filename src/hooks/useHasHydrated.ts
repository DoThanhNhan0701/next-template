"use client";

import { useEffect, useState } from "react";

/**
 * Hook to track whether the component has hydrated on the client.
 * Useful for avoiding hydration mismatches when rendering content that
 * depends on client-side only state (like localStorage or persisted Redux state).
 */
export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
}
