"use client";

import { useEffect, useState } from "react";
import { authFetch, formatCurrency, formatNumber } from "@/lib/api-utils";

interface Category {
  category: string;
  productCount: number;
  spent: number;
}

interface CategoriesResponse {
  role: string;
  categories: Category[];
}

const CATEGORY_COLORS: Record<string, string> = {
  CHEMICALS: "from-violet-500/20 to-purple-500/10 border-violet-500/20",
  MACHINES: "from-sky-500/20 to-cyan-500/10 border-sky-500/20",
  TEXTILES: "from-pink-500/20 to-rose-500/10 border-pink-500/20",
  MEDICAL: "from-emerald-500/20 to-green-500/10 border-emerald-500/20",
  HANDICRAFTS: "from-amber-500/20 to-yellow-500/10 border-amber-500/20",
  FOOD: "from-orange-500/20 to-red-500/10 border-orange-500/20",
  ELECTRONICS: "from-blue-500/20 to-indigo-500/10 border-blue-500/20",
  AUTOMOTIVE: "from-slate-500/20 to-gray-500/10 border-slate-500/20",
  CONSTRUCTION: "from-stone-500/20 to-zinc-500/10 border-stone-500/20",
  AGRICULTURE: "from-lime-500/20 to-green-500/10 border-lime-500/20",
  OTHER: "from-gray-500/20 to-slate-500/10 border-gray-500/20",
};

export default function ImporterCategoriesPage() {
  const [data, setData] = useState<CategoriesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<CategoriesResponse>("/api/dashboard/categories")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxSpent = Math.max(...(data?.categories?.map((c) => c.spent) ?? [1]), 1);

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Import Categories</h1>
          <p className="text-slate-400 mt-1">Categories you&apos;ve ordered from and spending breakdown.</p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1200px] mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-[#151c2a]/60 rounded-2xl animate-pulse border border-white/5" />
              ))}
            </div>
          ) : !data?.categories?.length ? (
            <div className="text-center py-20 text-slate-500">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-sm">No category data yet — place some orders to see spending by category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.categories.map((c) => {
                const colors = CATEGORY_COLORS[c.category] || CATEGORY_COLORS.OTHER;
                return (
                  <div key={c.category} className={`bg-gradient-to-br ${colors} backdrop-blur-xl border shadow-xl rounded-2xl p-6 hover:scale-[1.02] transition-transform`}>
                    <div className="text-white font-bold text-lg capitalize">{c.category.toLowerCase()}</div>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <div className="text-xs text-slate-400">Products</div>
                        <div className="text-white font-black text-xl">{formatNumber(c.productCount)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Spent</div>
                        <div className="text-[#00f0ff] font-black text-xl">{formatCurrency(c.spent)}</div>
                      </div>
                    </div>
                    <div className="mt-4 h-1 w-full bg-slate-800/60 rounded-full overflow-hidden">
                      <div className="h-full bg-white/20 rounded-full transition-all" style={{ width: `${Math.max((c.spent / maxSpent) * 100, 5)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
