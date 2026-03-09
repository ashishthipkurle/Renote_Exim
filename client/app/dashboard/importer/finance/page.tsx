"use client";

import { useEffect, useState } from "react";
import {
  authFetch,
  formatCurrency,
  formatDate
} from "@/lib/api-utils";
import {
  CreditCard,
  TrendingUp,
  Download,
  Plus,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  BarChart3,
  Calendar,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";

interface FinanceData {
  totalBalance: number;
  pendingPayouts: number;
  estTaxLiability: number;
  monthlyBudget: number;
  currentMonthSpending: number;
  spendingHistory: { month: string; amount: number }[];
  recentInvoices: {
    id: string;
    amount: number;
    status: string;
    product: string;
    seller: string;
    date: string;
  }[];
}

export default function ImporterFinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await authFetch<FinanceData>("/api/dashboard/finance");
      setData(res);
      setNewBudget(res.monthlyBudget.toString());
    } catch {
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount)) return toast.error("Invalid amount");

    try {
      await authFetch("/api/dashboard/finance", {
        method: "PUT",
        body: JSON.stringify({ monthlyBudget: amount }),
      });
      toast.success("Budget updated");
      setIsBudgetModalOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to update budget");
    }
  };

  const budgetProgress = data?.monthlyBudget ? (data.currentMonthSpending / data.monthlyBudget) * 100 : 0;
  const isOverBudget = budgetProgress > 100;

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Finance Hub
              <Wallet className="w-8 h-8 text-primary" />
            </h1>
            <p className="text-slate-400 mt-1">Strategic cash flow and procurement budget management.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.success("Generating report...")}
              className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold py-3 px-6 rounded-2xl transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Tax Statement
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Top Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 size-24 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Procurement</div>
              <div className="text-3xl font-black text-white">{loading ? "..." : formatCurrency(data?.totalBalance ?? 0)}</div>
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <ArrowUpRight className="w-3 h-3" />
                +12.5% from last month
              </div>
            </div>

            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-3xl p-6 relative overflow-hidden group">
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Uncleared Payouts</div>
              <div className="text-3xl font-black text-amber-400">{loading ? "..." : formatCurrency(data?.pendingPayouts ?? 0)}</div>
              <div className="mt-4 flex items-center gap-2 text-slate-500 text-xs font-bold">
                <TrendingUp className="w-3 h-3" />
                In flight payments
              </div>
            </div>

            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-3xl p-6 relative overflow-hidden group">
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Tax Provisioning</div>
              <div className="text-3xl font-black text-rose-400">{loading ? "..." : formatCurrency(data?.estTaxLiability ?? 0)}</div>
              <div className="mt-4 flex items-center gap-2 text-slate-500 text-xs font-bold">
                <AlertCircle className="w-3 h-3" />
                Based on 10% estimation
              </div>
            </div>

            {/* Budget Tracker Card */}
            <div className="bg-primary/10 backdrop-blur-xl border border-primary/20 shadow-xl rounded-3xl p-6 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-1">
                <div className="text-primary text-[10px] font-black uppercase tracking-widest">Monthly Budget</div>
                <button
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="p-1 rounded-lg bg-primary text-white hover:scale-110 transition-transform"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="text-3xl font-black text-white">{loading ? "..." : formatCurrency(data?.monthlyBudget ?? 0)}</div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400">Usage Progress</span>
                  <span className={isOverBudget ? "text-rose-400" : "text-primary"}>
                    {budgetProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full transition-all duration-1000 ${isOverBudget ? "bg-rose-500" : "bg-primary"}`}
                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Spending Chart */}
            <section className="lg:col-span-8 bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-3">
                    Spending Trajectory
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">Confirmed payments across the last 6 fiscal months.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Jan 2026 - Jun 2026
                </div>
              </div>

              <div className="flex items-end justify-between gap-4 h-64 px-4">
                {data?.spendingHistory.map((sh, i) => {
                  const maxAmt = Math.max(...data.spendingHistory.map(h => h.amount), 1);
                  const height = (sh.amount / maxAmt) * 100;
                  return (
                    <div key={sh.month} className="flex-1 flex flex-col items-center gap-4 group/bar">
                      <div className="w-full relative">
                        <div
                          className={`w-full rounded-t-xl transition-all duration-700 bg-gradient-to-t ${i === 5 ? "from-primary/20 to-primary shadow-[0_0_20px_rgba(37,99,235,0.2)]" : "from-slate-800 to-slate-700 hover:to-slate-600"}`}
                          style={{ height: `${height}%` }}
                        />
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                          {formatCurrency(sh.amount)}
                        </div>
                      </div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{sh.month}</div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Invoices List */}
            <section className="lg:col-span-4 bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-3xl p-8 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white">Invoices</h3>
                <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All</button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-800/40 rounded-2xl animate-pulse" />
                  ))
                ) : !data?.recentInvoices?.length ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 opacity-20">
                    <FileText className="w-12 h-12 mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest text-center">No Data Available</p>
                  </div>
                ) : (
                  data.recentInvoices.map((inv) => (
                    <div key={inv.id} className="group p-4 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl transition-all">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-white font-mono uppercase truncate max-w-[120px]">{inv.id}</div>
                            <div className="text-[10px] text-slate-500 font-bold">{formatDate(inv.date)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-white">{formatCurrency(inv.amount)}</div>
                          <div className={`text-[8px] font-black uppercase tracking-widest ${inv.status === "PAID" ? "text-emerald-400" : "text-amber-400"}`}>
                            {inv.status}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="text-[10px] text-slate-500 font-bold truncate max-w-[150px]">{inv.seller}</div>
                        <button
                          onClick={() => toast.success("Invoice download started...")}
                          className="size-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Budget Modal */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title="Set Procurement Budget"
      >
        <div className="space-y-6">
          <p className="text-slate-400 text-sm">
            Define your monthly expenditure limit. We'll alert you when your confirmed payments approach this threshold.
          </p>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Monthly Limit (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-white font-black focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>
          <button
            onClick={handleUpdateBudget}
            className="w-full bg-primary hover:bg-[#0f49bd] text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
          >
            Update Budget Strategy
          </button>
        </div>
      </Modal>
    </div>
  );
}
