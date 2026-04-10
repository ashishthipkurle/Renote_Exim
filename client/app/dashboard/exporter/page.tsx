"use client";

import {
  useEffect, useState, useMemo
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp, AlertTriangle, Search, CalendarDays,
  Plus, Package, DollarSign, ShoppingCart, Truck, Filter,
  ChevronDown, ChevronRight, Activity, X, RefreshCw, Wind, Anchor, Globe, Layers
} from "lucide-react";
import {
  authFetch, formatCurrency, timeAgo, getInitials, formatNumber
} from "@/lib/api-utils";
import dynamic from "next/dynamic";
import { useTranslation } from "@/lib/i18n/client";

const ShipTrackingMap = dynamic(() => import("@/components/dashboard/ShipTrackingMap"), { ssr: false });

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ExporterStats {
  totalProducts: number; activeOrders: number;
  totalRevenue: number; totalShipments: number;
}
interface OrderItem {
  id: string; orderNumber: string; totalPrice: number;
  status: string; createdAt: string;
  product: { name: string; category?: string };
  importer: { name: string; companyName: string | null; country: string | null };
}
interface CategoryRevenue { category: string; revenue: number; orderCount: number }
interface Partner {
  id: string; name: string; companyName: string | null;
  country: string | null; verified: boolean;
  orderCount: number; totalValue: number;
}
// region Filter config Moved inside component for i18n
interface LiveRoute {
  id: string; fromPort: string; toPort: string; type: "ocean" | "air" | "land";
  status: string; vessel?: string; cargo?: string; lat?: number; lng?: number;
  lastLocation?: string; importer?: string;
}
const DEMO_ROUTES: LiveRoute[] = [
  { id: "R-1", fromPort: "MUMBAI", toPort: "ROTTERDAM", type: "ocean", status: "In Transit", cargo: "Textiles", lat: 15.2, lng: 60.5 },
  { id: "R-2", fromPort: "DELHI", toPort: "LONDON", type: "air", status: "Scheduled", cargo: "Spices", lat: 25.1, lng: 45.2 },
  { id: "R-3", fromPort: "CHENNAI", toPort: "SINGAPORE", type: "ocean", status: "Departed", cargo: "Tea", lat: 5.5, lng: 90.1 },
];

// period labels moved inside component for i18n

// ─────────────────────────────────────────────────────────────────────────────
// Page constants
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-muted-foreground", CONFIRMED: "text-foreground dark:text-white", PROCESSING: "text-muted-foreground/60",
  SHIPPED: "text-foreground dark:text-white", DELIVERED: "text-foreground dark:text-white", CANCELLED: "text-muted-foreground/40", DISPUTED: "text-muted-foreground/40",
};
const CATEGORY_COLORS: Record<string, { color: string; shadow: string }> = {
  ELECTRONICS: { color: "bg-primary", shadow: "dark:shadow-md shadow-none" },
  MACHINES: { color: "bg-neutral-200", shadow: "shadow-none" },
  CHEMICALS: { color: "bg-neutral-500", shadow: "shadow-none" },
  TEXTILES: { color: "bg-neutral-600", shadow: "shadow-none" },
  MEDICAL: { color: "bg-neutral-400", shadow: "shadow-none" },
  HANDICRAFTS: { color: "bg-neutral-300", shadow: "shadow-none" },
  FOOD: { color: "bg-neutral-100", shadow: "shadow-none" },
  AUTOMOTIVE: { color: "bg-neutral-400", shadow: "shadow-none" },
  CONSTRUCTION: { color: "bg-neutral-500", shadow: "shadow-none" },
  AGRICULTURE: { color: "bg-neutral-300", shadow: "shadow-none" },
  OTHER: { color: "bg-neutral-600", shadow: "shadow-none" },
};
const STATUS_BG: Record<string, string> = {
  PENDING: "bg-black/5 dark:bg-white/10 border-border dark:border-white/10", CONFIRMED: "bg-black/10 dark:bg-white/15 border-white/30",
  PROCESSING: "bg-black/5 dark:bg-white/10 border-border dark:border-white/20", SHIPPED: "bg-black/20 dark:bg-white/20 border-white/40",
  DELIVERED: "bg-white/30 border-white/50", CANCELLED: "bg-muted/10 border-border",
  DISPUTED: "bg-muted/10 border-border",
};
const BG_COLORS = [
  { bg: "bg-black/10 dark:bg-white/15", text: "text-foreground dark:text-white" }, { bg: "bg-muted/50 dark:bg-white/5", text: "text-muted-foreground" },
  { bg: "bg-muted/40", text: "text-foreground dark:text-white" }, { bg: "bg-muted/10", text: "text-muted-foreground/80" },
  { bg: "bg-muted/60", text: "text-white/60" }, { bg: "bg-black/5 dark:bg-white/10", text: "text-muted-foreground/40" },
];
function fmtVal(n: number, pre = "", suf = "") {
  if (n >= 1_000_000) return `${pre}${(n / 1_000_000).toFixed(1)}M${suf}`;
  if (n >= 1_000) return `${pre}${(n / 1_000).toFixed(0)}K${suf}`;
  return `${pre}${n}${suf}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ExporterDashboard() {
  const { t } = useTranslation();
  const router = useRouter();

  const FILTER_CFG: Record<FilterMode, { label: string; icon: string; color: string }> = {
    all: { label: t("dashboard_main.hub_regions.india", "India"), icon: "🇮🇳", color: "#fbbf24" },
    russia: { label: t("dashboard_main.hub_regions.russia", "Russia"), icon: "🇷🇺", color: "#818cf8" },
    europe: { label: t("dashboard_main.hub_regions.europe", "Europe"), icon: "🇪🇺", color: "#67e8f9" },
    usa: { label: t("dashboard_main.hub_regions.usa", "USA"), icon: "🇺🇸", color: "#f472b6" },
    africa: { label: t("dashboard_main.hub_regions.africa", "Africa"), icon: "🌍", color: "#fb923c" },
    asia: { label: t("dashboard_main.hub_regions.asia", "Asia"), icon: "🌏", color: "#c084fc" },
  };

  const PERIOD_LABELS: Record<PeriodFilter, string> = {
    today: t("period.today", "Today"), 
    week: t("period.week", "This Week"), 
    month: t("period.month", "This Month"),
    quarter: t("period.quarter", "This Quarter"), 
    year: t("period.year", "This Year"), 
    all: t("period.all", "All Time"),
  };

  const [data, setData] = useState<ExporterStats | null>(null);
  const [allOrders, setAllOrders] = useState<OrderItem[]>([]);
  const [categories, setCategories] = useState<CategoryRevenue[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [periodOpen, setPeriodOpen] = useState(false);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calMonth, setCalMonth] = useState(new Date());

  // Map state
  const [mapFilter, setMapFilter] = useState<FilterMode>("all");
  const [mapLoading, setMapLoading] = useState(false);
  const [apiRoutes, setApiRoutes] = useState<LiveRoute[]>([]);
  const [regionCounts, setRegionCounts] = useState<Record<string, number>>({});
  const [activeCount, setActiveCount] = useState(0);
  const [mapIsDemo, setMapIsDemo] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [mapRefresh, setMapRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = period !== "all" ? `?period=${period}` : "";
    Promise.all([
      authFetch<ExporterStats>(`/api/stats?scope=exporter${params ? "&" + params.slice(1) : ""}`).catch(() => null),
      authFetch<{ orders: OrderItem[] }>(`/api/orders?limit=20${params ? "&" + params.slice(1) : ""}`).catch(() => ({ orders: [] })),
      authFetch<{ revenueByCategory: CategoryRevenue[] }>(`/api/dashboard/analytics${params}`).catch(() => ({ revenueByCategory: [] })),
      authFetch<{ partners: Partner[] }>("/api/dashboard/directory").catch(() => ({ partners: [] })),
    ]).then(([s, o, a, d]) => {
      setData(s); setAllOrders(o.orders || []); setCategories(a.revenueByCategory || []);
      setPartners((d.partners || []).slice(0, 3)); setLoading(false);
    });
  }, [period]);

  useEffect(() => {
    setMapLoading(true);
    authFetch<{ routes: LiveRoute[]; total: number }>("/api/shipments/active")
      .then(d => {
        if (d?.routes) {
          setApiRoutes(d.routes);
          setActiveCount(d.routes.length);
          setLastUpdate(new Date());
          const counts: Record<string, number> = {};
          d.routes.forEach(r => {
            const key = r.toPort.toLowerCase().includes('russia') ? 'russia' :
              r.toPort.toLowerCase().includes('london') || r.toPort.toLowerCase().includes('rotterdam') ? 'europe' :
                r.toPort.toLowerCase().includes('new_york') ? 'usa' : 'asia';
            counts[key] = (counts[key] || 0) + 1;
          });
          setRegionCounts(counts);
          setMapIsDemo(false);
        } else {
          setMapIsDemo(true);
        }
      })
      .catch(() => setMapIsDemo(true))
      .finally(() => setMapLoading(false));
  }, [mapRefresh]);

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return allOrders.slice(0, 4);
    const q = search.toLowerCase();
    return allOrders.filter(o =>
      o.product.name.toLowerCase().includes(q) ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q) ||
      (o.importer.companyName || o.importer.name).toLowerCase().includes(q) ||
      (o.importer.country || "").toLowerCase().includes(q)
    ).slice(0, 8);
  }, [search, allOrders]);

  const filteredPartners = useMemo(() => {
    if (!search.trim()) return partners;
    const q = search.toLowerCase();
    return partners.filter(p =>
      (p.companyName || p.name).toLowerCase().includes(q) ||
      (p.country || "").toLowerCase().includes(q)
    );
  }, [search, partners]);

  const maxCatRevenue = Math.max(...categories.map(c => c.revenue), 1);
  const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const calDays = useMemo(() => {
    const days = []; const firstDay = getFirstDayOfMonth(calMonth); const total = getDaysInMonth(calMonth);
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= total; i++) days.push(i);
    return days;
  }, [calMonth]);

  const statCards = [
    {
      label: t("dashboard_main.total_products", "Total Products"), value: loading ? "—" : String(data?.totalProducts ?? 0),
      sub: period === "all" ? t("dashboard_main.all_products_label", "All products") : t("dashboard_main.in_period", "In period"),
      icon: <Package className="w-5 h-5" />, href: "/dashboard/exporter/products",
      gradFrom: "from-white", gradTo: "to-neutral-300",
      bgTint: "bg-black/10 dark:bg-white/15", textTint: "text-foreground dark:text-white",
      borderTint: "border-border dark:border-white/20", glowColor: "rgba(255,255,255,0.4)",
      shadow: "dark:shadow-md shadow-none",
      bar: Math.min(((data?.totalProducts ?? 0) / 50) * 100, 100) || 75,
      trendUp: true as boolean | null, trend: "Live",
    },
    {
      label: t("dashboard_main.total_revenue", "Total Revenue"), value: loading ? "—" : fmtVal(data?.totalRevenue ?? 0, "$"),
      sub: PERIOD_LABELS[period],
      icon: <DollarSign className="w-5 h-5" />, href: "/dashboard/exporter/analytics",
      gradFrom: "from-neutral-200", gradTo: "to-neutral-500",
      bgTint: "bg-black/5 dark:bg-white/10", textTint: "text-foreground dark:text-white",
      borderTint: "border-border dark:border-white/10", glowColor: "rgba(255,255,255,0.2)",
      shadow: "dark:shadow-md shadow-none",
      bar: 60, trendUp: true as boolean | null, trend: "+12.5%",
    },
    {
      label: t("dashboard_main.active_orders", "Active Orders"), value: loading ? "—" : String(data?.activeOrders ?? 0),
      sub: t("dashboard_main.in_progress", "In progress"),
      icon: <ShoppingCart className="w-5 h-5" />, href: "/dashboard/exporter/orders",
      gradFrom: "from-neutral-100", gradTo: "to-neutral-400",
      bgTint: "bg-black/10 dark:bg-white/15", textTint: "text-foreground dark:text-white",
      borderTint: "border-border dark:border-white/20", glowColor: "rgba(255,255,255,0.3)",
      shadow: "dark:shadow-md shadow-none",
      bar: Math.min(((data?.activeOrders ?? 0) / 20) * 100, 100) || 85,
      trendUp: true as boolean | null, trend: "Active",
    },
    {
      label: t("dashboard_main.total_shipments", "Total Shipments"), value: loading ? "—" : String(data?.totalShipments ?? 0),
      sub: PERIOD_LABELS[period],
      icon: <Truck className="w-5 h-5" />, href: "/dashboard/exporter/orders",
      gradFrom: "from-orange-600", gradTo: "to-orange-400",
      bgTint: "bg-orange-500/10", textTint: "text-orange-500",
      borderTint: "border-orange-500/20", glowColor: "rgba(249,115,22,0.4)",
      shadow: "shadow-[0_0_20px_rgba(249,115,22,0.3)]",
      bar: 30, trendUp: null as boolean | null, trend: t("period.all", "All time"),
    },
  ];

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(to right,#1f2937 1px,transparent 1px),linear-gradient(to bottom,#1f2937 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <header className="flex-shrink-0 h-24 px-10 flex items-center justify-between border-b border-border dark:border-white/5 bg-background/40 backdrop-blur-xl z-40">
        <div>
          <h1 className="text-3xl font-black text-foreground dark:text-white tracking-tighter flex items-center gap-4 uppercase italic">
            {t("dashboard_main.node_title", "Intelligence Node")}
            <span className="px-3 py-1 rounded-full text-[9px] font-black bg-black/5 dark:bg-white/10 text-foreground dark:text-white border border-border dark:border-white/10 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse dark:shadow-md shadow-none" />{t("dashboard_main.live_feed", "Live Feed")}
            </span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 opacity-40">{t("dashboard_main.sector_interface", "Sector: Exporter Operations / Master Interface")}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-muted/50 dark:bg-white/5 border border-border text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 backdrop-blur-md">
            <Activity className="w-3.5 h-3.5" />
            {t("dashboard_main.system_secure", "System Secure")}
          </div>

          <div className="relative">
            <button
              onClick={() => setPeriodOpen(o => !o)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${periodOpen ? "bg-primary text-primary-foreground border-border dark:border-white" : "bg-muted/50 dark:bg-white/5 border-border text-muted-foreground hover:border-border dark:border-white/20 hover:text-foreground dark:text-white"}`}>
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{PERIOD_LABELS[period]}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${periodOpen ? "rotate-180" : ""}`} />
            </button>
            {periodOpen && (
              <div className="absolute right-0 top-16 w-56 bg-card dark:bg-[#0a0a0a] border border-border dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {(Object.entries(PERIOD_LABELS) as [PeriodFilter, string][]).map(([k, v]) => (
                  <button key={k} onClick={() => { setPeriod(k); setPeriodOpen(false); }}
                    className={`w-full px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${period === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-black/5 dark:bg-white/10 hover:text-foreground dark:text-white"}`}>
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className={`pl-12 pr-10 py-3 bg-muted/50 dark:bg-white/5 border rounded-2xl text-xs text-foreground dark:text-white placeholder:text-muted-foreground/20 w-64 transition-all duration-500 outline-none font-medium italic ${searchFocused ? "border-border dark:border-white/20 bg-muted/40 w-80 dark:shadow-md shadow-none" : "border-border hover:border-border dark:border-white/10"}`}
              placeholder={t("dashboard_main.search_indices", "Search registry indices...")}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/20 pointer-events-none" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground dark:text-white transition-colors"><X className="w-4 h-4" /></button>}
            {searchFocused && search.trim() && (
              <div className="absolute top-16 left-0 w-96 bg-card dark:bg-[#0a0a0a] border border-border dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl z-50 overflow-hidden max-h-[32rem] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
                {filteredOrders.length === 0 ? (
                  <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] py-12 opacity-40">Zero matches in primary indices.</p>
                ) : (
                  <div className="p-2">
                    <p className="text-[9px] text-muted-foreground/40 uppercase tracking-[0.3em] px-4 pt-4 pb-2 font-black italic">Active Transmissions</p>
                    {filteredOrders.slice(0, 5).map((o, idx) => (
                      <Link key={o.id} href={`/dashboard/exporter/orders/${o.id}`}
                        className="flex items-center gap-4 px-4 py-4 hover:bg-black/5 dark:bg-white/10 rounded-xl transition-all group">
                        <div className={`w-10 h-10 rounded-xl ${BG_COLORS[idx % BG_COLORS.length].bg} ${BG_COLORS[idx % BG_COLORS.length].text} flex items-center justify-center font-black text-[10px] flex-shrink-0 border border-border dark:border-white/5`}>
                          {getInitials(o.product.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-foreground dark:text-white font-bold truncate group-hover:translate-x-1 transition-transform">{o.product.name}</p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">{o.orderNumber} · {formatCurrency(o.totalPrice)}</p>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ml-auto flex-shrink-0 border ${STATUS_BG[o.status] || ""} ${STATUS_COLORS[o.status] || ""}`}>{o.status}</span>
                      </Link>
                    ))}
                    {filteredOrders.length > 5 && <p className="text-center text-foreground dark:text-white text-[9px] font-black uppercase tracking-[0.2em] py-4 hover:bg-black/5 dark:bg-white/10 cursor-pointer transition-colors" onClick={() => router.push(`/dashboard/exporter/orders?q=${search}`)}>Full Data set ({filteredOrders.length})</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setCalendarOpen(o => !o)}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all duration-300 ${calendarOpen ? "bg-primary text-primary-foreground border-border dark:border-white" : "bg-muted/50 dark:bg-white/5 border-border hover:bg-black/10 dark:bg-white/15 hover:border-border dark:border-white/20 text-muted-foreground hover:text-foreground dark:text-white"}`}>
              <CalendarDays className="w-5 h-5" />
            </button>
            {calendarOpen && (
              <div className="absolute right-0 top-16 w-80 bg-card dark:bg-[#0a0a0a] border border-border dark:border-white/10 rounded-3xl shadow-xl dark:shadow-2xl z-50 p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:bg-white/15 text-foreground dark:text-white transition-all">‹</button>
                  <span className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.2em] italic">{calMonth.toLocaleString("default", { month: "long", year: "numeric" })}</span>
                  <button onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:bg-white/15 text-foreground dark:text-white transition-all">›</button>
                </div>
                <div className="grid grid-cols-7 mb-4">
                  {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map(d => (
                    <div key={d} className="text-center text-[9px] text-muted-foreground/40 font-black tracking-widest">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calDays.map((day, i) => {
                    if (!day) return <div key={i} className="aspect-square" />;
                    const isSelected = day === selectedDate.getDate() && calMonth.getMonth() === selectedDate.getMonth() && calMonth.getFullYear() === selectedDate.getFullYear();
                    const isToday = day === new Date().getDate() && calMonth.getMonth() === new Date().getMonth() && calMonth.getFullYear() === new Date().getFullYear();
                    return (
                      <button key={i} onClick={() => { setSelectedDate(new Date(calMonth.getFullYear(), calMonth.getMonth(), day)); setCalendarOpen(false); }}
                        className={`w-full aspect-square flex items-center justify-center text-[10px] rounded-xl transition-all duration-200 font-black
                          ${isSelected ? "bg-primary text-primary-foreground dark:shadow-md shadow-none" : isToday ? "bg-black/20 dark:bg-white/20 text-foreground dark:text-white border border-white/40" : "text-muted-foreground/60 hover:bg-black/5 dark:bg-white/10 hover:text-foreground dark:text-white"}`}>
                        {day}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 pt-6 border-t border-border dark:border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                    {selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <button onClick={() => { setSelectedDate(new Date()); setCalMonth(new Date()); setCalendarOpen(false); }}
                    className="text-[9px] font-black text-foreground dark:text-white hover:underline uppercase tracking-widest">Reset</button>
                </div>
              </div>
            )}
          </div>

          <Link href="/dashboard/exporter/products/new"
            className="flex items-center gap-3 px-6 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-white/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4" />
            <span className="hidden lg:inline">{t("dashboard_main.initialize_asset", "Initialize Asset")}</span>
          </Link>
        </div>
      </header>

      {/* ── Click outside to close dropdowns ── */}
      {(periodOpen || calendarOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setPeriodOpen(false); setCalendarOpen(false); }} />
      )}

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1920px] mx-auto space-y-12">

          {/* ── Period filter indicator ── */}
          {period !== "all" && (
            <div className="flex items-center gap-4 px-6 py-3 bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 rounded-2xl w-fit backdrop-blur-xl animate-in slide-in-from-left-4 duration-500">
              <Filter className="w-4 h-4 text-foreground dark:text-white" />
              <span className="text-[10px] text-foreground dark:text-white font-black uppercase tracking-[0.2em]">{t("dashboard_main.temporal_filter", "Temporal Filter")}: {PERIOD_LABELS[period]}</span>
              <button onClick={() => setPeriod("all")} className="ml-4 text-muted-foreground/40 hover:text-foreground dark:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {statCards.map((s) => (
              <Link key={s.label} href={s.href}
                className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 cursor-pointer block shadow-xl dark:shadow-2xl"
              >
                <div className={`absolute -right-12 -top-12 w-48 h-48 ${s.bgTint} rounded-full blur-[80px] transition-all duration-700 group-hover:scale-150 group-hover:opacity-100 opacity-40`} />

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center text-foreground dark:text-white shadow-inner group-hover:scale-110 transition-all duration-300">
                    {s.icon}
                  </div>
                  <span className={`flex items-center text-[9px] font-black px-4 py-1.5 rounded-full border border-border dark:border-white/10 bg-black/5 dark:bg-white/10 text-foreground dark:text-white uppercase tracking-[0.2em] italic`}>
                    {s.trendUp === true && <TrendingUp className="w-3 h-3 mr-2 text-foreground dark:text-white" />}
                    {s.trendUp === false && <AlertTriangle className="w-3 h-3 mr-2 text-foreground dark:text-white" />}
                    {s.trend}
                  </span>
                </div>

                <div className="relative z-10">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-40 italic">{s.label}</p>
                  <p className="text-4xl font-black text-foreground dark:text-white tracking-tighter group-hover:scale-[1.02] origin-left transition-transform duration-300 uppercase italic dark:shadow-md shadow-none">{s.value}</p>
                  <p className="text-muted-foreground/40 text-[9px] font-black uppercase tracking-widest mt-4 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary opacity-20" />
                    {s.sub}
                  </p>
                </div>

                <div className="mt-8 relative z-10">
                  <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000 delay-300"
                      style={{ width: `${s.bar}%`, boxShadow: '0 0 20px rgba(255,255,255,0.4)' }} />
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                  <ChevronRight className="w-5 h-5 text-foreground dark:text-white" />
                </div>
              </Link>
            ))}
          </div>

          {/* ── Map + Transactions ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5" style={{ height: "520px" }}>

            {/* Map */}
            <div className="xl:col-span-2 bg-[#0d1117]/80 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl flex flex-col h-full overflow-hidden">
              {/* Map header */}
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 z-20 relative" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="min-w-0 flex items-center gap-3">
                  <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[14px] font-bold text-white tracking-tight">{t("dashboard_main.global_trade_network", "India Global Trade Network")}</h2>
                      <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${mapIsDemo ? "bg-amber-500/12 border-amber-500/30 text-amber-400" : "bg-green-500/12 border-green-500/30 text-green-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse ${mapIsDemo ? "bg-amber-400" : "bg-green-400"}`} />
                        {mapIsDemo ? "Demo" : "Live"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{activeCount} {t("dashboard_main.active_routes", "active routes")}{lastUpdate && <span> · {lastUpdate.toLocaleTimeString()}</span>}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {(Object.entries(FILTER_CFG) as [FilterMode, typeof FILTER_CFG[FilterMode]][]).map(([mode, cfg]) => {
                    const count = mode === "all" ? activeCount : (regionCounts[mode] ?? 0);
                    const isActive = mapFilter === mode;
                    return (
                      <button key={mode} onClick={() => setMapFilter(mode)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all duration-200"
                        style={{ background: isActive ? `${cfg.color}15` : "transparent", borderColor: isActive ? `${cfg.color}45` : "rgba(255,255,255,0.07)", color: isActive ? cfg.color : "#475569", boxShadow: isActive ? `0 0 12px ${cfg.color}22` : "none" }}>
                        <span>{cfg.icon}</span>
                        <span className="hidden lg:inline">{mode === "all" ? "All" : cfg.label}</span>
                        {count > 0 && <span className="opacity-60 text-[9px]">{count}</span>}
                      </button>
                    );
                  })}
                  <button onClick={() => setMapRefresh(n => n + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/8 text-slate-500 hover:text-white hover:border-white/20 transition-all duration-200">
                    <RefreshCw className={`w-3.5 h-3.5 ${mapLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="flex-1 relative overflow-hidden">
                <ShipTrackingMap filter={mapFilter} routes={mapIsDemo ? DEMO_ROUTES : apiRoutes} />
                {mapLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-30" style={{ background: "rgba(3,8,16,0.55)", backdropFilter: "blur(4px)" }}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 rounded-full border-2 border-yellow-400/30 border-t-yellow-400 animate-spin" />
                      <p className="text-[10px] text-slate-400 font-mono">{t("dashboard_main.loading_routes", "Loading trade routes...")}</p>
                    </div>
                  </div>
                )}
                {/* Legend */}
                <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 z-20">
                  {[{ clr: "#fbbf24", label: "India Hubs", dot: false }, { clr: "#818cf8", label: "Air Freight", dot: true, dashed: false }, { clr: "#67e8f9", label: "Ocean Cargo", dot: true, dashed: true }].map(({ clr, label, dot, dashed }) => (
                    <div key={label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg backdrop-blur-md" style={{ background: "rgba(3,8,15,0.85)", border: `1px solid ${clr}22` }}>
                      {dot ? (<svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke={clr} strokeWidth="1.5" strokeDasharray={dashed ? "5,3" : "none"} /><circle cx="13" cy="3" r="1.8" fill={clr} /></svg>) : (<span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: clr, boxShadow: `0 0 8px ${clr}` }} />)}
                      <span className="text-[9px] font-mono" style={{ color: clr }}>{label}</span>
                    </div>
                  ))}
                </div>
                {/* Region pills */}
                <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-20">
                  {(["russia", "europe", "usa", "africa", "asia"] as FilterMode[]).map(m => {
                    const cfg = FILTER_CFG[m]; const count = regionCounts[m] ?? 0; if (count === 0) return null;
                    const active = mapFilter === m || mapFilter === "all";
                    return (
                      <button key={m} className="flex items-center gap-2 px-2 py-1 rounded-lg backdrop-blur-md transition-all" style={{ background: active ? `${cfg.color}12` : "rgba(3,8,15,0.7)", border: `1px solid ${active ? cfg.color + "28" : "rgba(255,255,255,0.04)"}`, opacity: active ? 1 : 0.4 }} onClick={() => setMapFilter(mapFilter === m ? "all" : m)}>
                        <span className="text-[9px]">{cfg.icon}</span>
                        <span className="text-[9px] font-mono" style={{ color: active ? cfg.color : "#374151" }}>{cfg.label}</span>
                        <span className="text-[10px] font-bold font-mono" style={{ color: active ? cfg.color : "#1f2937" }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Map footer */}
              <div className="flex-shrink-0 flex items-center gap-5 px-5 py-2.5 z-20" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="flex items-center gap-1.5"><Wind className="w-3 h-3 text-indigo-400" /><span className="text-[10px] text-slate-500">Air</span><span className="text-[10px] font-bold text-indigo-400">{(mapIsDemo ? DEMO_ROUTES : apiRoutes).filter(r => r.type === "air").length}</span></div>
                <div className="flex items-center gap-1.5"><Anchor className="w-3 h-3 text-cyan-400" /><span className="text-[10px] text-slate-500">Ocean</span><span className="text-[10px] font-bold text-cyan-400">{(mapIsDemo ? DEMO_ROUTES : apiRoutes).filter(r => r.type === "ocean").length}</span></div>
                <div className="flex items-center gap-1.5"><Layers className="w-3 h-3 text-slate-400" /><span className="text-[10px] text-slate-500">Ports</span><span className="text-[10px] font-bold text-slate-300">{new Set((mapIsDemo ? DEMO_ROUTES : apiRoutes).flatMap(r => [r.fromPort, r.toPort])).size}</span></div>
                <div className="ml-auto"><Link href="/dashboard/exporter/orders" className="flex items-center gap-1 text-[10px] text-primary hover:text-blue-300 font-medium transition-colors">{t("dashboard_main.all_shipments", "All shipments")}<ChevronRight className="w-3 h-3" /></Link></div>
              </div>
            </div>

            <div className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 shadow-xl dark:shadow-2xl rounded-[2.5rem] p-8 flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 dark:bg-white/10 blur-[60px] rounded-full" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h2 className="text-xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">{t("dashboard_main.transmissions", "Transmissions")}</h2>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-40 italic">{search ? `${filteredOrders.length} telemetry matches` : "Real-time stream"}</p>
                </div>
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 text-[9px] text-foreground dark:text-white font-black uppercase tracking-widest">
                  <Activity className="w-3 h-3 animate-pulse" />{t("dashboard_main.live", "Live")}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar relative z-10">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 rounded-2xl bg-black/5 dark:bg-white/10 border border-border dark:border-white/5 opacity-50" />
                  ))
                ) : filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
                    <Activity className="w-12 h-12 text-muted-foreground" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">{search ? "Zero telemetry hits" : "Channel dormant"}</p>
                  </div>
                ) : filteredOrders.map((order, idx) => (
                  <Link key={order.id} href={`/dashboard/exporter/orders/${order.id}`}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 border border-border dark:border-white/5 hover:border-border dark:border-white/10 group cursor-pointer block">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-12 h-12 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center font-black text-[10px] border border-border dark:border-white/10 flex-shrink-0 group-hover:scale-110 transition-transform`}>{getInitials(order.product.name)}</div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-foreground dark:text-white uppercase tracking-wider truncate">{order.product.name}</h4>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1 opacity-60 font-black">{order.importer.companyName || order.importer.name} · {timeAgo(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-black text-foreground dark:text-white italic">{formatCurrency(order.totalPrice)}</p>
                      <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border mt-2 inline-block ${STATUS_BG[order.status] || ""} ${STATUS_COLORS[order.status] || ""}`}>{order.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/dashboard/exporter/analytics"
                className="mt-8 w-full h-14 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:bg-white/15 text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 border border-border dark:border-white/5 hover:border-border dark:border-white/20 flex items-center justify-center gap-3 relative z-10 group overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity" />
                {t("dashboard_main.full_archives", "Access Full Archives")} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ── Revenue + Top Buyers ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
            <div className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 shadow-xl dark:shadow-2xl rounded-[2.5rem] p-10 relative overflow-hidden">
              <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-black/5 dark:bg-white/10 rounded-full blur-[80px]" />
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">{t("dashboard_main.sector_revenue", "Sector Revenue")}</h2>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-40 italic">{t("dashboard_main.sector", "Sector")} / {PERIOD_LABELS[period]}</p>
                </div>
                <Link href="/dashboard/exporter/analytics" className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center text-foreground dark:text-white hover:bg-primary hover:text-primary-foreground transition-all group scale-90">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="space-y-8 relative z-10">
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-black/5 dark:bg-white/10 opacity-50" />
                )) : categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 opacity-40">
                    <Activity className="w-10 h-10" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sensor data unavailable</p>
                  </div>
                ) : categories.slice(0, 6).map((c) => {
                  const pct = maxCatRevenue > 0 ? Math.round((c.revenue / maxCatRevenue) * 100) : 0;
                  const colors = CATEGORY_COLORS[c.category] || CATEGORY_COLORS.OTHER;
                  return (
                    <div key={c.category} className="group">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${colors.color} ${colors.shadow}`} />
                          <span className="text-foreground dark:text-white italic">{c.category.replace(/_/g, " ")}</span>
                          <span className="text-muted-foreground/40 font-medium tracking-tight">[{c.orderCount} transmissions]</span>
                        </div>
                        <span className="text-foreground dark:text-white bg-black/5 dark:bg-white/10 px-3 py-1 rounded border border-border dark:border-white/5 italic">{formatCurrency(c.revenue)}</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden border border-border dark:border-white/5 p-[1px]">
                        <div className={`h-full ${colors.color} rounded-full transition-all duration-1000 delay-100`} style={{ width: `${Math.max(pct, 5)}%`, boxShadow: '0 0 15px rgba(255,255,255,0.2)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 shadow-xl dark:shadow-2xl rounded-[2.5rem] p-10 relative overflow-hidden">
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-black/5 dark:bg-white/10 rounded-full blur-[80px]" />
              <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">{t("dashboard_main.strategic_nodes", "Strategic Nodes")}</h2>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-40 italic">{t("dashboard_main.top_acquisitions", "Top Acquisitions")} / {PERIOD_LABELS[period]}</p>
                </div>
                <Link href="/dashboard/exporter/directory" className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center text-foreground dark:text-white hover:bg-primary hover:text-primary-foreground transition-all group scale-90">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="overflow-x-auto relative z-10 scrollbar-none">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em] border-b border-border dark:border-white/5 italic">
                    <th className="pb-5 pl-2">{t("dashboard_main.node_entity", "Node Entity")}</th><th className="pb-5">{t("dashboard_main.sector", "Sector")}</th><th className="pb-5">{t("dashboard_main.signals", "Signals")}</th><th className="pb-5 text-right pr-2">{t("dashboard_main.valuation", "Valuation")}</th>
                  </tr></thead>
                  <tbody className="text-[10px] font-black uppercase">
                    {loading ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-border dark:border-white/5 opacity-50"><td colSpan={4} className="py-6"><div className="h-8 rounded-xl bg-black/5 dark:bg-white/10" /></td></tr>
                    )) : filteredPartners.length === 0 ? (
                      <tr><td colSpan={4} className="py-20 text-center opacity-40">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero entity matches in sector.</p>
                      </td></tr>
                    ) : filteredPartners.map((p, idx) => (
                      <tr key={p.id} className="border-b border-border dark:border-white/5 last:border-0 group hover:bg-white/[0.03] transition-all cursor-pointer">
                        <td className="py-5 pl-2">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center text-foreground dark:text-white shadow-inner group-hover:scale-110 transition-transform`}>{getInitials(p.companyName || p.name)}</div>
                            <div className="flex flex-col truncate">
                              <span className="text-foreground dark:text-white text-xs tracking-wider italic font-black truncate max-w-[120px]">{p.companyName || p.name}</span>
                              {p.verified && <span className="text-[8px] text-muted-foreground/40 tracking-widest mt-0.5 opacity-60">VERIFIED SIGNAL</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-5"><span className="text-muted-foreground/60 bg-black/5 dark:bg-white/10 px-2 py-1 rounded border border-border dark:border-white/5 truncate">{p.country || "—"}</span></td>
                        <td className="py-5 text-foreground dark:text-white italic">{formatNumber(p.orderCount)}</td>
                        <td className="py-5 text-right pr-2"><span className="text-foreground dark:text-white font-black italic dark:shadow-md shadow-none">{formatCurrency(p.totalValue)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
