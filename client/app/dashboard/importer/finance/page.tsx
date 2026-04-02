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
    <div className="h-dvh overflow-hidden flex flex-col bg-background transition-colors duration-300">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-border bg-header backdrop-blur-xl z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3 uppercase italic">
              Finance Architecture
              <Wallet className="w-8 h-8 text-foreground" />
            </h1>
            <p className="text-muted-foreground mt-1 font-black text-[10px] uppercase tracking-widest leading-none">Strategic cash flow and procurement budget management.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.success("Generating report...")}
              className="bg-muted hover:bg-muted/30 text-foreground border border-border font-black text-[10px] uppercase tracking-[0.2em] py-3.5 px-8 rounded-2xl transition-all flex items-center gap-3 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              Tax intelligence
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Top Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-muted/40 backdrop-blur-xl border border-border shadow-xl rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 size-24 bg-muted/20 rounded-full blur-3xl group-hover:bg-muted/30 transition-all" />
              <div className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Procurement</div>
              <div className="text-3xl font-black text-foreground italic tracking-tighter">{loading ? "..." : formatCurrency(data?.totalBalance ?? 0)}</div>
              <div className="mt-4 flex items-center gap-2 text-foreground text-[10px] font-black uppercase tracking-widest leading-none">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +12.5% vs previous cycle
              </div>
            </div>

            <div className="bg-muted/40 backdrop-blur-xl border border-border shadow-xl rounded-3xl p-6 relative overflow-hidden group">
              <div className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-1">Uncleared Payouts</div>
              <div className="text-3xl font-black text-foreground italic tracking-tighter">{loading ? "..." : formatCurrency(data?.pendingPayouts ?? 0)}</div>
              <div className="mt-4 flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest leading-none">
                <TrendingUp className="w-3.5 h-3.5" />
                In flight payments
              </div>
            </div>

            <div className="bg-muted/40 backdrop-blur-xl border border-border shadow-xl rounded-3xl p-6 relative overflow-hidden group">
              <div className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-1">Tax Provisioning</div>
              <div className="text-3xl font-black text-foreground italic tracking-tighter">{loading ? "..." : formatCurrency(data?.estTaxLiability ?? 0)}</div>
              <div className="mt-4 flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest leading-none">
                <AlertCircle className="w-3.5 h-3.5" />
                Node calculation: 10%
              </div>
            </div>

            {/* Budget Tracker Card */}
            <div className="bg-muted/40 backdrop-blur-xl border border-border shadow-xl rounded-3xl p-6 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-1">
                <div className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Procurement Budget</div>
                <button
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="p-1 rounded-lg bg-primary text-primary-foreground border-transparent hover:scale-110 transition-transform shadow-xl shadow-primary/5"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-3xl font-black text-foreground italic tracking-tighter">{loading ? "..." : formatCurrency(data?.monthlyBudget ?? 0)}</div>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Resource Utilization</span>
                  <span className={isOverBudget ? "text-foreground" : "text-foreground"}>
                    {budgetProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full transition-all duration-1000 ${isOverBudget ? "bg-white opacity-40" : "bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"}`}
                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Spending Chart */}
            <section className="lg:col-span-8 bg-muted/40 backdrop-blur-xl border border-border shadow-xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-xl font-black text-foreground flex items-center gap-3 uppercase italic">
                    Spend Trajectory
                    <BarChart3 className="w-5 h-5 text-foreground" />
                  </h3>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">Validated transactions across the last 6 fiscal cycles.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-muted/20 border border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5" />
                  JAN 2026 - JUN 2026
                </div>
              </div>
 
              <div className="flex items-end justify-between gap-4 h-64 px-4 pb-4">
                {data?.spendingHistory.map((sh, i) => {
                  const maxAmt = Math.max(...data.spendingHistory.map(h => h.amount), 1);
                  const height = (sh.amount / maxAmt) * 100;
                  return (
                    <div key={sh.month} className="flex-1 flex flex-col items-center gap-6 group/bar">
                      <div className="w-full relative">
                        <div
                          className={`w-full rounded-t-xl transition-all duration-1000 ${i === 5 ? "bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]" : "bg-muted/30 hover:bg-white/30"}`}
                          style={{ height: `${height}%` }}
                        />
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-transparent text-[9px] font-black px-3 py-1.5 rounded opacity-0 group-hover/bar:opacity-100 transition-all uppercase tracking-widest z-20 shadow-2xl">
                          {formatCurrency(sh.amount)}
                        </div>
                      </div>
                      <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter">{sh.month}</div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Invoices List */}
            <section className="lg:col-span-4 bg-muted/40 backdrop-blur-xl border border-border shadow-xl rounded-3xl p-8 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-foreground uppercase italic">Ledger</h3>
                <button className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-foreground transition-colors">Audit All</button>
              </div>
 
              <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar">
                {loading ? (
                   Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted/20 rounded-2xl animate-pulse" />
                  ))
                ) : !data?.recentInvoices?.length ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 opacity-20">
                    <FileText className="w-12 h-12 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-center">Protocol Empty</p>
                  </div>
                ) : (
                  data.recentInvoices.map((inv) => (
                    <div key={inv.id} className="group p-5 bg-muted/20 border border-border hover:border-border rounded-2xl transition-all shadow-xl">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-all shadow-xl">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-foreground font-mono uppercase truncate max-w-[120px] italic tracking-tighter">{inv.id}</div>
                            <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{formatDate(inv.date)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-foreground tracking-tighter">{formatCurrency(inv.amount)}</div>
                          <div className={`text-[9px] font-black uppercase tracking-widest mt-1 ${inv.status === "PAID" ? "text-foreground" : "text-muted-foreground/40"}`}>
                            {inv.status}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-4">
                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest truncate max-w-[150px]">{inv.seller}</div>
                        <button
                          onClick={() => toast.success("Invoice download started...")}
                          className="size-8 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-white hover:text-black transition-all shadow-xl active:scale-90"
                        >
                          <Download className="w-3.5 h-3.5" />
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
        title="Protocol Configuration"
      >
        <div className="space-y-6">
          <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter shadow-[0_0_20px_rgba(255,255,255,0.1)]">Resource Node Integration</h3>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">
            Initialize global payment protocols and liquidity bridges.
          </p>
          <p className="text-muted-foreground text-sm">
            We'll alert you when your confirmed payments approach this threshold.
          </p>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Liquid Limit (USD)</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground font-black">$</span>
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="w-full bg-muted border border-border rounded-2xl py-5 pl-12 pr-6 text-foreground font-black text-xl italic focus:ring-1 focus:ring-white/20 outline-none transition-all shadow-2xl"
                placeholder="0.00"
              />
            </div>
          </div>
          <button
            onClick={handleUpdateBudget}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-transparent font-black py-4 rounded-2xl shadow-xl shadow-primary/5 transition-all active:scale-95 border border-border"
          >
            Update Budget Strategy
          </button>
        </div>
      </Modal>
    </div>
  );
}
