"use client";

import Link from "next/link";
import { Filter, Plus, Search } from "lucide-react";

export default function AdminInventoryPage() {
 return (
 <div className="h-dvh flex flex-col overflow-hidden">
 <header className="flex-shrink-0 px-8 py-6 border-b border-white/5 bg-[#0b1019]/30 backdrop-blur-sm">
 <div className="flex items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-white tracking-tight">Inventory Management</h1>
 <p className="text-sm text-slate-400">Track stock levels and approvals.</p>
 </div>
 <div className="flex items-center gap-3">
 <div className="relative hidden md:block">
 <input
 className="pl-10 pr-4 py-2 bg-[#151c2a]/50 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary w-72"
 placeholder="Search products, SKUs..."
 />
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
 </div>
 <button
 type="button"
 className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#151c2a]/50 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/5"
 >
 <Filter className="h-4 w-4" />
 Filters
 </button>
 <Link
 href="/dashboard/admin/products"
 className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-[#0f49bd]"
 >
 <Plus className="h-4 w-4" />
 Add Product
 </Link>
 </div>
 </div>
 </header>

 <div className="flex-1 overflow-y-auto p-8">
 <div className="max-w-[1600px] mx-auto space-y-6">
 <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
 {[
 { k: "Low stock", v: 14 },
 { k: "Pending approval", v: 9 },
 { k: "Out of stock", v: 3 },
 ].map((x) => (
 <div
 key={x.k}
 className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl p-6 rounded-lg"
 >
 <div className="text-slate-400 text-sm font-medium">{x.k}</div>
 <div className="text-white text-3xl font-bold tracking-tight mt-2">{x.v}</div>
 </div>
 ))}
 </div>

 <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-lg overflow-hidden">
 <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
 <div>
 <div className="text-white font-bold tracking-tight">Items</div>
 <div className="text-slate-400 text-xs">Admin view (placeholder data)</div>
 </div>
 <Link href="/dashboard/admin/categories" className="text-primary text-sm font-bold hover:underline">
 Manage categories
 </Link>
 </div>
 <div className="divide-y divide-white/10">
 {[
 { name: "Cotton Fabric Roll", sku: "TXT-001", stock: 42, status: "Active" },
 { name: "Industrial Valve", sku: "MCH-114", stock: 8, status: "Low" },
 { name: "LED Driver", sku: "ELC-402", stock: 0, status: "Out" },
 ].map((p) => (
 <div key={p.sku} className="px-6 py-4 flex items-center justify-between">
 <div>
 <div className="text-white font-semibold">{p.name}</div>
 <div className="text-slate-400 text-xs mt-0.5">SKU: {p.sku}</div>
 </div>
 <div className="flex items-center gap-6">
 <div className="text-slate-300 text-sm">Stock: {p.stock}</div>
 <div className="text-xs font-bold px-2 py-1 rounded border border-white/10 bg-white/5 text-slate-200">
 {p.status}
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
