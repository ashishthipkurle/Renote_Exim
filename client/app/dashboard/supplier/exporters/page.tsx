"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { authFetch, formatCurrency, getInitials } from "@/lib/api-utils";
import { 
    X, 
    Package, 
    History, 
    Search, 
    Globe, 
    ShieldCheck, 
    ArrowRight, 
    UserCheck,
    MessageCircle,
    Video,
    Waves,
    CalendarClock,
    ChevronLeft,
    Send,
    Loader2,
    Mic,
    MicOff,
    VideoOff,
    Phone,
    PhoneOff,
    Handshake,
    Users2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeCall } from "@/hooks/useRealtimeCall";
import { useChat } from "@/hooks/useChat";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

// Session components for call overlay
import { VideoPlayer } from "@/components/session/VideoPlayer";
import { SessionTimer } from "@/components/session/SessionTimer";
import ScheduleCallModal from "@/components/calls/ScheduleCallModal";

interface ExporterPartner {
    id: string;
    exporterId: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    country: string | null;
    category: string | null;
    createdAt: string;
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

export default function SupplierExportersPage() {
    // 1. Data Hooks
    const callController = useRealtimeCall();
    
    // 2. Local State
    const [exporters, setExporters] = useState<ExporterPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    // Selection state
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [tradeHistory, setTradeHistory] = useState<TradeHistoryOrder[]>([]);

    // Comms state
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const { messages, sendMessage, loading: messagesLoading } = useChat(selectedId);
    const [msgInput, setMsgInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // 3. Data Fetching
    const fetchExporters = useCallback(async () => {
        setLoading(true);
        try {
            const res = await authFetch<{ partners: ExporterPartner[] }>(`/api/dashboard/directory?limit=50`);
            setExporters(res.partners || []);
        } catch {
            toast.error("Cloud_Sync_Failure: Failed to index active export nodes.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExporters();
    }, [fetchExporters]);

    // Fetch history when exporter selected
    const fetchHistory = async (exporterId: string) => {
        setHistoryLoading(true);
        try {
            const res = await authFetch<{ orders: TradeHistoryOrder[] }>(
                `/api/dashboard/directory/${exporterId}`
            );
            setTradeHistory(res.orders);
        } catch (e) {
            setTradeHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (selectedId) {
            const exp = exporters.find(e => e.exporterId === selectedId || e.id === selectedId);
            if (exp) {
                setSelectedUser({
                    id: exp.exporterId,
                    name: exp.name || "Unknown Exporter",
                    avatar: null,
                    role: "Export Node",
                    address: exp.country || "Global"
                });
                void fetchHistory(exp.exporterId);
            }
        } else {
            setSelectedUser(null);
            setTradeHistory([]);
        }
    }, [selectedId, exporters]);

    // Auto-scroll chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // 4. Handlers
    const handleSendMsg = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!msgInput.trim()) return;
        try {
            await sendMessage(msgInput);
            setMsgInput("");
        } catch (err) {
            toast.error("Comms_Failure: Signal not transmitted.");
        }
    };

    const initiateCall = (type: "AUDIO" | "VIDEO") => {
        if (!selectedId || !selectedUser) return;
        void callController.startCall({
            target: { id: selectedUser.id, name: selectedUser.name },
            callType: type
        });
    };

    const filteredExporters = exporters.filter(e => 
        (e.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.country || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="h-full flex overflow-hidden bg-background">
            {/* LEFT PANEL: Exporters Hub */}
            <div className={`flex flex-col border-r border-border shrink-0 transition-all duration-500 ${selectedId ? "w-0 md:w-80 lg:w-[400px]" : "w-full md:w-80 lg:w-[400px]"}`}>
                <div className="p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                <Handshake className="w-8 h-8 text-[#D4AF37]" />
                                Export Hub
                            </h1>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-50">Active Distribution Nodes</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative group/search">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/search:text-[#D4AF37] transition-colors" />
                        <input
                            type="text"
                            placeholder="Locate Exporter node..."
                            className="w-full bg-muted/20 border border-border rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-bold shadow-inner uppercase tracking-wider"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pt-2">
                    {loading ? (
                        <div className="p-20 text-center flex flex-col items-center gap-6 opacity-30">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Syncing Distribution Registry...</span>
                        </div>
                    ) : filteredExporters.length === 0 ? (
                        <div className="p-20 text-center opacity-30 flex flex-col items-center gap-5">
                            <Users2 className="w-12 h-12 grayscale" />
                            <span className="text-xs font-black uppercase tracking-widest text-center">No exporters found</span>
                        </div>
                    ) : (
                        <div className="space-y-3 pb-20">
                            {filteredExporters.map((exp) => {
                                const isSelected = selectedId === exp.exporterId || selectedId === exp.id;
                                return (
                                    <button
                                        key={exp.id}
                                        onClick={() => setSelectedId(exp.exporterId)}
                                        className={`w-full group relative bg-card/30 border transition-all duration-500 rounded-[2.5rem] p-6 text-left ${isSelected ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/20 shadow-2xl shadow-[#D4AF37]/10" : "border-border hover:border-[#D4AF37]/40 hover:bg-muted/30"}`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="size-16 rounded-[1.8rem] bg-gradient-to-br from-[#D4AF37] to-yellow-600/10 flex shrink-0 items-center justify-center text-black font-black text-2xl shadow-lg shadow-[#D4AF37]/10 group-hover:scale-105 transition-transform">
                                                {getInitials(exp.name || "U")}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-black text-sm uppercase tracking-tight truncate group-hover:text-[#D4AF37] transition-colors">{exp.name || "Unknown Exporter"}</h3>
                                                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40 shrink-0 ml-2 italic">{exp.country || "Global"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="px-2 py-0.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] text-[8px] font-black uppercase tracking-widest border border-[#D4AF37]/10 italic">
                                                        Distribution Node
                                                    </div>
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">{exp.category || "General"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Messaging & Call Hub */}
            <div className="flex-1 flex flex-col relative bg-muted/5">
                {selectedUser ? (
                    <>
                        {/* Hub Header */}
                        <div className="h-28 border-b border-border bg-background/50 backdrop-blur-xl flex items-center justify-between px-10 shrink-0">
                            <div className="flex items-center gap-6">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="md:hidden rounded-full"
                                    onClick={() => setSelectedId(null)}
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </Button>
                                <div className="size-16 rounded-[1.5rem] bg-gradient-to-br from-[#D4AF37] to-yellow-500/20 flex items-center justify-center text-black font-black text-xl shadow-inner">
                                    {getInitials(selectedUser.name)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter">{selectedUser.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500">Signal established</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => initiateCall("AUDIO")}
                                    className="rounded-2xl size-14 border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all shadow-xl hover:shadow-[#D4AF37]/10"
                                >
                                    <Phone className="w-5 h-5" />
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => initiateCall("VIDEO")}
                                    className="rounded-2xl size-14 border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all shadow-xl hover:shadow-[#D4AF37]/10"
                                >
                                    <Video className="w-5 h-5" />
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => setIsScheduleModalOpen(true)}
                                    className="rounded-2xl size-14 border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all shadow-xl hover:shadow-[#D4AF37]/10"
                                >
                                    <CalendarClock className="w-5 h-5" />
                                </Button>
                                <div className="w-px h-10 bg-border mx-2" />
                                <Button 
                                    variant={isHistoryOpen ? "default" : "outline"}
                                    size="icon" 
                                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                                    className={`rounded-2xl size-14 transition-all shadow-xl ${isHistoryOpen ? "bg-[#D4AF37] text-black hover:bg-[#B8962E]" : "border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"}`}
                                >
                                    <History className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 relative overflow-hidden flex flex-col">
                            <div 
                                className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar scroll-smooth"
                                ref={scrollRef}
                            >
                                {messagesLoading ? (
                                    <div className="flex justify-center items-center h-full opacity-30">
                                        <Loader2 className="w-6 h-6 animate-spin mr-3" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Decrypting signals...</span>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full opacity-20 space-y-6">
                                        <div className="size-24 rounded-full border-2 border-dashed border-[#D4AF37] flex items-center justify-center">
                                            <MessageCircle className="w-10 h-10 text-[#D4AF37]" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-center max-w-[200px]">Initial handshakes pending for this node</p>
                                    </div>
                                ) : (
                                    messages.map((m) => {
                                        const isMe = m.senderId !== selectedId;
                                        return (
                                            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
                                                <div className={`max-w-[70%] space-y-2`}>
                                                    <div className={`p-6 rounded-[2rem] text-sm font-medium shadow-2xl relative transition-all duration-300 ${isMe ? "bg-[#D4AF37] text-black rounded-tr-none hover:shadow-[#D4AF37]/20" : "bg-card border border-border rounded-tl-none hover:border-[#D4AF37]/40"}`}>
                                                        {m.body}
                                                        <div className={`absolute top-0 ${isMe ? "-right-1 border-l-[#D4AF37] border-l-[10px]" : "-left-1 border-r-card border-r-[10px]"} border-b-[10px] border-b-transparent`} />
                                                    </div>
                                                    <div className={`flex items-center gap-3 px-2 ${isMe ? "justify-end" : "justify-start opacity-0 group-hover:opacity-100 transition-opacity"}`}>
                                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-30">
                                                            {m.createdAt ? format(new Date(m.createdAt), "HH:mm") : "..."}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-10 shrink-0 bg-background/50 backdrop-blur-md border-t border-border">
                                <form 
                                    className="flex items-center gap-5 bg-muted/30 border border-border rounded-[2.5rem] p-3 pl-8 shadow-inner focus-within:ring-2 focus-within:ring-[#D4AF37]/20 transition-all"
                                    onSubmit={(e) => void handleSendMsg(e)}
                                >
                                    <input 
                                        type="text" 
                                        placeholder="Transmit encrypted signal..."
                                        className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:text-muted-foreground/30 placeholder:uppercase placeholder:italic tracking-wide"
                                        value={msgInput}
                                        onChange={(e) => setMsgInput(e.target.value)}
                                    />
                                    <div className="flex items-center gap-2 pr-2">
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="rounded-full text-muted-foreground hover:text-primary"
                                        >
                                            <Waves className="w-5 h-5" />
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            className="rounded-[1.5rem] size-14 bg-[#D4AF37] hover:bg-[#B8962E] text-black shadow-lg shadow-[#D4AF37]/20"
                                            disabled={!msgInput.trim()}
                                        >
                                            <Send className="w-5 h-5 -rotate-12" />
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Trade History Sidebar panel */}
                        <AnimatePresence>
                            {isHistoryOpen && (
                                <motion.div 
                                    initial={{ x: 400 }}
                                    animate={{ x: 0 }}
                                    exit={{ x: 400 }}
                                    className="absolute right-0 top-0 bottom-0 w-[400px] bg-background/95 backdrop-blur-2xl border-l border-border z-40 shadow-[-20px_0_40px_rgba(0,0,0,0.2)] flex flex-col"
                                >
                                    <div className="p-10 flex items-center justify-between border-b border-border">
                                        <div>
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Intelligence Manifest</h3>
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-50">Supply node historical data</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setIsHistoryOpen(false)} className="rounded-full">
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                                        {historyLoading ? (
                                            <div className="flex flex-col items-center gap-6 opacity-30 mt-20">
                                                <Loader2 className="w-8 h-8 animate-spin" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Querying Trade Ledger...</span>
                                            </div>
                                        ) : tradeHistory.length === 0 ? (
                                            <div className="p-10 text-center opacity-30 flex flex-col items-center gap-6 mt-20">
                                                <Globe className="w-12 h-12 grayscale" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">No historical transactions detected for this node</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {tradeHistory.map((order) => (
                                                    <div key={order.id} className="group relative bg-card/30 border border-border p-6 rounded-[2rem] hover:border-primary/40 transition-all">
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="size-16 rounded-2xl bg-muted overflow-hidden flex shrink-0 items-center justify-center">
                                                                {order.product.images?.[0] ? (
                                                                    <img src={order.product.images[0]} alt="" className="size-full object-cover" />
                                                                ) : (
                                                                    <Package className="w-6 h-6 text-muted-foreground/30" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-black text-xs uppercase truncate group-hover:text-primary transition-colors">{order.product.name}</h4>
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mt-1">{order.orderNumber}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between border-t border-border mt-4 pt-4">
                                                            <div className="text-[10px] font-black tracking-tight">{formatCurrency(Number(order.totalPrice), order.currency)}</div>
                                                            <div className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border border-current`}>
                                                                {order.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-10 opacity-20">
                        <div className="relative">
                            <motion.div 
                                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -inset-20 rounded-full border border-[#D4AF37] opacity-20"
                            />
                            <Handshake className="w-32 h-32 text-muted-foreground grayscale" />
                        </div>
                        <div className="text-center space-y-4">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Secure Comms Standby</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] max-w-xs leading-relaxed mx-auto">Select a distribution node from the sidebar to establish a high-fidelity intelligence link.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* CALL OVERLAY */}
            <AnimatePresence>
                {callController.phase !== "idle" && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black backdrop-blur-2xl flex flex-col items-center justify-center p-10"
                    >
                        {/* Status Label */}
                        <div className="absolute top-20 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 px-6 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                                <Waves className="w-3 h-3" />
                                {callController.phase === "calling" ? "Initiating Uplink..." : "Secure Transmission Active"}
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">{callController.activeCall?.peerName}</h2>
                            {callController.phase === "in-call" && <SessionTimer endTime={new Date(Date.now() + 3600000).toISOString()} onTimeExpired={() => {}} />}
                        </div>

                        {/* Video Grid */}
                        <div className="w-full max-w-6xl aspect-video grid grid-cols-1 md:grid-cols-2 gap-10 mt-20 relative">
                            <div className="relative group rounded-[3rem] overflow-hidden border border-white/5 bg-white/5 shadow-2xl">
                                <VideoPlayer stream={callController.remoteStream} name={callController.activeCall?.peerName || "Remote Node"} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-10 flex items-end">
                                    <div className="flex items-center gap-4">
                                        <div className="size-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Live Intelligence Feed</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative group rounded-[3rem] overflow-hidden border border-white/5 bg-white/5 shadow-2xl">
                                <VideoPlayer stream={callController.localStream} name="Self Node (Supplier)" isLocal />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-10 flex items-end">
                                    <div className="flex items-center gap-4">
                                        <div className="size-3 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Local Feed</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="absolute bottom-20 flex items-center gap-10">
                            <button 
                                onClick={callController.toggleMute}
                                className={`rounded-full size-20 flex items-center justify-center border-white/10 ${callController.isMuted ? "bg-red-500/20 text-red-500 border-red-500/20 hover:bg-red-500/30" : "bg-white/5 text-white hover:bg-white/10"}`}
                            >
                                {callController.isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                            </button>
                            <Button 
                                variant="destructive" 
                                onClick={callController.endCall}
                                className="rounded-full size-24 bg-red-600 hover:bg-red-700 shadow-2xl shadow-red-600/40"
                            >
                                <PhoneOff className="w-10 h-10" />
                            </Button>
                            <button 
                                onClick={callController.toggleCamera}
                                className={`rounded-full size-20 flex items-center justify-center border-white/10 ${!callController.isCameraEnabled ? "bg-red-500/20 text-red-500 border-red-500/20 hover:bg-red-500/30" : "bg-white/5 text-white hover:bg-white/10"}`}
                            >
                                {callController.isCameraEnabled ? <Video className="w-8 h-8" /> : <VideoOff className="w-8 h-8" />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ScheduleCallModal 
                open={isScheduleModalOpen}
                onOpenChange={setIsScheduleModalOpen}
                receiver={selectedUser ? { id: selectedUser.id, name: selectedUser.name } : null}
                onScheduled={() => toast.success("Negotiation session requested.")}
            />
        </div>
    );
}
