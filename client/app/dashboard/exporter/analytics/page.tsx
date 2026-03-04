"use client";

import { useEffect, useState } from "react";
import { authFetch, formatCurrency, formatNumber } from "@/lib/api-utils";

interface AnalyticsData {
  role: string;
  totalProducts: number;
  totalOrders: number;
  paidOrders: number;
  conversionRate: string;
  revenueByCategory: { category: string; revenue: number; orderCount: number }[];
  monthlyRevenue: { month: string; revenue: number; orderCount: number }[];
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ExporterAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<AnalyticsData>("/api/dashboard/analytics")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { k: "Product Views", v: loading ? "..." : formatNumber(data?.totalProducts ?? 0), desc: "Total listed products" },
    { k: "Leads (Orders)", v: loading ? "..." : formatNumber(data?.totalOrders ?? 0), desc: "Total orders received" },
    { k: "Conversion", v: loading ? "..." : (data?.conversionRate ?? "0%"), desc: "Paid / products ratio" },
  ];

  const maxRevenue = Math.max(...(data?.monthlyRevenue?.map((m) => m.revenue) ?? [1]), 1);

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Performance Analytics</h1>
            <p className="text-slate-400 mt-1">Listing engagement, conversions, and demand signals.</p>
          </div>
          <button type="button" className="bg-primary hover:bg-[#0f49bd] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-colors">
            Export Report
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {kpis.map((s) => (
              <div key={s.k} className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.k}</div>
                <div className="text-3xl font-black text-white mt-2">{s.v}</div>
                <div className="text-xs text-slate-500 mt-1">{s.desc}</div>
                <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[60%]" />
                </div>
              </div>
            ))}
          </div>

          {/* Monthly Revenue Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-white font-bold tracking-tight">Monthly Revenue</div>
                  <div className="text-xs text-slate-400">Last 6 months performance</div>
                </div>
              </div>
              {loading ? (
                <div className="h-56 rounded-2xl bg-slate-900/40 border border-white/5 animate-pulse" />
              ) : (data?.monthlyRevenue?.length ?? 0) === 0 ? (
                <div className="h-56 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center justify-center text-slate-500 text-sm">
                  No revenue data yet
                </div>
              ) : (
                <div className="flex items-end gap-3 h-56 pt-4">
                  {data!.monthlyRevenue.map((m) => {
                    const height = maxRevenue > 0 ? Math.max((m.revenue / maxRevenue) * 100, 5) : 5;
                    const monthDate = new Date(m.month);
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-[10px] text-primary font-bold">{formatCurrency(m.revenue)}</span>
                        <div className="w-full rounded-t-lg bg-primary/80 shadow-[0_0_10px_rgba(19,91,236,0.3)] transition-all" style={{ height: `${height}%` }} />
                        <span className="text-[10px] text-slate-500">{MONTH_NAMES[monthDate.getMonth()]}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Revenue by Category */}
            <div className="lg:col-span-4 bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
              <div className="text-white font-bold tracking-tight mb-4">Top Categories</div>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-4 bg-slate-700 rounded animate-pulse" />
                  ))}
                </div>
              ) : (data?.revenueByCategory?.length ?? 0) === 0 ? (
                <p className="text-sm text-slate-500">No category data yet</p>
              ) : (
                <div className="space-y-4">
                  {data!.revenueByCategory.slice(0, 5).map((c) => (
                    <div key={c.category}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 capitalize">{c.category.toLowerCase()}</span>
                        <span className="text-white font-bold">{formatCurrency(c.revenue)}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${maxRevenue > 0 ? Math.max((c.revenue / maxRevenue) * 100, 5) : 5}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{c.orderCount} orders</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
