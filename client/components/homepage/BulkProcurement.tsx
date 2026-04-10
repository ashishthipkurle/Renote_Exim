import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, Check, ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";

export default function BulkProcurement() {
  const { t } = useTranslation();
  const bulkSectionRef = useRef<HTMLElement>(null);
  const bulkHeadingRef = useRef<HTMLDivElement>(null);
  const bulkMainCardRef = useRef<HTMLDivElement>(null);
  const bulkSubCardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (bulkSectionRef.current && bulkHeadingRef.current && bulkMainCardRef.current && bulkSubCardsRef.current) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: bulkSectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        bulkHeadingRef.current,
        { scale: 0.5, y: 100, opacity: 0, rotationX: 45 },
        { scale: 1, y: 0, opacity: 1, rotationX: 0, duration: 1, ease: "elastic.out(1, 0.5)" }
      )
        .fromTo(
          bulkMainCardRef.current,
          { x: -200, opacity: 0, rotationY: 45 },
          { x: 0, opacity: 1, rotationY: 0, duration: 0.8, ease: "power3.out" },
          "-=0.6"
        )
        .fromTo(
          bulkSubCardsRef.current.children,
          { x: 200, opacity: 0, rotationY: -45, scale: 0.8 },
          { x: 0, opacity: 1, rotationY: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: "back.out(1.5)" },
          "-=0.6"
        );
    }
  }, []);

  return (
    <section ref={bulkSectionRef} className="relative z-20 overflow-hidden border-b border-slate-200 dark:border-white/5" style={{ perspective: "1500px" }}>
      {/* Split Background */}
      <div className="absolute inset-0 flex flex-col lg:flex-row pointer-events-none -z-10 bg-background">
        <div
          className="w-full lg:w-1/2 h-full relative"
          style={{
            WebkitMaskImage: "linear-gradient(to right, black 70%, transparent 100%)",
            maskImage: "linear-gradient(to right, black 70%, transparent 100%)",
          }}
        >
          <Image src="/bulk-warehouse.png" alt="Warehouse Operations" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-background/60 lg:hidden"></div>
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-background to-transparent opacity-80"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div ref={bulkHeadingRef} className="text-center mb-16 opacity-0">
          <span className="text-primary text-sm font-bold uppercase tracking-widest mb-2 block">{t("bulk.badge", "Enterprise Sourcing")}</span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {t("bulk.title_part1", "BULK PROCUREMENT")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">{t("bulk.title_part2", "SOLUTIONS")}</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div ref={bulkMainCardRef} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/50 dark:border-white/10 relative overflow-hidden shadow-2xl opacity-0 flex flex-col justify-center h-full max-w-xl mx-auto lg:mr-auto">
             <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center mb-6 shadow-sm relative z-10">
              <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 stroke-[1.5]" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 relative z-10">{t("bulk.card_title", "Verified Global Suppliers")}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8 max-w-sm relative z-10">
              {t("bulk.card_desc", "Access a curated network of 50,000+ top-tier manufacturers. We audit every factory for compliance, capacity, and financial stability so you can source with total confidence.")}
            </p>
            <ul className="space-y-4 mb-8 relative z-10">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-green-600 dark:text-green-500 shrink-0 stroke-[3]" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t("bulk.list_item1", "Factory Audits & Certifications")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-green-600 dark:text-green-500 shrink-0 stroke-[3]" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t("bulk.list_item2", "Quality Control Inspections")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-green-600 dark:text-green-500 shrink-0 stroke-[3]" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t("bulk.list_item3", "Trade Finance Support")}</span>
              </li>
            </ul>
            <div className="mt-auto relative z-10">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 group/btn max-w-max text-sm shadow-lg shadow-blue-500/20">
                {t("bulk.button", "Request Bulk Quote")}
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div ref={bulkSubCardsRef} className="grid grid-cols-1 gap-4" style={{ perspective: "1000px" }}>
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/50 transition-all duration-300 flex items-center gap-6 group cursor-pointer hover:bg-muted opacity-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center relative">
                <span className="absolute inset-0 bg-primary/20 animate-pulse rounded-lg"></span>
                <span className="material-symbols-outlined text-2xl text-white relative z-10">diamond</span>
              </div>
              <div className="flex-1">
                <h4 className="text-slate-900 dark:text-white font-bold text-lg group-hover:text-primary transition-colors">{t("bulk.category1_title", "Raw Metals & Minerals")}</h4>
                <p className="text-xs text-slate-500 mt-1">{t("bulk.category1_desc", "Copper, Lithium, Rare Earths")}</p>
              </div>
              <span className="material-icons text-slate-600 group-hover:text-white transition-colors">chevron_right</span>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 shadow-sm dark:border-white/5 dark:shadow-none hover:border-primary/50 transition-all duration-300 flex items-center gap-6 group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 opacity-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center relative">
                <span className="absolute inset-0 bg-yellow-500/20 animate-pulse rounded-lg" style={{ animationDelay: "0.5s" }}></span>
                <span className="material-symbols-outlined text-2xl text-white relative z-10">agriculture</span>
              </div>
              <div className="flex-1">
                <h4 className="text-slate-900 dark:text-white font-bold text-lg group-hover:text-primary transition-colors">{t("bulk.category2_title", "Global Agriculture")}</h4>
                <p className="text-xs text-slate-500 mt-1">{t("bulk.category2_desc", "Wheat, Soy, Coffee, Cotton")}</p>
              </div>
              <span className="material-icons text-slate-600 group-hover:text-white transition-colors">chevron_right</span>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 shadow-sm dark:border-white/5 dark:shadow-none hover:border-primary/50 transition-all duration-300 flex items-center gap-6 group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 opacity-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center relative">
                <span className="absolute inset-0 bg-blue-500/20 animate-pulse rounded-lg" style={{ animationDelay: "1s" }}></span>
                <span className="material-symbols-outlined text-2xl text-white relative z-10">bolt</span>
              </div>
              <div className="flex-1">
                <h4 className="text-slate-900 dark:text-white font-bold text-lg group-hover:text-primary transition-colors">{t("bulk.category3_title", "Energy Solutions")}</h4>
                <p className="text-xs text-slate-500 mt-1">{t("bulk.category3_desc", "Solar Panels, Batteries, Biofuels")}</p>
              </div>
              <span className="material-icons text-slate-600 group-hover:text-white transition-colors">chevron_right</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
