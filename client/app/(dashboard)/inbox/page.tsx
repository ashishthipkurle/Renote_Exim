"use client";

import { useState } from "react";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import { MessageSquare, ShieldCheck, Zap } from "lucide-react";

export default function InboxPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100dvh-5rem)] bg-background overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className={`${selectedUserId ? "hidden lg:block" : "w-full lg:w-96"} h-full flex-shrink-0`}>
        <ConversationList 
          selectedUserId={selectedUserId} 
          onSelect={setSelectedUserId} 
        />
      </div>

      {/* Main Chat Area */}
      <div className={`${!selectedUserId ? "hidden lg:flex" : "flex"} flex-1 h-full flex-col relative`}>
        {selectedUserId ? (
          <ChatWindow 
            otherUserId={selectedUserId} 
            onBack={() => setSelectedUserId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-card/30 relative">
             <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
             
             <div className="max-w-md text-center space-y-8 relative">
               <div className="mx-auto w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary/60 p-0.5 shadow-2xl shadow-primary/20 animate-pulse">
                  <div className="w-full h-full rounded-[2.4rem] bg-background flex items-center justify-center">
                    <MessageSquare className="h-10 w-10 text-primary" />
                  </div>
               </div>
               
               <div className="space-y-3">
                 <h2 className="text-3xl font-black tracking-tight">Trade Communication Center</h2>
                 <p className="text-muted-foreground text-sm leading-relaxed">
                   Welcome to the encrypted messaging terminal. Select a conversation from the sidebar to coordinate operations, negotiate contracts, and manage your global trade.
                 </p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm flex flex-col items-center gap-2 text-center">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Secure</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm flex flex-col items-center gap-2 text-center">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Real-time Delivery</span>
                  </div>
               </div>

               <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                 Awaiting Incoming Data Stream...
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
