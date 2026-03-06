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
        "w-full px-4 py-2.5 bg-[#151c2a]/60 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all";
    const labelClass = "block text-sm font-semibold text-slate-300 mb-1.5";
    const errorClass = "text-xs text-red-400 mt-1";

    return (
        <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
            {/* Header */}
            <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/exporter/inventory"
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white">
                            {isEdit ? "Edit Product" : "Add New Product"}
                        </h1>
                        <p className="text-slate-400 text-sm mt-0.5">
                            {isEdit ? "Update your product listing details" : "Create a new product listing for importers"}
                        </p>
                    </div>
                </div>
            </header>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
                    {/* Basic Info */}
                    <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 space-y-5">
                        <h2 className="text-lg font-bold text-white">Basic Information</h2>

                        <div>
                            <label htmlFor="name" className={labelClass}>Product Name *</label>
                            <input
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Organic Basmati Rice"
                                className={inputClass}
                            />
                            {errors.name && <p className={errorClass}>{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="category" className={labelClass}>Category *</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className={inputClass + " appearance-none"}
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="originCountry" className={labelClass}>Origin Country *</label>
                                <input
                                    id="originCountry"
                                    name="originCountry"
                                    value={form.originCountry}
                                    onChange={handleChange}
                                    placeholder="e.g. India"
                                    className={inputClass}
                                />
                                {errors.originCountry && <p className={errorClass}>{errors.originCountry}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className={labelClass}>Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe your product in detail (min 20 characters)..."
                                rows={4}
                                className={inputClass + " resize-none"}
                            />
                            {errors.description && <p className={errorClass}>{errors.description}</p>}
                        </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 space-y-5">
                        <h2 className="text-lg font-bold text-white">Pricing & Stock</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div>
                                <label htmlFor="price" className={labelClass}>Unit Price (USD) *</label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.price || ""}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className={inputClass}
                                />
                                {errors.price && <p className={errorClass}>{errors.price}</p>}
                            </div>
                            <div>
                                <label htmlFor="minOrderQty" className={labelClass}>Min Order Qty *</label>
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
                                <label htmlFor="unit" className={labelClass}>Unit *</label>
                                <input
                                    id="unit"
                                    name="unit"
                                    value={form.unit}
                                    onChange={handleChange}
                                    placeholder="e.g. kg, pcs, tons"
                                    className={inputClass}
                                />
                                {errors.unit && <p className={errorClass}>{errors.unit}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="hsCode" className={labelClass}>HS Code (Optional)</label>
                            <input
                                id="hsCode"
                                name="hsCode"
                                value={form.hsCode}
                                onChange={handleChange}
                                placeholder="e.g. 1006.30"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 space-y-5">
                        <h2 className="text-lg font-bold text-white">Product Images</h2>
                        <p className="text-sm text-slate-400 -mt-3">Add image URLs for your product. At least one is required.</p>

                        {/* Existing images */}
                        {form.images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {form.images.map((url, i) => (
                                    <div key={i} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-square bg-slate-800">
                                        <img src={url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add image input */}
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <ImagePlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
                                    placeholder="Paste image URL and click Add..."
                                    className={inputClass + " pl-10"}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addImage}
                                className="px-4 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                        {errors.images && <p className={errorClass}>{errors.images}</p>}
                    </div>

                    {/* Certifications */}
                    <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 space-y-5">
                        <h2 className="text-lg font-bold text-white">Certifications (Optional)</h2>

                        {form.certifications.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {form.certifications.map((cert, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-sm text-slate-300">
                                        {cert}
                                        <button type="button" onClick={() => removeCertification(i)} className="text-slate-500 hover:text-red-400">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <input
                                value={newCertification}
                                onChange={(e) => setNewCertification(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCertification(); } }}
                                placeholder="e.g. ISO 9001, USDA Organic..."
                                className={inputClass}
                            />
                            <button
                                type="button"
                                onClick={addCertification}
                                className="px-4 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4 pb-8">
                        <Link
                            href="/dashboard/exporter/inventory"
                            className="px-6 py-2.5 text-slate-400 hover:text-white font-semibold transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 bg-primary hover:bg-[#0f49bd] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-8 rounded-xl shadow-lg shadow-primary/20 transition-colors"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {isEdit ? "Save Changes" : "Create Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
