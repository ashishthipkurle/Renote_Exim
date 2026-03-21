"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package, Search, Edit2, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { authFetch } from "@/lib/api-utils";

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

export default function InventoryTable({ products }: { products: Product[] }) {
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

    const categories = [
        "CHEMICALS",
        "MACHINES",
        "TEXTILES",
        "MEDICAL",
        "HANDICRAFTS",
        "FOOD",
        "ELECTRONICS",
        "AUTOMOTIVE",
        "CONSTRUCTION",
        "AGRICULTURE",
        "OTHER",
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search products by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                    <button type="submit" className="hidden" />
                </form>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                // Trigger right away for select
                                setTimeout(updateFilters, 0);
                            }}
                            className="w-full sm:w-40 appearance-none pl-10 pr-8 py-2.5 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>
                                    {c.charAt(0) + c.slice(1).toLowerCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setTimeout(updateFilters, 0);
                            }}
                            className="w-full sm:w-36 appearance-none px-4 py-2.5 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
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
                            className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4 relative">
                {isPending && (
                    <div className="absolute inset-0 bg-[#0a0c12]/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-[2rem]">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                )}

                <div className="hidden lg:grid grid-cols-12 gap-4 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    <div className="col-span-4 text-primary opacity-50">Global Market Identity</div>
                    <div className="col-span-2">Sector</div>
                    <div className="col-span-2">Economics</div>
                    <div className="col-span-2 text-center">Stock Level</div>
                    <div className="col-span-1 text-center">Protocol</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {products.length === 0 ? (
                    <div className="bg-card backdrop-blur-xl border border-border shadow-2xl rounded-[2rem] p-16 text-center">
                        <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-foreground mb-3 uppercase italic">No Assets Identified</h2>
                        <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto leading-relaxed">
                            Your global inventory is currently empty. Initialize your trade presence by deploying your first product listing.
                        </p>
                        <Link
                            href="/dashboard/exporter/inventory/new"
                            className="inline-flex items-center gap-2 bg-primary hover:bg-[#0f49bd] text-white font-black text-[10px] uppercase tracking-widest py-4 px-8 rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-95"
                        >
                            Deploy First Listing
                        </Link>
                    </div>
                ) : (
                    products.map((product) => (
                        <div
                            key={product.id}
                            className={`bg-card backdrop-blur-xl border border-border hover:border-primary/40 transition-all duration-500 shadow-xl dark:shadow-2xl rounded-[2rem] p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center group ${isDeletingId === product.id ? "opacity-30 pointer-events-none scale-95" : "hover:scale-[1.01]"
                                }`}
                        >
                            <div className="lg:col-span-4 flex items-center gap-5">
                                <div className="size-16 rounded-2xl bg-muted border border-border flex-shrink-0 overflow-hidden flex items-center justify-center shadow-lg group-hover:border-primary/20 transition-colors">
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <Package className="w-6 h-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-base font-black text-foreground truncate group-hover:text-primary transition-colors">{product.name}</div>
                                    <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1 font-medium italic group-hover:text-foreground">
                                        {product.description || "NO MARKET DESCRIPTION PROVIDED"}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-xl bg-muted/50 border border-border text-[9px] text-muted-foreground font-black uppercase tracking-[0.15em]">
                                    {product.category}
                                </span>
                            </div>

                            <div className="lg:col-span-2">
                                <div className="text-foreground font-black text-lg tracking-tight">{formatCurrency(product.price)}</div>
                                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">per {product.unit}</div>
                            </div>

                            <div className="lg:col-span-2 flex flex-col items-center">
                                <div className="flex items-center gap-2 bg-muted border border-border rounded-xl p-1 shadow-inner">
                                    <button
                                        onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                        className="size-7 flex items-center justify-center rounded-lg hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors text-lg font-bold"
                                    >
                                        -
                                    </button>
                                    <div className="min-w-[40px] text-center text-sm font-black text-foreground">
                                        {product.quantity}
                                    </div>
                                    <button
                                        onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                        className="size-7 flex items-center justify-center rounded-lg hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors text-lg font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-2 italic">Unit: {product.unit}</div>
                            </div>

                            <div className="lg:col-span-1 flex justify-start lg:justify-center">
                                <button
                                    onClick={() => updateQuantity(product.id, product.quantity, !product.available)}
                                    className={
                                        "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] shadow-sm transition-all hover:scale-105 active:scale-95 " +
                                        (product.available
                                            ? "text-emerald-400 bg-emerald-400/5 border-emerald-400/20 shadow-emerald-400/5 hover:bg-emerald-400/10"
                                            : "text-red-400 bg-red-400/5 border-red-400/20 shadow-red-400/5 hover:bg-red-400/10")
                                    }
                                >
                                    <span className={`size-1.5 rounded-full bg-current ${product.available ? "animate-pulse" : ""}`} />
                                    {product.available ? "Active" : "Halted"}
                                </button>
                            </div>

                            <div className="lg:col-span-1 flex justify-end gap-3 mt-4 lg:mt-0">
                                <Link
                                    href={`/dashboard/exporter/inventory/${product.id}/edit`}
                                    className="p-3 bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-accent rounded-2xl transition-all active:scale-90"
                                    title="Edit Protocol"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={() => deleteProduct(product.id, product.name)}
                                    disabled={isDeletingId === product.id}
                                    className="p-3 bg-muted border border-border text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all active:scale-90"
                                    title="Purge Asset"
                                >
                                    {isDeletingId === product.id ? (
                                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}