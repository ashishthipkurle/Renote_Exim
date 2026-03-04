"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { authFetch, formatCurrency } from "@/lib/api-utils";

interface Product {
  id: string;
  name: string;
  category: string;
  pricePerUnit: number;
  moq: number;
  country: string;
  images: string[];
  createdAt: string;
  user?: { name: string; companyName: string | null };
}

interface ProductsResponse {
  products: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const CATEGORY_FILTERS = ["ALL", "ELECTRONICS", "TEXTILES", "FOOD", "CHEMICALS", "MACHINES", "MEDICAL", "HANDICRAFTS"];

export default function ImporterInventoryPage() {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    if (category !== "ALL") params.set("category", category);
    authFetch<ProductsResponse>(`/api/products?${params}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, category]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Global Stock Overview</h1>
            <p className="text-slate-400 mt-1">Browse available products from exporters worldwide.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        {/* Search & Filters */}
        <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-4 pr-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              placeholder="Search products by name..."
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c}
                onClick={() => { setCategory(c); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  category === c
                    ? "bg-primary/20 border border-primary/40 text-primary"
                    : "bg-[#151c2a]/60 border border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {c === "ALL" ? "All Categories" : c.charAt(0) + c.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Product List */}
        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-5">Product Details</div>
            <div className="col-span-2">Pricing</div>
            <div className="col-span-3">Origin</div>
            <div className="col-span-2 text-right">Category</div>
          </div>

          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-[#151c2a]/60 rounded-2xl animate-pulse border border-white/5" />
            ))
          ) : !data?.products?.length ? (
            <div className="text-center py-20 text-slate-500">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-sm">{search || category !== "ALL" ? "No products match your filters" : "No products available yet"}</p>
            </div>
          ) : (
            data.products.map((p) => (
              <div key={p.id} className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 hover:border-primary/30 transition-colors shadow-xl rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-5 flex items-center gap-4">
                  <div className="size-16 rounded-xl bg-slate-800 border border-white/5 flex-shrink-0 overflow-hidden">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt={p.name} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">No img</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{p.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{p.user?.companyName || p.user?.name || "—"}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">MOQ: {p.moq} units</div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm font-bold text-white">{formatCurrency(p.pricePerUnit)}</div>
                  <div className="text-[10px] text-slate-500">per unit</div>
                </div>
                <div className="md:col-span-3">
                  <div className="text-sm text-slate-300">{p.country || "—"}</div>
                </div>
                <div className="md:col-span-2 text-right">
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary capitalize">
                    {p.category.toLowerCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: Math.min(data.pagination.totalPages, 10) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${p === page ? "bg-primary text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
