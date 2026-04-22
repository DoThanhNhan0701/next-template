"use client";

import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "@/redux";
import { actionFetchUser } from "@/redux/slices/auth";

import { REFRESH_TOKEN } from "@/config/constants";
import { getClientCookie } from "@/utils/cookiesStore";

export default function AppBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Only attempt to fetch if we have a refresh token (prevents infinite loop after logout)
    const hasRefreshToken = !!getClientCookie(REFRESH_TOKEN);

    if (!user && !loading && hasRefreshToken) {
      dispatch(actionFetchUser());
    }
  }, [user, loading, dispatch]);

  return <>{children}</>;
}
