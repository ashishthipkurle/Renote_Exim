import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Package, Search } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/supabase/server";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default async function ExporterInventoryPage() {
  const auth = await getServerAuth();
  if (!auth) redirect("/login");
  if (auth.role !== "EXPORTER" && auth.role !== "ADMIN") {
    redirect(`/dashboard/${auth.role.toLowerCase()}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: { exporterId: auth.userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (e) {
    console.warn("Failed to fetch products (DB may be unavailable):", e);
  }

  const totalListed = products.length;
  const totalAvailable = products.filter((p) => p.available).length;
  const totalValue = products.reduce((acc, p) => acc + p.price * (p.minOrderQty ?? 1), 0);

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

        {/* Products table */}
        <div className="space-y-4">
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-4">Product</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">MOQ / Origin</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {products.length === 0 ? (
            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-12 text-center">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No products yet</h2>
              <p className="text-slate-400 text-sm mb-4">
                Add your first product listing to start receiving orders.
              </p>
              <Link
                href="/dashboard/exporter/inventory/new"
                className="inline-flex items-center gap-2 bg-primary hover:bg-[#0f49bd] text-white font-bold py-2 px-4 rounded-xl text-sm"
              >
                <Plus className="w-4 h-4" />
                Add First Product
              </Link>
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 hover:border-primary/30 transition-colors shadow-xl rounded-2xl p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
              >
                <div className="lg:col-span-4 flex items-center gap-4">
                  <div className="size-14 rounded-xl bg-slate-800 border border-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{product.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {product.description || "No description"}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-white/5 text-[10px] text-slate-400 font-medium">
                    {product.category}
                  </span>
                </div>

                <div className="lg:col-span-2">
                  <div className="text-white font-bold">{formatMoney(product.price)}</div>
                  <div className="text-[10px] text-slate-500">per {product.unit}</div>
                </div>

                <div className="lg:col-span-2">
                  <div className="text-sm text-slate-300">{product.minOrderQty} {product.unit}</div>
                  <div className="text-[10px] text-slate-500">{product.originCountry}</div>
                </div>

                <div className="lg:col-span-2 flex justify-end">
                  <span
                    className={
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide " +
                      (product.available
                        ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                        : "text-red-400 bg-red-400/10 border-red-400/20")
                    }
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {product.available ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
