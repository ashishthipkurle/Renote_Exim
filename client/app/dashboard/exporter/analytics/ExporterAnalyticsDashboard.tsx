"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Package, ShoppingCart, Globe,
  DollarSign, Download, RefreshCw, Filter, ChevronDown,
  ArrowUpRight, ArrowDownRight, BarChart2, Activity,
  CreditCard, Truck, CheckCircle2, Clock, XCircle, AlertCircle,
  Layers,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  avgOrderValue: number;
  conversionRate: string;
  revenueGrowth: number;
  orderGrowth: number;
  totalProducts: number;
  availableProducts: number;
  monthlyRevenue: { month: string; revenue: number; orderCount: number }[];
  revenueByCategory: { category: string; revenue: number; orderCount: number }[];
  topProducts: { id: string; name: string; category: string; revenue: number; orderCount: number }[];
  geographicData: { country: string; orderCount: number; revenue: number }[];
  paymentBreakdown: { PAID: number; PENDING: number; FAILED: number; REFUNDED: number };
  paidRevenue: number;
  pendingRevenue: number;
  orderStatusBreakdown: {
    PENDING: number; CONFIRMED: number; PROCESSING: number;
    SHIPPED: number; DELIVERED: number; CANCELLED: number;
  };
  shipmentBreakdown: {
    PREPARING: number; IN_TRANSIT: number; CUSTOMS: number;
    OUT_FOR_DELIVERY: number; DELIVERED: number; RETURNED: number;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TIMEFRAMES = ["1M","3M","6M","1Y","ALL"] as const;
type Timeframe = typeof TIMEFRAMES[number];

const PALETTE = [
  "#135bec","#34d399","#d4af37","#22d3ee","#a78bfa","#fb7185","#f97316","#84cc16","#e879f9",
];

const CATEGORY_LABELS: Record<string, string> = {
  CHEMICALS: "Chemicals", MACHINES: "Machines", TEXTILES: "Textiles",
  MEDICAL: "Medical", HANDICRAFTS: "Handicrafts", FOOD: "Food",
  ELECTRONICS: "Electronics", AUTOMOTIVE: "Automotive",
  CONSTRUCTION: "Construction", AGRICULTURE: "Agriculture", OTHER: "Other",
};

// ─── Formatters ───────────────────────────────────────────────────────────────

function fCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
function fNum(n: number) { return new Intl.NumberFormat("en-US").format(n); }
function fMonth(iso: string) {
  const d = new Date(iso + "-01");
  return `${MONTH_NAMES[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}

// ─── Shared Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0e1420] border border-white/10 rounded-xl px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur-xl">
      <p className="text-[11px] text-slate-500 mb-2 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs font-bold">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400 capitalize">{p.name}:</span>
          <span style={{ color: p.color }}>
            {p.name === "revenue" || p.name === "Revenue" || p.name === "paidRevenue"
              ? fCurrency(p.value)
              : fNum(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyChart({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
      <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5">
        <Icon className="w-8 h-8 text-slate-600" />
      </div>
      <p className="text-slate-500 text-sm text-center max-w-[200px]">{message}</p>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, trend, accentColor, icon: Icon, glowColor,
}: {
  label: string; value: string; sub: string; trend?: number;
  accentColor: string; icon: React.ElementType; glowColor: string;
}) {
  const isPositive = (trend ?? 0) >= 0;
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0e1420] p-6 transition-all duration-300 hover:scale-[1.02] hover:border-white/10 group cursor-default"
      style={{ boxShadow: `0 0 0 0 ${glowColor}`, transition: "box-shadow 0.3s" }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 40px -8px ${glowColor}40`)}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Background glow blob */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{ background: glowColor }}
      />
      {/* Top row */}
      <div className="flex items-start justify-between relative">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <div
          className="p-2.5 rounded-xl border transition-colors"
          style={{ background: `${glowColor}15`, borderColor: `${glowColor}30` }}
        >
          <Icon className="w-4 h-4" style={{ color: glowColor }} />
        </div>
      </div>
      {/* Value */}
      <p className="text-3xl font-black mt-3 tracking-tight" style={{ color: accentColor }}>
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
      {/* Trend badge */}
      {trend !== undefined && (
        <div
          className={`mt-3 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg ${
            isPositive
              ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
              : "text-red-400 bg-red-400/10 border border-red-400/20"
          }`}
        >
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}% vs last 30 days
        </div>
      )}
      {/* Bottom bar */}
      <div className="mt-4 h-[2px] w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full w-3/4"
          style={{ background: `linear-gradient(90deg, ${glowColor}, ${glowColor}40)` }}
        />
      </div>
    </div>
  );
}

// ─── Section Card wrapper ─────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/5 bg-[#0e1420] p-6 transition-all duration-200 hover:border-white/10 ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <p className="text-white font-bold tracking-tight">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function ExporterAnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const [timeframe, setTimeframe] = useState<Timeframe>("6M");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [chartMode, setChartMode] = useState<"area" | "bar">("area");
  const [activeMetric, setActiveMetric] = useState<"revenue" | "orderCount">("revenue");
  const dashboardRef = useRef<HTMLDivElement>(null);

  // ── Categories available in data ─────────────────────────────────────────
  const availableCategories = useMemo(
    () => ["ALL", ...data.revenueByCategory.map((c) => c.category)],
    [data.revenueByCategory]
  );

  // ── Filter monthly data by timeframe ─────────────────────────────────────
  const filteredMonthly = useMemo(() => {
    const all = data.monthlyRevenue;
    const sliceMap: Record<Timeframe, number> = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12, ALL: all.length };
    return all.slice(-Math.min(sliceMap[timeframe], all.length)).map((m) => ({
      ...m,
      label: fMonth(m.month),
    }));
  }, [data.monthlyRevenue, timeframe]);

  // ── Filter categories ─────────────────────────────────────────────────────
  const filteredCategories = useMemo(() => {
    if (categoryFilter === "ALL") return data.revenueByCategory;
    return data.revenueByCategory.filter((c) => c.category === categoryFilter);
  }, [data.revenueByCategory, categoryFilter]);

  // ── Payment donut data ────────────────────────────────────────────────────
  const paymentDonutData = useMemo(
    () => [
      { name: "Paid", value: data.paymentBreakdown.PAID, color: "#34d399" },
      { name: "Pending", value: data.paymentBreakdown.PENDING, color: "#d4af37" },
      { name: "Failed", value: data.paymentBreakdown.FAILED, color: "#fb7185" },
      { name: "Refunded", value: data.paymentBreakdown.REFUNDED, color: "#a78bfa" },
    ].filter((d) => d.value > 0),
    [data.paymentBreakdown]
  );

  // ── Order status radial data ──────────────────────────────────────────────
  const orderStatusData = useMemo(
    () => [
      { name: "Delivered", value: data.orderStatusBreakdown.DELIVERED, fill: "#34d399" },
      { name: "Shipped", value: data.orderStatusBreakdown.SHIPPED, fill: "#22d3ee" },
      { name: "Processing", value: data.orderStatusBreakdown.PROCESSING, fill: "#a78bfa" },
      { name: "Confirmed", value: data.orderStatusBreakdown.CONFIRMED, fill: "#135bec" },
      { name: "Pending", value: data.orderStatusBreakdown.PENDING, fill: "#d4af37" },
      { name: "Cancelled", value: data.orderStatusBreakdown.CANCELLED, fill: "#fb7185" },
    ].filter((d) => d.value > 0),
    [data.orderStatusBreakdown]
  );

  const maxGeo = Math.max(...data.geographicData.map((g) => g.revenue), 1);

  // ── Export: print/PDF ─────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const printStyles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #0a0c12; color: white; padding: 40px; }
        .page-title { font-size: 28px; font-weight: 900; margin-bottom: 8px; }
        .page-sub { font-size: 14px; color: #64748b; margin-bottom: 32px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .kpi-card { background: #151c2a; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; }
        .kpi-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
        .kpi-value { font-size: 28px; font-weight: 900; margin-top: 8px; }
        .kpi-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
        .section { background: #151c2a; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .section-title { font-size: 15px; font-weight: 700; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; padding: 8px 12px; }
        td { padding: 10px 12px; font-size: 13px; border-top: 1px solid rgba(255,255,255,0.05); color: #cbd5e1; }
        .pill { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
        .pill-green { background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
        .pill-blue { background: rgba(19,91,236,0.1); color: #135bec; border: 1px solid rgba(19,91,236,0.2); }
      </style>
    `;

    const rows = {
      topProducts: data.topProducts
        .map(
          (p, i) =>
            `<tr><td>${i + 1}. ${p.name}</td><td>${CATEGORY_LABELS[p.category] ?? p.category}</td><td>${p.orderCount}</td><td style="color:#34d399;font-weight:700">${fCurrency(p.revenue)}</td></tr>`
        )
        .join(""),
      geo: data.geographicData
        .map(
          (g) =>
            `<tr><td>${g.country}</td><td>${g.orderCount}</td><td style="color:#34d399;font-weight:700">${fCurrency(g.revenue)}</td></tr>`
        )
        .join(""),
      monthly: data.monthlyRevenue
        .map(
          (m) =>
            `<tr><td>${fMonth(m.month)}</td><td>${m.orderCount}</td><td style="color:#135bec;font-weight:700">${fCurrency(m.revenue)}</td></tr>`
        )
        .join(""),
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Exporter Analytics Report</title>${printStyles}</head>
      <body>
        <div class="page-title">📊 Exporter Analytics Report</div>
        <div class="page-sub">Generated on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>

        <div class="kpi-grid">
          <div class="kpi-card"><div class="kpi-label">Total Revenue</div><div class="kpi-value" style="color:#135bec">${fCurrency(data.totalRevenue)}</div><div class="kpi-sub">All-time earnings</div></div>
          <div class="kpi-card"><div class="kpi-label">Total Orders</div><div class="kpi-value" style="color:#34d399">${fNum(data.totalOrders)}</div><div class="kpi-sub">${data.paidOrders} paid</div></div>
          <div class="kpi-card"><div class="kpi-label">Avg. Order Value</div><div class="kpi-value" style="color:#d4af37">${fCurrency(data.avgOrderValue)}</div><div class="kpi-sub">Per transaction</div></div>
          <div class="kpi-card"><div class="kpi-label">Products Listed</div><div class="kpi-value" style="color:#a78bfa">${fNum(data.totalProducts)}</div><div class="kpi-sub">${data.availableProducts} available</div></div>
        </div>

        <div class="section">
          <div class="section-title">📦 Top Products by Revenue</div>
          <table><tr><th>Product</th><th>Category</th><th>Orders</th><th>Revenue</th></tr>${rows.topProducts}</table>
        </div>

        <div class="section">
          <div class="section-title">🌍 Geographic Breakdown</div>
          <table><tr><th>Country</th><th>Orders</th><th>Revenue</th></tr>${rows.geo}</table>
        </div>

        <div class="section">
          <div class="section-title">📅 Monthly Revenue History</div>
          <table><tr><th>Month</th><th>Orders</th><th>Revenue</th></tr>${rows.monthly}</table>
        </div>

        <div class="section">
          <div class="section-title">💳 Payment Summary</div>
          <table>
            <tr><th>Status</th><th>Count</th></tr>
            <tr><td><span class="pill pill-green">Paid</span></td><td>${data.paymentBreakdown.PAID}</td></tr>
            <tr><td>Pending</td><td>${data.paymentBreakdown.PENDING}</td></tr>
            <tr><td>Failed</td><td>${data.paymentBreakdown.FAILED}</td></tr>
            <tr><td>Refunded</td><td>${data.paymentBreakdown.REFUNDED}</td></tr>
          </table>
        </div>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 600);
  }, [data]);

  const hasOrders = data.totalOrders > 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={dashboardRef}
      className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]"
    >
      {/* ── Header ── */}
      <header className="flex-shrink-0 px-6 py-5 lg:px-8 border-b border-white/5 bg-[#0a0c12]/80 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Performance Analytics</h1>
            <p className="text-slate-400 mt-1 text-sm">
              {hasOrders
                ? `Real-time insights across ${fNum(data.totalOrders)} orders & ${fNum(data.totalProducts)} products`
                : "No orders yet — analytics will appear as orders come in"}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Timeframe */}
            <div className="flex items-center bg-[#151c2a] border border-white/8 rounded-xl p-1 gap-0.5">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    timeframe === tf
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Category */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-[#151c2a] border border-white/8 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-primary/40 appearance-none cursor-pointer"
              >
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "All Categories" : (CATEGORY_LABELS[c] ?? c)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
            </div>

            {/* Export PDF */}
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 bg-primary hover:bg-[#0f49bd] active:scale-95 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-primary/20 transition-all text-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="max-w-[1600px] mx-auto space-y-6">

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              label="Total Revenue" icon={DollarSign} accentColor="#135bec" glowColor="#135bec"
              value={fCurrency(data.totalRevenue)} sub="All-time earnings" trend={data.revenueGrowth}
            />
            <KpiCard
              label="Total Orders" icon={ShoppingCart} accentColor="#34d399" glowColor="#34d399"
              value={fNum(data.totalOrders)} sub={`${data.paidOrders} paid orders`} trend={data.orderGrowth}
            />
            <KpiCard
              label="Avg. Order Value" icon={TrendingUp} accentColor="#d4af37" glowColor="#d4af37"
              value={fCurrency(data.avgOrderValue)} sub="Per transaction"
            />
            <KpiCard
              label="Products Listed" icon={Package} accentColor="#a78bfa" glowColor="#a78bfa"
              value={fNum(data.totalProducts)} sub={`${data.availableProducts} available · ${data.conversionRate} conv.`}
            />
          </div>

          {/* ── Revenue Trend Chart ── */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-white font-bold tracking-tight">
                  {activeMetric === "revenue" ? "Revenue Trend" : "Order Volume Trend"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {filteredMonthly.length > 0
                    ? `${filteredMonthly[0].label} → ${filteredMonthly[filteredMonthly.length - 1].label}`
                    : "No data for selected period"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-[#151c2a] border border-white/8 rounded-xl p-1 gap-0.5">
                  {(["revenue", "orderCount"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setActiveMetric(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        activeMetric === m ? "bg-primary text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {m === "revenue" ? "Revenue" : "Orders"}
                    </button>
                  ))}
                </div>
                <div className="flex bg-[#151c2a] border border-white/8 rounded-xl p-1 gap-0.5">
                  <button
                    onClick={() => setChartMode("area")}
                    className={`p-2 rounded-lg transition-all ${chartMode === "area" ? "bg-primary text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setChartMode("bar")}
                    className={`p-2 rounded-lg transition-all ${chartMode === "bar" ? "bg-primary text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-64">
              {filteredMonthly.length === 0 ? (
                <EmptyChart icon={Activity} message="No data for selected timeframe" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartMode === "area" ? (
                    <AreaChart data={filteredMonthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={activeMetric === "revenue" ? "#135bec" : "#34d399"} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={activeMetric === "revenue" ? "#135bec" : "#34d399"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} width={70}
                        tickFormatter={(v) => activeMetric === "revenue" ? fCurrency(v) : fNum(v)}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone" dataKey={activeMetric}
                        name={activeMetric === "revenue" ? "Revenue" : "Orders"}
                        stroke={activeMetric === "revenue" ? "#135bec" : "#34d399"}
                        strokeWidth={2.5} fill="url(#grad1)"
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: activeMetric === "revenue" ? "#135bec" : "#34d399" }}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={filteredMonthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={28}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={activeMetric === "revenue" ? "#135bec" : "#34d399"} stopOpacity={1} />
                          <stop offset="100%" stopColor={activeMetric === "revenue" ? "#135bec" : "#34d399"} stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} width={70}
                        tickFormatter={(v) => activeMetric === "revenue" ? fCurrency(v) : fNum(v)}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)", radius: 8 } as any} />
                      <Bar
                        dataKey={activeMetric} name={activeMetric === "revenue" ? "Revenue" : "Orders"}
                        fill="url(#barGrad)" radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* ── Row: Category + Top Products ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Category donut */}
            <Card className="lg:col-span-5">
              <CardHeader title="Revenue by Category" subtitle="Distribution across product segments" />
              {filteredCategories.length === 0 ? (
                <EmptyChart icon={Layers} message="No category data available" />
              ) : (
                <>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {filteredCategories.map((_, i) => (
                            <radialGradient key={i} id={`catGrad${i}`} cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={1} />
                              <stop offset="100%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.6} />
                            </radialGradient>
                          ))}
                        </defs>
                        <Pie
                          data={filteredCategories} cx="50%" cy="50%"
                          innerRadius={60} outerRadius={90} paddingAngle={3}
                          dataKey="revenue" nameKey="category"
                          stroke="none"
                        >
                          {filteredCategories.map((_, i) => (
                            <Cell key={i} fill={`url(#catGrad${i})`} style={{ filter: `drop-shadow(0 0 6px ${PALETTE[i % PALETTE.length]}60)` }} />
                          ))}
                        </Pie>
                        <Tooltip content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0];
                          return (
                            <div className="bg-[#0e1420] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
                              <p className="text-xs text-slate-400">{CATEGORY_LABELS[p.name] ?? p.name}</p>
                              <p className="text-sm font-black text-white mt-1">{fCurrency(p.value as number)}</p>
                              <p className="text-xs text-slate-500">{p.payload.orderCount} orders</p>
                            </div>
                          );
                        }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-3 space-y-2">
                    {filteredCategories.map((c, i) => {
                      const total = filteredCategories.reduce((a, x) => a + x.revenue, 0);
                      const pct = total > 0 ? ((c.revenue / total) * 100).toFixed(1) : "0";
                      return (
                        <div key={c.category} className="flex items-center gap-3 group">
                          <span className="size-2 rounded-full flex-shrink-0 shadow-lg" style={{ background: PALETTE[i % PALETTE.length], boxShadow: `0 0 8px ${PALETTE[i % PALETTE.length]}80` }} />
                          <span className="text-xs text-slate-400 flex-1">{CATEGORY_LABELS[c.category] ?? c.category}</span>
                          <span className="text-[10px] text-slate-600">{c.orderCount} orders</span>
                          <span className="text-xs font-bold text-white w-10 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>

            {/* Top 5 Products */}
            <Card className="lg:col-span-7">
              <CardHeader title="Top 5 Products" subtitle="Ranked by revenue generated" />
              {data.topProducts.length === 0 ? (
                <EmptyChart icon={Package} message="No product sales data yet" />
              ) : (
                <div className="space-y-5">
                  {data.topProducts.map((p, i) => {
                    const maxRev = Math.max(...data.topProducts.map((x) => x.revenue), 1);
                    const pct = (p.revenue / maxRev) * 100;
                    const color = PALETTE[i % PALETTE.length];
                    return (
                      <div key={p.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                              style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                            >
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-sm text-white font-semibold leading-tight">{p.name}</p>
                              <p className="text-[10px] text-slate-500">
                                {CATEGORY_LABELS[p.category] ?? p.category} · {p.orderCount} orders
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-black" style={{ color }}>{fCurrency(p.revenue)}</p>
                        </div>
                        <div className="h-2 w-full bg-slate-800/60 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${color}, ${color}70)`,
                              boxShadow: `0 0 8px ${color}60`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* ── Geographic Breakdown ── */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Globe className="w-4 h-4 text-primary" />
              <p className="text-white font-bold tracking-tight">Geographic Breakdown</p>
              <span className="ml-auto text-xs text-slate-500">{data.geographicData.length} countries</span>
            </div>

            {data.geographicData.length === 0 ? (
              <EmptyChart icon={Globe} message="No geographic data yet" />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Full-height bar chart */}
                <div style={{ height: Math.max(data.geographicData.length * 52, 200) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.geographicData} layout="vertical"
                      margin={{ top: 4, right: 24, left: 4, bottom: 4 }} barSize={22}
                    >
                      <defs>
                        {data.geographicData.map((_, i) => (
                          <linearGradient key={i} id={`geoGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={1} />
                            <stop offset="100%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.4} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fCurrency} />
                      <YAxis type="category" dataKey="country" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                      <Bar dataKey="revenue" name="Revenue" radius={[0, 8, 8, 0]}>
                        {data.geographicData.map((_, i) => (
                          <Cell
                            key={i} fill={`url(#geoGrad${i})`}
                            style={{ filter: `drop-shadow(2px 0 6px ${PALETTE[i % PALETTE.length]}40)` }}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Country list */}
                <div className="space-y-2 overflow-y-auto max-h-96 pr-1">
                  {data.geographicData.map((g, i) => (
                    <div
                      key={g.country}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-white/5 hover:border-white/10 hover:bg-slate-800/50 transition-all group"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ background: `${PALETTE[i % PALETTE.length]}20`, color: PALETTE[i % PALETTE.length] }}
                      >
                        #{i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{g.country}</p>
                        <p className="text-[10px] text-slate-500">{g.orderCount} orders</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black" style={{ color: PALETTE[i % PALETTE.length] }}>{fCurrency(g.revenue)}</p>
                        <p className="text-[10px] text-slate-600">{((g.revenue / maxGeo) * 100).toFixed(1)}% share</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* ── Payment Status (detailed) + Order Status ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Payment detailed */}
            <Card className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <p className="text-white font-bold tracking-tight">Payment Status</p>
              </div>

              {data.totalOrders === 0 ? (
                <EmptyChart icon={CreditCard} message="No payment data yet" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Donut */}
                  <div className="h-52 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {paymentDonutData.map((d, i) => (
                            <radialGradient key={i} id={`payGrad${i}`} cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor={d.color} stopOpacity={1} />
                              <stop offset="100%" stopColor={d.color} stopOpacity={0.5} />
                            </radialGradient>
                          ))}
                        </defs>
                        <Pie
                          data={paymentDonutData} cx="50%" cy="50%"
                          innerRadius={55} outerRadius={80} paddingAngle={4}
                          dataKey="value" stroke="none"
                        >
                          {paymentDonutData.map((d, i) => (
                            <Cell
                              key={i} fill={`url(#payGrad${i})`}
                              style={{ filter: `drop-shadow(0 0 8px ${d.color}50)` }}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0];
                          return (
                            <div className="bg-[#0e1420] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
                              <p className="text-xs font-bold" style={{ color: p.payload.color }}>{p.name}</p>
                              <p className="text-sm font-black text-white">{fNum(p.value as number)} orders</p>
                            </div>
                          );
                        }} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centre label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-2xl font-black text-emerald-400">{data.paymentBreakdown.PAID}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Paid</p>
                    </div>
                  </div>

                  {/* Breakdown cards */}
                  <div className="space-y-3">
                    {[
                      { label: "Paid", count: data.paymentBreakdown.PAID, rev: data.paidRevenue, color: "#34d399", icon: CheckCircle2 },
                      { label: "Pending", count: data.paymentBreakdown.PENDING, rev: data.pendingRevenue, color: "#d4af37", icon: Clock },
                      { label: "Failed", count: data.paymentBreakdown.FAILED, rev: 0, color: "#fb7185", icon: XCircle },
                      { label: "Refunded", count: data.paymentBreakdown.REFUNDED, rev: 0, color: "#a78bfa", icon: AlertCircle },
                    ].filter((s) => s.count > 0 || s.label === "Paid").map((s) => (
                      <div
                        key={s.label}
                        className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01]"
                        style={{ background: `${s.color}08`, borderColor: `${s.color}25` }}
                      >
                        <s.icon className="w-4 h-4 flex-shrink-0" style={{ color: s.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold" style={{ color: s.color }}>{s.label}</p>
                          {s.rev > 0 && <p className="text-[10px] text-slate-500">{fCurrency(s.rev)}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-white">{fNum(s.count)}</p>
                          <p className="text-[10px] text-slate-500">
                            {data.totalOrders > 0 ? ((s.count / data.totalOrders) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Order Status */}
            <Card className="lg:col-span-5">
              <div className="flex items-center gap-2 mb-5">
                <Truck className="w-4 h-4 text-cyan-400" />
                <p className="text-white font-bold tracking-tight">Order Pipeline</p>
              </div>

              {orderStatusData.length === 0 ? (
                <EmptyChart icon={ShoppingCart} message="No order status data yet" />
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "Delivered", count: data.orderStatusBreakdown.DELIVERED, color: "#34d399", icon: CheckCircle2 },
                    { label: "Shipped", count: data.orderStatusBreakdown.SHIPPED, color: "#22d3ee", icon: Truck },
                    { label: "Processing", count: data.orderStatusBreakdown.PROCESSING, color: "#a78bfa", icon: RefreshCw },
                    { label: "Confirmed", count: data.orderStatusBreakdown.CONFIRMED, color: "#135bec", icon: CheckCircle2 },
                    { label: "Pending", count: data.orderStatusBreakdown.PENDING, color: "#d4af37", icon: Clock },
                    { label: "Cancelled", count: data.orderStatusBreakdown.CANCELLED, color: "#fb7185", icon: XCircle },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <s.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color }} />
                      <span className="text-xs text-slate-400 w-20 flex-shrink-0">{s.label}</span>
                      <div className="flex-1 h-2 bg-slate-800/60 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${data.totalOrders > 0 ? (s.count / data.totalOrders) * 100 : 0}%`,
                            background: `linear-gradient(90deg, ${s.color}, ${s.color}60)`,
                            boxShadow: s.count > 0 ? `0 0 8px ${s.color}50` : "none",
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white w-6 text-right flex-shrink-0">{s.count}</span>
                    </div>
                  ))}

                  {/* Shipment mini summary */}
                  {Object.values(data.shipmentBreakdown).some((v) => v > 0) && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Shipments</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "In Transit", count: data.shipmentBreakdown.IN_TRANSIT, color: "#22d3ee" },
                          { label: "Delivered", count: data.shipmentBreakdown.DELIVERED, color: "#34d399" },
                          { label: "Customs", count: data.shipmentBreakdown.CUSTOMS, color: "#a78bfa" },
                          { label: "Returned", count: data.shipmentBreakdown.RETURNED, color: "#fb7185" },
                        ].filter((s) => s.count > 0).map((s) => (
                          <div key={s.label} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30 border border-white/5">
                            <span className="size-1.5 rounded-full" style={{ background: s.color }} />
                            <span className="text-[10px] text-slate-400">{s.label}</span>
                            <span className="ml-auto text-[10px] font-bold text-white">{s.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
