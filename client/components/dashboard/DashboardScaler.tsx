"use client";

import React, { useEffect, useState, useRef } from "react";

interface DashboardScalerProps {
 children: React.ReactNode;
 targetWidth?: number;
}

/**
 * Optical Scaler Component (V6 - High-Fidelity Standard)
 * -----------------------
 * Forces the browser to render a fixed-width dashboard (e.g. 1440px)
 * and mathematically scales it down ONLY on the client.
 * V6 Features:
 * - h-screen overflow-hidden root (Pins header/sidebar).
 * - 100% height internal containment (Stable baseline).
 * - SSR safety for children.
 */
export function DashboardScaler({ children, targetWidth = 1440 }: DashboardScalerProps) {
 const [scale, setScale] = useState(1);
 const [isMobile, setIsMobile] = useState(false);
 const containerRef = useRef<HTMLDivElement>(null);
 const [isMounted, setIsMounted] = useState(false);

 useEffect(() => {
 setIsMounted(true);
 const handleResize = () => {
 const width = window.innerWidth;
 if (width < 1024) {
   setIsMobile(true);
   setScale(1.0);
 } else {
   setIsMobile(false);
   // We only scale DOWN. If width is 1920, scale stays at 1.0.
   const newScale = Math.min(width / targetWidth, 1.0); 
   setScale(newScale);
 }
 };

 handleResize();
 window.addEventListener("resize", handleResize);
 return () => window.removeEventListener("resize", handleResize);
 }, [targetWidth]);

 return (
 <div 
 ref={containerRef}
 className="fixed inset-0 overflow-hidden bg-board"
 id="dashboard-scaler-root"
 style={{ 
 backgroundColor: "hsl(var(--background))",
 }}
 >
 <div
 className="will-change-transform"
 style={{
 // Apply scaling ONLY once mounted on the client to avoid hydration mismatch
 width: (isMounted && !isMobile && scale < 1) ? `${targetWidth}px` : "100%",
 transform: (isMounted && !isMobile && scale < 1) ? `scale(${scale})` : "none",
 transformOrigin: "top left",
 transition: "transform 0.1s ease-out",
 // V6 fix: When scaling down, we must increase the pre-scaled height proportionally
 // so that after transform: scale(), the visual height still fills exactly 100% of the screen.
 height: (isMounted && !isMobile && scale < 1) ? `${100 / scale}%` : "100%",
 minHeight: (isMounted && !isMobile && scale < 1) ? `${100 / scale}%` : "100%",
 }}
 >
 {children}
 </div>
 </div>
 );
}
