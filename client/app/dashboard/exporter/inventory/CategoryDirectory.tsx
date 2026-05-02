"use client";

import { useState, useMemo } from "react";
import { 
  Search, ChevronRight, LayoutGrid, Globe, Package, Tag, ShieldCheck, 
  ShoppingCart, Zap, Apple, Shirt, FlaskConical, Settings, Laptop, 
  Truck, Construction, HeartPulse, Hammer, Sparkles, ArrowLeft,
  Edit2, Trash2, Filter, MoreHorizontal, Eye, Box, AlertCircle,
  CheckCircle2, PauseCircle, Loader2, ArrowRight
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductForm from "@/components/dashboard/ProductForm";
import { motion, AnimatePresence } from "framer-motion";

const MAJOR_CATEGORIES = [
  { id: "AGRICULTURE", name: "Agriculture", icon: Apple, color: "bg-emerald-500/10 text-emerald-600" },
  { id: "FOOD", name: "Food & Beverage", icon: ShoppingCart, color: "bg-orange-500/10 text-orange-600" },
  { id: "TEXTILES", name: "Textiles", icon: Shirt, color: "bg-blue-500/10 text-blue-600" },
  { id: "CHEMICALS", name: "Chemicals", icon: FlaskConical, color: "bg-purple-500/10 text-purple-600" },
  { id: "MACHINES", name: "Machinery", icon: Settings, color: "bg-slate-500/10 text-slate-600" },
  { id: "ELECTRONICS", name: "Electronics", icon: Laptop, color: "bg-indigo-500/10 text-indigo-600" },
  { id: "MEDICAL", name: "Medical", icon: HeartPulse, color: "bg-rose-500/10 text-rose-600" },
  { id: "CONSTRUCTION", name: "Construction", icon: Construction, color: "bg-amber-500/10 text-amber-600" },
  { id: "HANDICRAFTS", name: "Handicrafts", icon: Hammer, color: "bg-amber-800/10 text-amber-800" },
  { id: "LOGISTICS", name: "Logistics", icon: Truck, color: "bg-sky-500/10 text-sky-600" },
  { id: "COSMETICS", name: "Cosmetics", icon: Sparkles, color: "bg-pink-500/10 text-pink-600" },
  { id: "OTHER", name: "Other Industry", icon: Package, color: "bg-slate-500/10 text-slate-600" },
];

const SUB_INDUSTRIES = [
  "Abrasives", "Adhesives", "Aerospace Parts", "Agricultural Machinery", "Air Conditioning", "Aluminum Products",
  "Antibiotics", "Apparel Accessories", "Art Supplies", "Automotive Components", "Baby Products", "Bakery Equipment",
  "Batteries", "Bearings", "Beauty Supplements", "Bicycles", "Biofuels", "Biomass Energy", "Building Materials", "Cables",
  "Cameras", "Camping Gear", "Ceramics", "Circuit Boards", "Cleaning Supplies", "Clocks", "Coffee", "Compressors",
  "Computer Hardware", "Confectionery", "Control Systems", "Cooking Oil", "Cosmetic Tools", "Cotton Fabrics", "Cranes",
  "Dairy Products", "Data Storage", "Dental Equipment", "Detergents", "Diagnostic Tools", "Digital Cameras", "Disinfectants",
  "Doors", "Drilling Equipment", "Dyes", "Earthmoving Machinery", "Electric Motors", "Electronic Components", "Engines",
  "Essential Oils", "Excavators", "Fabricated Metals", "Fasteners", "Feed Additives", "Fertilizers", "Filtering Equipment",
  "Fire Extinguishers", "Fish Products", "Floor Covers", "Flour", "Flowers", "Footwear", "Forestry Equipment", "Frames",
  "Fruit", "Fungicides", "Furnaces", "Garden Tools", "Gaskets", "Gears", "Generators", "Glass Products", "Glassware",
  "Gloves", "Grain", "Greenhouse Equipment", "Grinding Tools", "Hair Care", "Hand Tools", "Handling Equipment", "Hats",
  "Hay", "Heaters", "Herbicides", "Herbal Products", "Honey", "Hospital Furniture", "Household Appliances", "Hydraulic Equipment",
  "Industrial Boilers", "Industrial Chemicals", "Ink", "Insecticides", "Instrumentation", "Insulation", "Iron Products",
  "Irrigation Systems", "Jewelry", "Juice", "Kitchenware", "Knitted Fabrics", "Laboratory Equipment", "Lamps", "Leather Goods",
  "Lenses", "Light Fixtures", "Linens", "Lubricants", "Luggage", "Lumber", "Machine Tools", "Maintenance Supplies", "Mapping Equipment",
  "Marine Engines", "Material Handling", "Measuring Tools", "Medical Disposables", "Metals", "Milk Products", "Milling Machines",
  "Mining Equipment", "Mixers", "Mobile Phones", "Musical Instruments", "Network Hardware", "Office Furniture", "Office Supplies",
  "Oil Seeds", "Optical Fibers", "Organic Chemicals", "Packaging Machinery", "Paints", "Paper Products", "Perfume",
  "Personal Computers", "Pesticides", "Pet Food", "Pharmaceutical Ingredients", "Pigments", "Pipes", "Plastic Products",
  "Power Tools", "Precision Instruments", "Prepared Foods", "Printers", "Printing Inks", "Protective Clothing", "Pumps",
  "Raw Materials", "Refrigeration", "Renewable Energy", "Robotics", "Safety Equipment", "Sand", "Scales", "School Supplies",
  "Scientific Instruments", "Seeds", "Semiconductors", "Sensors", "Shipbuilding", "Signals", "Signs", "Silk Fabrics",
  "Software", "Solar Energy", "Spices", "Sporting Goods", "Stainless Steel", "Stationery", "Steel Products", "Surgical Instruments",
  "Synthetic Fibers", "Tableware", "Tea", "Technical Fabrics", "Telecommunications", "Testing Equipment", "Tiles", "Tools",
  "Tractors", "Transformers", "Trucks", "Turbines", "Valves", "Vegetables", "Vehicle Parts", "Vessels", "Video Equipment",
  "Warehouse Equipment", "Washing Equipment", "Waste Management", "Watch Components", "Water Filtration", "Wearables",
  "Weather Systems", "Welding Equipment", "Windows", "Wood Products", "Workwear", "Woven Fabrics", "Yarn", "Zinc Products"
];

export default function CategoryDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  const isSelected = searchParams.get("action") === "new";
  const selectedCategory = searchParams.get("category");

  const filteredSubIndustries = useMemo(() => {
    if (!search) return [];
    return SUB_INDUSTRIES.filter(i => 
      i.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 8);
  }, [search]);

  const handleSelect = (categoryId: string) => {
    router.push(`/dashboard/exporter/inventory/add?action=new&category=${categoryId}`, { scroll: false });
  };

  const handleBack = () => {
    router.push(`/dashboard/exporter/inventory/add`, { scroll: false });
  };

  return (
    <div className="min-h-[600px] w-full">
      <AnimatePresence mode="wait">
        {!isSelected ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* Search Header */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl p-8 shadow-sm">
              <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Choose a Product Sector</h2>
                <p className="text-slate-500 text-sm">Select the most relevant category to begin your listing</p>
              </div>
              
              <div className="max-w-xl mx-auto relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search for specific industries (e.g. Coffee, Steel, Silk...)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
                
                {/* Search Dropdown */}
                <AnimatePresence>
                  {search && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      {filteredSubIndustries.length > 0 ? (
                        filteredSubIndustries.map((item) => (
                          <button
                            key={item}
                            onClick={() => handleSelect("OTHER")}
                            className="w-full px-6 py-4 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 last:border-0 flex items-center justify-between group"
                          >
                            <span className="text-slate-700 dark:text-slate-300">{item}</span>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </button>
                        ))
                      ) : (
                        <div className="px-6 py-4 text-sm text-slate-500 italic">No exact matches found. Try a major category below.</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Major Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {MAJOR_CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleSelect(cat.id)}
                  className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group active:scale-95"
                >
                  <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <cat.icon className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-center">{cat.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Quick Tips */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 py-10 opacity-60">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <ShieldCheck className="w-4 h-4" /> Trusted by 5000+ Exporters
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Zap className="w-4 h-4" /> Fast Listing Protocol
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Globe className="w-4 h-4" /> Global Market Distribution
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Category Selection
              </button>
              <div className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                Listing in: {selectedCategory}
              </div>
            </div>
            
            <ProductForm hideHeader={true} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
