import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import WebGLBoundary from "@/components/webgl/WebGLBoundary";

// Dynamic import for WebGL component to avoid SSR issues
const GlobeScene = dynamic(() => import("@/components/webgl/GlobeScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-slate-50 dark:bg-background-dark" />,
});

export default function HomeHero() {
  const [webglError, setWebglError] = useState(false);

  // Parallax Scroll Effect for Fallback Globe
  useEffect(() => {
    if (!webglError) return;

    const onScroll = () => {
      const globes = document.querySelectorAll<HTMLElement>(".parallax-globe");
      if (globes.length === 0) return;
      
      const scrolled = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      const newY = 20 + scrolled * 0.04;
      const rotation = scrolled * 0.02;
      const scale = 1.05 + scrolled * 0.0003;

      globes.forEach((globe) => {
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
    onScroll(); // Initial call
    
    return () => window.removeEventListener("scroll", onScroll);
  }, [webglError]);

  // Fallback Globe UI (Original Image Based)
  const FallbackGlobe = () => (
    <>
      <div
        className="parallax-globe absolute inset-0 bg-[url('/assets/globe_light_theme.png')] bg-cover bg-center dark:hidden opacity-100"
        id="hero-globe-light"
        aria-hidden="true"
      />
      <div
        className="parallax-globe absolute inset-0 hidden dark:block bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-screen transition-transform duration-100 ease-linear"
        id="hero-globe-dark"
        aria-hidden="true"
      />
    </>
  );

  return (
    <header className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-20 pb-12 bg-background transition-colors duration-500">
      <div className="absolute inset-0 z-0">
        {/* Cinematic WebGL Engine (3D Globe) with Error Boundary & Fallback */}
        {!webglError ? (
          <WebGLBoundary fallback={<FallbackGlobe />} onError={() => setWebglError(true)}>
            <GlobeScene />
          </WebGLBoundary>
        ) : (
          <FallbackGlobe />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:from-background-dark/90 dark:via-transparent dark:to-background-dark transition-colors duration-500 pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent dark:from-background-dark/80 dark:via-transparent dark:to-background-dark/80 transition-colors duration-500 pointer-events-none" aria-hidden="true" />
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] animate-pulse transition-opacity duration-500 opacity-20 dark:opacity-100 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-1/3 right-1/4 w-[35rem] h-[35rem] bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full blur-[140px] transition-opacity duration-500 opacity-20 dark:opacity-100 pointer-events-none" aria-hidden="true" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center justify-center h-full mt-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border mb-10 animate-[float_4s_ease-in-out_infinite] bg-background/60 backdrop-blur-md transition-colors duration-500 shadow-sm dark:shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 dark:bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600 dark:bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Global Network Active</span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-foreground mb-8 tracking-tight leading-none drop-shadow-2xl transition-colors duration-500">
          TRADE WITHOUT <br />
          <span className="gradient-text text-glow relative inline-block">
            BORDERS
            <svg
              className="absolute -bottom-2 w-full h-3 text-primary opacity-60"
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
          The next-generation B2B marketplace. Connect with verified suppliers, automate logistics, and track shipments in real-time across our immersive global network.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-lg mx-auto">
          <Link
            className="w-full sm:w-1/2 bg-primary hover:bg-primary/90 text-white font-bold py-5 px-8 rounded-xl primary-glow transition-all duration-300 text-lg flex items-center justify-center gap-2 group flowing-border primary-glow-hover shadow-[0_0_40px_-10px_rgba(19,91,236,0.6)] hover:shadow-[0_0_60px_-10px_rgba(19,91,236,0.8)] hover:-translate-y-1"
            href="/products"
          >
            Start Trading
            <span className="material-icons group-hover:translate-x-1 transition-transform text-sm">arrow_forward</span>
          </Link>
          <button
            className="w-full sm:w-1/2 hover:bg-background/80 dark:hover:bg-white/10 text-foreground font-semibold py-5 px-8 rounded-xl transition-all duration-300 text-lg flex items-center justify-center gap-2 border border-border hover:border-border/80 hover:-translate-y-1 bg-background/40 backdrop-blur-xl shadow-lg"
            type="button"
          >
            <span className="material-icons text-primary text-xl">play_circle</span>
            Watch Demo
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
        <span className="text-xs uppercase tracking-widest font-semibold">Scroll to Explore</span>
        <span className="material-icons text-2xl">keyboard_arrow_down</span>
      </div>
    </header>
  );
}
