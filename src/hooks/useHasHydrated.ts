"use client";

import { useSyncExternalStore } from "react";

export function useHasHydrated() {
  return useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );
}
