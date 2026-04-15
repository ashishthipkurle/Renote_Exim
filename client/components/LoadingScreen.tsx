"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
 const [progress, setProgress] = useState(0);

 useEffect(() => {
 const interval = setInterval(() => {
 setProgress((prev) => {
 if (prev >= 100) {
 clearInterval(interval);
 return 100;
 }
 return prev + 10;
 });
 }, 150);

 return () => clearInterval(interval);
 }, []);

 return (
 <AnimatePresence>
 <motion.div
 initial={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.5 }}
 className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"
 >
 {/* Animated Background */}
 <div className="absolute inset-0 overflow-hidden">
 <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
 <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
 </div>

 {/* Logo Container */}
 <div className="relative z-10 flex flex-col items-center gap-8">
 {/* Logo with Glow Effect */}
 <motion.div
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.5 }}
 className="relative"
 >
 <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
 <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-lg shadow-2xl">
 <svg
 width="80"
 height="80"
 viewBox="0 0 80 80"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path
 d="M20 20L40 10L60 20V40L40 50L20 40V20Z"
 stroke="white"
 strokeWidth="3"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 <path
 d="M20 40L40 50L60 40V60L40 70L20 60V40Z"
 stroke="white"
 strokeWidth="3"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 <path
 d="M40 30L40 50"
 stroke="white"
 strokeWidth="3"
 strokeLinecap="round"
 />
 </svg>
 </div>
 </motion.div>

 {/* Company Name */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="text-center"
 >
 <h1 className="text-4xl font-bold text-white mb-2">
 Ranote <span className="text-blue-400">Exim</span>
 </h1>
 <p className="text-slate-400 text-sm">Global Trade Platform</p>
 </motion.div>

 {/* Progress Ring */}
 <div className="relative w-32 h-32">
 <svg className="w-full h-full -rotate-90">
 <circle
 cx="64"
 cy="64"
 r="56"
 stroke="rgba(255,255,255,0.1)"
 strokeWidth="8"
 fill="none"
 />
 <motion.circle
 cx="64"
 cy="64"
 r="56"
 stroke="url(#gradient)"
 strokeWidth="8"
 fill="none"
 strokeLinecap="round"
 initial={{ pathLength: 0 }}
 animate={{ pathLength: progress / 100 }}
 transition={{ duration: 0.3 }}
 style={{
 pathLength: progress / 100,
 }}
 />
 <defs>
 <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
 <stop offset="0%" stopColor="#3b82f6" />
 <stop offset="100%" stopColor="#8b5cf6" />
 </linearGradient>
 </defs>
 </svg>
 <div className="absolute inset-0 flex items-center justify-center">
 <span className="text-2xl font-bold text-white">{progress}%</span>
 </div>
 </div>

 {/* Loading Text */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.5 }}
 className="flex items-center gap-2 text-slate-400"
 >
 <Loader2 className="w-4 h-4 animate-spin" />
 <span className="text-sm">Initializing platform...</span>
 </motion.div>
 </div>
 </motion.div>
 </AnimatePresence>
 );
}
