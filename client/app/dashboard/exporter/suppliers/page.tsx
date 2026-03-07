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
    FileText
} from "lucide-react";
import { authFetch } from "@/lib/api-utils";
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
            console.error(error);
            toast.error("Failed to load dealers");
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
                fetchSuppliers();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to add dealer");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="h-full overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
            <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            <Handshake className="text-primary w-8 h-8" />
                            Dealer Directory
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Manage your network of suppliers and product sources.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Add New Dealer
                    </button>
                </div>

                <div className="mt-8 relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search dealers by name, category, or contact..."
                        className="w-full bg-[#151c2a]/60 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        <p>Loading your directory...</p>
                    </div>
                ) : filteredSuppliers.length === 0 ? (
                    <div className="bg-[#151c2a]/40 border border-white/5 rounded-3xl p-12 text-center max-w-2xl mx-auto mt-12">
                        <Handshake className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-white mb-2">No dealers found</h3>
                        <p className="text-slate-400 mb-8">
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
                                className="group bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 hover:border-primary/30 transition-all duration-300 rounded-3xl p-6 shadow-xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-slate-500 hover:text-white p-1">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex items-start gap-4 mb-6">
                                    <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-600/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl shadow-lg">
                                        {supplier.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-white truncate">{supplier.name}</h3>
                                        {supplier.category ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider mt-1">
                                                <Tag className="w-3 h-3" />
                                                {supplier.category}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-500 italic mt-1 block">No category</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {supplier.contactPerson && (
                                        <div className="flex items-center gap-3 text-sm text-slate-300">
                                            <User className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                            <span className="truncate">{supplier.contactPerson}</span>
                                        </div>
                                    )}
                                    {supplier.email && (
                                        <div className="flex items-center gap-3 text-sm text-slate-300">
                                            <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                            <span className="truncate">{supplier.email}</span>
                                        </div>
                                    )}
                                    {supplier.phone && (
                                        <div className="flex items-center gap-3 text-sm text-slate-300">
                                            <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                            <span>{supplier.phone}</span>
                                        </div>
                                    )}
                                    {supplier.country && (
                                        <div className="flex items-center gap-3 text-sm text-slate-300">
                                            <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                            <span className="truncate">{supplier.country}</span>
                                        </div>
                                    )}
                                </div>

                                {supplier.notes && (
                                    <div className="pt-4 border-t border-white/5">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <FileText className="w-3 h-3" />
                                            Notes
                                        </div>
                                        <p className="text-xs text-slate-400 line-clamp-2 italic leading-relaxed">
                                            &quot;{supplier.notes}&quot;
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Dealer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-md">
                    <div className="bg-[#151c2a] border border-white/10 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-white">Add New Dealer</h3>
                                <p className="text-slate-400 text-sm mt-1">Record the details of your service provider or supplier.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSupplier} className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <Building2 className="w-3.5 h-3.5" />
                                        Company Name*
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-slate-700"
                                        placeholder="e.g. Acme Manufacturing"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" />
                                        Contact Person
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-slate-700"
                                        placeholder="e.g. John Doe"
                                        value={formData.contactPerson}
                                        onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-slate-700"
                                        placeholder="supplier@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-slate-700"
                                        placeholder="+91 00000 00000"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-slate-700"
                                        placeholder="e.g. India, UAE"
                                        value={formData.country}
                                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <Tag className="w-3.5 h-3.5" />
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-slate-700"
                                        placeholder="e.g. Logistics, Packaging"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" />
                                    Notes
                                </label>
                                <textarea
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-slate-700 min-h-[100px]"
                                    placeholder="Payment terms, quality ratings, or other notes..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all"
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
