"use client";

import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Clock, Monitor, MonitorOff, MoreHorizontal } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface VideoControlsProps {
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    isScreenSharing?: boolean;
    onToggleAudio: () => void;
    onToggleVideo: () => void;
    onToggleScreenShare?: () => void;
    onEndCall: () => void;
    onExtendSession?: () => void;
    isAdmin?: boolean;
    disabled?: boolean;
}

export function VideoControls({
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing = false,
    onToggleAudio,
    onToggleVideo,
    onToggleScreenShare,
    onEndCall,
    onExtendSession,
    isAdmin = false,
    disabled = false,
}: VideoControlsProps) {
    return (
        <TooltipProvider>
            <div className="flex items-center justify-center gap-5 p-5 bg-black/40 backdrop-blur-4xl rounded-[32px] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                {/* Mute/Unmute */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleAudio}
                            disabled={disabled}
                            className={`size-14 rounded-2xl border transition-all duration-500 relative group overflow-hidden ${
                                isAudioEnabled 
                                    ? "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10" 
                                    : "bg-destructive/20 border-destructive/30 text-destructive hover:bg-destructive/30"
                            }`}
                        >
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {isAudioEnabled ? <Mic className="size-5.5 relative z-10" /> : <MicOff className="size-5.5 relative z-10" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-black/90 border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-2">
                        {isAudioEnabled ? "Silence Microphone" : "Activate Microphone"}
                    </TooltipContent>
                </Tooltip>

                {/* Camera toggle */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleVideo}
                            disabled={disabled}
                            className={`size-14 rounded-2xl border transition-all duration-500 relative group overflow-hidden ${
                                isVideoEnabled 
                                    ? "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10" 
                                    : "bg-destructive/20 border-destructive/30 text-destructive hover:bg-destructive/30"
                            }`}
                        >
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {isVideoEnabled ? <Video className="size-5.5 relative z-10" /> : <VideoOff className="size-5.5 relative z-10" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-black/90 border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-2">
                        {isVideoEnabled ? "Disable Vision" : "Enable Vision"}
                    </TooltipContent>
                </Tooltip>

                {/* Screen Share toggle */}
                {onToggleScreenShare && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onToggleScreenShare}
                                disabled={disabled}
                                className={`size-14 rounded-2xl border transition-all duration-500 relative group overflow-hidden ${
                                    isScreenSharing
                                        ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                                        : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {isScreenSharing ? <MonitorOff className="size-5.5 relative z-10" /> : <Monitor className="size-5.5 relative z-10" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-black/90 border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-2">
                            {isScreenSharing ? "End Stream" : "Share Display"}
                        </TooltipContent>
                    </Tooltip>
                )}

                <div className="w-px h-10 bg-white/10 mx-1" />

                {/* Extend session - Admin only */}
                {isAdmin && onExtendSession && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onExtendSession}
                                disabled={disabled}
                                className="size-14 rounded-2xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary transition-all duration-500 hover:scale-105"
                            >
                                <Clock className="size-5.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-black/90 border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-2">
                            Add Session Time
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* End call - Admin only */}
                {isAdmin && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onEndCall}
                                disabled={disabled}
                                className="size-16 rounded-3xl bg-destructive hover:bg-destructive/90 text-white border-4 border-white/10 shadow-[0_0_40px_rgba(239,68,68,0.3)] transition-all duration-500 hover:scale-110 active:scale-95 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <PhoneOff className="size-7 relative z-10" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-black/90 border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-2">
                            Terminate Connection
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* More Options */}
                {!isAdmin && (
                    <Button variant="ghost" size="icon" className="size-14 rounded-2xl border border-white/10 text-white/40 hover:text-white transition-all">
                        <MoreHorizontal className="size-6" />
                    </Button>
                )}
            </div>
        </TooltipProvider>
    );
}
