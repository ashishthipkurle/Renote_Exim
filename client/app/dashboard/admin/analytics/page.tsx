"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Users,
  Briefcase,
  Zap,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Calendar
} from "lucide-react";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "sonner";
import clsx from "clsx";

type Metric = {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down";
};

type AnalyticsData = {
  growth: { month: string; signups: number; revenue: number; orders: number }[];
  categories: { name: string; count: number }[];
};

export default function AdminAnalyticsPage() {
  const authFetch = useAuthFetch();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const result = await authFetch("/api/admin/analytics");
      setData(result);
    } catch (error) {
      toast.error("Failed to load platform intelligence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const kpis: Metric[] = [
    { label: "Network Growth", value: 4820, change: 12.5, trend: "up" },
    { label: "Active Capital", value: 1.2, change: 8.2, trend: "up" },
    { label: "Order Velocity", value: 124, change: -2.4, trend: "down" },
    { label: "Market Saturation", value: 88, change: 5.1, trend: "up" },
  ];

  return (
    <div className="h-dvh flex flex-col bg-[#0b1019] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05)_0%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0b1019]/30 backdrop-blur-md z-30">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
            Neural Analytics
            <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded">
              L4 INTEL
            </span>
          </h1>
          <p className="text-slate-500 text-xs font-medium italic">High-fidelity platform performance and growth metrics.</p>
        </div>

        <div className="flex gap-2">
          <div className="flex bg-[#151c2a]/50 border border-white/10 p-1 rounded-xl">
            {["24H", "7D", "30D", "1Y"].map((t) => (
              <button
                key={t}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                  t === "30D" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 bg-[#151c2a]/50 border border-white/10 px-4 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors">
            <Calendar className="w-4 h-4" />
            Export Intel
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#151c2a]/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl group hover:border-primary/30 transition-all shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{kpi.label}</div>
                <div className={clsx(
                  "flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded border uppercase",
                  kpi.trend === "up" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                  {kpi.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.change}%
                </div>
              </div>
              <div className="flex items-end gap-1.5">
                <div className="text-3xl font-black text-white group-hover:text-primary transition-colors">
                  {kpi.label.includes("Capital") ? `$${kpi.value}M` : kpi.label.includes("Saturation") ? `${kpi.value}%` : kpi.value.toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Growth Chart */}
          <div className="xl:col-span-2 bg-[#151c2a]/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl relative overflow-hidden h-[450px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-white font-black text-lg uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Growth Velocity
                </h3>
                <p className="text-slate-500 text-xs font-medium">Trajectory of users and revenue over current segment.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signups</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</span>
                </div>
              </div>
            </div>

            <div className="absolute inset-x-8 bottom-12 top-32 flex items-end gap-4 p-4 border-l border-b border-white/5">
              {loading ? (
                <div className="w-full h-full animate-pulse bg-white/5 rounded-2xl" />
              ) : (
                data?.growth.map((g, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 relative group h-full justify-end">
                    <div className="flex gap-1 w-full justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(g.signups / 500) * 100}%` }}
                        className="w-4 bg-primary rounded-t-lg shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:w-6 transition-all"
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(g.revenue / 5000000) * 100}%` }}
                        className="w-4 bg-emerald-500 rounded-t-lg shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:w-6 transition-all"
                      />
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase rotate-45 mt-4 min-w-[30px]">{g.month}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sector Distribution */}
          <div className="bg-[#151c2a]/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl h-[450px] flex flex-col">
            <div className="mb-8">
              <h3 className="text-white font-black text-lg uppercase tracking-widest flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                Sector Share
              </h3>
              <p className="text-slate-500 text-xs font-medium">Platform engagement by industry sector.</p>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 bg-white/5 rounded-lg animate-pulse" />
                ))
              ) : (
                data?.categories.map((c, i) => (
                  <div key={c.name} className="space-y-2 group">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-300 group-hover:text-primary transition-colors">{c.name}</span>
                      <span className="text-white">{c.count} Listings</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.count / 1000) * 100}%` }}
                        className={clsx(
                          "h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]",
                          i === 0 ? "bg-primary" : i === 1 ? "bg-emerald-500" : i === 2 ? "bg-purple-500" : "bg-amber-500"
                        )}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <button className="mt-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-white/5 rounded-xl hover:border-primary/50 hover:text-white transition-all flex items-center justify-center gap-2">
              Deep Sector Scan
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Heatmap/Activity Visualization Placeholder */}
        <div className="mt-8 bg-gradient-to-r from-primary/5 via-transparent to-emerald-500/5 border border-white/5 p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
          <Globe className="w-12 h-12 text-primary animate-pulse" />
          <div>
            <h4 className="text-white font-black uppercase tracking-widest">Global Heat Map Matrix</h4>
            <p className="text-slate-500 text-xs font-medium max-w-md mx-auto mt-2">
              Advanced visualization for geographic order density and trade corridors currently calculating in secondary core.
            </p>
          </div>
          <button className="bg-primary/20 text-primary border border-primary/30 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
            Access Secondary Node
          </button>
        </div>
      </div>
    </div>
  );
}
