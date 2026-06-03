"use client";

import { useEffect, useMemo, useState, useTransition, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronUp,
  ShoppingCart,
  Layers,
  Loader2,
  Check,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import BulkActionsBar from "./BulkActionsBar";

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; dotColor: string; icon: any }> = {
  QUOTE_REQUESTED: { label: "Quote Requested", color: "text-amber-700 dark:text-amber-300", bgColor: "bg-amber-50 dark:bg-amber-500/10", dotColor: "bg-amber-500", icon: Clock },
  CHECKOUT:        { label: "Checkout",         color: "text-amber-700 dark:text-amber-300", bgColor: "bg-amber-50 dark:bg-amber-500/10", dotColor: "bg-amber-500", icon: ShoppingCart },
  PENDING:         { label: "Pending",          color: "text-amber-700 dark:text-amber-300", bgColor: "bg-amber-50 dark:bg-amber-500/10", dotColor: "bg-amber-500", icon: Clock },
  QUOTE_CONFIRMED: { label: "Confirmed",        color: "text-blue-700 dark:text-blue-300",   bgColor: "bg-blue-50 dark:bg-blue-500/10",   dotColor: "bg-blue-500", icon: CheckCircle2 },
  CONFIRMED:       { label: "Confirmed",        color: "text-blue-700 dark:text-blue-300",   bgColor: "bg-blue-50 dark:bg-blue-500/10",   dotColor: "bg-blue-500", icon: CheckCircle2 },
  PROCESSING:      { label: "Processing",       color: "text-purple-700 dark:text-purple-300", bgColor: "bg-purple-50 dark:bg-purple-500/10", dotColor: "bg-purple-500", icon: Layers },
  SHIPPED:         { label: "Shipped",          color: "text-sky-700 dark:text-sky-300",     bgColor: "bg-sky-50 dark:bg-sky-500/10",     dotColor: "bg-sky-500", icon: Truck },
  DELIVERED:       { label: "Delivered",        color: "text-emerald-700 dark:text-emerald-300", bgColor: "bg-emerald-50 dark:bg-emerald-500/10", dotColor: "bg-emerald-500", icon: CheckCircle2 },
  CANCELLED:       { label: "Cancelled",        color: "text-red-700 dark:text-red-300",     bgColor: "bg-red-50 dark:bg-red-500/10",     dotColor: "bg-red-500", icon: XCircle },
};

const PAYMENT_DOT: Record<string, string> = {
  PAID:     "bg-emerald-500",
  PENDING:  "bg-amber-500",
  FAILED:   "bg-red-500",
  REFUNDED: "bg-gray-400",
};

const FULFILLMENT_DOT: Record<string, string> = {
  FULFILLED:   "bg-emerald-500",
  UNFULFILLED: "bg-amber-500",
  PARTIAL:     "bg-yellow-500",
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
  CANCELLED: "Cancelled",
};

function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

function formatTime(d: Date | string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(d));
}

// ── Sorting ────────────────────────────────────────────────────────────────
type SortField = "orderNumber" | "createdAt" | "customer" | "total" | "status";
type SortDir = "asc" | "desc";

function sortOrders(orders: any[], field: SortField, dir: SortDir) {
  return [...orders].sort((a, b) => {
    let va: any, vb: any;
    switch (field) {
      case "orderNumber": va = a.orderNumber || ""; vb = b.orderNumber || ""; break;
      case "createdAt": va = new Date(a.createdAt).getTime(); vb = new Date(b.createdAt).getTime(); break;
      case "customer": va = (a.buyer?.businessName || a.buyer?.name || "").toLowerCase(); vb = (b.buyer?.businessName || b.buyer?.name || "").toLowerCase(); break;
      case "total": va = a.totalPrice || 0; vb = b.totalPrice || 0; break;
      case "status": va = a.orderStatus || ""; vb = b.orderStatus || ""; break;
      default: return 0;
    }
    if (va < vb) return dir === "asc" ? -1 : 1;
    if (va > vb) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

// ── Props ──────────────────────────────────────────────────────────────────
interface OrdersTableProps {
  orders: any[];
  counts: {
    all: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  transportMethods?: any[];
}

export default function OrdersTable({ orders, counts, transportMethods = [] }: OrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const currentStatus = searchParams.get("status") || "ALL";
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "ALL");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [optimisticOrders, setOptimisticOrders] = useState<any[]>(orders);

  const categories = useMemo(() => {
    const cats = new Set(orders.map((o: any) => o.product?.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [orders]);

  useEffect(() => {
    setOptimisticOrders(orders);
  }, [orders]);

  // Close action menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActionMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter((order) => order.product?.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((order) => {
        const fields = [order.orderNumber, order.product?.name, order.buyer?.name, order.buyer?.businessName, order.product?.category]
          .filter(Boolean).join(" ").toLowerCase();
        return fields.includes(query);
      });
    }
    return sortOrders(filtered, sortField, sortDir);
  }, [optimisticOrders, currentStatus, searchQuery, selectedCategory, sortField, sortDir]);

  const updateFilters = (newStatus?: string) => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery) params.set("search", searchQuery);
    else params.delete("search");
    const targetStatus = newStatus !== undefined ? newStatus : currentStatus;
    if (targetStatus !== "ALL") params.set("status", targetStatus);
    else params.delete("status");
    params.delete("category");
    params.delete("page");
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const prevOrders = [...optimisticOrders];
    setOptimisticOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    setUpdatingStatusId(orderId);
    setActionMenuId(null);

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

  const handleBulkStatusUpdate = async (status: string) => {
    const ids = Array.from(selectedIds);
    const prevOrders = [...optimisticOrders];
    setOptimisticOrders(prev => prev.map(o => ids.includes(o.id) ? { ...o, orderStatus: status } : o));
    try {
      await Promise.all(ids.map(id => axios.patch(`/api/orders/${id}`, { status })));
      toast.success(`${ids.length} orders updated to ${STATUS_LABELS[status] || status}`);
      setSelectedIds(new Set());
      router.refresh();
    } catch (err: any) {
      setOptimisticOrders(prevOrders);
      toast.error("Failed to update some orders");
    }
  };

  const handleBulkExport = () => {
    toast.success(`Exporting ${selectedIds.size} orders...`);
    // Future: implement CSV export
  };

  // ── Selection helpers ──────────────────────────────────────────────────
  const allSelected = displayOrders.length > 0 && displayOrders.every(o => selectedIds.has(o.id));
  const someSelected = displayOrders.some(o => selectedIds.has(o.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayOrders.map(o => o.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Sorting handler ────────────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-muted-foreground/40" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-foreground" />
      : <ChevronDown className="w-3 h-3 text-foreground" />;
  };

  // ── Derive payment/fulfillment from order status (since schema may not have separate fields)
  const getPaymentStatus = (order: any) => {
    if (order.paymentStatus) return order.paymentStatus;
    const s = order.orderStatus || "";
    if (["DELIVERED", "SHIPPED", "PROCESSING", "QUOTE_CONFIRMED", "CONFIRMED"].includes(s)) return "PAID";
    if (["CANCELLED"].includes(s)) return "FAILED";
    return "PENDING";
  };

  const getFulfillmentStatus = (order: any) => {
    const s = order.orderStatus || "";
    if (s === "DELIVERED") return "FULFILLED";
    if (s === "SHIPPED" || s === "PROCESSING") return "PARTIAL";
    return "UNFULFILLED";
  };

  const getDeliveryStatus = (order: any) => {
    if (!order.shipment) return null;
    const s = order.orderStatus || "";
    if (s === "DELIVERED") return "Delivered";
    if (s === "SHIPPED") return "In transit";
    return "Pending";
  };

  // ── Tabs config ────────────────────────────────────────────────────────
  const statusTabs = [
    { id: "ALL", label: "All", count: counts.all },
    { id: "PENDING", label: "Pending", count: counts.pending },
    { id: "PROCESSING", label: "Processing", count: counts.processing },
    { id: "SHIPPED", label: "Shipped", count: counts.shipped },
    { id: "DELIVERED", label: "Delivered", count: counts.delivered },
  ];

  return (
    <div className="space-y-0">
      {/* ── Shopify-style tabs ──────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-t-xl">
        <div className="flex items-center border-b border-border">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => updateFilters(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                currentStatus === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  currentStatus === tab.id
                    ? "bg-muted text-foreground"
                    : "bg-muted/50 text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              )}
              {currentStatus === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Search & category filter bar ───────────────────────────────── */}
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateFilters()}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
          </div>

          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── Data table ──────────────────────────────────────────────────── */}
      <div className="bg-card border border-t-0 border-border rounded-b-xl overflow-hidden relative">
        {/* Loading overlay */}
        <AnimatePresence>
          {isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm z-40 flex items-center justify-center"
            >
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {displayOrders.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">No orders found</h3>
            <p className="text-sm text-muted-foreground mt-1">No orders match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* ── Table head ─────────────────────────────────────────── */}
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {/* Checkbox */}
                  <th className="w-11 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                    />
                  </th>
                  {/* Order # */}
                  <th className="px-3 py-3 text-left">
                    <button onClick={() => handleSort("orderNumber")} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
                      Order <SortIcon field="orderNumber" />
                    </button>
                  </th>
                  {/* Date */}
                  <th className="px-3 py-3 text-left">
                    <button onClick={() => handleSort("createdAt")} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
                      Date <SortIcon field="createdAt" />
                    </button>
                  </th>
                  {/* Customer */}
                  <th className="px-3 py-3 text-left">
                    <button onClick={() => handleSort("customer")} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
                      Customer <SortIcon field="customer" />
                    </button>
                  </th>
                  {/* Channel */}
                  <th className="px-3 py-3 text-left">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Channel</span>
                  </th>
                  {/* Total */}
                  <th className="px-3 py-3 text-right">
                    <button onClick={() => handleSort("total")} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors ml-auto">
                      Total <SortIcon field="total" />
                    </button>
                  </th>
                  {/* Payment status */}
                  <th className="px-3 py-3 text-left">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment</span>
                  </th>
                  {/* Fulfillment status */}
                  <th className="px-3 py-3 text-left">
                    <button onClick={() => handleSort("status")} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
                      Fulfillment <SortIcon field="status" />
                    </button>
                  </th>
                  {/* Items */}
                  <th className="px-3 py-3 text-center">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Items</span>
                  </th>
                  {/* Delivery */}
                  <th className="px-3 py-3 text-left">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Delivery</span>
                  </th>
                  {/* Actions */}
                  <th className="w-11 px-3 py-3" />
                </tr>
              </thead>

              {/* ── Table body ─────────────────────────────────────────── */}
              <tbody className="divide-y divide-border">
                {displayOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.PENDING;
                  const isSelected = selectedIds.has(order.id);
                  const paymentStatus = getPaymentStatus(order);
                  const fulfillmentStatus = getFulfillmentStatus(order);
                  const deliveryStatus = getDeliveryStatus(order);
                  const rawNext = STATUS_FLOW[order.orderStatus];
                  const nextStatus = (rawNext === "SHIPPED" && !order.shipment) ? null : rawNext;

                  return (
                    <tr
                      key={order.id}
                      className={`group transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-primary/5 dark:bg-primary/10"
                          : "hover:bg-muted/40"
                      }`}
                      onClick={(e) => {
                        // Don't navigate when clicking checkbox, action menu, or input
                        const target = e.target as HTMLElement;
                        if (target.closest('input[type="checkbox"]') || target.closest("[data-action-menu]") || target.closest("button")) return;
                        router.push(`/dashboard/exporter/orders/${order.id}`);
                      }}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(order.id)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                        />
                      </td>

                      {/* Order # */}
                      <td className="px-3 py-3">
                        <span className="font-semibold text-primary hover:underline">
                          {order.orderNumber || `#${order.id.slice(0, 8)}`}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-foreground">{formatDate(order.createdAt)}</div>
                        <div className="text-xs text-muted-foreground">{formatTime(order.createdAt)}</div>
                      </td>

                      {/* Customer */}
                      <td className="px-3 py-3">
                        <div className="font-medium text-foreground truncate max-w-[180px]">
                          {order.buyer?.businessName || order.buyer?.name || "—"}
                        </div>
                        {order.buyer?.country && (
                          <div className="text-xs text-muted-foreground">{order.buyer.country}</div>
                        )}
                      </td>

                      {/* Channel */}
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-muted text-muted-foreground border border-border/50">
                          {order.channel || "B2B"}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-3 py-3 text-right font-semibold text-foreground whitespace-nowrap">
                        {formatCurrency(order.totalPrice)}
                      </td>

                      {/* Payment status badge */}
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <span className={`w-2 h-2 rounded-full ${PAYMENT_DOT[paymentStatus] || "bg-gray-400"}`} />
                          {paymentStatus === "PAID" ? "Paid" : paymentStatus === "PENDING" ? "Pending" : paymentStatus === "FAILED" ? "Failed" : paymentStatus === "REFUNDED" ? "Refunded" : paymentStatus}
                        </span>
                      </td>

                      {/* Fulfillment status badge */}
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Items count */}
                      <td className="px-3 py-3 text-center text-muted-foreground">
                        {order.quantity || 1} {order.quantity === 1 ? "item" : "items"}
                      </td>

                      {/* Delivery status */}
                      <td className="px-3 py-3">
                        {deliveryStatus ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <Truck className="w-3 h-3 text-muted-foreground" />
                            {deliveryStatus}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Actions menu */}
                      <td className="px-3 py-3" data-action-menu>
                        <div className="relative" ref={actionMenuId === order.id ? actionMenuRef : undefined}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuId(actionMenuId === order.id ? null : order.id);
                            }}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            {updatingStatusId === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="w-4 h-4" />
                            )}
                          </button>

                          {/* Dropdown menu */}
                          <AnimatePresence>
                            {actionMenuId === order.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                transition={{ duration: 0.1 }}
                                className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                              >
                                <div className="px-3 py-2 border-b border-border">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Update Status</p>
                                </div>
                                <div className="py-1">
                                  {Object.entries(STATUS_LABELS).map(([status, label]) => {
                                    const isCurrent = order.orderStatus === status;
                                    const needsShipment = (status === "SHIPPED" || status === "DELIVERED") && !order.shipment;
                                    return (
                                      <button
                                        key={status}
                                        disabled={isCurrent || updatingStatusId !== null || needsShipment}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusUpdate(order.id, status);
                                        }}
                                        title={needsShipment ? "Create a shipment first" : undefined}
                                        className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                                          isCurrent
                                            ? "text-primary bg-primary/5 font-medium"
                                            : needsShipment
                                              ? "text-muted-foreground/40 cursor-not-allowed"
                                              : "text-foreground hover:bg-muted"
                                        }`}
                                      >
                                        {isCurrent && <Check className="w-3.5 h-3.5 text-primary" />}
                                        <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[status]?.dotColor || "bg-gray-400"}`} />
                                        {label}
                                        {needsShipment && <span className="text-[10px] text-muted-foreground/40 ml-auto">needs shipment</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                                <div className="border-t border-border py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActionMenuId(null);
                                      router.push(`/dashboard/exporter/orders/${order.id}`);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                  >
                                    View details
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Table footer ──────────────────────────────────────────────── */}
        {displayOrders.length > 0 && (
          <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{displayOrders.length}</span> of{" "}
              <span className="font-medium text-foreground">{counts.all}</span> orders
            </p>
            {selectedIds.size > 0 && (
              <p className="text-xs text-primary font-medium">
                {selectedIds.size} selected
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Bulk Actions Bar ────────────────────────────────────────────── */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        onDeselectAll={() => setSelectedIds(new Set())}
        onUpdateStatus={handleBulkStatusUpdate}
        onExport={handleBulkExport}
      />
    </div>
  );
}
