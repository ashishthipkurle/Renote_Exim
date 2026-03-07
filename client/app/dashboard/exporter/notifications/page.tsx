"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch, timeAgo } from "@/lib/api-utils";
import { CheckCheck } from "lucide-react";

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
      return "📦";
    case "PAYMENT_RECEIVED":
      return "💰";
    case "MESSAGE_RECEIVED":
      return "💬";
    case "DOCUMENT_VERIFIED":
    case "ACCOUNT_VERIFIED":
      return "✅";
    default:
      return "🔔";
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
    // Fetch all for the status filter via API
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
    if (currentReadStatus) return; // Already read

    // Optimistic update
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
      // Revert if failed
      fetchNotifs();
    }
  };

  // Client-side filtering for groups
  const filteredNotifications = data?.notifications.filter(n => {
    if (groupFilter === "ALL") return true;
    if (groupFilter === "ORDERS") return n.type.startsWith("ORDER_") || n.type === "PAYMENT_RECEIVED";
    if (groupFilter === "MESSAGES") return n.type === "MESSAGE_RECEIVED";
    if (groupFilter === "SYSTEM") return !n.type.startsWith("ORDER_") && n.type !== "MESSAGE_RECEIVED" && n.type !== "PAYMENT_RECEIVED";
    return true;
  });

  return (
    <div className="h-full overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Notifications
              {data && data.unreadCount > 0 && (
                <span className="bg-primary/20 text-primary border border-primary/20 text-sm px-2.5 py-0.5 rounded-full font-bold">
                  {data.unreadCount} New
                </span>
              )}
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Stay updated on your orders, messages, and account alerts.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={markAllRead}
              disabled={!data || data.unreadCount === 0}
              className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-5 rounded-xl text-sm border border-white/5 transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              Mark All Read
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="flex bg-slate-800/60 rounded-xl overflow-hidden border border-white/5 p-1">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors ${statusFilter === "all" ? "bg-[#1a2236] text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("unread")}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors ${statusFilter === "unread" ? "bg-[#1a2236] text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              Unread Only
            </button>
          </div>

          <div className="flex-1 flex gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            {(["ALL", "ORDERS", "MESSAGES", "SYSTEM"] as FilterGroup[]).map((f) => (
              <button
                key={f}
                onClick={() => setGroupFilter(f)}
                className={`flex-shrink-0 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border ${groupFilter === f ? "bg-primary/10 text-primary border-primary/20" : "bg-transparent text-slate-500 border-white/5 hover:border-white/10 hover:text-slate-300"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[900px] mx-auto space-y-3 pb-10">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-[#151c2a]/60 rounded-2xl animate-pulse border border-white/5" />
            ))
          ) : !filteredNotifications?.length ? (
            <div className="text-center py-20 text-slate-500 bg-[#151c2a]/40 border border-white/5 rounded-3xl mt-10">
              <div className="text-5xl mb-4 opacity-50">📭</div>
              <p className="text-base font-medium text-slate-300">Your inbox is clear</p>
              <p className="text-sm mt-1">No notifications match your current filters.</p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markOneRead(n.id, n.read)}
                className={`group relative bg-[#151c2a]/60 backdrop-blur-xl border rounded-2xl p-5 flex gap-5 transition-all cursor-pointer overflow-hidden ${n.read
                  ? "border-white/5 hover:bg-[#1a2236]/80 text-slate-400"
                  : "border-primary/30 shadow-lg shadow-primary/5 hover:border-primary/50 text-white"
                  }`}
              >
                {!n.read && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-2xl" />
                )}

                <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center text-2xl bg-slate-800/80 border border-white/5 ${!n.read ? "shadow-[0_0_15px_rgba(25,97,227,0.15)]" : "opacity-60"}`}>
                  {typeIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="font-bold text-base truncate">
                      {n.title}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap pt-1">
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>
                  <p className={`text-sm mt-1.5 leading-relaxed line-clamp-2 ${n.read ? "text-slate-500" : "text-slate-300"}`}>
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
