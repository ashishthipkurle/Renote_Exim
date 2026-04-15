"use client";

import {
 Loader2,
 Mic,
 MicOff,
 PhoneCall,
 PhoneOff,
 Radio,
 Video,
 VideoOff,
 Waves,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

import type { RealtimeCallController } from "@/hooks/useRealtimeCall";
import { Button } from "@/components/ui/button";

type LiveCallDockProps = {
 controller: RealtimeCallController;
 className?: string;
};

function statusLabel(phase: RealtimeCallController["phase"]) {
 if (phase === "idle") return "Standby";
 if (phase === "ringing") return "Incoming Call";
 if (phase === "calling") return "Dialing";
 if (phase === "connecting") return "Connecting";
 if (phase === "in-call") return "Live";
 return "Ended";
}

export default function LiveCallDock({ controller, className }: LiveCallDockProps) {
 const localVideoRef = useRef<HTMLVideoElement | null>(null);
 const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

 useEffect(() => {
 if (!localVideoRef.current) return;
 if (!controller.localStream) {
 localVideoRef.current.srcObject = null;
 return;
 }
 localVideoRef.current.srcObject = controller.localStream;
 }, [controller.localStream]);

 useEffect(() => {
 if (!remoteVideoRef.current) return;
 if (!controller.remoteStream) {
 remoteVideoRef.current.srcObject = null;
 return;
 }
 remoteVideoRef.current.srcObject = controller.remoteStream;
 }, [controller.remoteStream]);

 const activeName = useMemo(() => {
 if (controller.incomingCall?.fromName) return controller.incomingCall.fromName;
 if (controller.activeCall?.peerName) return controller.activeCall.peerName;
 return "Trade Partner";
 }, [controller.activeCall?.peerName, controller.incomingCall?.fromName]);

 const modeLabel = controller.activeCall?.callType || controller.incomingCall?.callType || "VIDEO";
 const isVideoMode = modeLabel === "VIDEO";

 return (
 <div className={`rounded-lg border border-border bg-card/70 shadow-2xl backdrop-blur-xl ${className || ""}`}>
 <div className="relative overflow-hidden rounded-lg p-5">
 <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.18),_transparent_42%)]" />

 <div className="relative mb-4 flex items-center justify-between gap-3">
 <div>
 <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Realtime Call Desk</p>
 <h3 className="mt-1 text-lg font-black tracking-tight text-foreground">{activeName}</h3>
 </div>
 <div className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
 <Radio className="h-3 w-3" />
 {statusLabel(controller.phase)}
 </div>
 </div>

 <AnimatePresence mode="wait">
 {controller.phase === "ringing" && controller.incomingCall ? (
 <motion.div
 key="ringing"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 className="relative space-y-4 rounded-lg border border-primary/25 bg-primary/10 p-4"
 >
 <div className="flex items-center gap-3">
 <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 text-primary">
 <PhoneCall className="h-5 w-5" />
 <span className="absolute inset-0 animate-ping rounded-lg border border-primary/40" />
 </div>
 <div>
 <p className="text-xs font-black uppercase tracking-widest text-primary">Incoming {controller.incomingCall.callType.toLowerCase()} call</p>
 <p className="text-sm text-foreground">{controller.incomingCall.fromName || "Trade Partner"} is calling you now.</p>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2">
 <Button
 type="button"
 variant="outline"
 className="h-11 rounded-xl border-red-400/40 bg-red-500/10 font-black text-red-400 hover:bg-red-500/20"
 onClick={controller.declineCall}
 >
 <PhoneOff className="h-4 w-4" />
 Decline
 </Button>
 <Button
 type="button"
 className="h-11 rounded-xl bg-emerald-600 font-black text-white hover:bg-emerald-500"
 onClick={controller.acceptCall}
 >
 <PhoneCall className="h-4 w-4" />
 Accept
 </Button>
 </div>
 </motion.div>
 ) : controller.activeCall ? (
 <motion.div
 key="active"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 className="space-y-4"
 >
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
 <div className="relative overflow-hidden rounded-lg border border-border bg-black/70">
 {isVideoMode ? (
 <video
 ref={remoteVideoRef}
 autoPlay
 playsInline
 className="aspect-video w-full object-cover"
 />
 ) : (
 <div className="flex aspect-video w-full items-center justify-center text-slate-300">
 <Waves className="h-10 w-10 animate-pulse" />
 </div>
 )}
 <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white">
 Remote
 </span>
 </div>

 <div className="relative overflow-hidden rounded-lg border border-border bg-black/70">
 {isVideoMode ? (
 <video
 ref={localVideoRef}
 autoPlay
 muted
 playsInline
 className="aspect-video w-full object-cover"
 />
 ) : (
 <div className="flex aspect-video w-full items-center justify-center text-slate-300">
 <Waves className="h-10 w-10" />
 </div>
 )}
 <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white">
 You
 </span>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-2">
 <Button
 type="button"
 variant="outline"
 className="h-11 rounded-xl border-border bg-muted/40"
 onClick={controller.toggleMute}
 >
 {controller.isMuted ? <MicOff className="h-4 w-4 text-red-400" /> : <Mic className="h-4 w-4" />}
 </Button>
 <Button
 type="button"
 variant="outline"
 disabled={!isVideoMode}
 className="h-11 rounded-xl border-border bg-muted/40"
 onClick={controller.toggleCamera}
 >
 {controller.isCameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4 text-amber-400" />}
 </Button>
 <Button
 type="button"
 className="h-11 rounded-xl bg-red-500 font-black text-white hover:bg-red-400"
 onClick={controller.endCall}
 >
 <PhoneOff className="h-4 w-4" />
 </Button>
 </div>
 </motion.div>
 ) : (
 <motion.div
 key="idle"
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 className="rounded-lg border border-border bg-muted/30 p-4"
 >
 <div className="flex items-center gap-3 text-muted-foreground">
 {controller.phase === "calling" || controller.phase === "connecting" ? (
 <Loader2 className="h-5 w-5 animate-spin text-primary" />
 ) : (
 <PhoneCall className="h-5 w-5 text-primary" />
 )}
 <div>
 <p className="text-xs font-black uppercase tracking-widest text-primary">Live signaling active</p>
 <p className="text-sm">Start a call from importer cards or accept incoming requests here.</p>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {controller.error ? (
 <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">
 {controller.error}
 </p>
 ) : null}
 </div>
 </div>
 );
}
