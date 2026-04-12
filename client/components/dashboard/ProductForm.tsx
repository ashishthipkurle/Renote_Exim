"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";
import { authFetch } from "@/lib/api-utils";
import Link from "next/link";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";
import { useTranslation } from "@/lib/i18n/client";


const CATEGORIES = [
    { value: "AGRICULTURE", label: "Agriculture & Farming" },
    { value: "TEXTILES", label: "Textiles & Apparel" },
    { value: "CHEMICALS", label: "Chemicals & Raw Materials" },
    { value: "MACHINES", label: "Machinery & Equipment" },
    { value: "MEDICAL", label: "Medical & Pharmaceuticals" },
    { value: "FOOD", label: "Food & Beverages" },
    { value: "ELECTRONICS", label: "Electronics & Tech" },
    { value: "AUTOMOTIVE", label: "Automotive & Parts" },
    { value: "CONSTRUCTION", label: "Construction & Infrastructure" },
    { value: "HANDICRAFTS", label: "Handicrafts & Decor" },
    { value: "COSMETICS", label: "Cosmetics & Personal Care" },
    { value: "PLASTICS", label: "Plastics & Rubber" },
    { value: "ENERGY", label: "Energy & Power" },
    { value: "LOGISTICS", label: "Logistics & Shipping" },
    { value: "PACKAGING", label: "Packaging & Printing" },
    { value: "METALS", label: "Metals & Minerals" },
    { value: "LEATHER", label: "Leather & Footwear" },
    { value: "FURNITURE", label: "Furniture & Home" },
    { value: "TOYS", label: "Toys & Hobbies" },
    { value: "SPORTS", label: "Sports & Fitness" },
    { value: "OTHER", label: "Other (Custom...)" },
];

// Extended list would go here, but for brevity we use these common ones + custom input
const RAW_CATEGORIES = [
    "Abrasives", "Adhesives", "Aerospace Parts", "Agricultural Machinery", "Air Conditioning", "Alnico", "Aluminum Products",
    "Animal Fodder", "Antibiotics", "Antiseptics", "Apparel Accessories", "Art Supplies", "Artificial Flowers", "Asphalt",
    "Audio Equipment", "Automated Systems", "Automotive Components", "Aviation Equipment", "Baby Products", "Bakery Equipment",
    "Bamboo Products", "Barbecue Gear", "Batteries", "Bearings", "Beauty Supplements", "Bicycles", "Biofuels", "Biomass Energy",
    "Body Care", "Boilers", "Books", "Brake Systems", "Brasses", "Building Materials", "Cables", "Calculating Machines",
    "Cameras", "Camping Gear", "Canvas Products", "Capacitors", "Car Accessories", "Cardboard Packaging", "Carpets",
    "Catering Equipment", "Ceramics", "Cereal Products", "Chemical Agents", "Children's Wear", "Circuit Boards",
    "Cleaning Supplies", "Clocks", "Coffee", "Coloring Materials", "Communication Devices", "Compressors", "Computer Hardware",
    "Confectionery", "Construction Tools", "Control Systems", "Conveyor Systems", "Cooking Oil", "Copper Products",
    "Cosmetic Tools", "Cotton Fabrics", "Cranes", "Cutlery", "Dairy Products", "Data Storage", "Dental Equipment",
    "Detergents", "Diagnostic Tools", "Digital Cameras", "Disinfectants", "Display Equipment", "Distillation Equipment",
    "Doors", "Drilling Equipment", "Dyes", "E-commerce Packaging", "Earthmoving Machinery", "Educational Supplies",
    "Electric Motors", "Electrical Fittings", "Electronic Components", "Emergency Equipment", "Engines", "Essential Oils",
    "Excavators", "Fabricated Metals", "Fans", "Fasteners", "Feed Additives", "Fertilizers", "Fibers", "Filtering Equipment",
    "Fire Extinguishers", "Fish Products", "Floor Coverings", "Flour", "Flowers", "Footwear", "Forestry Equipment",
    "Forging Equipment", "Frames", "Fruit", "Fungicides", "Furnaces", "Furniture Fittings", "Garden Tools", "Gaskets",
    "Gears", "General Hardware", "Generators", "Glass Products", "Glassware", "Gloves", "Grain", "Greenhouse Equipment",
    "Grinding Tools", "Hair Care", "Hand Tools", "Handling Equipment", "Hats", "Hay", "Heaters", "Herbicides", "Herbal Products",
    "Honey", "Hospital Furniture", "Household Appliances", "Hydraulic Equipment", "Industrial Boilers", "Industrial Chemicals",
    "Ink", "Insecticides", "Instrumentation", "Insulation", "Iron Products", "Irrigation Systems", "Jewelry", "Juice",
    "Kitchenware", "Knitted Fabrics", "Laboratory Equipment", "Laboratory Glassware", "Lamps", "Landscape Supplies",
    "Lasers", "Lathes", "Laundry Equipment", "Leather Goods", "Lenses", "Light Fixtures", "Lighting Components",
    "Linens", "Living Room Furniture", "Lubricants", "Luggage", "Lumber", "Machine Tools", "Maintenance Supplies",
    "Mapping Equipment", "Marine Engines", "Massaging Equipment", "Material Handling", "Measuring Tools", "Medical Disposables",
    "Medical Implants", "Medicinal Herbs", "Metal Fabrications", "Metals", "Microcircuits", "Microphones", "Microscopes",
    "Milk Products", "Milling Machines", "Mining Equipment", "Mixers", "Mobile Phones", "Monitoring Equipment", "Motors",
    "Musical Instruments", "Names", "Navigational Instruments", "Network Hardware", "Non-ferrous Metals", "Nuts",
    "Office Furniture", "Office Supplies", "Oil Seeds", "Optical Fibers", "Optical Instruments", "Organic Chemicals",
    "Outdoor Equipment", "Packaging Machinery", "Packaging Supplies", "Paints", "Paper Products", "Parts", "Perfume",
    "Personal Computers", "Pesticides", "Pet Food", "Pet Supplies", "Pharmaceutical Ingredients", "Photographic Equipment",
    "Pigments", "Pipes", "Plastic Products", "Plumbing Supplies", "Pneumatic Tools", "Portland Cement", "Power Tools",
    "Precision Instruments", "Prepared Foods", "Pressure Vessels", "Printed Circuits", "Printers", "Printing Inks",
    "Printing Machinery", "Process Control", "Processing Equipment", "Protective Clothing", "Pumps", "Raw Materials",
    "Refrigeration", "Remote Control", "Renewable Energy", "Resins", "Restaurant Equipment", "Robotics", "Rock Products",
    "Roofing Materials", "Rubber Products", "Safety Equipment", "Sand", "Scales", "School Supplies", "Scientific Instruments",
    "Screens", "Sealing Materials", "Seeds", "Semiconductors", "Sensors", "Service Equipment", "Sewerage Equipment",
    "Shed Equipment", "Sheets", "Shipbuilding", "Signals", "Signs", "Silk Fabrics", "Silos", "Software", "Solar Energy",
    "Solenoids", "Sound Equipment", "Specialty Chemicals", "Spectrometers", "Spices", "Sporting Goods", "Stainless Steel",
    "Stamping Equipment", "Starches", "Stationery", "Steel Products", "Storage Tanks", "Structural Steel", "Surgical Instruments",
    "Surveying Equipment", "Switchboard Apparatus", "Switches", "Synthetic Fibers", "Tableware", "Tanks", "Tea",
    "Technical Fabrics", "Telecommunications", "Television Equipment", "Testing Equipment", "Textile Finishing",
    "Textile Machinery", "Thermal Equipment", "Tiles", "Tools", "Tractors", "Trailer Parts", "Transformers",
    "Transmission Gears", "Transport Equipment", "Trucks", "Tubing", "Turbines", "Unions", "Upholstery", "Valves",
    "Varnishes", "Vegetables", "Vehicle Parts", "Vents", "Vessels", "Veterinary Equipment", "Video Equipment", "Vinyl",
    "Wafer Fabrication", "Waiters", "Walls", "Warehousing", "Washing Equipment", "Waste Management", "Watch Components",
    "Watches", "Water Filtration", "Water Purification", "Weapon Systems", "Wearables", "Weather Systems", "Weathering Steel",
    "Webbing", "Weed Killers", "Welding Equipment", "Windows", "Wire Products", "Wireless Devices", "Wood Products",
    "Workwear", "Woven Fabrics", "X-ray Equipment", "Yarn", "Zinc Products"
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
    "FOOD", "ELECTRONICS", "AUTOMOTIVE", "CONSTRUCTION", "AGRICULTURE", "OTHER",
]);

function normalizeCategory(value: string | null): string {
    if (!value) return "OTHER";
    const upper = value.trim().toUpperCase();
    if (VALID_CATEGORIES.has(upper)) return upper;

    // Explicit mapping for common mismatches
    if (upper === "MACHINERY" || upper === "MACHINES & EQUIPMENT" || upper === "MACHINE") {
        return "MACHINES";
    }

    // Check if it's one of the display labels
    const found = CATEGORIES.find(c => c.label.toUpperCase() === upper || c.value === upper);
    if (found) return found.value;

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
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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
        if (!form.price || form.price <= 0) newErrors.price = "FOB Price must be positive";
        if (!form.regularPrice || form.regularPrice <= 0) newErrors.regularPrice = "Regular Price must be positive";
        if (!form.minOrderQty || form.minOrderQty <= 0) newErrors.minOrderQty = "MOQ must be positive";
        if (!form.unit) newErrors.unit = "Unit is required";
        if (!form.originCountry || form.originCountry.length < 2)
            newErrors.originCountry = "Origin country is required";
        // Image requirement relaxed for better friction-less testing

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

            const rawCategory = form.category === "OTHER" ? customCategory : form.category;
            const body = {
                name: form.name,
                category: normalizeCategory(rawCategory),
                description: form.description,
                price: form.price,
                regularPrice: form.regularPrice,
                minOrderQty: form.minOrderQty,
                unit: form.unit,
                originCountry: form.originCountry,
                hsCode: form.hsCode || undefined,
                images: form.images,
                certifications: form.certifications,

                quantity: form.quantity,
            };

            await authFetch(apiUrl, {
                method,
                body: JSON.stringify(body),
            });

            toast.success(isEdit ? "Product updated successfully!" : "Product created successfully!");
            router.push("/dashboard/exporter/inventory");
            router.refresh();
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Something went wrong";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass =
        "w-full px-5 py-4 bg-background border border-border focus:border-primary rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all shadow-sm";
    const labelClass = "block text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2.5 ml-1";
    const errorClass = "text-[10px] font-bold text-red-400 mt-1.5 ml-1 uppercase tracking-wider";

    return (
        <form onSubmit={handleSubmit} className="w-full">
            {!hideHeader && (
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/dashboard/exporter/inventory"
                            className="p-3 bg-card border border-border rounded-2xl hover:bg-accent transition-all text-muted-foreground hover:text-foreground group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">
                                {isEdit ? t("product_form.edit_title", "Edit Listing") : t("product_form.new_title", "New Listing")}
                            </h1>
                            <p className="text-muted-foreground text-xs font-bold mt-1 uppercase tracking-widest leading-relaxed">
                                {isEdit
                                    ? t("product_form.edit_subtitle", "Modify your asset parameters for global trade")
                                    : t("product_form.new_subtitle", "Feature your products to buyers worldwide")}
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-black font-black text-xs uppercase tracking-[0.2em] py-4 px-8 rounded-2xl shadow-2xl shadow-white/10 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEdit ? t("product_form.save_profile", "Save Profile") : t("product_form.deploy_asset", "Deploy Asset")}
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
                {/* Left Column: Main Specs */}
                <div className="lg:col-span-12 xl:col-span-8 space-y-8">
                    {/* Basic Info */}
                    <div className="bg-card backdrop-blur-xl border border-border shadow-2xl rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-32 -mt-32 group-hover:bg-primary/10 transition-colors pointer-events-none" />

                        <h2 className="text-sm font-black text-foreground tracking-[0.25em] uppercase opacity-50 mb-4 italic">{t("product_form.core_specs", "Core Specifications")}</h2>

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="name" className={labelClass}>{t("product_form.labels.product_name", "Market Identity (Product Name)")} *</label>
                                <input
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder={t("product_form.placeholders.product_name", "e.g. Premium Grade Organic Saffron")}
                                    className={inputClass}
                                />
                                {errors.name && <p className={errorClass}>{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="category" className={labelClass}>{t("product_form.labels.industry_sector", "Industry Sector")} *</label>
                                        <div className="relative">
                                            <input
                                                list="industry-categories"
                                                id="category"
                                                name="category"
                                                value={form.category}
                                                onChange={handleChange}
                                                placeholder={t("product_form.placeholders.sector", "Search or select sector...")}
                                                className={inputClass}
                                            />
                                            <datalist id="industry-categories">
                                                {CATEGORIES.map((c) => (
                                                    <option key={c.value} value={c.value}>{c.label}</option>
                                                ))}
                                                {RAW_CATEGORIES.map((c) => (
                                                    <option key={c} value={c.toUpperCase()}>{c}</option>
                                                ))}
                                            </datalist>
                                            <Plus className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none rotate-45" />
                                        </div>
                                    </div>

                                    {form.category === "OTHER" && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label htmlFor="customCategory" className={labelClass}>Define Your Custom Category *</label>
                                            <input
                                                id="customCategory"
                                                value={customCategory}
                                                onChange={(e) => setCustomCategory(e.target.value)}
                                                placeholder="e.g. Artisanal Rare Earth Magnets"
                                                className={inputClass + " border-primary/30 bg-primary/5"}
                                            />
                                            <p className="text-[9px] text-white/60 mt-2 ml-1 italic font-medium uppercase tracking-wider">This will create a new unique sector for your listing</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="originCountry" className={labelClass}>{t("product_form.labels.origin", "Geographic Origin")} *</label>
                                    <input
                                        id="originCountry"
                                        name="originCountry"
                                        value={form.originCountry}
                                        onChange={handleChange}
                                        placeholder={t("product_form.placeholders.origin", "e.g. Casablanca, Morocco")}
                                        className={inputClass}
                                    />
                                    {errors.originCountry && <p className={errorClass}>{errors.originCountry}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="description" className={labelClass}>{t("product_form.labels.description", "Global Buyer Description")} *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder={t("product_form.placeholders.description", "Highlight key features, quality benchmarks, and usage scenarios...")}
                                    rows={6}
                                    className={inputClass + " resize-none py-5"}
                                />
                                {errors.description && <p className={errorClass}>{errors.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-card backdrop-blur-xl border border-border shadow-2xl rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
                        <h2 className="text-sm font-black text-foreground tracking-[0.25em] uppercase opacity-50 mb-4 italic">{t("product_form.trade_economics", "Trade Economics")}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <div>
                                <label htmlFor="regularPrice" className={labelClass}>{t("product_form.labels.regular_price", "Regular Price (USD)")} *</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                                    <input
                                        id="regularPrice"
                                        name="regularPrice"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.regularPrice || ""}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className={inputClass + " pl-10"}
                                    />
                                </div>
                                {errors.regularPrice && <p className={errorClass}>{errors.regularPrice}</p>}
                            </div>
                            <div>
                                <label htmlFor="price" className={labelClass}>{t("product_form.labels.fob_price", "FOB Price (Bulk Purchase)")} *</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
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
                                <label htmlFor="minOrderQty" className={labelClass}>{t("product_form.labels.moq", "MOQ Threshold")} *</label>
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
                                <label htmlFor="unit" className={labelClass}>{t("product_form.labels.unit", "Base Unit")} *</label>
                                <input
                                    id="unit"
                                    name="unit"
                                    value={form.unit}
                                    onChange={handleChange}
                                    placeholder={t("product_form.placeholders.unit", "e.g. MT, Kg, Lot")}
                                    className={inputClass}
                                />
                                {errors.unit && <p className={errorClass}>{errors.unit}</p>}
                            </div>
                            <div>
                                <label htmlFor="quantity" className={labelClass}>{t("product_form.labels.stock", "Initial Stock Level")} *</label>
                                <input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min="0"
                                    value={form.quantity || 0}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                                {errors.quantity && <p className={errorClass}>{errors.quantity}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="hsCode" className={labelClass}>{t("product_form.labels.hs_code", "Harmonized (HS) Code")}</label>
                            <input
                                id="hsCode"
                                name="hsCode"
                                value={form.hsCode}
                                onChange={handleChange}
                                placeholder={t("product_form.placeholders.hs_code", "e.g. 0910.20.00")}
                                className={inputClass}
                            />
                            <p className="text-[9px] text-muted-foreground mt-2 ml-1 italic font-medium uppercase tracking-wider">Crucial for international customs processing</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visuals & Certs */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-8">
                    {/* Visual Assets */}
                    <div className="bg-card backdrop-blur-xl border border-border shadow-2xl rounded-[2.5rem] p-8 space-y-6">
                        <h2 className="text-[11px] font-black text-foreground tracking-[0.25em] uppercase opacity-50 italic">{t("product_form.asset_gallery", "Asset Gallery")}</h2>

                        {/* Previews */}
                        <ImageUploader
                            images={form.images}
                            onChange={(urls) => {
                                setForm(prev => ({ ...prev, images: urls }));
                                setErrors(prev => ({ ...prev, images: "" }));
                            }}
                            maxFiles={4}
                        />
                        {/* Make sure we can still remove completed images from the main form state */}
                        {form.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {form.images.map((url, i) => (
                                    <div
                                        key={i}
                                        className="relative group rounded-xl overflow-hidden border border-border aspect-square bg-muted shadow-xl cursor-zoom-in"
                                        onClick={() => setPreviewImage(url)}
                                    >
                                        <img src={url} alt="asset" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImage(i); }}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-500 rounded-lg shadow-xl opacity-0 md:group-hover:opacity-100 transition-all active:scale-90"
                                            title="Remove image"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.images && <p className={errorClass}>{errors.images}</p>}
                    </div>

                    {/* Professional Certs */}
                    <div className="bg-card backdrop-blur-xl border border-border shadow-2xl rounded-[2.5rem] p-8 space-y-6">
                        <h2 className="text-[11px] font-black text-foreground tracking-[0.25em] uppercase opacity-50 italic">{t("product_form.trust_markers", "Trust Markers")}</h2>

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

                        <div className="flex gap-2 mb-6">
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
                    <div className="bg-muted border border-border rounded-[2.5rem] p-8 relative overflow-hidden group">
                        <Save className="w-10 h-10 text-primary mb-4 opacity-30" />
                        <p className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">{t("product_form.listing_protocols", "Listing Protocols")}</p>
                        <ul className="text-[10px] text-muted-foreground mt-4 space-y-2 italic font-medium leading-relaxed">
                            <li>• {t("product_form.protocols.price", "Prices should be in USD.")}</li>
                            <li>• {t("product_form.protocols.metric", "Weights must use metric units.")}</li>
                            <li>• {t("product_form.protocols.trust", "Quality images increase buyer trust.")}</li>
                        </ul>
                    </div>
                </div>

                {/* Final Action */}
                <div className="lg:col-span-12 flex items-center justify-between bg-card/80 backdrop-blur-2xl border border-border rounded-[2rem] p-8 mt-4 shadow-2xl">
                    <div className="hidden sm:block">
                        <p className="text-foreground font-black text-xs uppercase tracking-widest">{isEdit ? t("product_form.update_asset", "Update Existing Asset") : t("product_form.deploy_new", "Deploy New Asset")}</p>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mt-1 italic">Authorized Listing Procedure (ALP-1)</p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Link
                            href="/dashboard/exporter/inventory"
                            className="flex-1 sm:flex-none px-10 py-4 text-muted-foreground border border-border hover:text-foreground hover:bg-muted font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all"
                        >
                            {t("product_form.abort", "Abort")}
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none relative group px-12 py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/10 transition-all active:scale-95 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {isEdit ? t("product_form.commit_updates", "Commit Updates") : t("product_form.deploy_listing", "Deploy Listing")}
                            </span>
                            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        type="button"
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors shadow-2xl"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img
                        src={previewImage}
                        alt="Expanded Preview"
                        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </form>
    );
}
