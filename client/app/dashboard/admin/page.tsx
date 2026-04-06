"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  Truck,
  Users,
  LineChart,
  Bell,
  Package,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  History,
  LayoutGrid
} from "lucide-react";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { format } from "date-fns";

type Stats = {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  ordersThisMonth: number;
};

type FeedItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
};

export default function AdminDashboard() {
  const authFetch = useAuthFetch();
  const [stats, setStats] = useState<Stats | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, feedData] = await Promise.all([
          authFetch<Stats>("/api/admin/stats"),
          authFetch<{ feed: FeedItem[] }>("/api/admin/feed")
        ]);
        setStats(statsData);
        setFeed(feedData.feed || []);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const kpis = [
    { label: "Platform Users", value: stats?.totalUsers.toLocaleString() || "0", sub: `${stats?.newUsersThisMonth || 0} new this month`, icon: Users, color: "text-white", bg: "bg-white/10" },
    { label: "Total Revenue", value: stats?.totalRevenue ? `$${Math.round(stats.totalRevenue).toLocaleString()}` : "$0", sub: "All transactions", icon: LineChart, color: "text-white", bg: "bg-white/10" },
    { label: "Market Listings", value: stats?.totalProducts.toLocaleString() || "0", sub: "Active products", icon: Package, color: "text-white", bg: "bg-white/10" },
    { label: "Trade Volume", value: stats?.totalOrders.toLocaleString() || "0", sub: `${stats?.ordersThisMonth || 0} recent orders`, icon: Truck, color: "text-white", bg: "bg-white/10" },
  ];

  return (
    <div className="relative h-dvh flex flex-col overflow-hidden bg-background transition-colors duration-300 text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05)_0%,transparent_70%)] opacity-50 dark:opacity-100 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[length:40px_40px] opacity-[0.2] dark:opacity-[0.03] pointer-events-none" />

      <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-border bg-background/30 backdrop-blur-sm z-40">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Executive Control
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white border border-white/30 uppercase tracking-wider">
              Live Systems
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time marketplace oversight.</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border text-sm text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-white" />
            Core Status: Operational
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden md:block">
              <input
                className="pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-white focus:border-white w-64 transition-all"
                placeholder="Audit ID search..."
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted/50 border border-border hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-white transition-colors">
              <History className="w-4 h-4" />
            </button>
            <Link
              href="/dashboard/admin/notifications"
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white hover:bg-slate-200 text-black shadow-lg shadow-white/5 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1920px] mx-auto space-y-8">
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {kpis.map((s, idx) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-muted/60 backdrop-blur-xl border border-border shadow-2xl p-6 rounded-2xl relative overflow-hidden group hover:border-white/40 transition-all cursor-default"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10" />
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${s.bg} ${s.color} border border-white/5`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  {idx === 1 && (
                    <span className="flex items-center text-[10px] font-bold text-white bg-white/10 px-2 py-1 rounded border border-white/20">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      SECURE
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-slate-500 text-[11px] font-black uppercase tracking-widest">{s.label}</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{loading ? "..." : s.value}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic">{s.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Activity Feed */}
            <div className="xl:col-span-8 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-white" />
                  <h2 className="text-white text-lg font-black tracking-tight uppercase tracking-widest text-sm">System Operations Feed</h2>
                </div>
                <Link href="/dashboard/admin/feed" className="text-white text-[11px] font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                  Expand Feed <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="bg-muted/40 backdrop-blur-md border border-border rounded-2xl overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Synchronizing feed data...</div>
                ) : feed.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {feed.map((item) => (
                      <div key={item.id} className="p-5 flex items-start gap-4 hover:bg-white/5 transition-colors group">
                        <div className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors">
                          {item.type.includes('USER') ? <Users className="w-5 h-5" /> :
                            item.type.includes('ORDER') ? <TrendingUp className="w-5 h-5" /> :
                              <Package className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
                            <span className="text-[10px] font-black text-slate-500 uppercase">{format(new Date(item.time), 'HH:mm')}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 font-medium">No recent operations detected.</div>
                )}
              </div>
            </div>

            {/* Quick Actions & Status */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-muted/60 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck className="w-5 h-5 text-white" />
                  <h2 className="text-white text-sm font-black uppercase tracking-widest">Rapid Controls</h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { href: "/dashboard/admin/users", label: "Verification Hub", icon: Users },
                    { href: "/dashboard/admin/products", label: "Listing Review", icon: Package },
                    { href: "/dashboard/admin/categories", label: "Catalog Engine", icon: LayoutGrid },
                    { href: "/dashboard/admin/shipments", label: "Logistics Grid", icon: Truck },
                  ].map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="flex items-center justify-between rounded-xl border border-border bg-white/5 px-4 py-3 group hover:border-white/40 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <l.icon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-white">{l.label}</span>
                      </div>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-white translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6">
                <h3 className="text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest mb-2">Platform Integrity</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">
                  All systems operating within normal parameters. Real-time encryption active for all cross-border financial settlements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
