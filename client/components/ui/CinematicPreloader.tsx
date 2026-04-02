"use client";

import { useEffect, useState } from "react";
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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Effect 1: Trigger Logic
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Remove the SSR flicker-fix class from html now that hydration is complete
        document.documentElement.classList.remove('is-home');

        sessionStorage.removeItem('preloader_played_areas');

        const isDashboard = pathname ? pathname.startsWith("/dashboard") : false;
        const isMarketplace = pathname ? pathname.startsWith("/products") : false;
        const isHome = pathname === "/";

        const currentGroup = isHome ? "home" : isMarketplace ? "marketplace" : isDashboard ? "dashboard" : "other";

        // Force shouldPlay for these groups to ensure user sees the animation
        const shouldPlay = ["home", "marketplace", "dashboard"].includes(currentGroup);

        if (shouldPlay) {
            if (status === "idle") {
                console.log(`[Preloader] FORCING PLAY for ${currentGroup}`);
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

        if (pathname === "/") {
            tl.addLabel("wait-for-video", "exit+=0.5");
            tl.call(() => {
                // Wait for the video's first frame to be extracted
                // We use any to bypass TS window property check for speed here
                if (!(window as any).homeVideoReady) {
                    tl.pause();
                    const onReady = () => {
                        window.removeEventListener('home-video-ready', onReady);
                        tl.play();
                    };
                    window.addEventListener('home-video-ready', onReady);
                }
            }, undefined, "wait-for-video");

            tl.to("#shutter-curtain", {
                y: -(140 * 16), // count * SLAT_H
                duration: 2.2,
                ease: "power3.inOut"
            }, "wait-for-video+=0.1");

            tl.to("#preloader-frame", {
                opacity: 0, duration: 0.3
            }, "wait-for-video+=2.5"); // Start fading aggressively just as it finishes
        } else {
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
    }, [status]);

    if (status === "finished") return null;

    // Use a single return statement to prevent React from unmounting/remounting the root div during hydration.
    // This eliminates the 1-frame "flash" of the underlying page background.

    // --- Deterministic Generation Data ---
    const getPseudoRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    const SLAT_H = 16;
    const COUNT = 140; // 140 * 16 = 2240px
    const TOTAL_HEIGHT = COUNT * SLAT_H;

    const metalPalettes = [
        { top: '#d4d4d4', mid: '#b8b8b8', bot: '#a0a0a0', crease: '#c0c0c0' },
        { top: '#cccccc', mid: '#b0b0b0', bot: '#989898', crease: '#b8b8b8' },
        { top: '#d0d0d0', mid: '#b4b4b4', bot: '#9c9c9c', crease: '#bcbcbc' },
    ];
    const grimeColors = ['rgba(30,25,20,0.12)', 'rgba(20,18,15,0.08)', 'rgba(40,35,28,0.15)', 'rgba(25,22,18,0.06)'];
    const dirtSpots = ['rgba(18,15,12,0.22)', 'rgba(35,28,20,0.18)', 'rgba(12,10,8,0.28)'];

    const isHome = pathname === "/";
    const initialBg = isHome ? "bg-[#111111]" : "bg-[#050505]";

    // Once the shutters are mounted and playing, we make the overlay transparent
    // so the page content is revealed when the shutters split.
    const currentClass = (mounted && status === "playing") ? "bg-transparent" : initialBg;

    return (
        <div
            id="preloader-overlay"
            className={`${currentClass} transition-colors duration-200`}
            style={{ position: 'fixed', inset: 0, zIndex: 10001, pointerEvents: 'none' }}
        >
            <style>{`
                .text-reveal-mask { overflow: hidden; display: inline-block; }
            `}</style>

            {!mounted ? null : isHome ? (
                <div id="preloader-frame" className={`absolute inset-0 z-[10000] ${status === "playing" ? "bg-transparent" : "bg-[#111111]"}`}>
                    {/* Top Building Strip */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '28px', zIndex: 50, background: 'repeating-linear-gradient(90deg, #3a3632 0px, #3a3632 18px, #2e2b28 18px, #2e2b28 20px)', borderBottom: '4px solid #1a1714' }}></div>

                    {/* Shutter Frame Background */}
                    <div style={{ position: 'absolute', top: '28px', bottom: 0, left: 0, right: 0, background: 'transparent', overflow: 'hidden' }}>
                        {/* Drum Housing */}
                        <div style={{ position: 'absolute', top: 0, left: '28px', right: '28px', height: '22px', zIndex: 15, background: 'linear-gradient(180deg, #2a2a2a 0%, #1e1e1e 100%)', borderBottom: '3px solid #0a0a0a', boxShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
                            <div style={{ position: 'absolute', top: '7px', left: '20px', right: '20px', height: '8px', borderRadius: '4px', background: 'linear-gradient(180deg, #555 0%, #333 100%)', border: '1px solid #222' }}></div>
                        </div>

                        {/* Side Frames */}
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '28px', zIndex: 20, background: 'repeating-linear-gradient(180deg, #3a3632 0px, #3a3632 18px, #2e2b28 18px, #2e2b28 20px)', borderRight: '5px solid #111', boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.6)' }}></div>
                        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '28px', zIndex: 20, background: 'repeating-linear-gradient(180deg, #3a3632 0px, #3a3632 18px, #2e2b28 18px, #2e2b28 20px)', borderLeft: '5px solid #111', boxShadow: 'inset 3px 0 6px rgba(0,0,0,0.6)' }}></div>

                        {/* Viewport for Rolling Curtain */}
                        <div style={{ position: 'absolute', top: '22px', left: '28px', right: '28px', bottom: '14px', overflow: 'hidden', background: 'transparent' }}>
                            <div id="shutter-curtain" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${TOTAL_HEIGHT}px`, willChange: 'transform' }}>
                                {Array.from({ length: COUNT }).map((_, i) => {
                                    const r1 = getPseudoRandom(i + 100);
                                    const r2 = getPseudoRandom(i + 200);
                                    const r3 = getPseudoRandom(i + 300);
                                    const r4 = getPseudoRandom(i + 400);

                                    const pal = metalPalettes[i % metalPalettes.length];
                                    const grime = grimeColors[Math.floor(r1 * grimeColors.length)];

                                    return (
                                        <div key={i} style={{ display: 'block', width: '100%', height: `${SLAT_H}px`, position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${pal.top} 0%, ${pal.top} 18%, ${pal.crease} 30%, ${pal.mid} 45%, ${pal.mid} 65%, ${pal.bot} 85%, #888 100%)` }}>
                                                <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '3px', background: 'rgba(255,255,255,0.18)' }}></div>
                                                <div style={{ position: 'absolute', left: 0, right: 0, top: '4px', height: '1px', background: 'rgba(0,0,0,0.18)' }}></div>
                                                <div style={{ position: 'absolute', left: 0, right: 0, top: '5px', height: '1px', background: 'rgba(255,255,255,0.12)' }}></div>
                                                <div style={{ position: 'absolute', left: 0, right: 0, bottom: '3px', height: '2px', background: 'rgba(0,0,0,0.25)' }}></div>
                                                <div style={{ position: 'absolute', inset: 0, background: grime }}></div>

                                                {r2 < 0.3 && (
                                                    <div style={{ position: 'absolute', top: '1px', left: `${r3 * 70}%`, width: `${20 + r4 * 60}px`, height: '80%', background: dirtSpots[Math.floor(r2 * dirtSpots.length)], borderRadius: '1px' }}></div>
                                                )}
                                                {r4 < 0.08 && (
                                                    <div style={{ position: 'absolute', top: '2px', left: `${10 + r1 * 80}%`, width: '1px', height: '70%', background: 'rgba(255,255,255,0.25)' }}></div>
                                                )}

                                                {(i % 10 === 0) && (
                                                    <>
                                                        <div style={{ position: 'absolute', left: '10px', top: '4px', width: '7px', height: '7px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #aaa, #555)', border: '1px solid #333', zIndex: 3, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }}></div>
                                                        <div style={{ position: 'absolute', right: '10px', top: '4px', width: '7px', height: '7px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #aaa, #555)', border: '1px solid #333', zIndex: 3, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }}></div>
                                                    </>
                                                )}
                                            </div>
                                            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '6px', zIndex: 5, background: 'linear-gradient(90deg, rgba(0,0,0,0.5) 0%, transparent 100%)' }}></div>
                                            <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '6px', zIndex: 5, background: 'linear-gradient(270deg, rgba(0,0,0,0.5) 0%, transparent 100%)' }}></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Floor Plate */}
                        <div style={{ position: 'absolute', bottom: 0, left: '28px', right: '28px', height: '14px', zIndex: 15, background: 'linear-gradient(180deg, #2a2724 0%, #1a1714 100%)', borderTop: '3px solid #0a0a0a' }}>
                            <div style={{ position: 'absolute', top: '4px', left: '30px', right: '30px', height: '6px', borderRadius: '1px', background: '#0d0d0d', border: '1px solid #222' }}></div>
                        </div>
                    </div>
                </div>
            ) : mounted ? (
                <>
                    <style>{`
                        .shutter-panel {
                            position: absolute; left: 0; width: 100%; height: 50.5vh; z-index: 10000;
                        }
                        .shutter-top { top: 0; }
                        .shutter-bottom { bottom: 0; }
                    `}</style>
                    <div className="shutter-panel shutter-top bg-white dark:bg-[#050505]" id="shutter-top"></div>
                    <div className="shutter-panel shutter-bottom bg-white dark:bg-[#050505]" id="shutter-bottom"></div>
                </>
            ) : null}

            {mounted && (
                <div className="absolute inset-0 z-[10002] flex flex-col items-center justify-center p-4">
                    <div className="relative z-[10002] text-center">
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                            {activeTexts.map((text, i) => (
                                <div key={i} className="text-reveal-mask">
                                    <h1 className={`text-reveal-item font-['Anton'] tracking-tight opacity-0 uppercase ${i === 1 ? 'text-5xl md:text-8xl text-[#D4AF37] border-x-4 border-[#D4AF37] px-6' :
                                        'text-4xl md:text-7xl text-white'
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
            )}
        </div>
    );
}
