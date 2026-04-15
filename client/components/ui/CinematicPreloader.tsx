"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * CinematicPreloader - Standardized & Polished
 * 
 * Rules:
 * 1. Plays once per session per major area (Home, Marketplace, Dashboard).
 * 2. Uses a sleek Top/Bottom vertical split animation site-wide.
 * 3. Syncs with Home Page video ready state.
 */
export default function CinematicPreloader() {
  const [status, setStatus] = useState<"idle" | "playing" | "finished">("idle");
  const [activeTexts, setActiveTexts] = useState<string[]>(["ENTERING", "RANOTE EXIM", "PORTAL"]);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect 1: Trigger Logic
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Remove the SSR flicker-fix class from html
    document.documentElement.classList.remove('is-home');

    const isDashboard = pathname ? pathname.startsWith("/dashboard") : false;
    const isMarketplace = pathname ? pathname.startsWith("/products") : false;
    const isHome = pathname === "/";

    const currentGroup = isHome ? "home" : isMarketplace ? "marketplace" : isDashboard ? "dashboard" : "other";

    // Only play for major areas
    const shouldPlay = ["home", "marketplace", "dashboard"].includes(currentGroup);

    if (shouldPlay) {
      if (status === "idle") {
        console.log(`[Preloader] Triggering animation for ${currentGroup}`);
        let texts = ["ENTERING", "RANOTE EXIM", "PORTAL"];
        if (isHome) texts = ["ENTERING", "RANOTE EXIM", "YOUR TRADING PARTNER"];
        else if (isMarketplace) texts = ["ENTERING", "RANOTE EXIM", "MARKET PLACER"];
        else if (pathname?.startsWith("/dashboard/exporter")) texts = ["ENTERING", "RANOTE EXIM", "EXPORTER DASHBOARD"];
        else if (pathname?.startsWith("/dashboard/importer")) texts = ["ENTERING", "RANOTE EXIM", "IMPORTER DASHBOARD"];

        setActiveTexts(texts);
        setStatus("playing");
      }
    } else {
      if (status !== "finished") {
        setStatus("finished");
      }
    }
  }, [pathname, status]);

  // Effect 2: Animation Controller
  useEffect(() => {
    if (status !== "playing") {
      if (status === "finished") {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      }
      return;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const timeoutId = setTimeout(() => {
      if (status === "playing") {
        setStatus("finished");
      }
    }, 15000); // 15s failsafe

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(timeoutId);
        setStatus("finished");
      }
    });

    // Reset positions
    gsap.set(".text-reveal-item", { y: "110%", opacity: 0 });
    gsap.set(".shutter-panel", { yPercent: 0 });

    tl.addLabel("start", 0.4);

    // Text Animation In
    tl.to(".text-reveal-item", {
      opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: "expo.out",
    }, "start");

    // Progress Bar
    tl.to("#loader-progress", {
      width: "100%", duration: 1.5, ease: "power2.inOut"
    }, "start+=0.5");

    tl.addLabel("exit", "+=0.3");

    // Text Animation Out
    tl.to(".text-reveal-item", {
      y: -120, opacity: 0, duration: 0.8, stagger: 0.1, ease: "expo.in"
    }, "exit");

    tl.to("#loader-bar-container", {
      opacity: 0, duration: 0.3
    }, "exit");

    // Handle Split Split
    if (pathname === "/") {
      tl.addLabel("wait-for-video", "exit+=0.5");
      tl.call(() => {
        // Wait for the video's first frame to be ready
        if (!(window as any).homeVideoReady) {
          tl.pause();
          const onReady = () => {
            window.removeEventListener('home-video-ready', onReady);
            tl.play();
          };
          window.addEventListener('home-video-ready', onReady);
        }
      }, undefined, "wait-for-video");

      // Home Page Split (slightly slower/more cinematic)
      tl.to("#shutter-top", {
        yPercent: -100, duration: 1.8, ease: "power4.inOut"
      }, "wait-for-video+=0.1");

      tl.to("#shutter-bottom", {
        yPercent: 100, duration: 1.8, ease: "power4.inOut"
      }, "<");
    } else {
      // General Page Split
      tl.to("#shutter-top", {
        yPercent: -100, duration: 1.2, ease: "power4.inOut"
      }, "exit+=0.5");

      tl.to("#shutter-bottom", {
        yPercent: 100, duration: 1.2, ease: "power4.inOut"
      }, "<");
    }

    return () => {
      clearTimeout(timeoutId);
      tl.kill();
    };
  }, [status, pathname]);

  if (status === "finished") return null;

  // Responsive background for all areas to respect user's light/dark preference
  const bgClass = "bg-white dark:bg-[#050505]";
  
  // Use transparent overlay once splitting starts to allow page reveal
  const overlayClass = (mounted && status === "playing") ? "bg-transparent" : bgClass;

  return (
    <div
      id="preloader-overlay"
      className={`${overlayClass} transition-colors duration-200`}
      style={{ position: 'fixed', inset: 0, zIndex: 10001, pointerEvents: 'none' }}
    >
      <style>{`
        .text-reveal-mask { overflow: hidden; display: inline-block; }
        .shutter-panel {
          position: absolute; left: 0; width: 100%; height: 50.5vh; z-index: 10000;
        }
        .shutter-top { top: 0; }
        .shutter-bottom { bottom: 0; }
      `}</style>

      {mounted && (
        <>
          {/* Top Panel (Removed border-b) */}
          <div 
            className={`shutter-panel shutter-top ${bgClass}`} 
            id="shutter-top"
          ></div>
          
          {/* Bottom Panel (Removed border-t) */}
          <div 
            className={`shutter-panel shutter-bottom ${bgClass}`} 
            id="shutter-bottom"
          ></div>

          {/* Text Layer */}
          <div className="absolute inset-0 z-[10002] flex flex-col items-center justify-center p-4">
            <div className="relative z-[10002] text-center">
              <div className="flex flex-row items-center justify-center gap-6 md:gap-12 whitespace-nowrap">
                {activeTexts.map((text, i) => (
                  <div key={i} className="text-reveal-mask">
                    <h1 className={`text-reveal-item font-sans font-black tracking-tight opacity-0 uppercase whitespace-nowrap ${i === 1 ? 'text-2xl md:text-6xl text-[#D4AF37] border-x-4 border-[#D4AF37] px-6' :
                      'text-xl md:text-4xl text-foreground/40'
                      }`}>
                      {text}
                    </h1>
                  </div>
                ))}
              </div>

              <div className="mt-12 w-48 h-px bg-[#D4AF37]/10 mx-auto relative overflow-hidden" id="loader-bar-container">
                <div className="absolute inset-y-0 left-0 bg-[#D4AF37] w-0" id="loader-progress"></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
