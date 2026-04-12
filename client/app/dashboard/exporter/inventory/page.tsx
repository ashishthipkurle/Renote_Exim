import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Package, TrendingUp, BarChart2, Globe, ArrowRight, ArrowLeft, Layers, ShieldCheck, ShoppingCart } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/auth-server";
import { Prisma } from "@prisma/client";
import InventoryTable from "./InventoryTable";

function formatNumber(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(n);
}

const CATEGORY_COLORS: Record<string, string> = {
  CHEMICALS: "bg-primary text-primary-foreground",
  MACHINES: "bg-black/10 dark:bg-white/15 border-border dark:border-white/20 text-foreground dark:text-white",
  TEXTILES: "bg-black/5 dark:bg-white/10 border-border dark:border-white/10 text-muted-foreground",
  MEDICAL: "bg-black/5 dark:bg-white/10 border-border dark:border-white/10 text-muted-foreground/60",
  HANDICRAFTS: "bg-black/5 dark:bg-white/10 border-border dark:border-white/10 text-muted-foreground/40",
  FOOD: "bg-black/5 dark:bg-white/10 border-border dark:border-white/10 text-muted-foreground/30",
  ELECTRONICS: "bg-primary text-primary-foreground dark:shadow-md shadow-none",
  AUTOMOTIVE: "bg-black/10 dark:bg-white/15 border-border dark:border-white/20 text-foreground dark:text-white",
  CONSTRUCTION: "bg-black/5 dark:bg-white/10 border-border dark:border-white/10 text-muted-foreground",
  AGRICULTURE: "bg-black/5 dark:bg-white/10 border-border dark:border-white/10 text-muted-foreground/60",
  OTHER: "bg-black/5 dark:bg-white/10 border-border dark:border-white/10 text-muted-foreground/40",
};

export default async function ExporterInventoryPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; status?: string; page?: string };
}) {
  const auth = await getServerAuthContext();
  if (!auth) redirect("/login");
  if (auth.role !== "EXPORTER" && auth.role !== "ADMIN") {
    redirect(`/dashboard/${auth.role.toLowerCase()}`);
  }

  const page = parseInt(searchParams.page || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build where clause based on searchParams
  const where: Prisma.ProductWhereInput = { exporterId: auth.userId };

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  if (searchParams.category) {
    where.category = searchParams.category as any;
  }

  if (searchParams.status === "ACTIVE") {
    where.available = true;
  } else if (searchParams.status === "INACTIVE") {
    where.available = false;
  }

  let products: any[] = [];
  let total = 0;
  let categoriesData: Array<{ name: string; productCount: number; revenue: number }> = [];

  try {
    [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Fetch Category Stats
    const rawCategories = await prisma.product.groupBy({
      by: ['category'],
      where: { exporterId: auth.userId },
      _count: { id: true },
    });

    const revenueData = await prisma.$queryRaw`
      SELECT p.category, COALESCE(SUM(o."totalPrice"), 0) as revenue
      FROM products p
      LEFT JOIN orders o ON o."productId" = p.id
      WHERE p."exporterId" = ${auth.userId}
      GROUP BY p.category
      ORDER BY revenue DESC
    ` as Array<{ category: string; revenue: number }>;

    const revenueMap = new Map(revenueData.map((r) => [r.category, Number(r.revenue)]));

    categoriesData = rawCategories.map((c: any) => ({
      name: c.category,
      productCount: c._count.id,
      revenue: revenueMap.get(c.category) ?? 0,
    })).sort((a: any, b: any) => b.revenue - a.revenue);

  } catch (e) {
    console.warn("Failed to fetch inventory data:", e);
  }

  // Get total stats (ignoring filters for the summary cards)
  let totalListed = 0;
  let totalAvailable = 0;
  let totalValue = 0;

  try {
    const allProducts = await prisma.product.findMany({
      where: { exporterId: auth.userId },
      select: { available: true, price: true, minOrderQty: true },
    });
    totalListed = allProducts.length;
    totalAvailable = allProducts.filter((p: any) => p.available).length;
    totalValue = allProducts.reduce((acc: number, p: any) => acc + p.price * (p.minOrderQty ?? 1), 0);
  } catch (e) {
    console.warn("Failed to fetch summary stats:", e);
  }

  const totalPages = Math.ceil(total / limit);
  const maxCategoryRev = Math.max(...(categoriesData.map((c) => c.revenue) ?? [1]), 1);

  return (
    <div className="h-full overflow-hidden flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* ── Header ── */}
      <header className="flex-shrink-0 px-10 py-10 border-b border-border dark:border-white/5 bg-background/40 backdrop-blur-3xl z-40">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground dark:text-white uppercase italic">Inventory Intelligence</h1>
            <p className="text-muted-foreground/40 mt-3 text-[10px] font-black uppercase tracking-[0.3em] italic">
              System Node Override: Managing {totalListed} primary assets across {categoriesData.length} sectors
            </p>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/dashboard/exporter/inventory/add"
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] italic py-4 px-8 rounded-2xl shadow-2xl shadow-white/5 transition-all active:scale-95 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              Initialize Asset
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-16 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-[1700px] mx-auto">
          {[
            { k: "Total Listed Assets", v: String(totalListed), sub: "System Registry Count", icon: Package },
            { k: "Active Telemetry", v: String(totalAvailable), sub: "Signal Verified Link", icon: ShieldCheck },
            { k: "Max Potential Yield", v: formatMoney(totalValue), sub: "Portfolio Index Val", icon: TrendingUp },
          ].map((s) => (
            <div key={s.k} className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 p-10 relative overflow-hidden group rounded-[2.5rem] transition-all hover:border-border dark:border-white/10 shadow-xl dark:shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 dark:bg-white/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-black/10 dark:bg-white/15 transition-colors pointer-events-none" />
              <div className="flex items-start justify-between relative z-10 mb-8">
                <div>
                  <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">{s.k}</div>
                  <div className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest mt-1">{s.sub}</div>
                </div>
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 text-foreground dark:text-white transition-all group-hover:scale-110">
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-4xl font-black text-foreground dark:text-white italic tracking-tighter uppercase group-hover:translate-x-1 transition-transform">{s.v}</div>
              <div className="mt-8 h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4 dark:shadow-md shadow-none transition-all duration-1000 delay-300" />
              </div>
            </div>
          ))}
        </div>


        {/* Category Performance Matrix */}
        <div className="max-w-[1700px] mx-auto space-y-10">
          <div className="flex items-center gap-5 border-b border-border dark:border-white/5 pb-6">
            <BarChart2 className="w-5 h-5 text-foreground dark:text-white" />
            <h2 className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.4em] italic">
              Sector Performance Matrix
            </h2>
          </div>

          {categoriesData.length === 0 ? (
            <div className="rounded-[3rem] border border-border dark:border-white/5 bg-card/40 dark:bg-white/5 p-20 text-center shadow-xl dark:shadow-2xl backdrop-blur-3xl">
              <div className="flex flex-col items-center gap-6 opacity-40">
                <Layers className="w-12 h-12 text-foreground dark:text-white" />
                <p className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.3em] italic max-w-[300px] leading-relaxed">
                  Primary asset registry dormant. Initialize first transmission to generate performance telemetry.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoriesData.map((c) => {
                const colorDef = CATEGORY_COLORS[c.name] || CATEGORY_COLORS.OTHER;
                return (
                  <div key={c.name} className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 shadow-xl dark:shadow-2xl rounded-[2rem] p-8 hover:-translate-y-2 transition-all duration-500 group border-border dark:border-white/5 hover:border-border dark:border-white/10">
                    <div className="flex items-start justify-between mb-8">
                      <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic ${colorDef} transition-all`}>
                        {c.name}
                      </div>
                      <div className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-tighter">SIG_LINK_{c.name.slice(0, 3)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[9px] text-muted-foreground/40 uppercase tracking-widest font-black italic">Assets</div>
                        <div className="text-foreground dark:text-white font-black text-2xl italic tracking-tighter mt-1">{formatNumber(c.productCount)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-muted-foreground/40 uppercase tracking-widest font-black italic">Capital</div>
                        <div className="text-foreground dark:text-white font-black text-2xl italic tracking-tighter mt-1">{formatMoney(c.revenue)}</div>
                      </div>
                    </div>
                    <div className="mt-8 h-1 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary dark:shadow-md shadow-none transition-all duration-1000 delay-500"
                        style={{ width: `${Math.max((c.revenue / maxCategoryRev) * 100, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Asset Registry */}
        <div className="max-w-[1700px] mx-auto space-y-10 pb-20">
          <div className="flex items-center gap-5 border-b border-border dark:border-white/5 pb-6">
            <ShoppingCart className="w-5 h-5 text-foreground dark:text-white" />
            <h2 className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.4em] italic">
              Global Asset Registry Grid
            </h2>
          </div>

          <InventoryTable
            products={products}
            availableCategories={categoriesData.map(c => c.name)}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-20">
              <Link
                href={`?${new URLSearchParams({ ...searchParams, page: (page - 1).toString() })}`}
                className={`px-8 py-4 rounded-2xl bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 text-[10px] uppercase font-black tracking-widest italic transition-all backdrop-blur-3xl ${page <= 1 ? "opacity-20 pointer-events-none" : "hover:bg-black/10 dark:bg-white/15 hover:border-border dark:border-white/20 text-foreground dark:text-white"
                  }`}
              >
                <ArrowLeft className="w-4 h-4 inline-block mr-2" /> Previous Signal
              </Link>
              <div className="flex items-center gap-3">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                    return (
                      <Link
                        key={p}
                        href={`?${new URLSearchParams({ ...searchParams, page: p.toString() })}`}
                        className={`w-14 h-14 flex items-center justify-center rounded-2xl border text-[10px] font-black transition-all backdrop-blur-3xl ${page === p
                          ? "bg-primary border-transparent text-primary-foreground shadow-2xl shadow-white/10 scale-110"
                          : "bg-card/40 dark:bg-white/5 border-border dark:border-white/5 text-muted-foreground hover:bg-black/10 dark:bg-white/15 hover:border-border dark:border-white/20 hover:text-foreground dark:text-white"
                          }`}
                      >
                        {p < 10 ? `0${p}` : p}
                      </Link>
                    );
                  }
                  if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="text-white/20 px-2 font-black italic">...</span>;
                  }
                  return null;
                })}
              </div>
              <Link
                href={`?${new URLSearchParams({ ...searchParams, page: (page + 1).toString() })}`}
                className={`px-8 py-4 rounded-2xl bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 text-[10px] uppercase font-black tracking-widest italic transition-all backdrop-blur-3xl ${page >= totalPages ? "opacity-20 pointer-events-none" : "hover:bg-black/10 dark:bg-white/15 hover:border-border dark:border-white/20 text-foreground dark:text-white"
                  }`}
              >
                Next Signal <ArrowRight className="w-4 h-4 inline-block ml-2" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
