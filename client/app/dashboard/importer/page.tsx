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
  ORDER_UPDATE: { color: "text-foreground", bg: "bg-muted/30", border: "hover:border-primary/30" },
  SHIPMENT_UPDATE: { color: "text-muted-foreground", bg: "bg-muted/20", border: "hover:border-muted-foreground/30" },
  PAYMENT_RECEIVED: { color: "text-muted-foreground", bg: "bg-muted/20", border: "hover:border-muted-foreground/30" },
  MESSAGE: { color: "text-muted-foreground", bg: "bg-muted/20", border: "hover:border-muted-foreground/30" },
  SYSTEM: { color: "text-foreground", bg: "bg-muted/30", border: "hover:border-primary/30" },
};

// Removed static bubbles array, using dynamic category data instead

function feedColor(status: string) {
  switch (status.toUpperCase()) {
    case "PENDING": return "bg-neutral-400";
    case "CONFIRMED": return "bg-white";
    case "PROCESSING": return "bg-neutral-500";
    case "SHIPPED": return "bg-neutral-300";
    case "DELIVERED": return "bg-white";
    case "CANCELLED": return "bg-neutral-600";
    default: return "bg-neutral-400";
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
      accentColor: "text-primary",
      barColor: "bg-primary",
      barShadow: "shadow-[0_0_10px_rgba(212,175,55,0.3)]",
      hoverBorder: "hover:border-primary/30",
    },
    {
      label: "Total Spent",
      value: loading ? "..." : formatCurrency(data?.totalSpent ?? 0),
      trend: "Lifetime",
      trendUp: true,
      bar: 78,
      accentColor: "text-muted-foreground",
      barColor: "bg-neutral-400",
      barShadow: "shadow-[0_0_10px_rgba(163,163,163,0.3)]",
      hoverBorder: "hover:border-neutral-400/30",
    },
    {
      label: "Pending Orders",
      value: loading ? "..." : String(data?.pendingOrders ?? 0),
      trend: "Needs action",
      trendUp: false,
      bar: data ? Math.min((data.pendingOrders / Math.max(data.totalOrders, 1)) * 100, 100) : 35,
      accentColor: "text-neutral-300",
      barColor: "bg-neutral-300",
      barShadow: "shadow-[0_0_10px_rgba(212,212,212,0.3)]",
      hoverBorder: "hover:border-neutral-300/30",
    },
    {
      label: "Total Orders",
      value: loading ? "..." : formatNumber(data?.totalOrders ?? 0),
      trend: "All time",
      trendUp: null,
      bar: 55,
      accentColor: "text-muted-foreground",
      barColor: "bg-neutral-500",
      barShadow: "shadow-[0_0_10px_rgba(115,115,115,0.3)]",
      hoverBorder: "hover:border-neutral-500/30",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background transition-colors duration-300">
      {/* Fixed Header aligned with Exporter Dashboard */}
      <header className="flex-shrink-0 h-20 px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border bg-header backdrop-blur-xl z-40">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Global Trade Overview</h2>
          <p className="text-muted-foreground text-sm mt-1">Unified market surveillance and procurement tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-sm shadow-[0_0_15px_rgba(212,175,55,0.15)] text-primary">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-widest text-[10px]">Operational</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 custom-scrollbar">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className={`bg-muted/40 backdrop-blur-xl p-6 rounded-2xl border border-border relative overflow-hidden group ${s.hoverBorder} transition-all duration-300 shadow-xl`}>
              <p className={`text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2`}>
                <span className={`${s.accentColor}`}>●</span>
                {s.label}
              </p>
              <div className="flex items-baseline gap-2 mt-4">
                <h3 className="text-3xl font-black text-foreground">{s.value}</h3>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg flex items-center tracking-widest uppercase ${s.trendUp === true ? "text-primary bg-primary/10 border border-primary/20" :
                  s.trendUp === false ? "text-muted-foreground bg-muted/20 border border-border" :
                    "text-foreground bg-muted border border-border"
                  }`}>
                  {s.trend}
                </span>
              </div>
              <div className="mt-5 h-[2px] w-full bg-muted rounded-full overflow-hidden">
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
            <div className="bg-muted/40 backdrop-blur-xl rounded-2xl p-6 border border-border relative overflow-hidden flex flex-col lg:flex-row gap-6 shadow-xl">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Expenditure Analytics</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Sector-specific procurement distribution</p>
                  </div>
                </div>
                {/* Category bars */}
                <div className="w-full h-[380px] bg-muted/20 border border-border rounded-xl overflow-hidden p-6 flex flex-col justify-center gap-6 shadow-inner">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-10 bg-muted/20 rounded-lg animate-pulse" />
                    ))
                  ) : (!data?.categories || data.categories.length === 0) ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] italic opacity-30">SIGNAL TRACE INDETERMINATE</div>
                  ) : (
                    data.categories.sort((a, b) => b.spent - a.spent).slice(0, 5).map((cat, i) => {
                      const maxSpent = Math.max(...data.categories!.map(c => c.spent));
                      const percent = maxSpent > 0 ? (cat.spent / maxSpent) * 100 : 0;
                      const colors = ["bg-primary", "bg-neutral-300", "bg-neutral-500", "bg-neutral-600", "bg-neutral-400"];
                      return (
                        <div key={cat.name} className="flex flex-col gap-2">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{cat.name}</span>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{formatCurrency(cat.spent)}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted border border-border rounded-full overflow-hidden">
                            <div className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(212,175,55,0.2)]`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              {/* Strategic Insights from notifications */}
              <div className="lg:w-72 flex flex-col gap-4 border-l border-border pl-0 lg:pl-6 pt-6 lg:pt-0">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Live Intelligence</h4>
                </div>
                <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-muted/20 rounded-lg animate-pulse" />
                    ))
                  ) : notifs.length === 0 ? (
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center py-4">No data streams found</p>
                  ) : (
                    notifs.map((n) => {
                      const style = insightStyle[n.type] || insightStyle.SYSTEM;
                      return (
                        <div key={n.id} className={`group p-3.5 rounded-xl bg-muted/40 hover:bg-muted/60 border border-border ${style.border} transition-all cursor-pointer shadow-xl`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${style.color} border border-border px-2 py-0.5 rounded-lg bg-background/50`}>{n.type.replace("_", " ")}</span>
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{timeAgo(n.createdAt)}</span>
                          </div>
                          <p className="text-[10px] font-black text-foreground leading-relaxed uppercase tracking-widest">&ldquo;{n.title}&rdquo;</p>
                        </div>
                      );
                    })
                  )}
                </div>
                <Link href="/dashboard/importer/notifications" className="mt-auto w-full py-2.5 rounded-xl border border-border text-foreground text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all flex items-center justify-center gap-2">
                  Open Control Center
                </Link>
              </div>
            </div>

            {/* Revenue chart -> monthly spending */}
            <div className="bg-muted/40 backdrop-blur-xl rounded-2xl p-6 border border-border shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-foreground uppercase italic tracking-tighter">Procurement Trend</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Historical expenditure matrix</p>
                </div>
              </div>
              <div className="relative w-full h-48 flex flex-col justify-end px-2">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5 z-0 pb-8">
                  <div className="w-full h-px bg-foreground" />
                  <div className="w-full h-px bg-foreground" />
                  <div className="w-full h-px bg-foreground" />
                  <div className="w-full h-px bg-foreground" />
                </div>
                {loading || !data?.monthlySpending ? (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] italic z-20 pb-8 opacity-40 animate-pulse">SYNCHRONIZING TELEMETRY...</div>
                ) : (
                  <>
                    <div className="absolute inset-0 z-10 pb-8">
                      <svg className="w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]" preserveAspectRatio="none" viewBox="0 0 800 200">
                        <defs>
                          <linearGradient id="areaGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 0.15 }} />
                            <stop offset="100%" style={{ stopColor: "#ffffff", stopOpacity: 0 }} />
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
                              <path d={linePath} fill="none" stroke="#ffffff" strokeWidth="2.5" className="transition-all duration-1000" opacity="0.8" />
                              {points.map((p, i) => {
                                const [cx, cy] = p.split(",");
                                return <circle key={i} cx={cx} cy={cy} r="4" fill="currentColor" stroke="#ffffff" strokeWidth="1.5" className="text-primary hover:text-foreground transition-all duration-1000 hover:r-[6px] hover:fill-[#ffffff] cursor-pointer" />;
                              })}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                    {/* X-axis labels */}
                    <div className="relative z-20 w-full flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-auto pt-3">
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
            <div className="bg-muted/40 backdrop-blur-xl p-6 rounded-2xl border border-border shadow-xl">
              <h3 className="text-lg font-black text-foreground uppercase italic tracking-tighter mb-5">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/products" className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 shadow-lg shadow-primary/20 group h-28 border border-transparent">
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <span className="text-xs font-bold text-center">Browse Products</span>
                </Link>
                <Link href="/dashboard/importer/orders" className="bg-muted/40 backdrop-blur-xl hover:bg-muted/60 border border-border text-foreground p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 group h-28 shadow-lg">
                  <svg className="w-6 h-6 text-muted-foreground group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">My Orders</span>
                </Link>
                <Link href="/dashboard/importer/inventory" className="bg-muted/40 backdrop-blur-xl hover:bg-muted/60 border border-border text-foreground p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 group h-28 shadow-lg">
                  <svg className="w-6 h-6 text-muted-foreground group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">Inventory</span>
                </Link>
                <Link href="/dashboard/importer/settings" className="bg-muted/40 backdrop-blur-xl hover:bg-muted/60 border border-border text-foreground p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 group h-28 shadow-lg">
                  <svg className="w-6 h-6 text-muted-foreground group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">Settings</span>
                </Link>
              </div>
            </div>

            {/* Live Trade Feed from orders */}
            <div className="bg-muted/40 backdrop-blur-xl p-6 rounded-2xl border border-border shadow-xl flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-foreground uppercase italic tracking-tighter">Recent Logistics</h3>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted/20 rounded-lg animate-pulse" />
                  ))
                ) : orders.length === 0 ? (
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center py-4">Protocol Buffer Empty</p>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="flex gap-4 items-start p-4 rounded-xl bg-muted/40 border border-border hover:bg-muted/60 hover:border-primary/20 transition-all cursor-pointer shadow-xl">
                      <div className={`mt-2 size-2 rounded-full ${feedColor(o.status)} flex-shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.2)]`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-tight italic">TRANSACTION {o.orderNumber}</p>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest truncate mt-0.5">{o.product?.name ?? "—"} · {formatCurrency(o.totalAmount)}</p>
                        <p className="text-[8px] text-muted-foreground/30 mt-1.5 font-black uppercase tracking-widest">{timeAgo(o.createdAt)}</p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-1 rounded-lg border uppercase tracking-widest ${o.status === "DELIVERED" ? "bg-muted/30 text-foreground border-border" :
                        o.status === "SHIPPED" ? "bg-muted/30 text-foreground border-border" :
                          o.status === "PENDING" ? "bg-muted/20 text-muted-foreground border-border" :
                            "bg-neutral-900 text-muted-foreground border-neutral-800"
                        }`}>{o.status}</span>
                    </div>
                  ))
                )}
              </div>
                <Link href="/dashboard/importer/orders" className="w-full mt-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground hover:bg-muted rounded-xl transition-all border border-dashed border-border text-center block">
                Access Order Archives
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
