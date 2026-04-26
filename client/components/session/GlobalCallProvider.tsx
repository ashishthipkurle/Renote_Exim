"use client";

import React, { createContext, useContext, useState } from "react";
import { useRealtimeCall, RealtimeCallController } from "@/hooks/useRealtimeCall";
import { LiveSessionOverlay } from "@/components/session/LiveSessionOverlay";
import { ChatMessage } from "@/components/session/LiveChatPanel";
import { useAuth } from "@/components/auth/AuthProvider";

const CallContext = createContext<RealtimeCallController | null>(null);

/**
 * useCallController — access the global call controller from any component.
 * Must be inside <GlobalCallProvider>.
 */
export function useCallController(): RealtimeCallController {
    const ctx = useContext(CallContext);
    if (!ctx) {
        throw new Error("useCallController must be used within a <GlobalCallProvider>");
    }
    return ctx;
}

/**
 * GlobalCallProvider
 *
 * Mounts the useRealtimeCall hook ONCE at the dashboard layout level
 * and provides the controller via React Context. Renders the
 * LiveSessionOverlay globally so incoming calls are visible on ANY page.
 */
export function GlobalCallProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const callController = useRealtimeCall();
    const [messages] = useState<ChatMessage[]>([]);

    return (
        <CallContext.Provider value={callController}>
            {children}
            {/* The overlay is always mounted — it internally checks phase !== "idle" */}
            <LiveSessionOverlay
                callController={callController}
                messages={messages}
                currentUserId={user?.id || ""}
            />
        </CallContext.Provider>
    );
}
