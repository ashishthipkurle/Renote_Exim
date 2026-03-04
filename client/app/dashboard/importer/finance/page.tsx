"use client";

import { useEffect, useState } from "react";
import { authFetch, formatCurrency } from "@/lib/api-utils";

interface FinanceData {
  role: string;
  totalBalance: number;
  pendingPayouts: number;
  estTaxLiability: number;
  recentInvoices: {
    id: string;
    orderNumber: string;
    amount: number;
    status: string;
    paidAt: string | null;
    seller: string;
  }[];
}

function statusColor(status: string) {
  const s = status.toUpperCase();
  if (s === "PAID") return "bg-emerald-500/20 text-emerald-400";
  if (s === "PENDING") return "bg-amber-500/20 text-amber-400";
  if (s === "PARTIAL") return "bg-sky-500/20 text-sky-400";
  return "bg-slate-500/20 text-slate-400";
}

export default function ImporterFinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<FinanceData>("/api/dashboard/finance")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { k: "Total Balance", v: formatCurrency(data?.totalBalance ?? 0), color: "text-white" },
    { k: "Pending Payouts", v: formatCurrency(data?.pendingPayouts ?? 0), color: "text-amber-400" },
    { k: "Est. Tax Liability", v: formatCurrency(data?.estTaxLiability ?? 0), color: "text-rose-400" },
  ];

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Finance Hub</h1>
            <p className="text-slate-400 mt-1">Manage payments, cash flow, and tax estimates.</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-bold py-2.5 px-6 rounded-xl transition-colors">
              Export Report
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((c) => (
              <div key={c.k} className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">{c.k}</div>
                <div className={`text-3xl font-black mt-2 ${loading ? "text-white" : c.color}`}>{loading ? "..." : c.v}</div>
                <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[55%]" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cash Flow Chart Placeholder */}
            <section className="lg:col-span-8 bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 min-h-[360px]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-lg font-bold text-white">Cash Flow Analysis</div>
                  <div className="text-xs text-slate-400">Income vs Expenses — use Analytics for full charts</div>
                </div>
              </div>
              <div className="h-56 rounded-2xl bg-gradient-to-br from-slate-900/40 to-slate-800/20 border border-white/5 flex items-center justify-center text-slate-500 text-sm">
                Detailed charts available in Analytics
              </div>
            </section>

            {/* Recent Invoices */}
            <section className="lg:col-span-4 space-y-6">
              <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
                <div className="text-white font-bold tracking-tight">Recent Invoices</div>
                <div className="mt-4 space-y-3">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-14 bg-slate-800/50 rounded-xl animate-pulse" />
                    ))
                  ) : !data?.recentInvoices?.length ? (
                    <p className="text-sm text-slate-500 text-center py-4">No invoices yet</p>
                  ) : (
                    data.recentInvoices.map((inv) => (
                      <div key={inv.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between">
                        <div>
                          <div className="text-white text-sm font-bold">{inv.orderNumber}</div>
                          <div className="text-slate-400 text-xs flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${statusColor(inv.status)}`}>{inv.status}</span>
                            <span>{inv.seller}</span>
                          </div>
                        </div>
                        <div className="text-white font-black text-sm">{formatCurrency(inv.amount)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
