import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, X } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/supabase/server";
import { Prisma } from "@prisma/client";
import InventoryTable from "./InventoryTable";
import CategoryDirectory from "./CategoryDirectory";
import ProductForm from "@/components/dashboard/ProductForm";

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

    categoriesData = rawCategories.map((c) => ({
      name: c.category,
      productCount: c._count.id,
      revenue: revenueMap.get(c.category) ?? 0,
    })).sort((a, b) => b.revenue - a.revenue);

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
    totalAvailable = allProducts.filter((p) => p.available).length;
    totalValue = allProducts.reduce((acc, p) => acc + p.price * (p.minOrderQty ?? 1), 0);
  } catch (e) {
    console.warn("Failed to fetch summary stats:", e);
  }

  const totalPages = Math.ceil(total / limit);
  const maxCategoryRev = Math.max(...(categoriesData.map((c) => c.revenue) ?? [1]), 1);

  return (
    <div className="h-full overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Inventory Hub</h1>
            <p className="text-slate-400 mt-1">
              Manage product listings and category performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/exporter/inventory?action=new"
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
            { k: "Available", v: String(totalAvailable), color: "text-emerald-400", bar: "bg-emerald-400" },
            { k: "Est. Portfolio Value", v: formatMoney(totalValue), color: "text-amber-400", bar: "bg-amber-400" },
          ].map((s) => (
            <div key={s.k} className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-white/10 transition-colors" />
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{s.k}</div>
              <div className={`text-4xl font-black mt-3 ${s.color}`}>{s.v}</div>
              <div className="mt-6 h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
                <div className={`h-full ${s.bar} w-[60%] shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
              </div>
            </div>
          ))}
        </div>

        {/* NEW: Category Selection Directory */}
        <div className="max-w-[1600px] mx-auto">
          <CategoryDirectory usedCategories={categoriesData.map(c => c.name)} />
        </div>

        {/* Category Performance */}
        <div className="max-w-[1600px] mx-auto">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 opacity-80 border-b border-white/10 pb-2 inline-block">
            Category Performance
          </h2>
          {categoriesData.length === 0 ? (
            <div className="rounded-3xl border border-white/5 bg-[#151c2a]/40 p-12 text-center text-slate-500 italic">
              Create your first product to see category performance analytics.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoriesData.map((c) => {
                const styleDef = CATEGORY_COLORS[c.name] || CATEGORY_COLORS.OTHER;
                const bgClasses = styleDef.split(" ").slice(0, -1).join(" ");
                const textClass = styleDef.split(" ").pop(); // gets the text color for the title

                return (
                  <div key={c.name} className={`bg-gradient-to-br ${bgClasses} backdrop-blur-xl border shadow-xl rounded-2xl p-5 hover:-translate-y-1 transition-transform group`}>
                    <div className={`font-black text-sm uppercase tracking-wider ${textClass} opacity-90`}>{c.name}</div>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Products</div>
                        <div className="text-white font-black text-xl">{formatNumber(c.productCount)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Revenue</div>
                        <div className="text-emerald-400 font-black text-xl">{formatMoney(c.revenue)}</div>
                      </div>
                    </div>
                    <div className="mt-4 h-1 w-full bg-slate-800/60 rounded-full overflow-hidden">
                      <div className="h-full bg-white/40 rounded-full group-hover:bg-white/80 transition-all duration-500" style={{ width: `${Math.max((c.revenue / maxCategoryRev) * 100, 5)}%` }} />
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
                className={`px-6 py-3 rounded-2xl border border-white/5 text-[10px] uppercase font-black tracking-widest transition-all ${page <= 1 ? "opacity-50 pointer-events-none" : "hover:bg-white/5"
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
                        className={`w-11 h-11 flex items-center justify-center rounded-2xl border text-[10px] font-black transition-all ${page === p ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" : "border-white/5 hover:bg-white/5 text-slate-500"
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
                className={`px-6 py-3 rounded-2xl border border-white/5 text-[10px] uppercase font-black tracking-widest transition-all ${page >= totalPages ? "opacity-50 pointer-events-none" : "hover:bg-white/5"
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