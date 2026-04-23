"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * InlineScrollVideo — A scroll-linked video that slides UP over the section
 * above it (with blur/scale/fade on the section behind), plays the video
 * through on scroll, then the section below slides up over it the same way.
 *
 * Architecture:
 *   - The previous section must be wrapped with `position: sticky; top: 0`
 *     so it stays in place while this component scrolls over it.
 *   - This component uses a tall wrapper for scroll distance + a sticky
 *     inner container that stays pinned during video playback.
 *   - A ScrollTrigger on `previousSectionId` handles the fade-out of the
 *     section above as this video covers it.
 *   - The section below naturally scrolls over the video when the wrapper ends.
 *
 * Props:
 *   videoSrc           — public path to the mp4
 *   previousSectionId  — DOM id of the section above to fade out
 *   totalFrames        — number of frames to extract (default 120)
 *   scrollDistance      — px of scroll for full video playback (default 2500)
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
    totalFrames = 120,
    scrollDistance = 2500,
}: InlineScrollVideoProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const wipeDelayScroll = 400; // Required px of pure scrolling past the previous section before launching video

    const framesRef = useRef<ImageBitmap[]>([]);
    const currentFrameRef = useRef(-1);
    const [progress, setProgress] = useState(0);
    const [failed, setFailed] = useState(false);
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

    // Cover-draw: scale + center-crop bitmap to fill the canvas
    const drawCover = useCallback(
        (ctx: CanvasRenderingContext2D, img: ImageBitmap) => {
            const cw = ctx.canvas.width;
            const ch = ctx.canvas.height;
            const iw = img.width;
            const ih = img.height;
            const scale = Math.max(cw / iw, ch / ih);
            const sw = cw / scale;
            const sh = ch / scale;
            const sx = (iw - sw) / 2;
            const sy = (ih - sh) / 2;
            ctx.clearRect(0, 0, cw, ch);
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
        },
        []
    );

    useEffect(() => {
        if (failed) return;

        gsap.registerPlugin(ScrollTrigger);

        const canvas = canvasRef.current;
        const canvasContainer = canvasContainerRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !canvasContainer || !wrapper) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const frames = framesRef.current;

        // ---------- Resize canvas ----------
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            const container = canvasContainerRef.current;
            if (!canvas || !container) return;

            const dpr = window.devicePixelRatio || 1;
            canvas.width = container.clientWidth * dpr;
            canvas.height = window.innerHeight * dpr;

            if (currentFrameRef.current >= 0 && currentFrameRef.current < totalFrames) {
                const img = framesRef.current?.[currentFrameRef.current];
                if (img) drawCover(canvas.getContext("2d")!, img);
            }
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // ---------- Draw frame with nearest-frame fallback ----------
        const drawFrame = (index: number) => {
            if (index === currentFrameRef.current) return;
            if (frames[index]) {
                currentFrameRef.current = index;
                drawCover(ctx, frames[index]);
                return;
            }
            let nearest = -1;
            let minDist = Infinity;
            for (let j = 0; j < frames.length; j++) {
                if (frames[j] && Math.abs(j - index) < minDist) {
                    minDist = Math.abs(j - index);
                    nearest = j;
                }
            }
            if (nearest >= 0 && nearest !== currentFrameRef.current) {
                currentFrameRef.current = nearest;
                drawCover(ctx, frames[nearest]);
            }
        };

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
        const playbackDuration = scrollDistance;

        const prevSection = document.getElementById(previousSectionId);

        // NOTE: No GSAP pin needed — using CSS sticky on the canvasContainer instead.
        // GSAP pin creates position:fixed which breaks clipPath and overflow clipping on iPad.

        // ---------- 3. Autonomous ClipPath Wipe & Layer Clean-up ----------
        // Using clipPath instead of translateX because GSAP pin makes the element
        // position:fixed, which escapes overflow-x-hidden and causes a visible
        // black rectangle on iPad/tablet screens.
        const CLIP_HIDDEN = "inset(0 0 0 100%)";
        const CLIP_VISIBLE = "inset(0 0 0 0%)";

        ScrollTrigger.create({
            trigger: wrapper,
            start: `top top-=${wipeDelayScroll}`,
            end: "bottom bottom",
            onEnter: () => {
                // Scrolling DOWN into the video section — reveal from right to left
                gsap.to(canvasContainer, {
                    clipPath: CLIP_VISIBLE,
                    duration: 1.2,
                    ease: "power3.out",
                });
                if (prevSection) {
                    gsap.to(prevSection, { opacity: 0, pointerEvents: "none", duration: 0.5, delay: 0.7 });
                }
            },
            onLeave: () => {
                // Scrolled past the video section downward — keep canvas visible
                // (the next section slides over it naturally via z-index stacking)
            },
            onEnterBack: () => {
                // Scrolling UP back into the video section from below — instant reveal
                gsap.set(canvasContainer, { clipPath: CLIP_VISIBLE });
                if (prevSection) {
                    gsap.to(prevSection, { opacity: 0, pointerEvents: "none", duration: 0.3 });
                }
            },
            onLeaveBack: () => {
                // Scrolled back above the video section — clip it away
                gsap.to(canvasContainer, {
                    clipPath: CLIP_HIDDEN,
                    duration: 0.8,
                    ease: "power3.in",
                });
                if (prevSection) {
                    gsap.to(prevSection, { opacity: 1, pointerEvents: "auto", duration: 0.5 });
                }
            },
            onRefresh: (self) => {
                // After resize or recalculation, ensure correct state
                if (self.isActive) {
                    gsap.set(canvasContainer, { clipPath: CLIP_VISIBLE });
                }
            },
        });

        // ---------- 4. Main video scrub timeline ----------
        const frameObj = { frame: 0 };
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: wrapper,
                start: `top top-=${wipeDelayScroll}`,
                end: `+=${playbackDuration}`,
                scrub: 0.8,
            },
        });

        // Scrub through frames as user scrolls
        tl.to(frameObj, {
            frame: totalFrames - 1,
            ease: "none",
            duration: playbackDuration,
            onUpdate: () => {
                const idx = Math.floor(frameObj.frame);
                drawFrame(idx);
            },
        });

        // ---------- 3. Blur out video as the next section scrolls over it ----------
        ScrollTrigger.create({
            trigger: wrapper,
            start: `bottom bottom`,
            end: `bottom top`,
            scrub: true,
            onUpdate: (self) => {
                const canvas = canvasRef.current;
                if (canvas) {
                    gsap.set(canvas, {
                        scale: 1 + (self.progress * 0.05),
                        filter: `blur(${self.progress * 8}px)`,
                        opacity: 1 - (self.progress * 0.3), // Safe to fade opacity now because container is black
                    });
                }
            },
            onLeaveBack: () => {
                const canvas = canvasRef.current;
                if (canvas) {
                    gsap.set(canvas, { scale: 1, filter: "blur(0px)", opacity: 1 });
                }
            },
        });

        // ---------- 4. Extract frames in background ----------
        const extractFrames = async () => {
            const video = document.createElement("video");
            video.style.position = "absolute";
            video.style.opacity = "0";
            video.style.pointerEvents = "none";
            video.style.width = "1px";
            video.style.height = "1px";
            document.body.appendChild(video);

            let finalSrc = videoSrc;
            try {
                const response = await fetch(finalSrc);
                if (response.ok) {
                    const blob = await response.blob();
                    finalSrc = URL.createObjectURL(blob);
                }
            } catch (e) {
                console.warn("[InlineScrollVideo] Failed to fetch blob, using origin src", e);
            }

            video.src = finalSrc;
            video.muted = true;
            video.playsInline = true;
            video.setAttribute("playsinline", "");
            video.setAttribute("webkit-playsinline", "");
            video.preload = "auto";
            video.crossOrigin = "anonymous";

            await new Promise<void>((resolve, reject) => {
                video.onloadeddata = () => resolve();
                video.onerror = () => reject(new Error("Video failed to load"));
                video.load();
            });

            try {
                await video.play();
                video.pause();
            } catch (e) {
                // Ignore autoplay policy errors
            }

            const duration = video.duration;
            const interval = duration / (totalFrames - 1);

            for (let i = 0; i < totalFrames; i++) {
                if (!framesRef.current) break;

                await new Promise<void>((resolve) => {
                    let settled = false;

                    const captureFrame = async () => {
                        if (settled) return;
                        settled = true;
                        video.removeEventListener("seeked", onSeeked);

                        try {
                            const vw = video.videoWidth || 1920;
                            const vh = video.videoHeight || 1080;
                            const targetW = Math.min(1920, vw);
                            const targetH = Math.round((targetW / vw) * vh);

                            const bitmap = await createImageBitmap(video, {
                                resizeWidth: targetW,
                                resizeHeight: targetH,
                                resizeQuality: "medium",
                            });

                            if (framesRef.current) framesRef.current[i] = bitmap;
                        } catch (e) {
                            const tmpCanvas = document.createElement("canvas");
                            const vw = video.videoWidth || 1920;
                            const vh = video.videoHeight || 1080;
                            const targetW = Math.min(1920, vw);
                            const targetH = Math.round((targetW / vw) * vh);

                            tmpCanvas.width = targetW;
                            tmpCanvas.height = targetH;
                            const tmpCtx = tmpCanvas.getContext("2d");
                            if (tmpCtx) {
                                tmpCtx.drawImage(video, 0, 0, targetW, targetH);
                                try {
                                    const bitmap = await createImageBitmap(tmpCanvas);
                                    if (framesRef.current) framesRef.current[i] = bitmap;
                                } catch (b) {
                                    console.error("[InlineScrollVideo] Canvas bitmap capture failed", b);
                                }
                            }
                        }

                        const p = Math.round(((i + 1) / totalFrames) * 100);
                        setProgress(p);

                        if (i === 0) {
                            resizeCanvas();
                            drawFrame(0);
                        }

                        resolve();
                    };

                    const onSeeked = () => captureFrame();

                    const seekTimeout = setTimeout(() => {
                        if (!settled) {
                            captureFrame();
                        }
                    }, 5000);

                    video.addEventListener("seeked", () => {
                        clearTimeout(seekTimeout);
                        onSeeked();
                    });
                    video.currentTime = Math.min(i * interval, duration - 0.05);
                });
            }

            video.src = "";
            video.load();
            if (video.parentNode) {
                video.parentNode.removeChild(video);
            }

            drawFrame(Math.floor(frameObj.frame));
        };

        extractFrames().catch(() => {
            setFailed(true);
        });

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            tl.kill();
            if (headerTrigger) headerTrigger.kill();
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, [failed, drawCover, videoSrc, previousSectionId, totalFrames, scrollDistance]);

    if (failed) return null;

    return (
        <div
            ref={wrapperRef}
            className="relative z-[5] w-full pointer-events-none"
            style={{
                height: `calc(${scrollDistance + wipeDelayScroll}px + 100vh)`,
                marginTop: overlapMargin,
                paddingTop: wipeDelayScroll,
            }}
        >
            <div
                ref={canvasContainerRef}
                className="w-full bg-black overflow-hidden sticky top-0"
                style={{ clipPath: "inset(0 0 0 100%)", height: "100dvh" }}
            >
                {/* Loading indicator */}
                {progress < 100 && progress > 0 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3 w-48">
                        <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium">
                            Loading... {progress}%
                        </span>
                        <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white/80 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Canvas */}
                <canvas
                    ref={canvasRef}
                    style={{ display: "block", width: "100%", height: "100%" }}
                />
            </div>
        </div>
    );
}
