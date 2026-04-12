import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CategoryDirectory from "../CategoryDirectory";

export default function AddProductPage() {
 return (
 <div className="h-full flex flex-col bg-background transition-colors duration-300">
 <header className="flex-shrink-0 p-6 lg:p-8 border-b border-border bg-header backdrop-blur-sm z-10">
 <div className="flex items-center gap-6">
 <Link
 href="/dashboard/exporter/inventory"
 className="p-3 bg-card border border-border rounded-lg hover:bg-accent transition-all text-muted-foreground hover:text-foreground group"
 >
 <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
 </Link>
 <div>
 <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Add Products</h1>
 <p className="text-muted-foreground mt-1 font-medium">
 Deploy your products to the global market
 </p>
 </div>
 </div>
 </header>

 <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
 <div className="max-w-[1600px] mx-auto">
 <CategoryDirectory />
 </div>
 </div>
 </div>
 );
}

