"use client";

import React from "react";

interface LoadingSpinnerProps {
 size?: "sm" | "md" | "lg";
 variant?: "default" | "inline" | "overlay";
 text?: string;
}

export default function LoadingSpinner({
 size = "md",
 variant = "default",
 text,
}: LoadingSpinnerProps) {
 const sizeClasses = {
 sm: "w-6 h-6",
 md: "w-10 h-10",
 lg: "w-16 h-16",
 };

 const spinnerContent = (
 <div className={`relative ${sizeClasses[size]}`}>
 {/* Outer rotating ring */}
 <div className="absolute inset-0 rounded-full border border-transparent border-t-white/80 border-r-white/20 animate-spin" />
 
 {/* Middle pulsing ring */}
 <div className="absolute inset-1.5 rounded-full border border-white/10 animate-pulse" />
 
 {/* Inner rotating ring (counter-clockwise) */}
 <div
 className="absolute inset-0 rounded-full border border-transparent border-b-white/40 border-l-white/10 animate-spin"
 style={{ animationDirection: "reverse" }}
 />
-
 {/* Glow effect */}
 <div
 className="absolute inset-0 rounded-full blur-md opacity-20"
 style={{
 background:
 "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
 animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
 }}
 />
 </div>
 );

 if (variant === "inline") {
 return <div className="flex items-center gap-2">{spinnerContent}</div>;
 }

 if (variant === "overlay") {
 return (
 <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xl z-50">
 <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 fade-in duration-500">
 {spinnerContent}
 {text && <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-60">{text}</p>}
 </div>
 </div>
 );
 }

 return (
 <div className="flex flex-col items-center gap-6">
 {spinnerContent}
 {text && (
 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
 {text}
 </p>
 )}
 </div>
 );
}
