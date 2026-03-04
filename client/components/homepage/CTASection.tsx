"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden bg-slate-100 dark:bg-transparent">
      <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-white to-slate-100 dark:from-primary/20 dark:via-background-dark/80 dark:to-background-dark" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center reveal-on-scroll">
        <h2 className="text-5xl md:text-7xl font-bold text-primary mb-8 tracking-tight drop-shadow-xl">
          READY TO SCALE?
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
          Join over 10,000 global enterprises transforming their supply chain with <span className="text-slate-900 dark:text-white font-semibold">Ranote Exim</span>.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold py-5 px-12 rounded-xl primary-glow transition-all duration-300 text-lg shadow-xl hover:-translate-y-1 primary-glow-hover"
            href="/register"
          >
            Join the Network
          </Link>
          <Link
            className="w-full sm:w-auto text-slate-900 dark:text-white border border-slate-300 dark:border-white/20 hover:bg-white/50 dark:hover:bg-white/5 font-bold py-5 px-12 rounded-xl transition-all duration-300 text-lg hover:-translate-y-1"
            href="/contact"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </section>
  );
}
