"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch, formatCurrency, formatNumber, getInitials, timeAgo } from "@/lib/api-utils";
import { X, ExternalLink, Package, History } from "lucide-react";
import Link from "next/link";

interface Partner {
  id: string;
  name: string;
  companyName: string | null;
  country: string | null;
  orderCount: number;
  totalValue: number;
}

interface DirectoryResponse {
  role: string;
  partners: Partner[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface TradeHistoryOrder {
  id: string;
  orderNumber: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  product: {
    name: string;
    category: string;
    unit: string;
    images: string[];
  };
}

export default function ExporterDirectoryPage() {
  const [data, setData] = useState<DirectoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal State
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryOrder[]>([]);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    authFetch<DirectoryResponse>(`/api/dashboard/directory?${params}`)
      .then(setData)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  const openHistory = async (partner: Partner) => {
    setSelectedPartner(partner);
    setHistoryLoading(true);
    try {
      const res = await authFetch<{ orders: TradeHistoryOrder[] }>(
        `/api/dashboard/directory/${partner.id}`
      );
      setTradeHistory(res.orders);
    } catch (e) {
      console.error(e);
      setTradeHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "DELIVERED": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "CONFIRMED":
      case "PROCESSING":
      case "SHIPPED": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "CANCELLED": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    }
  };

  return (
    <div className="h-full overflow-hidden flex flex-col bg-background">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-border bg-header/80 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Trade Directory</h1>
            <p className="text-muted-foreground mt-1">Your buying partners and importers.</p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search partners..."
            className="w-full md:w-72 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
        <div className="max-w-[1200px] mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-card rounded-2xl animate-pulse border border-border" />
              ))}
            </div>
          ) : !data?.partners?.length ? (
            <div className="bg-card border border-border shadow-xl rounded-2xl p-12 text-center text-muted-foreground max-w-xl mx-auto mt-10">
              <div className="text-5xl mb-4">🤝</div>
              <h2 className="text-xl font-bold text-foreground mb-2">No trading partners yet</h2>
              <p className="text-sm">
                {search
                  ? "Try adjusting your search terms."
                  : "When someone places an order for your products, they will appear in this directory automatically."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.partners.map((p) => (
                  <div key={p.id} className="bg-card border border-border shadow-xl rounded-2xl p-6 hover:border-primary/30 transition-colors flex flex-col">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-black text-lg flex-shrink-0">
                        {getInitials(p.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-bold text-lg truncate">{p.name}</div>
                        {p.companyName && <div className="text-slate-400 text-sm truncate">{p.companyName}</div>}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-6 flex-1">
                      <div>
                        <div className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-bold">Country</div>
                        <div className="text-foreground/90 font-semibold truncate">{p.country || "—"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-bold">Orders</div>
                        <div className="text-foreground font-bold">{formatNumber(p.orderCount)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-bold">Lifetime Val</div>
                        <div className="text-emerald-500 font-bold">{formatCurrency(p.totalValue)}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => openHistory(p)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl border border-border transition-all font-semibold text-sm"
                    >
                      <History className="w-4 h-4" />
                      View Trade History
                    </button>
                  </div>
                ))}
              </div>

              {data.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-sm font-bold transition-all border ${p === page ? "bg-primary text-white border-primary" : "bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Trade History Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPartner(null)} />

          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-background border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-border bg-muted/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg">
                  {getInitials(selectedPartner.name)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedPartner.name}</h2>
                  <p className="text-muted-foreground text-sm">
                    Trade History • {formatNumber(selectedPartner.orderCount)} orders • {formatCurrency(selectedPartner.totalValue)} total
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-muted-foreground mt-4 text-sm">Loading order history...</p>
                </div>
              ) : tradeHistory.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No completed orders found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tradeHistory.map((order) => (
                    <div key={order.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border">
                          {order.product?.images?.[0] ? (
                            <img src={order.product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-muted-foreground" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/dashboard/exporter/orders/${order.id}`} className="text-foreground font-bold hover:text-primary transition-colors flex items-center gap-1.5 truncate">
                            {order.product?.name || "Unknown Product"}
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                          </Link>
                          <div className="text-muted-foreground text-xs mt-1 flex items-center gap-2">
                            <span>#{order.orderNumber}</span>
                            <span>•</span>
                            <span>{timeAgo(order.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 w-full sm:w-auto">
                        <div className="text-left sm:text-right">
                          <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">Quantity</div>
                          <div className="text-foreground/90 font-medium text-sm">
                            {order.quantity.toLocaleString()} {order.product?.unit || 'units'}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">Total</div>
                          <div className="text-emerald-500 font-bold text-sm">
                            {formatCurrency(order.totalPrice)} {order.currency}
                          </div>
                        </div>
                        <div className="col-span-2 sm:col-span-1 flex justify-end">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${statusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
