"use client";

import { useState } from "react";
import { ShieldAlert, Send, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";

interface DisputeModalProps {
 isOpen: boolean;
 onClose: () => void;
 order: any;
}

export default function DisputeModal({
 isOpen,
 onClose,
 order,
}: DisputeModalProps) {
 const [reason, setReason] = useState("");
 const [comment, setComment] = useState("");
 const [loading, setLoading] = useState(false);

 if (!order) return null;

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!reason) return toast.error("Please select a reason");

 setLoading(true);
 // Simulate API call
 await new Promise(r => setTimeout(r, 1500));
 setLoading(false);

 toast.success("Dispute raised. Our team will review it within 24-48 hours.");
 onClose();
 };

 const reasons = [
 "Product not as described",
 "Damaged during transit",
 "Missing items",
 "Incorrect quantity",
 "Late delivery",
 "Quality issues",
 "Other",
 ];

 return (
 <Modal isOpen={isOpen} onClose={onClose} title="Raise Trade Dispute" maxWidth="max-w-xl">
 <div className="space-y-6">
 <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex gap-4 shadow-inner">
 <ShieldAlert className="w-6 h-6 text-white flex-shrink-0" />
 <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.1em] leading-relaxed opacity-60">
 Raising a dispute will freeze capital transmission to the exporter node until mediation protocols are executed.
 Accuracy in incident reporting is mandatory.
 </p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-5">
 <div>
 <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ">Incident Classification</label>
 <div className="relative group">
 <select
 value={reason}
 onChange={(e) => setReason(e.target.value)}
 className="w-full bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 focus:bg-muted/40 transition-all appearance-none font-medium"
 >
 <option value="" className="bg-black text-white">Select protocol breach...</option>
 {reasons.map(r => <option key={r} value={r} className="bg-black text-white">{r}</option>)}
 </select>
 <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 border-r-2 border-b-2 border-white/20 rotate-45 pointer-events-none group-focus-within:border-white transition-colors" />
 </div>
 </div>

 <div>
 <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ">Detailed Intelligence Feedback</label>
 <textarea
 value={comment}
 onChange={(e) => setComment(e.target.value)}
 placeholder="Provide comprehensive telemetry on the incident..."
 rows={4}
 className="w-full bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-white/20 focus:bg-muted/40 transition-all font-medium leading-relaxed"
 />
 </div>

 <div className="flex gap-4 pt-2">
 <button
 type="button"
 onClick={onClose}
 className="flex-1 bg-muted/40 hover:bg-muted/60 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-lg border border-border transition-all hover:-translate-y-1 active:translate-y-0 text-[10px]"
 >
 Abort
 </button>
 <button
 type="submit"
 disabled={loading}
 className="flex-1 bg-white hover:bg-primary/90 disabled:opacity-50 text-black font-black uppercase tracking-[0.2em] py-3.5 rounded-lg shadow-2xl shadow-white/10 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 text-[10px]"
 >
 {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
 {loading ? "Transmitting..." : "Broadcast Dispute"}
 </button>
 </div>
 </form>
 </div>
 </Modal>
 );
}
