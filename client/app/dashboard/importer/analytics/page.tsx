"use client";

import { useEffect, useState } from "react";
import { authFetch, formatCurrency, formatNumber } from "@/lib/api-utils";

interface AnalyticsData {
  role: string;
  totalOrders: number;
  totalShipments: number;
  activeShipments: number;
  customsHolds: number;
  totalSpent: number;
  activeRegions: number;
  monthlySpend: { month: string; spent: number; orderCount: number }[];
  supplierBreakdown: { name: string; spent: number; orderCount: number }[];
  categorySpending: { category: string; spent: number; orderCount: number }[];
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ImporterAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<AnalyticsData>("/api/dashboard/analytics")
      .then(setData)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { k: "Total Spent", v: formatCurrency(data?.totalSpent ?? 0), tag: "Lifetime" },
    { k: "Shipments", v: formatNumber(data?.totalShipments ?? 0), tag: `${data?.activeShipments ?? 0} active` },
    { k: "Active Regions", v: formatNumber(data?.activeRegions ?? 0), tag: "Unique origins" },
    { k: "Customs Holds", v: formatNumber(data?.customsHolds ?? 0), tag: data?.customsHolds ? "Action needed" : "All clear" },
  ];

  const maxSpend = Math.max(...(data?.monthlySpend?.map((m) => m.spent) ?? [1]), 1);

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Advanced Trade Analytics</h1>
            <p className="text-slate-400 mt-1">Deep insights into your import performance and supply chain metrics.</p>
          </div>
          <button type="button" className="bg-primary hover:bg-[#0f49bd] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-colors">
            Export Report
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((s) => (
              <div key={s.k} className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl p-6 rounded-2xl">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.k}</div>
                <div className="mt-2 text-2xl font-black text-white">{loading ? "..." : s.v}</div>
                <div className="mt-3 inline-flex text-xs font-bold px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  {loading ? "..." : s.tag}
                </div>
                <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[60%]" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Spend Chart */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-white font-bold tracking-tight">Spending Trends</div>
                    <div className="text-xs text-slate-400">Monthly breakdown of trading volume</div>
                  </div>
                </div>
                {loading ? (
                  <div className="h-56 rounded-2xl bg-slate-900/40 border border-white/5 animate-pulse" />
                ) : (data?.monthlySpend?.length ?? 0) === 0 ? (
                  <div className="h-56 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center justify-center text-slate-500 text-sm">
                    No spending data yet
                  </div>
                ) : (
                  <div className="flex items-end gap-3 h-56 pt-4">
                    {data!.monthlySpend.map((m) => {
                      const height = maxSpend > 0 ? Math.max((m.spent / maxSpend) * 100, 5) : 5;
                      const monthDate = new Date(m.month);
                      return (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                          <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-primary px-2 py-1 rounded text-[10px] font-bold text-white z-10 whitespace-nowrap shadow-xl">
                            {formatCurrency(m.spent)} · {m.orderCount} orders
                          </div>
                          <div className="w-full rounded-t-lg bg-primary/40 group-hover:bg-primary/80 shadow-[0_0_10px_rgba(0,240,255,0.1)] transition-all" style={{ height: `${height}%` }} />
                          <span className="text-[10px] text-slate-500">{MONTH_NAMES[monthDate.getMonth()]}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category Breakdown */}
              <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
                <div className="text-white font-bold tracking-tight mb-6">Cost Analysis by Category</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-16 bg-slate-800/40 rounded-xl animate-pulse" />
                    ))
                  ) : !data?.categorySpending?.length ? (
                    <div className="col-span-2 py-8 text-center text-slate-500 text-sm">No category data</div>
                  ) : (
                    data.categorySpending.map((c) => (
                      <div key={c.category} className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-xl p-4">
                        <div className="flex-1">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{c.category}</div>
                          <div className="text-lg font-black text-white mt-0.5">{formatCurrency(c.spent)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-primary">{c.orderCount} Orders</div>
                          <div className="mt-1 h-1 w-20 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${(c.spent / (data?.totalSpent || 1)) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
                <div className="text-white font-bold tracking-tight">Top Suppliers</div>
                <div className="mt-4 space-y-3">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-12 bg-slate-800/40 rounded-xl animate-pulse" />
                    ))
                  ) : !data?.supplierBreakdown?.length ? (
                    <div className="py-4 text-center text-slate-500 text-xs">No supplier data</div>
                  ) : (
                    data.supplierBreakdown.map((s, idx) => (
                      <div key={s.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="text-xs font-bold text-slate-500">#{idx + 1}</div>
                          <div>
                            <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{s.name}</div>
                            <div className="text-[10px] text-slate-500">{s.orderCount} orders placed</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-white">{formatCurrency(s.spent)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
                <div className="text-white font-bold tracking-tight">Trade Highlights</div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  {loading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-10 bg-slate-800 rounded-xl animate-pulse" />
                    ))
                  ) : (
                    <>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-bold uppercase">Total Orders</span>
                        <span className="text-white font-black">{data?.totalOrders || 0}</span>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-bold uppercase">In Transit</span>
                        <span className="text-primary font-black">{data?.activeShipments || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
                <div className="text-white font-bold tracking-tight">Actions</div>
                <div className="mt-4 space-y-2">
                  <button type="button" className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-[#0f49bd]">
                    Export Report
                  </button>
                  <button type="button" className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-slate-200 hover:bg-white/10">
                    Share Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
