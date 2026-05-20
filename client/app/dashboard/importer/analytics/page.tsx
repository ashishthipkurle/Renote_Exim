"use client";

import { useEffect, useState } from "react";
import { authFetch, formatCurrency, formatNumber } from "@/lib/api-utils";
import {
  TrendingUp,
  Package,
  Globe,
  AlertTriangle,
  Download,
  Share,
  BarChart3,
  PieChart,
  Users
} from "lucide-react";

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

const PALETTE = [
  "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500",
  "bg-pink-500", "bg-cyan-500", "bg-orange-500", "bg-indigo-500"
];

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
    { k: "Total Spent", v: formatCurrency(data?.totalSpent ?? 0), tag: "All-time spending", border: "border-l-emerald-500", icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10" },
    { k: "Shipments", v: formatNumber(data?.totalShipments ?? 0), tag: `${data?.activeShipments ?? 0} active`, border: "border-l-blue-500", icon: Package, color: "text-blue-500 bg-blue-500/10" },
    { k: "Active Regions", v: formatNumber(data?.activeRegions ?? 0), tag: "Unique origins", border: "border-l-purple-500", icon: Globe, color: "text-purple-500 bg-purple-500/10" },
    { k: "Customs Holds", v: formatNumber(data?.customsHolds ?? 0), tag: data?.customsHolds ? "Action needed" : "All clear", border: data?.customsHolds ? "border-l-red-500" : "border-l-amber-500", icon: AlertTriangle, color: data?.customsHolds ? "text-red-500 bg-red-500/10" : "text-amber-500 bg-amber-500/10" },
  ];

  const maxSpend = Math.max(...(data?.monthlySpend?.map((m) => m.spent) ?? [1]), 1);

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-[#fafafa] dark:bg-background transition-colors duration-300">
      <header className="flex-shrink-0 px-6 sm:px-10 py-8 border-b border-border bg-white/50 dark:bg-background/40 backdrop-blur-xl z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Procurement Analytics</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Track spending, shipments, and supplier performance</p>
          </div>
          <button type="button" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 sm:p-10">
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((s) => (
              <div key={s.k} className={`bg-card border-t border-r border-b border-l-4 border-border ${s.border} p-6 rounded-2xl group transition-all hover:shadow-md`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-muted-foreground mb-1">{s.k}</div>
                  <div className="text-3xl font-bold text-foreground tracking-tight">{loading ? "..." : s.v}</div>
                  <div className="mt-2 text-xs font-medium text-muted-foreground">
                    {loading ? "..." : s.tag}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Main Charts Column */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Monthly Spend Chart */}
              <div className="bg-card border border-border shadow-sm rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Monthly Spending</h2>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">Procurement volume over the last year</p>
                  </div>
                </div>

                {loading ? (
                  <div className="h-56 rounded-xl bg-muted/50 border border-border animate-pulse" />
                ) : (data?.monthlySpend?.length ?? 0) === 0 ? (
                  <div className="h-56 rounded-xl bg-card border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground text-sm font-medium">
                    <BarChart3 className="w-8 h-8 mb-2 opacity-50" />
                    No spending data yet
                  </div>
                ) : (
                  <div className="flex items-end gap-3 h-56 pt-4">
                    {data!.monthlySpend.map((m) => {
                      const height = maxSpend > 0 ? Math.max((m.spent / maxSpend) * 100, 5) : 5;
                      const monthDate = new Date(m.month);
                      return (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                          <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-card border border-border px-3 py-1.5 rounded-lg text-xs font-bold text-foreground z-20 whitespace-nowrap shadow-lg">
                            {formatCurrency(m.spent)} <span className="text-muted-foreground ml-1">({m.orderCount} orders)</span>
                          </div>
                          <div className="w-full rounded-t-lg bg-blue-500/30 group-hover:bg-blue-500/60 transition-all border-t border-x border-blue-500/20" style={{ height: `${height}%` }} />
                          <span className="text-xs text-muted-foreground font-semibold">{MONTH_NAMES[monthDate.getMonth()]}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category Spending */}
              <div className="bg-card border border-border shadow-sm rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Spending by Category</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
                    ))
                  ) : !data?.categorySpending?.length ? (
                    <div className="col-span-2 py-8 flex flex-col items-center justify-center text-muted-foreground text-sm font-medium border-2 border-dashed border-border rounded-xl">
                      <PieChart className="w-8 h-8 mb-2 opacity-50" />
                      No category data
                    </div>
                  ) : (
                    data.categorySpending.map((c, i) => (
                      <div key={c.category} className="flex items-center gap-4 bg-muted/30 border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">{c.category}</div>
                          <div className="text-lg font-bold text-foreground mt-0.5">{formatCurrency(c.spent)}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-semibold text-muted-foreground">{c.orderCount} orders</div>
                          <div className="mt-2 h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${PALETTE[i % PALETTE.length]}`} style={{ width: `${(c.spent / (data?.totalSpent || 1)) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Top Suppliers */}
              <div className="bg-card border border-border shadow-sm rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                    <Users className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Top Suppliers</h2>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-14 bg-muted/50 rounded-xl animate-pulse" />
                    ))
                  ) : !data?.supplierBreakdown?.length ? (
                    <div className="py-6 flex flex-col items-center justify-center text-muted-foreground text-sm font-medium border-2 border-dashed border-border rounded-xl">
                      <Users className="w-6 h-6 mb-2 opacity-50" />
                      No supplier data
                    </div>
                  ) : (
                    data.supplierBreakdown.map((s, idx) => (
                      <div key={s.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 border border-transparent hover:border-border transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{s.name}</div>
                            <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.orderCount} orders</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-foreground">{formatCurrency(s.spent)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-card border border-border shadow-sm rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Quick Stats</h2>
                </div>

                <div className="space-y-3">
                  {loading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-12 bg-muted/50 rounded-xl animate-pulse" />
                    ))
                  ) : (
                    <>
                      <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Orders</span>
                        <span className="text-base font-bold text-foreground">{data?.totalOrders || 0}</span>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Shipments</span>
                        <span className="text-base font-bold text-foreground">{data?.activeShipments || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-card border border-border shadow-sm rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-foreground mb-6">Operations</h2>
                <div className="space-y-3">
                  <button type="button" className="w-full rounded-xl bg-primary py-2.5 px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  <button type="button" className="w-full rounded-xl border border-border bg-card hover:bg-muted py-2.5 px-4 text-sm font-bold text-foreground transition-all active:scale-95 flex items-center justify-center gap-2">
                    <Share className="w-4 h-4" />
                    Share Report
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
