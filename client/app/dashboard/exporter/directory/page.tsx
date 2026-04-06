"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch, formatCurrency, formatNumber, getInitials, timeAgo } from "@/lib/api-utils";
import { X, ExternalLink, Package, History, Search, Globe, ShieldCheck, TrendingUp, ArrowRight, ArrowLeft, Layers, ShoppingCart, UserCheck } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
      case "DELIVERED": return "text-primary-foreground bg-primary border-transparent";
      case "CONFIRMED":
      case "PROCESSING":
      case "SHIPPED": return "text-foreground dark:text-white bg-black/10 dark:bg-white/15 border-border dark:border-white/20";
      case "CANCELLED": return "text-muted-foreground/20 bg-black/5 dark:bg-white/10 border-border dark:border-white/5";
      default: return "text-muted-foreground/40 bg-black/5 dark:bg-white/10 border-border dark:border-white/5";
    }
  };

  return (
    <div className="h-full overflow-hidden flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* ── Header ── */}
      <header className="flex-shrink-0 px-10 py-10 border-b border-border dark:border-white/5 bg-background/40 backdrop-blur-3xl z-40">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground dark:text-white uppercase italic">Partner Directory</h1>
            <p className="text-muted-foreground/40 mt-3 text-[10px] font-black uppercase tracking-[0.3em] italic">
              Registry Node Index: {data?.pagination.total || 0} Unified Trade Partners Identified
            </p>
          </div>
          <div className="relative group w-full xl:w-[400px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-foreground dark:text-white transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search partner node identity..."
              className="w-full pl-14 pr-6 py-4 bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 rounded-2xl text-[10px] text-foreground dark:text-white font-black uppercase tracking-widest placeholder:text-muted-foreground/20 focus:outline-none focus:border-border dark:border-white/20 transition-all shadow-inner italic backdrop-blur-xl"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-16 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="max-w-[1700px] mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-black/5 dark:bg-white/10 rounded-[2.5rem] animate-pulse border border-border dark:border-white/5" />
              ))}
            </div>
          ) : !data?.partners?.length ? (
            <div className="bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 shadow-xl dark:shadow-2xl rounded-[3rem] p-24 text-center max-w-2xl mx-auto mt-20 backdrop-blur-3xl">
              <div className="flex flex-col items-center gap-8 opacity-40">
                <div className="p-10 rounded-[2.5rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10">
                  <UserCheck className="w-16 h-16 text-foreground dark:text-white" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">Identity Registry Dormant</h2>
                  <p className="text-[10px] text-foreground dark:text-white font-black uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed italic">
                    {search
                      ? "Search parameters yielded null results. Adjust registry query."
                      : "Partner nodes will auto-initialize upon primary trade execution."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {data.partners.map((p) => (
                  <div key={p.id} className="bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 shadow-xl dark:shadow-2xl rounded-[2.5rem] p-10 hover:border-border dark:border-white/20 transition-all duration-700 flex flex-col group backdrop-blur-3xl hover:-translate-y-2">
                    <div className="flex items-start justify-between mb-10">
                      <div className="flex items-center gap-6">
                        <div className="size-16 rounded-[1.5rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center text-foreground dark:text-white font-black text-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-700 shadow-inner">
                          {getInitials(p.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xl font-black text-foreground dark:text-white truncate italic tracking-tighter uppercase group-hover:translate-x-1 transition-transform">{p.name}</div>
                          {p.companyName && <div className="text-muted-foreground/30 text-[9px] font-black uppercase tracking-[0.2em] mt-2 italic group-hover:text-muted-foreground transition-colors">{p.companyName}</div>}
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 text-muted-foreground/20 group-hover:text-foreground dark:text-white transition-colors">
                        <Globe className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8 mb-10 flex-1">
                      <div>
                        <div className="text-muted-foreground/20 mb-2 text-[8px] uppercase tracking-[0.3em] font-black italic">Origin</div>
                        <div className="text-foreground dark:text-white font-black uppercase italic tracking-widest text-[10px] truncate">{p.country || "GLOBAL_NODE"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground/20 mb-2 text-[8px] uppercase tracking-[0.3em] font-black italic">Sigs</div>
                        <div className="text-foreground dark:text-white font-black text-lg italic tracking-tighter">{formatNumber(p.orderCount)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground/20 mb-2 text-[8px] uppercase tracking-[0.3em] font-black italic">Net_Yield</div>
                        <div className="text-foreground dark:text-white font-black text-lg italic tracking-tighter">{formatCurrency(p.totalValue)}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => openHistory(p)}
                      className="w-full h-14 flex items-center justify-center gap-3 bg-black/5 dark:bg-white/10 hover:bg-primary text-muted-foreground group-hover:text-foreground dark:text-white hover:text-primary-foreground rounded-2xl border border-border dark:border-white/5 hover:border-transparent transition-all duration-700 font-black text-[9px] uppercase tracking-[0.3em] italic shadow-xl dark:shadow-2xl active:scale-95"
                    >
                      <History className="w-5 h-5" />
                      Neural Trade Feed
                    </button>
                  </div>
                ))}
              </div>

              {data.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-20 pb-20">
                  {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-14 h-14 rounded-2xl text-[10px] font-black transition-all backdrop-blur-3xl italic ${p === page
                        ? "bg-primary text-primary-foreground border-transparent shadow-2xl shadow-white/10 scale-110"
                        : "bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 text-muted-foreground/40 hover:bg-black/10 dark:bg-white/15 hover:border-border dark:border-white/20 hover:text-foreground dark:text-white"
                        }`}
                    >
                      {p < 10 ? `0${p}` : p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Trade History Modal ── */}
      <AnimatePresence>
        {selectedPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
              onClick={() => setSelectedPartner(null)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-card dark:bg-[#0a0a0a] border border-border dark:border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-[3rem] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex-shrink-0 flex items-center justify-between p-12 border-b border-border dark:border-white/5 bg-white/[0.02] backdrop-blur-3xl">
                <div className="flex items-center gap-8">
                  <div className="size-20 rounded-[2rem] bg-primary border border-transparent flex items-center justify-center text-primary-foreground font-black text-2xl shadow-xl dark:shadow-2xl">
                    {getInitials(selectedPartner.name)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-foreground dark:text-white italic uppercase tracking-tighter">{selectedPartner.name}</h2>
                    <p className="text-muted-foreground/40 mt-3 text-[9px] font-black uppercase tracking-[0.3em] italic flex items-center gap-3">
                      <History className="w-3.5 h-3.5" />
                      Sequence Feed • {formatNumber(selectedPartner.orderCount)} Nodes • {formatCurrency(selectedPartner.totalValue)} Net_Yield
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="size-14 bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 text-muted-foreground/40 hover:text-foreground dark:text-white hover:bg-neutral-800 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl dark:shadow-2xl hover:rotate-90"
                  title="Close Registry"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center py-32">
                    <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 animate-pulse">
                      <Globe className="w-10 h-10 text-foreground dark:text-white animate-spin-slow" />
                    </div>
                    <p className="text-[10px] font-black text-white/40 mt-8 uppercase tracking-[0.3em] italic">Streaming Trade Telemetry...</p>
                  </div>
                ) : tradeHistory.length === 0 ? (
                  <div className="text-center py-32 opacity-20">
                    <Package className="w-16 h-16 mx-auto mb-8" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Null_Trade_History_Record</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {tradeHistory.map((order) => (
                      <div key={order.id} className="bg-white/[0.02] border border-border dark:border-white/5 rounded-[2.5rem] p-8 flex flex-col lg:flex-row gap-10 items-start lg:items-center group hover:bg-white/[0.05] hover:border-border dark:border-white/10 transition-all duration-700">
                        <div className="flex items-center gap-8 flex-1 min-w-0">
                          <div className="size-20 bg-black/5 dark:bg-white/10 rounded-[1.5rem] overflow-hidden flex-shrink-0 border border-border dark:border-white/5 p-2 shadow-inner group-hover:border-border dark:border-white/20 transition-all">
                            {order.product?.images?.[0] ? (
                              <img src={order.product.images[0]} alt="" className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Package className="w-7 h-7 text-muted-foreground/20" /></div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/dashboard/exporter/orders/${order.id}`} className="text-foreground dark:text-white font-black text-xl italic uppercase tracking-tighter hover:translate-x-1 transition-transform flex items-center gap-3">
                              {order.product?.name || "Null_Asset"}
                              <ExternalLink className="w-4 h-4 text-muted-foreground/20 group-hover:text-foreground dark:text-white transition-colors" />
                            </Link>
                            <div className="text-muted-foreground/20 text-[9px] font-black uppercase tracking-[0.2em] mt-3 flex items-center gap-4 italic">
                              <span className="text-muted-foreground/40">#{order.orderNumber}</span>
                              <span className="w-1 h-1 rounded-full bg-black/10 dark:bg-white/15" />
                              <span>{timeAgo(order.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 lg:flex lg:items-center gap-10 w-full lg:w-auto">
                          <div className="text-left lg:text-right">
                            <div className="text-muted-foreground/20 text-[8px] uppercase font-black tracking-[0.3em] mb-3 italic">Volume</div>
                            <div className="text-foreground dark:text-white font-black text-sm italic tracking-widest uppercase">
                              {order.quantity.toLocaleString()} {order.product?.unit || 'Units'}
                            </div>
                          </div>
                          <div className="text-left lg:text-right">
                            <div className="text-muted-foreground/20 text-[8px] uppercase font-black tracking-[0.3em] mb-3 italic">Total_Yield</div>
                            <div className="text-foreground dark:text-white font-black text-lg italic tracking-tighter">
                              {formatCurrency(order.totalPrice)} <span className="text-[10px] opacity-40 ml-1">{order.currency}</span>
                            </div>
                          </div>
                          <div className="col-span-2 lg:col-span-1 flex justify-end">
                            <span className={`inline-flex items-center px-6 py-2.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] italic shadow-xl dark:shadow-2xl transition-all ${statusColor(order.status)}`}>
                              <span className={`size-1.5 rounded-full mr-3 ${order.status === 'DELIVERED' ? 'bg-card dark:bg-[#0a0a0a]' : 'bg-current animate-pulse'}`} />
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex-shrink-0 p-10 border-t border-border dark:border-white/5 bg-white/[0.01] text-center">
                <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.5em] italic">
                  End of neural trade feed protocol // Registry node secured
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
