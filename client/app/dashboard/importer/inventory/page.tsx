"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Search,
  Heart,
  ArrowUpRight,
  ShoppingCart,
  TrendingUp,
  Globe2,
  Building2,
  Bookmark,
  Filter,
  X,
  Check
} from "lucide-react";
import { authFetch, formatCurrency } from "@/lib/api-utils";
import { toast } from "sonner";

interface WishlistItem {
  productId: string;
  name: string;
  category: string;
  currentPrice: number;
  previousPrice: number;
  priceChangePercent: number;
  minOrderQty: number;
  unit: string;
  originCountry: string;
  images: string[];
  exporter: { name: string; companyName: string | null };
  savedAt: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  minOrderQty: number;
  unit: string;
  originCountry: string;
  images: string[];
  quantity?: number;
  exporter: { name: string | null; companyName: string | null; country: string | null };
}

interface ProductsResponse {
  products: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const CATEGORIES = [
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "TEXTILES", label: "Textiles" },
  { value: "FOOD", label: "Food" },
  { value: "CHEMICALS", label: "Chemicals" },
  { value: "MACHINES", label: "Machinery" },
  { value: "MEDICAL", label: "Medical" },
  { value: "HANDICRAFTS", label: "Handicrafts" },
];

export default function ImporterInventoryPage() {
  const [activeTab, setActiveTab] = useState<"browse" | "wishlist">("browse");
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [browseData, setBrowseData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch<{ wishlist: WishlistItem[] }>("/api/dashboard/inventory");
      setWishlist(res.wishlist);
    } catch {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBrowse = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "12" });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (origin) params.set("origin", origin);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort !== "newest") params.set("sort", sort);

    try {
      const res = await authFetch<ProductsResponse>(`/api/products?${params}`);
      setBrowseData(res);
    } catch {
      toast.error("Failed to load marketplace products");
    } finally {
      setLoading(false);
    }
  }, [page, search, category, origin, minPrice, maxPrice, sort]);

  useEffect(() => {
    if (activeTab === "wishlist") fetchWishlist();
  }, [activeTab, fetchWishlist]);

  useEffect(() => {
    if (activeTab === "browse") {
      const t = setTimeout(fetchBrowse, 300);
      return () => clearTimeout(t);
    }
  }, [activeTab, fetchBrowse]);

  const toggleWishlist = async (productId: string) => {
    try {
      const res = await authFetch<{ status: "ADDED" | "REMOVED" }>("/api/dashboard/inventory", {
        method: "POST",
        body: JSON.stringify({ productId }),
      });
      if (res.status === "REMOVED" && activeTab === "wishlist") {
        setWishlist(prev => prev.filter(item => item.productId !== productId));
      }
      toast.success(res.status === "ADDED" ? "Added to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Wishlist sync failed");
    }
  };

  const clearFilters = () => {
    setCategory(null);
    setOrigin("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0a0c12] transition-colors duration-300">
      {/* Page Header - Below DashboardHeader */}
      <header className="flex-shrink-0 p-4 lg:p-6 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0d111a]/60 backdrop-blur-md z-20 transition-colors duration-300">
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row items-center gap-6">
          {/* Branding */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none">Procurement</h1>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Marketplace Hub</span>
            </div>
          </div>

          {/* Centralized Search Bar - Takes middle space */}
          <div className="relative group/search flex-1 max-w-2xl mx-auto w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors group-focus-within/search:text-primary" />
            <input
              type="text"
              placeholder="Universal search products, exporters, or HS codes..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-14 pr-6 text-sm text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-slate-500 dark:placeholder:text-slate-700 shadow-inner"
            />
          </div>

          {/* Actions & Tab Switcher */}
          <div className="flex items-center justify-end gap-3 flex-shrink-0">
            <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
              <button
                onClick={() => setActiveTab("browse")}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "browse" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
              >
                Browse
              </button>
              <button
                onClick={() => setActiveTab("wishlist")}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "wishlist" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
              >
                Wishlist
              </button>
            </div>
            {activeTab === "browse" && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-2xl border transition-all ${showFilters ? "bg-primary border-primary text-white" : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"}`}
              >
                <Filter className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex relative">
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide">
          <div className="max-w-[1700px] mx-auto">
            {activeTab === "wishlist" ? (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {wishlist.length === 0 && !loading ? (
                  <div className="py-40 text-center opacity-40">
                    <Bookmark className="w-16 h-16 mx-auto mb-6 text-slate-400 dark:text-slate-700" />
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Wishlist Vacant</h2>
                    <p className="text-slate-500 mt-2 font-medium">Save strategic items from the marketplace to track trends.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                    {loading ? Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] animate-pulse" />
                    )) : wishlist.map((item) => (
                      <WishlistCard key={item.productId} item={item} onToggle={() => toggleWishlist(item.productId)} />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {!browseData?.products?.length && !loading ? (
                  <div className="py-20 text-center opacity-40">
                    <Search className="w-16 h-16 mx-auto mb-6 text-slate-400 dark:text-slate-700" />
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest italic">No Strategic Matches</h2>
                    <p className="text-slate-500 mt-2 font-medium">Refine your discovery parameters to locate global supply lines.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                    {loading ? Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] animate-pulse" />
                    )) : browseData?.products.map((p) => (
                      <MarketplaceProductCard key={p.id} product={p} onToggleWishlist={() => toggleWishlist(p.id)} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {browseData && browseData.pagination.totalPages > 1 && (
                  <div className="flex justify-center flex-wrap gap-2 pt-12 border-t border-slate-200 dark:border-white/5 mt-12">
                    {Array.from({ length: browseData.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black transition-all ${p === page ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-white dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5"}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </main>

        {/* Backdrop for Filters (Desktop Sidebar / Mobile Drawer) */}
        {showFilters && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:absolute"
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* Marketplace Filter Sidebar - Moves to the RIGHT */}
        <aside className={`fixed lg:absolute top-0 right-0 h-full w-80 lg:w-96 border-l border-slate-200 dark:border-white/5 bg-white dark:bg-[#0d111a] z-40 transform transition-transform duration-500 ease-in-out shadow-2xl ${showFilters ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-8 border-b border-slate-200 dark:border-white/5">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                Discovery Engine <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              </h2>
              <div className="flex items-center gap-4">
                <button onClick={clearFilters} className="text-[10px] font-black text-primary hover:text-blue-700 dark:hover:text-white transition-colors uppercase tracking-widest opacity-60 hover:opacity-100">
                  Reset
                </button>
                <button onClick={() => setShowFilters(false)} className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white lg:hidden">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
              {/* Sort Filter */}
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Sort Velocity</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "newest", label: "Newest" },
                    { id: "price_asc", label: "Low Price" },
                    { id: "price_desc", label: "High Price" },
                    { id: "name", label: "A-Z" }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSort(s.id)}
                      className={`px-3 py-2.5 rounded-xl text-[10px] font-bold border transition-all ${sort === s.id ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Market Verticals</span>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(category === cat.value ? null : cat.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all group ${category === cat.value ? "bg-primary/10 text-primary border border-primary/20" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"}`}
                    >
                      {cat.label}
                      {category === cat.value && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Budget Threshold</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-800 outline-none focus:border-primary/40 transition-all font-bold"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-800 outline-none focus:border-primary/40 transition-all font-bold"
                  />
                </div>
              </div>

              {/* Origin Filter */}
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Strategic Origin</span>
                <div className="relative">
                  <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
                  <input
                    type="text"
                    placeholder="e.g. India, Germany..."
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-800 outline-none focus:border-primary/40 transition-all font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-200 dark:border-white/5">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full bg-primary py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-primary/30"
              >
                Apply Intelligence
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// PREMIUM MARKETPLACE PRODUCT CARD
function MarketplaceProductCard({ product, onToggleWishlist }: { product: Product; onToggleWishlist: () => void }) {
  return (
    <div className="group bg-white dark:bg-[#151c2a]/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:border-primary/50 dark:hover:border-primary/20 transition-all rounded-[2.5rem] overflow-hidden shadow-md dark:shadow-2xl relative">
      <Link href={`/products/${product.id}`} className="block">
        <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="w-12 h-12 text-slate-300 dark:text-slate-800" />
            </div>
          )}
          <div className="absolute top-6 left-6">
            <span className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
              {product.category}
            </span>
          </div>
        </div>

        <div className="p-8">
          <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mt-1 italic">
            {product.originCountry} • HUB DISCOVERY
          </p>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-2xl font-black text-primary tracking-tighter">
              {formatCurrency(product.price)}
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-widest">/ {product.unit}</span>
          </div>

          <div className="mt-6 py-4 border-y border-slate-200 dark:border-white/5 flex items-center justify-between">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified Exporter</div>
            <div className="text-[11px] font-black text-slate-900 dark:text-white max-w-[120px] truncate">
              {product.exporter.companyName || product.exporter.name || "UNIDENTIFIED"}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs font-black text-primary uppercase tracking-tighter flex items-center gap-1">
              View Specs <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${product.quantity && product.quantity > 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"}`}>
              {product.quantity && product.quantity > 0 ? "Operational" : "Depleted"}
            </span>
          </div>
        </div>
      </Link>

      <button
        onClick={(e) => { e.preventDefault(); onToggleWishlist(); }}
        className="absolute top-6 right-6 p-3 rounded-2xl bg-white/80 dark:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 z-10"
      >
        <Bookmark className="w-4 h-4" />
      </button>
    </div>
  );
}

// WISHLIST SPECIFIC CARD (With price trajectory)
function WishlistCard({ item, onToggle }: { item: WishlistItem; onToggle: () => void }) {
  return (
    <div className="group bg-white dark:bg-[#151c2a]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:border-primary/50 dark:hover:border-primary/20 transition-all rounded-[2.5rem] p-6 relative overflow-hidden shadow-sm dark:shadow-none">
      <div className="absolute -right-4 -top-4 size-32 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
        <TrendingUp className="w-full h-full text-primary" />
      </div>

      <div className="flex gap-6">
        <div className="size-28 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex-shrink-0 overflow-hidden relative">
          {item.images?.[0] ? (
            <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
          ) : (
            <Package className="w-10 h-10 text-slate-300 dark:text-slate-800 m-auto mt-9" />
          )}
          <button
            onClick={onToggle}
            className="absolute top-2 right-2 p-2 rounded-xl bg-white/80 dark:bg-black/60 backdrop-blur-md text-red-500 border border-slate-200 dark:border-white/10 hover:scale-110 transition-transform"
          >
            <Heart className="w-3 h-3 fill-current" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
            <div className="flex items-center gap-2 mt-1.5 opacity-60">
              <Building2 className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.exporter.companyName || item.exporter.name}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-600 font-black uppercase tracking-widest leading-none mb-1">Unit Valuation</div>
              <div className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{formatCurrency(item.currentPrice)}</div>
            </div>
            <div className={`px-2.5 py-1.5 rounded-xl font-black text-[10px] border flex items-center gap-1.5 ${item.priceChangePercent < 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : item.priceChangePercent > 0 ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-slate-500/10 border-white/5 text-slate-500"}`}>
              {item.priceChangePercent !== 0 && (item.priceChangePercent < 0 ? <TrendingUp className="w-3 h-3 rotate-180" /> : <TrendingUp className="w-3 h-3" />)}
              {Math.abs(item.priceChangePercent)}%
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/5 flex items-center gap-4">
        <Link
          href={`/products/${item.productId}`}
          className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center transition-all"
        >
          Intelligence Report
        </Link>
        <button className="p-3.5 rounded-2xl bg-primary hover:bg-[#0f49bd] text-white shadow-xl shadow-primary/20 transition-all active:scale-95 group/cart">
          <ShoppingCart className="w-5 h-5 group-hover:animate-bounce" />
        </button>
      </div>
    </div>
  );
}
