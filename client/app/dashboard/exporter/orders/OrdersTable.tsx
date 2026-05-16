"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Search,
  ChevronDown,
  ShoppingCart,
  Layers,
  User,
  Mail,
  ExternalLink,
  Loader2,
  Check
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import ShipmentTrackingPanel from "@/components/dashboard/ShipmentTrackingPanel";

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  QUOTE_REQUESTED: { label: "Quote Requested", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", icon: Clock },
  CHECKOUT: { label: "Checkout", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", icon: ShoppingCart },
  PENDING: { label: "Pending", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", icon: Clock },
  QUOTE_CONFIRMED: { label: "Confirmed", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20", icon: CheckCircle2 },
  CONFIRMED: { label: "Confirmed", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20", icon: CheckCircle2 },
  PROCESSING: { label: "Processing", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20", icon: Layers },
  SHIPPED: { label: "Shipped", color: "text-sky-600 dark:text-sky-400", bgColor: "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20", icon: Truck },
  DELIVERED: { label: "Delivered", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20", icon: XCircle },
};

const STATUS_FLOW: Record<string, string> = {
  QUOTE_REQUESTED: "QUOTE_CONFIRMED",
  QUOTE_CONFIRMED: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

const STATUS_LABELS: Record<string, string> = {
  QUOTE_REQUESTED: "Quote Requested",
  QUOTE_CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
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

export default function OrdersTable({ orders, counts }: OrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const currentStatus = searchParams.get("status") || "ALL";

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
        const fields = [order.orderNumber, order.product?.name, order.buyer?.name, order.buyer?.businessName]
          .filter(Boolean).join(" ").toLowerCase();
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
    const prevOrders = [...optimisticOrders];
    setOptimisticOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    setUpdatingStatusId(orderId);
    
    try {
      await axios.patch(`/api/orders/${orderId}`, { status: newStatus });
      toast.success(`Order updated to ${STATUS_LABELS[newStatus] || newStatus}`);
      router.refresh();
    } catch (err: any) {
      setOptimisticOrders(prevOrders);
      toast.error(err.response?.data?.error || "Failed to update status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const statusPills = [
    { id: "ALL", label: "All Orders", count: counts.all },
    { id: "PENDING", label: "Pending", count: counts.pending },
    { id: "PROCESSING", label: "Processing", count: counts.processing },
    { id: "SHIPPED", label: "Shipped", count: counts.shipped },
    { id: "DELIVERED", label: "Delivered", count: counts.delivered },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {statusPills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => updateFilters(pill.id)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                currentStatus === pill.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {pill.label} <span className="opacity-50 ml-1">{pill.count}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full xl:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && updateFilters()}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Order Cards */}
      <div className="space-y-3 relative">
        <AnimatePresence>
          {isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {displayOrders.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-16 text-center">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground">No Orders Found</h2>
            <p className="text-sm text-muted-foreground mt-1">No orders match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayOrders.map((order) => {
              const cfg = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.PENDING;
              const isExpanded = expandedOrderId === order.id;
              const StatusIcon = cfg.icon;
              const rawNext = STATUS_FLOW[order.orderStatus];
              // Block "Mark Shipped" if no shipment has been created yet
              const nextStatus = (rawNext === 'SHIPPED' && !order.shipment) ? null : rawNext;

              return (
                <div
                  key={order.id}
                  className={`bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? "ring-2 ring-primary/20" : "hover:shadow-md"}`}
                >
                  {/* Order Row */}
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Product Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-lg bg-muted border border-border flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {order.product?.images?.[0] ? (
                            <img src={order.product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate">{order.product?.name ?? "Unknown Product"}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {order.buyer?.businessName || order.buyer?.name || "Customer"}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="sm:w-28 text-right sm:text-center">
                        <div className="text-base font-bold text-foreground">{formatCurrency(order.totalPrice)}</div>
                        <div className="text-xs text-muted-foreground">Qty: {order.quantity}</div>
                      </div>

                      {/* Status */}
                      <div className="sm:w-36 flex sm:justify-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${cfg.bgColor} ${cfg.color}`}>
                          {updatingStatusId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <StatusIcon className="w-3 h-3" />}
                          {cfg.label}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="sm:w-32 text-right">
                        <div className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</div>
                        <div className="text-xs text-muted-foreground/60">{order.orderNumber}</div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* Quick action: advance to next status */}
                        {nextStatus && (
                          <button
                            disabled={updatingStatusId !== null}
                            onClick={() => handleStatusUpdate(order.id, nextStatus)}
                            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-50 whitespace-nowrap"
                          >
                            {updatingStatusId === order.id ? (
                              <Loader2 className="w-3 h-3 animate-spin inline-block" />
                            ) : (
                              `Mark ${STATUS_LABELS[nextStatus]}`
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className={`p-2 rounded-lg border transition-all ${
                            isExpanded ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
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
                        <div className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Buyer Info */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <User className="w-4 h-4" /> Buyer Details
                              </h4>
                              <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                                <div>
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Name</p>
                                  <p className="text-sm font-semibold text-foreground">{order.buyer?.businessName || order.buyer?.name}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Country</p>
                                    <p className="text-sm font-semibold text-foreground">{order.buyer?.country || "N/A"}</p>
                                  </div>
                                  <Link
                                    href={`mailto:${order.buyer?.email}`}
                                    className="p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </Link>
                                </div>
                              </div>
                            </div>

                            {/* Status Controls */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Layers className="w-4 h-4" /> Update Status
                              </h4>
                              <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(STATUS_LABELS).map(([status, label]) => {
                                    const isCurrent = order.orderStatus === status;
                                    const isNext = nextStatus === status;
                                    // Block SHIPPED/DELIVERED if no shipment created
                                    const needsShipment = (status === 'SHIPPED' || status === 'DELIVERED') && !order.shipment;
                                    return (
                                      <button
                                        key={status}
                                        disabled={isCurrent || updatingStatusId !== null || needsShipment}
                                        onClick={() => handleStatusUpdate(order.id, status)}
                                        title={needsShipment ? "Create a shipment first" : undefined}
                                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                          isCurrent
                                            ? "bg-primary/15 text-primary border-primary/30 cursor-default"
                                            : needsShipment
                                              ? "bg-card border-border text-muted-foreground/30 cursor-not-allowed opacity-50"
                                              : isNext
                                                ? "bg-card border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                                                : "bg-card border-border text-muted-foreground/50 hover:text-muted-foreground"
                                        }`}
                                      >
                                        {isCurrent && <Check className="w-3 h-3 inline-block mr-1" />}
                                        {label}
                                      </button>
                                    );
                                  })}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Status changes will automatically notify the buyer.
                                </p>
                              </div>
                            </div>

                            {/* Shipping */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Truck className="w-4 h-4" /> Shipping
                              </h4>
                              <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                                {order.shipment ? (
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Tracking</p>
                                      <p className="text-sm font-semibold text-foreground">{order.shipment.trackingNumber}</p>
                                    </div>
                                    <Link
                                      href={`/dashboard/exporter/shipments/${order.shipment.id}`}
                                      className="w-full py-2 bg-card border border-border hover:bg-muted text-sm font-medium flex items-center justify-center gap-2 rounded-lg transition-all"
                                    >
                                      Manage Shipment <ExternalLink className="w-3 h-3" />
                                    </Link>
                                  </div>
                                ) : (
                                  <div className="text-center py-3 space-y-3">
                                    <p className="text-sm text-muted-foreground">No shipment created yet.</p>
                                    <Link
                                      href={`/dashboard/exporter/shipments/new?orderId=${order.id}`}
                                      className="w-full py-2 bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 rounded-lg transition-all hover:opacity-90"
                                    >
                                      Create Shipment
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
