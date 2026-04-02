"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package, Search, Edit2, Trash2, Filter, Globe, ShieldCheck, ShoppingCart, ArrowRight, ArrowLeft, Layers, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { authFetch } from "@/lib/api-utils";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    unit: string;
    minOrderQty: number;
    originCountry: string;
    category: string;
    available: boolean;
    quantity: number;
    images: string[];
};

export default function InventoryTable({ 
    products, 
    availableCategories = [] 
}: { 
    products: Product[],
    availableCategories?: string[]
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");

    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters();
    };

    const updateFilters = () => {
        const params = new URLSearchParams(searchParams);
        if (searchQuery) params.set("search", searchQuery);
        else params.delete("search");

        if (categoryFilter) params.set("category", categoryFilter);
        else params.delete("category");

        if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
        else params.delete("status");

        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    };

    const updateQuantity = async (id: string, newQuantity: number, newAvailable?: boolean) => {
        if (newQuantity < 0) return;

        try {
            await authFetch(`/api/products/${id}`, {
                method: "PUT",
                body: JSON.stringify({
                    quantity: newQuantity,
                    available: newAvailable !== undefined ? newAvailable : undefined
                }),
            });
            toast.success(newAvailable !== undefined ? `Market status: ${newAvailable ? 'ACTIVE' : 'HALTED'}` : "Stock updated");
            startTransition(() => {
                router.refresh();
            });
        } catch (e: any) {
            toast.error(e.message || "Failed to update item");
        }
    };

    const deleteProduct = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setIsDeletingId(id);
            await authFetch(`/api/products/${id}`, {
                method: "DELETE",
            });

            toast.success("Product deleted successfully");
            startTransition(() => {
                router.refresh();
            });
        } catch (e: any) {
            toast.error(e.message || "Failed to delete product");
        } finally {
            setIsDeletingId(null);
        }
    };

    return (
        <div className="space-y-10">
            {/* ── Filters ── */}
            <div className="flex flex-col xl:flex-row gap-6">
                <form onSubmit={handleSearch} className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-foreground dark:text-white transition-colors" />
                    <input
                        type="text"
                        placeholder="Search global asset registry..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 rounded-2xl text-foreground dark:text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-border dark:border-white/20 focus:bg-card/60 dark:bg-white/[0.07] transition-all text-xs font-black uppercase tracking-widest italic backdrop-blur-xl"
                    />
                    <button type="submit" className="hidden" />
                </form>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-foreground dark:text-white transition-colors pointer-events-none" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setTimeout(updateFilters, 0);
                            }}
                            className="appearance-none pl-12 pr-10 py-4 bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 rounded-2xl text-[10px] text-foreground dark:text-white font-black uppercase tracking-widest focus:outline-none focus:border-border dark:border-white/20 hover:bg-card/60 dark:bg-white/[0.07] transition-all cursor-pointer backdrop-blur-xl italic"
                        >
                            <option value="" className="bg-card dark:bg-[#0a0a0a] text-foreground dark:text-white italic lowercase font-sans">Global Sector</option>
                            {(availableCategories.length > 0 ? availableCategories : [
                                "CHEMICALS", "MACHINES", "TEXTILES", "MEDICAL", "HANDICRAFTS",
                                "FOOD", "ELECTRONICS", "AUTOMOTIVE", "CONSTRUCTION", "AGRICULTURE", "OTHER"
                            ]).map((c) => (
                                <option key={c} value={c} className="bg-card dark:bg-[#0a0a0a] text-foreground dark:text-white italic lowercase font-sans">
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative group">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setTimeout(updateFilters, 0);
                            }}
                            className="appearance-none px-6 py-4 bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 rounded-2xl text-[10px] text-foreground dark:text-white font-black uppercase tracking-widest focus:outline-none focus:border-border dark:border-white/20 hover:bg-card/60 dark:bg-white/[0.07] transition-all cursor-pointer backdrop-blur-xl italic"
                        >
                            <option value="ALL" className="bg-card dark:bg-[#0a0a0a] text-foreground dark:text-white">Full Registry</option>
                            <option value="ACTIVE" className="bg-card dark:bg-[#0a0a0a] text-foreground dark:text-white">Active Nodes</option>
                            <option value="INACTIVE" className="bg-card dark:bg-[#0a0a0a] text-foreground dark:text-white">Dormant Nodes</option>
                        </select>
                    </div>

                    {(searchQuery || categoryFilter || statusFilter !== "ALL") && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setCategoryFilter("");
                                setStatusFilter("ALL");
                                startTransition(() => {
                                    router.push("?");
                                });
                            }}
                            className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-foreground dark:text-white transition-all italic"
                        >
                            Reset Grid
                        </button>
                    )}
                </div>
            </div>

            {/* ── Table Header ── */}
            <div className="space-y-6 relative">
                <AnimatePresence>
                    {isPending && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-card/40 dark:bg-white/5 backdrop-blur-sm z-50 flex items-center justify-center rounded-[2.5rem]"
                        >
                            <div className="flex flex-col items-center gap-6">
                                <div className="p-6 rounded-[2rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 animate-pulse">
                                    <Globe className="w-8 h-8 text-foreground dark:text-white animate-spin-slow" />
                                </div>
                                <p className="text-[9px] font-black text-foreground dark:text-white uppercase tracking-[0.3em] italic">Updating Registry...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="hidden lg:grid grid-cols-12 gap-8 px-10 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] italic">
                    <div className="col-span-5">Identity_Node</div>
                    <div className="col-span-2">Sector</div>
                    <div className="col-span-2">Valuation</div>
                    <div className="col-span-1 text-center">Protocol</div>
                    <div className="col-span-2 text-right">Overrides</div>
                </div>

                {products.length === 0 ? (
                    <div className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 shadow-xl dark:shadow-2xl rounded-[3rem] p-24 text-center">
                        <div className="flex flex-col items-center gap-8 opacity-40">
                            <div className="p-10 rounded-[2.5rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10">
                                <Package className="w-16 h-16 text-foreground dark:text-white" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">Null_Registry_Record</h2>
                                <p className="text-[10px] text-foreground dark:text-white font-black uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed italic">
                                    Primary asset registry empty. Initialize first node cluster to define market presence.
                                </p>
                            </div>
                            <Link
                                href="/dashboard/exporter/inventory/add"
                                className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] py-4 px-10 rounded-2xl shadow-2xl shadow-white/5 transition-all active:scale-95 italic"
                            >
                                Deploy Initial Alpha
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className={`bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 hover:border-border dark:border-white/20 transition-all duration-700 shadow-xl dark:shadow-2xl rounded-[2.5rem] p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group ${isDeletingId === product.id ? "opacity-20 pointer-events-none scale-95" : "hover:-translate-y-1"
                                    }`}
                            >
                                <div className="lg:col-span-5 flex items-center gap-8">
                                    <div className="size-20 rounded-[2rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center group-hover:border-border dark:border-white/20 transition-all duration-700 p-2 shadow-inner">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100" />
                                        ) : (
                                            <Package className="w-8 h-8 text-muted-foreground/20 group-hover:text-foreground dark:text-white transition-colors duration-700" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xl font-black text-foreground dark:text-white truncate italic tracking-tighter uppercase group-hover:translate-x-1 transition-transform">{product.name}</div>
                                        <div className="text-[9px] text-muted-foreground/30 mt-2 line-clamp-1 font-black uppercase tracking-widest italic group-hover:text-muted-foreground/60 transition-colors">
                                            {product.description || "NO_DATA_DESCRIPTION"}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-2">
                                    <span className="inline-flex items-center px-5 py-2 rounded-2xl bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 text-[9px] text-foreground dark:text-white font-black uppercase tracking-[0.2em] italic group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        {product.category}
                                    </span>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="text-foreground dark:text-white font-black text-2xl italic tracking-tighter group-hover:scale-105 transition-transform origin-left">{formatCurrency(product.price)}</div>
                                    <div className="text-[8px] text-muted-foreground/20 font-black uppercase tracking-[0.3em] mt-2 italic group-hover:text-muted-foreground/40 transition-colors">INDEX_VAL / {product.unit}</div>
                                </div>

                                <div className="lg:col-span-1 flex justify-start lg:justify-center">
                                    <button
                                        onClick={() => updateQuantity(product.id, product.quantity, !product.available)}
                                        className={
                                            "inline-flex items-center gap-3 px-6 py-2.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] italic shadow-xl dark:shadow-2xl transition-all hover:scale-105 active:scale-95 " +
                                            (product.available
                                                ? "text-primary-foreground bg-primary border-transparent shadow-white/10"
                                                : "text-muted-foreground/20 bg-black/5 dark:bg-white/10 border-border dark:border-white/5")
                                        }
                                    >
                                        <span className={`size-2 rounded-full ${product.available ? "bg-card dark:bg-[#0a0a0a] animate-pulse" : "bg-muted-foreground/20"}`} />
                                        {product.available ? "Active" : "Halted"}
                                    </button>
                                </div>

                                <div className="lg:col-span-2 flex justify-end gap-3 mt-4 lg:mt-0">
                                    <Link
                                        href={`/dashboard/exporter/inventory/${product.id}/edit`}
                                        className="size-14 bg-black/5 dark:bg-white/10 border border-border dark:border-white/5 text-muted-foreground/20 hover:text-foreground dark:text-white hover:bg-black/10 dark:bg-white/15 hover:border-border dark:border-white/20 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 active:scale-90 shadow-xl dark:shadow-2xl"
                                        title="Modify Protocol"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </Link>
                                    <button
                                        onClick={() => deleteProduct(product.id, product.name)}
                                        disabled={isDeletingId === product.id}
                                        className="size-14 bg-black/5 dark:bg-white/10 border border-border dark:border-white/5 text-muted-foreground/20 hover:text-foreground dark:text-white hover:bg-neutral-800 hover:border-border dark:border-white/20 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 active:scale-90 shadow-xl dark:shadow-2xl"
                                        title="Purge Node"
                                    >
                                        {isDeletingId === product.id ? (
                                            <div className="w-5 h-5 border-2 border-border dark:border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
