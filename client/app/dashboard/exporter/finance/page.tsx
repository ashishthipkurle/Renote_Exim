"use client";

import { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
import { useTheme } from "next-themes";
import { authFetch, formatCurrency } from "@/lib/api-utils";
import {
  Download,
  History,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  Package,
  FileText,
  Search,
  Globe,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ShoppingCart,
  Layers,
  Circle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Safe useLayoutEffect that falls back to useEffect on the server
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Invoice {
  id: string;
  orderNumber: string;
  amount: number;
  status: string;
  paidAt: string | null;
  buyer: string;
}

interface FinanceData {
  role: string;
  available: number;
  pending: number;
  lastPayout: number;
  recentInvoices: Invoice[];
}

interface MonthlyPoint {
  month: string;
  revenue: number;
  orderCount: number;
}

interface AnalyticsData {
  monthlyRevenue: MonthlyPoint[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function statusCfg(status: string) {
  const s = status.toUpperCase();
  if (s === "PAID") return { label: "PAID", icon: CheckCircle2, colorClass: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
  if (s === "PENDING") return { label: "PENDING", icon: Clock, colorClass: "text-amber-600 bg-amber-500/10 border-amber-500/20" };
  if (s === "PARTIAL") return { label: "PARTIAL", icon: Layers, colorClass: "text-blue-600 bg-blue-500/10 border-blue-500/20" };
  return { label: s, icon: Circle, colorClass: "text-slate-500 bg-slate-500/10 border-slate-500/20" };
}

function fmtUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

// ─── Statement Generation (HTML for PDF) ───────────────────────────────────

function downloadAsFile(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

function buildStatementHTML(invoices: Invoice[], totalRevenue: number): string {
  const generatedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Financial Report</title>
  <style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  body{font-family:'Inter',sans-serif;background:#ffffff;color:#0f172a;padding:60px;max-width:1000px;margin:0 auto;line-height:1.6}
  .header{display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;margin-bottom:60px;padding-bottom:30px}
  .logo{font-size:24px;font-weight:700;}
  .title{font-size:32px;font-weight:700;margin:0 0 40px}
  .stats{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:60px}
  .stat-card{background:#f8fafc;padding:30px;border:1px solid #e2e8f0;border-radius:16px}
  .stat-label{font-size:12px;color:#64748b;font-weight:600;margin-bottom:8px}
  .stat-value{font-size:28px;font-weight:700;color:#0f172a}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th{text-align:left;color:#64748b;font-weight:600;padding:12px 16px;border-bottom:1px solid #e2e8f0}
  td{padding:16px;border-bottom:1px solid #f1f5f9;color:#334155}
  .right{text-align:right}
  .footer{margin-top:80px;color:#94a3b8;font-size:12px;text-align:center;}
  </style></head><body>
  <div class="header">
  <div class="logo">Ranote Exim</div>
  <div style="text-align:right;color:#64748b;font-size:12px;">Generated: ${generatedDate}</div>
  </div>
  <h1 class="title">Financial Statement</h1>
  <div class="stats">
  <div class="stat-card"><div class="stat-label">Total Revenue</div><div class="stat-value">${fmtUSD(totalRevenue)}</div></div>
  <div class="stat-card"><div class="stat-label">Paid Invoices</div><div class="stat-value">${invoices.length}</div></div>
  </div>
  <table><thead><tr><th>Invoice ID</th><th>Buyer</th><th>Date</th><th class="right">Amount</th></tr></thead><tbody>
  ${invoices.map(inv => `<tr><td>${inv.orderNumber}</td><td>${inv.buyer}</td><td>${fmtDate(inv.paidAt)}</td><td class="right font-semibold">${fmtUSD(inv.amount)}</td></tr>`).join('')}
  </tbody></table>
  <div class="footer">&copy; ${currentYear} Ranote Exim. All rights reserved.</div>
  </body></html>`;
}

// ─── Chart Component ──────────────────────────────────────────────────────────

function FinancialChart({ data, dark }: { data: MonthlyPoint[]; dark: boolean }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: MonthlyPoint } | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => { const t = setTimeout(() => setDrawn(true), 50); return () => clearTimeout(t); }, [data]);

  if (!data.length) return (
    <div className="h-[250px] flex items-center justify-center text-sm font-medium text-muted-foreground border-2 border-dashed border-border rounded-xl">
      No revenue data available
    </div>
  );

  const W = 1000, H = 300, padL = 80, padR = 40, padT = 40, padB = 60;
  const cW = W - padL - padR, cH = H - padT - padB;
  const maxV = Math.max(...data.map(d => d.revenue), 1);

  const xs = (i: number) => (i / Math.max(data.length - 1, 1)) * cW;
  const ys = (v: number) => cH - (v / maxV) * cH;

  const pts = data.map((d, i) => ({ x: xs(i), y: ys(d.revenue), d }));

  const smooth = pts.map((p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
  }).join(" ");

  const linePath = smooth;
  const areaPath = `${smooth} L${pts[pts.length - 1].x},${cH} L0,${cH} Z`;

  return (
    <div className="relative w-full group/chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block overflow-visible">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g transform={`translate(${padL},${padT})`}>
          {/* Y-Axis Grid */}
          {[0, 0.5, 1].map((t, i) => {
            const y = cH * (1 - t);
            const v = maxV * t;
            return (
              <g key={i}>
                <line x1={0} y1={y} x2={cW} y2={y} stroke="currentColor" className="text-border" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 4" />
                <text x={-20} y={y + 4} textAnchor="end" fill="currentColor" className="text-muted-foreground" fontSize="12" fontWeight="500">
                  {v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toFixed(0)}
                </text>
              </g>
            );
          })}

          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: drawn ? 1 : 0 }}
            d={areaPath}
            fill="url(#areaGrad)"
          />

          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: drawn ? 1 : 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d={linePath}
            stroke="#10b981"
            strokeWidth="3"
            fill="none"
            filter="url(#glow)"
          />

          {pts.map((p, i) => (
            <g key={i}>
              <text x={p.x} y={cH + 30} textAnchor="middle" fill="currentColor" className="text-muted-foreground" fontSize="12" fontWeight="600">
                {MONTH_SHORT[new Date(p.d.month).getMonth()]}
              </text>
              <circle cx={p.x} cy={p.y} r="25" fill="transparent" className="cursor-crosshair"
                onMouseEnter={() => setTooltip({ x: p.x + padL, y: p.y + padT, point: p.d })}
                onMouseLeave={() => setTooltip(null)}
              />
              <motion.circle
                initial={{ r: 0 }}
                animate={{ r: 5 }}
                cx={p.x} cy={p.y} fill="#10b981" stroke="currentColor" className="stroke-card" strokeWidth="2"
              />
            </g>
          ))}
        </g>
      </svg>

      {tooltip && (
        <div
          className="absolute pointer-events-none bg-card border border-border p-4 rounded-xl shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: `${(tooltip.x / W) * 100}%`,
            top: `${(tooltip.y / H) * 100}%`,
            transform: "translate(-50%, -120%)"
          }}
        >
          <div className="text-xs font-semibold text-muted-foreground mb-1">
            {MONTH_SHORT[new Date(tooltip.point.month).getMonth()]} Revenue
          </div>
          <div className="text-xl font-bold text-foreground">
            {fmtUSD(tooltip.point.revenue)}
          </div>
          <div className="text-xs font-medium text-muted-foreground mt-2 flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5" />
            {tooltip.point.orderCount} orders
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Exporter Finance Page ───────────────────────────────────────────────

export default function ExporterFinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [chartData, setChartData] = useState<MonthlyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    Promise.all([
      authFetch<FinanceData>("/api/dashboard/finance").catch(() => null),
      authFetch<AnalyticsData>("/api/dashboard/analytics").catch(() => null),
    ]).then(([fin, ana]) => {
      if (fin) setData(fin);
      if (ana?.monthlyRevenue) setChartData(ana.monthlyRevenue);
    }).finally(() => setLoading(false));
  }, []);

  const completedTotal = data?.recentInvoices?.filter(i => i.status.toUpperCase() === "PAID").reduce((s, i) => s + i.amount, 0) ?? 0;

  const filteredInvoices = (data?.recentInvoices ?? []).filter(inv => {
    if (statusFilter === "ALL") return true;
    return inv.status.toUpperCase() === statusFilter;
  });

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center bg-[#fafafa] dark:bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-xl bg-muted border border-border animate-pulse">
          <DollarSign className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Loading financial data...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-hidden flex flex-col bg-[#fafafa] dark:bg-background">
      {/* ── Header ── */}
      <header className="flex-shrink-0 px-6 sm:px-10 py-8 border-b border-border bg-white/50 dark:bg-background/40 backdrop-blur-xl z-40">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Finance Overview</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1 flex items-center gap-2">
              <span>{filteredInvoices.length} total invoices</span>
              <span className="text-border">•</span>
              <span>Updated today</span>
            </p>
          </div>
          <button
            onClick={() => {
              setDownloading(true);
              try {
                const paidInvoices = (data?.recentInvoices ?? []).filter(i => i.status.toUpperCase() === "PAID");
                if (!paidInvoices.length) {
                  alert("No completed invoices available to download.");
                  return;
                }
                const html = buildStatementHTML(paidInvoices, completedTotal);
                downloadAsFile(html, `Statement_${new Date().toISOString().slice(0, 10)}.html`);
              } finally {
                setTimeout(() => setDownloading(false), 1500);
              }
            }}
            disabled={downloading}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95"
          >
            {downloading ? <Globe className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download Statement
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { k: "Total Revenue", v: fmtUSD(data?.available || 0), sub: "Earned revenue", icon: DollarSign, ratio: ((data?.available || 0) / Math.max((data?.available || 0) + (data?.pending || 0) + completedTotal, 1)), borderClass: "border-l-emerald-500", colorClass: "text-emerald-500 bg-emerald-500/10" },
              { k: "Pending Payouts", v: fmtUSD(data?.pending || 0), sub: "Awaiting payment", icon: Clock, ratio: ((data?.pending || 0) / Math.max((data?.available || 0) + (data?.pending || 0) + completedTotal, 1)), borderClass: "border-l-amber-500", colorClass: "text-amber-500 bg-amber-500/10" },
              { k: "Paid Invoices", v: fmtUSD(completedTotal), sub: "Successfully paid", icon: ShieldCheck, ratio: (completedTotal / Math.max((data?.available || 0) + (data?.pending || 0) + completedTotal, 1)), borderClass: "border-l-blue-500", colorClass: "text-blue-500 bg-blue-500/10" },
            ].map((s) => (
              <div key={s.k} className={`bg-card border-t border-r border-b border-l-4 border-border ${s.borderClass} rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-all`}>
                <div className="flex items-start justify-between relative z-10 mb-4">
                  <div className={`p-3 rounded-xl ${s.colorClass}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-muted-foreground mb-1">{s.k}</div>
                  <div className="text-3xl font-bold text-foreground tracking-tight">{s.v}</div>
                  <div className="text-xs font-medium text-muted-foreground mt-2">{s.sub}</div>
                </div>
                <div className="mt-5 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-current opacity-50 transition-all duration-1000" style={{ width: `${Math.max(10, Math.min(s.ratio * 100, 100))}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* ── Revenue Intel Grid ── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Revenue Chart Section */}
            <div className="xl:col-span-8 bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Revenue Chart</h2>
                  <p className="text-sm font-medium text-muted-foreground mt-1">Monthly earning performance</p>
                </div>
              </div>
              <FinancialChart data={chartData} dark={false} />
            </div>

            {/* Quick Financial Summary */}
            <div className="xl:col-span-4 bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-6">Financial Summary</h3>
              <div className="space-y-4">
                {[
                  { l: 'Highest Month', v: fmtUSD(Math.max(...chartData.map(d => d.revenue), 0) || 0), i: TrendingUp, c: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
                  { l: 'Payment Rate', v: `${data?.recentInvoices?.length ? ((data.recentInvoices.filter((i: any) => i.status.toUpperCase() === 'PAID').length / data.recentInvoices.length) * 100).toFixed(1) : '100.0'}%`, i: ShieldCheck, c: "text-blue-600 bg-blue-500/10 border-blue-500/20" },
                  { l: 'Last Payment', v: fmtDate(data?.recentInvoices?.[0]?.paidAt || null), i: Clock, c: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
                ].map(item => (
                  <div key={item.l} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30">
                    <div className={`size-10 rounded-lg border flex items-center justify-center ${item.c}`}>
                      <item.i className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.l}</p>
                      <p className="text-foreground font-bold text-sm mt-0.5">{item.v}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Signature History Grid ── */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Recent Invoices</h2>
              </div>
              <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
                {["ALL", "PAID", "PENDING"].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === s
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {filteredInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="p-4 rounded-full bg-muted border-2 border-dashed border-border text-muted-foreground">
                  <FileText className="w-10 h-10" />
                </div>
                <p className="text-muted-foreground font-medium">No invoices found.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredInvoices.map((inv) => {
                  const cfg = statusCfg(inv.status);
                  const IsPaid = inv.status.toUpperCase() === "PAID";
                  return (
                    <div key={inv.id} className="p-6 sm:px-8 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
                      
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="size-12 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-foreground truncate">
                            {inv.orderNumber}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {inv.buyer}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-6 sm:gap-10">
                        <div className="text-left sm:text-right">
                          <div className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider mb-1">Date</div>
                          <div className="text-foreground font-bold text-sm">{fmtDate(inv.paidAt)}</div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider mb-1">Amount</div>
                          <div className="text-foreground font-bold text-lg">{fmtUSD(inv.amount)}</div>
                        </div>
                        
                        <div className="col-span-2 sm:col-span-1 flex items-center gap-3">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border ${cfg.colorClass}`}>
                            <cfg.icon className="w-3.5 h-3.5" />
                            {cfg.label}
                          </span>
                          
                          <button
                            onClick={() => {
                              if (!IsPaid) return;
                              const html = buildStatementHTML([inv], inv.amount);
                              downloadAsFile(html, `Invoice_${inv.orderNumber}.html`);
                            }}
                            disabled={!IsPaid}
                            title={IsPaid ? "Download Invoice" : "Invoice not ready"}
                            className={`size-10 rounded-lg flex items-center justify-center transition-all ${IsPaid
                              ? "bg-muted border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
                              : "bg-muted/50 border border-border text-muted-foreground/30 cursor-not-allowed"
                            }`}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
