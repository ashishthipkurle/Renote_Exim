"use client";

import { Loader2, Clock, UserCheck, UserX } from "lucide-react";

interface SessionWaitingStateProps {
 state: "waiting-for-admin" | "waiting-for-student" | "connecting" | "starting";
 participantName?: string;
}

export function SessionWaitingState({ state, participantName }: SessionWaitingStateProps) {
 const stateConfig = {
 "waiting-for-admin": {
 icon: <Clock className="size-12 text-yellow-500" />,
 title: "Waiting for Instructor",
 description: "The session will begin once the instructor joins.",
 subtext: "Please keep this page open.",
 },
 "waiting-for-student": {
 icon: <UserX className="size-12 text-blue-500" />,
 title: `Waiting for ${participantName || "Student"}`,
 description: "The student hasn't joined yet.",
 subtext: "They will appear here once they connect.",
 },
 connecting: {
 icon: <Loader2 className="size-12 text-[var(--color-primary)] animate-spin" />,
 title: "Connecting...",
 description: "Establishing secure connection.",
 subtext: "This may take a few seconds.",
 },
 starting: {
 icon: <UserCheck className="size-12 text-green-500" />,
 title: "Starting Session",
 description: "Setting up your video call.",
 subtext: "You'll be connected shortly.",
 },
 };

 const config = stateConfig[state];

 return (
 <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[var(--color-card)] to-[var(--color-card-dark)] rounded-xl p-8">
 {/* Animated background circles */}
 <div className="relative">
 <div className="absolute inset-0 -m-8">
 <div className="absolute inset-0 rounded-full bg-[var(--color-primary)]/5 animate-ping" />
 </div>
 <div className="relative z-10 p-6 bg-[var(--color-card)] rounded-full border border-[var(--color-border)] shadow-lg">
 {config.icon}
 </div>
 </div>

 {/* Text */}
 <h2 className="mt-8 text-xl font-semibold text-[var(--color-foreground)]">
 {config.title}
 </h2>
 <p className="mt-2 text-[var(--color-muted-foreground)] text-center max-w-sm">
 {config.description}
 </p>
 <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
 {config.subtext}
 </p>

 {/* Dots animation */}
 <div className="flex gap-1 mt-6">
 <span className="size-2 rounded-full bg-[var(--color-muted)] animate-bounce" style={{ animationDelay: "0ms" }} />
 <span className="size-2 rounded-full bg-[var(--color-muted)] animate-bounce" style={{ animationDelay: "150ms" }} />
 <span className="size-2 rounded-full bg-[var(--color-muted)] animate-bounce" style={{ animationDelay: "300ms" }} />
 </div>
 </div>
 );
}
