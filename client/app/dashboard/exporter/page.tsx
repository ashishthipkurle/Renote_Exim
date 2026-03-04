"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  AlertTriangle,
  Search,
  CalendarDays,
  Plus,
} from "lucide-react";
import { authFetch, formatCurrency, formatNumber, timeAgo, getInitials } from "@/lib/api-utils";

interface ExporterStats {
  totalProducts: number;
  activeOrders: number;
  totalRevenue: number;
  totalShipments: number;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  product: { name: string };
  importer: { name: string; companyName: string | null; country: string | null };
}

interface CategoryRevenue {
  category: string;
  revenue: number;
  orderCount: number;
}

interface Partner {
  id: string;
  name: string;
  companyName: string | null;
  country: string | null;
  verified: boolean;
  orderCount: number;
  totalValue: number;
}

const CATEGORY_COLORS: Record<string, { color: string; shadow: string }> = {
  ELECTRONICS: { color: "bg-blue-500", shadow: "shadow-[0_0_8px_rgba(59,130,246,0.5)]" },
  MACHINES: { color: "bg-teal-500", shadow: "shadow-[0_0_8px_rgba(20,184,166,0.5)]" },
  CHEMICALS: { color: "bg-purple-500", shadow: "shadow-[0_0_8px_rgba(168,85,247,0.5)]" },
  TEXTILES: { color: "bg-orange-500", shadow: "shadow-[0_0_8px_rgba(249,115,22,0.5)]" },
  MEDICAL: { color: "bg-rose-500", shadow: "shadow-[0_0_8px_rgba(244,63,94,0.5)]" },
  HANDICRAFTS: { color: "bg-amber-500", shadow: "shadow-[0_0_8px_rgba(245,158,11,0.5)]" },
  FOOD: { color: "bg-green-500", shadow: "shadow-[0_0_8px_rgba(34,197,94,0.5)]" },
  AUTOMOTIVE: { color: "bg-slate-500", shadow: "shadow-[0_0_8px_rgba(100,116,139,0.5)]" },
  CONSTRUCTION: { color: "bg-yellow-600", shadow: "shadow-[0_0_8px_rgba(202,138,4,0.5)]" },
  AGRICULTURE: { color: "bg-lime-500", shadow: "shadow-[0_0_8px_rgba(132,204,22,0.5)]" },
  OTHER: { color: "bg-gray-500", shadow: "shadow-[0_0_8px_rgba(107,114,128,0.5)]" },
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-500",
  CONFIRMED: "text-blue-400",
  PROCESSING: "text-yellow-500",
  SHIPPED: "text-green-400",
  DELIVERED: "text-green-400",
  CANCELLED: "text-red-400",
  DISPUTED: "text-red-400",
};

const BG_COLORS = [
  { bg: "bg-amber-500/20", text: "text-amber-400" },
  { bg: "bg-blue-500/20", text: "text-blue-400" },
  { bg: "bg-slate-500/20", text: "text-slate-400" },
  { bg: "bg-purple-500/20", text: "text-purple-400" },
  { bg: "bg-green-500/20", text: "text-green-400" },
  { bg: "bg-cyan-500/20", text: "text-cyan-400" },
];

function formatValue(n: number, prefix = "", suffix = "") {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M${suffix}`;
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(0)}K${suffix}`;
  return `${prefix}${n}${suffix}`;
}

export default function ExporterDashboard() {
  const [data, setData] = useState<ExporterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [categories, setCategories] = useState<CategoryRevenue[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    Promise.all([
      authFetch<ExporterStats>("/api/stats?scope=exporter").catch(() => null),
      authFetch<{ orders: OrderItem[] }>("/api/orders?limit=4").catch(() => ({ orders: [] })),
      authFetch<{ revenueByCategory: CategoryRevenue[] }>("/api/dashboard/analytics").catch(() => ({ revenueByCategory: [] })),
      authFetch<{ partners: Partner[] }>("/api/dashboard/directory").catch(() => ({ partners: [] })),
    ]).then(([statsData, ordersData, analyticsData, directoryData]) => {
      setData(statsData);
      setRecentOrders(ordersData.orders || []);
      setCategories(analyticsData.revenueByCategory || []);
      setPartners((directoryData.partners || []).slice(0, 3));
      setLoading(false);
    });
  }, []);

  const maxCatRevenue = Math.max(...categories.map((c) => c.revenue), 1);

  const stats = [
    {
      label: "Total Products",
      value: loading ? "..." : String(data?.totalProducts ?? 0),
      trend: "Live",
      trendUp: true,
      bar: 75,
      gradFrom: "from-blue-600", gradTo: "to-primary",
      bgTint: "bg-blue-500/10", textTint: "text-blue-400",
      borderTint: "border-blue-500/20", glowHover: "hover:border-primary/30",
      shadow: "shadow-[0_0_10px_rgba(37,99,235,0.5)]", neon: true,
    },
    {
      label: "Total Revenue",
      value: loading ? "..." : formatValue(data?.totalRevenue ?? 0, "$"),
      trend: "Lifetime", trendUp: true, bar: 60,
      gradFrom: "from-purple-600", gradTo: "to-[#bc13ec]",
      bgTint: "bg-[#bc13ec]/10", textTint: "text-[#bc13ec]",
      borderTint: "border-[#bc13ec]/20", glowHover: "hover:border-[#bc13ec]/30",
      shadow: "shadow-[0_0_10px_rgba(188,19,236,0.5)]",
    },
    {
      label: "Active Orders",
      value: loading ? "..." : String(data?.activeOrders ?? 0),
      trend: "In progress", trendUp: true, bar: 85,
      gradFrom: "from-green-600", gradTo: "to-[#00ff9d]",
      bgTint: "bg-[#00ff9d]/10", textTint: "text-[#00ff9d]",
      borderTint: "border-[#00ff9d]/20", glowHover: "hover:border-[#00ff9d]/30",
      shadow: "shadow-[0_0_10px_rgba(0,255,157,0.5)]",
    },
    {
      label: "Total Shipments",
      value: loading ? "..." : String(data?.totalShipments ?? 0),
      trend: "All time", trendUp: null as boolean | null, bar: 30,
      gradFrom: "from-orange-600", gradTo: "to-orange-400",
      bgTint: "bg-orange-500/10", textTint: "text-orange-500",
      borderTint: "border-orange-500/20", glowHover: "hover:border-orange-500/30",
      shadow: "shadow-[0_0_10px_rgba(249,115,22,0.5)]",
    },
  ];

  return (
    <main className="flex-1 flex flex-col h-dvh overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0c12] to-[#0a0c12] relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0a0c12]/30 backdrop-blur-sm z-40">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Executive Overview
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">Live</span>
          </h1>
          <p className="text-slate-400 text-sm">Welcome back, Director</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#151c2a]/50 border border-white/5 text-sm text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Status: Operational
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input className="pl-10 pr-4 py-2 bg-[#151c2a]/50 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary w-64 transition-all" placeholder="Search shipments, IDs..." type="text" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#151c2a]/50 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
              <CalendarDays className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary hover:bg-[#0f49bd] text-white shadow-lg shadow-primary/20 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1920px] mx-auto space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className={`bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl p-6 rounded-2xl relative overflow-hidden group ${s.glowHover} transition-all duration-300`}>
                <div className={`absolute -right-6 -top-6 w-24 h-24 ${s.bgTint} rounded-full blur-2xl group-hover:opacity-80 transition-all`} />
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${s.bgTint} ${s.textTint} border ${s.borderTint}`}>
                    {s.label === "Total Products" && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                    {s.label === "Total Revenue" && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm7-5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /></svg>}
                    {s.label === "Active Orders" && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" /></svg>}
                    {s.label === "Total Shipments" && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M13 16V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1m8-1a1 1 0 0 1-1 1H9m4-1V8a1 1 0 0 1 1-1h2.586a1 1 0 0 1 .707.293l3.414 3.414a1 1 0 0 1 .293.707V16a1 1 0 0 1-1 1h-1m-6-1a1 1 0 0 0 1 1h1M5 17a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0m6 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0" /></svg>}
                  </div>
                  <span className={`flex items-center text-xs font-bold ${s.trendUp === true ? "text-green-400 bg-green-500/10 border-green-500/20" : s.trendUp === false ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-white bg-white/5 border-white/10"} px-2 py-1 rounded border`}>
                    {s.trendUp === true && <TrendingUp className="w-3 h-3 mr-1" />}
                    {s.trendUp === false && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {s.trend}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-slate-400 text-sm font-medium">{s.label}</h3>
                  <p className={`text-3xl font-bold text-white ${"neon" in s && s.neon ? "drop-shadow-[0_0_10px_rgba(19,91,236,0.5)]" : ""}`}>{s.value}</p>
                </div>
                <div className="mt-4 h-1.5 w-full bg-[#151c2a] rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${s.gradFrom} ${s.gradTo} rounded-full ${s.shadow}`} style={{ width: `${s.bar}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Map + Transactions */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" style={{ height: "500px" }}>
            <div className="xl:col-span-2 bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 flex flex-col h-full relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 z-10">
                <div>
                  <h2 className="text-lg font-bold text-white">Live Logistics Pulse</h2>
                  <p className="text-slate-400 text-xs">Real-time global trade routes active now</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-[#151c2a] border border-white/10 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:border-primary/50 transition-colors">Air Freight</button>
                  <button className="px-3 py-1.5 bg-[#151c2a] border border-white/10 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:border-primary/50 transition-colors">Ocean Cargo</button>
                </div>
              </div>
              <div className="flex-1 relative rounded-xl bg-[#0f1521] border border-white/5 overflow-hidden group">
                <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-indigo-900/20 via-blue-900/10 to-emerald-900/20" />
                <div className="absolute top-[35%] left-[24%]">
                  <div className="relative w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(19,91,236,1)] z-10" />
                  <div className="absolute top-0 left-0 w-3 h-3 bg-primary rounded-full animate-ping z-0" />
                </div>
                <div className="absolute top-[32%] right-[18%]">
                  <div className="relative w-3 h-3 bg-[#00ff9d] rounded-full shadow-[0_0_15px_rgba(0,255,157,1)] z-10" />
                  <div className="absolute top-0 left-0 w-3 h-3 bg-[#00ff9d] rounded-full animate-ping z-0" style={{ animationDelay: "0.5s" }} />
                </div>
                <div className="absolute top-[45%] left-[62%]">
                  <div className="relative w-3 h-3 bg-[#bc13ec] rounded-full shadow-[0_0_15px_rgba(188,19,236,1)] z-10" />
                  <div className="absolute top-0 left-0 w-3 h-3 bg-[#bc13ec] rounded-full animate-ping z-0" style={{ animationDelay: "1.2s" }} />
                </div>
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="route-grad" x1="0%" x2="100%" y1="0%" y2="0%">
                      <stop offset="0%" style={{ stopColor: "#135bec", stopOpacity: 0.2 }} />
                      <stop offset="50%" style={{ stopColor: "#00f0ff", stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: "#00ff9d", stopOpacity: 0.2 }} />
                    </linearGradient>
                  </defs>
                  <path d="M780,180 Q500,50 240,195" fill="none" stroke="url(#route-grad)" strokeDasharray="4,4" strokeWidth="1.5">
                    <animate attributeName="stroke-dashoffset" dur="5s" from="100" to="0" repeatCount="indefinite" />
                  </path>
                  <path d="M480,160 Q550,220 620,250" fill="none" stroke="url(#route-grad)" strokeDasharray="4,4" strokeWidth="1.5">
                    <animate attributeName="stroke-dashoffset" dur="4s" from="100" to="0" repeatCount="indefinite" />
                  </path>
                </svg>
              </div>
            </div>

            {/* Recent Transactions — DYNAMIC */}
            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 flex flex-col h-full">
              <h2 className="text-lg font-bold text-white mb-6">Recent Transactions</h2>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 animate-pulse">
                      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-slate-700" /><div><div className="w-32 h-4 bg-slate-700 rounded" /><div className="w-24 h-3 bg-slate-700/50 rounded mt-1" /></div></div>
                      <div className="w-16 h-4 bg-slate-700 rounded" />
                    </div>
                  ))
                ) : recentOrders.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-500 text-sm">No transactions yet</div>
                ) : (
                  recentOrders.map((order, idx) => {
                    const palette = BG_COLORS[idx % BG_COLORS.length];
                    return (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${palette.bg} ${palette.text} flex items-center justify-center font-bold text-xs border border-white/10`}>
                            {getInitials(order.product.name)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{order.product.name}</h4>
                            <p className="text-[10px] text-slate-400">{order.importer.companyName || order.importer.name} &bull; {timeAgo(order.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{formatCurrency(order.totalPrice)}</p>
                          <p className={`text-[10px] ${STATUS_COLORS[order.status] || "text-slate-400"}`}>{order.status}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <Link href="/dashboard/exporter/analytics" className="mt-4 w-full py-2.5 bg-white/5 hover:bg-white/10 text-sm font-medium text-slate-300 rounded-xl transition-colors border border-white/5 text-center block">
                View All Transactions
              </Link>
            </div>
          </div>

          {/* Revenue by Category + Top Buyers — DYNAMIC */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">Revenue by Category</h2>
              <div className="space-y-6">
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}><div className="flex justify-between mb-2"><div className="w-24 h-3 bg-slate-700 rounded animate-pulse" /><div className="w-16 h-3 bg-slate-700 rounded animate-pulse" /></div><div className="h-2 w-full bg-[#151c2a] rounded-full" /></div>
                )) : categories.length === 0 ? (
                  <p className="text-sm text-slate-500">No category data yet. Add products to see revenue breakdown.</p>
                ) : categories.slice(0, 6).map((c) => {
                  const pct = maxCatRevenue > 0 ? Math.round((c.revenue / maxCatRevenue) * 100) : 0;
                  const colors = CATEGORY_COLORS[c.category] || CATEGORY_COLORS.OTHER;
                  return (
                    <div key={c.category}>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-300 capitalize">{c.category.toLowerCase().replace(/_/g, " ")}</span>
                        <span className="text-white font-bold">{formatCurrency(c.revenue)}</span>
                      </div>
                      <div className="h-2 w-full bg-[#151c2a] rounded-full overflow-hidden">
                        <div className={`h-full ${colors.color} rounded-full ${colors.shadow}`} style={{ width: `${Math.max(pct, 5)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white">Top Buyers</h2>
                <Link href="/dashboard/exporter/directory" className="text-primary text-xs font-medium hover:underline">View Directory</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="text-xs text-slate-500 border-b border-white/5"><th className="pb-3 font-medium">Buyer</th><th className="pb-3 font-medium">Region</th><th className="pb-3 font-medium">Orders</th><th className="pb-3 font-medium text-right">Value</th></tr></thead>
                  <tbody className="text-sm">
                    {loading ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/5"><td className="py-3"><div className="w-28 h-4 bg-slate-700 rounded animate-pulse" /></td><td className="py-3"><div className="w-20 h-4 bg-slate-700/50 rounded animate-pulse" /></td><td className="py-3"><div className="w-12 h-4 bg-slate-700/50 rounded animate-pulse" /></td><td className="py-3"><div className="w-16 h-4 bg-slate-700 rounded animate-pulse ml-auto" /></td></tr>
                    )) : partners.length === 0 ? (
                      <tr><td colSpan={4} className="py-8 text-center text-slate-500 text-sm">No buyers yet</td></tr>
                    ) : partners.map((p, idx) => {
                      const palette = BG_COLORS[idx % BG_COLORS.length];
                      return (
                        <tr key={p.id} className="border-b border-white/5 last:border-0 group hover:bg-white/5 transition-colors">
                          <td className="py-3 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${palette.bg} ${palette.text} flex items-center justify-center font-bold text-xs`}>{getInitials(p.companyName || p.name)}</div>
                            <span className="text-slate-200 font-medium">{p.companyName || p.name}</span>
                          </td>
                          <td className="py-3 text-slate-400">{p.country || "—"}</td>
                          <td className="py-3 text-white">{formatNumber(p.orderCount)}</td>
                          <td className="py-3 text-right text-primary font-bold">{formatCurrency(p.totalValue)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
