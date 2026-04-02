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
  Sparkles
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
  CHEMICALS: { color: "from-white/10 to-white/5 border-border", icon: "🧪" },
  MACHINES: { color: "from-white/10 to-white/5 border-border", icon: "⚙️" },
  TEXTILES: { color: "from-white/10 to-white/5 border-border", icon: "🧣" },
  MEDICAL: { color: "from-white/10 to-white/5 border-border", icon: "🩺" },
  HANDICRAFTS: { color: "from-white/10 to-white/5 border-border", icon: "🏺" },
  FOOD: { color: "from-white/10 to-white/5 border-border", icon: "🍱" },
  ELECTRONICS: { color: "from-white/10 to-white/5 border-border", icon: "💻" },
  AUTOMOTIVE: { color: "from-white/10 to-white/5 border-border", icon: "🚗" },
  CONSTRUCTION: { color: "from-white/10 to-white/5 border-border", icon: "🏗️" },
  AGRICULTURE: { color: "from-white/10 to-white/5 border-border", icon: "🌾" },
  OTHER: { color: "from-white/10 to-white/5 border-border", icon: "📦" },
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
    <div className="h-dvh overflow-hidden flex flex-col bg-background transition-colors duration-300">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-border bg-header backdrop-blur-xl z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3 uppercase italic">
              Market Segments
              <Layers className="w-8 h-8 text-foreground" />
            </h1>
            <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest mt-1">Configure your procurement focus and category intelligence.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within/search:text-foreground" />
              <input
                type="text"
                placeholder="Find category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-muted border border-border rounded-2xl py-3.5 pl-11 pr-4 text-foreground font-black text-sm focus:ring-2 focus:ring-white/20 outline-none w-64 transition-all placeholder:text-muted-foreground/20 shadow-inner italic uppercase tracking-widest"
              />
            </div>
            <button className="p-3.5 rounded-2xl bg-muted border border-border text-muted-foreground hover:text-foreground transition-all shadow-xl">
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
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-white animate-pulse" />
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
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-muted-foreground/20" />
              Available Global Segments
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-48 bg-muted/20 rounded-3xl animate-pulse border border-border" />
                ))}
              </div>
            ) : remaining.length === 0 && preferred.length === 0 ? (
              <div className="bg-muted/40 border border-border border-dashed rounded-[32px] p-20 text-center shadow-2xl">
                <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-6" />
                <h3 className="text-foreground font-black uppercase tracking-widest italic">No Categories Found</h3>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest leading-none mt-2">No segments match your current search constraints.</p>
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
    <div className={`group bg-muted/40 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-7 transition-all hover:scale-[1.03] hover:border-border`}>
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-muted/20 border border-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-xl">
            {style.icon}
          </div>
          <div>
            <div className="text-foreground font-black text-xl tracking-tighter uppercase leading-none italic">{category.name}</div>
            <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1.5 opacity-60">Market Segment</div>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`p-2.5 rounded-xl transition-all shadow-xl ${category.isPreferred
            ? "bg-primary text-primary-foreground border-transparent shadow-primary/10"
            : "bg-muted border border-border hover:bg-muted/60 text-muted-foreground"
            }`}
        >
          <Star className={`w-4 h-4 ${category.isPreferred ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-muted/40 rounded-2xl p-4 border border-border shadow-xl">
          <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1.5">Items Ordered</div>
          <div className="text-foreground font-black flex items-center gap-3 text-sm italic tracking-tighter">
            <Package className="w-3.5 h-3.5 text-foreground/40" />
            {formatNumber(category.productCount)}
          </div>
        </div>
        <div className="bg-muted/40 rounded-2xl p-4 border border-border shadow-xl">
          <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1.5">Fiscal Spent</div>
          <div className="text-foreground font-black text-sm italic tracking-tighter shadow-[0_0_10px_rgba(255,255,255,0.1)]">
            {formatCurrency(category.spent)}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          <span>Market Penetration</span>
          <span className="text-foreground italic tracking-tighter">{Math.round((category.spent / maxSpent) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden border border-white/5">
          <div
            className={`h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(255,255,255,0.3)]`}
            style={{ width: `${Math.max((category.spent / maxSpent) * 100, 2)}%` }}
          />
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-3.5 h-3.5 text-foreground animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{category.totalAvailable} Marketplace Items</span>
        </div>
        <button className="text-[10px] font-black text-foreground uppercase italic tracking-tighter flex items-center gap-2 group/btn">
          Explore
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
