"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";

/**
 * InlineScrollVideo — Retains the original sticky slider animation and entry effect
 * but uses a standard video element that auto-plays instead of frame-by-frame scrubbing.
 * Locks the scroll until the video finishes playing.
 */

interface InlineScrollVideoProps {
    videoSrc: string;
    previousSectionId: string;
    totalFrames?: number;
    scrollDistance?: number;
}

export default function InlineScrollVideo({
    videoSrc,
    previousSectionId,
}: InlineScrollVideoProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const scrollIconRef = useRef<HTMLDivElement>(null);

    const wipeDelayScroll = 400; // Required px of pure scrolling past the previous section before launching video
    const [overlapMargin, setOverlapMargin] = useState("-100vh");

    // Dynamic scale to allow for arbitrary FeaturesSection height bounds
    useEffect(() => {
        const prev = document.getElementById(previousSectionId);
        if (prev) {
            setOverlapMargin(`-${prev.offsetHeight}px`);
            const handleResize = () => setOverlapMargin(`-${prev.offsetHeight}px`);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [previousSectionId]);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const videoContainer = videoContainerRef.current;
        const wrapper = wrapperRef.current;
        const video = videoRef.current;
        if (!videoContainer || !wrapper || !video) return;

        const prevSection = document.getElementById(previousSectionId);

        let hasFinished = false;

        const lockScroll = () => {
            // Instead of breaking standard scroll mechanics with position: fixed or overflow: hidden,
            // we physically remove the page content below the video from the DOM flow.
            // This allows the user to scroll back UP smoothly, but hits a hard wall going DOWN.
            const postContent = document.getElementById('post-video-content');
            if (postContent) {
                postContent.style.display = 'none';
            }
        };

        const unlockScroll = () => {
            const postContent = document.getElementById('post-video-content');
            if (postContent) {
                postContent.style.display = 'block';
                // Trigger an instant refresh for all ScrollTriggers when page height changes
                ScrollTrigger.refresh();
            }
        };

        const handleVideoEnded = () => {
            hasFinished = true;
            unlockScroll();
            // Reveal scroll prompt once the video is done
            if (scrollIconRef.current) {
                gsap.to(scrollIconRef.current, { opacity: 1, duration: 1, ease: "power2.out", delay: 0.2 });
            }
        };

        video.addEventListener('ended', handleVideoEnded);

        // ---------- Navbar Hide Logic ----------
        const header = document.getElementById("home-navbar");
        let headerTrigger: ScrollTrigger | null = null;
        if (header) {
            headerTrigger = ScrollTrigger.create({
                trigger: wrapper,
                start: "top center", // Hide header as video wrapper reaches middle of screen
                end: "bottom top",
                onToggle: (self) => {
                    gsap.to(header, {
                        y: self.isActive ? -100 : 0,
                        opacity: self.isActive ? 0 : 1,
                        duration: 0.3,
                        ease: "power2.inOut"
                    });
                }
            });
        }

        const CLIP_HIDDEN = "inset(0 0 0 100%)";
        const CLIP_VISIBLE = "inset(0 0 0 0%)";

        const trigger = ScrollTrigger.create({
            trigger: wrapper,
            start: `top top-=${wipeDelayScroll}`,
            end: "bottom bottom",
            onEnter: (self) => {
                // Scrolling DOWN into the video section — reveal from right to left
                gsap.to(videoContainer, {
                    clipPath: CLIP_VISIBLE,
                    duration: 1.2,
                    ease: "power3.out",
                });
                if (prevSection) {
                    gsap.to(prevSection, { opacity: 0, pointerEvents: "none", duration: 0.5, delay: 0.7 });
                }
                
                if (!hasFinished) {
                    if (scrollIconRef.current) gsap.set(scrollIconRef.current, { opacity: 0 });
                    video.play().catch(() => {});
                    lockScroll();
                }
            },
            onLeave: () => {
                // Naturally scrolls away
            },
            onEnterBack: (self) => {
                gsap.set(videoContainer, { clipPath: CLIP_VISIBLE });
                if (prevSection) {
                    gsap.to(prevSection, { opacity: 0, pointerEvents: "none", duration: 0.3 });
                }
                if (!hasFinished) {
                    video.play().catch(() => {});
                }
            },
            onLeaveBack: () => {
                gsap.to(videoContainer, {
                    clipPath: CLIP_HIDDEN,
                    duration: 0.8,
                    ease: "power3.in",
                });
                if (prevSection) {
                    gsap.to(prevSection, { opacity: 1, pointerEvents: "auto", duration: 0.5 });
                }
                
                video.pause();
                
                if (scrollIconRef.current) gsap.to(scrollIconRef.current, { opacity: 0, duration: 0.3 });
                
                // Allow the video to play again if they completely scroll away upwards
                hasFinished = false;
                video.currentTime = 0;
            },
            onRefresh: (self) => {
                // After resize or recalculation, ensure correct state
                if (self.isActive) {
                    gsap.set(videoContainer, { clipPath: CLIP_VISIBLE });
                }
            },
        });

        // ---------- Blur out video as the next section scrolls over it ----------
        const blurTrigger = ScrollTrigger.create({
            trigger: wrapper,
            start: `bottom bottom`,
            end: `bottom top`,
            scrub: true,
            onUpdate: (self) => {
                if (video) {
                    gsap.set(video, {
                        scale: 1 + (self.progress * 0.05),
                        filter: `blur(${self.progress * 8}px)`,
                        opacity: 1 - (self.progress * 0.3),
                    });
                }
            },
            onLeaveBack: () => {
                if (video) {
                    gsap.set(video, { scale: 1, filter: "blur(0px)", opacity: 1 });
                }
            },
        });

        return () => {
            trigger.kill();
            blurTrigger.kill();
            if (headerTrigger) headerTrigger.kill();
            unlockScroll();
            video.removeEventListener('ended', handleVideoEnded);
        };
    }, [previousSectionId]);

    return (
        <div
            ref={wrapperRef}
            className="relative z-[5] w-full pointer-events-none"
            style={{
                height: `calc(${wipeDelayScroll}px + 100vh)`,
                marginTop: overlapMargin,
                paddingTop: wipeDelayScroll,
            }}
        >
            <div
                ref={videoContainerRef}
                className="w-full bg-black overflow-hidden sticky top-0"
                style={{ clipPath: "inset(0 0 0 100%)", height: "100dvh" }}
            >
                <video
                    ref={videoRef}
                    src={videoSrc}
                    className="w-full h-full object-cover pointer-events-auto"
                    muted
                    playsInline
                />
                
                {/* Scroll Indicator Prompt */}
                <div 
                    ref={scrollIconRef}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 pointer-events-auto"
                >
                     <span className="text-white/80 text-[10px] tracking-[0.3em] font-semibold uppercase">Scroll to explore</span>
                     <ChevronDown className="w-5 h-5 text-white/90 animate-bounce" />
                </div>
            </div>
        </div>
    );
}
