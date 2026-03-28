"use client";

import { useState, useMemo } from "react";
import { Search, Plus, ChevronRight, X, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductForm from "@/components/dashboard/ProductForm";

const TOP_SECTORS = [
    { name: "Agriculture", icon: "🌱", color: "text-lime-400" },
    { name: "Textiles", icon: "🧶", color: "text-pink-400" },
    { name: "Chemicals", icon: "🧪", color: "text-violet-400" },
    { name: "Machinery", icon: "⚙️", color: "text-sky-400" },
    { name: "Food", icon: "🍎", color: "text-orange-400" },
    { name: "Electronics", icon: "💻", color: "text-blue-400" },
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

const DISPLAY_TO_ENUM: Record<string, string> = {
    "AGRICULTURE": "AGRICULTURE",
    "TEXTILES": "TEXTILES",
    "CHEMICALS": "CHEMICALS",
    "MACHINERY": "MACHINES", // Fix: Machinery -> MACHINES
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

    // Map usedCategories (ENUMS) back to display names if possible
    const usedDisplayNames = useMemo(() => {
        return usedCategories.map(cat => {
            const entry = Object.entries(DISPLAY_TO_ENUM).find(([_, val]) => val === cat);
            if (entry) return entry[0].charAt(0) + entry[0].slice(1).toLowerCase();
            return cat.charAt(0) + cat.slice(1).toLowerCase();
        });
    }, [usedCategories]);

    const filtered = useMemo(() => {
        const listToFilter = search ? ALL_INDUSTRIES : usedDisplayNames;
        return listToFilter.filter(i => i.toLowerCase().includes(search.toLowerCase())).slice(0, 15);
    }, [search, usedDisplayNames]);

    const handleSelect = (category: string) => {
        const upper = category.toUpperCase();
        // Check if it's already a valid enum or needs mapping
<<<<<<< HEAD
        const enumValue = DISPLAY_TO_ENUM[upper] || (["MACHINERY", "MACHINES"].includes(upper) ? "MACHINES" : "OTHER");
        router.push(`/dashboard/exporter/inventory/add?action=new&category=${enumValue}`, { scroll: false });
=======
        const enumValue = DISPLAY_TO_ENUM[upper] || (["MACHINERY", "MACHINES"].includes(upper) ? "MACHINES" : upper);
        router.push(`/dashboard/exporter/inventory?action=new&category=${enumValue}`, { scroll: false });
>>>>>>> ee21e5783a35760961c31c0688004a735e9abf72
    };

    const handleBack = () => {
        // If we are in the "form" view (isSelected), go back to the "directory" view on the same page
        if (isSelected) {
            router.push(`/dashboard/exporter/inventory/add`, { scroll: false });
        } else {
            // Otherwise go back to the inventory index
            router.push(`/dashboard/exporter/inventory`, { scroll: false });
        }
    };

    return (
        <div className="bg-card backdrop-blur-xl border border-border rounded-[2.5rem] p-8 lg:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden group min-h-[600px] transition-all duration-700">
            {/* Background Glow */}
            <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none transition-opacity duration-700 ${isSelected ? 'opacity-30' : 'opacity-100'}`} />
            <div className={`absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full transition-all duration-1000 ${isSelected ? 'scale-150 -translate-x-1/2 -translate-y-1/2 opacity-40' : 'group-hover:bg-primary/20'}`} />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                    <div className={`transition-all duration-500 ${isSelected ? 'opacity-40 filter grayscale scale-95 origin-left' : 'opacity-100'}`}>
                        <h2 className="text-2xl font-black text-foreground uppercase  tracking-tight flex items-center gap-3">
                            Products
                            {isSelected && <Sparkles className="w-5 h-5 text-primary animate-pulse" />}
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1 font-medium">Explore thousands of global trade categories</p>
                    </div>

                    {!isSelected && (
                        <div className="relative w-full lg:w-[400px] animate-in fade-in slide-in-from-right-4 duration-500">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search 1000+ industry sectors..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-muted border border-border focus:border-primary/50 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all shadow-inner"
                            />
                        </div>
                    )}

                    {isSelected && (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-6 py-3 bg-muted border border-border rounded-2xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all font-black text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-right-4"
                        >
                            <X className="w-4 h-4" />
                            Back to Index
                        </button>
                    )}
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-12 relative overflow-hidden">
                    {/* LEFT PANEL: Directory (Blurred when selected) */}
                    <div className={`lg:col-span-1 transition-all duration-700 ease-in-out ${isSelected ? 'blur-md opacity-30 pointer-events-none scale-[0.98]' : 'blur-none opacity-100'}`}>
                        <div className="grid grid-cols-1 gap-10">
                            {/* Featured Grid - Only show if no used categories or searching */}
                            {(usedDisplayNames.length === 0 || search) && (
                                <div>
                                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 ml-1">Featured Global Sectors</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {TOP_SECTORS.map((s) => (
                                            <button
                                                key={s.name}
                                                onClick={() => handleSelect(s.name)}
                                                className="flex flex-col items-center justify-center p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-primary hover:border-primary transition-all group/btn active:scale-95 shadow-xl"
                                            >
                                                <span className="text-2xl mb-2 group-hover/btn:scale-125 transition-transform">{s.icon}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white">{s.name}</span>
                                            </button>
                                        ))}
                                        <button
                                            key={s.name}
                                            onClick={() => handleSelect(s.name)}
                                            className="flex flex-col items-center justify-center p-5 bg-muted/50 border border-border rounded-2xl hover:bg-primary hover:border-primary transition-all group/btn active:scale-95 shadow-lg"
                                        >
                                            <span className="text-2xl mb-2 group-hover/btn:scale-125 transition-transform">{s.icon}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover/btn:text-white">{s.name}</span>
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handleSelect("OTHER")}
                                        className="flex flex-col items-center justify-center p-5 bg-primary/10 border border-primary/20 rounded-2xl hover:bg-primary transition-all group/btn active:scale-95 shadow-lg"
                                    >
                                        <Plus className="w-6 h-6 text-primary group-hover/btn:text-white mb-2" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover/btn:text-white">Other</span>
                                    </button>
                                </div>
                            )}

                            {/* Industry List - Shows Used Categories by default, or all when searching */}
                            <div>
                                <div className="flex items-center justify-between mb-4 ml-1">
                                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{search ? 'Search' : 'Latest'}</div>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {(search ? filtered : ALL_INDUSTRIES.slice(0, 8)).map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => handleSelect(item)}
                                            className="flex items-center justify-between p-4 bg-muted/20 hover:bg-accent border border-border rounded-xl transition-all group/item text-left"
                                        >
                                            <span className="text-xs font-bold text-muted-foreground group-hover/item:text-foreground transition-colors">{item}</span>
                                            <ChevronRight className="w-3 h-3 text-muted-foreground/50 group-hover/item:text-primary transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: The Form (Visible when selected) */}
                    <div className={`absolute top-0 right-0 w-full lg:w-3/4 h-full transition-all duration-700 ease-in-out ${isSelected ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'}`}>
                        {isSelected && (
                            <div className="bg-card backdrop-blur-2xl border border-primary/20 rounded-3xl p-8 lg:p-10 shadow-2xl h-full overflow-y-auto custom-scrollbar animate-in slide-in-from-right-12 duration-700">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Listing Profile</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="px-2 py-0.5 bg-primary/20 border border-primary/30 rounded-md text-[9px] font-black text-primary uppercase tracking-widest">{selectedCategory}</div>
                                            <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Global Protocol</span>
                                        </div>
                                    </div>
                                    <Sparkles className="w-6 h-6 text-primary/40" />
                                </div>

                                <ProductForm hideHeader={true} />
                            </div>
                        )}
                    </div>

                    {/* Placeholder for dual pane when not selected (Empty right side or instructions) */}
                    {!isSelected && (
                        <div className="hidden lg:flex lg:col-span-3 flex-col items-center justify-center text-center p-12 bg-muted/10 border border-dashed border-border rounded-3xl animate-in fade-in duration-1000">
                            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 border border-primary/10">
                                <Plus className="w-8 h-8 text-primary/40" />
                            </div>
                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-3 opacity-60">Ready for Global Trade?</h3>
                            <p className="max-w-[280px] text-xs text-muted-foreground font-medium leading-relaxed">
                                Select an industry sector from the index on the left to initialize your next market deployment.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}