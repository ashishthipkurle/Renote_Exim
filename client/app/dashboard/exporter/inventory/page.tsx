import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/supabase/server";
import { Prisma } from "@prisma/client";
import InventoryTable from "./InventoryTable";


function formatNumber(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const CATEGORY_COLORS: Record<string, string> = {
  CHEMICALS: "from-violet-500/20 to-purple-500/10 border-violet-500/20 text-violet-400",
  MACHINES: "from-sky-500/20 to-cyan-500/10 border-sky-500/20 text-sky-400",
  TEXTILES: "from-pink-500/20 to-rose-500/10 border-pink-500/20 text-pink-400",
  MEDICAL: "from-emerald-500/20 to-green-500/10 border-emerald-500/20 text-emerald-400",
  HANDICRAFTS: "from-amber-500/20 to-yellow-500/10 border-amber-500/20 text-amber-400",
  FOOD: "from-orange-500/20 to-red-500/10 border-orange-500/20 text-orange-400",
  ELECTRONICS: "from-blue-500/20 to-indigo-500/10 border-blue-500/20 text-blue-400",
  AUTOMOTIVE: "from-slate-500/20 to-gray-500/10 border-slate-500/20 text-slate-400",
  CONSTRUCTION: "from-stone-500/20 to-zinc-500/10 border-stone-500/20 text-stone-400",
  AGRICULTURE: "from-lime-500/20 to-green-500/10 border-lime-500/20 text-lime-400",
  OTHER: "from-gray-500/20 to-slate-500/10 border-gray-500/20 text-gray-400",
};

export default async function ExporterInventoryPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; status?: string; page?: string };
}) {
  const auth = await getServerAuth();
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
    <div className="h-full overflow-hidden flex flex-col bg-background transition-colors duration-300">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-border bg-header backdrop-blur-sm z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Inventory Hub</h1>
            <p className="text-muted-foreground mt-1">
              Manage product listings and category performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/exporter/inventory/add"
              className="inline-flex items-center gap-2 bg-primary hover:bg-[#0f49bd] text-white font-black text-xs uppercase tracking-widest py-3 px-6 rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Listing
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-12 custom-scrollbar">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
          {[
            { k: "Total Listings", v: String(totalListed), color: "text-primary", bar: "bg-primary" },
            { k: "Available", v: String(totalAvailable), color: "text-emerald-500", bar: "bg-emerald-500" },
            { k: "Est. Portfolio Value", v: formatMoney(totalValue), color: "text-amber-500", bar: "bg-amber-500" },
          ].map((s) => (
            <div key={s.k} className="bg-card backdrop-blur-xl border border-border shadow-xl p-8 relative overflow-hidden group rounded-3xl transition-all hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-muted/50 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-muted transition-colors" />
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{s.k}</div>
              <div className={`text-4xl font-black mt-3 ${s.color}`}>{s.v}</div>
              <div className="mt-6 h-1 w-full bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${s.bar} w-[60%] shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
              </div>
            </div>
          ))}
        </div>

        {/* New Inventory Insights Section */}
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recently Listed */}
          <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6">
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest opacity-80 border-b border-border pb-2 inline-block self-start">
              Recently Listed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.slice(0, 4).length === 0 ? (
                <div className="col-span-full py-12 bg-card/50 border border-border border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground gap-3">
                   <Plus className="w-8 h-8 opacity-20" />
                   <p className="text-xs font-medium italic">No products listed yet.</p>
                </div>
              ) : (
                products.slice(0, 4).map((p) => {
                  const styleDef = CATEGORY_COLORS[p.category] || CATEGORY_COLORS.OTHER;
                  const textClass = styleDef.split(" ").pop();
                  return (
                    <div key={p.id} className="bg-card border border-border rounded-[1.5rem] p-5 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-3">
                          <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${textClass} bg-muted/50 border border-border`}>
                            {p.category}
                          </div>
                       </div>
                       <h3 className="text-sm font-black text-foreground mt-2 truncate w-[80%]">{p.name}</h3>
                       <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{p.description}</p>
                       <div className="mt-4 flex items-center justify-between">
                          <div className="text-primary font-black text-sm">{formatMoney(p.price)}</div>
                          <div className="text-[10px] font-bold text-muted-foreground">MOQ: {p.minOrderQty}</div>
                       </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Stats/Alerts (Optional, using as space filler) */}
          <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6">
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest opacity-80 border-b border-border pb-2 inline-block self-start">
              Inventory Stats
            </h2>
            <div className="bg-card border border-border rounded-[2.5rem] p-6 h-full flex flex-col justify-center">
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Listings</span>
                     <span className="text-emerald-500 font-black">{totalAvailable} / {totalListed}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(totalAvailable / (totalListed || 1)) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Your inventory is <span className="text-foreground font-black">{Math.round((totalAvailable / (totalListed || 1)) * 100)}% active</span>. Keeping items available increases visibility for global importers.
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="max-w-[1600px] mx-auto">
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-6 opacity-80 border-b border-border pb-2 inline-block">
            Category Performance
          </h2>
          {categoriesData.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground italic shadow-sm dark:shadow-none">
              Create your first product to see category performance analytics.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoriesData.map((c) => {
                const styleDef = CATEGORY_COLORS[c.name] || CATEGORY_COLORS.OTHER;
                const bgClasses = styleDef.split(" ").slice(0, -1).join(" ");
                const textClass = styleDef.split(" ").pop(); // gets the text color for the title

                return (
                  <div key={c.name} className={`bg-gradient-to-br ${bgClasses} backdrop-blur-xl border border-border shadow-sm dark:shadow-xl rounded-2xl p-5 hover:-translate-y-1 transition-transform group text-foreground`}>
                    <div className={`font-black text-sm uppercase tracking-wider ${textClass} opacity-90`}>{c.name}</div>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Products</div>
                        <div className="text-foreground font-black text-xl">{formatNumber(c.productCount)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Revenue</div>
                        <div className="text-emerald-500 font-black text-xl">{formatMoney(c.revenue)}</div>
                      </div>
                    </div>
                    <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/40 dark:bg-white/40 rounded-full group-hover:bg-primary/80 dark:group-hover:bg-white/80 transition-all duration-500" style={{ width: `${Math.max((c.revenue / maxCategoryRev) * 100, 5)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Interactive Products table */}
        <div className="max-w-[1600px] mx-auto pb-12">
          <InventoryTable 
            products={products} 
            availableCategories={categoriesData.map(c => c.name)} 
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 pb-12">
              <Link
                href={`?${new URLSearchParams({ ...searchParams, page: (page - 1).toString() })}`}
                className={`px-6 py-3 rounded-2xl border border-border text-[10px] uppercase font-black tracking-widest transition-all ${page <= 1 ? "opacity-50 pointer-events-none" : "hover:bg-accent text-foreground"
                  }`}
              >
                Prev
              </Link>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                    return (
                      <Link
                        key={p}
                        href={`?${new URLSearchParams({ ...searchParams, page: p.toString() })}`}
                        className={`w-11 h-11 flex items-center justify-center rounded-2xl border text-[10px] font-black transition-all ${page === p ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" : "border-border hover:bg-accent text-muted-foreground"
                          }`}
                      >
                        {p}
                      </Link>
                    );
                  }
                  if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="text-slate-700 px-1 font-black">...</span>;
                  }
                  return null;
                })}
              </div>
              <Link
                href={`?${new URLSearchParams({ ...searchParams, page: (page + 1).toString() })}`}
                className={`px-6 py-3 rounded-2xl border border-border text-[10px] uppercase font-black tracking-widest transition-all ${page >= totalPages ? "opacity-50 pointer-events-none" : "hover:bg-accent text-foreground"
                  }`}
              >
                Next
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}