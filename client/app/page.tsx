"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import TrendingCategories from "@/components/ui/TrendingCategories";
import HomeNavbar from "@/components/homepage/HomeNavbar";
import HomeHero from "@/components/homepage/HomeHero";
import { ForwardMarquee, ReverseMarquee } from "@/components/homepage/MarqueeTickers";
import StatsBar from "@/components/homepage/StatsBar";
import FeaturesSection from "@/components/homepage/FeaturesSection";
import GlobalHubsSection from "@/components/homepage/GlobalHubsSection";
import BulkProcurement from "@/components/homepage/BulkProcurement";
import ConnectivitySection from "@/components/homepage/ConnectivitySection";
import ComplianceSection from "@/components/homepage/ComplianceSection";
import CTASection from "@/components/homepage/CTASection";
import HomeFooter from "@/components/homepage/HomeFooter";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Returning USER (B2C) → auto-redirect to marketplace
  useEffect(() => {
    if (!loading && user && user.role === "USER") {
      router.replace("/products");
    }
  }, [user, loading, router]);
  /* Global scroll-reveal observers and parallax globe handler */
  useEffect(() => {
    // Reveal-trigger: fade-in + slide-up on first intersection
    const triggerObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("opacity-0", "translate-y-[60px]");
          entry.target.classList.add("opacity-100", "translate-y-0");
          obs.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );

    document.querySelectorAll<HTMLElement>(".reveal-trigger").forEach((el) => {
      el.classList.add("opacity-0", "translate-y-[60px]", "transition-all", "duration-1000", "ease-out");
      triggerObserver.observe(el);
    });

    // Reveal-on-scroll: add .active class on intersection
    const scrollObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add("active");
          obs.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.15 }
    );

    document.querySelectorAll<HTMLElement>(".reveal-on-scroll").forEach((el) => {
      scrollObserver.observe(el);
    });

    // Parallax globe backgrounds
    const heroGlobes = document.querySelectorAll<HTMLElement>(".parallax-globe");
    const onScroll = () => {
      if (heroGlobes.length === 0) return;
      const scrolled = window.scrollY;
      const viewportHeight = window.innerHeight;
      const newY = 20 + scrolled * 0.04;
      const rotation = scrolled * 0.02;
      const scale = 1.05 + scrolled * 0.0003;

      heroGlobes.forEach((globe) => {
        globe.style.backgroundPosition = `center ${newY}%`;
        globe.style.transform = `scale(${scale}) rotate(${rotation}deg)`;

        if (globe.id === "hero-globe-dark") {
          globe.style.opacity = scrolled > viewportHeight
            ? "0.4"
            : String(Math.min(1, Math.max(0.4, 0.4 + scrolled * 0.0001)));
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      triggerObserver.disconnect();
      scrollObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display selection:bg-primary selection:text-white">
      <HomeNavbar />
      <HomeHero />
      <ForwardMarquee />
      <StatsBar />
      <TrendingCategories />
      <FeaturesSection />
      <GlobalHubsSection />
      <ReverseMarquee />
      <BulkProcurement />
      <ConnectivitySection />
      <ComplianceSection />
      <CTASection />
      <HomeFooter />
    </div>
  );
}
