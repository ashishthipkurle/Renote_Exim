"use client";

import { useState } from "react";
import Link from "next/link";
import { X, UploadCloud, FileImage } from "lucide-react";

export function AddProductModal({ isNew }: { isNew: boolean }) {
 const [files, setFiles] = useState<File[]>([]);

 if (!isNew) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0c12]/80 backdrop-blur-sm p-4">
 <div className="w-full max-w-[500px] bg-[#1a1f2b] border border-border dark:border-white/10 rounded-xl overflow-hidden shadow-xl dark:shadow-2xl flex flex-col">
 <div className="px-8 py-5 border-b border-border dark:border-white/10 flex items-center justify-between">
 <h2 className="text-[17px] font-semibold text-foreground dark:text-white tracking-tight">Add/Edit Product</h2>
 <Link href="?" className="text-slate-500 hover:text-foreground dark:text-white transition-colors">
 <X className="w-5 h-5" />
 </Link>
 </div>

 <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
 <div>
 <label className="block text-[11px] font-bold text-slate-300 mb-2">Product Name</label>
 <input type="text" placeholder="e.g. Premium Arabica Coffee" className="w-full bg-[#161a24] border border-border dark:border-white/5 rounded-lg px-4 py-3 text-sm text-slate-200 outline-none focus:border-border dark:border-white/20 focus:ring-1 focus:ring-white/20 transition-all placeholder:text-slate-600" />
 </div>

 <div>
 <label className="block text-[11px] font-bold text-slate-300 mb-2">Category</label>
 <select className="w-full bg-[#161a24] border border-border dark:border-white/5 rounded-lg px-4 py-3 text-sm text-slate-200 outline-none focus:border-border dark:border-white/20 focus:ring-1 focus:ring-white/20 transition-all appearance-none">
 <option value="">Select category</option>
 <option value="agriculture">Agriculture</option>
 <option value="manufacturing">Manufacturing</option>
 </select>
 </div>

 <div>
 <label className="block text-[11px] font-bold text-slate-300 mb-2">Price (USD)</label>
 <input type="number" placeholder="0.00" className="w-full bg-[#161a24] border border-border dark:border-white/5 rounded-lg px-4 py-3 text-sm text-slate-200 outline-none focus:border-border dark:border-white/20 focus:ring-1 focus:ring-white/20 transition-all placeholder:text-slate-600" />
 </div>

 <div>
 <label className="block text-[11px] font-bold text-slate-300 mb-2">MOQ</label>
 <input type="text" placeholder="Minimum Order Qty" className="w-full bg-[#161a24] border border-border dark:border-white/5 rounded-lg px-4 py-3 text-sm text-slate-200 outline-none focus:border-border dark:border-white/20 focus:ring-1 focus:ring-white/20 transition-all placeholder:text-slate-600" />
 </div>

 <div>
 <label className="block text-[11px] font-bold text-slate-300 mb-2">Origin</label>
 <select className="w-full bg-[#161a24] border border-border dark:border-white/5 rounded-lg px-4 py-3 text-sm text-slate-200 outline-none focus:border-border dark:border-white/20 focus:ring-1 focus:ring-white/20 transition-all appearance-none">
 <option value="">Select country</option>
 <option value="usa">USA</option>
 <option value="india">India</option>
 </select>
 </div>

 <div>
 <label className="block text-[11px] font-bold text-slate-300 mb-2">Product Images</label>
 {files.length > 0 ? (
 <div className="space-y-2">
 {files.map((file, i) => (
 <div key={i} className="flex items-center justify-between bg-[#161a24] border border-border dark:border-white/10 rounded-lg px-4 py-3">
 <div className="flex items-center gap-3 overflow-hidden">
 <FileImage className="w-5 h-5 flex-shrink-0 text-foreground dark:text-white" />
 <span className="text-sm text-slate-200 truncate">{file.name}</span>
 </div>
 <button
 onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
 className="text-slate-500 hover:text-red-400 p-1 flex-shrink-0"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 ))}

 {/* Small add more button once files exist */}
 <label className="mt-4 flex items-center justify-center gap-2 py-3 border border-dashed border-border dark:border-white/10 rounded-lg bg-[#161a24]/30 hover:bg-[#161a24] cursor-pointer transition-colors text-sm text-slate-400">
 <UploadCloud className="w-4 h-4" />
 Upload more images
 <input
 type="file"
 multiple
 accept="image/png, image/jpeg, image/webp"
 className="hidden"
 onChange={(e) => {
 if (e.target.files?.length) {
 setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
 }
 }}
 />
 </label>
 </div>
 ) : (
 <label className="border border-dashed border-border dark:border-white/10 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-[#161a24]/50 cursor-pointer hover:bg-[#161a24] transition-colors relative">
 <input
 type="file"
 multiple
 accept="image/png, image/jpeg, image/webp"
 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
 onChange={(e) => {
 if (e.target.files?.length) {
 setFiles(Array.from(e.target.files));
 }
 }}
 />
 <p className="text-sm text-slate-200 font-medium">Click or drag to upload</p>
 <p className="text-xs text-slate-500 mt-2">PNG, JPG, WEBP (max. 5MB)</p>
 </label>
 )}
 </div>
 </div>

 <div className="px-8 py-5 border-t border-border dark:border-white/10 flex justify-end gap-3 items-center">
 <Link href="?" className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-black/5 dark:bg-white/10 border border-transparent hover:border-border dark:border-white/10 transition-all">
 Cancel
 </Link>
 <button className="px-6 py-2.5 rounded-lg bg-primary hover:bg-neutral-100 text-primary-foreground text-sm font-semibold shadow-xl shadow-white/5 transition-colors">
 Save
 </button>
 </div>
 </div>
 </div>
 );
}

