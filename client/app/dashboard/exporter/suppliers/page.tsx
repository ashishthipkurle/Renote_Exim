"use client";

import { useState, useEffect } from "react";
import {
    Handshake,
    Plus,
    Search,
    Mail,
    Phone,
    MapPin,
    Tag,
    MoreVertical,
    PlusCircle,
    Loader2,
    X,
    User,
    Building2,
    FileText,
    Globe,
    ShieldCheck,
    Zap,
    ArrowRight,
    SearchX
} from "lucide-react";
import { authFetch } from "@/lib/api-utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
    createdAt: string;
}

export default function ExporterSuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const fetchSuppliers = async () => {
        try {
            const res = await authFetch<{ suppliers: Supplier[] }>("/api/suppliers");
            setSuppliers(res.suppliers);
        } catch (error) {
            toast.error("Null_Source_Telemetry: Failed to index dealer nodes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleCreateSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await authFetch<{ supplier: Supplier }>("/api/suppliers", {
                method: "POST",
                body: JSON.stringify(formData),
            });
            if (res.supplier) {
                toast.success("Dealer node successfully registered to registry.");
                setIsModalOpen(false);
                setFormData({
                    name: "",
                    contactPerson: "",
                    email: "",
                    phone: "",
                    address: "",
                    country: "",
                    category: "",
                    notes: "",
                });
                fetchSuppliers();
            }
        } catch (error) {
            toast.error("Registry_Write_Error: Failed to commit dealer identity.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading && suppliers.length === 0) return (
        <div className="h-screen flex flex-col items-center justify-center bg-card dark:bg-[#0a0a0a]">
          <div className="flex flex-col items-center gap-6 opacity-40">
            <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 animate-pulse">
              <Handshake className="w-12 h-12 text-foreground dark:text-white animate-spin-slow" />
            </div>
            <p className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.4em] italic">Indexing Dealer Nodes...</p>
          </div>
        </div>
    );

    return (
        <div className="h-full overflow-hidden flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
            {/* ── Header ── */}
            <header className="flex-shrink-0 px-10 py-10 border-b border-border dark:border-white/5 bg-background/40 backdrop-blur-3xl z-40">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                    <div className="flex items-center gap-8">
                       <h1 className="text-5xl font-black tracking-tighter text-foreground dark:text-white uppercase italic">Dealer Registry</h1>
                       <div className="h-10 w-px bg-black/5 dark:bg-white/10 mx-4 hidden xl:block" />
                       <p className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.3em] italic max-w-xs hidden xl:block">
                         Supply Chain Nodes: Operational Directory // {suppliers.length} Verified Sources
                       </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] italic py-4 px-10 rounded-2xl shadow-xl dark:shadow-2xl transition-all active:scale-95 group"
                    >
                        <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Register New Dealer
                    </button>
                </div>

                <div className="mt-10 relative max-w-xl group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-foreground dark:text-white transition-colors w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search dealers via name, category, or contact signal..."
                        className="w-full bg-white/[0.02] border border-border dark:border-white/5 rounded-2xl pl-12 pr-6 py-4 text-[10px] text-foreground dark:text-white font-black uppercase tracking-widest placeholder:text-muted-foreground/10 focus:border-border dark:border-white/20 focus:outline-none transition-all shadow-inner italic backdrop-blur-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-16 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
                {filteredSuppliers.length === 0 ? (
                    <div className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 shadow-xl dark:shadow-2xl rounded-[3rem] p-24 text-center max-w-[1200px] mx-auto mt-12">
                        <div className="flex flex-col items-center gap-8 opacity-40">
                            <div className="p-10 rounded-[2.5rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10">
                                <SearchX className="w-16 h-16 text-foreground dark:text-white" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">Null_Dealer_Index</h2>
                                <p className="text-[10px] text-foreground dark:text-white font-black uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed italic">
                                    {searchQuery ? "Telemetry search yielded no registry matches. Adjust signal parameters." : "Registry empty. Start indexing your dealer network by initializing the first node registration."}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 max-w-[1700px] mx-auto">
                        {filteredSuppliers.map((supplier) => (
                            <div
                                key={supplier.id}
                                className="group bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 hover:border-border dark:border-white/20 transition-all duration-700 rounded-[2.5rem] p-8 shadow-xl dark:shadow-2xl relative overflow-hidden flex flex-col hover:-translate-y-2"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                                    <MoreVertical className="w-6 h-6 text-foreground dark:text-white" />
                                </div>

                                <div className="flex items-start gap-6 mb-8 relative z-10">
                                    <div className="size-16 rounded-2xl bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center text-foreground dark:text-white font-black text-2xl italic group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-700 shadow-inner">
                                        {supplier.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-black text-foreground dark:text-white italic tracking-tighter uppercase group-hover:translate-x-1 transition-transform truncate">{supplier.name}</h3>
                                        {supplier.category ? (
                                            <span className="inline-flex items-center gap-2 text-[9px] font-black text-foreground dark:text-white bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 px-4 py-1.5 rounded-full uppercase tracking-widest mt-3 italic shadow-xl dark:shadow-2xl">
                                                <Tag className="w-3 h-3 text-white/40" />
                                                {supplier.category} // CAT_NODE
                                            </span>
                                        ) : (
                                            <span className="text-[8px] text-muted-foreground/10 font-black uppercase tracking-widest mt-2 block italic">UNCATEGORIZED_ALPHA</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 flex-1 relative z-10">
                                    {[
                                        { l: 'Point of Contact', v: supplier.contactPerson, i: User },
                                        { l: 'Network URI', v: supplier.email, i: Mail },
                                        { l: 'Comms Link', v: supplier.phone, i: Phone },
                                        { l: 'Node Origin', v: supplier.country, i: MapPin },
                                    ].filter(d => d.v).map((detail) => (
                                        <div key={detail.l} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-border dark:border-white/5 group/detail hover:border-border dark:border-white/10 transition-all">
                                            <detail.i className="size-4 text-muted-foreground/20 group-hover/detail:text-foreground dark:text-white transition-colors" />
                                            <div className="min-w-0">
                                                <div className="text-[8px] font-black text-muted-foreground/10 uppercase tracking-widest italic">{detail.l}</div>
                                                <div className="text-[10px] font-black text-foreground dark:text-white italic uppercase tracking-widest truncate mt-0.5">{detail.v}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {supplier.notes && (
                                    <div className="pt-6 border-t border-border dark:border-white/5 relative z-10">
                                        <div className="text-[8px] font-black text-muted-foreground/10 uppercase tracking-widest mb-3 flex items-center gap-2 italic">
                                            <FileText className="size-3" />
                                            Intelligence_Notes
                                        </div>
                                        <p className="text-[10px] text-muted-foreground/40 font-medium italic uppercase leading-relaxed line-clamp-2 tracking-tight group-hover:text-muted-foreground transition-colors">
                                            &ldquo;{supplier.notes}&rdquo;
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Dealer Protocol Reminder */}
                <div className="max-w-[1200px] mx-auto bg-card/60 dark:bg-white/[0.07] border border-border dark:border-white/10 rounded-[3rem] p-12 flex flex-col xl:flex-row items-center gap-10 shadow-xl dark:shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-6 transition-transform duration-1000">
                      <Zap className="w-40 h-40 text-foreground dark:text-white" />
                    </div>
                    <div className="size-20 rounded-[2rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center shrink-0 relative z-10 transition-all duration-1000 group-hover:scale-110">
                      <ShieldCheck className="w-10 h-10 text-foreground dark:text-white" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-foreground dark:text-white font-black text-2xl uppercase italic tracking-tighter mb-4">Quality_Source_Verification</h3>
                      <p className="text-muted-foreground/40 text-xs font-medium leading-relaxed max-w-3xl italic uppercase tracking-tight group-hover:text-muted-foreground/80 transition-colors">
                        Dealers and source nodes must undergo periodic verification sequences to maintain registry status. Ensure contact telemetry is up-to-date to prevent signal dropouts. Verified partners receive priority in high-value procurement sequences.
                      </p>
                    </div>
                    <button className="xl:ml-auto border border-border dark:border-white/10 text-foreground dark:text-white hover:bg-primary hover:text-primary-foreground h-16 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] italic transition-all active:scale-95 shadow-xl dark:shadow-2xl relative z-10">
                      Partner_Intel
                    </button>
                </div>
            </div>

            {/* ── Add Dealer Modal ── */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-background border border-border dark:border-white/10 w-full max-w-4xl rounded-[3rem] shadow-xl dark:shadow-2xl overflow-hidden"
                        >
                            <div className="p-12 border-b border-border dark:border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <div className="space-y-3">
                                    <h3 className="text-4xl font-black text-foreground dark:text-white italic tracking-tighter uppercase">Initialize Node Registration</h3>
                                    <p className="text-muted-foreground/40 text-[9px] font-black uppercase tracking-[0.3em] italic leading-relaxed">Identity Manifest: SECURE_SOURCE_DIRECTORY // Enter node parameters below</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="size-14 bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 rounded-2xl flex items-center justify-center text-white/20 hover:text-foreground dark:text-white transition-all active:scale-90">
                                    <X className="w-7 h-7" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSupplier} className="p-12">
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
                                            <label className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] flex items-center gap-3 italic group-focus-within/field:text-foreground dark:text-white transition-colors">
                                                <f.i className="size-3.5" />
                                                {f.l}
                                            </label>
                                            <input
                                                required={f.r}
                                                type={f.t || "text"}
                                                className="w-full bg-white/[0.02] border border-border dark:border-white/5 rounded-2xl px-6 py-4 text-[11px] text-foreground dark:text-white font-black uppercase tracking-[0.2em] focus:border-border dark:border-white/20 outline-none transition-all placeholder:text-muted-foreground/10 italic shadow-inner"
                                                placeholder={f.p}
                                                value={(formData as any)[f.k]}
                                                onChange={e => setFormData({ ...formData, [f.k]: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10 space-y-4 group/field">
                                    <label className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] flex items-center gap-3 italic group-focus-within/field:text-foreground dark:text-white transition-colors">
                                        <FileText className="size-3.5" />
                                        Intelligence Manifest
                                    </label>
                                    <textarea
                                        className="w-full bg-white/[0.02] border border-border dark:border-white/5 rounded-[2rem] px-8 py-6 text-[11px] text-foreground dark:text-white font-black uppercase tracking-[0.2em] focus:border-border dark:border-white/20 outline-none transition-all placeholder:text-muted-foreground/10 min-h-[120px] resize-none italic shadow-inner leading-relaxed"
                                        placeholder="Record node performance telemetry, quality coefficients, and settlement terms..."
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>

                                <div className="mt-12 flex gap-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-5 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:bg-white/15 text-white/40 hover:text-foreground dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all italic border border-border dark:border-white/5"
                                    >
                                        Abort Registration
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black shadow-2xl shadow-white/5 transition-all disabled:opacity-20 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.3em] italic active:scale-95 group"
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
