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
  ArrowDownRight, BarChart2, Activity,
  CreditCard, Truck, CheckCircle2, Clock, XCircle, AlertCircle,
  Layers, type LucideIcon,
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
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#8b5cf6", // violet-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#6366f1", // indigo-500
];

const CATEGORY_LABELS: Record<string, string> = {
  CHEMICALS: "Chemicals", MACHINES: "Machinery", TEXTILES: "Textiles",
  MEDICAL: "Medical", HANDICRAFTS: "Handicrafts", FOOD: "Food & Beverage",
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
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs text-muted-foreground font-medium mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm font-bold">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground font-medium capitalize">{p.name}:</span>
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

function EmptyChart({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
      <div className="p-4 rounded-full bg-muted/50 text-muted-foreground/50 border border-border border-dashed">
        <Icon className="w-8 h-8" />
      </div>
      <p className="text-muted-foreground font-medium text-sm text-center">{message}</p>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, trend, borderClass, icon: Icon, fillRatio = 0,
}: {
  label: string; value: string; sub: string; trend?: number;
  borderClass: string; icon: LucideIcon; fillRatio?: number;
}) {
  const isPositive = (trend ?? 0) >= 0;
  return (
    <div className={`relative overflow-hidden rounded-2xl border-l-4 ${borderClass} border-t border-b border-r border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 group`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-muted text-foreground">
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${isPositive ? "text-emerald-600 bg-emerald-500/10" : "text-red-600 bg-red-500/10"}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-1">{label}</p>
        <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
        <p className="text-xs font-medium text-muted-foreground mt-2">{sub}</p>
      </div>
      {fillRatio > 0 && (
        <div className="mt-5 h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 bg-current opacity-50"
            style={{ width: `${Math.min(100, Math.max(0, fillRatio * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Section Card wrapper ─────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      {subtitle && <p className="text-sm font-medium text-muted-foreground mt-1">{subtitle}</p>}
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
      { name: "Paid", value: data.paymentBreakdown.PAID, color: "#10b981" },
      { name: "Pending", value: data.paymentBreakdown.PENDING, color: "#f59e0b" },
      { name: "Failed", value: data.paymentBreakdown.FAILED, color: "#ef4444" },
      { name: "Refunded", value: data.paymentBreakdown.REFUNDED, color: "#64748b" },
    ].filter((d) => d.value > 0),
    [data.paymentBreakdown]
  );

  // ── Order status radial data ──────────────────────────────────────────────
  const orderStatusData = useMemo(
    () => [
      { name: "Delivered", value: data.orderStatusBreakdown.DELIVERED, fill: "#10b981" },
      { name: "Shipped", value: data.orderStatusBreakdown.SHIPPED, fill: "#3b82f6" },
      { name: "Processing", value: data.orderStatusBreakdown.PROCESSING, fill: "#8b5cf6" },
      { name: "Confirmed", value: data.orderStatusBreakdown.CONFIRMED, fill: "#06b6d4" },
      { name: "Pending", value: data.orderStatusBreakdown.PENDING, fill: "#f59e0b" },
      { name: "Cancelled", value: data.orderStatusBreakdown.CANCELLED, fill: "#ef4444" },
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
      body { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; padding: 40px; }
      .page-title { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
      .page-sub { font-size: 14px; color: #64748b; margin-bottom: 32px; }
      .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
      .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
      .kpi-label { font-size: 12px; font-weight: 600; color: #64748b; }
      .kpi-value { font-size: 24px; font-weight: 800; margin-top: 8px; }
      .section { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
      .section-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th { text-align: left; font-size: 12px; font-weight: 600; color: #64748b; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
      td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; }
      </style>
    `;

    const rows = {
      topProducts: data.topProducts
        .map(
          (p, i) =>
            `<tr><td>${i + 1}. ${p.name}</td><td>${CATEGORY_LABELS[p.category] ?? p.category}</td><td>${p.orderCount}</td><td style="font-weight:700">${fCurrency(p.revenue)}</td></tr>`
        )
        .join(""),
      geo: data.geographicData
        .map(
          (g) =>
            `<tr><td>${g.country}</td><td>${g.orderCount}</td><td style="font-weight:700">${fCurrency(g.revenue)}</td></tr>`
        )
        .join(""),
      monthly: data.monthlyRevenue
        .map(
          (m) =>
            `<tr><td>${fMonth(m.month)}</td><td>${m.orderCount}</td><td style="font-weight:700">${fCurrency(m.revenue)}</td></tr>`
        )
        .join(""),
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Sales Analytics Report</title>${printStyles}</head>
      <body>
        <div class="page-title">📊 Sales Analytics Report</div>
        <div class="page-sub">Generated on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>

        <div class="kpi-grid">
          <div class="kpi-card"><div class="kpi-label">Total Revenue</div><div class="kpi-value">${fCurrency(data.totalRevenue)}</div></div>
          <div class="kpi-card"><div class="kpi-label">Total Orders</div><div class="kpi-value">${fNum(data.totalOrders)}</div></div>
          <div class="kpi-card"><div class="kpi-label">Avg. Order Value</div><div class="kpi-value">${fCurrency(data.avgOrderValue)}</div></div>
          <div class="kpi-card"><div class="kpi-label">Products Listed</div><div class="kpi-value">${fNum(data.totalProducts)}</div></div>
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
    <div ref={dashboardRef} className="h-dvh overflow-hidden flex flex-col bg-[#fafafa] dark:bg-background">
      {/* ── Header ── */}
      <header className="flex-shrink-0 px-6 sm:px-10 py-8 border-b border-border bg-white/50 dark:bg-background/40 backdrop-blur-xl z-40">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Sales Analytics</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">
              {hasOrders
                ? `Analyzing ${fNum(data.totalOrders)} orders across ${fNum(data.totalProducts)} products`
                : "Awaiting your first orders to generate insights"}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Timeframe */}
            <div className="flex items-center bg-muted/50 p-1 border border-border rounded-xl">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    timeframe === tf
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Category */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-card border border-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50 appearance-none cursor-pointer hover:bg-muted/30 transition-colors shadow-sm"
              >
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "All Categories" : (CATEGORY_LABELS[c] ?? c)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-5 rounded-xl shadow-md transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
        <div className="max-w-[1600px] mx-auto space-y-8">

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <KpiCard
              label="Total Revenue" icon={DollarSign} borderClass="border-l-emerald-500 text-emerald-500"
              value={fCurrency(data.totalRevenue)} sub="All-time earnings" trend={data.revenueGrowth}
              fillRatio={1}
            />
            <KpiCard
              label="Total Orders" icon={ShoppingCart} borderClass="border-l-blue-500 text-blue-500"
              value={fNum(data.totalOrders)} sub={`${data.paidOrders} paid orders`} trend={data.orderGrowth}
              fillRatio={data.totalOrders > 0 ? data.paidOrders / data.totalOrders : 0}
            />
            <KpiCard
              label="Avg. Order Value" icon={TrendingUp} borderClass="border-l-amber-500 text-amber-500"
              value={fCurrency(data.avgOrderValue)} sub="Per order average"
            />
            <KpiCard
              label="Products Listed" icon={Package} borderClass="border-l-purple-500 text-purple-500"
              value={fNum(data.totalProducts)} sub={`${data.availableProducts} available`}
              fillRatio={data.totalProducts > 0 ? data.availableProducts / data.totalProducts : 0}
            />
          </div>

          {/* ── Revenue Trend Chart ── */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {activeMetric === "revenue" ? "Revenue Trends" : "Order Volume"}
                </h3>
                <p className="text-sm font-medium text-muted-foreground mt-1">
                  {filteredMonthly.length > 0
                    ? `From ${filteredMonthly[0].label} to ${filteredMonthly[filteredMonthly.length - 1].label}`
                    : "No data yet"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-muted/50 p-1 border border-border rounded-xl">
                  {(["revenue", "orderCount"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setActiveMetric(m)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeMetric === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m === "revenue" ? "Revenue" : "Orders"}
                    </button>
                  ))}
                </div>
                <div className="flex bg-muted/50 p-1 border border-border rounded-xl">
                  <button
                    onClick={() => setChartMode("area")}
                    className={`p-1.5 rounded-lg transition-all ${chartMode === "area" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setChartMode("bar")}
                    className={`p-1.5 rounded-lg transition-all ${chartMode === "bar" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-80">
              {filteredMonthly.length === 0 ? (
                <EmptyChart icon={Activity} message="No revenue data available for selected timeframe." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartMode === "area" ? (
                    <AreaChart data={filteredMonthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: "currentColor", opacity: 0.5, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis
                        tick={{ fill: "currentColor", opacity: 0.5, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} width={80}
                        tickFormatter={(v) => activeMetric === "revenue" ? fCurrency(v) : fNum(v)}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'currentColor', strokeOpacity: 0.2, strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area
                        type="monotone" dataKey={activeMetric}
                        name={activeMetric === "revenue" ? "revenue" : "orders"}
                        stroke="#3b82f6"
                        strokeWidth={3} fill="url(#grad1)"
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0, fill: "#3b82f6" }}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={filteredMonthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: "currentColor", opacity: 0.5, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis
                        tick={{ fill: "currentColor", opacity: 0.5, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} width={80}
                        tickFormatter={(v) => activeMetric === "revenue" ? fCurrency(v) : fNum(v)}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", opacity: 0.05, radius: 8 } as any} />
                      <Bar
                        dataKey={activeMetric} name={activeMetric === "revenue" ? "revenue" : "orders"}
                        fill="#3b82f6" radius={[6, 6, 0, 0]}
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
              <CardHeader title="Category Breakdown" subtitle="Revenue distribution across categories" />
              {filteredCategories.length === 0 ? (
                <EmptyChart icon={Layers} message="No category data found." />
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={filteredCategories} cx="50%" cy="50%"
                          innerRadius={70} outerRadius={100} paddingAngle={2}
                          dataKey="revenue" nameKey="category"
                          stroke="none"
                        >
                          {filteredCategories.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0];
                          return (
                            <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg">
                              <p className="text-xs text-muted-foreground font-semibold mb-1">
                                {p.name ? (CATEGORY_LABELS[p.name as string] ?? p.name) : "Unknown"}
                              </p>
                              <p className="text-sm font-bold text-foreground">{fCurrency(p.value as number)}</p>
                              <p className="text-xs text-muted-foreground mt-1">{p.payload.orderCount} orders</p>
                            </div>
                          );
                        }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-6 space-y-2">
                    {filteredCategories.map((c, i) => {
                      const total = filteredCategories.reduce((a, x) => a + x.revenue, 0);
                      const pct = total > 0 ? ((c.revenue / total) * 100).toFixed(1) : "0";
                      return (
                        <div key={c.category} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                          <span className="text-sm font-semibold text-foreground flex-1">{CATEGORY_LABELS[c.category] ?? c.category}</span>
                          <span className="text-xs text-muted-foreground">({c.orderCount})</span>
                          <span className="text-sm font-bold text-foreground w-12 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>

            {/* Top 5 Products */}
            <Card className="lg:col-span-7">
              <CardHeader title="Top Products" subtitle="Highest generating products by revenue" />
              {data.topProducts.length === 0 ? (
                <EmptyChart icon={Package} message="No product data available yet." />
              ) : (
                <div className="space-y-6">
                  {data.topProducts.map((p, i) => {
                    const maxRev = Math.max(...data.topProducts.map((x) => x.revenue), 1);
                    const pct = (p.revenue / maxRev) * 100;
                    const color = PALETTE[i % PALETTE.length];
                    return (
                      <div key={p.id} className="group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold bg-muted text-foreground">
                              #{i + 1}
                            </div>
                            <div>
                              <p className="text-sm text-foreground font-bold">{p.name}</p>
                              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                {CATEGORY_LABELS[p.category] ?? p.category} · {p.orderCount} orders
                              </p>
                            </div>
                          </div>
                          <p className="text-base font-bold">{fCurrency(p.revenue)}</p>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${pct}%`, backgroundColor: color }}
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
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Geographic Distribution</h3>
                <p className="text-sm font-medium text-muted-foreground mt-1">Global coverage across {data.geographicData.length} countries</p>
              </div>
            </div>

            {data.geographicData.length === 0 ? (
              <EmptyChart icon={Globe} message="No geographic data yet." />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Full-height bar chart */}
                <div style={{ height: Math.max(data.geographicData.length * 50, 300) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.geographicData} layout="vertical"
                      margin={{ top: 0, right: 20, left: 0, bottom: 0 }} barSize={24}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} horizontal={false} />
                      <XAxis type="number" tick={{ fill: "currentColor", opacity: 0.5, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={fCurrency} />
                      <YAxis type="category" dataKey="country" tick={{ fill: "currentColor", opacity: 0.8, fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} width={100} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", opacity: 0.05, radius: 4 }} />
                      <Bar dataKey="revenue" name="revenue" radius={[0, 4, 4, 0]}>
                        {data.geographicData.map((_, i) => (
                          <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Country list */}
                <div className="space-y-2 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                  {data.geographicData.map((g, i) => (
                    <div
                      key={g.country}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-muted text-foreground">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{g.country}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{g.orderCount} orders</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-foreground">{fCurrency(g.revenue)}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{((g.revenue / maxGeo) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* ── Payment Status & Order Status ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Payment Status */}
            <Card className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Payment Status</h3>
                  <p className="text-sm font-medium text-muted-foreground mt-1">Transaction settlement overview</p>
                </div>
              </div>

              {data.totalOrders === 0 ? (
                <EmptyChart icon={CreditCard} message="No payment data available." />
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Donut */}
                  <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentDonutData} cx="50%" cy="50%"
                          innerRadius={70} outerRadius={100} paddingAngle={4}
                          dataKey="value" stroke="none"
                        >
                          {paymentDonutData.map((d, i) => (
                            <Cell key={i} fill={d.color} />
                          ))}
                        </Pie>
                        <Tooltip content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0];
                          return (
                            <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg">
                              <p className="text-xs font-bold mb-1" style={{ color: p.payload.color }}>{p.name}</p>
                              <p className="text-sm font-bold text-foreground">{fNum(p.value as number)} orders</p>
                            </div>
                          );
                        }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-3xl font-bold text-foreground">{data.paymentBreakdown.PAID}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-1">Paid</p>
                    </div>
                  </div>

                  {/* Breakdown cards */}
                  <div className="space-y-3">
                    {[
                      { label: "Paid", count: data.paymentBreakdown.PAID, rev: data.paidRevenue, colorClass: "text-emerald-500 bg-emerald-500/10", borderClass: "border-emerald-500/20", icon: CheckCircle2 },
                      { label: "Pending", count: data.paymentBreakdown.PENDING, rev: data.pendingRevenue, colorClass: "text-amber-500 bg-amber-500/10", borderClass: "border-amber-500/20", icon: Clock },
                      { label: "Failed", count: data.paymentBreakdown.FAILED, rev: 0, colorClass: "text-red-500 bg-red-500/10", borderClass: "border-red-500/20", icon: XCircle },
                      { label: "Refunded", count: data.paymentBreakdown.REFUNDED, rev: 0, colorClass: "text-slate-500 bg-slate-500/10", borderClass: "border-slate-500/20", icon: AlertCircle },
                    ].filter((s) => s.count > 0 || s.label === "Paid").map((s) => (
                      <div key={s.label} className={`flex items-center gap-4 p-4 rounded-xl border ${s.borderClass}`}>
                        <div className={`p-2 rounded-lg ${s.colorClass}`}>
                          <s.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground">{s.label}</p>
                          {s.rev > 0 && <p className="text-xs font-medium text-muted-foreground mt-0.5">{fCurrency(s.rev)}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-foreground">{fNum(s.count)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
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
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Truck className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Order Pipeline</h3>
              </div>

              {orderStatusData.length === 0 ? (
                <EmptyChart icon={ShoppingCart} message="No order status data yet." />
              ) : (
                <div className="space-y-4">
                  {[
                    { label: "Delivered", count: data.orderStatusBreakdown.DELIVERED, color: "#10b981", icon: CheckCircle2 },
                    { label: "Shipped", count: data.orderStatusBreakdown.SHIPPED, color: "#3b82f6", icon: Truck },
                    { label: "Processing", count: data.orderStatusBreakdown.PROCESSING, color: "#8b5cf6", icon: RefreshCw },
                    { label: "Confirmed", count: data.orderStatusBreakdown.CONFIRMED, color: "#06b6d4", icon: CheckCircle2 },
                    { label: "Pending", count: data.orderStatusBreakdown.PENDING, color: "#f59e0b", icon: Clock },
                    { label: "Cancelled", count: data.orderStatusBreakdown.CANCELLED, color: "#ef4444", icon: XCircle },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <s.icon className="w-4 h-4 flex-shrink-0" style={{ color: s.color }} />
                      <span className="text-sm font-medium text-muted-foreground w-24 flex-shrink-0">{s.label}</span>
                      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${data.totalOrders > 0 ? (s.count / data.totalOrders) * 100 : 0}%`, backgroundColor: s.color }}
                        />
                      </div>
                      <span className="text-sm font-bold text-foreground w-8 text-right flex-shrink-0">{s.count}</span>
                    </div>
                  ))}

                  {/* Shipment mini summary */}
                  {Object.values(data.shipmentBreakdown).some((v) => v > 0) && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-xs text-muted-foreground font-semibold mb-4 uppercase tracking-wider">Active Shipments</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "In Transit", count: data.shipmentBreakdown.IN_TRANSIT, colorClass: "text-blue-500 bg-blue-500/10" },
                          { label: "Delivered", count: data.shipmentBreakdown.DELIVERED, colorClass: "text-emerald-500 bg-emerald-500/10" },
                          { label: "Customs", count: data.shipmentBreakdown.CUSTOMS, colorClass: "text-amber-500 bg-amber-500/10" },
                          { label: "Returned", count: data.shipmentBreakdown.RETURNED, colorClass: "text-red-500 bg-red-500/10" },
                        ].filter((s) => s.count > 0).map((s) => (
                          <div key={s.label} className={`flex items-center justify-between p-3 rounded-xl ${s.colorClass}`}>
                            <span className="text-sm font-semibold">{s.label}</span>
                            <span className="text-sm font-bold">{s.count}</span>
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
