"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch, timeAgo } from "@/lib/api-utils";

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
    case "ORDER_UPDATE":
      return "📦";
    case "SHIPMENT_UPDATE":
      return "🚢";
    case "PAYMENT_RECEIVED":
      return "💰";
    case "MESSAGE":
      return "💬";
    case "SYSTEM":
      return "🔔";
    default:
      return "🔔";
  }
}

export default function ExporterNotificationsPage() {
  const [data, setData] = useState<NotifResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifs = useCallback(() => {
    setLoading(true);
    const url = filter === "unread" ? "/api/notifications?unread=true&limit=50" : "/api/notifications?limit=50";
    authFetch<NotifResponse>(url)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const markAllRead = async () => {
    await authFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({ markAll: true }) });
    fetchNotifs();
  };

  const markOneRead = async (id: string) => {
    await authFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({ ids: [id] }) });
    fetchNotifs();
  };

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Notifications</h1>
            <p className="text-slate-400 mt-1">
              {data ? `${data.unreadCount} unread of ${data.pagination.total} total` : "Loading…"}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-slate-800/60 rounded-lg overflow-hidden border border-white/5">
              {(["all", "unread"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${filter === f ? "bg-primary text-white" : "text-slate-400 hover:text-white"}`}>
                  {f}
                </button>
              ))}
            </div>
            <button onClick={markAllRead} className="bg-primary hover:bg-[#0f49bd] text-white font-bold py-2 px-5 rounded-xl text-xs shadow-lg shadow-primary/20 transition-colors">
              Mark All Read
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[900px] mx-auto space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-[#151c2a]/60 rounded-2xl animate-pulse border border-white/5" />
            ))
          ) : !data?.notifications?.length ? (
            <div className="text-center py-20 text-slate-500">
              <div className="text-4xl mb-3">🔔</div>
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            data.notifications.map((n) => (
              <div key={n.id} onClick={() => !n.read && markOneRead(n.id)} className={`bg-[#151c2a]/60 backdrop-blur-xl border rounded-2xl p-5 flex gap-4 transition-all cursor-pointer hover:bg-[#1a2236]/80 ${n.read ? "border-white/5 opacity-60" : "border-primary/20 shadow-lg shadow-primary/5"}`}>
                <div className="text-2xl flex-shrink-0 mt-0.5">{typeIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm truncate">{n.title}</span>
                    {!n.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">{n.message}</p>
                  <div className="text-[10px] text-slate-600 mt-2">{timeAgo(n.createdAt)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
