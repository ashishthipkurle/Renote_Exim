"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
    CalendarClock,
    Handshake,
    Headphones,
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
    MessageCircle,
    Users2,
    Video,
    Waves,
    CheckCircle2
} from "lucide-react";

import CallDeskPanel from "@/components/calls/CallDeskPanel";
import ScheduleCallModal from "@/components/calls/ScheduleCallModal";
import MessagesWorkspace from "@/components/messaging/MessagesWorkspace";
import { authFetch, formatCurrency, formatNumber, timeAgo } from "@/lib/api-utils";
import { useRealtimeCall } from "@/hooks/useRealtimeCall";
import { toast } from "sonner";

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

interface ImporterContact {
    id: string;
    name: string | null;
    companyName: string | null;
    country: string | null;
    avatar: string | null;
    orderCount: number;
    totalValue: number;
    lastOrderAt: string | null;
}

type DashboardTab = "dealers" | "importers" | "messages" | "calls";

export default function ExporterSuppliersPage() {
    const callController = useRealtimeCall();

    const [activeTab, setActiveTab] = useState<DashboardTab>("dealers");
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [importers, setImporters] = useState<ImporterContact[]>([]);

    const [loading, setLoading] = useState(true);
    const [importersLoading, setImportersLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [importerQuery, setImporterQuery] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedMessageUserId, setSelectedMessageUserId] = useState<string | null>(null);
    const [scheduleTarget, setScheduleTarget] = useState<{
        id: string;
        name?: string | null;
        companyName?: string | null;
    } | null>(null);

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

    const tabs = useMemo(
        () => [
            { id: "dealers" as const, label: "Dealers", icon: Handshake },
            { id: "importers" as const, label: "Importers", icon: Users2 },
            { id: "messages" as const, label: "Messages", icon: MessageCircle },
            { id: "calls" as const, label: "Calls", icon: Headphones },
        ],
        []
    );

    const fetchSuppliers = async (useLoader = true) => {
        if (useLoader) setLoading(true);
        try {
            const res = await authFetch<{ suppliers: Supplier[] }>("/api/suppliers");
            setSuppliers(res.suppliers);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load dealers");
        } finally {
            if (useLoader) setLoading(false);
        }
    };

    const fetchImporters = async () => {
        setImportersLoading(true);
        try {
            const query = encodeURIComponent(importerQuery.trim());
            const response = await authFetch<{ importers: ImporterContact[] }>(`/api/calls/importers?q=${query}&limit=24`);
            setImporters(response.importers || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load importer network");
        } finally {
            setImportersLoading(false);
        }
    };

    useEffect(() => {
        void fetchSuppliers();
    }, []);

    useEffect(() => {
        if (activeTab !== "importers") return;
        const timer = setTimeout(() => {
            void fetchImporters();
        }, 250);
        return () => clearTimeout(timer);
    }, [activeTab, importerQuery]);

    const handleCreateSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await authFetch<{ supplier: Supplier }>("/api/suppliers", {
                method: "POST",
                body: JSON.stringify(formData),
            });
            if (res.supplier) {
                toast.success("Dealer added successfully");
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
                void fetchSuppliers(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to add dealer");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openMessageWorkspace = (partnerId: string) => {
        setSelectedMessageUserId(partnerId);
        setActiveTab("messages");
    };

    const openScheduleModal = (target: { id: string; name?: string | null; companyName?: string | null }) => {
        setScheduleTarget(target);
        setIsScheduleModalOpen(true);
    };

    const incomingCallBanner =
        callController.incomingCall && activeTab !== "calls" ? (
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 rounded-2xl border border-primary/30 bg-primary/10 p-4"
            >
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                            <Phone className="h-5 w-5" />
                            <span className="absolute inset-0 animate-ping rounded-2xl border border-primary/40" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-primary">Incoming call</p>
                            <p className="text-sm text-foreground">
                                {callController.incomingCall.fromName || "Trade Partner"} is calling you now.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab("calls")}
                            className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-black uppercase tracking-wider text-foreground transition-colors hover:bg-muted"
                        >
                            Open Call Desk
                        </button>
                        <button
                            onClick={() => void callController.acceptCall()}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-emerald-500"
                        >
                            Accept
                        </button>
                    </div>
                </div>
            </motion.div>
        ) : null;

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="h-full overflow-hidden flex flex-col bg-background">
            <header className="flex-shrink-0 p-6 lg:p-8 border-b border-border bg-header/80 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                            <Handshake className="text-primary w-8 h-8" />
                            Dealer Communication Hub
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage dealers, importer network, realtime messaging, and call operations in one place.
                        </p>
                    </div>

                    {activeTab === "dealers" ? (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            <PlusCircle className="w-5 h-5" />
                            Add New Dealer
                        </button>
                    ) : null}
                </div>

                <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-4">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = tab.id === activeTab;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative overflow-hidden rounded-2xl border px-4 py-3 text-left transition-all ${
                                    active
                                        ? "border-primary/40 bg-primary/15 text-primary shadow-lg shadow-primary/10"
                                        : "border-border bg-muted/30 text-muted-foreground hover:border-border/70 hover:bg-muted/50 hover:text-foreground"
                                }`}
                            >
                                <div className="relative z-10 flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                                    <Icon className="h-4 w-4" />
                                </div>
                                {active ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" /> : null}
                            </button>
                        );
                    })}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
                {incomingCallBanner}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.22 }}
                    >
                        {activeTab === "dealers" ? (
                            <>
                                <div className="mb-6 relative max-w-xl">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search dealers by name, category, or contact..."
                                        className="w-full bg-muted/50 border border-border rounded-2xl pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                        <p>Loading your directory...</p>
                                    </div>
                                ) : filteredSuppliers.length === 0 ? (
                                    <div className="bg-card border border-border rounded-3xl p-12 text-center max-w-2xl mx-auto mt-12">
                                        <Handshake className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                                        <h3 className="text-xl font-bold text-foreground mb-2">No dealers found</h3>
                                        <p className="text-muted-foreground mb-8">
                                            {searchQuery ? "Try adjusting your search terms." : "Start building your supplier network by adding your first dealer."}
                                        </p>
                                        {!searchQuery && (
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                                            >
                                                Add Dealer <Plus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
                                        {filteredSuppliers.map((supplier) => (
                                            <div
                                                key={supplier.id}
                                                className="group bg-card backdrop-blur-xl border border-border hover:border-primary/50 transition-all duration-300 rounded-3xl p-6 shadow-xl relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="text-muted-foreground hover:text-foreground p-1">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <div className="flex items-start gap-4 mb-6">
                                                    <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-600/5 border border-primary/20 flex items-center justify-center text-primary font-black text-xl shadow-lg">
                                                        {supplier.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-bold text-foreground truncate">{supplier.name}</h3>
                                                        {supplier.category ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider mt-1">
                                                                <Tag className="w-3 h-3" />
                                                                {supplier.category}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground mt-1 block">No category</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-3 mb-6">
                                                    {supplier.contactPerson && (
                                                        <div className="flex items-center gap-3 text-sm text-foreground/90">
                                                            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                            <span className="truncate">{supplier.contactPerson}</span>
                                                        </div>
                                                    )}
                                                    {supplier.email && (
                                                        <div className="flex items-center gap-3 text-sm text-foreground/90">
                                                            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                            <span className="truncate">{supplier.email}</span>
                                                        </div>
                                                    )}
                                                    {supplier.phone && (
                                                        <div className="flex items-center gap-3 text-sm text-foreground/90">
                                                            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                            <span>{supplier.phone}</span>
                                                        </div>
                                                    )}
                                                    {supplier.country && (
                                                        <div className="flex items-center gap-3 text-sm text-foreground/90">
                                                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                            <span className="truncate">{supplier.country}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {supplier.notes && (
                                                    <div className="pt-4 border-t border-border">
                                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <FileText className="w-3 h-3" />
                                                            Notes
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                            &quot;{supplier.notes}&quot;
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : null}

                        {activeTab === "importers" ? (
                            <>
                                <div className="mb-6 relative max-w-xl">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search importers by name, company, or country..."
                                        className="w-full bg-muted/50 border border-border rounded-2xl pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-all"
                                        value={importerQuery}
                                        onChange={(e) => setImporterQuery(e.target.value)}
                                    />
                                </div>

                                {importersLoading ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                        <p>Loading importer network...</p>
                                    </div>
                                ) : importers.length === 0 ? (
                                    <div className="bg-card border border-border rounded-3xl p-12 text-center max-w-2xl mx-auto mt-12">
                                        <Users2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                                        <h3 className="text-xl font-bold text-foreground mb-2">No importers found</h3>
                                        <p className="text-muted-foreground">Importers appear here automatically when they place orders.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
                                        {importers.map((importer) => (
                                            <div
                                                key={importer.id}
                                                className="group rounded-3xl border border-border bg-card p-6 shadow-xl transition-all duration-300 hover:border-primary/50"
                                            >
                                                <div className="mb-5 flex items-start gap-4">
                                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-xl font-black text-primary">
                                                        {(importer.companyName || importer.name || "I").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="truncate text-lg font-bold text-foreground">
                                                            {importer.companyName || importer.name || "Importer"}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            {importer.name || "Verified buyer"}
                                                            {importer.country ? ` · ${importer.country}` : ""}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mb-5 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-muted/30 p-3">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Orders</p>
                                                        <p className="mt-1 text-sm font-black text-foreground">{formatNumber(importer.orderCount)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Value</p>
                                                        <p className="mt-1 text-sm font-black text-emerald-400">{formatCurrency(importer.totalValue)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last</p>
                                                        <p className="mt-1 text-xs font-black text-foreground">
                                                            {importer.lastOrderAt ? timeAgo(importer.lastOrderAt) : "-"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => openMessageWorkspace(importer.id)}
                                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-foreground transition-colors hover:bg-muted"
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                        Message
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            void callController.startCall({
                                                                target: { id: importer.id, name: importer.companyName || importer.name },
                                                                callType: "AUDIO",
                                                            })
                                                        }
                                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-emerald-400 transition-colors hover:bg-emerald-500/20"
                                                    >
                                                        <Waves className="h-4 w-4" />
                                                        Voice
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            void callController.startCall({
                                                                target: { id: importer.id, name: importer.companyName || importer.name },
                                                                callType: "VIDEO",
                                                            })
                                                        }
                                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-primary transition-colors hover:bg-primary/20"
                                                    >
                                                        <Video className="h-4 w-4" />
                                                        Video
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            openScheduleModal({
                                                                id: importer.id,
                                                                name: importer.name,
                                                                companyName: importer.companyName,
                                                            })
                                                        }
                                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-foreground transition-colors hover:bg-muted"
                                                    >
                                                        <CalendarClock className="h-4 w-4" />
                                                        Schedule
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : null}

                        {activeTab === "messages" ? (
                            <MessagesWorkspace initialUserId={selectedMessageUserId} fullHeight={false} />
                        ) : null}

                        {activeTab === "calls" ? (
                            <CallDeskPanel controller={callController} title="Exporter Live Call Desk" />
                        ) : null}
                    </motion.div>
                </AnimatePresence>
            </div>

            <ScheduleCallModal
                open={isScheduleModalOpen}
                onOpenChange={setIsScheduleModalOpen}
                receiver={scheduleTarget}
                onScheduled={() => {
                    setActiveTab("calls");
                    toast.success("Call request sent. Track it in your call desk.");
                }}
            />

            {callController.phase === "in-call" && activeTab !== "calls" ? (
                <button
                    onClick={() => setActiveTab("calls")}
                    className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3 text-xs font-black uppercase tracking-widest text-emerald-300 shadow-2xl shadow-emerald-500/20"
                >
                    <CheckCircle2 className="h-4 w-4" />
                    Call In Progress
                </button>
            ) : null}

            {/* Add Dealer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-background border border-border w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b border-border bg-muted/80 backdrop-blur-md flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-foreground">Add New Dealer</h3>
                                <p className="text-muted-foreground text-sm mt-1">Record the details of your service provider or supplier.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSupplier} className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <Building2 className="w-3.5 h-3.5" />
                                        Company Name*
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                        placeholder="e.g. Acme Manufacturing"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" />
                                        Contact Person
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                        placeholder="e.g. John Doe"
                                        value={formData.contactPerson}
                                        onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                        placeholder="supplier@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                        placeholder="+91 00000 00000"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                        placeholder="e.g. India, UAE"
                                        value={formData.country}
                                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <Tag className="w-3.5 h-3.5" />
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                        placeholder="e.g. Logistics, Packaging"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" />
                                    Notes
                                </label>
                                <textarea
                                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 min-h-[100px]"
                                    placeholder="Payment terms, quality ratings, or other notes..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-muted hover:bg-muted/80 text-foreground rounded-2xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black shadow-xl shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                                    Save Dealer Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
