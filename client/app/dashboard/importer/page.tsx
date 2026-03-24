"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch, formatCurrency, formatNumber, timeAgo } from "@/lib/api-utils";

interface ImporterStats {
  totalOrders: number;
  pendingOrders: number;
  activeShipments: number;
  totalSpent: number;
  monthlySpending?: { month: string; spent: number; year: number; monthNum: number }[];
  categories?: { name: string; spent: number }[];
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  product?: { name: string };
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotifResponse {
  notifications: Notification[];
  unreadCount: number;
}

const insightStyle: Record<string, { color: string; bg: string; border: string }> = {
  ORDER_UPDATE: { color: "text-[#00f0ff]", bg: "bg-[#00f0ff]/10", border: "hover:border-[#00f0ff]/30" },
  SHIPMENT_UPDATE: { color: "text-[#d4af37]", bg: "bg-[#d4af37]/10", border: "hover:border-[#d4af37]/30" },
  PAYMENT_RECEIVED: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "hover:border-emerald-400/30" },
  MESSAGE: { color: "text-purple-400", bg: "bg-purple-400/10", border: "hover:border-purple-400/30" },
  SYSTEM: { color: "text-primary", bg: "bg-primary/10", border: "hover:border-primary/30" },
};

// Removed static bubbles array, using dynamic category data instead

function feedColor(status: string) {
  switch (status.toUpperCase()) {
    case "PENDING": return "bg-[#d4af37]";
    case "CONFIRMED": return "bg-emerald-500";
    case "PROCESSING": return "bg-purple-500";
    case "SHIPPED": return "bg-[#00f0ff]";
    case "DELIVERED": return "bg-emerald-400";
    case "CANCELLED": return "bg-red-500";
    default: return "bg-primary";
  }
}

export default function ImporterDashboard() {
  const [data, setData] = useState<ImporterStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch<ImporterStats>("/api/stats?scope=importer"),
      authFetch<{ orders: Order[] }>("/api/orders?limit=5"),
      authFetch<NotifResponse>("/api/notifications?limit=5"),
    ])
      .then(([stats, ordersResp, notifsResp]) => {
        setData(stats);
        setOrders(ordersResp.orders ?? []);
        setNotifs(notifsResp.notifications ?? []);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Active Shipments",
      value: loading ? "..." : String(data?.activeShipments ?? 0),
      trend: "Live",
      trendUp: true,
      bar: data ? Math.min((data.activeShipments / Math.max(data.totalOrders, 1)) * 100, 100) : 50,
      accentColor: "text-[#00f0ff]",
      barColor: "bg-[#00f0ff]",
      barShadow: "shadow-[0_0_10px_rgba(0,240,255,0.5)]",
      hoverBorder: "hover:border-[#00f0ff]/30",
    },
    {
      label: "Total Spent",
      value: loading ? "..." : formatCurrency(data?.totalSpent ?? 0),
      trend: "Lifetime",
      trendUp: true,
      bar: 78,
      accentColor: "text-[#d4af37]",
      barColor: "bg-[#d4af37]",
      barShadow: "shadow-[0_0_10px_rgba(212,175,55,0.5)]",
      hoverBorder: "hover:border-[#d4af37]/30",
    },
    {
      label: "Pending Orders",
      value: loading ? "..." : String(data?.pendingOrders ?? 0),
      trend: "Needs action",
      trendUp: false,
      bar: data ? Math.min((data.pendingOrders / Math.max(data.totalOrders, 1)) * 100, 100) : 35,
      accentColor: "text-purple-400",
      barColor: "bg-purple-500",
      barShadow: "shadow-[0_0_10px_rgba(168,85,247,0.5)]",
      hoverBorder: "hover:border-purple-500/30",
    },
    {
      label: "Total Orders",
      value: loading ? "..." : formatNumber(data?.totalOrders ?? 0),
      trend: "All time",
      trendUp: null,
      bar: 55,
      accentColor: "text-primary",
      barColor: "bg-primary",
      barShadow: "shadow-[0_0_10px_rgba(19,91,236,0.5)]",
      hoverBorder: "hover:border-primary/30",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      {/* Fixed Header aligned with Exporter Dashboard */}
      <header className="flex-shrink-0 h-20 px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 bg-[#0a0c12]/30 backdrop-blur-sm z-40">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Global Trade Overview</h2>
          <p className="text-slate-400 text-sm mt-1">Welcome back. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#161b26]/70 backdrop-blur-xl border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-white font-medium">System Online</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 custom-scrollbar">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className={`bg-[#161b26]/70 backdrop-blur-xl p-5 rounded-xl border border-white/5 relative overflow-hidden group ${s.hoverBorder} transition-all duration-300`}>
              <p className={`text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2`}>
                <span className={`${s.accentColor}`}>●</span>
                {s.label}
              </p>
              <div className="flex items-baseline gap-2 mt-3">
                <h3 className="text-3xl font-black text-white">{s.value}</h3>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex items-center ${s.trendUp === true ? "text-[#00f0ff] bg-[#00f0ff]/10" :
                  s.trendUp === false ? "text-rose-500 bg-rose-500/10" :
                    "text-white bg-white/5"
                  }`}>
                  {s.trend}
                </span>
              </div>
              <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${s.barColor} rounded-full ${s.barShadow}`} style={{ width: `${s.bar}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Spending by Category + Insights */}
            <div className="bg-[#161b26]/70 backdrop-blur-xl rounded-xl p-6 border border-white/5 relative overflow-hidden flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-white">Spending by Category</h3>
                    <p className="text-xs text-slate-400">Your top purchased product categories</p>
                  </div>
                </div>
                {/* Category bars */}
                <div className="w-full h-[380px] bg-[#1a2333]/30 rounded-xl overflow-hidden p-6 flex flex-col justify-center gap-6">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
                    ))
                  ) : (!data?.categories || data.categories.length === 0) ? (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">No category data available</div>
                  ) : (
                    data.categories.sort((a,b) => b.spent - a.spent).slice(0, 5).map((cat, i) => {
                      const maxSpent = Math.max(...data.categories!.map(c => c.spent));
                      const percent = maxSpent > 0 ? (cat.spent / maxSpent) * 100 : 0;
                      const colors = ["bg-[#00f0ff]", "bg-[#d4af37]", "bg-purple-500", "bg-emerald-500", "bg-rose-500"];
                      return (
                        <div key={cat.name} className="flex flex-col gap-2">
                          <div className="flex justify-between items-end">
                            <span className="text-sm font-bold text-white uppercase tracking-wider">{cat.name}</span>
                            <span className="text-xs text-slate-400 font-medium">{formatCurrency(cat.spent)}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              {/* Strategic Insights from notifications */}
              <div className="lg:w-72 flex flex-col gap-4 border-l border-white/5 pl-0 lg:pl-6 pt-6 lg:pt-0">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#00f0ff] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Latest Updates</h4>
                </div>
                <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                    ))
                  ) : notifs.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No notifications yet</p>
                  ) : (
                    notifs.map((n) => {
                      const style = insightStyle[n.type] || insightStyle.SYSTEM;
                      return (
                        <div key={n.id} className={`group p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 ${style.border} transition-all cursor-pointer`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold ${style.color} ${style.bg} px-1.5 py-0.5 rounded`}>{n.type.replace("_", " ")}</span>
                            <span className="text-[9px] text-slate-500">{timeAgo(n.createdAt)}</span>
                          </div>
                          <p className="text-xs font-semibold text-white leading-relaxed">{n.title}</p>
                        </div>
                      );
                    })
                  )}
                </div>
                <Link href="/dashboard/importer/notifications" className="mt-auto w-full py-2.5 rounded-lg border border-primary/30 text-primary text-xs font-bold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2">
                  View All Notifications
                </Link>
              </div>
            </div>

            {/* Revenue chart -> monthly spending */}
            <div className="bg-[#161b26]/70 backdrop-blur-xl rounded-xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Spending Trend</h3>
                  <p className="text-xs text-slate-400">Order spending over the last 6 months</p>
                </div>
              </div>
              <div className="relative w-full h-48 flex flex-col justify-end px-2">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 z-0 pb-8">
                  <div className="w-full h-px bg-slate-400" />
                  <div className="w-full h-px bg-slate-400" />
                  <div className="w-full h-px bg-slate-400" />
                  <div className="w-full h-px bg-slate-400" />
                </div>
                {loading || !data?.monthlySpending ? (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500 z-20 pb-8 text-sm">Loading chart...</div>
                ) : (
                  <>
                    <div className="absolute inset-0 z-10 pb-8">
                      <svg className="w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]" preserveAspectRatio="none" viewBox="0 0 800 200">
                        <defs>
                          <linearGradient id="areaGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: "#00f0ff", stopOpacity: 0.2 }} />
                            <stop offset="100%" style={{ stopColor: "#00f0ff", stopOpacity: 0 }} />
                          </linearGradient>
                        </defs>
                        {(() => {
                          const ms = data.monthlySpending!;
                          const maxVal = Math.max(...ms.map(m => m.spent), 1);
                          const points = ms.map((m, i) => {
                            const x = ms.length > 1 ? (i / (ms.length - 1)) * 800 : 400;
                            const y = 180 - (m.spent / maxVal) * 160;
                            return `${x},${y}`;
                          });
                          const areaPath = `M0,200 L${points.join(" L")} L800,200 Z`;
                          const linePath = `M${points.join(" L")}`;
                          return (
                            <>
                              <path d={areaPath} fill="url(#areaGrad)" className="transition-all duration-1000" />
                              <path d={linePath} fill="none" stroke="#00f0ff" strokeWidth="3" className="transition-all duration-1000" />
                              {points.map((p, i) => {
                                const [cx, cy] = p.split(",");
                                return <circle key={i} cx={cx} cy={cy} r="5" fill="#0d1017" stroke="#00f0ff" strokeWidth="2" className="transition-all duration-1000 hover:r-[7px] hover:fill-[#00f0ff] cursor-pointer" />;
                              })}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                    {/* X-axis labels */}
                    <div className="relative z-20 w-full flex justify-between text-[10px] font-medium text-slate-500 mt-auto pt-2">
                      {data.monthlySpending.map((m, i) => (
                        <span key={i} className="text-center w-8 -ml-4 first:ml-0 last:-mr-4">{m.month}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions */}
            <div className="bg-[#161b26]/70 backdrop-blur-xl p-6 rounded-xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/products" className="bg-primary hover:bg-primary/80 text-white p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 shadow-lg shadow-primary/20 group h-28">
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <span className="text-xs font-bold">Browse Products</span>
                </Link>
                <Link href="/dashboard/importer/orders" className="bg-[#161b26]/70 backdrop-blur-xl hover:bg-white/5 border border-white/10 text-white p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 group h-28">
                  <svg className="w-6 h-6 text-[#d4af37] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="text-xs font-bold">My Orders</span>
                </Link>
                <Link href="/dashboard/importer/inventory" className="bg-[#161b26]/70 backdrop-blur-xl hover:bg-white/5 border border-white/10 text-white p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 group h-28">
                  <svg className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  <span className="text-xs font-bold">Inventory</span>
                </Link>
                <Link href="/dashboard/importer/settings" className="bg-[#161b26]/70 backdrop-blur-xl hover:bg-white/5 border border-white/10 text-white p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 group h-28">
                  <svg className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-xs font-bold">Settings</span>
                </Link>
              </div>
            </div>

            {/* Live Trade Feed from orders */}
            <div className="bg-[#161b26]/70 backdrop-blur-xl p-6 rounded-xl border border-white/5 flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Recent Orders</h3>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00f0ff]" />
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                  ))
                ) : orders.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No orders yet</p>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="flex gap-3 items-start p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className={`mt-1 size-2 rounded-full ${feedColor(o.status)} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">Order {o.orderNumber}</p>
                        <p className="text-xs text-slate-400 truncate">{o.product?.name ?? "—"} · {formatCurrency(o.totalAmount)}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{timeAgo(o.createdAt)}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.status === "DELIVERED" ? "bg-emerald-500/20 text-emerald-400" :
                        o.status === "SHIPPED" ? "bg-sky-500/20 text-sky-400" :
                          o.status === "PENDING" ? "bg-amber-500/20 text-amber-400" :
                            "bg-slate-500/20 text-slate-300"
                        }`}>{o.status}</span>
                    </div>
                  ))
                )}
              </div>
              <Link href="/dashboard/importer/orders" className="w-full mt-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-dashed border-slate-700 text-center block">
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
