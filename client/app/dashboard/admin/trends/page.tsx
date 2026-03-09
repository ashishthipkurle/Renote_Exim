"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  Zap,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Search,
  Filter,
  DollarSign,
  Package,
  Activity,
  Award,
  ShoppingCart
} from "lucide-react";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "sonner";
import clsx from "clsx";

type TrendData = {
  topCategories: { name: string; count: number }[];
  topProducts: { id: string; name: string; orders: number }[];
  recentTrends: { id: string; productName: string; price: number; time: string }[];
};

export default function AdminTrendsPage() {
  const authFetch = useAuthFetch();
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrends = async () => {
    try {
      const result = await authFetch("/api/admin/trends");
      setData(result);
    } catch (error) {
      toast.error("Failed to read market signals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  return (
    <div className="h-dvh flex flex-col bg-[#0b1019] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.05)_0%,transparent_50%)] pointer-events-none" />

      {/* Header */}
      <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0b1019]/30 backdrop-blur-md z-30">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
            Market Intelligence
            <span className="text-[10px] bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded">
              L7 ANALYSIS
            </span>
          </h1>
          <p className="text-slate-500 text-xs font-medium italic">High-velocity market analysis and commodity price vectors.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Query Commodities..."
              className="bg-[#151c2a]/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none w-64 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
            Export Report
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Top Products - Left Column */}
          <div className="xl:col-span-8 space-y-8">
            <div className="bg-[#151c2a]/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-white font-black text-lg uppercase tracking-widest flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    Dominant Assets
                  </h3>
                  <p className="text-slate-500 text-xs font-medium">Top performing products by transaction volume.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 opacity-50">
                  <Activity className="w-3 h-3" />
                  Live Sync
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                  ))
                ) : (
                  data?.topProducts.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group bg-white/5 border border-white/5 p-4 rounded-2xl hover:border-primary/30 transition-all flex items-center gap-4"
                    >
                      <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 flex items-center gap-1.5">
                          <ShoppingCart className="w-3 h-3" />
                          {p.orders} Transactions
                        </div>
                      </div>
                      <button className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Price Movements */}
            <div className="bg-[#151c2a]/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl">
              <div className="mb-8">
                <h3 className="text-white font-black text-lg uppercase tracking-widest flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Price Volatility Node
                </h3>
                <p className="text-slate-500 text-xs font-medium italic uppercase tracking-tighter">Real-time fiscal monitoring of commodity price adjustments.</p>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
                ) : (
                  data?.recentTrends.map((t, i) => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl group hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="size-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white uppercase tracking-tight">{t.productName}</div>
                          <div className="text-[9px] text-slate-500 font-mono">{new Date(t.time).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-emerald-400 font-mono">${t.price.toLocaleString()}</div>
                        <div className="text-[8px] text-emerald-500 font-black flex items-center gap-1 justify-end">
                          <ArrowUpRight className="w-2.5 h-2.5" />
                          +1.4%
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sectors - Right Column */}
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-[#151c2a]/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl flex flex-col min-h-full">
              <div className="mb-8">
                <h3 className="text-white font-black text-lg uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Sector Intensity
                </h3>
                <p className="text-slate-500 text-xs font-medium">Market density per industrial sector hub.</p>
              </div>

              <div className="flex-1 space-y-6">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                  ))
                ) : (
                  data?.topCategories.map((c, i) => (
                    <div key={c.name} className="space-y-2 group">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-300 group-hover:text-primary transition-colors">{c.name}</span>
                        <span className="text-white">{c.count} Listings</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(c.count / 100) * 100}%` }}
                          className={clsx(
                            "h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]",
                            i === 0 ? "bg-primary" : i === 1 ? "bg-amber-500" : "bg-white/20"
                          )}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Alert Matrix</div>
                  <div className="text-xs text-slate-300 font-medium">Critical demand detected in <span className="text-white font-bold">Industrial Materials</span> sector.</div>
                </div>
                <Zap className="absolute top-1/2 -translate-y-1/2 -right-4 size-16 text-primary/10 group-hover:text-primary/20 transition-all pointer-events-none" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
