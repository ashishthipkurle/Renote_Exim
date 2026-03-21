"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package, ArrowRight, Clock, CheckCircle2, XCircle, Truck, Search, ChevronDown, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: "Pending", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: Clock },
    CONFIRMED: { label: "Confirmed", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: CheckCircle2 },
    PROCESSING: { label: "Processing", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: Package },
    SHIPPED: { label: "Shipped", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", icon: Truck },
    DELIVERED: { label: "Delivered", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
};

function formatDate(d: Date | string) {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

interface OrdersTableProps {
    orders: any[];
    counts: {
        all: number;
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
    };
}

const LOCAL_ORDERS_KEY = "renote_local_orders";
const PRODUCT_REVIEWS_KEY = "renote_product_reviews";

type ProductReview = {
    orderId: string;
    productId: string;
    productName: string;
    rating: number;
    comment: string;
    createdAt: string;
};

export default function OrdersTable({ orders, counts }: OrdersTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [localOrders, setLocalOrders] = useState<any[]>([]);
    const [reviewsByOrder, setReviewsByOrder] = useState<Record<string, ProductReview>>({});

    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const currentStatus = searchParams.get("status") || "ALL";

    useEffect(() => {
        const sync = () => {
            try {
                const rawOrders = localStorage.getItem(LOCAL_ORDERS_KEY);
                const parsedOrders = rawOrders ? (JSON.parse(rawOrders) as any[]) : [];
                setLocalOrders(parsedOrders);

                const rawReviews = localStorage.getItem(PRODUCT_REVIEWS_KEY);
                const parsedReviews = rawReviews ? (JSON.parse(rawReviews) as ProductReview[]) : [];
                const map: Record<string, ProductReview> = {};
                for (const review of parsedReviews) map[review.orderId] = review;
                setReviewsByOrder(map);
            } catch {
                setLocalOrders([]);
                setReviewsByOrder({});
            }
        };

        sync();
        window.addEventListener("storage", sync);
        window.addEventListener("renote-orders-updated", sync);
        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener("renote-orders-updated", sync);
        };
    }, []);

    const displayOrders = useMemo(() => {
        const merged = [...localOrders, ...orders].filter((order, index, arr) => {
            return index === arr.findIndex((x) => (x.id && x.id === order.id) || x.orderNumber === order.orderNumber);
        });

        let filtered = merged;
        if (currentStatus !== "ALL") {
            filtered = filtered.filter((order) => order.status === currentStatus);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            filtered = filtered.filter((order) => {
                const fields = [
                    order.id,
                    order.orderNumber,
                    order.product?.name,
                    order.importer?.name,
                    order.importer?.companyName,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                return fields.includes(query);
            });
        }

        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return filtered;
    }, [localOrders, orders, currentStatus, searchQuery]);

    const updateFilters = (newStatus?: string, newSearch?: string) => {
        const params = new URLSearchParams(searchParams);

        if (newSearch !== undefined) {
            if (newSearch) params.set("search", newSearch);
            else params.delete("search");
        } else if (searchQuery) {
            params.set("search", searchQuery);
        }

        if (newStatus !== undefined) {
            if (newStatus !== "ALL") params.set("status", newStatus);
            else params.delete("status");
        }

        // Reset to page 1 on filter change
        params.delete("page");

        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters();
    };

    const statusPills = [
        { id: "ALL", label: "All", count: counts.all, color: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
        { id: "PENDING", label: "Pending", count: counts.pending, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
        { id: "PROCESSING", label: "Processing", count: counts.processing, color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
        { id: "SHIPPED", label: "Shipped", count: counts.shipped, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
        { id: "DELIVERED", label: "Delivered", count: counts.delivered, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    ];

    return (
        <div className="space-y-6">
            {/* Header with quick stats & search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                    {statusPills.map((pill) => (
                        <button
                            key={pill.id}
                            onClick={() => updateFilters(pill.id)}
                            className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${currentStatus === pill.id
                                    ? pill.color.replace("/10", "/20").replace("border-", "border-opacity-100 ") + " border-primary ring-1 ring-primary/30"
                                    : "text-slate-500 bg-white/5 border-white/5 hover:bg-white/10"
                                }`}
                        >
                            {pill.label} <span className="opacity-50 ml-1">{pill.count}</span>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSearch} className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by product, buyer, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#151c2a]/60 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    />
                </form>
            </div>

            {/* Orders List */}
            <div className="space-y-4 relative">
                {isPending && (
                    <div className="absolute inset-0 bg-[#0a0c12]/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                )}

                {displayOrders.length === 0 ? (
                    <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-12 text-center">
                        <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">No orders found</h2>
                        <p className="text-slate-400 text-sm">
                            Try adjusting your filters or search query.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Header */}
                        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <div className="col-span-4">Product & Buyer</div>
                            <div className="col-span-2">Amount</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Date</div>
                            <div className="col-span-2 text-right">Action</div>
                        </div>

                        {displayOrders.map((order) => {
                            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                            const StatusIcon = cfg.icon;
                            const isExpanded = expandedOrderId === order.id;
                            const review = reviewsByOrder[order.id];
                            return (
                                <div
                                    key={order.id}
                                    className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 hover:border-primary/30 hover:bg-[#172033]/70 transition-all duration-300 shadow-xl rounded-2xl p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
                                >
                                    <div
                                        className="lg:col-span-4 flex items-center gap-4 cursor-pointer"
                                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                    >
                                        <div className="size-12 rounded-xl bg-slate-800 border border-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {order.product?.images?.[0] ? (
                                                <img src={order.product.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-5 h-5 text-slate-500" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white line-clamp-1">{order.product?.name ?? "Unknown Product"}</div>
                                            <div className="text-xs text-slate-400 mt-0.5 truncate">
                                                {order.importer?.companyName || order.importer?.name || "Importer"} ({order.importer?.country ?? "N/A"})
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">
                                                Qty: {order.quantity ?? 0} · {order.product?.category ?? "General"}
                                            </div>
                                            <div className="text-[11px] text-primary/90 mt-1 font-semibold">{formatCurrency(order.totalPrice)}</div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <div className="text-white font-bold">{formatCurrency(order.totalPrice)}</div>
                                        <div className="text-[10px] text-slate-500 capitalize">{(order.paymentStatus ?? "pending").toLowerCase()}</div>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {cfg.label}
                                        </span>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <div className="text-sm text-slate-300">{formatDate(order.createdAt)}</div>
                                    </div>

                                    <div className="lg:col-span-2 flex justify-end gap-2">
                                        {order.product?.id ? (
                                            <Link
                                                href={`/products/${order.product.id}`}
                                                className="inline-flex items-center gap-1 bg-primary/15 hover:bg-primary/25 text-primary text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                                            >
                                                Vire Product <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        ) : null}
                                        <button
                                            type="button"
                                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                            title="Expand"
                                        >
                                            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                        </button>
                                    </div>

                                    <div className={`lg:col-span-12 overflow-hidden transition-all duration-300 ease-out ${isExpanded ? "max-h-[1000px] opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                                        <div className="rounded-xl border border-white/10 bg-[#0f1522]/70 p-4 lg:p-5">
                                            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                                                <div className="lg:w-48 w-full">
                                                    <div className="aspect-[4/3] rounded-xl border border-white/10 bg-slate-900/70 overflow-hidden">
                                                        {order.product?.images?.[0] ? (
                                                            <img src={order.product.images[0]} alt={order.product?.name ?? "Product"} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                                <Package className="w-8 h-8" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
                                                    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                                                        <div className="text-slate-400 text-xs uppercase tracking-widest">Order Number</div>
                                                        <div className="text-white font-semibold mt-1 break-all">{order.orderNumber ?? order.id}</div>
                                                    </div>
                                                    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                                                        <div className="text-slate-400 text-xs uppercase tracking-widest">Created</div>
                                                        <div className="text-white font-semibold mt-1">{formatDate(order.createdAt)}</div>
                                                    </div>
                                                    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                                                        <div className="text-slate-400 text-xs uppercase tracking-widest">Buyer</div>
                                                        <div className="text-white font-semibold mt-1">{order.importer?.companyName || order.importer?.name || "Importer"}</div>
                                                    </div>
                                                    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                                                        <div className="text-slate-400 text-xs uppercase tracking-widest">Country</div>
                                                        <div className="text-white font-semibold mt-1">{order.importer?.country ?? "N/A"}</div>
                                                    </div>
                                                    <div className="rounded-lg bg-white/5 border border-white/10 p-3 md:col-span-2">
                                                        <div className="text-slate-400 text-xs uppercase tracking-widest">Product</div>
                                                        <div className="text-white font-semibold mt-1">{order.product?.name ?? "Unknown Product"}</div>
                                                    </div>
                                                    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                                                        <div className="text-slate-400 text-xs uppercase tracking-widest">Price</div>
                                                        <div className="text-white font-semibold mt-1">{formatCurrency(order.totalPrice)}</div>
                                                    </div>
                                                    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                                                        <div className="text-slate-400 text-xs uppercase tracking-widest">Quantity</div>
                                                        <div className="text-white font-semibold mt-1">{order.quantity ?? 0}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                                                <h4 className="text-sm font-bold text-white mb-2">Buyer Review & Rating</h4>
                                                {review ? (
                                                    <>
                                                        <div className="flex items-center gap-2 text-amber-400 mb-2">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star key={star} className={`w-4 h-4 ${star <= review.rating ? "fill-current" : ""}`} />
                                                            ))}
                                                            <span className="text-xs text-slate-300 ml-2">{review.rating}/5</span>
                                                        </div>
                                                        <p className="text-sm text-slate-200">{review.comment || "No written comment."}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-xs text-slate-400">No review submitted yet for this order.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
}
