"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
 Shield,
 Zap,
 Globe2,
 TrendingUp,
 Lock,
 HeartHandshake,
} from "lucide-react";

const features = [
 {
 icon: Shield,
 title: "Verified Businesses",
 description:
 "All exporters and importers are thoroughly verified to ensure secure transactions and trustworthy partnerships.",
 color: "from-blue-600 to-cyan-600",
 },
 {
 icon: Zap,
 title: "Lightning Fast",
 description:
 "Process orders, track shipments, and communicate with partners in real-time with our optimized platform.",
 color: "from-purple-600 to-pink-600",
 },
 {
 icon: Globe2,
 title: "Global Reach",
 description:
 "Connect with businesses across 190+ countries and expand your trade network worldwide.",
 color: "from-green-600 to-emerald-600",
 },
 {
 icon: Lock,
 title: "Bank-Level Security",
 description:
 "Enterprise-grade encryption and security protocols protect your sensitive business data and transactions.",
 color: "from-orange-600 to-red-600",
 },
 {
 icon: TrendingUp,
 title: "Analytics & Insights",
 description:
 "Make data-driven decisions with comprehensive analytics, market trends, and performance metrics.",
 color: "from-indigo-600 to-blue-600",
 },
 {
 icon: HeartHandshake,
 title: "Dedicated Support",
 description:
 "24/7 expert support team ready to assist with your international trade operations and queries.",
 color: "from-pink-600 to-rose-600",
 },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
 const ref = useRef(null);
 const isInView = useInView(ref, { once: true, margin: "-100px" });
 const Icon = feature.icon;

 return (
 <motion.div
 ref={ref}
 initial={{ opacity: 0, y: 50 }}
 animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
 transition={{ duration: 0.5, delay: index * 0.1 }}
 className="group relative"
 >
 <div className="relative h-full p-8 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl">
 {/* Icon */}
 <div className="relative mb-6">
 <div
 className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-20 blur-xl group-hover:opacity-30 transition-opacity rounded-full`}
 />
 <div
 className={`relative w-16 h-16 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
 >
 <Icon className="text-white" size={32} />
 </div>
 </div>

 {/* Content */}
 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
 <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>

 {/* Hover Effect Line */}
 <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-500 rounded-full" />
 </div>
 </motion.div>
 );
}

export default function Features() {
 const ref = useRef(null);
 const isInView = useInView(ref, { once: true, margin: "-100px" });

 return (
 <section className="py-24 bg-slate-50 dark:bg-slate-950">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <motion.div
 ref={ref}
 initial={{ opacity: 0, y: 30 }}
 animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
 transition={{ duration: 0.6 }}
 className="text-center mb-16"
 >
 <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
 Why Choose Us
 </div>
 <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
 Built for Modern Trade
 </h2>
 <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
 Everything you need to succeed in international import-export business,
 powered by cutting-edge technology.
 </p>
 </motion.div>

 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
 {features.map((feature, index) => (
 <FeatureCard key={index} feature={feature} index={index} />
 ))}
 </div>
 </div>
 </section>
 );
}
