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
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
                    <ShieldAlert className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-400 font-medium leading-relaxed">
                        Raising a dispute will freeze payment to the exporter until our mediation team reviews the case.
                        Please provide accurate details and evidence.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Dispute Reason</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none"
                        >
                            <option value="">Select a reason...</option>
                            {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Detailed Comments</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Explain the issue in detail..."
                            rows={4}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-2xl border border-slate-200 dark:border-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {loading ? "Submitting..." : "Submit Dispute"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
