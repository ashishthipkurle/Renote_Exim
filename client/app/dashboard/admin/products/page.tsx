"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 Package,
 Search,
 Trash2,
 ChevronLeft,
 ChevronRight,
 Building2,
 Zap,
 CheckSquare
} from "lucide-react";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "sonner";
import clsx from "clsx";
import Image from "next/image";

type Product = {
 id: string;
 name: string;
 category: string;
 price: number;
 available: boolean;
 images: string[];
 exporter: {
 name: string;
 businessName: string;
 };
};

export default function AdminProductsPage() {
 const authFetch = useAuthFetch();
 const [products, setProducts] = useState<Product[]>([]);
 const [total, setTotal] = useState(0);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [categoryFilter, setCategoryFilter] = useState("");
 const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

 const fetchProducts = async () => {
 setLoading(true);
 try {
 const url = `/api/admin/products?page=${page}&q=${encodeURIComponent(search)}&category=${categoryFilter}`;
 const data = await authFetch<{ products: Product[], total: number, totalPages: number }>(url);
 setProducts(data.products || []);
 setTotal(data.total || 0);
 setTotalPages(data.totalPages || 1);
 } catch (error) {
 toast.error("Failed to fetch products");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 const timer = setTimeout(fetchProducts, 300);
 return () => clearTimeout(timer);
 }, [page, search, categoryFilter]);

 const handleAction = async (productIds: string[], action: string, extra?: any) => {
 try {
 await authFetch("/api/admin/products", {
 method: "POST",
 body: JSON.stringify({ productIds, action, ...extra }),
 });
 toast.success(`Action successful`);
 fetchProducts();
 setSelectedProducts([]);
 } catch (error) {
 toast.error(`Action failed`);
 }
 };

 const toggleSelect = (id: string) => {
 setSelectedProducts(prev =>
 prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
 );
 };

 return (
 <div className="h-dvh flex flex-col bg-background relative overflow-hidden">
 <div className="absolute inset-0 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[length:40px_40px] opacity-[0.03] pointer-events-none" />

 {/* Header */}
 <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-border bg-background/30 backdrop-blur-md z-30">
 <div>
 <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
 Catalog Moderation
 <span className="text-[10px] bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded">
 {total} ITEMS
 </span>
 </h1>
 <p className="text-slate-500 text-xs font-medium ">Oversee global marketplace listings.</p>
 </div>

 <div className="flex items-center gap-4">
 <AnimatePresence>
 {selectedProducts.length > 0 && (
 <motion.div
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 className="flex items-center gap-2 pr-4 border-r border-white/10"
 >
 <span className="text-[10px] font-black text-white uppercase mr-2">{selectedProducts.length} SELECTED</span>
 <button
 onClick={() => handleAction(selectedProducts, "toggleAvailability", { available: true })}
 className="bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all"
 >
 Enable
 </button>
 <button
 onClick={() => handleAction(selectedProducts, "toggleAvailability", { available: false })}
 className="bg-neutral-800 text-neutral-400 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-neutral-700 hover:text-white transition-all"
 >
 Disable
 </button>
 <button
 onClick={() => {
 if (confirm(`Delete ${selectedProducts.length} items?`)) {
 handleAction(selectedProducts, "delete");
 }
 }}
 className="bg-neutral-900 text-neutral-500 border border-white/5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-red-900 hover:text-white transition-all"
 >
 Delete
 </button>
 </motion.div>
 )}
 </AnimatePresence>

 <div className="relative group">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
 <input
 type="text"
 placeholder="Search Listings..."
 className="bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-white/20 focus:border-white/50 outline-none w-64 transition-all"
 value={search}
 onChange={(e) => { setSearch(e.target.value); setPage(1); }}
 />
 </div>

 <select
 className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-white/50"
 value={categoryFilter}
 onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
 >
 <option value="">All Categories</option>
 {["CHEMICALS", "MACHINES", "TEXTILES", "MEDICAL", "FOOD", "ELECTRONICS"].map(c => (
 <option key={c} value={c}>{c}</option>
 ))}
 </select>
 </div>
 </header>

 {/* Grid Area */}
 <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
 {loading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-pulse">
 {Array.from({ length: 8 }).map((_, i) => (
 <div key={i} className="h-48 bg-white/5 rounded-lg" />
 ))}
 </div>
 ) : products.length === 0 ? (
 <div className="h-64 flex items-center justify-center text-slate-500 font-medium border border-dashed border-white/10 rounded-lg">
 No products detected in the current sector.
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
 {products.map((p) => (
 <motion.div
 key={p.id}
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className={clsx(
 "group relative bg-muted/40 backdrop-blur-xl border rounded-lg overflow-hidden transition-all duration-300",
 selectedProducts.includes(p.id) ? "border-white ring-1 ring-white/20" : "border-border hover:border-white/20"
 )}
 >
 {/* Select Toggle */}
 <button
 onClick={() => toggleSelect(p.id)}
 className={clsx(
 "absolute top-3 left-3 z-10 size-5 rounded border flex items-center justify-center transition-colors",
 selectedProducts.includes(p.id) ? "bg-white border-white text-black" : "bg-black/40 border-white/20 text-transparent"
 )}
 >
 <CheckSquare className="w-3.5 h-3.5" />
 </button>

 <div className="h-40 relative bg-black/40">
 {p.images?.[0] ? (
 <Image
 src={p.images[0]}
 alt={p.name}
 fill
 className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
 unoptimized
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-slate-700">
 <Package className="w-12 h-12" />
 </div>
 )}
 <div className="absolute top-3 right-3">
 <span className={clsx(
 "text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest",
 p.available ? "bg-white/10 text-white border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]" : "bg-neutral-800 text-neutral-400 border-white/5"
 )}>
 {p.available ? "Active" : "Disabled"}
 </span>
 </div>
 </div>

 <div className="p-4 space-y-3">
 <div>
 <h3 className="text-white font-bold text-sm truncate group-hover:text-white transition-colors">{p.name}</h3>
 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{p.category}</p>
 </div>

 <div className="flex items-center gap-2 text-xs text-slate-400">
 <Building2 className="w-3.5 h-3.5 text-slate-600" />
 <span className="truncate">{p.exporter?.businessName || p.exporter?.name}</span>
 </div>

 <div className="flex items-center justify-between pt-2 border-t border-white/5">
 <div className="text-white font-black text-sm">${p.price.toLocaleString()}</div>
 <div className="flex gap-1">
 <button
 onClick={() => handleAction([p.id], "toggleAvailability", { available: !p.available })}
 className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white transition-all"
 >
 <Zap className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => handleAction([p.id], "delete")}
 className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-red-500 hover:border-red-500 transition-all"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 )}

 {/* Pagination */}
 <div className="mt-8 flex items-center justify-between">
 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
 Scan range: <span className="text-white">{(page - 1) * 20 + 1}</span> - <span className="text-white">{Math.min(page * 20, total)}</span> / <span className="text-white">{total}</span>
 </p>
 <div className="flex items-center gap-2">
 <button
 disabled={page === 1}
 onClick={() => setPage(p => p - 1)}
 className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/60 border border-border text-slate-400 hover:text-white hover:border-white/50 transition-all disabled:opacity-30 disabled:pointer-events-none"
 >
 <ChevronLeft className="w-5 h-5" />
 </button>
 <div className="h-10 px-4 flex items-center rounded-xl bg-white text-black text-[10px] font-black shadow-lg shadow-white/5">
 {page}
 </div>
 <button
 disabled={page >= totalPages}
 onClick={() => setPage(p => p + 1)}
 className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/60 border border-border text-slate-400 hover:text-white hover:border-white/50 transition-all disabled:opacity-30 disabled:pointer-events-none"
 >
 <ChevronRight className="w-5 h-5" />
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
