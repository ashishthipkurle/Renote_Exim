"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, Save, Loader2, Plus, X, 
  Info, Image as ImageIcon, Tag, 
  DollarSign, Package, Globe, ShieldCheck,
  LayoutGrid, FileText
} from "lucide-react";
import { authFetch } from "@/lib/api-utils";
import Link from "next/link";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";
import { useTranslation } from "@/lib/i18n/client";
import { motion } from "framer-motion";

const CATEGORIES = [
  { value: "AGRICULTURE", label: "Agriculture & Farming", icon: Globe },
  { value: "TEXTILES", label: "Textiles & Apparel", icon: Tag },
  { value: "CHEMICALS", label: "Chemicals & Raw Materials", icon: ShieldCheck },
  { value: "MACHINES", label: "Machinery & Equipment", icon: Package },
  { value: "MEDICAL", label: "Medical & Pharmaceuticals", icon: ShieldCheck },
  { value: "FOOD", label: "Food & Beverages", icon: LayoutGrid },
  { value: "ELECTRONICS", label: "Electronics & Tech", icon: LayoutGrid },
  { value: "AUTOMOTIVE", label: "Automotive & Parts", icon: LayoutGrid },
  { value: "CONSTRUCTION", label: "Construction", icon: LayoutGrid },
  { value: "HANDICRAFTS", label: "Handicrafts & Decor", icon: Tag },
  { value: "COSMETICS", label: "Cosmetics & Care", icon: Tag },
  { value: "OTHER", label: "Other (Custom...)", icon: Plus },
];

type ProductData = {
  id?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  regularPrice: number;
  minOrderQty: number;
  unit: string;
  originCountry: string;
  hsCode: string;
  images: string[];
  certifications: string[];
  quantity: number;
  available?: boolean;
};

const defaultProduct: ProductData = {
  name: "",
  category: "OTHER",
  description: "",
  price: 0,
  regularPrice: 0,
  minOrderQty: 1,
  unit: "kg",
  originCountry: "",
  hsCode: "",
  images: [],
  certifications: [],
  quantity: 0,
};

const VALID_CATEGORIES = new Set([
  "CHEMICALS", "MACHINES", "TEXTILES", "MEDICAL", "HANDICRAFTS",
  "FOOD", "ELECTRONICS", "AUTOMOTIVE", "CONSTRUCTION", "AGRICULTURE", 
  "COSMETICS", "PLASTICS", "ENERGY", "LOGISTICS", "PACKAGING", 
  "METALS", "LEATHER", "FURNITURE", "TOYS", "SPORTS", "OTHER",
]);

function normalizeCategory(value: string | null): string {
  if (!value) return "OTHER";
  const upper = value.trim().toUpperCase();
  if (VALID_CATEGORIES.has(upper)) return upper;
  
  // Explicit mapping for common mismatches
  if (upper === "MACHINERY" || upper === "MACHINES & EQUIPMENT" || upper === "MACHINE") {
    return "MACHINES";
  }

  return "OTHER";
}

export default function ProductForm({
  initialData,
  isEdit = false,
  hideHeader = false,
}: {
  initialData?: ProductData;
  isEdit?: boolean;
  hideHeader?: boolean;
}) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [form, setForm] = useState<ProductData>(() => {
    if (initialData) return initialData;
    const cat = searchParams.get("category");
    return {
      ...defaultProduct,
      category: normalizeCategory(cat),
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newCertification, setNewCertification] = useState("");
  const [customCategory, setCustomCategory] = useState("");

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
    if (!form.name || form.name.length < 3) newErrors.name = "Product name is too short";
    if (!form.description || form.description.length < 20)
      newErrors.description = "Description should be more detailed (min 20 chars)";
    if (!form.price || form.price <= 0) newErrors.price = "Price is required";
    if (!form.minOrderQty || form.minOrderQty <= 0) newErrors.minOrderQty = "MOQ must be at least 1";
    if (!form.unit) newErrors.unit = "Unit is required";
    if (!form.originCountry) newErrors.originCountry = "Origin country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please check the form for errors");
      return;
    }

    try {
      setIsSubmitting(true);
      const apiUrl = isEdit ? `/api/products/${form.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const finalCategory = form.category === "OTHER" ? (customCategory || "OTHER") : form.category;
      
      const body = {
        ...form,
        category: finalCategory,
      };

      await authFetch(apiUrl, {
        method,
        body: JSON.stringify(body),
      });

      toast.success(isEdit ? "Product updated successfully!" : "Product listed successfully!");
      router.push("/dashboard/exporter/inventory");
      router.refresh();
    } catch (e: any) {
      if (e.details) {
        const issues = e.details;
        toast.error(`Validation failed: ${issues[0]?.message || 'Check form fields'}`);
      } else if (e.response?.data?.details) {
        const issues = e.response.data.details;
        toast.error(`Validation failed: ${issues[0]?.message || 'Check form fields'}`);
      } else {
        toast.error(e.message || "Failed to save product");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm";
  const sectionClass = "bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden mb-6";
  const labelClass = "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2";

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto pb-20">
      {/* Header section */}
      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/exporter/inventory"
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isEdit ? "Edit Product Listing" : "Create New Listing"}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Fill in the details below to reach global buyers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? "Update Product" : "Publish Listing"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic Information */}
          <div className={sectionClass}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Basic Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className={labelClass}>Product Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Premium Grade Arabica Coffee Beans"
                  className={inputClass}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Origin Country *</label>
                  <input
                    name="originCountry"
                    value={form.originCountry}
                    onChange={handleChange}
                    placeholder="e.g. Ethiopia"
                    className={inputClass}
                  />
                  {errors.originCountry && <p className="text-xs text-red-500 mt-1">{errors.originCountry}</p>}
                </div>
              </div>

              {form.category === "OTHER" && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className={labelClass}>Specify Custom Category</label>
                  <input
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Rare Spices"
                    className={inputClass}
                  />
                </motion.div>
              )}

              <div>
                <label className={labelClass}>Product Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your product's key features, quality, and specifications..."
                  rows={6}
                  className={inputClass + " resize-none"}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className={sectionClass}>
             <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Pricing & Inventory</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className={labelClass}>Regular Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      name="regularPrice"
                      type="number"
                      value={form.regularPrice || ""}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={inputClass + " pl-8"}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Bulk/FOB Price (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      name="price"
                      type="number"
                      value={form.price || ""}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={inputClass + " pl-8 border-primary/30"}
                    />
                  </div>
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                  <label className={labelClass}>MOQ (Min Order)</label>
                  <input
                    name="minOrderQty"
                    type="number"
                    value={form.minOrderQty || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Unit</label>
                  <input
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    placeholder="e.g. Metric Tons"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Stock Available</label>
                  <input
                    name="quantity"
                    type="number"
                    value={form.quantity || 0}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Extra Specifications */}
          <div className={sectionClass}>
             <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Compliance & Trust</h2>
            </div>
            <div className="p-6 space-y-6">
               <div>
                <label className={labelClass}>HS Code (Harmonized System)</label>
                <div className="flex gap-2">
                  <input
                    name="hsCode"
                    value={form.hsCode}
                    onChange={handleChange}
                    placeholder="e.g. 0901.11"
                    className={inputClass}
                  />
                   <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg text-slate-400" title="The Harmonized System is a standardized numerical method of classifying traded products.">
                    <Info className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Certifications</label>
                <div className="flex gap-2 mb-4">
                  <input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="e.g. ISO 9001, Organic Certified"
                    className={inputClass}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  />
                  <button
                    type="button"
                    onClick={addCertification}
                    className="px-4 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.certifications.map((cert, i) => (
                    <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                      {cert}
                      <X className="w-3 h-3 cursor-pointer hover:scale-125 transition-transform" onClick={() => removeCertification(i)} />
                    </span>
                  ))}
                  {form.certifications.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No certifications added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Media Section */}
          <div className={sectionClass}>
             <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Product Media</h2>
            </div>
            <div className="p-6">
              <ImageUploader
                images={form.images}
                onChange={(urls) => setForm(prev => ({ ...prev, images: urls }))}
                maxFiles={5}
              />
              <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                <Info className="w-3 h-3 inline-block mr-1 mb-0.5" />
                Upload up to 5 high-quality images. Recommended size: 1000x1000px.
              </p>
            </div>
          </div>

          {/* Quick Stats/Info Card */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
            <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Listing Quality
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500">Completeness</span>
                  <span className="text-primary">85%</span>
                </div>
                <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[85%]" />
                </div>
              </div>
              <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  Detailed descriptions increase buyer interest by 40%
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  Adding HS codes speeds up customs clearance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {hideHeader && (
        <div className="mt-8 flex items-center justify-end gap-4 border-t border-slate-200 dark:border-white/10 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? "Update Product" : "Publish Listing"}
            </button>
        </div>
      )}
    </form>
  );
}
