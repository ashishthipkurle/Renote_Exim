"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch, timeAgo } from "@/lib/api-utils";
import {
  CheckCheck,
  Bell,
  Package,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  Globe,
  Search,
  ArrowRight,
  Layers,
  Zap,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

interface NotifResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function typeIcon(type: string) {
  switch (type) {
    case "ORDER_PLACED":
    case "ORDER_CONFIRMED":
    case "ORDER_SHIPPED":
    case "ORDER_DELIVERED":
      return Package;
    case "PAYMENT_RECEIVED":
      return DollarSign;
    case "MESSAGE_RECEIVED":
      return MessageSquare;
    case "DOCUMENT_VERIFIED":
    case "ACCOUNT_VERIFIED":
      return ShieldCheck;
    default:
      return Bell;
  }
}

type FilterStatus = "all" | "unread";
type FilterGroup = "ALL" | "ORDERS" | "MESSAGES" | "SYSTEM";

export default function ExporterNotificationsPage() {
  const [data, setData] = useState<NotifResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [groupFilter, setGroupFilter] = useState<FilterGroup>("ALL");

  const fetchNotifs = useCallback(() => {
    setLoading(true);
    const url = statusFilter === "unread"
      ? "/api/notifications?unread=true&limit=50"
      : "/api/notifications?limit=50";

    authFetch<NotifResponse>(url)
      .then(setData)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const markAllRead = async () => {
    await authFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({ markAll: true }) });
    fetchNotifs();
  };

  const markOneRead = async (id: string, currentReadStatus: boolean) => {
    if (currentReadStatus) return;

    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
        notifications: prev.notifications.map(n =>
          n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
        )
      };
    });

    try {
      await authFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({ ids: [id] }) });
    } catch {
      fetchNotifs();
    }
  };

  const filteredNotifications = data?.notifications.filter(n => {
    if (groupFilter === "ALL") return true;
    if (groupFilter === "ORDERS") return n.type.startsWith("ORDER_") || n.type === "PAYMENT_RECEIVED";
    if (groupFilter === "MESSAGES") return n.type === "MESSAGE_RECEIVED";
    if (groupFilter === "SYSTEM") return !n.type.startsWith("ORDER_") && n.type !== "MESSAGE_RECEIVED" && n.type !== "PAYMENT_RECEIVED";
    return true;
  });

  if (loading && !data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-card dark:bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-6 opacity-40">
        <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 animate-pulse">
          <Bell className="w-12 h-12 text-foreground dark:text-white animate-spin-slow" />
        </div>
        <p className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.4em] italic">Indexing Comms Hub...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-hidden flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* ── Header ── */}
      <header className="flex-shrink-0 px-10 py-10 border-b border-border dark:border-white/5 bg-background/40 backdrop-blur-3xl z-40">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="relative">
              <h1 className="text-5xl font-black tracking-tighter text-foreground dark:text-white uppercase italic">Signal Center</h1>
              {data && data.unreadCount > 0 && (
                <div className="absolute -top-4 -right-12 px-4 py-1 rounded-full bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest shadow-xl dark:shadow-2xl animate-pulse">
                  {data.unreadCount} NEW_SIGS
                </div>
              )}
            </div>
            <div className="h-10 w-px bg-black/5 dark:bg-white/10 mx-4 hidden xl:block" />
            <p className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.3em] italic max-w-xs hidden xl:block">
              Registry Node Comms: Operational Telemetry // {data?.notifications.length || 0} Packets Processed
            </p>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={markAllRead}
              disabled={!data || data.unreadCount === 0}
              className="inline-flex items-center gap-3 bg-black/5 dark:bg-white/10 hover:bg-primary hover:text-primary-foreground disabled:opacity-20 text-foreground dark:text-white font-black text-[10px] uppercase tracking-[0.2em] italic py-4 px-10 rounded-2xl border border-border dark:border-white/10 transition-all active:scale-95 group shadow-xl dark:shadow-2xl backdrop-blur-3xl"
            >
              <CheckCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Flush Registry Read
            </button>
          </div>
        </div>

        {/* ── Local Filter Navigation ── */}
        <div className="flex flex-col lg:flex-row gap-6 mt-10">
          <div className="flex bg-black/5 dark:bg-white/10 p-1.5 rounded-2xl border border-border dark:border-white/10 backdrop-blur-3xl">
            {(["all", "unread"] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all italic ${statusFilter === s ? "bg-primary text-primary-foreground shadow-xl dark:shadow-2xl scale-105" : "text-muted-foreground/40 hover:text-foreground dark:text-white"}`}
              >
                {s === "all" ? "Full Cache" : "Pending Intel"}
              </button>
            ))}
          </div>

          <div className="h-auto w-px bg-black/5 dark:bg-white/10 mx-2 hidden lg:block" />

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide lg:pb-0">
            {(["ALL", "ORDERS", "MESSAGES", "SYSTEM"] as FilterGroup[]).map((f) => (
              <button
                key={f}
                onClick={() => setGroupFilter(f)}
                className={`flex-shrink-0 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all italic border ${groupFilter === f ? "bg-black/10 dark:bg-white/15 text-foreground dark:text-white border-border dark:border-white/20 shadow-xl dark:shadow-2xl" : "bg-black/20 text-muted-foreground/20 border-border dark:border-white/5 hover:bg-black/5 dark:bg-white/10 hover:text-foreground dark:text-white"}`}
              >
                {f} Telemetry
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-16 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
        <div className="max-w-[1200px] mx-auto space-y-4">
          {loading && !data ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-card/40 dark:bg-white/5 rounded-[2rem] animate-pulse border border-border dark:border-white/5 shadow-2xl shadow-white/2" />
            ))
          ) : !filteredNotifications?.length ? (
            <div className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 shadow-xl dark:shadow-2xl rounded-[3rem] p-24 text-center mt-10">
              <div className="flex flex-col items-center gap-8 opacity-40">
                <div className="p-10 rounded-[2.5rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10">
                  <ShieldCheck className="w-16 h-16 text-foreground dark:text-white" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">Null_Signal_Feed</h2>
                  <p className="text-[10px] text-foreground dark:text-white font-black uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed italic">
                    Registry inbox is clean. Operational telemetry is synchronized and no anomalous signals detected.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((n) => {
                const Icon = typeIcon(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => markOneRead(n.id, n.read)}
                    className={`group relative bg-card/40 dark:bg-white/5 backdrop-blur-3xl border rounded-[2.5rem] p-8 flex gap-8 items-center transition-all duration-700 cursor-pointer overflow-hidden shadow-xl dark:shadow-2xl ${n.read
                      ? "border-border dark:border-white/5 opacity-40 hover:opacity-80 hover:border-border dark:border-white/10"
                      : "border-border dark:border-white/20 hover:border-white/40 ring-1 ring-white/10"
                      }`}
                  >
                    {!n.read && (
                      <div className="absolute top-0 left-0 w-2 h-full bg-primary group-hover:w-3 transition-all duration-700" />
                    )}

                    <div className={`size-16 flex-shrink-0 rounded-[1.5rem] border flex items-center justify-center transition-all duration-700 ${!n.read
                      ? "bg-primary text-primary-foreground border-transparent shadow-xl dark:shadow-2xl scale-105"
                      : "bg-black/5 dark:bg-white/10 border-border dark:border-white/5 text-muted-foreground/20 group-hover:bg-black/10 dark:bg-white/15 group-hover:text-foreground dark:text-white"}`}>
                      <Icon className={`w-7 h-7 ${!n.read ? "animate-pulse" : ""}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-6 mb-2">
                        <div className="text-xl font-black text-foreground dark:text-white truncate italic tracking-tighter uppercase group-hover:translate-x-1 transition-transform">
                          {n.title} // REG_ID_{n.id.slice(0, 4)}
                        </div>
                        <div className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] italic whitespace-nowrap group-hover:text-muted-foreground/60 transition-colors">
                          TELEMETRY_LAG: {timeAgo(n.createdAt)}
                        </div>
                      </div>
                      <p className={`text-xs font-black uppercase tracking-tight italic leading-relaxed line-clamp-2 ${n.read ? "text-muted-foreground/20" : "text-muted-foreground/60 group-hover:text-muted-foreground/80"}`}>
                        {n.message}
                      </p>
                    </div>

                    <div className="size-12 rounded-[1rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-x-4 group-hover:translate-x-0">
                      <ArrowRight className="w-5 h-5 text-foreground dark:text-white" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Signal Protocol Reminder */}
        <div className="max-w-[1200px] mx-auto bg-card/60 dark:bg-white/[0.07] border border-border dark:border-white/10 rounded-[3rem] p-12 flex flex-col xl:flex-row items-center gap-10 shadow-xl dark:shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-6 transition-transform duration-1000">
            <Zap className="w-40 h-40 text-foreground dark:text-white" />
          </div>
          <div className="size-20 rounded-[2rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center shrink-0 relative z-10 transition-all duration-1000 group-hover:scale-110">
            <Info className="w-10 h-10 text-foreground dark:text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-foreground dark:text-white font-black text-2xl uppercase italic tracking-tighter mb-4">Registry Protocol Override</h3>
            <p className="text-muted-foreground/40 text-xs font-medium leading-relaxed max-w-3xl italic uppercase tracking-tight group-hover:text-muted-foreground/80 transition-colors">
              Alert telemetry is prioritized via AI routing nodes. Ensure high-priority order and settlement signals are processed within 24 hours to maintain registry integrity score. Historical packets are cached for 90 days.
            </p>
          </div>
          <button className="xl:ml-auto border border-border dark:border-white/10 text-foreground dark:text-white hover:bg-primary hover:text-primary-foreground h-16 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] italic transition-all active:scale-95 shadow-xl dark:shadow-2xl relative z-10">
            Archive_Feed
          </button>
        </div>
      </div>
    </div>
  );
}
