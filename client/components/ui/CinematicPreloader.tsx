"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * CinematicPreloader - Stabilized & Hardened
 * 
 * Rules:
 * 1. Plays once per session per major area (Home, Marketplace, Dashboard).
 * 2. Skips on internal navigation within the same area.
 * 3. Plays on hard refreshes.
 */
export default function CinematicPreloader() {
    const [status, setStatus] = useState<"idle" | "playing" | "finished">("idle");
    const [activeTexts, setActiveTexts] = useState<string[]>(["ENTERING", "RANOTE EXIM", "PORTAL"]);
    const pathname = usePathname();
    const isFirstMount = useRef(true);

    // Effect 1: Trigger Logic
    useEffect(() => {
        if (typeof window === "undefined") return;
        sessionStorage.removeItem('preloader_played_areas');

        const isDashboard = pathname ? pathname.startsWith("/dashboard") : false;
        const isMarketplace = pathname ? pathname.startsWith("/products") : false;
        const isHome = pathname === "/";

        let currentGroup = "other";
        if (isHome) currentGroup = "home";
        else if (isMarketplace) currentGroup = "marketplace";
        else if (isDashboard) currentGroup = "dashboard";

        const playedAreasRaw = sessionStorage.getItem('preloader_played_areas');
        const playedAreas = playedAreasRaw ? JSON.parse(playedAreasRaw) : [];

        let isRefresh = false;
        if (isFirstMount.current) {
            try {
                const nav = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
                isRefresh = nav.length > 0 && nav[0].type === 'reload';
            } catch (e) {
                console.warn("[Preloader] Perf check fail", e);
            }
            isFirstMount.current = false;
        }

        const hasPlayedThisArea = playedAreas.includes(currentGroup);
        const shouldPlay = isHome ? true : isRefresh || (currentGroup !== "other" && !hasPlayedThisArea);

        if (shouldPlay) {
            // Guard: Only set to playing if we are idle
            if (status === "idle") {
                console.log(`[Preloader] PLAYING for ${currentGroup}`);
                let texts = ["ENTERING", "RANOTE EXIM", "PORTAL"];
                if (isHome) texts = ["ENTERING", "RANOTE EXIM", "YOUR TRADING PARTNER"];
                else if (isMarketplace) texts = ["ENTERING", "RANOTE EXIM", "MARKET PLACER"];
                else if (pathname?.startsWith("/dashboard/exporter")) texts = ["ENTERING", "RANOTE EXIM", "EXPORTER DASHBOARD"];
                else if (pathname?.startsWith("/dashboard/importer")) texts = ["ENTERING", "RANOTE EXIM", "IMPORTER DASHBOARD"];

                if (!hasPlayedThisArea && currentGroup !== "other") {
                    const updatedAreas = [...playedAreas, currentGroup];
                    sessionStorage.setItem('preloader_played_areas', JSON.stringify(updatedAreas));
                }

                setActiveTexts(texts);
                setStatus("playing");
            }
        } else {
            // Guard: Only set to finished if not already there
            if (status !== "finished") {
                console.log(`[Preloader] SKIPPING for ${currentGroup}`);
                setStatus("finished");
            }
        }
    }, [pathname, status]); // Status added to deps for safety

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

        gsap.set(".text-reveal-item", { y: "110%", opacity: 0 });
        gsap.set(".shutter-panel", { yPercent: 0 });

        tl.addLabel("start", 0.4);

        tl.to(".text-reveal-item", {
            opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: "expo.out",
        }, "start");

        tl.to("#loader-progress", {
            width: "100%", duration: 1.5, ease: "power2.inOut"
        }, "start+=0.5");

        tl.addLabel("exit", "+=0.3");

        tl.to(".text-reveal-item", {
            y: -120, opacity: 0, duration: 0.8, stagger: 0.1, ease: "expo.in"
        }, "exit");

        tl.to("#loader-bar-container", {
            opacity: 0, duration: 0.3
        }, "exit");

        tl.to("#shutter-top", {
            yPercent: -100, duration: 1.2, ease: "power4.inOut"
        }, "exit+=0.5");

        tl.to("#shutter-bottom", {
            yPercent: 100, duration: 1.2, ease: "power4.inOut"
        }, "<");

        return () => {
            clearTimeout(timeoutId);
            tl.kill();
        };
    }, [status]);

    if (status === "finished") return null;

    return (
        <div id="preloader-overlay" style={{ position: 'fixed', inset: 0, zIndex: 10001, pointerEvents: 'none' }}>
            <style>{`
                .shutter-panel {
                    position: fixed; left: 0; width: 100%; height: 50.5vh; z-index: 10000;
                }
                .shutter-top { top: 0; }
                .shutter-bottom { bottom: 0; }
                .text-reveal-mask {
                    overflow: hidden; display: inline-block;
                }
            `}</style>

            <div className="shutter-panel shutter-top bg-white dark:bg-[#0a0f18]" id="shutter-top"></div>
            <div className="shutter-panel shutter-bottom bg-white dark:bg-[#0a0f18]" id="shutter-bottom"></div>

            <div className="absolute inset-0 z-[10002] flex flex-col items-center justify-center p-4">
                <div className="relative z-[10002] text-center">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        {activeTexts.map((text, i) => (
                            <div key={i} className="text-reveal-mask">
                                <h1 className={`text-reveal-item font-['Anton'] tracking-tight opacity-0 uppercase ${
                                    i === 1 ? 'text-5xl md:text-8xl text-black dark:text-white border-x-4 border-black dark:border-white px-6' : 
                                    'text-4xl md:text-7xl text-gray-500 dark:text-gray-400'
                                }`}>
                                    {text}
                                </h1>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 w-48 h-px bg-gray-200 dark:bg-gray-800 mx-auto relative overflow-hidden" id="loader-bar-container">
                        <div className="absolute inset-y-0 left-0 bg-black dark:bg-white w-0" id="loader-progress"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
