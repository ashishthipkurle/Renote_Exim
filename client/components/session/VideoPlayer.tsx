"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface VideoPlayerProps {
 stream: MediaStream | null;
 name: string;
 image?: string | null;
 isLocal?: boolean;
 isMuted?: boolean;
 isVideoOff?: boolean;
 className?: string;
}

export function VideoPlayer({
 stream,
 name,
 image,
 isLocal = false,
 isMuted = false,
 isVideoOff = false,
 className = "",
}: VideoPlayerProps) {
 const videoRef = useRef<HTMLVideoElement>(null);

 useEffect(() => {
 if (videoRef.current && stream) {
 videoRef.current.srcObject = stream;
 }
 }, [stream]);

 const initials = name
 .split(" ")
 .map((n) => n[0])
 .join("")
 .toUpperCase()
 .slice(0, 2);

 return (
 <div className={`relative bg-[var(--color-card)] rounded-xl overflow-hidden ${className}`}>
 {/* Video element */}
 {stream && !isVideoOff ? (
 <video
 ref={videoRef}
 autoPlay
 playsInline
 muted={isLocal}
 className="w-full h-full object-cover"
 />
 ) : (
 // Placeholder when no video
 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-card)] to-[var(--color-card-dark)]">
 <Avatar className="size-24">
 <AvatarImage src={image || undefined} />
 <AvatarFallback className="text-2xl bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
 {initials}
 </AvatarFallback>
 </Avatar>
 </div>
 )}

 {/* Name overlay */}
 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
 <div className="flex items-center justify-between">
 <span className="text-white text-sm font-medium">
 {name} {isLocal && "(You)"}
 </span>
 <div className="flex items-center gap-2">
 {isMuted && (
 <div className="bg-red-500/80 rounded-full p-1">
 <MicOff className="size-3 text-white" />
 </div>
 )}
 {isVideoOff && (
 <div className="bg-red-500/80 rounded-full p-1">
 <VideoOff className="size-3 text-white" />
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Local indicator */}
 {isLocal && (
 <div className="absolute top-3 left-3">
 <span className="text-xs bg-[var(--color-primary)] text-white px-2 py-1 rounded-full">
 You
 </span>
 </div>
 )}
 </div>
 );
}
