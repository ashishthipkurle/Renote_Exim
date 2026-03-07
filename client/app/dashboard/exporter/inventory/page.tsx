import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/supabase/server";
import { Prisma } from "@prisma/client";
import InventoryTable from "./InventoryTable";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

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
  } catch (e) {
    console.warn("Failed to fetch products:", e);
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

  return (
    <div className="h-full overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Inventory Hub</h1>
            <p className="text-slate-400 mt-1">
              Manage your product listings — {totalListed} products total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/exporter/inventory/new"
              className="inline-flex items-center gap-2 bg-primary hover:bg-[#0f49bd] text-white font-black text-xs uppercase tracking-widest py-3 px-6 rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Listing
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 custom-scrollbar">
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

        {/* Interactive Products table */}
        <div className="max-w-[1600px] mx-auto pb-12">
          <InventoryTable products={products} />

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
