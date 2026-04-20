"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux";
import Loading from "@/components/common/Loading";

export default function AuthLoadingOverlay() {
    const [mounted, setMounted] = useState(false);
    const { loading: authLoading } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    // Don't render anything on server — avoids hydration mismatch entirely
    if (!mounted || !authLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--bg-container)">
            <Loading />
        </div>
    );
}
