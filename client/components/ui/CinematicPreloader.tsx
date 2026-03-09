"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * CinematicPreloader - A global preloader with dynamic text and GSAP animations.
 * 
 * Rules:
 * 1. Plays on every visit to Home (/) and Marketplace (/products).
 * 2. Plays when entering Dashboard group from outside.
 * 3. Skips on Dashboard refresh or internal dashboard navigation.
 */
export default function CinematicPreloader() {
    const [status, setStatus] = useState<"idle" | "playing" | "finished">("idle");
    const [activeTexts, setActiveTexts] = useState<string[]>(["ENTERING", "RANOTE EXIM", "PORTAL"]);
    const pathname = usePathname();
    const isFirstMount = useRef(true);

    // Effect 1: Trigger Logic & Text Selection
    useEffect(() => {
        if (typeof window === "undefined") return;

        const isDashboard = pathname ? pathname.startsWith("/dashboard") : false;
        const isMarketplace = pathname ? pathname.startsWith("/products") : false;
        const isHome = pathname === "/";

        // Detect if this is a browser refresh (reload)
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

        const lastGroup = sessionStorage.getItem('preloader_group');
        console.log(`[Preloader] Route: ${pathname}. LastGroup: ${lastGroup}. IsRefresh: ${isRefresh}`);

        let shouldPlay = true;
        let groupTag = "outside";

        if (isDashboard) {
            groupTag = "dashboard";
            // Skip if already in dashboard or it's a refresh within dashboard
            if (lastGroup === 'dashboard' || isRefresh) {
                shouldPlay = false;
            }
        } else {
            groupTag = "outside";
            // Home and Marketplace always play
        }

        // Determine the dynamic text
        let texts = ["ENTERING", "RANOTE EXIM", "PORTAL"];
        if (isHome) {
            texts = ["ENTERING", "RANOTE EXIM", "YOUR TRADING PARTNER"];
        } else if (isMarketplace) {
            texts = ["ENTERING", "RANOTE EXIM", "MARKET PLACER"];
        } else if (pathname?.startsWith("/dashboard/exporter")) {
            texts = ["ENTERING", "RANOTE EXIM", "EXPORTER DASHBOARD"];
        } else if (pathname?.startsWith("/dashboard/importer")) {
            texts = ["ENTERING", "RANOTE EXIM", "IMPORTER DASHBOARD"];
        }

        // Perspective update for next nav
        sessionStorage.setItem('preloader_group', groupTag);

        if (shouldPlay) {
            console.log(`[Preloader] Action: PLAYING. Group: ${groupTag}`);
            setActiveTexts(texts);
            setStatus("playing");
        } else {
            console.log(`[Preloader] Action: SKIPPING. Group: ${groupTag}`);
            setStatus("finished");
        }
    }, [pathname]);

    // Effect 2: Animation Controller
    useEffect(() => {
        if (status !== "playing") {
            if (status === "finished") {
                document.body.style.overflow = "";
                document.documentElement.style.overflow = "";
            }
            return;
        }

        // Ensure body is locked during animation
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        // Failsafe timeout
        const timeoutId = setTimeout(() => {
            if (status === "playing") {
                console.warn("[Preloader] Safety exit triggered.");
                document.body.style.overflow = "";
                document.documentElement.style.overflow = "";
                setStatus("finished");
            }
        }, 10000);

        const tl = gsap.timeline({
            onComplete: () => {
                clearTimeout(timeoutId);
                document.body.style.overflow = "";
                document.documentElement.style.overflow = "";
                setStatus("finished");
            }
        });

        // Initialize state
        gsap.set(".text-reveal-item", { y: "110%", opacity: 0 });
        gsap.set(".shutter-panel", { yPercent: 0 });

        // Insert a label to synchronize simultaneous animations
        tl.addLabel("start", 0.4);

        // Sequence
        tl.to(".text-reveal-item", {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.2,
            ease: "expo.out",
        }, "start");

        tl.to("#loader-progress", {
            width: "100%",
            duration: 1.5,
            ease: "power2.inOut"
        }, "start+=0.5");

        tl.addLabel("exit", "+=0.3");

        tl.to(".text-reveal-item", {
            y: -120,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "expo.in"
        }, "exit");

        tl.to("#loader-bar-container", {
            opacity: 0,
            duration: 0.3
        }, "exit");

        tl.to("#shutter-top", {
            yPercent: -100,
            duration: 1.2,
            ease: "power4.inOut"
        }, "exit+=0.5");

        tl.to("#shutter-bottom", {
            yPercent: 100,
            duration: 1.2,
            ease: "power4.inOut"
        }, "<");

        return () => {
            clearTimeout(timeoutId);
            tl.kill();
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, [status]);

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet" />

            <style>{`
                .shutter-panel {
                    position: fixed;
                    left: 0;
                    width: 100%;
                    height: 50.5vh;
                    z-index: 10000;
                }
                .shutter-top { top: 0; }
                .shutter-bottom { bottom: 0; }
                .text-reveal-mask {
                    overflow: hidden;
                    display: inline-block;
                }
                #preloader-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 10001;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                    background: transparent;
                }
            `}</style>

            {status === "playing" && (
                <div id="preloader-overlay">
                    <div className="shutter-panel shutter-top bg-white dark:bg-[#0a0f18]" id="shutter-top"></div>
                    <div className="shutter-panel shutter-bottom bg-white dark:bg-[#0a0f18]" id="shutter-bottom"></div>

                    <div className="relative z-[10002] text-center">
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                            <div className="text-reveal-mask">
                                <h1 className="text-reveal-item font-['Anton'] text-4xl md:text-7xl tracking-widest text-gray-500 dark:text-gray-400 opacity-0">{activeTexts[0]}</h1>
                            </div>
                            <div className="text-reveal-mask">
                                <h1 className="text-reveal-item font-['Anton'] text-5xl md:text-8xl tracking-tight text-black dark:text-white border-x-4 border-black dark:border-white px-6 opacity-0 uppercase">{activeTexts[1]}</h1>
                            </div>
                            <div className="text-reveal-mask">
                                <h1 className="text-reveal-item font-['Anton'] text-4xl md:text-7xl tracking-widest text-gray-500 dark:text-gray-400 opacity-0">{activeTexts[2]}</h1>
                            </div>
                        </div>

                        <div className="mt-12 w-48 h-px bg-gray-200 dark:bg-gray-800 mx-auto relative overflow-hidden" id="loader-bar-container">
                            <div className="absolute inset-y-0 left-0 bg-black dark:bg-white w-0" id="loader-progress"></div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
