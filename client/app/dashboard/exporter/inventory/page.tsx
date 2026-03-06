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
  searchParams: { search?: string; category?: string; status?: string };
}) {
  const auth = await getServerAuth();
  if (!auth) redirect("/login");
  if (auth.role !== "EXPORTER" && auth.role !== "ADMIN") {
    redirect(`/dashboard/${auth.role.toLowerCase()}`);
  }

  // Build where clause based on searchParams
  const where: Prisma.ProductWhereInput = { exporterId: auth.userId };

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  if (searchParams.category) {
    // Cast to expected enum, relying on UI to provide correct values
    where.category = searchParams.category as any;
  }

  if (searchParams.status === "ACTIVE") {
    where.available = true;
  } else if (searchParams.status === "INACTIVE") {
    where.available = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100, // Still taking 100 for now, full pagination later if needed
    });
  } catch (e) {
    console.warn("Failed to fetch products (DB may be unavailable):", e);
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

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Inventory Hub</h1>
            <p className="text-slate-400 mt-1">
              Manage your product listings — {totalListed} products, {totalAvailable} available
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/exporter/inventory/new"
              className="inline-flex items-center gap-2 bg-primary hover:bg-[#0f49bd] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Listing
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { k: "Total Listings", v: String(totalListed), color: "text-primary", bar: "bg-primary" },
            { k: "Available", v: String(totalAvailable), color: "text-emerald-400", bar: "bg-emerald-400" },
            { k: "Est. Portfolio Value", v: formatMoney(totalValue), color: "text-[#d4af37]", bar: "bg-[#d4af37]" },
          ].map((s) => (
            <div key={s.k} className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.k}</div>
              <div className={`text-3xl font-black mt-2 ${s.color}`}>{s.v}</div>
              <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${s.bar} w-[60%]`} />
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Products table */}
        <InventoryTable products={products} />
      </div>
    </div>
  );
}
