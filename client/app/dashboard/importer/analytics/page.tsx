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
    <div className="h-dvh overflow-hidden flex flex-col bg-background transition-colors duration-300">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-border bg-header backdrop-blur-xl z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">Trade Intelligence Node</h1>
            <p className="text-muted-foreground mt-1 font-black text-[10px] uppercase tracking-widest leading-none">Deep insights into procurement performance and supply chain metrics.</p>
          </div>
          <button type="button" className="bg-primary hover:bg-primary/90 text-primary-foreground border-transparent font-black text-[10px] uppercase tracking-[0.2em] py-3 px-8 rounded-xl shadow-xl shadow-primary/5 border border-border transition-all active:scale-95">
            Export Dataset
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((s) => (
              <div key={s.k} className="bg-muted/40 backdrop-blur-xl border border-border shadow-xl p-6 rounded-2xl group transition-all hover:bg-muted/60">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{s.k}</div>
                <div className="mt-3 text-2xl font-black text-foreground tracking-tighter italic">{loading ? "..." : s.v}</div>
                <div className="mt-4 inline-flex text-[9px] font-black px-2 py-1 rounded-full bg-muted/20 border border-border text-foreground uppercase tracking-widest">
                  {loading ? "..." : s.tag}
                </div>
                <div className="mt-6 h-1 w-full bg-muted/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[60%]" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Spend Chart */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-muted/40 backdrop-blur-xl border border-border shadow-xl rounded-2xl p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="text-foreground font-black uppercase tracking-widest italic leading-none">Procurement Trends</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Monthly breakdown of trading volume</div>
                  </div>
                </div>
                {loading ? (
                  <div className="h-56 rounded-3xl bg-muted/20 border border-border animate-pulse shadow-inner" />
                ) : (data?.monthlySpend?.length ?? 0) === 0 ? (
                  <div className="h-56 rounded-3xl bg-muted/10 border border-border flex items-center justify-center text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] italic opacity-30 shadow-inner">
                    SIGNAL TRACE INDETERMINATE
                  </div>
                ) : (
                  <div className="flex items-end gap-3 h-56 pt-4">
                    {data!.monthlySpend.map((m) => {
                      const height = maxSpend > 0 ? Math.max((m.spent / maxSpend) * 100, 5) : 5;
                      const monthDate = new Date(m.month);
                      return (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                          <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-white px-2 py-1 rounded text-[9px] font-black text-black z-20 whitespace-nowrap shadow-2xl uppercase tracking-widest">
                            {formatCurrency(m.spent)} · {m.orderCount} LOGS
                          </div>
                          <div className="w-full rounded-t-lg bg-white/20 group-hover:bg-white/60 transition-all shadow-xl" style={{ height: `${height}%` }} />
                          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{MONTH_NAMES[monthDate.getMonth()]}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

               <div className="bg-muted/40 backdrop-blur-xl border border-border shadow-xl rounded-2xl p-6">
                <div className="text-foreground font-black uppercase tracking-widest italic leading-none mb-8">Asset Categorization Node</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-16 bg-muted/20 rounded-xl animate-pulse" />
                    ))
                  ) : !data?.categorySpending?.length ? (
                    <div className="col-span-2 py-8 text-center text-muted-foreground text-[10px] font-black uppercase tracking-widest">Metadata vacant</div>
                  ) : (
                    data.categorySpending.map((c) => (
                      <div key={c.category} className="flex items-center gap-4 bg-muted/20 border border-border rounded-xl p-4 group hover:bg-muted/30 transition-all">
                        <div className="flex-1">
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{c.category}</div>
                          <div className="text-lg font-black text-foreground mt-0.5 italic tracking-tighter">{formatCurrency(c.spent)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black text-foreground uppercase tracking-tighter">{c.orderCount} Orders</div>
                          <div className="mt-2 h-1 w-20 bg-muted/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" style={{ width: `${(c.spent / (data?.totalSpent || 1)) * 100}%` }} />
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
              <div className="bg-muted/40 backdrop-blur-xl border border-border shadow-xl rounded-2xl p-6">
                <div className="text-foreground font-black uppercase tracking-widest italic leading-none mb-6">Top Resource Nodes</div>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-12 bg-muted/20 rounded-xl animate-pulse" />
                    ))
                  ) : !data?.supplierBreakdown?.length ? (
                    <div className="py-4 text-center text-muted-foreground text-[10px] font-black uppercase tracking-widest">Supplier logs vacant</div>
                  ) : (
                    data.supplierBreakdown.map((s, idx) => (
                      <div key={s.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="text-[10px] font-black text-muted-foreground/40">#{idx + 1}</div>
                          <div>
                            <div className="text-xs font-black text-foreground group-hover:text-muted-foreground transition-all uppercase tracking-tighter italic">{s.name}</div>
                            <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{s.orderCount} Transactions Verified</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-foreground tracking-tighter">{formatCurrency(s.spent)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-muted/40 backdrop-blur-xl border border-border shadow-xl rounded-2xl p-6">
                <div className="text-foreground font-black uppercase tracking-widest italic leading-none mb-6">Intelligence Protocol</div>
                <div className="space-y-3">
                  {loading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-10 bg-muted/20 rounded-xl animate-pulse" />
                    ))
                  ) : (
                    <>
                      <div className="rounded-xl border border-border bg-muted/20 p-4 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Cumulative Assets</span>
                        <span className="text-foreground font-black italic tracking-tighter">{data?.totalOrders || 0}</span>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/20 p-4 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Active Stream</span>
                        <span className="text-foreground font-black italic tracking-tighter">{data?.activeShipments || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-muted/20 border border-border shadow-xl rounded-2xl p-6">
                <div className="text-foreground font-black uppercase tracking-widest italic leading-none mb-6">Node Operations</div>
                <div className="space-y-3">
                  <button type="button" className="w-full rounded-xl bg-white py-3 text-[10px] font-black text-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 active:scale-95">
                    Export Intelligence
                  </button>
                  <button type="button" className="w-full rounded-xl border border-border bg-muted/20 py-3 text-[10px] font-black text-foreground hover:bg-muted/30 uppercase tracking-[0.2em] transition-all active:scale-95">
                    Broadcast Node
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
