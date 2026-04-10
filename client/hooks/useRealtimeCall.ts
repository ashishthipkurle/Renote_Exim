"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { authFetch } from "@/lib/api-utils";
import { getSocket } from "@/lib/socket";
import Peer, { type Instance as PeerInstance, type SignalData } from "simple-peer";
import { useCallback, useEffect, useRef, useState } from "react";

export type CallMode = "AUDIO" | "VIDEO";
export type CallPhase = "idle" | "ringing" | "calling" | "connecting" | "in-call" | "ended";

export type CallTarget = {
  id: string;
  name?: string | null;
};

export type IncomingCallInfo = {
  sessionId: string;
  fromUserId: string;
  fromName?: string | null;
  callType: CallMode;
  scheduleId?: string | null;
  startedAt: string;
};

export type ActiveCallInfo = {
  sessionId: string;
  peerUserId: string;
  peerName?: string | null;
  callType: CallMode;
  scheduleId?: string | null;
  initiatedByMe: boolean;
};

export type RealtimeCallController = {
  phase: CallPhase;
  incomingCall: IncomingCallInfo | null;
  activeCall: ActiveCallInfo | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  error: string | null;
  isMuted: boolean;
  isCameraEnabled: boolean;
  startCall: (args: { target: CallTarget; callType: CallMode; scheduleId?: string | null }) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  toggleCamera: () => void;
};

type SignalPayload = {
  sessionId: string;
  signal: SignalData;
  fromUserId: string;
  toUserId: string;
};

type IncomingPayload = {
  sessionId: string;
  fromUserId: string;
  toUserId: string;
  fromName?: string | null;
  callType: CallMode;
  scheduleId?: string | null;
  startedAt: string;
  signal?: SignalData;
};

type EndPayload = {
  sessionId: string;
  fromUserId: string;
  toUserId: string;
  reason?: string;
};

function getMediaConstraints(callType: CallMode): MediaStreamConstraints {
  return {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video:
      callType === "VIDEO"
        ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 24, max: 30 },
          }
        : false,
  };
}

export function useRealtimeCall() {
  const { user } = useAuth();
  const socket = getSocket();

  const [phase, setPhase] = useState<CallPhase>("idle");
  const [incomingCall, setIncomingCall] = useState<IncomingCallInfo | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCallInfo | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);

  const phaseRef = useRef<CallPhase>("idle");
  const incomingRef = useRef<IncomingCallInfo | null>(null);
  const peerRef = useRef<PeerInstance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const activeCallRef = useRef<ActiveCallInfo | null>(null);
  const pendingSignalsRef = useRef<Map<string, SignalData[]>>(new Map());
  const hasSentIncomingInviteRef = useRef(false);
  const endingSessionIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    incomingRef.current = incomingCall;
  }, [incomingCall]);

  const updateSession = useCallback(
    async (sessionId: string, action: "connect" | "end" | "missed" | "declined" | "failed", endedReason?: string) => {
      try {
        await authFetch(`/api/calls/sessions/${sessionId}`, {
          method: "PATCH",
          body: JSON.stringify({ action, endedReason }),
        });
      } catch {
        // Session bookkeeping should not block UI controls.
      }
    },
    []
  );

  const stopAndClearStreams = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsCameraEnabled(true);
  }, []);

  const destroyPeer = useCallback(() => {
    if (peerRef.current) {
      try {
        peerRef.current.removeAllListeners();
        peerRef.current.destroy();
      } catch {
        // Ignore destroy failures.
      }
      peerRef.current = null;
    }
  }, []);

  const sendSignalEvent = useCallback(
    async (event: "incoming-call" | "call-signal" | "call-accepted" | "call-ended", payload: Record<string, unknown>) => {
      socket.emit(event, payload);
    },
    [socket]
  );

  const ensureLocalStream = useCallback(async (callType: CallMode) => {
    if (localStreamRef.current) return localStreamRef.current;

    const stream = await navigator.mediaDevices.getUserMedia(getMediaConstraints(callType));
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const applyPendingSignals = useCallback((sessionId: string, peer: PeerInstance) => {
    const queued = pendingSignalsRef.current.get(sessionId) || [];
    if (!queued.length) return;

    queued.forEach((signal) => {
      try {
        peer.signal(signal);
      } catch {
        // Ignore invalid queued signals.
      }
    });

    pendingSignalsRef.current.delete(sessionId);
  }, []);

  const endCurrentCall = useCallback(
    async (reason = "ended", remoteRequested = false) => {
      const current = activeCallRef.current;
      if (!current) return;

      if (endingSessionIdsRef.current.has(current.sessionId)) return;
      endingSessionIdsRef.current.add(current.sessionId);

      if (!remoteRequested && user?.id) {
        try {
          await sendSignalEvent("call-ended", {
            sessionId: current.sessionId,
            fromUserId: user.id,
            toUserId: current.peerUserId,
            reason,
          });
        } catch {
          // Ignore realtime send failures.
        }
      }

      await updateSession(current.sessionId, "end", reason);

      destroyPeer();
      stopAndClearStreams();
      pendingSignalsRef.current.delete(current.sessionId);

      setActiveCall(null);
      activeCallRef.current = null;
      setPhase("ended");
      setTimeout(() => setPhase("idle"), 400);

      endingSessionIdsRef.current.delete(current.sessionId);
    },
    [destroyPeer, sendSignalEvent, stopAndClearStreams, updateSession, user?.id]
  );

  const queueOrApplySignal = useCallback((payload: SignalPayload) => {
    const current = activeCallRef.current;

    if (current && current.sessionId === payload.sessionId && peerRef.current) {
      try {
        peerRef.current.signal(payload.signal);
      } catch {
        // Ignore malformed incoming signals.
      }
      return;
    }

    const queued = pendingSignalsRef.current.get(payload.sessionId) || [];
    queued.push(payload.signal);
    pendingSignalsRef.current.set(payload.sessionId, queued);
  }, []);

  const createPeer = useCallback(
    (
      opts: {
        initiator: boolean;
        sessionId: string;
        peerUserId: string;
        callType: CallMode;
        scheduleId?: string | null;
      },
      stream: MediaStream
    ) => {
      const peer = new Peer({
        initiator: opts.initiator,
        trickle: true,
        stream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });

      peer.on("signal", async (signal: SignalData) => {
        if (!user?.id) return;

        if (opts.initiator && !hasSentIncomingInviteRef.current) {
          hasSentIncomingInviteRef.current = true;
          await sendSignalEvent("incoming-call", {
            sessionId: opts.sessionId,
            fromUserId: user.id,
            toUserId: opts.peerUserId,
            fromName: user.name,
            callType: opts.callType,
            scheduleId: opts.scheduleId || null,
            startedAt: new Date().toISOString(),
            signal,
          } satisfies IncomingPayload);
          return;
        }

        await sendSignalEvent("call-signal", {
          sessionId: opts.sessionId,
          fromUserId: user?.id,
          toUserId: opts.peerUserId,
          signal,
        } satisfies SignalPayload);
      });

      peer.on("stream", (nextRemoteStream) => {
        setRemoteStream(nextRemoteStream);
      });

      peer.on("connect", async () => {
        setPhase("in-call");
        await updateSession(opts.sessionId, "connect");
      });

      peer.on("close", () => {
        void endCurrentCall("peer-closed", true);
      });

      peer.on("error", (eventError: Error) => {
        setError(eventError.message || "Call error");
      });

      peerRef.current = peer;
      applyPendingSignals(opts.sessionId, peer);

      return peer;
    },
    [applyPendingSignals, endCurrentCall, sendSignalEvent, updateSession, user?.id, user?.name]
  );

  const startCall = useCallback(
    async ({ target, callType, scheduleId }: { target: CallTarget; callType: CallMode; scheduleId?: string | null }) => {
      if (!user?.id) return;
      if (!target.id || target.id === user.id) return;
      if (phase === "calling" || phase === "connecting" || phase === "in-call") return;

      setError(null);
      setIncomingCall(null);
      setPhase("calling");

      try {
        const stream = await ensureLocalStream(callType);

        const { session } = await authFetch<{ session: { id: string } }>("/api/calls/sessions", {
          method: "POST",
          body: JSON.stringify({
            calleeId: target.id,
            callType,
            scheduleId: scheduleId || null,
          }),
        });

        hasSentIncomingInviteRef.current = false;
        pendingSignalsRef.current.set(session.id, []);

        const nextActiveCall: ActiveCallInfo = {
          sessionId: session.id,
          peerUserId: target.id,
          peerName: target.name,
          callType,
          scheduleId: scheduleId || null,
          initiatedByMe: true,
        };

        setActiveCall(nextActiveCall);
        activeCallRef.current = nextActiveCall;

        createPeer(
          {
            initiator: true,
            sessionId: session.id,
            peerUserId: target.id,
            callType,
            scheduleId,
          },
          stream
        );
      } catch (startError) {
        const message = startError instanceof Error ? startError.message : "Unable to start call";
        setError(message);
        setPhase("idle");
        stopAndClearStreams();
      }
    },
    [createPeer, ensureLocalStream, phase, stopAndClearStreams, user?.id]
  );

  const acceptCall = useCallback(async () => {
    if (!user?.id || !incomingCall) return;

    setError(null);
    setPhase("connecting");

    try {
      const stream = await ensureLocalStream(incomingCall.callType);

      const nextActiveCall: ActiveCallInfo = {
        sessionId: incomingCall.sessionId,
        peerUserId: incomingCall.fromUserId,
        peerName: incomingCall.fromName,
        callType: incomingCall.callType,
        scheduleId: incomingCall.scheduleId,
        initiatedByMe: false,
      };

      setActiveCall(nextActiveCall);
      activeCallRef.current = nextActiveCall;

      createPeer(
        {
          initiator: false,
          sessionId: incomingCall.sessionId,
          peerUserId: incomingCall.fromUserId,
          callType: incomingCall.callType,
          scheduleId: incomingCall.scheduleId,
        },
        stream
      );

      await sendSignalEvent("call-accepted", {
        sessionId: incomingCall.sessionId,
        fromUserId: user.id,
        toUserId: incomingCall.fromUserId,
      });

      setIncomingCall(null);
      incomingRef.current = null;
    } catch (acceptError) {
      const message = acceptError instanceof Error ? acceptError.message : "Unable to accept call";
      setError(message);
      setPhase("idle");
      stopAndClearStreams();
    }
  }, [createPeer, ensureLocalStream, incomingCall, sendSignalEvent, stopAndClearStreams, user?.id]);

  const declineCall = useCallback(async () => {
    if (!incomingCall || !user?.id) return;

    try {
      await sendSignalEvent("call-ended", {
        sessionId: incomingCall.sessionId,
        fromUserId: user.id,
        toUserId: incomingCall.fromUserId,
        reason: "declined",
      } satisfies EndPayload);

      await updateSession(incomingCall.sessionId, "declined", "declined");
    } catch {
      // Ignore realtime or persistence failures for decline action.
    }

    pendingSignalsRef.current.delete(incomingCall.sessionId);
    setIncomingCall(null);
    incomingRef.current = null;
    setPhase("idle");
  }, [incomingCall, sendSignalEvent, updateSession, user?.id]);

  const endCall = useCallback(async () => {
    await endCurrentCall("ended", false);
  }, [endCurrentCall]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const nextMuted = !isMuted;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const hasVideo = stream.getVideoTracks().length > 0;
    if (!hasVideo) return;

    const nextEnabled = !isCameraEnabled;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = nextEnabled;
    });
    setIsCameraEnabled(nextEnabled);
  }, [isCameraEnabled]);

  useEffect(() => {
    if (!user?.id) return;

    socket.emit("join-user-room", user.id);

    const onIncomingCall = (payload: IncomingPayload) => {
      if (!payload?.toUserId || payload.toUserId !== user.id) return;
      if (!payload.sessionId || !payload.fromUserId) return;

      const hasActive =
        phaseRef.current === "calling" ||
        phaseRef.current === "connecting" ||
        phaseRef.current === "in-call" ||
        !!activeCallRef.current;

      if (hasActive) {
        void sendSignalEvent("call-ended", {
          sessionId: payload.sessionId,
          fromUserId: user.id,
          toUserId: payload.fromUserId,
          reason: "busy",
        } satisfies EndPayload);
        void updateSession(payload.sessionId, "failed", "busy");
        return;
      }

      if (payload.signal) {
        pendingSignalsRef.current.set(payload.sessionId, [payload.signal]);
      }

      setIncomingCall({
        sessionId: payload.sessionId,
        fromUserId: payload.fromUserId,
        fromName: payload.fromName,
        callType: payload.callType,
        scheduleId: payload.scheduleId,
        startedAt: payload.startedAt,
      });
      setPhase("ringing");
    };

    const onCallSignal = (payload: SignalPayload) => {
      if (!payload?.toUserId || payload.toUserId !== user.id) return;
      if (!payload.signal || !payload.sessionId) return;
      queueOrApplySignal(payload);
    };

    const onCallAccepted = (payload: { sessionId: string; toUserId: string }) => {
      if (!payload?.toUserId || payload.toUserId !== user.id) return;
      if (!activeCallRef.current) return;
      if (activeCallRef.current.sessionId !== payload.sessionId) return;
      setPhase("connecting");
    };

    const onCallEnded = (payload: EndPayload) => {
      if (!payload?.toUserId || payload.toUserId !== user.id) return;

      if (incomingRef.current && incomingRef.current.sessionId === payload.sessionId) {
        setIncomingCall(null);
        incomingRef.current = null;
        setPhase("idle");
        void updateSession(payload.sessionId, "missed", payload.reason || "missed");
        return;
      }

      if (!activeCallRef.current || activeCallRef.current.sessionId !== payload.sessionId) return;

      void endCurrentCall(payload.reason || "ended", true);
    };

    socket.on("incoming-call", onIncomingCall);
    socket.on("call-signal", onCallSignal);
    socket.on("call-accepted", onCallAccepted);
    socket.on("call-ended", onCallEnded);

    return () => {
      socket.off("incoming-call", onIncomingCall);
      socket.off("call-signal", onCallSignal);
      socket.off("call-accepted", onCallAccepted);
      socket.off("call-ended", onCallEnded);

      destroyPeer();
      stopAndClearStreams();
      setIncomingCall(null);
      setActiveCall(null);
      setPhase("idle");
    };
  }, [
    destroyPeer,
    endCurrentCall,
    queueOrApplySignal,
    sendSignalEvent,
    stopAndClearStreams,
    socket,
    updateSession,
    user?.id,
  ]);

  return {
    phase,
    incomingCall,
    activeCall,
    localStream,
    remoteStream,
    error,
    isMuted,
    isCameraEnabled,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleCamera,
  } satisfies RealtimeCallController;
}
