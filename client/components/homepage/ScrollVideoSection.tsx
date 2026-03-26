"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * ScrollVideoSection — Apple-style scroll-linked video.
 *
 * The section is PINNED immediately on mount so no blank gap appears.
 * Frames are extracted in the background and drawn as they become available.
 */

const TOTAL_FRAMES = 150;
const SCROLL_DISTANCE = 3000; // px of scroll for full video playback

export default function ScrollVideoSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<ImageBitmap[]>([]);
  const currentFrameRef = useRef(-1);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

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

    // ---------- 1. Set up pin IMMEDIATELY (synchronous) ----------
    const frameObj = { frame: 0 };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: "top top",
        end: `+=${SCROLL_DISTANCE}`,
        scrub: 0.8,
        // using CSS sticky with negative margin to eliminate gaps instead of GSAP pins
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
      const video = document.createElement("video");
      video.src = "/videos/Continuous_Shot_Company_Video_Generation.mp4";
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Video failed to load"));
        video.load();
      });

      const duration = video.duration;
      const interval = duration / (TOTAL_FRAMES - 1);

      for (let i = 0; i < TOTAL_FRAMES; i++) {
        await new Promise<void>((resolve) => {
          const onSeeked = async () => {
            try {
              const bitmap = await createImageBitmap(video);
              frames[i] = bitmap;
            } catch {
              const tmpCanvas = document.createElement("canvas");
              tmpCanvas.width = video.videoWidth || 1920;
              tmpCanvas.height = video.videoHeight || 1080;
              const tmpCtx = tmpCanvas.getContext("2d");
              if (tmpCtx) {
                tmpCtx.drawImage(video, 0, 0);
                const bitmap = await createImageBitmap(tmpCanvas);
                frames[i] = bitmap;
              }
            }
            setProgress(Math.round(((i + 1) / TOTAL_FRAMES) * 100));

            // Draw first frame as soon as it's ready
            if (i === 0) {
              resizeCanvas();
              drawFrame(0);
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

      setLoaded(true);
      // Redraw current scroll position now that all frames are available
      drawFrame(Math.floor(frameObj.frame));
      ScrollTrigger.refresh();
    };

    extractFrames().catch(() => {
      setFailed(true);
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      frames.forEach((bmp) => bmp?.close());
      framesRef.current = [];
    };
  }, [failed, drawCover]);

  if (failed) return null;

  return (
    <div
      ref={wrapperRef}
      className="bg-black relative z-0"
      style={{
        height: `calc(${SCROLL_DISTANCE}px + 100vh)`,
        marginBottom: "-100vh",
      }}
    >
      <section
        ref={sectionRef}
        className="sticky top-0 w-full h-screen bg-black overflow-hidden m-0 p-0"
      >
        <div className="w-full h-full relative overflow-hidden">
          {/* Loading overlay */}
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20 transition-opacity duration-700">
              <div className="relative w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                <div
                  className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-white/50 text-xs uppercase tracking-widest font-medium">
                Loading cinematic view…
              </span>
            </div>
          )}

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        </div>
      </section>
    </div>
  );
}


