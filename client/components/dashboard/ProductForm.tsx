"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, X, ImagePlus } from "lucide-react";
import { authFetch } from "@/lib/api-utils";
import Link from "next/link";
import { toast } from "sonner";

const CATEGORIES = [
    { value: "CHEMICALS", label: "Chemicals" },
    { value: "MACHINES", label: "Machines" },
    { value: "TEXTILES", label: "Textiles" },
    { value: "MEDICAL", label: "Medical" },
    { value: "HANDICRAFTS", label: "Handicrafts" },
    { value: "FOOD", label: "Food" },
    { value: "ELECTRONICS", label: "Electronics" },
    { value: "AUTOMOTIVE", label: "Automotive" },
    { value: "CONSTRUCTION", label: "Construction" },
    { value: "AGRICULTURE", label: "Agriculture" },
    { value: "OTHER", label: "Other" },
];

type ProductData = {
    id?: string;
    name: string;
    category: string;
    description: string;
    price: number;
    minOrderQty: number;
    unit: string;
    originCountry: string;
    hsCode: string;
    images: string[];
    certifications: string[];
    available?: boolean;
};

const defaultProduct: ProductData = {
    name: "",
    category: "OTHER",
    description: "",
    price: 0,
    minOrderQty: 1,
    unit: "kg",
    originCountry: "",
    hsCode: "",
    images: [],
    certifications: [],
};

export default function ProductForm({
    initialData,
    isEdit = false,
}: {
    initialData?: ProductData;
    isEdit?: boolean;
}) {
    const router = useRouter();
    const [form, setForm] = useState<ProductData>(initialData || defaultProduct);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [newImageUrl, setNewImageUrl] = useState("");
    const [newCertification, setNewCertification] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setErrors((prev) => ({ ...prev, [name]: "" }));

        if (type === "number") {
            setForm((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const addImage = () => {
        const url = newImageUrl.trim();
        if (!url) return;
        try {
            new URL(url);
        } catch {
            setErrors((prev) => ({ ...prev, images: "Please enter a valid URL" }));
            return;
        }
        setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
        setNewImageUrl("");
        setErrors((prev) => ({ ...prev, images: "" }));
    };

    const removeImage = (index: number) => {
        setForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const addCertification = () => {
        const cert = newCertification.trim();
        if (!cert) return;
        setForm((prev) => ({ ...prev, certifications: [...prev.certifications, cert] }));
        setNewCertification("");
    };

    const removeCertification = (index: number) => {
        setForm((prev) => ({
            ...prev,
            certifications: prev.certifications.filter((_, i) => i !== index),
        }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!form.name || form.name.length < 3) newErrors.name = "Name must be at least 3 characters";
        if (!form.description || form.description.length < 20)
            newErrors.description = "Description must be at least 20 characters";
        if (!form.price || form.price <= 0) newErrors.price = "Price must be positive";
        if (!form.minOrderQty || form.minOrderQty <= 0) newErrors.minOrderQty = "MOQ must be positive";
        if (!form.unit) newErrors.unit = "Unit is required";
        if (!form.originCountry || form.originCountry.length < 2)
            newErrors.originCountry = "Origin country is required";
        if (form.images.length === 0) newErrors.images = "At least one image URL is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setIsSubmitting(true);

            const apiUrl = isEdit ? `/api/products/${form.id}` : "/api/products";
            const method = isEdit ? "PUT" : "POST";

            const body = {
                name: form.name,
                category: form.category,
                description: form.description,
                price: form.price,
                minOrderQty: form.minOrderQty,
                unit: form.unit,
                originCountry: form.originCountry,
                hsCode: form.hsCode || undefined,
                images: form.images,
                certifications: form.certifications,
            };

            await authFetch(apiUrl, {
                method,
                body: JSON.stringify(body),
            });

            toast.success(isEdit ? "Product updated successfully!" : "Product created successfully!");
            router.push("/dashboard/exporter/inventory");
            router.refresh();
        } catch (e: any) {
            toast.error(e.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass =
        "w-full px-5 py-4 bg-slate-900/60 border border-white/5 focus:border-primary/50 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all shadow-inner";
    const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1";
    const errorClass = "text-[10px] font-bold text-red-400 mt-1.5 ml-1 uppercase tracking-wider";

    return (
        <div className="h-full overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
            {/* Header */}
            <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
                <div className="flex items-center gap-6 max-w-5xl mx-auto w-full">
                    <Link
                        href="/dashboard/exporter/inventory"
                        className="p-3 bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all shadow-xl active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                            {isEdit ? "Edit Product" : "New Listing"}
                        </h1>
                        <p className="text-slate-400 text-sm mt-0.5 font-medium">
                            {isEdit ? "Update your global market presence" : "Feature your products to buyers worldwide"}
                        </p>
                    </div>
                </div>
            </header>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">

                    {/* Left Column: Main Specs */}
                    <div className="lg:col-span-12 xl:col-span-8 space-y-8">
                        {/* Basic Info */}
                        <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-32 -mt-32 group-hover:bg-primary/10 transition-colors pointer-events-none" />

                            <h2 className="text-sm font-black text-white tracking-[0.25em] uppercase opacity-50 mb-4 italic">Core Specifications</h2>

                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="name" className={labelClass}>Market Identity (Product Name) *</label>
                                    <input
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Premium Grade Organic Saffron"
                                        className={inputClass}
                                    />
                                    {errors.name && <p className={errorClass}>{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="category" className={labelClass}>Industry Sector *</label>
                                        <div className="relative">
                                            <select
                                                id="category"
                                                name="category"
                                                value={form.category}
                                                onChange={handleChange}
                                                className={inputClass + " appearance-none cursor-pointer"}
                                            >
                                                {CATEGORIES.map((c) => (
                                                    <option key={c.value} value={c.value}>{c.label}</option>
                                                ))}
                                            </select>
                                            <Plus className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none rotate-45" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="originCountry" className={labelClass}>Geographic Origin *</label>
                                        <input
                                            id="originCountry"
                                            name="originCountry"
                                            value={form.originCountry}
                                            onChange={handleChange}
                                            placeholder="e.g. Casablanca, Morocco"
                                            className={inputClass}
                                        />
                                        {errors.originCountry && <p className={errorClass}>{errors.originCountry}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="description" className={labelClass}>Global Buyer Description *</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Highlight key features, quality benchmarks, and usage scenarios..."
                                        rows={6}
                                        className={inputClass + " resize-none py-5"}
                                    />
                                    {errors.description && <p className={errorClass}>{errors.description}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
                            <h2 className="text-sm font-black text-white tracking-[0.25em] uppercase opacity-50 mb-4 italic">Trade Economics</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="price" className={labelClass}>FOB Price (USD) *</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                        <input
                                            id="price"
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={form.price || ""}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className={inputClass + " pl-10"}
                                        />
                                    </div>
                                    {errors.price && <p className={errorClass}>{errors.price}</p>}
                                </div>
                                <div>
                                    <label htmlFor="minOrderQty" className={labelClass}>MOQ Threshold *</label>
                                    <input
                                        id="minOrderQty"
                                        name="minOrderQty"
                                        type="number"
                                        min="1"
                                        value={form.minOrderQty || ""}
                                        onChange={handleChange}
                                        placeholder="1"
                                        className={inputClass}
                                    />
                                    {errors.minOrderQty && <p className={errorClass}>{errors.minOrderQty}</p>}
                                </div>
                                <div>
                                    <label htmlFor="unit" className={labelClass}>Base Unit *</label>
                                    <input
                                        id="unit"
                                        name="unit"
                                        value={form.unit}
                                        onChange={handleChange}
                                        placeholder="e.g. MT, Kg, Lot"
                                        className={inputClass}
                                    />
                                    {errors.unit && <p className={errorClass}>{errors.unit}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="hsCode" className={labelClass}>Harmonized (HS) Code</label>
                                <input
                                    id="hsCode"
                                    name="hsCode"
                                    value={form.hsCode}
                                    onChange={handleChange}
                                    placeholder="e.g. 0910.20.00"
                                    className={inputClass}
                                />
                                <p className="text-[9px] text-slate-500 mt-2 ml-1 italic font-medium uppercase tracking-wider">Crucial for international customs processing</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visuals & Certs */}
                    <div className="lg:col-span-12 xl:col-span-4 space-y-8">
                        {/* Visual Assets */}
                        <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2.5rem] p-8 space-y-6">
                            <h2 className="text-[11px] font-black text-white tracking-[0.25em] uppercase opacity-50 italic">Asset Gallery</h2>

                            {/* Previews */}
                            <div className="grid grid-cols-2 gap-3">
                                {form.images.map((url, i) => (
                                    <div key={i} className="relative group rounded-2xl overflow-hidden border border-white/5 aspect-square bg-slate-900 shadow-xl">
                                        <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90 shadow-2xl"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                                {form.images.length < 4 && (
                                    <div className="rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center aspect-square text-slate-600 bg-white/[0.02]">
                                        <ImagePlus className="w-6 h-6 mb-2 opacity-20" />
                                        <span className="text-[8px] font-black tracking-widest uppercase opacity-40">Add Image</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className={labelClass}>New Media URL</label>
                                <div className="flex gap-2">
                                    <input
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        placeholder="https://..."
                                        className={inputClass + " py-3 text-xs"}
                                    />
                                    <button
                                        type="button"
                                        onClick={addImage}
                                        className="h-11 px-4 bg-primary hover:bg-[#0f49bd] text-white rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                {errors.images && <p className={errorClass}>{errors.images}</p>}
                            </div>
                        </div>

                        {/* Professional Certs */}
                        <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2.5rem] p-8 space-y-6">
                            <h2 className="text-[11px] font-black text-white tracking-[0.25em] uppercase opacity-50 italic">Trust Markers</h2>

                            <div className="flex flex-wrap gap-2">
                                {form.certifications.map((cert, i) => (
                                    <span key={i} className="px-3 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                        {cert}
                                        <button type="button" onClick={() => removeCertification(i)} className="hover:text-white transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    value={newCertification}
                                    onChange={(e) => setNewCertification(e.target.value)}
                                    placeholder="e.g. ISO 22000"
                                    className={inputClass + " py-3 text-xs"}
                                />
                                <button
                                    type="button"
                                    onClick={addCertification}
                                    className="h-11 px-4 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 rounded-xl shadow-xl transition-all active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Status Guard */}
                        <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
                            <Save className="w-10 h-10 text-primary mb-4 opacity-30" />
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Listing Protocols</p>
                            <ul className="text-[10px] text-slate-500 mt-4 space-y-2 italic font-medium leading-relaxed">
                                <li>• Prices should be in USD.</li>
                                <li>• Weights must use metric units.</li>
                                <li>• Quality images increase buyer trust.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Final Action */}
                    <div className="lg:col-span-12 flex items-center justify-between bg-[#151c2a]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 mt-4 sticky bottom-8 shadow-[0_-15px_40px_rgba(0,0,0,0.5)] z-20">
                        <div className="hidden sm:block">
                            <p className="text-white font-black text-xs uppercase tracking-widest">{isEdit ? "Update Existing Asset" : "Deploy New Asset"}</p>
                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-1 italic">Authorized Listing Procedure (ALP-1)</p>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <Link
                                href="/dashboard/exporter/inventory"
                                className="flex-1 sm:flex-none px-10 py-4 text-slate-500 border border-white/5 hover:text-white hover:bg-white/5 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all"
                            >
                                Abort
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none relative group px-12 py-4 bg-primary hover:bg-[#0f49bd] disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {isEdit ? "Commit Updates" : "Deploy Listing"}
                                </span>
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
