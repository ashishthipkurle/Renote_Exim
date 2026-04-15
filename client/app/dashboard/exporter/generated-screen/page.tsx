"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function GeneratedScreen() {
 useEffect(() => {
 // We need to wait for GSAP to load
 const initAnimation = () => {
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 if (typeof window !== "undefined" && (window as any).gsap) {
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const gsap = (window as any).gsap;
 const tl = gsap.timeline({
 onComplete: () => {
 document.body.style.overflow = "auto";
 }
 });

 gsap.set(".main-dashboard", { visibility: "visible" });

 tl.to(".text-reveal-item", {
 opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: "expo.out", delay: 0.5
 });

 tl.to("#loader-progress", {
 width: "100%", duration: 1.5, ease: "power2.inOut"
 }, "-=0.5");

 tl.to(".text-reveal-item", {
 y: -100, opacity: 0, duration: 0.8, stagger: 0.1, ease: "expo.in"
 }, "+=0.2");

 tl.to("#loader-bar-container", {
 opacity: 0, duration: 0.3
 }, "-=0.5");

 tl.to("#shutter-top", {
 yPercent: -100, duration: 1.2, ease: "power4.inOut"
 }, "+=0.1");

 tl.to("#shutter-bottom", {
 yPercent: 100, duration: 1.2, ease: "power4.inOut"
 }, "<");

 tl.to(".main-dashboard", {
 opacity: 1, duration: 1
 }, "-=0.8");

 tl.to(".dashboard-element", {
 opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out"
 }, "-=0.5");

 tl.set("#preloader", { display: "none" });
 }
 };

 // Check if gsap is already loaded, otherwise it will be called by onLoad
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 if ((window as any).gsap) {
 initAnimation();
 } else {
 window.addEventListener("gsapLoaded", initAnimation);
 return () => window.removeEventListener("gsapLoaded", initAnimation);
 }
 }, []);

 return (
 <>
 <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;700&display=swap" rel="stylesheet" />
 <Script
 src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
 strategy="afterInteractive"
 onLoad={() => {
 window.dispatchEvent(new Event("gsapLoaded"));
 }}
 />

 <style>{`
 body {
 margin: 0;
 overflow: hidden;
 background-color: #050a14;
 }

 .shutter-panel {
 position: fixed;
 left: 0;
 width: 100%;
 height: 50.5%;
 background-color: #000;
 z-index: 100;
 }

 .shutter-top { top: 0; }
 .shutter-bottom { bottom: 0; }

 .text-reveal-mask {
 overflow: hidden;
 display: inline-block;
 }

 .main-dashboard {
 opacity: 0;
 visibility: hidden;
 }
 `}</style>

 {/* BEGIN: Cinematic Preloader Overlay */}
 <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-transparent pointer-events-none" id="preloader">
 {/* Shutters */}
 <div className="shutter-panel shutter-top" id="shutter-top"></div>
 <div className="shutter-panel shutter-bottom" id="shutter-bottom"></div>
 {/* Text Container */}
 <div className="relative z-[101] text-center" data-purpose="loading-text-container">
 <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
 {/* ENTERING */}
 <div className="text-reveal-mask">
 <h1 className="text-reveal-item font-['Anton'] text-4xl md:text-7xl tracking-widest text-gray-400 opacity-0 translate-y-full">ENTERING</h1>
 </div>
 {/* EXPORTCO */}
 <div className="text-reveal-mask">
 <h1 className="text-reveal-item font-['Anton'] text-5xl md:text-8xl tracking-tight text-foreground dark:text-white border-x-4 border-border dark:border-white px-6 opacity-0 translate-y-full">EXPORTCO</h1>
 </div>
 {/* PORTAL */}
 <div className="text-reveal-mask">
 <h1 className="text-reveal-item font-['Anton'] text-4xl md:text-7xl tracking-widest text-gray-400 opacity-0 translate-y-full">PORTAL</h1>
 </div>
 </div>
 {/* Loading Progress Bar */}
 <div className="mt-12 w-48 h-px bg-gray-800 mx-auto relative overflow-hidden" id="loader-bar-container">
 <div className="absolute inset-y-0 left-0 bg-primary w-0" id="loader-progress"></div>
 </div>
 </div>
 </div>
 {/* END: Cinematic Preloader Overlay */}

 {/* BEGIN: Main Dashboard Content (Initially Hidden) */}
 <main className="main-dashboard min-h-screen w-full bg-gradient-to-b from-black to-neutral-900 p-8 flex flex-col items-center justify-center text-center font-['Inter'] text-foreground dark:text-white" id="dashboard">
 {/* Background subtle noise/glow */}
 <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
 <section className="relative z-10 max-w-4xl w-full">
 <nav className="mb-12 flex justify-between items-center opacity-0 dashboard-element">
 <div className="font-['Anton'] text-2xl tracking-tighter">EXPORTCO // SYST</div>
 <div className="text-xs tracking-[0.3em] text-white/50 uppercase">Secure Connection Established</div>
 </nav>
 <div className="space-y-6">
 <h2 className="text-5xl md:text-7xl font-['Anton'] tracking-tighter dashboard-element opacity-0 translate-y-4">WELCOME COMMANDER</h2>
 <p className="text-gray-400 max-w-lg mx-auto leading-relaxed dashboard-element opacity-0 translate-y-4">
 All systems are operational. Global logistics streams are synchronized. Your dashboard is ready for operation.
 </p>
 <div className="pt-8 flex gap-4 justify-center dashboard-element opacity-0 translate-y-4">
 <button className="px-8 py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors duration-300">
 Initialize View
 </button>
 <button className="px-8 py-3 border border-gray-700 text-foreground dark:text-white font-bold text-xs uppercase tracking-widest hover:border-border dark:border-white transition-colors duration-300">
 System Logs
 </button>
 </div>
 </div>
 <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 dashboard-element opacity-0">
 <div className="p-6 border border-border dark:border-white/5 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-sm text-left">
 <div className="text-blue-500 text-xs font-bold mb-2">ACTIVE FREIGHT</div>
 <div className="text-3xl font-['Anton']">1,402</div>
 </div>
 <div className="p-6 border border-border dark:border-white/5 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-sm text-left">
 <div className="text-blue-500 text-xs font-bold mb-2">NODES ONLINE</div>
 <div className="text-3xl font-['Anton']">98.4%</div>
 </div>
 <div className="p-6 border border-border dark:border-white/5 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-sm text-left">
 <div className="text-white/50 text-xs font-bold mb-2">SECURITY STATUS</div>
 <div className="text-3xl font-['Anton']">ENCRYPTED</div>
 </div>
 </div>
 </section>
 {/* Decorative Corner Elements */}
 <div className="fixed top-4 left-4 w-12 h-12 border-t border-l border-border dark:border-white/20 dashboard-element opacity-0"></div>
 <div className="fixed bottom-4 right-4 w-12 h-12 border-b border-r border-border dark:border-white/20 dashboard-element opacity-0"></div>
 </main>
 </>
 );
}

