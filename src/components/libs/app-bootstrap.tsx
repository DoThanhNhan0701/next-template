"use client";

import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import { REFRESH_TOKEN } from "@/config/constants";
import { AppDispatch, RootState } from "@/redux";
import { actionFetchUser } from "@/redux/slices/auth";
import { getClientCookie } from "@/utils/cookiesStore";

export default function AppBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, isInitialized } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    // Only attempt to fetch if we have a refresh token (prevents infinite loop after logout)
    const hasRefreshToken = !!getClientCookie(REFRESH_TOKEN);

    if (!user && !loading && !isInitialized && hasRefreshToken) {
      dispatch(actionFetchUser());
    }
  }, [user, loading, isInitialized, dispatch]);

  return <>{children}</>;
}
