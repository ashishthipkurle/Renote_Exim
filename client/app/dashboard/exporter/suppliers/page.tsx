"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

import {
 Search,
 Handshake,
 Plus,

 ChevronLeft,
 Waves,
 Video,
 CalendarClock,
 MoreVertical,
 ShieldCheck,
 Send,
 Mic,
 MicOff,
 VideoOff,
 Phone,
 PhoneOff,
 History,
 X,
 Package,
 ArrowRight,
 Building2,
 User,
 Mail,
 MapPin,
 Tag,
 FileText,
 MessageCircle,
 Globe
} from "lucide-react";
import GifLoader from "@/components/ui/GifLoader";

import { authFetch, formatCurrency, getInitials } from "@/lib/api-utils";
import { useRealtimeCall } from "@/hooks/useRealtimeCall";
import { useChat } from "@/hooks/useChat";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Session components for call overlay
import { VideoPlayer } from "@/components/session/VideoPlayer";
import { SessionTimer } from "@/components/session/SessionTimer";
import ScheduleCallModal from "@/components/calls/ScheduleCallModal";

interface Supplier {
 id: string;
 name: string;
 contactPerson: string | null;
 email: string | null;
 phone: string | null;
 address: string | null;
 country: string | null;
 category: string | null;
 notes: string | null;
 importerId?: string | null;
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

export default function ExporterSuppliersPage() {
 // 1. Data Hooks
 const callController = useRealtimeCall();
 
 // 2. Local State
 const [suppliers, setSuppliers] = useState<Supplier[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 
 // Selection state (The target for Chat and Call)
 const [selectedId, setSelectedId] = useState<string | null>(null);
 const [selectedUser, setSelectedUser] = useState<any>(null);

 // History state
 const [isHistoryOpen, setIsHistoryOpen] = useState(false);
 const [historyLoading, setHistoryLoading] = useState(false);
 const [tradeHistory, setTradeHistory] = useState<TradeHistoryOrder[]>([]);

 // Sidebar UI state
 const [isAddDealerModalOpen, setIsAddDealerModalOpen] = useState(false);
 const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [formData, setFormData] = useState({
 name: "",
 contactPerson: "",
 email: "",
 phone: "",
 address: "",
 country: "",
 category: "",
 notes: "",
 });

 // 3. Messaging Hook (Targeting the linked importerId if available, fallback to selectedId)
 const activePartner = useMemo(() => {
 if (!selectedId) return null;
 return suppliers.find(s => s.id === selectedId);
 }, [selectedId, suppliers]);

 const targetUserId = useMemo(() => activePartner?.importerId || selectedId, [activePartner, selectedId]);
 const { messages, sendMessage, loading: messagesLoading } = useChat(targetUserId);
 const [msgInput, setMsgInput] = useState("");
 const scrollRef = useRef<HTMLDivElement>(null);

 // 4. Data Fetching
 const fetchSuppliers = async (useLoader = true) => {
 if (useLoader) setLoading(true);
 try {
 const res = await authFetch<{ suppliers: Supplier[] }>("/api/suppliers");
 setSuppliers(res.suppliers || []);
 } catch (error) {
 toast.error("Registry_Read_Error: Failed to index dealer nodes.");
 } finally {
 if (useLoader) setLoading(false);
 }
 };

 useEffect(() => {
 void fetchSuppliers();
 }, []);

 // Fetch history logic
 const fetchHistory = async (partnerId: string) => {
 setHistoryLoading(true);
 try {
 const res = await authFetch<{ orders: TradeHistoryOrder[] }>(
 `/api/dashboard/directory/${partnerId}`
 );
 setTradeHistory(res.orders);
 } catch (e) {
 setTradeHistory([]);
 } finally {
 setHistoryLoading(false);
 }
 };

 // 5. Derived State
 const filteredList = useMemo(() => {
 const query = searchQuery.toLowerCase();
 return suppliers.filter(s => 
 s.name.toLowerCase().includes(query) || 
 (s.category && s.category.toLowerCase().includes(query))
 );
 }, [suppliers, searchQuery]);

 // Update selected user profile
 useEffect(() => {
 if (activePartner) {
 setSelectedUser({
 id: activePartner.importerId || selectedId,
 name: activePartner.name,
 avatar: null,
 role: "Verified Supplier",
 address: activePartner.address || activePartner.country
 });
 if (activePartner.importerId) {
 void fetchHistory(activePartner.importerId);
 } else {
 setTradeHistory([]);
 }
 } else {
 setSelectedUser(null);
 setTradeHistory([]);
 }
 }, [selectedId, activePartner]);

 // Auto-scroll chat
 useEffect(() => {
 if (scrollRef.current) {
 scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
 }
 }, [messages]);

 // 6. Action Handlers
 const handleAddDealer = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 const res = await authFetch<{ supplier: Supplier }>("/api/suppliers", {
 method: "POST",
 body: JSON.stringify(formData),
 });
 if (res.supplier) {
 toast.success("Dealer node successfully registered.");
 setIsAddDealerModalOpen(false);
 setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", country: "", category: "", notes: "" });
 void fetchSuppliers(false);
 setSelectedId(res.supplier.id);
 }
 } catch (error) {
 toast.error("Registry_Write_Error: Failed to commit dealer.");
 } finally {
 setIsSubmitting(false);
 }
 };

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

 // 7. Render
 return (
 <div className="h-full flex overflow-hidden bg-background">
 {/* LEFT PANEL: Dealer List */}
 <div className={`flex flex-col border-r border-border shrink-0 transition-all duration-300 ${selectedId ? "w-0 md:w-80 lg:w-[400px]" : "w-full md:w-80 lg:w-[400px]"}`}>
 <div className="p-10 space-y-8">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
 <Handshake className="w-8 h-8 text-primary" />
 Dealers Hub
 </h1>
 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-50">Unified Supplier Registry</p>
 </div>
 <Button 
 className="size-14 rounded-lg border border-border bg-card/40 hover:bg-primary hover:text-white transition-all shadow-xl dark:shadow-none"
 onClick={() => setIsAddDealerModalOpen(true)}
 >
 <Plus className="w-6 h-6" />
 </Button>
 </div>

 {/* Search */}
 <div className="relative group/search">
 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
 <input
 type="text"
 placeholder="Identify Dealer frequency..."
 className="w-full bg-muted/20 border border-border rounded-lg pl-14 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold shadow-inner"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar px-4">
  {loading ? (
    <div className="p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
      <GifLoader text="Syncing Neural Registry..." />
    </div>
  ) : filteredList.length === 0 ? (

 <div className="p-20 text-center opacity-30 flex flex-col items-center gap-5">
 <Handshake className="w-12 h-12 grayscale" />
 <span className="text-xs font-black uppercase tracking-widest">No nodes indexed</span>
 </div>
 ) : (
 <div className="space-y-3 pb-10">
 {filteredList.map((node) => {
 const isSelected = selectedId === node.id;
 return (
 <button
 key={node.id}
 onClick={() => setSelectedId(node.id)}
 className={`w-full group relative bg-card/40 border transition-all duration-500 rounded-lg overflow-hidden p-6 text-left ${isSelected ? "border-primary ring-1 ring-primary/20 shadow-2xl shadow-primary/10" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}
 >
 <div className="flex items-center gap-5">
 <div className="size-16 rounded-lg bg-gradient-to-br from-primary to-blue-600/10 flex shrink-0 items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform">
 {node.name.charAt(0).toUpperCase()}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-start mb-1">
 <h3 className="font-black text-sm uppercase tracking-tight truncate group-hover:text-primary transition-colors">{node.name}</h3>
 <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40 shrink-0 ml-2 ">{node.country || "Global"}</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/10 ">
 {node.category || "Supplier Node"}
 </div>
 <span className="w-1 h-1 rounded-full bg-border" />
 <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Active Sequence</span>
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

 {/* RIGHT PANEL: Conversation + Call View */}
 <div className={`flex-1 flex flex-col relative overflow-hidden bg-muted/5 ${!selectedId ? "hidden md:flex flex-col items-center justify-center" : "flex"}`}>
 {selectedId && selectedUser ? (
 <>
 {/* Conversation Header */}
 <header className="p-8 border-b border-border bg-card/60 backdrop-blur-3xl flex items-center justify-between z-20 sticky top-0">
 <div className="flex items-center gap-6">
 <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedId(null)}>
 <ChevronLeft className="w-6 h-6" />
 </Button>
 <div className="flex items-center gap-5">
 <div className="size-14 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-xl overflow-hidden shadow-lg shadow-white/5">
 {selectedUser.name.charAt(0)}
 </div>
 <div>
 <h3 className="font-black text-xl uppercase tracking-tighter text-foreground">{selectedUser.name}</h3>
 <div className="flex items-center gap-2 mt-1">
 <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
 <span className="text-[11px] font-black text-primary uppercase tracking-widest">Trade Node Verified</span>
 </div>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <Button 
 className="rounded-lg border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 gap-3 h-14 px-8"
 onClick={() => initiateCall("AUDIO")}
 >
 <Waves className="w-5 h-5" />
 <span className="hidden lg:inline text-[11px] font-black uppercase tracking-[0.2em]">Voice Link</span>
 </Button>
 <Button 
 className="rounded-lg border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary gap-3 h-14 px-8"
 onClick={() => initiateCall("VIDEO")}
 >
 <Video className="w-5 h-5" />
 <span className="hidden lg:inline text-[11px] font-black uppercase tracking-[0.2em]">Video Signal</span>
 </Button>
 <Button 
 variant="ghost" 
 size="icon" 
 className={`rounded-lg size-14 border border-border transition-all ${isHistoryOpen ? "bg-primary text-white border-primary" : ""}`}
 onClick={() => setIsHistoryOpen(!isHistoryOpen)}
 >
 <History className="w-6 h-6" />
 </Button>
 <Button variant="ghost" size="icon" className="rounded-lg size-14 border border-border" onClick={() => setIsScheduleModalOpen(true)}>
 <CalendarClock className="w-6 h-6" />
 </Button>
 <Button variant="ghost" size="icon" className="rounded-lg size-14 border border-border">
 <MoreVertical className="w-6 h-6" />
 </Button>
 </div>
 </header>

 <div className="flex-1 flex overflow-hidden">
 {/* Main Chat Area */}
 <div className="flex-1 flex flex-col min-w-0 bg-[url('/grid.svg')] bg-fixed">
 <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-10 flex flex-col custom-scrollbar">
  {messagesLoading && messages.length === 0 ? (
    <div className="flex-1 flex items-center justify-center">
      <GifLoader showText={false} />
    </div>
  ) : messages.length === 0 ? (

 <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto opacity-30 space-y-8">
 <div className="p-8 rounded-lg bg-primary/10 border border-primary/10 rotate-6">
 <MessageCircle className="w-16 h-16 text-primary" />
 </div>
 <div className="space-y-3">
 <p className="text-sm font-black uppercase tracking-[0.3em]">Communication Tunnel Established</p>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 text-center">Secure p2p signal active. Transmit trade intelligence.</p>
 </div>
 </div>
 ) : (
 messages.map((msg) => {
 const isMe = msg.senderId !== selectedId;
 return (
 <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
 <div className={`max-w-[85%] lg:max-w-[70%] px-8 py-6 rounded-lg shadow-2xl text-[13px] leading-relaxed transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 ${isMe ? "bg-primary text-white rounded-tr-none shadow-primary/20" : "bg-card border border-border text-foreground rounded-tl-none shadow-black/5"}`}>
 {msg.body}
 <div className={`mt-4 text-[10px] font-black uppercase opacity-20 flex items-center gap-3 ${isMe ? "justify-end text-white/60" : "justify-start"}`}>
 {format(new Date(msg.createdAt), "HH:mm")}
 {isMe && <ShieldCheck className="w-3 h-3" />}
 </div>
 </div>
 </div>
 );
 })
 )}
 </div>

 {/* Message Input */}
 <footer className="p-10 border-t border-border bg-card/40 backdrop-blur-3xl">
 <form onSubmit={handleSendMsg} className="flex items-end gap-6 max-w-5xl mx-auto">
 <div className="flex-1 relative bg-background border border-border rounded-lg overflow-hidden shadow-inner group/input focus-within:ring-4 focus-within:ring-primary/10 transition-all">
 <textarea
 className="w-full bg-transparent px-8 py-6 pr-20 text-[13px] focus:outline-none resize-none min-h-[72px] max-h-48 custom-scrollbar font-medium"
 placeholder="Transmit trade signal..."
 rows={1}
 value={msgInput}
 onChange={(e) => setMsgInput(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Enter" && !e.shiftKey) {
 e.preventDefault();
 handleSendMsg();
 }
 }}
 />
 <div className="absolute right-8 bottom-6 text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] hidden sm:block ">
 Neural Link Active
 </div>
 </div>
 <Button 
 type="submit" 
 className="size-20 rounded-lg shadow-2xl shadow-primary/30 bg-primary hover:bg-primary-hover shrink-0 active:scale-90 transition-all flex items-center justify-center p-0"
 disabled={!msgInput.trim()}
 >
 <Send className="w-8 h-8 text-white rotate-12 group-hover:rotate-0 transition-transform" />
 </Button>
 </form>
 </footer>
 </div>

 {/* Right Panel: Intelligence Manifest (Trade History) */}
 <AnimatePresence>
 {isHistoryOpen && (
 <motion.div
 initial={{ width: 0, opacity: 0 }}
 animate={{ width: 400, opacity: 1 }}
 exit={{ width: 0, opacity: 0 }}
 className="border-l border-border bg-card/40 backdrop-blur-3xl flex flex-col shrink-0 overflow-hidden relative"
 >
 <div className="p-10 border-b border-border flex items-center justify-between">
 <div>
 <h3 className="text-xl font-black uppercase tracking-tighter">Trade Feed</h3>
 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-2 opacity-50 ">Neural Order Sequence</p>
 </div>
 <Button variant="ghost" size="icon" className="rounded-xl border border-border" onClick={() => setIsHistoryOpen(false)}>
 <X className="w-5 h-5" />
 </Button>
 </div>

 <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
 {historyLoading ? (
 <div className="flex flex-col items-center justify-center py-20 opacity-20 space-y-5">
 <Globe className="w-10 h-10 animate-spin-slow" />
 <span className="text-[9px] font-black uppercase tracking-[0.3em]">Streaming Telemetry...</span>
 </div>
 ) : tradeHistory.length === 0 ? (
 <div className="text-center py-20 opacity-20 space-y-5">
 <Package className="w-12 h-12 mx-auto" />
 <p className="text-[9px] font-black uppercase tracking-[0.3em]">Null_History_Record</p>
 </div>
 ) : (
 tradeHistory.map((order) => (
 <div key={order.id} className="group relative bg-muted/20 border border-border rounded-lg p-6 hover:bg-card/60 transition-all duration-500 overflow-hidden">
 <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-3xl bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all">
 {order.status}
 </div>
 <div className="flex items-center gap-4 mb-5">
 <div className="size-14 rounded-lg bg-black/5 border border-border overflow-hidden p-1 group-hover:scale-105 transition-transform">
 {order.product?.images?.[0] ? (
 <img src={order.product.images[0]} alt="" className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
 ) : (
 <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-muted-foreground/20" /></div>
 )}
 </div>
 <div className="min-w-0">
 <h4 className="font-black text-xs uppercase tracking-tight truncate group-hover:text-primary transition-colors">{order.product?.name || "Null_Asset"}</h4>
 <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mt-1 ">#{order.orderNumber}</p>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <span className="text-[7px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 ">Quantity</span>
 <div className="text-[11px] font-black ">{order.quantity} {order.product?.unit || 'Units'}</div>
 </div>
 <div className="text-right">
 <span className="text-[7px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 ">Net_Yield</span>
 <div className="text-[11px] font-black text-primary">{formatCurrency(order.totalPrice)}</div>
 </div>
 </div>
 <Link 
 href={`/dashboard/exporter/orders/${order.id}`}
 className="mt-5 w-full py-3 bg-card border border-border rounded-xl text-[8px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-primary hover:text-white hover:border-transparent transition-all group/btn"
 >
 Inspect order
 <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
 </Link>
 </div>
 ))
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </>
 ) : (
 /* Initial Empty State */
 <div className="text-center max-w-md space-y-12 animate-in fade-in zoom-in duration-1000">
 <div className="relative mx-auto">
 <div className="size-48 mx-auto rounded-lg bg-gradient-to-br from-primary to-blue-600/[0.05] p-[1.5px] shadow-2xl shadow-primary/20 rotate-6 group">
 <div className="h-full w-full bg-background/90 backdrop-blur-3xl rounded-lg flex items-center justify-center group-hover:rotate-[-6deg] transition-transform duration-700">
 <Handshake className="w-20 h-20 text-primary" />
 </div>
 </div>
 <div className="absolute top-0 right-0 size-4 bg-emerald-500 rounded-full animate-ping" />
 </div>
 <div className="space-y-4">
 <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground flex items-center justify-center gap-4">
 Registry Terminal
 </h2>
 <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-loose opacity-60">
 Identify trade node for encrypted sequence.<br/>
 Messaging and realtime signaling enabled.
 </p>
 </div>
 <div className="flex gap-4 justify-center">
 <div className="px-6 py-3 bg-primary/5 border border-primary/10 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-primary ">Secure Node</div>
 <div className="px-6 py-3 bg-muted/30 border border-border rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ">P2P Encryption</div>
 </div>
 </div>
 )}

 {/* ACTIVE CALL OVERLAY */}
 {callController.phase !== "idle" && callController.phase !== "ended" && (
 <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col animate-in fade-in duration-500">
 {/* Call UI Header */}
 <header className="p-10 flex items-center justify-between">
 <div className="flex items-center gap-6">
 <div className="size-20 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-3xl shadow-2xl shadow-primary/20">
 {(callController.activeCall?.peerName || callController.incomingCall?.fromName || "X").charAt(0)}
 </div>
 <div>
 <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
 {callController.activeCall?.peerName || callController.incomingCall?.fromName || "Connecting..."}
 </h2>
 <div className="flex items-center gap-3 mt-2">
 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
 <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
 {callController.phase.replace("-", " ")}
 </span>
 </div>
 </div>
 </div>
 </div>

 {callController.phase === "in-call" && (
 <SessionTimer 
 endTime={null} 
 onTimeExpired={() => {}} 
 />
 )}
 </header>

 {/* Call Canvas */}
 <div className="flex-1 p-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto w-full">
 <VideoPlayer 
 stream={callController.remoteStream}
 name={callController.activeCall?.peerName || "Remote Partner"}
 image={null}
 isLocal={false}
 className="h-[500px] md:h-[600px] border border-white/10 rounded-lg shadow-2xl"
 />

 <VideoPlayer 
 stream={callController.localStream}
 name="You"
 image={null}
 isLocal={true}
 isMuted={callController.isMuted}
 isVideoOff={!callController.isCameraEnabled}
 className="h-[500px] md:h-[600px] border border-white/10 rounded-lg shadow-2xl"
 />
 </div>

 {/* Call Controls */}
 <footer className="p-16 flex justify-center">
 <div className="flex items-center gap-10 p-6 bg-white/[0.03] border border-white/10 rounded-lg backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
 <Button 
 variant="ghost" 
 size="icon" 
 className={`size-20 rounded-full transition-all ${!callController.isMuted ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500 text-white shadow-xl shadow-red-500/20"}`}
 onClick={() => callController.toggleMute()}
 >
 {callController.isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
 </Button>
 
 {callController.phase === "ringing" ? (
 <>
 <Button 
 className="size-24 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl shadow-emerald-500/40 animate-bounce"
 onClick={() => void callController.acceptCall()}
 >
 <Phone className="w-10 h-10" />
 </Button>
 <Button 
 variant="destructive"
 className="size-20 rounded-full bg-red-600 hover:bg-red-500"
 onClick={() => void callController.declineCall()}
 >
 <PhoneOff className="w-8 h-8" />
 </Button>
 </>
 ) : (
 <Button 
 variant="destructive"
 className="size-24 rounded-full shadow-2xl shadow-red-500/40 bg-red-600 hover:bg-red-500 transition-all active:scale-90"
 onClick={() => void callController.endCall()}
 >
 <PhoneOff className="w-10 h-10" />
 </Button>
 )}

 <Button 
 variant="ghost" 
 size="icon" 
 className={`size-20 rounded-full transition-all ${callController.isCameraEnabled ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500 text-white shadow-xl shadow-red-500/20"}`}
 onClick={() => callController.toggleCamera()}
 >
 {!callController.isCameraEnabled ? <VideoOff className="w-8 h-8" /> : <Video className="w-8 h-8" />}
 </Button>
 </div>
 </footer>
 </div>
 )}
 </div>

 {/* MODALS */}
 <ScheduleCallModal
 open={isScheduleModalOpen}
 onOpenChange={setIsScheduleModalOpen}
 receiver={selectedUser ? { id: selectedId!, name: selectedUser.name } : null}
 onScheduled={() => toast.success("Negotiation session requested.")}
 />

 {/* Add Dealer Modal */}
 <AnimatePresence>
 {isAddDealerModalOpen && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="bg-background border border-border w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden"
 >
 <div className="p-12 border-b border-border bg-white/[0.02] backdrop-blur-md flex items-center justify-between">
 <div>
 <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter">Add New Dealer</h3>
 <p className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2 ">Forge a new trade link in the registry node</p>
 </div>
 <button
 onClick={() => setIsAddDealerModalOpen(false)}
 className="size-14 bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-90"
 >
 <X className="w-7 h-7" />
 </button>
 </div>

 <form onSubmit={handleAddDealer} className="p-12 overflow-y-auto max-h-[70vh] custom-scrollbar">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
 {[
 { l: 'Node Identity*', k: 'name', p: 'e.g. ALPHA_MFG_CORP', i: Building2, r: true },
 { l: 'Liaison Node', k: 'contactPerson', p: 'e.g. John_Doe_ADMIN', i: User },
 { l: 'Comms URI', k: 'email', p: 'SIGNAL@NODE.INTEL', i: Mail, t: 'email' },
 { l: 'Signal Frequency', k: 'phone', p: '+00 0000 0000', i: Phone },
 { l: 'Geospatial Origin', k: 'country', p: 'e.g. INDIA_DELTA', i: MapPin },
 { l: 'Sector Category', k: 'category', p: 'e.g. LOGISTICS_NODE', i: Tag },
 ].map(f => (
 <div key={f.k} className="space-y-4 group/field">
 <label className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] flex items-center gap-3 group-focus-within/field:text-foreground transition-colors">
 <f.i className="size-3.5" />
 {f.l}
 </label>
 <input
 required={f.r}
 type={f.t || "text"}
 className="w-full bg-white/[0.02] border border-border rounded-lg px-6 py-4 text-[11px] text-foreground font-black uppercase tracking-[0.2em] focus:border-primary/30 outline-none transition-all placeholder:text-muted-foreground/10 shadow-inner"
 placeholder={f.p}
 value={(formData as any)[f.k]}
 onChange={e => setFormData({ ...formData, [f.k]: e.target.value })}
 />
 </div>
 ))}
 </div>

 <div className="mt-10 space-y-4 group/field">
 <label className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] flex items-center gap-3 group-focus-within/field:text-foreground transition-colors">
 <FileText className="size-3.5" />
 Intelligence Manifest
 </label>
 <textarea
 className="w-full bg-white/[0.02] border border-border rounded-lg px-8 py-6 text-[11px] text-foreground font-black uppercase tracking-[0.2em] focus:border-primary/30 outline-none transition-all placeholder:text-muted-foreground/10 min-h-[120px] resize-none shadow-inner leading-relaxed"
 placeholder="Record node performance telemetry..."
 value={formData.notes}
 onChange={e => setFormData({ ...formData, notes: e.target.value })}
 />
 </div>

 <div className="mt-12 flex gap-6">
 <button
 type="button"
 onClick={() => setIsAddDealerModalOpen(false)}
 className="flex-1 py-5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-border"
 >
 Abort Registration
 </button>
 <button
 type="submit"
 disabled={isSubmitting}
 className="flex-[2] py-5 bg-primary hover:bg-primary-hover text-white rounded-lg font-black shadow-2xl shadow-primary/20 transition-all disabled:opacity-20 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.3em] active:scale-95 group"
 >
 {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <ShieldCheck className="size-5 group-hover:scale-125 transition-transform" />}
 Commit_Node_Registration
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </div>
 );
}
