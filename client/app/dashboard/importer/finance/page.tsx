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
    <div className="h-dvh overflow-hidden flex flex-col bg-[#fafafa] dark:bg-background transition-colors duration-300">
      <header className="flex-shrink-0 px-6 sm:px-10 py-8 border-b border-border bg-white/50 dark:bg-background/40 backdrop-blur-xl z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              Finance Overview
              <Wallet className="w-8 h-8 text-primary" />
            </h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Budget tracking and payment management</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.success("Generating report...")}
              className="bg-card hover:bg-muted text-foreground border border-border font-bold text-sm py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <FileText className="w-4 h-4" />
              Tax Report
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          {/* Top Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            
            {/* Total Spent */}
            <div className="bg-card border-t border-r border-b border-l-4 border-l-emerald-500 border-border shadow-sm rounded-2xl p-6 group transition-all hover:shadow-md">
              <div className="text-sm font-semibold text-muted-foreground mb-1">Total Spent</div>
              <div className="text-3xl font-bold text-foreground tracking-tight">{loading ? "..." : formatCurrency(data?.totalBalance ?? 0)}</div>
              <div className="mt-2 flex items-center gap-1.5 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 w-fit">
                <ArrowUpRight className="w-3 h-3" />
                {loading ? "..." : (() => {
                  if (!data?.spendingHistory || data.spendingHistory.length < 2) return 'First cycle';
                  const current = data.spendingHistory[data.spendingHistory.length - 1]?.amount || 0;
                  const previous = data.spendingHistory[data.spendingHistory.length - 2]?.amount || 0;
                  if (previous === 0) return 'New activity';
                  const change = ((current - previous) / previous) * 100;
                  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}% vs previous cycle`;
                })()}
              </div>
            </div>

            {/* Pending Payments */}
            <div className="bg-card border-t border-r border-b border-l-4 border-l-amber-500 border-border shadow-sm rounded-2xl p-6 group transition-all hover:shadow-md">
              <div className="text-sm font-semibold text-muted-foreground mb-1">Pending Payments</div>
              <div className="text-3xl font-bold text-foreground tracking-tight">{loading ? "..." : formatCurrency(data?.pendingPayouts ?? 0)}</div>
              <div className="mt-2 flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                Awaiting settlement
              </div>
            </div>

            {/* Tax Estimate */}
            <div className="bg-card border-t border-r border-b border-l-4 border-l-blue-500 border-border shadow-sm rounded-2xl p-6 group transition-all hover:shadow-md">
              <div className="text-sm font-semibold text-muted-foreground mb-1">Tax Estimate</div>
              <div className="text-3xl font-bold text-foreground tracking-tight">{loading ? "..." : formatCurrency(data?.estTaxLiability ?? 0)}</div>
              <div className="mt-2 flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Estimated at 10%
              </div>
            </div>

            {/* Monthly Budget */}
            <div className="bg-card border-t border-r border-b border-l-4 border-l-purple-500 border-border shadow-sm rounded-2xl p-6 group transition-all hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <div className="text-sm font-semibold text-muted-foreground">Budget Utilization</div>
                  <button
                    onClick={() => setIsBudgetModalOpen(true)}
                    className="p-1 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-3xl font-bold text-foreground tracking-tight">{loading ? "..." : formatCurrency(data?.monthlyBudget ?? 0)}</div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-muted-foreground">Current Month</span>
                  <span className={isOverBudget ? "text-red-500" : "text-foreground"}>
                    {budgetProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${isOverBudget ? "bg-red-500" : "bg-purple-500"}`}
                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Spending History Chart */}
            <section className="lg:col-span-8 bg-card border border-border shadow-sm rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Spending History
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium mt-1">Monthly spending over last 6 months</p>
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {loading ? "..." : data?.spendingHistory?.length ? `${data.spendingHistory[0].month} - ${data.spendingHistory[data.spendingHistory.length - 1].month} ${new Date().getFullYear()}` : ''}
                </div>
              </div>

              <div className="flex items-end justify-between gap-4 h-64 px-2 pb-2">
                {data?.spendingHistory.map((sh, i) => {
                  const maxAmt = Math.max(...data.spendingHistory.map(h => h.amount), 1);
                  const height = Math.max((sh.amount / maxAmt) * 100, 5); // min 5% height
                  return (
                    <div key={sh.month} className="flex-1 flex flex-col items-center gap-3 group/bar relative h-full justify-end">
                      <div className="absolute -top-8 scale-0 group-hover/bar:scale-100 transition-transform bg-foreground text-background text-xs font-bold px-3 py-1.5 rounded-lg z-20 whitespace-nowrap shadow-lg">
                        {formatCurrency(sh.amount)}
                      </div>
                      <div className="w-full relative h-[calc(100%-24px)] flex items-end">
                        <div
                          className={`w-full rounded-t-xl transition-all duration-500 ${i === 5 ? "bg-blue-500" : "bg-blue-500/30 hover:bg-blue-500/50"}`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <div className="text-xs font-semibold text-muted-foreground">{sh.month}</div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Invoices List */}
            <section className="lg:col-span-4 bg-card border border-border shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">Recent Invoices</h3>
                <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">View All</button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
                  ))
                ) : !data?.recentInvoices?.length ? (
                  <div className="h-full flex flex-col items-center justify-center py-10 opacity-50">
                    <FileText className="w-10 h-10 mb-3" />
                    <p className="text-sm font-medium">No invoices found</p>
                  </div>
                ) : (
                  data.recentInvoices.map((inv) => (
                    <div key={inv.id} className="p-4 bg-muted/30 border border-border hover:bg-muted/50 rounded-xl transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground shadow-sm">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground truncate max-w-[120px]">{inv.id}</div>
                            <div className="text-xs text-muted-foreground font-medium mt-0.5">{formatDate(inv.date)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-bold text-foreground">{formatCurrency(inv.amount)}</div>
                          <div className={`text-xs font-bold mt-0.5 ${inv.status === "PAID" ? "text-emerald-600" : "text-amber-600"}`}>
                            {inv.status}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/50 pt-3">
                        <div className="text-xs font-medium text-muted-foreground truncate max-w-[150px]">{inv.seller}</div>
                        <button
                          onClick={() => toast.success("Invoice download started...")}
                          className="size-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm active:scale-90"
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
        title="Set Monthly Budget"
      >
        <div className="space-y-6">
          <p className="text-muted-foreground text-sm font-medium">
            Set your monthly spending limit. We'll alert you when approaching this threshold.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Budget Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 text-foreground font-bold text-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm focus:border-primary/50"
                placeholder="0.00"
              />
            </div>
          </div>
          <button
            onClick={handleUpdateBudget}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            Update Budget
          </button>
        </div>
      </Modal>
    </div>
  );
}
