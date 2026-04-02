"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch, timeAgo } from "@/lib/api-utils";
import {
  Bell,
  Package,
  Truck,
  CreditCard,
  MessageSquare,
  Info,
  CheckCircle2,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

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

const NOTIF_TYPES = [
  { id: "all", label: "All Activity", icon: Bell },
  { id: "ORDER_UPDATE", label: "Orders", icon: Package },
  { id: "SHIPMENT_UPDATE", label: "Logistics", icon: Truck },
  { id: "PAYMENT_RECEIVED", label: "Financial", icon: CreditCard },
  { id: "MESSAGE", label: "Communications", icon: MessageSquare },
  { id: "SYSTEM", label: "System", icon: Info },
];

export default function ImporterNotificationsPage() {
  const [data, setData] = useState<NotifResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/notifications?limit=50&type=${activeType}`;
      if (showUnreadOnly) url += "&unread=true";

      const res = await authFetch<NotifResponse>(url);
      setData(res);
    } catch {
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [activeType, showUnreadOnly]);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const handleMarkRead = async (id: string) => {
    try {
      await authFetch("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ ids: [id] }),
      });
      // Optimistic update
      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          unreadCount: Math.max(0, prev.unreadCount - 1),
          notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        };
      });
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await authFetch("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ markAll: true }),
      });
      toast.success("All caught up!");
      fetchNotifs();
    } catch {
      toast.error("Action failed");
    }
  };

  const getIcon = (type: string) => {
    const found = NOTIF_TYPES.find(t => t.id === type);
    const Icon = found?.icon || Info;
    return <Icon className="w-5 h-5" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ORDER_UPDATE": return "text-primary bg-primary/10";
      case "SHIPMENT_UPDATE": return "text-neutral-300 bg-neutral-300/10";
      case "PAYMENT_RECEIVED": return "text-muted-foreground bg-neutral-400/10";
      case "MESSAGE": return "text-muted-foreground bg-neutral-500/10";
      default: return "text-muted-foreground bg-muted/20";
    }
  };

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-background transition-colors duration-300">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-border bg-header backdrop-blur-xl z-20">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3 uppercase italic">
              Notification Center
              {data?.unreadCount && data.unreadCount > 0 ? (
                <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground border-transparent text-[10px] font-black animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                  {data.unreadCount} NEW
                </span>
              ) : null}
            </h1>
            <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest mt-1.5 opacity-60">Real-time situational awareness for your entire import pipeline.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${showUnreadOnly
                  ? "bg-primary text-primary-foreground border-transparent border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted/20"
                }`}
            >
              Unread Focused
            </button>
            <button
              onClick={handleMarkAllRead}
              className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-muted/40 hover:bg-muted/60 text-foreground border border-border transition-all flex items-center gap-3 shadow-xl active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Catch Up All
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Filters */}
        <aside className="w-72 border-r border-border bg-header backdrop-blur-xl p-6 space-y-3 overflow-y-auto hidden lg:block transition-all">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4 mb-4 opacity-40">Traffic Type</div>
          {NOTIF_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveType(t.id)}
                className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all group scale-95 hover:scale-100 ${activeType === t.id
                    ? "bg-primary text-primary-foreground border-transparent shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-100 z-10"
                    : "text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-4 h-4 ${activeType === t.id ? "animate-pulse" : "opacity-30 group-hover:opacity-100 transition-opacity"}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-all ${activeType === t.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`} />
              </button>
            );
          })}
        </aside>

        {/* Main Feed */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-4">
          <div className="max-w-[1000px] mx-auto space-y-4">
            {loading && !data ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 bg-muted/20 rounded-[2rem] animate-pulse border border-border/50" />
              ))
            ) : !data?.notifications?.length ? (
              <div className="py-32 text-center opacity-40 select-none">
                <Bell className="w-20 h-20 mx-auto mb-8 text-muted-foreground/20" />
                <h2 className="text-xl font-black text-foreground uppercase tracking-widest italic">Signal is Clear</h2>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest leading-none mt-2">No incoming notifications for this filter set.</p>
              </div>
            ) : (
              data.notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={`group relative bg-muted/40 backdrop-blur-xl border transition-all rounded-[2rem] p-7 lg:p-10 flex items-start gap-8 cursor-pointer shadow-2xl ${n.read
                      ? "border-border opacity-40 hover:opacity-80"
                      : "border-border shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:border-white/30"
                    }`}
                >
                  <div className={`flex-shrink-0 size-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${getTypeColor(n.type)}`}>
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <h3 className={`text-xl font-black tracking-tight uppercase italic truncate ${n.read ? "text-muted-foreground" : "text-foreground"}`}>
                          {n.title}
                        </h3>
                        {!n.read && (
                          <div className="size-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] animate-pulse" />
                        )}
                      </div>
                      <time className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap opacity-40">
                        {timeAgo(n.createdAt)}
                      </time>
                    </div>
                    <p className={`text-[11px] font-black uppercase tracking-widest leading-relaxed line-clamp-2 ${n.read ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                      &ldquo;{n.message}&rdquo;
                    </p>
                  </div>

                  <div className="flex-shrink-0 self-center">
                    <button className="p-3 text-muted-foreground/30 hover:text-foreground transition-all hover:scale-110 active:scale-90">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Pagination Placeholder */}
            {data && data.pagination.totalPages > 1 && (
              <div className="text-center py-10">
                <button className="text-[10px] font-black text-foreground hover:text-muted-foreground uppercase tracking-[0.3em] transition-all border-b border-border pb-1">
                  Load Older Transmission Trace
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
