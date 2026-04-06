"use client";

import { MessageSquare, ShieldCheck, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import ChatWindow from "@/components/messaging/ChatWindow";
import ConversationList from "@/components/messaging/ConversationList";

type MessagesWorkspaceProps = {
  initialUserId?: string | null;
  fullHeight?: boolean;
};

export default function MessagesWorkspace({
  initialUserId = null,
  fullHeight = true,
}: MessagesWorkspaceProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialUserId);

  useEffect(() => {
    if (initialUserId) {
      setSelectedUserId(initialUserId);
    }
  }, [initialUserId]);

  return (
    <div className={`flex overflow-hidden bg-background ${fullHeight ? "h-[calc(100dvh-6rem)]" : "h-[720px] rounded-3xl border border-border"}`}>
      <div className={`${selectedUserId ? "hidden lg:block" : "w-full lg:w-96"} h-full flex-shrink-0`}>
        <ConversationList selectedUserId={selectedUserId} onSelect={setSelectedUserId} />
      </div>

      <div className={`${!selectedUserId ? "hidden lg:flex" : "flex"} relative h-full flex-1 flex-col`}>
        {selectedUserId ? (
          <ChatWindow otherUserId={selectedUserId} onBack={() => setSelectedUserId(null)} />
        ) : (
          <div className="relative flex flex-1 flex-col items-center justify-center bg-card/30 p-8">
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
            <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />

            <div className="relative max-w-md space-y-8 text-center">
              <div className="mx-auto h-24 w-24 animate-pulse rounded-[2.5rem] bg-gradient-to-br from-primary to-primary/60 p-0.5 shadow-2xl shadow-primary/20">
                <div className="flex h-full w-full items-center justify-center rounded-[2.4rem] bg-background">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tight">Trade Communication Center</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Select a conversation to coordinate trade operations, contract clarifications, and live call handoffs.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/50 p-4 text-center backdrop-blur-sm">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Secure Messaging</span>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/50 p-4 text-center backdrop-blur-sm">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Realtime Delivery</span>
                </div>
              </div>

              <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Channel Ready
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
