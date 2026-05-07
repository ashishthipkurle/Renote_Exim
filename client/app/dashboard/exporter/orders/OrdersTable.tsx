"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
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
  User,
  Mail,
  ExternalLink,
  Loader2,
  Check
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import ShipmentTrackingPanel from "@/components/dashboard/ShipmentTrackingPanel";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  QUOTE_REQUESTED: { label: "PENDING_NODE", color: "text-muted-foreground/40 bg-black/5 dark:bg-white/10 border-border dark:border-white/5", icon: Clock },
  CHECKOUT: { label: "CHECKOUT", color: "text-muted-foreground/40 bg-black/5 dark:bg-white/10 border-border dark:border-white/5", icon: ShoppingCart },
  PENDING: { label: "PENDING_NODE", color: "text-muted-foreground/40 bg-black/5 dark:bg-white/10 border-border dark:border-white/5", icon: Clock },
  QUOTE_CONFIRMED: { label: "CONFIRMED_SIG", color: "text-foreground dark:text-white bg-black/10 dark:bg-white/15 border-border dark:border-white/20", icon: CheckCircle2 },
  CONFIRMED: { label: "CONFIRMED_SIG", color: "text-foreground dark:text-white bg-black/10 dark:bg-white/15 border-border dark:border-white/20", icon: CheckCircle2 },
  PROCESSING: { label: "PROCESSING_FEED", color: "text-blue-400 bg-blue-400/5 border-blue-400/10", icon: Layers },
  SHIPPED: { label: "IN_TRANSIT", color: "text-amber-400 bg-amber-400/5 border-amber-400/10", icon: Truck },
  DELIVERED: { label: "DELIVERED", color: "text-primary-foreground bg-primary border-transparent", icon: CheckCircle2 },
  CANCELLED: { label: "TERMINATED", color: "text-red-400/20 bg-red-400/5 border-red-400/10", icon: XCircle },
};

const STATUS_ORDER = ["QUOTE_REQUESTED", "QUOTE_CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

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

export default function OrdersTable({ orders, counts }: OrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const currentStatus = searchParams.get("status") || "ALL";

  // Use state to allow for optimistic updates
  const [optimisticOrders, setOptimisticOrders] = useState<any[]>(orders);

  useEffect(() => {
    setOptimisticOrders(orders);
  }, [orders]);

  const displayOrders = useMemo(() => {
    let filtered = optimisticOrders;
    if (currentStatus !== "ALL") {
      filtered = filtered.filter((order) => {
        const status = (order.orderStatus || "").toUpperCase();
        if (currentStatus === "PENDING") {
          return status === "QUOTE_REQUESTED" || status === "CHECKOUT";
        }
        return status === currentStatus;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((order) => {
        const fields = [
          order.orderNumber,
          order.product?.name,
          order.buyer?.name,
          order.buyer?.businessName,
        ].filter(Boolean).join(" ").toLowerCase();
        return fields.includes(query);
      });
    }

    return filtered;
  }, [optimisticOrders, currentStatus, searchQuery]);

  const updateFilters = (newStatus?: string) => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery) params.set("search", searchQuery);
    else params.delete("search");

    if (newStatus !== undefined) {
      if (newStatus !== "ALL") params.set("status", newStatus);
      else params.delete("status");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    // Optimistic Update
    const prevOrders = [...optimisticOrders];
    setOptimisticOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    setUpdatingStatusId(orderId);
    
    try {
      await axios.patch(`/api/orders/${orderId}`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      router.refresh();
    } catch (err: any) {
      // Revert on error
      setOptimisticOrders(prevOrders);
      toast.error(err.response?.data?.error || "Failed to update status");
    } finally {
      setUpdatingStatusId(null);
    }
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
      {/* Filters */}
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

        <div className="relative w-full xl:w-[450px] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-foreground dark:text-white transition-colors" />
          <input
            type="text"
            placeholder="Search trade sequence identity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 rounded-lg text-[10px] text-foreground dark:text-white font-black uppercase tracking-widest placeholder:text-muted-foreground/20 focus:outline-none focus:border-border dark:border-white/20 transition-all shadow-inner backdrop-blur-xl"
          />
        </div>
      </div>

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
                <Loader2 className="w-10 h-10 text-foreground dark:text-white animate-spin" />
                <p className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.4em] ">Syncing Ledger...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {displayOrders.length === 0 ? (
          <div className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 shadow-xl dark:shadow-2xl rounded-lg p-24 text-center">
            <Package className="w-16 h-16 text-foreground dark:text-white opacity-20 mx-auto mb-6" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Null_Trade_Registry</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">No matching orders found in your sequence.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayOrders.map((order) => {
              const cfg = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.PENDING;
              const isExpanded = expandedOrderId === order.id;
              const StatusIcon = cfg.icon;

              return (
                <div
                  key={order.id}
                  className={`bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 hover:border-border dark:border-white/20 transition-all duration-500 rounded-lg p-6 group ${isExpanded ? "ring-1 ring-white/10" : ""}`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
                    <div className="lg:col-span-4 flex items-center gap-6">
                      <div className="size-16 rounded-lg bg-black/5 dark:bg-white/10 border border-border dark:border-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden p-1 shadow-inner">
                        {order.product?.images?.[0] ? (
                          <img src={order.product.images[0]} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all duration-1000" />
                        ) : (
                          <Package className="w-6 h-6 text-muted-foreground/20" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-lg font-black text-foreground dark:text-white truncate tracking-tighter uppercase">{order.product?.name ?? "NULL_ASSET"}</div>
                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest mt-1">
                          <User className="w-3 h-3" />
                          {order.buyer?.businessName || order.buyer?.name || "ANON_NODE"}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="text-foreground dark:text-white font-black text-xl tracking-tighter">{formatCurrency(order.totalPrice)}</div>
                      <div className="text-[8px] text-muted-foreground/30 font-black uppercase tracking-widest mt-1">
                        {order.quantity} Units • {order.product?.category}
                      </div>
                    </div>

                    <div className="lg:col-span-2 flex justify-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-xl transition-all ${cfg.color}`}>
                        {updatingStatusId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <StatusIcon className="w-3 h-3" />}
                        {cfg.label}
                      </div>
                    </div>

                    <div className="lg:col-span-2 text-center lg:text-right">
                      <div className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">{formatDate(order.createdAt)}</div>
                      <div className="text-[8px] text-muted-foreground/20 font-black uppercase tracking-widest mt-1">Order: {order.orderNumber}</div>
                    </div>

                    <div className="lg:col-span-2 flex justify-end gap-2">
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className={`px-4 py-2.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${isExpanded ? "bg-primary text-primary-foreground border-transparent" : "bg-black/5 dark:bg-white/10 border-border dark:border-white/5 text-muted-foreground hover:text-foreground dark:text-white"}`}
                      >
                        {isExpanded ? "Hide Details" : "Manage Order"}
                      </button>
                    </div>

                    {/* Expanded Fulfilment Controls */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="lg:col-span-12 overflow-hidden border-t border-border dark:border-white/5 mt-6 pt-6"
                        >
                          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Buyer Contact Card */}
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <User className="w-3 h-3" /> Procurement_Node_Profile
                              </h4>
                              <div className="p-5 rounded-lg bg-black/5 dark:bg-white/5 border border-border dark:border-white/5 space-y-4">
                                <div>
                                  <div className="text-[9px] font-black text-muted-foreground/30 uppercase mb-1">Entity</div>
                                  <div className="text-sm font-black text-foreground dark:text-white uppercase">{order.buyer?.businessName || order.buyer?.name}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex-1">
                                    <div className="text-[9px] font-black text-muted-foreground/30 uppercase mb-1">Jurisdiction</div>
                                    <div className="text-xs font-black text-foreground dark:text-white uppercase">{order.buyer?.country || "N/A"}</div>
                                  </div>
                                  <Link 
                                    href={`mailto:${order.buyer?.email}`}
                                    className="p-3 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </Link>
                                </div>
                              </div>
                            </div>

                            {/* Fulfillment Actions */}
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <Layers className="w-3 h-3" /> Fulfilment_Protocol_Control
                              </h4>
                              <div className="p-5 rounded-lg bg-black/5 dark:bg-white/5 border border-border dark:border-white/5 space-y-4">
                                <div className="text-[9px] font-black text-muted-foreground/30 uppercase mb-3">Update Order Status</div>
                                <div className="flex flex-wrap gap-2">
                                  {STATUS_ORDER.map((status) => {
                                    const isCurrent = order.orderStatus === status;
                                    const isNext = !isCurrent && (order.orderStatus === 'QUOTE_REQUESTED' && status === 'QUOTE_CONFIRMED' || order.orderStatus === 'QUOTE_CONFIRMED' && status === 'PROCESSING' || order.orderStatus === 'PROCESSING' && status === 'SHIPPED' || order.orderStatus === 'SHIPPED' && status === 'DELIVERED');
                                    
                                    return (
                                      <button
                                        key={status}
                                        disabled={isCurrent || updatingStatusId !== null}
                                        onClick={() => handleStatusUpdate(order.id, status)}
                                        className={`px-3 py-2 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all ${isCurrent 
                                          ? "bg-primary/20 text-primary border-primary/30" 
                                          : isNext 
                                            ? "bg-white/10 text-white border-white/20 hover:bg-primary hover:text-primary-foreground"
                                            : "opacity-30 cursor-not-allowed"}`}
                                      >
                                        {isCurrent && <Check className="w-2.5 h-2.5 inline-block mr-1" />}
                                        {status.replace('_', ' ')}
                                      </button>
                                    );
                                  })}
                                </div>
                                <p className="text-[8px] text-muted-foreground/40 font-black uppercase tracking-widest leading-relaxed">
                                  Status changes will automatically transmit encrypted notifications to the procurement node.
                                </p>
                              </div>
                            </div>

                            {/* Logistics & Tracking */}
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <Truck className="w-3 h-3" /> Logistics_Architecture
                              </h4>
                              <div className="p-5 rounded-lg bg-black/5 dark:bg-white/5 border border-border dark:border-white/5 space-y-4">
                                {order.shipment ? (
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <div className="text-[9px] font-black text-muted-foreground/30 uppercase">Tracking Number</div>
                                      <div className="text-xs font-black text-foreground dark:text-white uppercase">{order.shipment.trackingNumber}</div>
                                    </div>
                                    <Link 
                                      href={`/dashboard/exporter/shipments/${order.shipment.id}`}
                                      className="w-full py-2.5 bg-white/5 border border-white/10 hover:border-white/30 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-lg transition-all"
                                    >
                                      Manage Shipment <ExternalLink className="w-3 h-3" />
                                    </Link>
                                  </div>
                                ) : (
                                  <div className="text-center py-4 space-y-4">
                                    <div className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest leading-tight">No active shipment node mapped to this trade sequence.</div>
                                    <Link 
                                      href="/dashboard/exporter/shipments/new"
                                      className="w-full py-2.5 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-lg transition-all shadow-lg shadow-primary/10"
                                    >
                                      Initialize Logistics
                                    </Link>
                                  </div>
                                )}
                              </div>
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
        )}
      </div>
    </div>
  );
}
