"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Package, Truck, Clock, CheckCircle2, XCircle, ShoppingCart, Info, ShieldAlert, Star, ChevronDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/api-utils";
import OrderDetailsModal from "./OrderDetailsModal";
import DisputeModal from "./DisputeModal";
import EmptyState from "@/components/ui/EmptyState";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: "Pending", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: Clock },
    CONFIRMED: { label: "Confirmed", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: CheckCircle2 },
    PROCESSING: { label: "Processing", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: Package },
    SHIPPED: { label: "Shipped", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", icon: Truck },
    DELIVERED: { label: "Delivered", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
};

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

export default function OrdersList({ initialOrders }: { initialOrders: any[] }) {
    const [orders, setOrders] = useState<any[]>(initialOrders);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [disputeOpen, setDisputeOpen] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [reviewsByOrder, setReviewsByOrder] = useState<Record<string, ProductReview>>({});
    const [ratingDraftByOrder, setRatingDraftByOrder] = useState<Record<string, number>>({});
    const [commentDraftByOrder, setCommentDraftByOrder] = useState<Record<string, string>>({});

    const loadLocalOrders = () => {
        if (typeof window === "undefined") return;
        try {
            const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
            const localOrders = raw ? (JSON.parse(raw) as any[]) : [];
            const merged = [...localOrders, ...initialOrders].filter((order, index, arr) => {
                return index === arr.findIndex((x) => (x.id && x.id === order.id) || x.orderNumber === order.orderNumber);
            });
            merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(merged);
        } catch {
            setOrders(initialOrders);
        }
    };

    const loadReviews = () => {
        if (typeof window === "undefined") return;
        try {
            const raw = localStorage.getItem(PRODUCT_REVIEWS_KEY);
            const reviews = raw ? (JSON.parse(raw) as ProductReview[]) : [];
            const map: Record<string, ProductReview> = {};
            for (const review of reviews) {
                map[review.orderId] = review;
            }
            setReviewsByOrder(map);
        } catch {
            setReviewsByOrder({});
        }
    };

    useEffect(() => {
        loadLocalOrders();
        loadReviews();

        const onStorageSync = () => {
            loadLocalOrders();
            loadReviews();
        };

        window.addEventListener("storage", onStorageSync);
        window.addEventListener("renote-orders-updated", onStorageSync);

        return () => {
            window.removeEventListener("storage", onStorageSync);
            window.removeEventListener("renote-orders-updated", onStorageSync);
        };
    }, [initialOrders]);

    const deliveredOrShippedIds = useMemo(() => {
        return new Set(orders.filter((order) => ["SHIPPED", "DELIVERED"].includes(order.status)).map((order) => order.id));
    }, [orders]);

    const openDetails = (order: any) => {
        setSelectedOrder(order);
        setDetailsOpen(true);
    };

    const openDispute = (e: React.MouseEvent, order: any) => {
        e.stopPropagation();
        setSelectedOrder(order);
        setDisputeOpen(true);
    };

    const submitReview = (order: any) => {
        const rating = ratingDraftByOrder[order.id] ?? 0;
        const comment = (commentDraftByOrder[order.id] ?? "").trim();

        if (rating < 1 || rating > 5) {
            toast.error("Please select a rating between 1 and 5 stars");
            return;
        }

        const nextReview: ProductReview = {
            orderId: order.id,
            productId: order.product?.id ?? "",
            productName: order.product?.name ?? "Product",
            rating,
            comment,
            createdAt: new Date().toISOString(),
        };

        try {
            const raw = localStorage.getItem(PRODUCT_REVIEWS_KEY);
            const reviews = raw ? (JSON.parse(raw) as ProductReview[]) : [];
            const filtered = reviews.filter((review) => review.orderId !== order.id);
            const nextReviews = [nextReview, ...filtered].slice(0, 500);

            localStorage.setItem(PRODUCT_REVIEWS_KEY, JSON.stringify(nextReviews));
            document.cookie = `renote_product_reviews=${encodeURIComponent(JSON.stringify(nextReviews))}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;

            setReviewsByOrder((prev) => ({ ...prev, [order.id]: nextReview }));
            toast.success("Review submitted successfully");
            window.dispatchEvent(new Event("renote-orders-updated"));
        } catch {
            toast.error("Failed to save review");
        }
    };

    if (orders.length === 0) {
        return (
            <EmptyState 
              icon={ShoppingCart}
              title="No Orders Yet"
              description="Your order history is currently empty. Explore the global marketplace to discover premium products."
              actionLabel="Explore Marketplace"
              href="/products"
            />
        );
    }

    return (
        <>
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-4">Product & Seller</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="space-y-4">
                {orders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                    const StatusIcon = cfg.icon;
                    const isExpanded = expandedOrderId === order.id;
                    const review = reviewsByOrder[order.id];
                    const currentRating = ratingDraftByOrder[order.id] ?? review?.rating ?? 0;
                    const currentComment = commentDraftByOrder[order.id] ?? review?.comment ?? "";
                    const isReviewEligible = deliveredOrShippedIds.has(order.id);
                    return (
                        <div
                            key={order.id}
                            className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 hover:border-primary/30 hover:bg-[#172033]/70 transition-all duration-300 shadow-xl rounded-2xl p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center group"
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
                                    <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{order.product?.name ?? "Unknown Product"}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">by {order.product?.exporter?.companyName || order.product?.exporter?.name || "Exporter"}</div>
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
                                        onClick={(e) => e.stopPropagation()}
                                        className="px-3 py-2 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-xs font-bold transition-colors"
                                        title="Vire Product"
                                    >
                                        Vire Product
                                    </Link>
                                ) : null}
                                <button
                                    onClick={(e) => { e.stopPropagation(); openDetails(order); }}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                    title="Order Details"
                                >
                                    <Info className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedOrderId(isExpanded ? null : order.id);
                                    }}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                    title="Expand"
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </button>
                                {["SHIPPED", "DELIVERED"].includes(order.status) && (
                                    <button
                                        onClick={(e) => openDispute(e, order)}
                                        className="p-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 transition-colors"
                                        title="Raise Dispute"
                                    >
                                        <ShieldAlert className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className={`lg:col-span-12 overflow-hidden transition-all duration-300 ease-out ${isExpanded ? "max-h-[1200px] opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                                <div className="rounded-xl border border-white/10 bg-[#0f1522]/70 p-4 lg:p-5 space-y-4">
                                    <div className="flex flex-col lg:flex-row gap-4">
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
                                                <div className="text-slate-400 text-xs uppercase tracking-widest">Order ID</div>
                                                <div className="text-white font-semibold mt-1 break-all">{order.orderNumber ?? order.id}</div>
                                            </div>
                                            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                                                <div className="text-slate-400 text-xs uppercase tracking-widest">Product Price</div>
                                                <div className="text-white font-semibold mt-1">{formatCurrency(order.totalPrice)}</div>
                                            </div>
                                            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                                                <div className="text-slate-400 text-xs uppercase tracking-widest">Quantity</div>
                                                <div className="text-white font-semibold mt-1">{order.quantity ?? 0}</div>
                                            </div>
                                            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                                                <div className="text-slate-400 text-xs uppercase tracking-widest">Category</div>
                                                <div className="text-white font-semibold mt-1">{order.product?.category ?? "N/A"}</div>
                                            </div>
                                            <div className="rounded-lg bg-white/5 border border-white/10 p-3 md:col-span-2 xl:col-span-2">
                                                <div className="text-slate-400 text-xs uppercase tracking-widest">Product Name</div>
                                                <div className="text-white font-semibold mt-1">{order.product?.name ?? "Unknown Product"}</div>
                                            </div>
                                            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                                                <div className="text-slate-400 text-xs uppercase tracking-widest">Seller</div>
                                                <div className="text-white font-semibold mt-1">{order.product?.exporter?.companyName || order.product?.exporter?.name || "Exporter"}</div>
                                            </div>
                                            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                                                <div className="text-slate-400 text-xs uppercase tracking-widest">Seller Country</div>
                                                <div className="text-white font-semibold mt-1">{order.product?.exporter?.country ?? "N/A"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <h4 className="text-sm font-bold text-white">Give a Review</h4>
                                            {review && <span className="text-xs text-emerald-400 font-semibold">Submitted</span>}
                                        </div>

                                        {!isReviewEligible ? (
                                            <p className="text-xs text-slate-400">Review option unlocks once order is shipped or delivered.</p>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setRatingDraftByOrder((prev) => ({ ...prev, [order.id]: star }))}
                                                            className="text-amber-400 hover:scale-110 transition-transform"
                                                            title={`${star} star`}
                                                        >
                                                            <Star className={`w-5 h-5 ${star <= currentRating ? "fill-current" : ""}`} />
                                                        </button>
                                                    ))}
                                                    <span className="text-xs text-slate-300 ml-2">{currentRating || 0}/5</span>
                                                </div>

                                                <textarea
                                                    value={currentComment}
                                                    onChange={(e) => setCommentDraftByOrder((prev) => ({ ...prev, [order.id]: e.target.value }))}
                                                    className="w-full min-h-24 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                    placeholder="Share product quality, packaging, and delivery experience..."
                                                />

                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => submitReview(order)}
                                                        className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
                                                    >
                                                        {review ? "Update Review" : "Submit Review"}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <OrderDetailsModal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} order={selectedOrder} />
            <DisputeModal isOpen={disputeOpen} onClose={() => setDisputeOpen(false)} order={selectedOrder} />
        </>
    );
}
