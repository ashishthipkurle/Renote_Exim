"use client";

import { useEffect, useState } from "react";
import { authFetch, formatCurrency } from "@/lib/api-utils";

interface FinanceData {
  role: string;
  available: number;
  pending: number;
  lastPayout: number;
  recentInvoices: {
    id: string;
    orderNumber: string;
    amount: number;
    status: string;
    paidAt: string | null;
    buyer: string;
  }[];
}

function statusColor(status: string) {
  const s = status.toUpperCase();
  if (s === "PAID") return "bg-emerald-500/20 text-emerald-400";
  if (s === "PENDING") return "bg-amber-500/20 text-amber-400";
  if (s === "PARTIAL") return "bg-sky-500/20 text-sky-400";
  return "bg-slate-500/20 text-slate-400";
}

export default function ExporterFinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<FinanceData>("/api/dashboard/finance")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { k: "Available Balance", v: formatCurrency(data?.available ?? 0), color: "text-emerald-400" },
    { k: "Pending Payouts", v: formatCurrency(data?.pending ?? 0), color: "text-amber-400" },
    { k: "Last Payout", v: formatCurrency(data?.lastPayout ?? 0), color: "text-sky-400" },
  ];

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Finance Overview</h1>
            <p className="text-slate-400 mt-1">Revenue breakdown, payout status, and invoices.</p>
          </div>
          <button type="button" className="bg-primary hover:bg-[#0f49bd] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-colors">
            Download Statement
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {cards.map((c) => (
              <div key={c.k} className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{c.k}</div>
                <div className={`text-3xl font-black mt-2 ${loading ? "text-white" : c.color}`}>{loading ? "..." : c.v}</div>
                <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full w-[50%] ${c.color.replace("text-", "bg-")}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Chart Placeholder */}
          <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-white font-bold">Revenue Trend</div>
                <div className="text-xs text-slate-400">Monthly revenue overview</div>
              </div>
            </div>
            <div className="h-48 rounded-2xl bg-gradient-to-br from-slate-900/40 to-slate-800/20 border border-white/5 flex items-center justify-center text-slate-500 text-sm">
              Chart coming soon — use Analytics page for detailed charts
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
            <div className="text-white font-bold mb-4">Recent Invoices</div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-800/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !data?.recentInvoices?.length ? (
              <p className="text-sm text-slate-500 py-6 text-center">No invoices yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-white/5">
                      <th className="text-left pb-3 font-semibold">Order #</th>
                      <th className="text-left pb-3 font-semibold">Buyer</th>
                      <th className="text-right pb-3 font-semibold">Amount</th>
                      <th className="text-center pb-3 font-semibold">Status</th>
                      <th className="text-right pb-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.recentInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 text-white font-mono text-xs">{inv.orderNumber}</td>
                        <td className="py-3 text-slate-300">{inv.buyer}</td>
                        <td className="py-3 text-right text-white font-bold">{formatCurrency(inv.amount)}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusColor(inv.status)}`}>{inv.status}</span>
                        </td>
                        <td className="py-3 text-right text-slate-400 text-xs">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
