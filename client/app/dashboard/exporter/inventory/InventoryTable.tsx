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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search products by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#151c2a]/60 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                    <button type="submit" className="hidden" />
                </form>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                // Trigger right away for select
                                setTimeout(updateFilters, 0);
                            }}
                            className="w-full sm:w-40 appearance-none pl-10 pr-8 py-2.5 bg-[#151c2a]/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
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
                            className="w-full sm:w-36 appearance-none px-4 py-2.5 bg-[#151c2a]/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
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
                            className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4 relative">
                {isPending && (
                    <div className="absolute inset-0 bg-[#0a0c12]/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                )}

                <div className="hidden lg:grid grid-cols-12 gap-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-4">Product</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Price</div>
                    <div className="col-span-2">MOQ / Origin</div>
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {products.length === 0 ? (
                    <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-12 text-center">
                        <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">No products found</h2>
                        <p className="text-slate-400 text-sm mb-4">
                            Try adjusting your search or filter criteria.
                        </p>
                    </div>
                ) : (
                    products.map((product) => (
                        <div
                            key={product.id}
                            className={`bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 hover:border-primary/30 transition-colors shadow-xl rounded-2xl p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center ${isDeletingId === product.id ? "opacity-50 pointer-events-none" : ""
                                }`}
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
                                <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-white/5 text-[10px] text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis block w-fit max-w-full">
                                    {product.category}
                                </span>
                            </div>

                            <div className="lg:col-span-2">
                                <div className="text-white font-bold">{formatCurrency(product.price)}</div>
                                <div className="text-[10px] text-slate-500">per {product.unit}</div>
                            </div>

                            <div className="lg:col-span-2">
                                <div className="text-sm text-slate-300">
                                    {product.minOrderQty} {product.unit}
                                </div>
                                <div className="text-[10px] text-slate-500">{product.originCountry}</div>
                            </div>

                            <div className="lg:col-span-1 flex justify-start lg:justify-center">
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

                            <div className="lg:col-span-1 flex justify-end gap-2 mt-4 lg:mt-0">
                                <Link
                                    href={`/dashboard/exporter/inventory/${product.id}/edit`}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Edit Product"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={() => deleteProduct(product.id, product.name)}
                                    disabled={isDeletingId === product.id}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    title="Delete Product"
                                >
                                    {isDeletingId === product.id ? (
                                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
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
