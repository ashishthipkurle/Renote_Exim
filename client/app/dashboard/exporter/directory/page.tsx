"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch, formatCurrency, formatNumber, getInitials } from "@/lib/api-utils";

interface Partner {
  id: string;
  name: string;
  companyName: string | null;
  country: string | null;
  orderCount: number;
  totalValue: number;
}

interface DirectoryResponse {
  role: string;
  partners: Partner[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function ExporterDirectoryPage() {
  const [data, setData] = useState<DirectoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    authFetch<DirectoryResponse>(`/api/dashboard/directory?${params}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Trade Directory</h1>
            <p className="text-slate-400 mt-1">Your buying partners and importers.</p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search partners..."
            className="w-full md:w-72 bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
          />
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1200px] mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 bg-[#151c2a]/60 rounded-2xl animate-pulse border border-white/5" />
              ))}
            </div>
          ) : !data?.partners?.length ? (
            <div className="text-center py-20 text-slate-500">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-sm">{search ? "No partners matching your search" : "No trading partners yet"}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.partners.map((p) => (
                  <div key={p.id} className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-5 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
                        {getInitials(p.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-bold text-sm truncate">{p.name}</div>
                        {p.companyName && <div className="text-slate-400 text-xs truncate">{p.companyName}</div>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <div className="text-slate-500">Country</div>
                        <div className="text-slate-300 font-semibold">{p.country || "—"}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-500">Orders</div>
                        <div className="text-white font-bold">{formatNumber(p.orderCount)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-500">Total Value</div>
                        <div className="text-emerald-400 font-bold">{formatCurrency(p.totalValue)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {data.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${p === page ? "bg-primary text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
