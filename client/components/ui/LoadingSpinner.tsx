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
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/60 animate-spin" />
      
      {/* Middle pulsing ring */}
      <div className="absolute inset-1 rounded-full border-2 border-primary/20 animate-pulse" />
      
      {/* Inner rotating ring (counter-clockwise) */}
      <div
        className="absolute inset-0 rounded-full border-2 border-transparent border-b-primary border-l-primary/60 animate-spin"
        style={{ animationDirection: "reverse" }}
      />

      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-sm"
        style={{
          background:
            "radial-gradient(circle, rgba(19, 91, 236, 0.4) 0%, rgba(19, 91, 236, 0) 70%)",
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
      <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          {spinnerContent}
          {text && <p className="text-sm text-white font-medium">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {spinnerContent}
      {text && (
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          {text}
        </p>
      )}
    </div>
  );
}
