'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductGallery({ images }: { images: string[] }) {
 const [index, setIndex] = useState(0);

 if (!images || images.length === 0) {
 return (
 <div className="aspect-[4/3] rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
 No image available
 </div>
 );
 }

 return (
 <div className="space-y-4">
 <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 border border-white/5 group shadow-2xl">
 <AnimatePresence mode="wait">
 <motion.div
 key={index}
 initial={{ opacity: 0, scale: 1.1 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
 className="absolute inset-0"
 >
 <Image
 src={images[index]}
 alt="Product Image"
 fill
 className="object-cover"
 priority
 />
 </motion.div>
 </AnimatePresence>

 {/* Overlay Gradients */}
 <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

 {/* Controls */}
 {images.length > 1 && (
 <>
 <button
 onClick={() => setIndex((index - 1 + images.length) % images.length)}
 className="absolute left-4 top-1/2 -translate-y-1/2 size-12 rounded-lg bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/40"
 >
 <ChevronLeft className="w-6 h-6" />
 </button>
 <button
 onClick={() => setIndex((index + 1) % images.length)}
 className="absolute right-4 top-1/2 -translate-y-1/2 size-12 rounded-lg bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/40"
 >
 <ChevronRight className="w-6 h-6" />
 </button>
 </>
 )}
 </div>

 {images.length > 1 && (
 <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
 {images.map((img, i) => (
 <button
 key={i}
 onClick={() => setIndex(i)}
 className={`relative size-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
 i === index ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-800 hover:border-slate-700'
 }`}
 >
 <Image src={img} alt="" fill className="object-cover" />
 </button>
 ))}
 </div>
 )}
 </div>
 );
}
