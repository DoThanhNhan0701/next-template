"use client";

import { useEffect } from "react";

import { useDispatch } from "react-redux";

import { AppDispatch } from "@/redux";
import { actionFetchUser } from "@/redux/slices/auth";

// Module-level flag: persists across React Strict Mode remounts
let initialized = false;

export default function AppBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!initialized) {
      initialized = true;
      dispatch(actionFetchUser());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
