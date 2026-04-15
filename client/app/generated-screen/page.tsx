"use client";

import React, { useState } from "react";
import { X, Crop, RotateCcw, Plus, Save } from "lucide-react";

export default function GeneratedScreenDemo() {
 const [isCropping, setIsCropping] = useState(false);
 const [activeAsset, setActiveAsset] = useState<number>(0);

 const assets = [
 "https://lh3.googleusercontent.com/aida-public/AB6AXuBxTi7sP0DGu3NL7sBlegPQWsrkJYX_LHcYMZkNz_hGvmuYsjrzktDwwHUJQtW9PWxO0QT3ldu7QlNwC9SoYgXgawFuI29UEK1VD1BhVK1bv7tliVO-uosU4xhVKs0tqDE6PSHU4iQZXnIW1tGsac5xMuzXeT_3mAWefYpFKinrAvjclakES-A8ro4F5BteG3Zi_tn5vnB9bswC6qbCQf_c0Ot3-nBrXWkrZNtGI54274m9dcw1HZCtZLUJq8QdnRlwItBVZeE0mOsh",
 "https://lh3.googleusercontent.com/aida-public/AB6AXuBly2PobDD_hjH8VXl9lxUCDFBhDAQX4K5Sc3tU1EeX-9JaRMotXGP9aGFvl6WrZ-iq-pcq8u7azqyvqX6GDhIkEBnX8WB_5Erxcdi-jRw4gAtPwDC43RcVAdQMmiVwfx3pJtykJwJ6gKPAi8o2uXQGoMqRXt-Nhpzug7yq4WqMlt1x5ycQRxY59MsTsW5s-qnzalBidqUlEJPA_R-uAUSLBMn8aD7yuqCVXKG22OLVVGmokKyPjB8-23MdR343fWuPg1lJO7Bza6W9",
 "https://lh3.googleusercontent.com/aida-public/AB6AXuBGexAaMHmY9QZCbtONjqZstOjW89fSLL7nJ44JCgQ5tv2PeY3a3zZ-JupKkwUIo_1goVIE9ws7ZT1dR3uogzMVyT6x2r-Zg07_BO1PrXq7cwHXNwWm6X0kIu85GNK_cbIfCY_fvzX3E3yORe1Y2BS8y2-ASCwCA0XcOrfD2H1-RSsqzsdrQZO3Ilceal5BE_ECBFtDnvAWbi5EC_ZbfUI9H7neeEfyhQX1uvofD2qd4hBNAbeovYjeAKmKm2msD2gUUtO7wzR7SJv-",
 "https://lh3.googleusercontent.com/aida-public/AB6AXuC70l7Lmoyxe8sz1qBaYQh4WYwX2H4mv6tiXkEF6BWtWFKAqlhqlO3eGt3t734esbM6JGY2WXQ-uIEOYEHEa3EeVQs8UfCLj9khm5VwDmQQltwb9mCzdeXksh2fZN3pMdTtBrDQsz19mFkL3Px8FnJOL5LWus6Dx6i5xUhM0phH0n2Py1mNCTy9GS2B-RatWbdZq8a7Y_WNOscz8zAMPxZ-gl41QuJXeRffmwpjbDtBlGMTudRJhNJ6KxZSe5fjeaFW96E--1Tkw1ks"
 ];

 const mainPreviewImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuDGby9P1ttu4lRsnsgA8mlNJG_CUoFYcwCpUHJPAS6WgptIOxXTlRLZjOIYpf54LvAWnTYdMsJdGKP1qvCED1mwTGmqiveJxZ-nAHF-pwxkeG7bPCifzuOu7D1avRJKc2t7VfO5jpaqMAnXKe6MS8OjrCQNLACIOyScCcR-AhPYT8gNRYZjdul6vlpQiTHlaKho5cqpPVRWxATUF3qEMtRGb_ZWhzhHSc1akGjKGeUazfcXkbqcjMckZk4rJy5p47jAmxr3Ts1_xElj";

 return (
 <div className="font-sans text-gray-900 min-h-screen flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
 <main className="w-full max-w-5xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col h-[85vh]">

 {/* Header Navigation */}
 <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shadow-sm z-10">
 <div className="flex items-center space-x-3">
 <div className="p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors">
 <X className="h-6 w-6 text-gray-500" />
 </div>
 <h1 className="text-lg font-semibold text-gray-800">Edit Assets</h1>
 </div>

 <div className="flex items-center space-x-6 text-gray-500">
 <button
 onClick={() => setIsCropping(!isCropping)}
 className={`p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center ${isCropping ? "bg-[#0047AB] text-white hover:bg-[#003380]" : ""}`}
 >
 <Crop className="h-6 w-6" />
 </button>
 </div>

 <div className="flex items-center space-x-4">
 <button className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1.5">
 <RotateCcw className="w-4 h-4" /> Reset
 </button>
 <button className="bg-[#0047AB] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#003380] transition-colors shadow-lg shadow-blue-100 flex items-center space-x-2">
 <span>Save Changes</span>
 </button>
 </div>
 </header>

 {/* Canvas Preview */}
 <div className="flex-grow bg-[#F3F4F6] flex items-center justify-center p-8 relative overflow-hidden">
 <div className="relative w-full max-w-2xl bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 aspect-[4/3] flex items-center justify-center">
 <img
 alt="Main Preview"
 className="w-full h-auto object-contain block mx-auto"
 src={mainPreviewImage}
 />

 {/* Crop Overlay */}
 <div className={`absolute inset-0 border-2 border-dashed border-[#0047AB] pointer-events-none transition-opacity duration-300 ${isCropping ? "opacity-100" : "opacity-0"}`}>
 <div className="absolute top-0 left-0 w-4 h-4 bg-[#0047AB]"></div>
 <div className="absolute top-0 right-0 w-4 h-4 bg-[#0047AB]"></div>
 <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#0047AB]"></div>
 <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#0047AB]"></div>
 </div>
 </div>

 <div className="absolute bottom-8 right-8">
 <button className="bg-white p-3 rounded-full shadow-lg border border-gray-100 text-gray-700 hover:text-[#0047AB] hover:shadow-xl transition-all">
 <Crop className="h-6 w-6" />
 </button>
 </div>
 </div>

 {/* Thumbnail Gallery */}
 <footer className="bg-white border-t border-gray-100 p-6 z-10">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Project Assets (5)</h3>
 <button className="text-xs font-semibold text-[#0047AB] flex items-center space-x-1 hover:underline">
 <Plus className="h-4 w-4" />
 <span>Batch Upload</span>
 </button>
 </div>

 <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">

 {assets.map((asset, index) => (
 <div
 key={index}
 onClick={() => setActiveAsset(index)}
 className={`flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden cursor-pointer relative group transition-colors ${activeAsset === index ? "border-[3px] border-[#0047AB]" : "border border-gray-200 hover:border-[#0047AB]/50"}`}
 >
 <img alt={`Asset ${index + 1}`} className="w-full h-full object-cover" src={asset} />
 {activeAsset === index && (
 <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
 <span className="text-white text-[10px] font-bold">ACTIVE</span>
 </div>
 )}
 </div>
 ))}

 {/* Add New Button */}
 <div className="flex-shrink-0 w-28 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#0047AB] hover:bg-[#E6F0FF] transition-all text-gray-400 hover:text-[#0047AB]">
 <div className="text-center">
 <Plus className="h-6 w-6 mx-auto" />
 <span className="text-[10px] font-bold uppercase mt-1 block">Add New</span>
 </div>
 </div>
 </div>
 </footer>

 </main>
 </div>
 );
}
