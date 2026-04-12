"use client";

import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Clock, Monitor, MonitorOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
 <div className="flex items-center justify-center gap-3 p-4 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)]">
 {/* Mute/Unmute */}
 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 variant={isAudioEnabled ? "outline" : "destructive"}
 size="icon"
 onClick={onToggleAudio}
 disabled={disabled}
 className="size-12 rounded-full"
 >
 {isAudioEnabled ? (
 <Mic className="size-5" />
 ) : (
 <MicOff className="size-5" />
 )}
 </Button>
 </TooltipTrigger>
 <TooltipContent>
 {isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
 </TooltipContent>
 </Tooltip>

 {/* Camera toggle */}
 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 variant={isVideoEnabled ? "outline" : "destructive"}
 size="icon"
 onClick={onToggleVideo}
 disabled={disabled}
 className="size-12 rounded-full"
 >
 {isVideoEnabled ? (
 <Video className="size-5" />
 ) : (
 <VideoOff className="size-5" />
 )}
 </Button>
 </TooltipTrigger>
 <TooltipContent>
 {isVideoEnabled ? "Turn off camera" : "Turn on camera"}
 </TooltipContent>
 </Tooltip>

 {/* Screen Share toggle */}
 {onToggleScreenShare && (
 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 variant={isScreenSharing ? "default" : "outline"}
 size="icon"
 onClick={onToggleScreenShare}
 disabled={disabled}
 className={`size-12 rounded-full ${isScreenSharing
 ? "bg-blue-500 hover:bg-blue-600 text-white"
 : ""
 }`}
 >
 {isScreenSharing ? (
 <MonitorOff className="size-5" />
 ) : (
 <Monitor className="size-5" />
 )}
 </Button>
 </TooltipTrigger>
 <TooltipContent>
 {isScreenSharing ? "Stop sharing screen" : "Share screen"}
 </TooltipContent>
 </Tooltip>
 )}

 {/* End call - Admin only */}
 {isAdmin && (
 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 variant="destructive"
 size="icon"
 onClick={onEndCall}
 disabled={disabled}
 className="size-12 rounded-full"
 >
 <PhoneOff className="size-5" />
 </Button>
 </TooltipTrigger>
 <TooltipContent>End session</TooltipContent>
 </Tooltip>
 )}

 {/* Extend session - Admin only */}
 {isAdmin && onExtendSession && (
 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 variant="outline"
 size="icon"
 onClick={onExtendSession}
 disabled={disabled}
 className="size-12 rounded-full bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-600"
 >
 <Clock className="size-5" />
 </Button>
 </TooltipTrigger>
 <TooltipContent>Extend session</TooltipContent>
 </Tooltip>
 )}
 </div>
 </TooltipProvider>
 );
}

