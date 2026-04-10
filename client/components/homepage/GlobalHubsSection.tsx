import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useTranslation } from "@/lib/i18n/client";

export default function GlobalHubsSection() {
  const { t } = useTranslation();
  const shipRef = useRef<HTMLImageElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [loadingItems, setLoadingItems] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (shipRef.current && sectionRef.current) {
      gsap.fromTo(
        shipRef.current,
        { x: "30vw", y: "-30vh" },
        {
          x: "-30vw",
          y: "30vh",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    }
  }, []);

  const handleItemClick = (itemId: string) => {
    // Start loading animation
    setLoadingItems((prev) => ({ ...prev, [itemId]: true }));

    // Simulate async operation (replace with actual API call)
    setTimeout(() => {
      setLoadingItems((prev) => ({ ...prev, [itemId]: false }));
    }, 2000);
  };

  return (
    <section ref={sectionRef} className="py-24 relative bg-background overflow-hidden flex items-center min-h-[90vh]">
      {/* Port Background */}
      <div className="absolute top-0 right-0 w-full md:w-[60%] h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background z-10 opacity-60" />
        <Image
          src="https://images.unsplash.com/photo-1586528116311-ad8ed7c80a30?q=80&w=2070"
          alt="Container Port"
          width={1200} height={800}
          className="w-full h-full object-cover opacity-20 dark:opacity-30 mix-blend-luminosity filter contrast-125"
        />
      </div>

      {/* Animated Cargo Ship */}
      <div className="absolute inset-0 pointer-events-none z-[5] flex justify-center items-center opacity-90 overflow-visible">
        <Image
          ref={shipRef}
          src="/custom-ship-2.png"
          alt="Cargo Ship"
          width={1200} height={800}
          className="w-[1200px] max-w-none object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
          unoptimized
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16 relative z-10 w-full">
        <div className="w-full md:w-[45%] reveal-trigger">
          <div className="relative rounded-2xl overflow-hidden glass-card p-8 border border-border shadow-2xl bg-background/60 backdrop-blur-xl">
            <h3 className="text-3xl font-bold text-foreground mb-4">{t("hubs.title", "Strategic Global Hubs")}</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
              {t("hubs.description", "Our network of strategically located port facilities ensures your cargo never stops moving. From Shanghai to Rotterdam, we maintain priority access and dedicated customs channels.")}
            </p>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <div>
                  <h4 className="text-foreground font-bold">{t("hubs.singapore", "Singapore Port")}</h4>
                  <p className="text-sm text-muted-foreground">{t("hubs.singapore_region", "Asia Pacific Hub")}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30 rounded-full text-[10px] uppercase font-bold tracking-widest">{t("hubs.status_active", "ACTIVE")}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <div>
                  <h4 className="text-slate-900 dark:text-white font-bold">{t("hubs.rotterdam", "Port of Rotterdam")}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t("hubs.rotterdam_region", "EMEA Gateway")}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30 rounded-full text-[10px] uppercase font-bold tracking-widest">{t("hubs.status_active", "ACTIVE")}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-slate-900 dark:text-white font-bold">{t("hubs.la", "Port of Los Angeles")}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t("hubs.la_region", "Americas Terminal")}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30 rounded-full text-[10px] uppercase font-bold tracking-widest">{t("hubs.status_congested", "CONGESTED")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[55%] space-y-8 reveal-trigger pl-0 md:pl-10" style={{ transitionDelay: "200ms" }}>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">{t("hubs.main_title_part1", "STRATEGIC")} <br /><span className="text-primary">{t("hubs.main_title_part2", "GLOBAL HUBS")}</span></h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">{t("hubs.main_subtitle", "Our physical presence in 40+ major logistical hubs ensures your goods are handled with priority. From Singapore to Rotterdam, we provide on-ground support.")}</p>
          <div className="space-y-4 pt-4 max-w-xl">
            <div
              onClick={() => handleItemClick("expedited")}
              className="group flex items-center gap-6 p-6 rounded-2xl bg-white/40 dark:bg-[#0A0E17]/40 backdrop-blur-sm border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/10"
            >
              {loadingItems["expedited"] ? (
                <div className="flex items-center justify-center w-12 h-12">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm dark:shadow-[0_0_15px_rgba(19,91,236,0.3)]">
                  01
                </div>
              )}
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold text-lg">
                  {t("hubs.clear_title", "Expedited Clearance")}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("hubs.clear_desc", "Average 4 hours processing time")}
                </p>
              </div>
            </div>
            <div
              onClick={() => handleItemClick("warehousing")}
              className="group flex items-center gap-6 p-6 rounded-2xl bg-white/40 dark:bg-[#0A0E17]/40 backdrop-blur-sm border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/10"
            >
              {loadingItems["warehousing"] ? (
                <div className="flex items-center justify-center w-12 h-12">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm dark:shadow-[0_0_15px_rgba(19,91,236,0.3)]">
                  02
                </div>
              )}
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold text-lg">
                  {t("hubs.warehouse_title", "Warehousing Network")}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("hubs.warehouse_desc", "2.5M sq ft of secure storage")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
