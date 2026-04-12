"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
 title?: string;
 message?: string;
 onRetry?: () => void;
}

export function ErrorState({
 title = "Something went wrong",
 message = "We encountered an error. Please try again.",
 onRetry
}: ErrorStateProps) {
 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.3 }}
 className="flex flex-col items-center justify-center py-16 px-4"
 >
 <div className="w-24 h-24 bg-muted/20 backdrop-blur-3xl border border-border rounded-lg flex items-center justify-center mb-8 text-white shadow-2xl relative group">
 <div className="absolute inset-0 bg-white/5 rounded-lg animate-pulse group-hover:bg-white/10 transition-colors" />
 <AlertCircle className="w-10 h-10 relative z-10 opacity-40 group-hover:opacity-100 transition-opacity" />
 </div>
 <h3 className="text-2xl font-black text-white mb-3 tracking-tighter uppercase ">{title}</h3>
 <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] text-center max-w-md mb-10 leading-relaxed opacity-60">{message}</p>
 {onRetry && (
 <button 
 onClick={onRetry}
 className="bg-white hover:bg-neutral-200 text-black px-8 h-12 rounded-lg transition-all shadow-2xl shadow-white/10 font-black uppercase tracking-[0.2em] flex items-center gap-3 text-[10px] active:scale-95"
 >
 <RefreshCw className="w-4 h-4" />
 Re-Initialize
 </button>
 )}
 </motion.div>
 );
}
