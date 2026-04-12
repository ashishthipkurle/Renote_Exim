"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
 icon: LucideIcon;
 title: string;
 description: string;
 action?: {
 label: string;
 onClick: () => void;
 };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.3 }}
 className="flex flex-col items-center justify-center py-16 px-4"
 >
 <div className="w-24 h-24 bg-muted/20 backdrop-blur-3xl border border-border rounded-lg flex items-center justify-center mb-8 text-white shadow-2xl relative group">
 <div className="absolute inset-0 bg-white/5 rounded-lg animate-pulse group-hover:bg-white/10 transition-colors" />
 <Icon className="w-10 h-10 relative z-10 opacity-40 group-hover:opacity-100 transition-opacity" />
 </div>
 <h3 className="text-2xl font-black text-white mb-3 tracking-tighter uppercase ">{title}</h3>
 <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] text-center max-w-md mb-10 leading-relaxed opacity-60">{description}</p>
 {action && (
 <button 
 onClick={action.onClick}
 className="bg-white hover:bg-neutral-200 text-black px-10 h-14 rounded-lg transition-all shadow-2xl shadow-white/10 font-black uppercase tracking-[0.2em] active:scale-[0.98] text-[10px]"
 >
 {action.label}
 </button>
 )}
 </motion.div>
 );
}
