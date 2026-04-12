"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
 Package,
 ArrowRight,
 Clock,
 CheckCircle2,
 XCircle,
 Truck,
 Search,
 ChevronDown,
 Star,
 Globe,
 ShieldCheck,
 ShoppingCart,
 Layers,
 TrendingUp,
 Circle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import ShipmentTrackingPanel from "@/components/dashboard/ShipmentTrackingPanel";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
 PENDING: { label: "PENDING_NODE", color: "text-muted-foreground/40 bg-black/5 dark:bg-white/10 border-border dark:border-white/5", icon: Clock },
 CONFIRMED: { label: "CONFIRMED_SIG", color: "text-foreground dark:text-white bg-black/10 dark:bg-white/15 border-border dark:border-white/20", icon: CheckCircle2 },
 PROCESSING: { label: "PROCESSING_FEED", color: "text-muted-foreground/60 bg-black/5 dark:bg-white/10 border-border dark:border-white/5", icon: Layers },
 SHIPPED: { label: "IN_TRANSIT", color: "text-muted-foreground/80 bg-black/10 dark:bg-white/15 border-border dark:border-white/20", icon: Truck },
 DELIVERED: { label: "DELIVERED", color: "text-primary-foreground bg-primary border-transparent", icon: CheckCircle2 },
 CANCELLED: { label: "TERMINATED", color: "text-muted-foreground/10 bg-black/5 dark:bg-white/10 border-border dark:border-white/5", icon: XCircle },
 DISPUTED: { label: "DISPUTE_SIGNAL", color: "text-orange-400/60 bg-orange-400/5 border-orange-400/10", icon: XCircle },
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
 const [shipmentExpandedOrderId, setShipmentExpandedOrderId] = useState<string | null>(null);
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
 order.importer?.businessName,
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
 { id: "ALL", label: "Full Registry", count: counts.all },
 { id: "PENDING", label: "Pending", count: counts.pending },
 { id: "PROCESSING", label: "Processing", count: counts.processing },
 { id: "SHIPPED", label: "Shipped", count: counts.shipped },
 { id: "DELIVERED", label: "Delivered", count: counts.delivered },
 ];

 return (
 <div className="space-y-10">
 {/* ── Filters ── */}
 <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
 <div className="flex flex-wrap gap-3">
 {statusPills.map((pill) => (
 <button
 key={pill.id}
 onClick={() => updateFilters(pill.id)}
 className={`px-6 py-3 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-3xl ${currentStatus === pill.id
 ? "bg-primary text-primary-foreground border-transparent shadow-2xl shadow-white/10 scale-105"
 : "bg-card/40 dark:bg-white/5 text-muted-foreground/40 border-border dark:border-white/5 hover:bg-black/10 dark:bg-white/15 hover:text-foreground dark:text-white"
 }`}
 >
 {pill.label} <span className="opacity-30 ml-2 font-black">{pill.count < 10 ? `0${pill.count}` : pill.count}</span>
 </button>
 ))}
 </div>

 <form onSubmit={handleSearch} className="relative w-full xl:w-[450px] group">
 <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-foreground dark:text-white transition-colors" />
 <input
 type="text"
 placeholder="Search trade sequence identity..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-14 pr-6 py-4 bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 rounded-lg text-[10px] text-foreground dark:text-white font-black uppercase tracking-widest placeholder:text-muted-foreground/20 focus:outline-none focus:border-border dark:border-white/20 transition-all shadow-inner backdrop-blur-xl"
 />
 </form>
 </div>

 {/* ── Orders Feed ── */}
 <div className="space-y-6 relative">
 <AnimatePresence>
 {isPending && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 bg-card/40 dark:bg-white/5 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg"
 >
 <div className="flex flex-col items-center gap-6">
 <div className="p-8 rounded-lg bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 animate-pulse">
 <Globe className="w-10 h-10 text-foreground dark:text-white animate-spin-slow" />
 </div>
 <p className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.4em] ">Streaming Trade Sequence...</p>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {displayOrders.length === 0 ? (
 <div className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 shadow-xl dark:shadow-2xl rounded-lg p-24 text-center">
 <div className="flex flex-col items-center gap-8 opacity-40">
 <div className="p-10 rounded-lg bg-black/5 dark:bg-white/10 border border-border dark:border-white/10">
 <Package className="w-16 h-16 text-foreground dark:text-white" />
 </div>
 <div className="space-y-4">
 <h2 className="text-2xl font-black text-foreground dark:text-white uppercase tracking-tighter">Null_Trade_Registry</h2>
 <p className="text-[10px] text-foreground dark:text-white font-black uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed ">
 Registry query yielded no active signature matches. Adjust signal parameters or await incoming telemetry.
 </p>
 </div>
 </div>
 </div>
 ) : (
 <>
 {/* Desktop Header */}
 <div className="hidden lg:grid grid-cols-12 gap-10 px-10 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] ">
 <div className="col-span-5">Identity_Sequence</div>
 <div className="col-span-2">Net_Valuation</div>
 <div className="col-span-2 text-center">Protocol_Status</div>
 <div className="col-span-1 text-center">Timestamp</div>
 <div className="col-span-2 text-right">Overrides</div>
 </div>

 <div className="space-y-4">
 {displayOrders.map((order) => {
 const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
 const StatusIcon = cfg.icon;
 const isExpanded = expandedOrderId === order.id;
 const review = reviewsByOrder[order.id];
 return (
 <div
 key={order.id}
 className={`bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 hover:border-border dark:border-white/20 transition-all duration-700 shadow-xl dark:shadow-2xl rounded-lg p-6 lg:p-8 group ${isExpanded ? "ring-2 ring-white/10" : "hover:-translate-y-1"}`}
 >
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
 <div
 className="lg:col-span-5 flex items-center gap-8 cursor-pointer"
 onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
 >
 <div className="size-20 rounded-lg bg-black/5 dark:bg-white/10 border border-border dark:border-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden p-2 group-hover:border-border dark:border-white/20 transition-all duration-1000 shadow-inner">
 {order.product?.images?.[0] ? (
 <img src={order.product.images[0]} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all duration-1000" />
 ) : (
 <Package className="w-8 h-8 text-muted-foreground/20 transition-colors" />
 )}
 </div>
 <div className="min-w-0">
 <div className="text-xl font-black text-foreground dark:text-white truncate tracking-tighter uppercase group-hover:translate-x-1 transition-transform">{order.product?.name ?? "NULL_ASSET"}</div>
 <div className="text-[10px] text-muted-foreground/30 mt-2 font-black uppercase tracking-widest flex items-center gap-2 group-hover:text-muted-foreground transition-colors truncate">
 {order.importer?.businessName || order.importer?.name || "ANON_NODE"} // {order.importer?.country ?? "GLOBAL"}
 </div>
 <div className="text-[9px] text-muted-foreground/10 mt-1 font-black uppercase tracking-widest ">
 QTY: {order.quantity ?? 0} // {order.product?.category || "GENERAL"}
 </div>
 </div>
 </div>

 <div className="lg:col-span-2">
 <div className="text-foreground dark:text-white font-black text-2xl tracking-tighter group-hover:scale-105 transition-transform origin-left">{formatCurrency(order.totalPrice)}</div>
 <div className="text-[8px] text-muted-foreground/20 font-black uppercase tracking-[0.3em] mt-2 group-hover:text-muted-foreground/40 transition-colors">SETTLEMENT_{(order.paymentStatus ?? "pending").toUpperCase()}</div>
 </div>

 <div className="lg:col-span-2 flex justify-center">
 <span className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] shadow-xl dark:shadow-2xl transition-all ${cfg.color}`}>
 <StatusIcon className={`w-3.5 h-3.5 ${order.status !== 'DELIVERED' ? 'animate-pulse' : ''}`} />
 {cfg.label}
 </span>
 </div>

 <div className="lg:col-span-1 text-center">
 <div className="text-[10px] text-foreground dark:text-white font-black tracking-widest uppercase opacity-60">{formatDate(order.createdAt)}</div>
 </div>

 <div className="lg:col-span-2 flex justify-end gap-3">
 <Link
 href={order.product?.id ? `/products/${order.product.id}` : "#"}
 className="size-14 bg-black/5 dark:bg-white/10 border border-border dark:border-white/5 text-muted-foreground/20 hover:text-foreground dark:text-white hover:bg-black/10 dark:bg-white/15 hover:border-border dark:border-white/20 rounded-lg flex items-center justify-center transition-all duration-500 active:scale-90 shadow-xl dark:shadow-2xl"
 title="View Source Node"
 >
 <ArrowRight className="w-5 h-5 flex-shrink-0" />
 </Link>
 <button
 onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
 className={`size-14 rounded-lg flex items-center justify-center transition-all duration-500 shadow-xl dark:shadow-2xl ${isExpanded ? "bg-primary text-primary-foreground border-transparent" : "bg-black/5 dark:bg-white/10 border border-border dark:border-white/5 text-muted-foreground/20 hover:text-foreground dark:text-white"}`}
 title="Expand Telemetry"
 >
 <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`} />
 </button>
 </div>

 {/* ── Expanded Content ── */}
 <AnimatePresence>
 {isExpanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="lg:col-span-12 overflow-hidden"
 >
 <div className="pt-10 mt-10 border-t border-border dark:border-white/5 space-y-10">
 <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
 <div className="xl:col-span-3">
 <div className="aspect-[4/3] rounded-lg border border-border dark:border-white/5 bg-white/[0.02] overflow-hidden p-3 shadow-inner group/img">
 {order.product?.images?.[0] ? (
 <img src={order.product.images[0]} alt="" className="w-full h-full object-cover rounded-lg grayscale group-hover/img:grayscale-0 transition-all duration-1000 opacity-60 group-hover/img:opacity-100" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-muted-foreground/10"><Package className="w-12 h-12" /></div>
 )}
 </div>
 </div>

 <div className="xl:col-span-9 space-y-10">
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 <div className="p-6 rounded-lg bg-black/5 dark:bg-white/5 border border-border dark:border-white/5">
 <div className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] mb-2 ">Sequence_UID</div>
 <div className="text-sm font-black text-foreground dark:text-white tracking-tighter uppercase truncate">{order.orderNumber ?? order.id}</div>
 </div>
 <div className="p-6 rounded-lg bg-black/5 dark:bg-white/5 border border-border dark:border-white/5">
 <div className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] mb-2 ">Timestamp_Registry</div>
 <div className="text-sm font-black text-foreground dark:text-white tracking-tighter uppercase ">{formatDate(order.createdAt)}</div>
 </div>
 <div className="p-6 rounded-lg bg-black/5 dark:bg-white/5 border border-border dark:border-white/5">
 <div className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] mb-2 ">Valuation_Metric</div>
 <div className="text-sm font-black text-foreground dark:text-white tracking-tighter uppercase ">{formatCurrency(order.totalPrice)}</div>
 </div>
 </div>

 <div className="flex flex-wrap gap-4">
 <button
 onClick={() => setShipmentExpandedOrderId(shipmentExpandedOrderId === order.id ? null : order.id)}
 className={`px-8 py-3 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${shipmentExpandedOrderId === order.id
 ? "bg-primary text-primary-foreground border-transparent shadow-2xl shadow-white/10 scale-105"
 : "bg-card/40 dark:bg-white/5 text-muted-foreground/40 border-border dark:border-white/5 hover:bg-black/10 dark:bg-white/15 hover:text-foreground dark:text-white"}`}
 >
 Logistics_Telemetry
 </button>
 </div>
 </div>
 </div>

 {shipmentExpandedOrderId === order.id && (
 <ShipmentTrackingPanel shipment={order.shipment} />
 )}

 <div className="p-8 rounded-lg border border-border dark:border-white/10 bg-black/5 dark:bg-white/10 relative overflow-hidden group/intel">
 <div className="absolute top-0 right-0 p-8 opacity-5">
 <ShieldCheck className="w-20 h-20 text-foreground dark:text-white" />
 </div>
 <h4 className="text-[10px] font-black text-foreground dark:text-slate-900 dark:text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
 <div className="size-2 rounded-full bg-primary animate-pulse" />
 Intelligence Feedback Loop
 </h4>
 {review ? (
 <div className="space-y-4">
 <div className="flex items-center gap-2 text-foreground dark:text-white">
 {[1, 2, 3, 4, 5].map((star) => (
 <Star key={star} className={`w-5 h-5 ${star <= review.rating ? "fill-white text-foreground dark:text-white" : "text-white/10"}`} />
 ))}
 <span className="text-[10px] font-black text-white/40 ml-4 tracking-[0.2em] uppercase">{review.rating} / 5.0 CONFIRMED</span>
 </div>
 <p className="text-sm font-black text-white/60 leading-relaxed uppercase tracking-tighter">&ldquo;{review.comment || "Consensus confirmed. No anomalies reported in trade sequence."}&rdquo;</p>
 </div>
 ) : (
 <p className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.4em] mb-2">Awaiting procurement node validation sequence...</p>
 )}
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 );
 })}
 </div>
 </>
 )}
 </div>
 </div>
 );
}
