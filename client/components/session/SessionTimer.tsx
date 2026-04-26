"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface SessionTimerProps {
 endTime: string | null;
 remainingMs?: number;
 onTimeExpired: () => void;
 onTimerSync?: (remainingMs: number) => void;
}

export function SessionTimer({
 endTime,
 remainingMs: initialRemainingMs,
 onTimeExpired,
 onTimerSync,
}: SessionTimerProps) {
 const [remainingMs, setRemainingMs] = useState(initialRemainingMs || 0);

 // Calculate remaining time based on end time
 const calculateRemaining = useCallback(() => {
 if (!endTime) return 0;
 const end = new Date(endTime).getTime();
 const now = Date.now();
 return Math.max(0, end - now);
 }, [endTime]);

 // Sync with external remaining time
 useEffect(() => {
 if (initialRemainingMs !== undefined) {
 setRemainingMs(initialRemainingMs);
 }
 }, [initialRemainingMs]);

 // Update timer based on end time
 useEffect(() => {
 if (endTime) {
 setRemainingMs(calculateRemaining());
 }
 }, [endTime, calculateRemaining]);

 // Countdown interval
 useEffect(() => {
 const interval = setInterval(() => {
 const newRemaining = calculateRemaining();
 setRemainingMs(newRemaining);
 onTimerSync?.(newRemaining);

 if (newRemaining <= 0) {
 clearInterval(interval);
 onTimeExpired();
 }
 }, 1000);

 return () => clearInterval(interval);
 }, [calculateRemaining, onTimeExpired, onTimerSync]);

 // Format time
 const formatTime = (ms: number) => {
 const totalSeconds = Math.floor(ms / 1000);
 const hours = Math.floor(totalSeconds / 3600);
 const minutes = Math.floor((totalSeconds % 3600) / 60);
 const seconds = totalSeconds % 60;

 if (hours > 0) {
 return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
 }
 return `${minutes}:${seconds.toString().padStart(2, "0")}`;
 };

 // Warning threshold (5 minutes)
 const isWarning = remainingMs <= 5 * 60 * 1000 && remainingMs > 0;
 const isCritical = remainingMs <= 1 * 60 * 1000 && remainingMs > 0;
 const isExpired = remainingMs <= 0;

 return (
 <div
 className={`flex items-center gap-3 px-6 py-2.5 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-xl backdrop-blur-3xl border-2 ${isExpired
 ? "bg-destructive/20 text-destructive border-destructive/30"
 : isCritical
 ? "bg-destructive/30 text-destructive border-destructive/50 animate-pulse"
 : isWarning
 ? "bg-primary/20 text-primary border-primary/30"
 : "bg-card/40 text-foreground border-border/50"
 }`}
 >
 {isCritical || isWarning ? (
 <AlertTriangle className="size-4" />
 ) : (
 <Clock className="size-4 text-primary" />
 )}
 <span>
 {isExpired ? "Session Ended" : formatTime(remainingMs)}
 </span>
 </div>
 );
}
