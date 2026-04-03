"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import LogoImg from "@/assests/LOGO.png";

/**
 * ScrollVideoSection — Apple-style scroll-linked video with scrollytelling text.
 *
 * The section is PINNED immediately on mount so no blank gap appears.
 * Frames are extracted in the background and drawn as they become available.
 * Animated text overlays appear and disappear at different scroll positions.
 */

const TOTAL_FRAMES = 150;
const SCROLL_DISTANCE = 3000; // px of scroll for full video playback

// Global cache to persist frames across navigation within the same session (SPA navigation)
let globalFramesCache: ImageBitmap[] = [];
let globalProgressCache = 0;
let isExtractionRunning = false;

/* --- Scrollytelling text data ---
 * Each entry defines a text block that fades in/out at specific scroll progress ranges.
 * `animation` controls the entrance/exit style for each block.
 */
const SCROLL_TEXTS = [
  {
    id: "text-1",
    headline: "Exporting Excellence",
    sub: "Connecting Indian manufacturers to the world's largest markets.",
    start: 0.02,
    end: 0.22,
    animation: "zoom-blur" as const,
    position: "bottom-left" as const,
  },
  {
    id: "text-2",
    headline: "Importing Trust",
    sub: "Verified suppliers · Transparent pricing · Real-time tracking.",
    start: 0.25,
    end: 0.45,
    animation: "flip-up" as const,
    position: "top-right" as const,
  },
  {
    id: "text-3",
    headline: "Global Logistics",
    sub: "Seamless freight, customs clearance, and door-to-door delivery — all automated.",
    start: 0.48,
    end: 0.68,
    animation: "reveal-mask" as const,
    position: "bottom-right" as const,
  },
];

// Position → CSS class map for each text placement
const POS_CLASSES: Record<string, { wrapper: string; align: string }> = {
  "bottom-left": { wrapper: "absolute bottom-12 md:bottom-20 left-6 md:left-16 z-20 pointer-events-none", align: "items-start text-left" },
  "top-right": { wrapper: "absolute top-24 md:top-32 right-6 md:right-16 z-20 pointer-events-none", align: "items-end text-right" },
  "bottom-right": { wrapper: "absolute bottom-12 md:bottom-20 right-6 md:right-16 z-20 pointer-events-none", align: "items-end text-right" },
  "bottom-center": { wrapper: "absolute bottom-12 md:bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none", align: "items-center text-center" },
};

export default function ScrollVideoSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const framesRef = useRef<ImageBitmap[]>(globalFramesCache);
  const currentFrameRef = useRef(-1);
  const [progress, setProgress] = useState(globalProgressCache);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(globalFramesCache.length >= 2);

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

  // Custom Cursor Logic
  useEffect(() => {
    if (!loaded || failed) return;
    const section = sectionRef.current;
    const cursor = cursorRef.current;
    if (!section || !cursor) return;

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" });

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX - 48);
      yTo(e.clientY - 48);
    };

    const onMouseEnter = () => {
      gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" });
    };

    const onMouseLeave = () => {
      gsap.to(cursor, { scale: 0, opacity: 0, duration: 0.3, ease: "power2.in" });
    };

    section.addEventListener("mousemove", onMouseMove);
    section.addEventListener("mouseenter", onMouseEnter);
    section.addEventListener("mouseleave", onMouseLeave);

    return () => {
      section.removeEventListener("mousemove", onMouseMove);
      section.removeEventListener("mouseenter", onMouseEnter);
      section.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [loaded, failed]);

  // Lock scroll while buffering frames (only if not seen before in this session)
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("ranote-video-intro-seen") === "true";
    if (progress >= 100 || failed || hasSeenIntro) return;

    const preventScroll = (e: Event) => {
      // Allow scroll if progress is significantly along, or if failed
      if (progress >= 100) return;
      e.preventDefault();
    };

    const preventKeys = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'Space', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) {
        if (progress < 100) e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', preventKeys, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('keydown', preventKeys);
    };
  }, [progress, failed]);

  // ---------- Scrollytelling text animations (separate effect, waits for DOM) ----------
  useEffect(() => {
    if (!loaded || failed) return;

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    gsap.registerPlugin(ScrollTrigger);

    const textTimelines: gsap.core.Timeline[] = [];

    SCROLL_TEXTS.forEach((item, i) => {
      const el = textRefs.current[i];
      if (!el) return;

      const textTl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: `top+=${item.start * SCROLL_DISTANCE} top`,
          end: `top+=${item.end * SCROLL_DISTANCE} top`,
          scrub: 0.5,
        },
      });

      // Each text block gets a unique cinematic animation
      switch (item.animation) {
        case "zoom-blur":
          // Zoom in from far + blur to sharp focus
          textTl.fromTo(el,
            { opacity: 0, scale: 0.4, filter: "blur(20px)" },
            { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.35, ease: "power3.out" }
          );
          textTl.to(el, { opacity: 1, scale: 1, duration: 0.35 });
          textTl.to(el, { opacity: 0, scale: 1.15, filter: "blur(12px)", duration: 0.3, ease: "power2.in" });
          break;

        case "flip-up":
          // 3D flip rotation from below
          textTl.fromTo(el,
            { opacity: 0, rotationX: 90, y: 80, transformPerspective: 800, transformOrigin: "bottom center" },
            { opacity: 1, rotationX: 0, y: 0, duration: 0.35, ease: "power3.out" }
          );
          textTl.to(el, { opacity: 1, rotationX: 0, y: 0, duration: 0.35 });
          textTl.to(el, { opacity: 0, rotationX: -45, y: -50, duration: 0.3, ease: "power2.in" });
          break;

        case "reveal-mask":
          // Clip-path wipe reveal from bottom to top
          textTl.fromTo(el,
            { opacity: 0, clipPath: "inset(100% 0% 0% 0%)", y: 30 },
            { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.35, ease: "power2.out" }
          );
          textTl.to(el, { opacity: 1, duration: 0.35 });
          textTl.to(el, { opacity: 0, clipPath: "inset(0% 0% 100% 0%)", y: -20, duration: 0.3, ease: "power2.in" });
          break;

        case "grand-scale":
          // Epic finale — scale up from tiny with dramatic easing
          textTl.fromTo(el,
            { opacity: 0, scale: 0.2, y: 60, filter: "blur(15px)" },
            { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 0.4, ease: "elastic.out(1, 0.6)" }
          );
          textTl.to(el, { opacity: 1, scale: 1, duration: 0.35 });
          textTl.to(el, { opacity: 0, scale: 1.3, filter: "blur(8px)", duration: 0.25, ease: "power3.in" });
          break;
      }

      textTimelines.push(textTl);
    });

    // Refresh ScrollTrigger to pick up new triggers
    ScrollTrigger.refresh();

    return () => {
      textTimelines.forEach((tl) => tl.kill());
    };
  }, [loaded, failed]);

  useEffect(() => {
    (window as any).homeVideoReady = false;
    if (failed) return;

    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !section || !wrapper) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frames = framesRef.current;

    // ---------- Resize canvas to viewport ----------
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = section.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      if (currentFrameRef.current >= 0 && frames[currentFrameRef.current]) {
        drawCover(ctx, frames[currentFrameRef.current]);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // ---------- Draw frame ----------
    const drawFrame = (index: number) => {
      if (index === currentFrameRef.current) return;
      if (!frames[index]) return;
      currentFrameRef.current = index;
      drawCover(ctx, frames[index]);
    };

    // ---------- 1. Main video scrub timeline ----------
    const frameObj = { frame: 0 };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: "top top",
        end: `+=${SCROLL_DISTANCE}`,
        scrub: 0.8,
      },
    });

    tl.to(frameObj, {
      frame: TOTAL_FRAMES - 1,
      ease: "none",
      duration: 1,
      onUpdate: () => {
        const idx = Math.floor(frameObj.frame);
        drawFrame(idx);
      },
    });

    // ---------- 2. Extract frames in background ----------
    const extractFrames = async () => {
      if (globalFramesCache.length >= TOTAL_FRAMES) {
        setLoaded(true);
        setProgress(100);
        resizeCanvas();
        drawFrame(0);
        return;
      }

      if (isExtractionRunning) return;
      isExtractionRunning = true;

      const video = document.createElement("video");
      video.style.position = "absolute";
      video.style.opacity = "0";
      video.style.pointerEvents = "none";
      video.style.width = "1px";
      video.style.height = "1px";
      document.body.appendChild(video);

      video.src = "/videos/Continuous_Shot_Company_Video_Generation.mp4";
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
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
      const interval = duration / (TOTAL_FRAMES - 1);

      for (let i = 0; i < TOTAL_FRAMES; i++) {
        // If navigation occurred and cleared framesRef, stop extraction
        if (!framesRef.current) break;

        await new Promise<void>((resolve) => {
          const onSeeked = async () => {
            try {
              // Resize frames to 1080p maximum to save memory (prevents browser crashes/reclaims)
              const vw = video.videoWidth || 1920;
              const vh = video.videoHeight || 1080;
              const targetW = Math.min(1920, vw);
              const targetH = Math.round((targetW / vw) * vh);

              const bitmap = await createImageBitmap(video, {
                resizeWidth: targetW,
                resizeHeight: targetH,
                resizeQuality: "medium"
              });
              
              if (framesRef.current) framesRef.current[i] = bitmap;
              globalFramesCache[i] = bitmap;
            } catch (e) {
              console.error("[ScrollVideo] createImageBitmap failed, falling back to canvas", e);
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
                  globalFramesCache[i] = bitmap;
                } catch (b) {
                  console.error("[ScrollVideo] Canvas bitmap capture failed", b);
                }
              }
            }
            
            const p = Math.round(((i + 1) / TOTAL_FRAMES) * 100);
            setProgress(p);
            globalProgressCache = p;

            if (i === 0) {
              resizeCanvas();
              drawFrame(0);
            }

            if (i === 2 || (i === 0 && TOTAL_FRAMES <= 2)) {
              setLoaded(true);
              (window as any).homeVideoReady = true;
              window.dispatchEvent(new Event('home-video-ready'));
            }

            if (i === TOTAL_FRAMES - 1) {
              sessionStorage.setItem("ranote-video-intro-seen", "true");
              isExtractionRunning = false;
            }

            video.removeEventListener("seeked", onSeeked);
            resolve();
          };
          video.addEventListener("seeked", onSeeked);
          video.currentTime = Math.min(i * interval, duration - 0.05);
        });
      }

      video.src = "";
      video.load();
      if (video.parentNode) {
        video.parentNode.removeChild(video);
      }

      drawFrame(Math.floor(frameObj.frame));
      ScrollTrigger.refresh();
    };

    extractFrames().catch(() => {
      setFailed(true);
      isExtractionRunning = false;
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      // We no longer close frames on unmount because we want to cache them
      // framesRef.current = []; // Keep it for the global cache
    };
  }, [failed, drawCover]);

  if (failed) return null;

  return (
    <div
      ref={wrapperRef}
      className="bg-black relative z-0"
      style={{
        height: `calc(${SCROLL_DISTANCE}px + 100vh)`,
      }}
    >
      <section
        ref={sectionRef}
        className="sticky top-0 w-full h-screen bg-black overflow-hidden m-0 p-0 cursor-none"
      >
        <div className="w-full h-full relative overflow-hidden pointer-events-none">

          {loaded && progress < 100 && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-48 transition-opacity duration-300">
              <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium">
                Buffering...
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

          {/* Intro Overlays */}
          {loaded && (
            <>
              {/* Header Gradient */}
              <div className="absolute top-0 w-full h-32 z-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />

              {/* Bottom Gradient for text readability */}
              <div className="absolute bottom-0 w-full h-48 z-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

              {/* Logo Pinned to Corner */}
              <div className="absolute top-0 left-0 z-10 p-0 m-0">
                <Image src={LogoImg} alt="Ranote Exim Logo" className="w-[220px] md:w-[320px] lg:w-[450px] h-auto object-contain origin-top-left -ml-12 -mt-12 filter drop-shadow-[0_0_15px_rgba(0,0,0,0.4)]" unoptimized />
              </div>

              {/* --- Scrollytelling Text Overlays --- */}
              {SCROLL_TEXTS.map((item, i) => {
                const pos = POS_CLASSES[item.position];
                return (
                  <div
                    key={item.id}
                    ref={(el) => { textRefs.current[i] = el; }}
                    className={pos.wrapper}
                    style={{ opacity: 0, willChange: "transform, opacity, filter" }}
                  >
                    <div className={`flex flex-col ${pos.align} max-w-2xl px-6`}>
                      {/* Decorative accent line */}
                      <div className="w-14 h-[2px] bg-gradient-to-r from-amber-400/90 to-amber-600/30 mb-4" />
                      <h2
                        className="text-4xl md:text-6xl lg:text-8xl font-bold text-white mb-4 tracking-tight leading-[1.05]"
                        style={{
                          textShadow: "0 4px 60px rgba(0,0,0,0.9), 0 0px 120px rgba(0,0,0,0.6)",
                        }}
                      >
                        {item.headline}
                      </h2>
                      <p
                        className="text-base md:text-xl lg:text-2xl text-white/70 font-light leading-relaxed max-w-lg"
                        style={{
                          textShadow: "0 2px 30px rgba(0,0,0,0.8)",
                        }}
                      >
                        {item.sub}
                      </p>
                      {/* Bottom accent line */}
                      <div className="w-14 h-[2px] bg-gradient-to-r from-amber-400/90 to-amber-600/30 mt-4" />
                    </div>
                  </div>
                );
              })}

              {/* Custom Follow Cursor */}
              <div
                ref={cursorRef}
                className="fixed top-0 left-0 z-[100] flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs tracking-widest uppercase font-medium shadow-[0_0_30px_rgba(255,255,255,0.1)] pointer-events-none transition-colors duration-300"
                style={{ opacity: 0, transform: "scale(0)", willChange: "transform, opacity" }}
              >
                {progress < 100 ? `${progress}%` : "Scroll"}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
