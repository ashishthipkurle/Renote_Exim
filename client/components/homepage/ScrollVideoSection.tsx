"use client";


import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { User, LogOut, ShoppingBag, Home, Info, Phone, ChevronDown, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import LogoImg from "@/assests/LOGO.png";
import ThumbnailImg from "@/assests/4k Video frame 2/1.png";


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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const framesRef = useRef<ImageBitmap[]>(globalFramesCache);
  const currentFrameRef = useRef(-1);
  const [progress, setProgress] = useState(globalProgressCache);
  const [failed, setFailed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, loading: authLoading, logout } = useAuth();
  const [loaded, setLoaded] = useState(globalFramesCache.length >= 2);
  const [hasScrolled, setHasScrolled] = useState(false);


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

  // Outside click logic for profile dropdown
  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

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
        onUpdate: (self) => {
          if (self.progress > 0.001) setHasScrolled(true);
          else if (self.progress <= 0) setHasScrolled(false);
        },
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

          {/* Thumbnail Image - Visible before scroll */}
          <AnimatePresence>
            {!hasScrolled && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0 }}
                className="absolute inset-0 z-[5] pointer-events-none"
              >
                <Image
                  src={ThumbnailImg}
                  alt="Ranote Exim"
                  fill
                  priority
                  className="object-cover"
                  unoptimized
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Intro Overlays */}
          {loaded && (
            <>
              {/* ─── Immersive Glassmorphism Navigation Bar ─── */}
              <nav
                className="absolute top-6 left-1/2 -translate-x-1/2 z-[60] pointer-events-auto cursor-auto"
                onMouseEnter={() => gsap.to(cursorRef.current, { scale: 0, opacity: 0, duration: 0.2, ease: "power2.out" })}
                onMouseLeave={() => gsap.to(cursorRef.current, { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(1.7)" })}
              >
                <div
                  className="flex items-center gap-2 px-10 py-1.5"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(24px) saturate(180%)",
                    WebkitBackdropFilter: "blur(24px) saturate(180%)",
                    borderRadius: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    minWidth: "850px",
                    justifyContent: "space-between",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {/* Left Side: Navigation Links */}
                  <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group text-white/70 hover:text-white transition-all duration-300">
                      <Home className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Home</span>
                    </Link>
                    <Link href="/about" className="flex items-center gap-2 group text-white/70 hover:text-white transition-all duration-300">
                      <Info className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">About</span>
                    </Link>
                  </div>

                  {/* Centerpiece: Marketplace */}
                  <Link
                    href="/products"
                    className="flex items-center gap-2.5 px-8 py-2.5 rounded-xl hover:bg-white/10 text-white text-sm font-black uppercase tracking-[0.3em] transition-all duration-500 hover:scale-105 group"
                  >
                    <ShoppingBag className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Marketplace
                  </Link>

                  {/* Right Side: Contact & Auth */}
                  <div className="flex items-center gap-8">
                    <Link href="/contact" className="flex items-center gap-2 group text-white/70 hover:text-white transition-all duration-300">
                      <Phone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Contact</span>
                    </Link>

                    <div className="flex items-center gap-4">
                      {!authLoading && (
                        user ? (
                          <div className="relative" ref={dropdownRef}>
                            <button
                              onClick={() => setIsProfileOpen(!isProfileOpen)}
                              className="flex items-center gap-2 group focus:outline-none"
                            >
                              <div className="size-8 rounded-full bg-white/20 ring-1 ring-white/30 overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:ring-amber-400/50 transition-all">
                                {user.avatar ? (
                                  <Image src={user.avatar as string} alt="" width={32} height={32} className="w-full h-full object-cover" unoptimized />
                                ) : (
                                  <User className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <ChevronDown className={`w-3 h-3 text-white/50 group-hover:text-white transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Profile Dropdown */}
                            <AnimatePresence>
                              {isProfileOpen && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                  className="absolute right-0 mt-4 w-48 rounded-2xl overflow-hidden"
                                  style={{
                                    background: "rgba(0, 0, 0, 0.8)",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
                                  }}
                                >
                                  <div className="p-1.5 flex flex-col gap-1">
                                    <Link
                                      href={user.role === "USER" ? "/products" : `/dashboard/${user.role?.toLowerCase()}`}
                                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all group"
                                      onClick={() => setIsProfileOpen(false)}
                                    >
                                      <LayoutDashboard className="w-4 h-4 group-hover:text-amber-400" />
                                      <span className="text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
                                    </Link>
                                    <button
                                      onClick={() => {
                                        logout();
                                        setIsProfileOpen(false);
                                      }}
                                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/10 text-white/70 hover:text-red-400 transition-all group w-full text-left"
                                    >
                                      <LogOut className="w-4 h-4" />
                                      <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <Link
                              href="/login"
                              className="text-white/60 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                            >
                              Login
                            </Link>
                            <Link
                              href="/register"
                              className="px-6 h-8 flex items-center justify-center rounded-full bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-black uppercase tracking-[0.1em] transition-all hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(245,158,11,0.2)]"
                            >
                              Sign Up
                            </Link>
                          </div>
                        )
                      )}

                      <div className="h-4 w-[1px] bg-white/10" />
                      <div className="scale-75 -mx-2">
                        <ThemeToggle />
                      </div>
                    </div>
                  </div>
                </div>
              </nav>

              {/* Logo Pinned to Corner */}
              <div className="absolute top-0 left-0 z-10 p-0 m-0">
                <Image src={LogoImg} alt="Ranote Exim Logo" className="w-[220px] md:w-[320px] lg:w-[450px] h-auto object-contain origin-top-left -ml-9 -mt-12 filter drop-shadow-[0_0_15px_rgba(0,0,0,0.4)]" unoptimized />
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

              {/* Custom Follow Cursor (No Border) */}
              <div
                ref={cursorRef}
                className="fixed top-0 left-0 z-[100] flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-black tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(255,255,255,0.1)] pointer-events-none transition-colors duration-300"
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
