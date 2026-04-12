"use client";

import { useState, useMemo } from "react";
import { Search, Plus, ChevronRight, X, Sparkles, Globe, Layers, ShieldCheck, TrendingUp, Package } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductForm from "@/components/dashboard/ProductForm";
import { motion, AnimatePresence } from "framer-motion";

const TOP_SECTORS = [
 { name: "Agriculture", icon: "🌱", color: "text-foreground dark:text-white" },
 { name: "Textiles", icon: "🧶", color: "text-foreground dark:text-white" },
 { name: "Chemicals", icon: "🧪", color: "text-foreground dark:text-white" },
 { name: "Machinery", icon: "⚙️", color: "text-foreground dark:text-white" },
 { name: "Food", icon: "🍎", color: "text-foreground dark:text-white" },
 { name: "Electronics", icon: "💻", color: "text-foreground dark:text-white" },
];

const ALL_INDUSTRIES = [
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
 "Fire Extinguishers", "Fish Products", "Floor Covers", "Flour", "Flowers", "Footwear", "Forestry Equipment",
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

const DISPLAY_TO_ENUM: Record<string, string> = {
 "AGRICULTURE": "AGRICULTURE",
 "TEXTILES": "TEXTILES",
 "CHEMICALS": "CHEMICALS",
 "MACHINERY": "MACHINES",
 "FOOD": "FOOD",
 "ELECTRONICS": "ELECTRONICS",
 "AUTOMOTIVE": "AUTOMOTIVE",
 "CONSTRUCTION": "CONSTRUCTION",
 "MEDICAL": "MEDICAL",
 "HANDICRAFTS": "HANDICRAFTS",
 "OTHER": "OTHER",
};

export default function CategoryDirectory({ usedCategories = [] }: { usedCategories?: string[] }) {
 const router = useRouter();
 const searchParams = useSearchParams();
 const [search, setSearch] = useState("");

 const isSelected = searchParams.get("action") === "new";
 const selectedCategory = searchParams.get("category");

 const usedDisplayNames = useMemo(() => {
 return usedCategories.map(cat => {
 const entry = Object.entries(DISPLAY_TO_ENUM).find(([_, val]) => val === cat);
 if (entry) return entry[0];
 return cat;
 });
 }, [usedCategories]);

 const filtered = useMemo(() => {
 const listToFilter = search ? ALL_INDUSTRIES : usedDisplayNames;
 return listToFilter.filter(i => i.toLowerCase().includes(search.toLowerCase())).slice(0, 15);
 }, [search, usedDisplayNames]);

 const handleSelect = (category: string) => {
 const upper = category.toUpperCase();
 const enumValue = DISPLAY_TO_ENUM[upper] || (["MACHINERY", "MACHINES"].includes(upper) ? "MACHINES" : "OTHER");
 router.push(`/dashboard/exporter/inventory/add?action=new&category=${enumValue}`, { scroll: false });
 };

 const handleBack = () => {
 if (isSelected) {
 router.push(`/dashboard/exporter/inventory/add`, { scroll: false });
 } else {
 router.push(`/dashboard/exporter/inventory`, { scroll: false });
 }
 };

 return (
 <div className="bg-card/40 backdrop-blur-3xl border border-border rounded-lg p-10 lg:p-12 shadow-xl dark:shadow-2xl relative overflow-hidden group min-h-[700px] transition-all duration-700">
 {/* ── Background Elements ── */}
 <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none transition-opacity duration-1000 ${isSelected ? 'opacity-20' : 'opacity-100'}`} />
 <div className={`absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-black/5 dark:bg-white/10 blur-[150px] rounded-full transition-all duration-1000 pointer-events-none ${isSelected ? 'scale-150 -translate-x-1/2 -translate-y-1/2 opacity-20' : 'group-hover:bg-black/10 dark:bg-white/15'}`} />

 <div className="relative z-10 flex flex-col h-full">
 {/* ── Header ── */}
 <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 mb-12">
 <div className={`transition-all duration-700 ${isSelected ? 'opacity-20 filter grayscale scale-95 origin-left' : 'opacity-100'}`}>
 <h2 className="text-4xl font-black text-foreground dark:text-white uppercase tracking-tighter flex items-center gap-5">
 Sector Registry
 {isSelected && <Sparkles className="w-6 h-6 text-foreground dark:text-white animate-pulse" />}
 </h2>
 <p className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.3em] mt-3 ">Discover thousands of global trade neural nodes</p>
 </div>

 <div className="flex items-center gap-4 flex-wrap">
 {!isSelected ? (
 <div className="relative w-full xl:w-[500px] group">
 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors" />
 <input
 type="text"
 placeholder="Search 1000+ industry clusters..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-14 pr-6 py-5 bg-background/40 border border-border rounded-lg text-[10px] text-foreground font-black uppercase placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all shadow-inner tracking-widest "
 />
 </div>
 ) : (
 <button
 onClick={handleBack}
 className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-white/5 active:scale-95"
 >
 <X className="w-4 h-4" />
 Return to Index
 </button>
 )}
 </div>
 </div>

 <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-12 relative">
 {/* ── Desktop Sidebar Content (Left or Center depending on state) ── */}
 <div className={`xl:col-span-12 transition-all duration-1000 ease-in-out ${isSelected ? 'opacity-0 invisible scale-95' : 'opacity-100 visible scale-100'}`}>
 <div className="grid grid-cols-1 xl:grid-cols-4 gap-12 h-fit">
 <div className="xl:col-span-1 space-y-12 h-fit">
 <div>
 <h3 className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.4em] mb-8 ">Primary Clusters</h3>
 <div className="grid grid-cols-2 gap-4">
 {TOP_SECTORS.map((s) => (
 <button
 key={s.name}
 onClick={() => handleSelect(s.name)}
 className="flex flex-col items-center justify-center p-6 bg-muted border border-border rounded-lg hover:bg-primary hover:border-transparent transition-all duration-500 group/btn active:scale-95 shadow-xl dark:shadow-2xl backdrop-blur-xl"
 >
 <span className="text-3xl mb-3 group-hover/btn:scale-125 transition-transform duration-500">{s.icon}</span>
 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground dark:text-white group-hover/btn:text-primary-foreground transition-colors">{s.name}</span>
 </button>
 ))}
 <button
 onClick={() => handleSelect("OTHER")}
 className="flex flex-col items-center justify-center p-6 bg-muted border border-border rounded-lg hover:bg-primary transition-all duration-500 group/btn active:scale-95 shadow-xl dark:shadow-2xl backdrop-blur-xl"
 >
 <Plus className="w-7 h-7 text-foreground group-hover/btn:text-primary-foreground mb-3" />
 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground group-hover/btn:text-primary-foreground transition-colors">Other</span>
 </button>
 </div>
 </div>

 <div className="pt-10 border-t border-border dark:border-white/5">
 <div className="flex items-center justify-between mb-8 ">
 <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">{search ? 'Search Node Result' : 'System Sequence'}</div>
 <Layers className="w-4 h-4 text-muted-foreground/20" />
 </div>
 <div className="grid grid-cols-1 gap-3 h-fit">
 {(search ? filtered : ALL_INDUSTRIES.slice(0, 10)).map((item) => (
 <button
 key={item}
 onClick={() => handleSelect(item)}
 className="flex items-center justify-between p-5 bg-white/[0.02] hover:bg-black/10 dark:bg-white/15 border border-border dark:border-white/5 rounded-lg transition-all duration-500 group/item text-left shadow-xl"
 >
 <span className="text-[10px] font-black text-muted-foreground group-hover/item:text-foreground dark:text-white transition-all uppercase tracking-widest ">{item}</span>
 <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/20 group-hover/item:text-foreground dark:text-white transition-all group-hover/item:translate-x-1" />
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Center Content when not selected */}
 <div className="xl:col-span-3 flex flex-col items-center justify-center text-center p-20 bg-white/[0.01] border border-dashed border-border dark:border-white/5 rounded-lg min-h-[500px] h-full group/main">
 <div className="w-32 h-32 bg-black/5 dark:bg-white/10 rounded-lg flex items-center justify-center mb-10 border border-border dark:border-white/10 transition-all duration-700 group-hover/main:scale-110 group-hover/main:rotate-45">
 <Globe className="w-12 h-12 text-white/20 animate-spin-slow" />
 </div>
 <h3 className="text-xl font-black text-foreground dark:text-white uppercase tracking-tighter mb-5 opacity-40">Awaiting Sector Sequence</h3>
 <p className="max-w-[320px] text-[10px] text-muted-foreground/60 font-black uppercase tracking-[0.2em] leading-relaxed ">
 Initialize an industry node from the global registry to begin primary market deployment protocols.
 </p>
 <div className="mt-12 flex items-center gap-10 opacity-20">
 <ShieldCheck className="w-6 h-6" />
 <TrendingUp className="w-6 h-6" />
 <Package className="w-6 h-6" />
 </div>
 </div>
 </div>
 </div>

 {/* ── Selection View ── */}
 <AnimatePresence>
 {isSelected && (
 <motion.div
 initial={{ x: 100, opacity: 0 }}
 animate={{ x: 0, opacity: 1 }}
 exit={{ x: 100, opacity: 0 }}
 className="absolute inset-0 z-20 h-full"
 >
 <div className="bg-card/60 backdrop-blur-3xl border border-border rounded-lg p-12 lg:p-16 shadow-[0_0_100px_rgba(0,0,0,0.5)] h-full overflow-y-auto custom-scrollbar">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
 <div>
 <h3 className="text-4xl font-black text-foreground dark:text-white uppercase tracking-tighter">Listing Protocol</h3>
 <div className="flex items-center gap-4 mt-4">
 <div className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl dark:shadow-2xl">
 NODE: {selectedCategory}
 </div>
 <span className="text-muted-foreground/40 font-black uppercase text-[8px] tracking-[0.3em] flex items-center gap-2 ">
 <span className="w-1.5 h-1.5 rounded-full bg-black/20 dark:bg-white/20" />
 Primary Trade Link Verified
 </span>
 </div>
 </div>
 <div className="p-6 rounded-lg bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 text-foreground dark:text-white animate-pulse">
 <ShieldCheck className="w-8 h-8" />
 </div>
 </div>

 <div className="max-w-5xl">
 <ProductForm hideHeader={true} />
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 );
}

