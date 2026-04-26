"use client";

import { GlobalCallProvider } from "@/components/session/GlobalCallProvider";

/**
 * DashboardCallWrapper — thin client component that wraps dashboard layouts
 * with the GlobalCallProvider so incoming calls work on every page.
 */
export default function DashboardCallWrapper({ children }: { children: React.ReactNode }) {
    return (
        <GlobalCallProvider>
            {children}
        </GlobalCallProvider>
    );
}
