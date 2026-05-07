"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  Info,
  ShieldAlert,
  Star,
  ChevronDown,
  Loader2,
  Globe,
  Building2,
  ExternalLink,
  ShieldCheck,
  History,
  Activity,
  Zap
} from "lucide-react";
import { formatCurrency, formatDate, authFetch } from "@/lib/api-utils";
import OrderDetailsModal from "./OrderDetailsModal";
import DisputeModal from "./DisputeModal";
import EmptyState from "@/components/ui/EmptyState";
import ShipmentTrackingPanel from "@/components/dashboard/ShipmentTrackingPanel";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; step: number }> = {
  QUOTE_REQUESTED: { label: "PENDING_NODE", color: "text-muted-foreground/40 bg-black/5 dark:bg-white/10 border-border dark:border-white/5", icon: Clock, step: 1 },
  CHECKOUT: { label: "CHECKOUT", color: "text-muted-foreground/40 bg-black/5 dark:bg-white/10 border-border dark:border-white/5", icon: ShoppingCart, step: 1 },
  PENDING: { label: "PENDING_NODE", color: "text-muted-foreground/40 bg-black/5 dark:bg-white/10 border-border dark:border-white/5", icon: Clock, step: 1 },
  QUOTE_CONFIRMED: { label: "CONFIRMED_SIG", color: "text-foreground dark:text-white bg-black/10 dark:bg-white/15 border-border dark:border-white/20", icon: CheckCircle2, step: 2 },
  CONFIRMED: { label: "CONFIRMED_SIG", color: "text-foreground dark:text-white bg-black/10 dark:bg-white/15 border-border dark:border-white/20", icon: CheckCircle2, step: 2 },
  PROCESSING: { label: "PROCESSING_FEED", color: "text-blue-400 bg-blue-400/5 border-blue-400/10", icon: Package, step: 3 },
  SHIPPED: { label: "IN_TRANSIT", color: "text-amber-400 bg-amber-400/5 border-amber-400/10", icon: Truck, step: 4 },
  DELIVERED: { label: "DELIVERED", color: "text-primary-foreground bg-primary border-transparent", icon: CheckCircle2, step: 5 },
  CANCELLED: { label: "TERMINATED", color: "text-red-400/20 bg-red-400/5 border-red-400/10", icon: XCircle, step: 0 },
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
  const [shipmentExpandedOrderId, setShipmentExpandedOrderId] = useState<string | null>(null);
  const [reviewsByOrder, setReviewsByOrder] = useState<Record<string, ProductReview>>({});
  const [ratingDraftByOrder, setRatingDraftByOrder] = useState<Record<string, number>>({});
  const [commentDraftByOrder, setCommentDraftByOrder] = useState<Record<string, string>>({});
  const [notificationsByOrder, setNotificationsByOrder] = useState<Record<string, any[]>>({});
  const [loadingNotifications, setLoadingNotifications] = useState<Record<string, boolean>>({});

  // ── Sync logic with prioritized server data ────────────────────────────
  const sync = useCallback(() => {
    try {
      const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
      const localOrders = raw ? (JSON.parse(raw) as any[]) : [];
      const merged = [...initialOrders];
      for (const local of localOrders) {
        const exists = merged.find(m => m.id === local.id || m.orderNumber === local.orderNumber);
        if (!exists) merged.push(local);
      }
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(merged);
    } catch {
      setOrders(initialOrders);
    }
  }, [initialOrders]);

  // ── Global Status Polling ───────────────────────────────────────────
  const pollStatus = useCallback(async () => {
    // Only poll for orders that aren't DELIVERED or CANCELLED
    const activeOrderIds = orders
      .filter(o => !o.id.startsWith('local-') && !['DELIVERED', 'CANCELLED'].includes(o.orderStatus))
      .map(o => o.id);

    if (activeOrderIds.length === 0) return;

    try {
      // In a real app, we'd have a batch endpoint. For now, we refresh all.
      // Since it's a Server Component page, we just rely on router.refresh() 
      // or we can manually fetch some updates if needed.
      // But for this UI, we'll just check the active ones if possible.
      // For now, let's just let the user know we're watching.
    } catch (e) {
      console.warn("Status polling error:", e);
    }
  }, [orders]);

  useEffect(() => {
    sync();
    const interval = setInterval(pollStatus, 15000); // Poll every 15s
    window.addEventListener("storage", sync);
    window.addEventListener("renote-orders-updated", sync);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", sync);
      window.removeEventListener("renote-orders-updated", sync);
    };
  }, [sync, pollStatus]);

  // ── Fetch notifications for expanded order ───────────────────────────
  const fetchOrderHistory = async (orderId: string) => {
    if (orderId.startsWith('local-')) return;
    setLoadingNotifications(prev => ({ ...prev, [orderId]: true }));
    try {
      const data = await authFetch<any>(`/api/notifications?entityId=${orderId}&limit=10`);
      setNotificationsByOrder(prev => ({ ...prev, [orderId]: data.notifications }));
    } catch (e) {
      console.warn("Failed to fetch order history:", e);
    } finally {
      setLoadingNotifications(prev => ({ ...prev, [orderId]: false }));
    }
  };

  useEffect(() => {
    if (expandedOrderId && !expandedOrderId.startsWith('local-')) {
      fetchOrderHistory(expandedOrderId);
    }
  }, [expandedOrderId]);

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
      const nextReviews = [nextReview, ...reviews.filter(r => r.orderId !== order.id)].slice(0, 500);
      localStorage.setItem(PRODUCT_REVIEWS_KEY, JSON.stringify(nextReviews));
      setReviewsByOrder(prev => ({ ...prev, [order.id]: nextReview }));
      toast.success("Procurement feedback logged to registry");
      window.dispatchEvent(new Event("renote-orders-updated"));
    } catch {
      toast.error("Failed to save review");
    }
  };

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Empty_Trade_Archive"
        description="Your procurement history is currently empty. Initialize marketplace connection to discover premium assets."
        actionLabel="Marketplace_Access"
        href="/products"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Table Header */}
      <div className="hidden lg:grid grid-cols-12 gap-8 px-8 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">
        <div className="col-span-5">Asset_Identity_Sequence</div>
        <div className="col-span-2">Net_Valuation</div>
        <div className="col-span-2 text-center">Protocol_Status</div>
        <div className="col-span-1 text-center">Timestamp</div>
        <div className="col-span-2 text-right">Overrides</div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const cfg = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.PENDING;
          const StatusIcon = cfg.icon;
          const isExpanded = expandedOrderId === order.id;
          const review = reviewsByOrder[order.id];
          const currentRating = ratingDraftByOrder[order.id] ?? review?.rating ?? 0;
          const currentComment = commentDraftByOrder[order.id] ?? review?.comment ?? "";
          const isDelivered = order.orderStatus === "DELIVERED";
          const orderHistory = notificationsByOrder[order.id] || [];

          return (
            <div
              key={order.id}
              className={`bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 hover:border-border dark:border-white/20 transition-all duration-500 rounded-lg p-6 lg:p-8 group ${isExpanded ? "ring-2 ring-white/10" : "hover:-translate-y-1"}`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Identity Sequence */}
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
                      <Building2 className="w-3 h-3" />
                      {order.product?.exporter?.businessName || order.product?.exporter?.name || "GLOBAL_SUPPLIER"}
                    </div>
                  </div>
                </div>

                {/* Valuation */}
                <div className="lg:col-span-2">
                  <div className="text-foreground dark:text-white font-black text-2xl tracking-tighter">{formatCurrency(order.totalPrice)}</div>
                  <div className="text-[8px] text-muted-foreground/20 font-black uppercase tracking-[0.3em] mt-2 group-hover:text-muted-foreground/40 transition-colors">SETTLEMENT_{(order.paymentStatus ?? "pending").toUpperCase()}</div>
                </div>

                {/* Protocol Status */}
                <div className="lg:col-span-2 flex flex-col items-center gap-2">
                  <span className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] shadow-xl dark:shadow-2xl transition-all ${cfg.color}`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${order.orderStatus !== 'DELIVERED' ? 'animate-pulse' : ''}`} />
                    {cfg.label}
                  </span>
                  {order.id.startsWith('local-') && (
                    <div className="flex items-center gap-1 text-[8px] text-amber-500/60 font-black uppercase tracking-widest animate-pulse">
                      <Zap className="w-2.5 h-2.5" /> Awaiting_Sync
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="lg:col-span-1 text-center">
                  <div className="text-[10px] text-foreground dark:text-white font-black tracking-widest uppercase opacity-60">{formatDate(order.createdAt)}</div>
                </div>

                {/* Overrides */}
                <div className="lg:col-span-2 flex justify-end gap-3">
                  <button
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className={`size-14 rounded-lg flex items-center justify-center transition-all duration-500 shadow-xl dark:shadow-2xl ${isExpanded ? "bg-primary text-primary-foreground border-transparent" : "bg-black/5 dark:bg-white/10 border border-border dark:border-white/5 text-muted-foreground/20 hover:text-foreground dark:text-white"}`}
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="lg:col-span-12 overflow-hidden border-t border-border dark:border-white/5 mt-8 pt-8 space-y-10"
                    >
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                        {/* Fulfillment Steps Viz */}
                        <div className="xl:col-span-12">
                          <div className="flex items-center justify-between gap-4 relative py-8">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-black/5 dark:bg-white/5 -translate-y-1/2" />
                            {[1, 2, 3, 4, 5].map((s) => {
                              const isActive = cfg.step >= s;
                              const isCurrent = cfg.step === s;
                              return (
                                <div key={s} className="relative z-10 flex flex-col items-center gap-3">
                                  <div className={`size-10 rounded-full border flex items-center justify-center transition-all duration-1000 ${isActive ? "bg-primary border-transparent text-primary-foreground shadow-2xl shadow-primary/20 scale-110" : "bg-card dark:bg-background border-border dark:border-white/10 text-muted-foreground/20"}`}>
                                    {isActive ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-4 h-4" />}
                                  </div>
                                  <div className={`text-[8px] font-black uppercase tracking-widest ${isCurrent ? "text-primary" : "text-muted-foreground/20"}`}>
                                    Step_0{s}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="xl:col-span-8 space-y-10">
                          {/* Order History Timeline */}
                          <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] flex items-center gap-3">
                              <History className="w-4 h-4" /> Fulfillment_Sequence_History
                            </h4>
                            <div className="space-y-3">
                              {loadingNotifications[order.id] ? (
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-black/5 dark:bg-white/5 animate-pulse">
                                  <Loader2 className="w-4 h-4 animate-spin opacity-20" />
                                  <div className="h-2 w-48 bg-white/10 rounded" />
                                </div>
                              ) : orderHistory.length > 0 ? (
                                orderHistory.map((h, idx) => (
                                  <div key={h.id} className="flex items-start gap-4 p-4 rounded-lg bg-black/5 dark:bg-white/5 border border-transparent hover:border-white/5 transition-all group/h">
                                    <div className="size-2 rounded-full bg-primary mt-1.5 shadow-2xl shadow-primary/40 group-hover/h:scale-150 transition-transform" />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-widest mb-1">{h.title}</div>
                                      <div className="text-[11px] text-muted-foreground/60 leading-relaxed uppercase">{h.message}</div>
                                      <div className="text-[8px] text-muted-foreground/20 font-black mt-2 uppercase tracking-tighter">{formatDate(h.createdAt)}</div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-8 rounded-lg border border-dashed border-white/5 flex flex-col items-center justify-center text-center">
                                  <Activity className="w-8 h-8 text-muted-foreground/10 mb-3" />
                                  <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.4em]">Historical_Data_Pending_Transmission</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 pt-4">
                            <button
                              onClick={() => setShipmentExpandedOrderId(shipmentExpandedOrderId === order.id ? null : order.id)}
                              className={`px-8 py-3 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${shipmentExpandedOrderId === order.id
                                ? "bg-primary text-primary-foreground border-transparent shadow-2xl shadow-white/10 scale-105"
                                : "bg-card/40 dark:bg-white/5 text-muted-foreground/40 border-border dark:border-white/5 hover:bg-black/10 dark:bg-white/15 hover:text-foreground dark:text-white"}`}
                            >
                              Logistics_Telemetry
                            </button>
                            <Link
                              href={`/products/${order.product?.id}`}
                              className="px-8 py-3 rounded-lg bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 text-muted-foreground/40 hover:text-foreground dark:text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                              Asset_Source <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>

                        <div className="xl:col-span-4 space-y-8">
                          <div className="p-6 rounded-lg bg-black/5 dark:bg-white/5 border border-border dark:border-white/5 space-y-6">
                            <div>
                              <div className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] mb-2">Sequence_UID</div>
                              <div className="text-xs font-black text-foreground dark:text-white tracking-tighter uppercase truncate">{order.orderNumber ?? order.id}</div>
                            </div>
                            <div>
                              <div className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] mb-2">Supplier_Node</div>
                              <div className="text-xs font-black text-foreground dark:text-white tracking-tighter uppercase">{order.product?.exporter?.businessName || order.product?.exporter?.name || "Global Supplier"}</div>
                            </div>
                            <div>
                              <div className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] mb-2">Payload_Quantity</div>
                              <div className="text-xs font-black text-foreground dark:text-white tracking-tighter uppercase">{order.quantity} Units</div>
                            </div>
                          </div>

                          {/* Intelligence Feedback Loop */}
                          <div className="p-6 rounded-lg border border-border dark:border-white/10 bg-black/5 dark:bg-white/10 relative overflow-hidden group/intel">
                            <h4 className="text-[9px] font-black text-foreground dark:text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                              <Zap className="w-3 h-3 text-primary" /> Intelligence_Feed
                            </h4>

                            {!isDelivered ? (
                              <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.4em] leading-relaxed">Broadcast locked until delivery protocol completion.</p>
                            ) : (
                              <div className="space-y-5">
                                <div className="flex items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => setRatingDraftByOrder((prev) => ({ ...prev, [order.id]: star }))}
                                      className="text-foreground dark:text-white hover:scale-125 transition-transform"
                                    >
                                      <Star className={`w-5 h-5 ${star <= currentRating ? "fill-white text-foreground dark:text-white" : "text-white/10"}`} />
                                    </button>
                                  ))}
                                </div>
                                <textarea
                                  value={currentComment}
                                  onChange={(e) => setCommentDraftByOrder((prev) => ({ ...prev, [order.id]: e.target.value }))}
                                  className="w-full min-h-24 bg-black/20 border border-white/5 rounded-lg p-3 text-[10px] font-black text-white/60 placeholder:text-white/10 outline-none focus:border-white/20 transition-all uppercase tracking-widest"
                                  placeholder="Log trade sequence notes..."
                                />
                                <button
                                  onClick={() => submitReview(order)}
                                  className="w-full py-3 rounded-lg bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-2xl active:scale-95"
                                >
                                  Broadcast_Data
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {shipmentExpandedOrderId === order.id && (
                        <div className="mt-10 animate-in fade-in slide-in-from-top-4 duration-500">
                          <ShipmentTrackingPanel shipment={order.shipment} />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      <OrderDetailsModal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} order={selectedOrder} />
      <DisputeModal isOpen={disputeOpen} onClose={() => setDisputeOpen(false)} order={selectedOrder} />
    </div>
  );
}
