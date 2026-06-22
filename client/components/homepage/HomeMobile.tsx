"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowRight, Globe, Shield, Zap, Package, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/client";

import TrendingCategories from "@/components/ui/TrendingCategories";
import HomeFooter from "@/components/homepage/HomeFooter";

export default function HomeMobile() {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-background text-foreground overflow-hidden">
      {/* ─── Mobile Top Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/assets/LOGO.png" alt="Ranote Exim" width={120} height={32} className="object-contain" unoptimized />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs font-bold uppercase tracking-wider text-white/70">Login</Link>
          <Link href="/products" className="bg-primary text-white p-2 rounded-full shadow-lg shadow-primary/20">
            <ShoppingBag className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* ─── Mobile Hero Section ─── */}
      <header className="relative pt-24 pb-16 px-4 min-h-[85vh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/assets/globe_dark_theme.avif')] bg-cover bg-center opacity-40 mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute top-20 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-black tracking-tighter leading-[1.1] mb-4">
              <span className="text-white drop-shadow-lg">TRADE</span>
              <br />
              <span className="text-white drop-shadow-lg">WITHOUT</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 text-glow">
                BORDERS
              </span>
            </h1>
            <p className="text-base text-white/70 font-light leading-relaxed mb-8">
              The next-generation B2B marketplace. Connect with verified suppliers, automate logistics, and track shipments globally.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-3"
          >
            <Link
              href="/products"
              className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 primary-glow shadow-[0_0_20px_-5px_rgba(19,91,236,0.5)] active:scale-95 transition-transform"
            >
              Start Importing
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/faq"
              className="w-full bg-white/5 border border-white/10 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 active:bg-white/10 transition-colors"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </header>

      {/* ─── Fast Stats Marquee ─── */}
      <div className="w-full bg-white/5 border-y border-white/10 py-4 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex gap-8 whitespace-nowrap animate-[marquee_20s_linear_infinite] px-4 items-center">
          {[
            { label: "Verified Suppliers", val: "10k+" },
            { label: "Global Reach", val: "150+" },
            { label: "Products", val: "1M+" },
            { label: "Secure Payments", val: "100%" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-amber-400 font-black">{stat.val}</span>
              <span className="text-white/60 text-xs font-medium uppercase tracking-widest">{stat.label}</span>
              <span className="text-white/20 mx-4">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Mobile Categories ─── */}
      <section className="py-12 px-4 relative">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Explore Categories</h2>
            <p className="text-xs text-white/50 uppercase tracking-widest">Global Marketplace</p>
          </div>
          <Link href="/products" className="text-primary text-sm font-semibold flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        {/* We can reuse the existing TrendingCategories, but it might need to handle its own mobile view properly. */}
        <div className="w-full">
          <TrendingCategories />
        </div>
      </section>

      {/* ─── Mobile Features Grid ─── */}
      <section className="py-12 px-4 bg-gradient-to-b from-background to-white/[0.02]">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Why Ranote Exim?</h2>
          <p className="text-sm text-white/60">Enterprise-grade tools for modern global trade.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[
            {
              icon: Globe,
              title: "Global Connectivity",
              desc: "Access verified manufacturers and buyers from over 150 countries instantly.",
              color: "text-blue-400",
              bg: "bg-blue-400/10"
            },
            {
              icon: Shield,
              title: "Secure Transactions",
              desc: "Bank-grade security and escrow services ensuring peace of mind.",
              color: "text-amber-400",
              bg: "bg-amber-400/10"
            },
            {
              icon: Zap,
              title: "Automated Logistics",
              desc: "AI-driven freight forwarding and real-time shipment tracking.",
              color: "text-emerald-400",
              bg: "bg-emerald-400/10"
            },
            {
              icon: Package,
              title: "Bulk Procurement",
              desc: "Streamlined RFQ process and bulk pricing negotiation tools.",
              color: "text-purple-400",
              bg: "bg-purple-400/10"
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.bg} ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{feature.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Mobile CTA ─── */}
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
            <Globe className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Ready to Expand?</h2>
          <p className="text-sm text-white/70 mb-8 max-w-[280px]">
            Join thousands of businesses sourcing globally with zero friction.
          </p>
          <Link
            href="/register"
            className="w-full bg-white text-black font-black uppercase tracking-wider py-4 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 transition-transform"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ─── Mobile Footer ─── */}
      <div className="pb-10">
        <HomeFooter />
      </div>

    </div>
  );
}
