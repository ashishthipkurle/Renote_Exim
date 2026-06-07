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
import ScrollVideoSection from "@/components/homepage/ScrollVideoSection";
import InlineScrollVideo from "@/components/homepage/InlineScrollVideo";

export default function HomeClient() {
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

    return () => {
      triggerObserver.disconnect();
      scrollObserver.disconnect();
    };
  }, []);

  return (
    <div className="bg-background text-foreground font-display selection:bg-primary selection:text-white w-full">
      <ScrollVideoSection />

      {/* ─── Marketplace Content Reveal Wrapper ─── */}
      <div
        id="home-content-reveal"
        className="relative z-10 bg-background shadow-[0_-20px_50px_rgba(0,0,0,0.3)]"
      >
        <HomeNavbar />
        <HomeHero />
        <ForwardMarquee />
        <StatsBar />
        <TrendingCategories />
        {/* ─── Scroll-Linked Video Scene Boundary ─── */}
        <div className="relative w-full z-10">
          <FeaturesSection />

          <InlineScrollVideo
            videoSrc="https://res.cloudinary.com/dpy7s0cbs/video/upload/f_auto,q_auto/v1780753573/new_ui_video.mp4"
            previousSectionId="features-section"
            totalFrames={120}
            scrollDistance={2500}
          />
        </div>

        <div id="post-video-content" style={{ display: 'block' }}>
          <GlobalHubsSection />
          <ReverseMarquee />
          <BulkProcurement />
          <ConnectivitySection />
          <ComplianceSection />
          <CTASection />
          <HomeFooter />
        </div>
      </div>
    </div>
  );
}
