"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  ChevronDown,
  Loader2,
  Building2,
  ExternalLink,
  History,
  Activity,
  Star,
  Zap
} from "lucide-react";
import { formatCurrency, formatDate, authFetch } from "@/lib/api-utils";
import OrderDetailsModal from "./OrderDetailsModal";
import DisputeModal from "./DisputeModal";
import EmptyState from "@/components/ui/EmptyState";
import ShipmentTrackingPanel from "@/components/dashboard/ShipmentTrackingPanel";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: any; step: number }> = {
  QUOTE_REQUESTED: { label: "Quote Requested", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", icon: Clock, step: 1 },
  CHECKOUT: { label: "Checkout", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", icon: ShoppingCart, step: 1 },
  PENDING: { label: "Pending", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", icon: Clock, step: 1 },
  QUOTE_CONFIRMED: { label: "Confirmed", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20", icon: CheckCircle2, step: 2 },
  CONFIRMED: { label: "Confirmed", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20", icon: CheckCircle2, step: 2 },
  PROCESSING: { label: "Processing", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20", icon: Package, step: 3 },
  SHIPPED: { label: "Shipped", color: "text-sky-600 dark:text-sky-400", bgColor: "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20", icon: Truck, step: 4 },
  DELIVERED: { label: "Delivered", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", icon: CheckCircle2, step: 5 },
  CANCELLED: { label: "Cancelled", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20", icon: XCircle, step: 0 },
};

const STEP_LABELS = ["Ordered", "Confirmed", "Processing", "Shipped", "Delivered"];

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

  // Merge local + server orders
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

  // Real-time status polling — fetches fresh order data from the API every 20s
  const pollRef = useRef(false);
  const pollStatus = useCallback(async () => {
    if (pollRef.current) return;
    const activeOrders = orders.filter(
      o => !o.id.startsWith('local-') && !['DELIVERED', 'CANCELLED'].includes(o.orderStatus)
    );
    if (activeOrders.length === 0) return;

    pollRef.current = true;
    try {
      const updates = await Promise.allSettled(
        activeOrders.map(o => authFetch<any>(`/api/orders/${o.id}`))
      );
      let hasChanges = false;
      setOrders(prev => {
        const next = [...prev];
        updates.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value?.order) {
            const updated = result.value.order;
            const existingIdx = next.findIndex(o => o.id === updated.id);
            if (existingIdx >= 0 && next[existingIdx].orderStatus !== updated.orderStatus) {
              next[existingIdx] = { ...next[existingIdx], ...updated };
              hasChanges = true;
            }
          }
        });
        return hasChanges ? next : prev;
      });
    } catch (e) {
      console.warn("Status polling error:", e);
    } finally {
      pollRef.current = false;
    }
  }, [orders]);

  useEffect(() => {
    sync();
    const interval = setInterval(pollStatus, 20000);
    window.addEventListener("storage", sync);
    window.addEventListener("renote-orders-updated", sync);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", sync);
      window.removeEventListener("renote-orders-updated", sync);
    };
  }, [sync, pollStatus]);

  // Fetch notifications for expanded order
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
      toast.success("Review submitted successfully!");
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
        description="Your order history is empty. Browse the marketplace to discover premium products."
        actionLabel="Browse Products"
        href="/products"
      />
    );
  }

  return (
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
            className={`bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? "ring-2 ring-primary/20" : "hover:shadow-md"}`}
          >
            {/* Order Card Row */}
            <div
              className="p-5 cursor-pointer"
              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Product Image + Name */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-lg bg-muted border border-border flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {order.product?.images?.[0] ? (
                      <img src={order.product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-foreground truncate">{order.product?.name ?? "Unknown Product"}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <Building2 className="w-3 h-3" />
                      {order.product?.exporter?.businessName || order.product?.exporter?.name || "Seller"}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right sm:text-center sm:w-28">
                  <div className="text-lg font-bold text-foreground">{formatCurrency(order.totalPrice)}</div>
                  <div className="text-xs text-muted-foreground">Qty: {order.quantity}</div>
                </div>

                {/* Status Badge */}
                <div className="sm:w-36 flex sm:justify-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${cfg.bgColor} ${cfg.color}`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${!['DELIVERED', 'CANCELLED'].includes(order.orderStatus) ? 'animate-pulse' : ''}`} />
                    {cfg.label}
                  </span>
                </div>

                {/* Date + Expand */}
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-border"
                >
                  <div className="p-6 space-y-6">
                    {/* Progress Steps */}
                    <div className="relative flex items-center justify-between gap-2 py-4">
                      {STEP_LABELS.map((label, idx) => {
                        const stepNum = idx + 1;
                        const isActive = cfg.step >= stepNum;
                        const isCurrent = cfg.step === stepNum;
                        const isLast = idx === STEP_LABELS.length - 1;
                        const isLineActive = cfg.step > stepNum;
                        
                        return (
                          <div key={label} className="relative flex flex-col items-center gap-2 flex-1">
                            {/* Background Line */}
                            {!isLast && (
                              <div 
                                className="absolute h-[2px] bg-border z-0" 
                                style={{ top: '18px', left: '50%', width: 'calc(100% + 8px)', transform: 'translateY(-50%)' }}
                              />
                            )}
                            {/* Active Line */}
                            {!isLast && (
                              <div 
                                className="absolute h-[2px] bg-primary z-0 transition-all duration-700 ease-in-out origin-left" 
                                style={{ 
                                  top: '18px',
                                  left: '50%', 
                                  width: 'calc(100% + 8px)', 
                                  transform: `translateY(-50%) scaleX(${isLineActive ? 1 : 0})` 
                                }}
                              />
                            )}
                            
                            <div className={`relative z-10 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                              isActive
                                ? "bg-primary border-primary text-primary-foreground"
                                : "bg-card border-border text-muted-foreground"
                            }`}>
                              {isActive ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            </div>
                            <span className={`text-[10px] font-medium ${isCurrent ? "text-primary font-bold" : "text-muted-foreground"}`}>
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Order History */}
                      <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <History className="w-4 h-4" /> Order History
                        </h4>
                        <div className="space-y-2">
                          {loadingNotifications[order.id] ? (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Loading history...</span>
                            </div>
                          ) : orderHistory.length > 0 ? (
                            orderHistory.map((h) => (
                              <div key={h.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">{h.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{h.message}</p>
                                  <p className="text-[10px] text-muted-foreground/60 mt-1">{formatDate(h.createdAt)}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-6 rounded-lg border border-dashed border-border flex flex-col items-center text-center">
                              <Activity className="w-6 h-6 text-muted-foreground/40 mb-2" />
                              <p className="text-sm text-muted-foreground">No history available yet</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setShipmentExpandedOrderId(shipmentExpandedOrderId === order.id ? null : order.id); }}
                            className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                              shipmentExpandedOrderId === order.id
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Track Shipment
                          </button>
                          <Link
                            href={`/products/${order.product?.id}`}
                            className="px-4 py-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground text-xs font-semibold transition-all flex items-center gap-1.5"
                          >
                            View Product <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {/* Order Details Sidebar */}
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                          <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Order Number</p>
                            <p className="text-sm font-semibold text-foreground">{order.orderNumber ?? order.id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Seller</p>
                            <p className="text-sm font-semibold text-foreground">{order.product?.exporter?.businessName || order.product?.exporter?.name || "Seller"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Quantity</p>
                            <p className="text-sm font-semibold text-foreground">{order.quantity} Units</p>
                          </div>
                        </div>

                        {/* Review Section */}
                        <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Star className="w-4 h-4 text-primary" /> Leave a Review
                          </h4>
                          {!isDelivered ? (
                            <p className="text-xs text-muted-foreground">Reviews can be submitted after delivery.</p>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={(e) => { e.stopPropagation(); setRatingDraftByOrder((prev) => ({ ...prev, [order.id]: star })); }}
                                    className="hover:scale-110 transition-transform"
                                  >
                                    <Star className={`w-5 h-5 ${star <= currentRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={currentComment}
                                onChange={(e) => setCommentDraftByOrder((prev) => ({ ...prev, [order.id]: e.target.value }))}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full min-h-20 bg-muted/50 border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-all resize-none"
                                placeholder="Share your experience..."
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); submitReview(order); }}
                                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all"
                              >
                                Submit Review
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {shipmentExpandedOrderId === order.id && (
                      <div className="mt-4 animate-in fade-in duration-300">
                        <ShipmentTrackingPanel shipment={order.shipment} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <OrderDetailsModal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} order={selectedOrder} />
      <DisputeModal isOpen={disputeOpen} onClose={() => setDisputeOpen(false)} order={selectedOrder} />
    </div>
  );
}
