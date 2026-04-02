"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, Package, ShoppingCart, Globe,
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

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TIMEFRAMES = ["1M", "3M", "6M", "1Y", "ALL"] as const;
type Timeframe = typeof TIMEFRAMES[number];

const PALETTE = [
  "#ffffff", "#f5f5f5", "#e5e5e5", "#d4d4d4", "#a3a3a3", "#737373", "#525252", "#404040", "#262626",
];

const CATEGORY_LABELS: Record<string, string> = {
  CHEMICALS: "CHEMICALS", MACHINES: "MACHINES", TEXTILES: "TEXTILES",
  MEDICAL: "MEDICAL", HANDICRAFTS: "HANDICRAFTS", FOOD: "FOOD",
  ELECTRONICS: "ELECTRONICS", AUTOMOTIVE: "AUTOMOTIVE",
  CONSTRUCTION: "CONSTRUCTION", AGRICULTURE: "AGRICULTURE", OTHER: "OTHER",
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
  return `${MONTH_NAMES[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`.toUpperCase();
}

// ─── Shared Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black/90 border border-border dark:border-white/10 rounded-2xl px-5 py-4 shadow-xl dark:shadow-2xl backdrop-blur-xl">
      <p className="text-[10px] text-muted-foreground mb-3 font-black uppercase tracking-widest italic">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground/60">{p.name}:</span>
          <span style={{ color: p.color }} className="italic">
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
    <div className="flex flex-col items-center justify-center h-full gap-4 py-12 opacity-40">
      <div className="p-5 rounded-3xl bg-black/5 dark:bg-white/10 border border-border dark:border-white/10">
        <Icon className="w-10 h-10 text-foreground dark:text-white" />
      </div>
      <p className="text-foreground dark:text-white text-[10px] font-black uppercase tracking-[0.2em] text-center max-w-[250px] italic">{message}</p>
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
      className="relative overflow-hidden rounded-[2rem] border border-border dark:border-white/5 bg-card/40 dark:bg-white/5 p-8 transition-all duration-500 hover:-translate-y-1 group cursor-default shadow-xl dark:shadow-2xl backdrop-blur-3xl"
    >
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-700 pointer-events-none"
        style={{ background: '#ffffff' }}
      />
      <div className="flex items-start justify-between relative mb-6">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 italic">{label}</p>
        <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 text-foreground dark:text-white transition-all group-hover:scale-110">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-4xl font-black tracking-tighter text-foreground dark:text-white uppercase italic group-hover:scale-[1.02] transition-transform duration-300 origin-left">
        {value}
      </p>
      <p className="text-[9px] font-black text-muted-foreground/40 mt-2 uppercase tracking-widest">{sub}</p>
      {trend !== undefined && (
        <div
          className={`mt-6 inline-flex items-center gap-2 text-[9px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest italic transition-all ${isPositive
              ? "text-foreground dark:text-white bg-black/10 dark:bg-white/15 border-border dark:border-white/20"
              : "text-muted-foreground/60 bg-black/5 dark:bg-white/10 border-border dark:border-white/5"
            }`}
        >
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}% Delta
        </div>
      )}
      <div className="mt-8 h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-1000 delay-300"
          style={{ width: '75%', boxShadow: '0 0 15px rgba(255,255,255,0.3)' }}
        />
      </div>
    </div>
  );
}

// ─── Section Card wrapper ─────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[2.5rem] border border-border dark:border-white/5 bg-card/40 dark:bg-white/5 p-8 shadow-xl dark:shadow-2xl backdrop-blur-3xl transition-all duration-300 hover:border-border dark:border-white/10 ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <p className="text-xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">{title}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-40 italic">{subtitle}</p>}
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
      { name: "Paid", value: data.paymentBreakdown.PAID, color: "#ffffff" },
      { name: "Pending", value: data.paymentBreakdown.PENDING, color: "#a3a3a3" },
      { name: "Failed", value: data.paymentBreakdown.FAILED, color: "#525252" },
      { name: "Refunded", value: data.paymentBreakdown.REFUNDED, color: "#262626" },
    ].filter((d) => d.value > 0),
    [data.paymentBreakdown]
  );

  // ── Order status radial data ──────────────────────────────────────────────
  const orderStatusData = useMemo(
    () => [
      { name: "Delivered", value: data.orderStatusBreakdown.DELIVERED, fill: "#ffffff" },
      { name: "Shipped", value: data.orderStatusBreakdown.SHIPPED, fill: "#e5e5e5" },
      { name: "Processing", value: data.orderStatusBreakdown.PROCESSING, fill: "#a3a3a3" },
      { name: "Confirmed", value: data.orderStatusBreakdown.CONFIRMED, fill: "#737373" },
      { name: "Pending", value: data.orderStatusBreakdown.PENDING, fill: "#525252" },
      { name: "Cancelled", value: data.orderStatusBreakdown.CANCELLED, fill: "#262626" },
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
        .kpi-card { background: #111; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; }
        .kpi-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
        .kpi-value { font-size: 28px; font-weight: 900; margin-top: 8px; }
        .kpi-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
        .section { background: #111; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .section-title { font-size: 15px; font-weight: 700; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; padding: 8px 12px; }
        td { padding: 10px 12px; font-size: 13px; border-top: 1px solid rgba(255,255,255,0.05); color: #cbd5e1; }
        .pill { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
        .pill-neutral { background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); }
      </style>
    `;

    const rows = {
      topProducts: data.topProducts
        .map(
          (p, i) =>
            `<tr><td>${i + 1}. ${p.name}</td><td>${CATEGORY_LABELS[p.category] ?? p.category}</td><td>${p.orderCount}</td><td style="color:#ffffff;font-weight:700">${fCurrency(p.revenue)}</td></tr>`
        )
        .join(""),
      geo: data.geographicData
        .map(
          (g) =>
            `<tr><td>${g.country}</td><td>${g.orderCount}</td><td style="color:#ffffff;font-weight:700">${fCurrency(g.revenue)}</td></tr>`
        )
        .join(""),
      monthly: data.monthlyRevenue
        .map(
          (m) =>
            `<tr><td>${fMonth(m.month)}</td><td>${m.orderCount}</td><td style="color:#ffffff;font-weight:700">${fCurrency(m.revenue)}</td></tr>`
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
          <div class="kpi-card"><div class="kpi-label">Total Revenue</div><div class="kpi-value" style="color:#ffffff">${fCurrency(data.totalRevenue)}</div><div class="kpi-sub">All-time earnings</div></div>
          <div class="kpi-card"><div class="kpi-label">Total Orders</div><div class="kpi-value" style="color:#e5e5e5">${fNum(data.totalOrders)}</div><div class="kpi-sub">${data.paidOrders} paid</div></div>
          <div class="kpi-card"><div class="kpi-label">Avg. Order Value</div><div class="kpi-value" style="color:#a3a3a3">${fCurrency(data.avgOrderValue)}</div><div class="kpi-sub">Per transaction</div></div>
          <div class="kpi-card"><div class="kpi-label">Products Listed</div><div class="kpi-value" style="color:#737373">${fNum(data.totalProducts)}</div><div class="kpi-sub">${data.availableProducts} available</div></div>
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
            <tr><td><span class="pill pill-neutral">Paid</span></td><td>${data.paymentBreakdown.PAID}</td></tr>
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
      className="h-dvh overflow-hidden flex flex-col bg-background"
    >
      {/* ── Header ── */}
      <header className="flex-shrink-0 px-10 py-8 border-b border-border dark:border-white/5 bg-background/40 backdrop-blur-3xl z-40">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground dark:text-white uppercase italic">Intelligence Analytics</h1>
            <p className="text-muted-foreground mt-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
              {hasOrders
                ? `Active Node: ${fNum(data.totalOrders)} signals processing / ${fNum(data.totalProducts)} assets indexed`
                : "Awaiting primary transmissions — metrics dormant"}
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Timeframe */}
            <div className="flex items-center bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 rounded-2xl p-1.5 backdrop-blur-md">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${timeframe === tf
                      ? "bg-primary text-primary-foreground dark:shadow-md shadow-none"
                      : "text-muted-foreground/60 hover:text-foreground dark:text-white hover:bg-black/5 dark:bg-white/10"
                    }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Category */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-12 pr-10 py-3 bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 rounded-2xl text-[10px] text-foreground dark:text-white font-black uppercase tracking-widest focus:outline-none focus:border-white/40 appearance-none cursor-pointer hover:bg-black/10 dark:bg-white/15 transition-colors"
              >
                {availableCategories.map((c) => (
                  <option key={c} value={c} className="bg-card dark:bg-[#0a0a0a] text-foreground dark:text-white">
                    {c === "ALL" ? "Global Grid" : (CATEGORY_LABELS[c] ?? c)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40 pointer-events-none" />
            </div>

            {/* Export PDF */}
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-black py-3 px-6 rounded-2xl shadow-2xl shadow-white/5 transition-all text-[10px] uppercase tracking-[0.2em] italic"
            >
              <Download className="w-4 h-4" />
              Generate Signal Report
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="max-w-[1600px] mx-auto space-y-6">

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <KpiCard
              label="Total Revenue" icon={DollarSign} accentColor="#ffffff" glowColor="#ffffff"
              value={fCurrency(data.totalRevenue)} sub="Gross Signal Capital" trend={data.revenueGrowth}
            />
            <KpiCard
              label="Total Orders" icon={ShoppingCart} accentColor="#e5e5e5" glowColor="#e5e5e5"
              value={fNum(data.totalOrders)} sub={`${data.paidOrders} confirmed transmissions`} trend={data.orderGrowth}
            />
            <KpiCard
              label="Avg. Order Value" icon={TrendingUp} accentColor="#a3a3a3" glowColor="#a3a3a3"
              value={fCurrency(data.avgOrderValue)} sub="Unit Telemetry Val"
            />
            <KpiCard
              label="Assets Indexed" icon={Package} accentColor="#d4d4d4" glowColor="#d4d4d4"
              value={fNum(data.totalProducts)} sub={`${data.availableProducts} active · ${data.conversionRate} yield`}
            />
          </div>

          {/* ── Revenue Trend Chart ── */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-10">
              <div>
                <p className="text-xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">
                  {activeMetric === "revenue" ? "Capital Flux" : "Signal Density"}
                </p>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-40 italic">
                  {filteredMonthly.length > 0
                    ? `Temporal Index: ${filteredMonthly[0].label} — ${filteredMonthly[filteredMonthly.length - 1].label}`
                    : "Telemetry data unavailable"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 rounded-2xl p-1.5 backdrop-blur-md">
                  {(["revenue", "orderCount"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setActiveMetric(m)}
                      className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeMetric === m ? "bg-primary text-primary-foreground dark:shadow-md shadow-none" : "text-muted-foreground/60 hover:text-foreground dark:text-white hover:bg-black/5 dark:bg-white/10"
                        }`}
                    >
                      {m === "revenue" ? "Revenue" : "Signals"}
                    </button>
                  ))}
                </div>
                <div className="flex bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 rounded-2xl p-1.5 backdrop-blur-md">
                  <button
                    onClick={() => setChartMode("area")}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${chartMode === "area" ? "bg-primary text-primary-foreground dark:shadow-md shadow-none" : "text-muted-foreground/60 hover:text-foreground dark:text-white hover:bg-black/5 dark:bg-white/10"}`}
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setChartMode("bar")}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${chartMode === "bar" ? "bg-primary text-primary-foreground dark:shadow-md shadow-none" : "text-muted-foreground/60 hover:text-foreground dark:text-white hover:bg-black/5 dark:bg-white/10"}`}
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-80">
              {filteredMonthly.length === 0 ? (
                <EmptyChart icon={Activity} message="Sensor data unavailable for selected index" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartMode === "area" ? (
                    <AreaChart data={filteredMonthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: "#ffffff", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis
                        tick={{ fill: "#ffffff", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} width={80}
                        tickFormatter={(v) => activeMetric === "revenue" ? fCurrency(v) : fNum(v)}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area
                        type="monotone" dataKey={activeMetric}
                        name={activeMetric === "revenue" ? "revenue" : "signals"}
                        stroke="#ffffff"
                        strokeWidth={3} fill="url(#grad1)"
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0, fill: "#ffffff" }}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={filteredMonthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={32}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: "#ffffff", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis
                        tick={{ fill: "#ffffff", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} width={80}
                        tickFormatter={(v) => activeMetric === "revenue" ? fCurrency(v) : fNum(v)}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)", radius: 12 } as any} />
                      <Bar
                        dataKey={activeMetric} name={activeMetric === "revenue" ? "revenue" : "signals"}
                        fill="url(#barGrad)" radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* ── Row: Category + Top Products ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Category donut */}
            <Card className="lg:col-span-5">
              <CardHeader title="Sector Distribution" subtitle="System-wide asset categorization" />
              {filteredCategories.length === 0 ? (
                <EmptyChart icon={Layers} message="Telemetry data dormant" />
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {filteredCategories.map((_, i) => (
                            <radialGradient key={i} id={`catGrad${i}`} cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={1} />
                              <stop offset="100%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.4} />
                            </radialGradient>
                          ))}
                        </defs>
                        <Pie
                          data={filteredCategories} cx="50%" cy="50%"
                          innerRadius={70} outerRadius={100} paddingAngle={4}
                          dataKey="revenue" nameKey="category"
                          stroke="none"
                        >
                          {filteredCategories.map((_, i) => (
                            <Cell key={i} fill={`url(#catGrad${i})`} style={{ filter: `drop-shadow(0 0 10px ${PALETTE[i % PALETTE.length]}40)` }} />
                          ))}
                        </Pie>
                        <Tooltip content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0];
                          return (
                            <div className="bg-black/90 border border-border dark:border-white/10 rounded-2xl px-5 py-4 shadow-xl dark:shadow-2xl backdrop-blur-xl">
                              <p className="text-[10px] text-muted-foreground mb-2 font-black uppercase tracking-widest italic">
                                {p.name ? (CATEGORY_LABELS[p.name as string] ?? p.name) : "NULL_ENTITY"}
                              </p>
                              <p className="text-sm font-black text-foreground dark:text-white italic">{fCurrency(p.value as number)}</p>
                              <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1">Signals: {p.payload.orderCount}</p>
                            </div>
                          );
                        }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-8 space-y-3">
                    {filteredCategories.map((c, i) => {
                      const total = filteredCategories.reduce((a, x) => a + x.revenue, 0);
                      const pct = total > 0 ? ((c.revenue / total) * 100).toFixed(1) : "0";
                      return (
                        <div key={c.category} className="flex items-center gap-4 group">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 dark:shadow-md shadow-none" style={{ background: PALETTE[i % PALETTE.length] }} />
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex-1 group-hover:text-foreground dark:text-white transition-colors italic">{CATEGORY_LABELS[c.category] ?? c.category}</span>
                          <span className="text-[9px] text-muted-foreground/20 font-black uppercase tracking-tighter">[{c.orderCount} SIG]</span>
                          <span className="text-[10px] font-black text-foreground dark:text-white w-12 text-right italic">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>

            {/* Top 5 Products */}
            <Card className="lg:col-span-7">
              <CardHeader title="Strategic Assets" subtitle="High-yield telemetry ranking" />
              {data.topProducts.length === 0 ? (
                <EmptyChart icon={Package} message="No archival data available" />
              ) : (
                <div className="space-y-8">
                  {data.topProducts.map((p, i) => {
                    const maxRev = Math.max(...data.topProducts.map((x) => x.revenue), 1);
                    const pct = (p.revenue / maxRev) * 100;
                    const color = PALETTE[i % PALETTE.length];
                    return (
                      <div key={p.id} className="group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-5">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black flex-shrink-0 border transition-all group-hover:scale-110"
                              style={{ background: `${color}10`, color, borderColor: `${color}20` }}
                            >
                              0{i + 1}
                            </div>
                            <div>
                              <p className="text-sm text-foreground dark:text-white font-black uppercase italic tracking-tighter group-hover:translate-x-1 transition-transform">{p.name}</p>
                              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-40">
                                {CATEGORY_LABELS[p.category] ?? p.category} · {p.orderCount} transmissions
                              </p>
                            </div>
                          </div>
                          <p className="text-lg font-black italic uppercase" style={{ color }}>{fCurrency(p.revenue)}</p>
                        </div>
                        <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden p-[1px] border border-border dark:border-white/5">
                          <div
                            className="h-full rounded-full transition-all duration-1000 delay-300"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${color}, ${color}40)`,
                              boxShadow: `0 0 15px ${color}30`,
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
            <div className="flex items-center gap-4 mb-10">
              <Globe className="w-5 h-5 text-foreground dark:text-white animate-pulse" />
              <div>
                <p className="text-xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">Geographic Distribution</p>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-40 italic">Global Grid Coverage: {data.geographicData.length} active nodes</p>
              </div>
            </div>

            {data.geographicData.length === 0 ? (
              <EmptyChart icon={Globe} message="Global telemetry data dormant" />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Full-height bar chart */}
                <div style={{ height: Math.max(data.geographicData.length * 60, 300) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.geographicData} layout="vertical"
                      margin={{ top: 4, right: 32, left: 4, bottom: 4 }} barSize={28}
                    >
                      <defs>
                        {data.geographicData.map((_, i) => (
                          <linearGradient key={i} id={`geoGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={1} />
                            <stop offset="100%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.2} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} horizontal={false} />
                      <XAxis type="number" tick={{ fill: "#ffffff", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} tickFormatter={fCurrency} />
                      <YAxis type="category" dataKey="country" tick={{ fill: "#ffffff", fontSize: 11, fontWeight: 900 }} axisLine={false} tickLine={false} width={120} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)", radius: 8 }} />
                      <Bar dataKey="revenue" name="revenue" radius={[0, 10, 10, 0]}>
                        {data.geographicData.map((_, i) => (
                          <Cell
                            key={i} fill={`url(#geoGrad${i})`}
                            style={{ filter: `drop-shadow(4px 0 10px ${PALETTE[i % PALETTE.length]}30)` }}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Country list */}
                <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                  {data.geographicData.map((g, i) => (
                    <div
                      key={g.country}
                      className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-border dark:border-white/5 hover:border-border dark:border-white/10 hover:bg-white/[0.05] transition-all group"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black flex-shrink-0 border transition-all"
                        style={{ background: `${PALETTE[i % PALETTE.length]}10`, color: PALETTE[i % PALETTE.length], borderColor: `${PALETTE[i % PALETTE.length]}20` }}
                      >
                        {i < 9 ? `0${i + 1}` : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-foreground dark:text-white uppercase italic tracking-wider truncate">{g.country}</p>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-40">{g.orderCount} transmissions</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black italic uppercase" style={{ color: PALETTE[i % PALETTE.length] }}>{fCurrency(g.revenue)}</p>
                        <p className="text-[9px] text-muted-foreground/20 font-black uppercase tracking-tighter mt-1">{((g.revenue / maxGeo) * 100).toFixed(1)}% Share</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* ── Payment Status (detailed) + Order Status ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Payment detailed */}
            <Card className="lg:col-span-7">
              <div className="flex items-center gap-4 mb-10">
                <CreditCard className="w-5 h-5 text-foreground dark:text-white" />
                <div>
                  <p className="text-xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">Capital Settlement</p>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-40 italic">Signal Liquidity Status</p>
                </div>
              </div>

              {data.totalOrders === 0 ? (
                <EmptyChart icon={CreditCard} message="Payment telemetry dormant" />
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  {/* Donut */}
                  <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {paymentDonutData.map((d, i) => (
                            <radialGradient key={i} id={`payGrad${i}`} cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor={d.color} stopOpacity={1} />
                              <stop offset="100%" stopColor={d.color} stopOpacity={0.4} />
                            </radialGradient>
                          ))}
                        </defs>
                        <Pie
                          data={paymentDonutData} cx="50%" cy="50%"
                          innerRadius={70} outerRadius={100} paddingAngle={6}
                          dataKey="value" stroke="none"
                        >
                          {paymentDonutData.map((d, i) => (
                            <Cell
                              key={i} fill={`url(#payGrad${i})`}
                              style={{ filter: `drop-shadow(0 0 15px ${d.color}30)` }}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0];
                          return (
                            <div className="bg-black/90 border border-border dark:border-white/10 rounded-2xl px-5 py-4 shadow-xl dark:shadow-2xl backdrop-blur-xl">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] italic mb-1" style={{ color: p.payload.color }}>{p.name}</p>
                              <p className="text-sm font-black text-foreground dark:text-white italic">{fNum(p.value as number)} transmissions</p>
                            </div>
                          );
                        }} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centre label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-4xl font-black text-foreground dark:text-white italic">{data.paymentBreakdown.PAID}</p>
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-1 opacity-40">Confirmed</p>
                    </div>
                  </div>

                  {/* Breakdown cards */}
                  <div className="space-y-4">
                    {[
                      { label: "Confirmed", count: data.paymentBreakdown.PAID, rev: data.paidRevenue, color: "#ffffff", icon: CheckCircle2 },
                      { label: "Pending", count: data.paymentBreakdown.PENDING, rev: data.pendingRevenue, color: "#a3a3a3", icon: Clock },
                      { label: "Failed", count: data.paymentBreakdown.FAILED, rev: 0, color: "#737373", icon: XCircle },
                      { label: "Refunded", count: data.paymentBreakdown.REFUNDED, rev: 0, color: "#525252", icon: AlertCircle },
                    ].filter((s) => s.count > 0 || s.label === "Confirmed").map((s) => (
                      <div
                        key={s.label}
                        className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:bg-white/[0.02]"
                        style={{ background: `${s.color}05`, borderColor: `${s.color}15` }}
                      >
                        <s.icon className="w-5 h-5 flex-shrink-0" style={{ color: s.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest italic" style={{ color: s.color }}>{s.label}</p>
                          {s.rev > 0 && <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-tighter mt-1">{fCurrency(s.rev)}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-foreground dark:text-white italic">{fNum(s.count)}</p>
                          <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-tighter">
                            {data.totalOrders > 0 ? ((s.count / data.totalOrders) * 100).toFixed(1) : 0}% Yield
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
                <Truck className="w-4 h-4 text-foreground dark:text-white" />
                <p className="text-foreground font-bold tracking-tight">Order Pipeline</p>
              </div>

              {orderStatusData.length === 0 ? (
                <EmptyChart icon={ShoppingCart} message="No order status data yet" />
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "Delivered", count: data.orderStatusBreakdown.DELIVERED, color: "#ffffff", icon: CheckCircle2 },
                    { label: "Shipped", count: data.orderStatusBreakdown.SHIPPED, color: "#e5e5e5", icon: Truck },
                    { label: "Processing", count: data.orderStatusBreakdown.PROCESSING, color: "#a3a3a3", icon: RefreshCw },
                    { label: "Confirmed", count: data.orderStatusBreakdown.CONFIRMED, color: "#737373", icon: CheckCircle2 },
                    { label: "Pending", count: data.orderStatusBreakdown.PENDING, color: "#525252", icon: Clock },
                    { label: "Cancelled", count: data.orderStatusBreakdown.CANCELLED, color: "#262626", icon: XCircle },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <s.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color }} />
                      <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{s.label}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${data.totalOrders > 0 ? (s.count / data.totalOrders) * 100 : 0}%`,
                            background: `linear-gradient(90deg, ${s.color}, ${s.color}60)`,
                            boxShadow: s.count > 0 ? `0 0 8px ${s.color}50` : "none",
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-foreground w-6 text-right flex-shrink-0">{s.count}</span>
                    </div>
                  ))}

                  {/* Shipment mini summary */}
                  {Object.values(data.shipmentBreakdown).some((v) => v > 0) && (
                    <div className="mt-4 pt-4 border-t border-border dark:border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Shipments</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "In Transit", count: data.shipmentBreakdown.IN_TRANSIT, color: "#ffffff" },
                          { label: "Delivered", count: data.shipmentBreakdown.DELIVERED, color: "#e5e5e5" },
                          { label: "Customs", count: data.shipmentBreakdown.CUSTOMS, color: "#a3a3a3" },
                          { label: "Returned", count: data.shipmentBreakdown.RETURNED, color: "#525252" },
                        ].filter((s) => s.count > 0).map((s) => (
                          <div key={s.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border">
                            <span className="size-1.5 rounded-full" style={{ background: s.color }} />
                            <span className="text-[10px] text-muted-foreground">{s.label}</span>
                            <span className="ml-auto text-[10px] font-bold text-foreground">{s.count}</span>
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


