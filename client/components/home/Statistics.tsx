"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { TrendingUp, Users, Globe2, Package } from "lucide-react";

const stats = [
 {
 icon: TrendingUp,
 value: 2400000000,
 prefix: "$",
 suffix: "",
 label: "Trade Volume",
 color: "from-blue-600 to-cyan-600",
 },
 {
 icon: Users,
 value: 15000,
 prefix: "",
 suffix: "+",
 label: "Active Traders",
 color: "from-purple-600 to-pink-600",
 },
 {
 icon: Globe2,
 value: 190,
 prefix: "",
 suffix: "+",
 label: "Countries",
 color: "from-green-600 to-emerald-600",
 },
 {
 icon: Package,
 value: 50000,
 prefix: "",
 suffix: "+",
 label: "Products Listed",
 color: "from-orange-600 to-red-600",
 },
];

function AnimatedCounter({ value, prefix, suffix }: { value: number; prefix: string; suffix: string }) {
 const [count, setCount] = useState(0);
 const ref = useRef(null);
 const isInView = useInView(ref, { once: true, margin: "-100px" });

 useEffect(() => {
 if (!isInView) return;

 const duration = 2000;
 const steps = 60;
 const increment = value / steps;
 let current = 0;

 const timer = setInterval(() => {
 current += increment;
 if (current >= value) {
 setCount(value);
 clearInterval(timer);
 } else {
 setCount(Math.floor(current));
 }
 }, duration / steps);

 return () => clearInterval(timer);
 }, [isInView, value]);

 return (
 <span ref={ref}>
 {prefix}
 {value >= 1000000000
 ? (count / 1000000000).toFixed(1) + "B"
 : value >= 1000000
 ? (count / 1000000).toFixed(1) + "M"
 : value >= 1000
 ? (count / 1000).toFixed(count >= value ? 0 : 1) + "K"
 : count}
 {suffix}
 </span>
 );
}

export default function Statistics() {
 const ref = useRef(null);
 const isInView = useInView(ref, { once: true, margin: "-100px" });

 return (
 <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
 {/* Animated Background */}
 <div className="absolute inset-0">
 <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
 <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
 </div>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
 <motion.div
 ref={ref}
 initial={{ opacity: 0, y: 30 }}
 animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
 transition={{ duration: 0.6 }}
 className="text-center mb-16"
 >
 <div className="inline-block px-4 py-2 bg-blue-500/20 backdrop-blur-sm text-blue-300 rounded-full text-sm font-medium mb-4 border border-blue-500/30">
 Our Impact
 </div>
 <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
 Trusted by Thousands
 </h2>
 <p className="text-xl text-slate-300 max-w-3xl mx-auto">
 Join a thriving community of exporters and importers doing business globally.
 </p>
 </motion.div>

 <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
 {stats.map((stat, index) => {
 const Icon = stat.icon;
 return (
 <motion.div
 key={index}
 initial={{ opacity: 0, scale: 0.8 }}
 animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
 transition={{ duration: 0.5, delay: index * 0.1 }}
 className="group"
 >
 <div className="relative p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10">
 {/* Icon */}
 <div className="flex justify-center mb-4">
 <div
 className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
 >
 <Icon className="text-white" size={32} />
 </div>
 </div>

 {/* Value */}
 <div className="text-4xl md:text-5xl font-bold text-white mb-2 text-center">
 <AnimatedCounter
 value={stat.value}
 prefix={stat.prefix}
 suffix={stat.suffix}
 />
 </div>

 {/* Label */}
 <p className="text-slate-300 text-center">{stat.label}</p>
 </div>
 </motion.div>
 );
 })}
 </div>
 </div>
 </section>
 );
}
