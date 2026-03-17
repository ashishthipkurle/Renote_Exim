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
      case "SHIPMENT_UPDATE": return "text-cyan-600 dark:text-cyan-400 bg-cyan-600/10 dark:bg-cyan-400/10";
      case "PAYMENT_RECEIVED": return "text-emerald-600 dark:text-emerald-400 bg-emerald-600/10 dark:bg-emerald-400/10";
      case "MESSAGE": return "text-pink-600 dark:text-pink-400 bg-pink-600/10 dark:bg-pink-400/10";
      default: return "text-slate-500 dark:text-slate-400 bg-slate-500/10 dark:bg-slate-400/10";
    }
  };

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-slate-50 dark:bg-[#0a0c12] transition-colors duration-300">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-transparent transition-colors duration-300">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              Notification Center
              {data?.unreadCount && data.unreadCount > 0 ? (
                <span className="px-2.5 py-1 rounded-full bg-primary text-white text-[10px] font-black animate-pulse shadow-md dark:shadow-none">
                  {data.unreadCount} NEW
                </span>
              ) : null}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time situational awareness for your entire import pipeline.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${showUnreadOnly
                  ? "bg-primary/10 dark:bg-primary/20 border-primary text-primary shadow-sm dark:shadow-lg dark:shadow-primary/10"
                  : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              Unread Focused
            </button>
            <button
              onClick={handleMarkAllRead}
              className="px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Catch Up All
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Filters */}
        <aside className="w-72 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-transparent p-6 space-y-2 overflow-y-auto hidden lg:block transition-colors duration-300">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-4">Traffic Type</div>
          {NOTIF_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveType(t.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${activeType === t.id
                    ? "bg-primary text-white shadow-xl shadow-primary/20"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">{t.label}</span>
                </div>
                <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${activeType === t.id ? "opacity-100" : ""}`} />
              </button>
            );
          })}
        </aside>

        {/* Main Feed */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-4">
          <div className="max-w-[1000px] mx-auto space-y-4">
            {loading && !data ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 bg-white dark:bg-white/5 rounded-3xl animate-pulse border border-slate-200 dark:border-white/5" />
              ))
            ) : !data?.notifications?.length ? (
              <div className="py-32 text-center opacity-40 select-none">
                <Bell className="w-20 h-20 mx-auto mb-6 text-slate-400 dark:text-slate-500" />
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Signal is Clear</h2>
                <p className="text-slate-500 text-sm mt-2">No incoming notifications for this filter set.</p>
              </div>
            ) : (
              data.notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={`group relative bg-white dark:bg-[#151c2a]/60 backdrop-blur-xl border transition-all rounded-[2rem] p-6 lg:p-8 flex items-start gap-6 cursor-pointer shadow-sm dark:shadow-none ${n.read
                      ? "border-slate-200 dark:border-white/5 opacity-80 hover:opacity-100 dark:opacity-60 dark:hover:opacity-80"
                      : "border-primary/30 dark:border-primary/20 shadow-lg shadow-primary/5 hover:border-primary/50 dark:hover:border-primary/40"
                    }`}
                >
                  <div className={`flex-shrink-0 size-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${getTypeColor(n.type)}`}>
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-lg font-black tracking-tight truncate ${n.read ? "text-slate-500 dark:text-slate-300" : "text-slate-900 dark:text-white"}`}>
                          {n.title}
                        </h3>
                        {!n.read && (
                          <div className="size-2 rounded-full bg-primary shadow-[0_0_10px_rgba(37,99,235,0.4)] dark:shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                        )}
                      </div>
                      <time className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        {timeAgo(n.createdAt)}
                      </time>
                    </div>
                    <p className={`text-sm leading-relaxed ${n.read ? "text-slate-400 dark:text-slate-500" : "text-slate-600 dark:text-slate-400"}`}>
                      {n.message}
                    </p>
                  </div>

                  <div className="flex-shrink-0 self-center">
                    <button className="p-2 text-slate-400 hover:text-slate-700 dark:text-slate-700 dark:hover:text-white transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Pagination Placeholder */}
            {data && data.pagination.totalPages > 1 && (
              <div className="text-center py-6">
                <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline">
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
