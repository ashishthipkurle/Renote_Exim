"use client";

import { useEffect, useState } from "react";
import { authFetch, formatCurrency, formatNumber } from "@/lib/api-utils";
import {
  Star,
  Package,
  ArrowRight,
  Layers,
  Search,
  Filter,
  Sparkles,
  PieChart
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  name: string;
  productCount: number;
  totalAvailable: number;
  spent: number;
  isPreferred: boolean;
}

interface CategoriesResponse {
  role: string;
  categories: Category[];
  preferredCategories: string[];
}

const CATEGORY_STYLES: Record<string, { color: string; icon: string }> = {
  CHEMICALS: { color: "from-violet-500/20 to-purple-500/10 border-violet-500/20", icon: "🧪" },
  MACHINES: { color: "from-sky-500/20 to-cyan-500/10 border-sky-500/20", icon: "⚙️" },
  TEXTILES: { color: "from-pink-500/20 to-rose-500/10 border-pink-500/20", icon: "🧣" },
  MEDICAL: { color: "from-emerald-500/20 to-green-500/10 border-emerald-500/20", icon: "🩺" },
  HANDICRAFTS: { color: "from-amber-500/20 to-yellow-500/10 border-amber-500/20", icon: "🏺" },
  FOOD: { color: "from-orange-500/20 to-red-500/10 border-orange-500/20", icon: "🍱" },
  ELECTRONICS: { color: "from-blue-500/20 to-indigo-500/10 border-blue-500/20", icon: "💻" },
  AUTOMOTIVE: { color: "from-slate-500/20 to-gray-500/10 border-slate-500/20", icon: "🚗" },
  CONSTRUCTION: { color: "from-stone-500/20 to-zinc-500/10 border-stone-500/20", icon: "🏗️" },
  AGRICULTURE: { color: "from-lime-500/20 to-green-500/10 border-lime-500/20", icon: "🌾" },
  OTHER: { color: "from-gray-500/20 to-slate-500/10 border-gray-500/20", icon: "📦" },
};

export default function ImporterCategoriesPage() {
  const [data, setData] = useState<CategoriesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const res = await authFetch<CategoriesResponse>("/api/dashboard/categories");
      setData(res);
    } catch {
      toast.error("Failed to load category data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePreference = async (category: string) => {
    try {
      await authFetch("/api/dashboard/categories", {
        method: "POST",
        body: JSON.stringify({ category }),
      });
      // Optimistic update
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          categories: prev.categories.map((c) =>
            c.name === category ? { ...c, isPreferred: !c.isPreferred } : c
          ),
        };
      });
      toast.success(`${category} preferences updated`);
    } catch {
      toast.error("Failed to update preference");
    }
  };

  const filteredCategories = data?.categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const preferred = filteredCategories.filter(c => c.isPreferred);
  const remaining = filteredCategories.filter(c => !c.isPreferred);

  const maxSpent = Math.max(...(data?.categories?.map((c) => c.spent) ?? [1]), 1);

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5 bg-gradient-to-r from-[#0d1017] to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Market Segments
              <Layers className="w-8 h-8 text-primary" />
            </h1>
            <p className="text-slate-400 mt-1">Configure your procurement focus and category intelligence.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within/search:text-primary" />
              <input
                type="text"
                placeholder="Find category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white font-bold text-sm focus:ring-2 focus:ring-primary/50 outline-none w-64 transition-all"
              />
            </div>
            <button className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-12">
        <div className="max-w-[1600px] mx-auto space-y-12">

          {/* Preferred Focus Section */}
          {preferred.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-primary" />
                  Preferred Procurement Focus
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {preferred.map((c) => (
                  <CategoryCard
                    key={c.name}
                    category={c}
                    maxSpent={maxSpent}
                    onToggle={() => handleTogglePreference(c.name)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All Segments Section */}
          <section className="space-y-6 pb-12">
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-slate-700" />
              Available Global Segments
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
                ))}
              </div>
            ) : remaining.length === 0 && preferred.length === 0 ? (
              <div className="bg-white/5 border border-white/5 border-dashed rounded-[32px] p-20 text-center">
                <Package className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-white font-bold">No Categories Found</h3>
                <p className="text-slate-500 text-sm">No segments match your current search constraints.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {remaining.map((c) => (
                  <CategoryCard
                    key={c.name}
                    category={c}
                    maxSpent={maxSpent}
                    onToggle={() => handleTogglePreference(c.name)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  maxSpent,
  onToggle
}: {
  category: Category;
  maxSpent: number;
  onToggle: () => void;
}) {
  const style = CATEGORY_STYLES[category.name] || CATEGORY_STYLES.OTHER;

  return (
    <div className={`group bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-3xl p-6 transition-all hover:scale-[1.03] hover:border-primary/20`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            {style.icon}
          </div>
          <div>
            <div className="text-white font-black text-lg tracking-tight uppercase leading-none">{category.name}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Market Segment</div>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`p-2 rounded-xl transition-all ${category.isPreferred
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-white/5 text-slate-500 hover:text-white"
            }`}
        >
          <Star className={`w-4 h-4 ${category.isPreferred ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Items Ordered</div>
          <div className="text-white font-black flex items-center gap-2">
            <Package className="w-3 h-3 text-primary" />
            {formatNumber(category.productCount)}
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Fiscal Spent</div>
          <div className="text-primary font-black">
            {formatCurrency(category.spent)}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
          <span>Market Penetration</span>
          <span className="text-white">{Math.round((category.spent / maxSpent) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
          <div
            className={`h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-1000`}
            style={{ width: `${Math.max((category.spent / maxSpent) * 100, 2)}%` }}
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span className="text-[10px] text-slate-400 font-bold">{category.totalAvailable} Marketplace Items</span>
        </div>
        <button className="text-[10px] font-black text-primary uppercase flex items-center gap-1 group/btn">
          Explore
          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
