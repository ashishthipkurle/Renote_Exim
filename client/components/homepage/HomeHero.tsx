"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n/client";

export default function HomeHero() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax Scroll Effect for the realistic globe images
  useEffect(() => {
    const onScroll = () => {
      const globes = document.querySelectorAll<HTMLElement>(".parallax-globe");
      const section = sectionRef.current;
      if (globes.length === 0 || !section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate how far the section has scrolled *past* the top of the viewport.
      const scrolled = Math.max(0, -rect.top);

      const newY = 20 + scrolled * 0.04;
      const rotation = scrolled * -0.02; // Negative value rotates it left-to-right
      const scale = 1.05 + scrolled * 0.0003;

      globes.forEach((globe) => {
        globe.style.backgroundPosition = `center ${Math.min(newY, 100)}%`;
        globe.style.transform = `scale(${scale}) rotate(${rotation}deg)`;

        // Fade out dark theme specifically slightly if needed, or just let it be
        if (globe.id === "hero-globe-dark") {
          globe.style.opacity = scrolled > viewportHeight
            ? "0.6"
            : String(Math.min(1, Math.max(0.6, 0.9 - scrolled * 0.0003)));
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // Initial call

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={sectionRef}
      className="relative min-h-[900px] lg:min-h-[1000px] flex items-center justify-center overflow-hidden pt-20 pb-12 bg-background transition-colors duration-500"
    >
      <div className="absolute inset-0 z-0">

        {/* Light Mode Realistic Globe */}
        <div
          className="parallax-globe absolute inset-0 bg-[url('/assets/globe_light_theme.png')] bg-cover bg-center dark:hidden opacity-100 transition-transform duration-100 ease-linear"
          id="hero-globe-light"
          aria-hidden="true"
        />

        {/* Dark Mode Realistic Globe */}
        <div
          className="parallax-globe absolute inset-0 hidden dark:block bg-[url('/assets/globe_dark_theme.avif')] bg-cover bg-center opacity-90 transition-transform duration-100 ease-linear"
          id="hero-globe-dark"
          aria-hidden="true"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:from-background-dark/90 dark:via-transparent dark:to-background-dark transition-colors duration-500 pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent dark:from-background-dark/80 dark:via-transparent dark:to-background-dark/80 transition-colors duration-500 pointer-events-none" aria-hidden="true" />
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] animate-pulse transition-opacity duration-500 opacity-20 dark:opacity-100 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-1/3 right-1/4 w-[35rem] h-[35rem] bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full blur-[140px] transition-opacity duration-500 opacity-20 dark:opacity-100 pointer-events-none" aria-hidden="true" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center justify-center h-full mt-10">


        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold text-foreground mb-8 tracking-tight leading-none drop-shadow-2xl transition-colors duration-500">
          {t("hero.title_part1", "TRADE WITHOUT")} <br />
          <span className="gradient-text-gold text-glow relative inline-block">
            {t("hero.title_part2", "BORDERS")}
            <svg
              className="absolute -bottom-2 w-full h-3 text-[#D4AF37] opacity-60"
              fill="none"
              viewBox="0 0 200 9"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.00025 6.99999C44.7571 2.29657 122.373 -3.10271 197.986 6.99999"
                stroke="currentColor"
                strokeWidth="3"
              />
            </svg>
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-light drop-shadow-lg transition-colors duration-500">
          {t("hero.subtitle", "The next-generation B2B marketplace. Connect with verified suppliers, automate logistics, and track shipments in real-time across our immersive global network.")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-lg mx-auto">
          <Link
            className="w-full sm:w-1/2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-5 px-8 rounded-xl primary-glow transition-all duration-300 text-lg flex items-center justify-center gap-2 group flowing-border primary-glow-hover shadow-[0_0_40px_-10px_rgba(19,91,236,0.6)] hover:shadow-[0_0_60px_-10px_rgba(19,91,236,0.8)] hover:-translate-y-1"
            href="/products"
          >
            {t("hero.cta_start", "Start Importing")}
            <span className="material-icons group-hover:translate-x-1 transition-transform text-sm">arrow_forward</span>
          </Link>
          <Link
            className="w-full sm:w-1/2 hover:bg-background/80 dark:hover:bg-white/10 text-foreground font-semibold py-5 px-8 rounded-xl transition-all duration-300 text-lg flex items-center justify-center gap-2 border border-border hover:border-border/80 hover:-translate-y-1 bg-background/40 backdrop-blur-xl shadow-lg"
            href="/products"
          >
            <span className="material-icons text-primary text-xl">shopping_cart</span>
            {t("hero.cta_buy", "Buy Products")}
          </Link>
        </div>
      </div>


    </header>
  );
}
