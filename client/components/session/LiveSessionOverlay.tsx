"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { RealtimeCallController } from "@/hooks/useRealtimeCall";
import { VideoPlayer } from "./VideoPlayer";
import { LiveChatPanel, ChatMessage } from "./LiveChatPanel";
import {
    Phone,
    PhoneOff,
    Mic,
    MicOff,
    Video,
    VideoOff,
    X,
    MessageSquare,
    MoreVertical,
} from "lucide-react";

interface LiveSessionOverlayProps {
    callController: RealtimeCallController;
    messages?: ChatMessage[];
    onSendMessage?: (content: string) => void;
    currentUserId: string;
}

/**
 * LiveSessionOverlay — Google Meet-inspired video call UI.
 *
 * - RINGING phase: compact popup card in top-right (like a phone notification)
 * - CALLING/CONNECTING/IN-CALL: fullscreen Google Meet overlay
 *
 * Renders in a React Portal on document.body to escape CSS transform stacking contexts.
 */
export function LiveSessionOverlay({
    callController,
    messages = [],
    onSendMessage = () => {},
    currentUserId,
}: LiveSessionOverlayProps) {
    const [mounted, setMounted] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Timer for in-call duration
    useEffect(() => {
        if (callController.phase === "in-call") {
            setElapsedTime(0);
            timerRef.current = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [callController.phase]);

    const isActive = callController.phase !== "idle" && callController.phase !== "ended";
    if (!mounted || !isActive) return null;

    const peerName =
        callController.activeCall?.peerName ||
        callController.incomingCall?.fromName ||
        "Partner";

    const isInCall = callController.phase === "in-call";
    const isCalling = callController.phase === "calling";
    const isRinging = callController.phase === "ringing";
    const isConnecting = callController.phase === "connecting";

    const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        return `${m}:${String(s).padStart(2, "0")}`;
    };

    const initial = peerName.charAt(0).toUpperCase();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RINGING PHASE — Compact popup card in top-right corner
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (isRinging) {
        const popup = (
            <div
                style={{
                    position: "fixed",
                    top: 20,
                    right: 20,
                    zIndex: 99999,
                    width: 340,
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.45), 0 2px 12px rgba(0,0,0,0.3)",
                    fontFamily: "'Google Sans', 'Roboto', -apple-system, sans-serif",
                    animation: "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
            >
                {/* Top gradient bar */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)",
                        padding: "20px 20px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                    }}
                >
                    {/* Avatar */}
                    <div
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(8px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 22,
                            fontWeight: 600,
                            color: "#fff",
                            flexShrink: 0,
                            border: "2px solid rgba(255,255,255,0.3)",
                            animation: "pulseAvatar 2s ease-in-out infinite",
                        }}
                    >
                        {initial}
                    </div>

                    {/* Caller info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                fontSize: 16,
                                fontWeight: 600,
                                color: "#fff",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {peerName}
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: "rgba(255,255,255,0.8)",
                                marginTop: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <Video size={14} />
                            Incoming video call
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div
                    style={{
                        background: "#2d2e31",
                        padding: "14px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                    }}
                >
                    {/* Decline */}
                    <button
                        onClick={() => void callController.declineCall()}
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            padding: "12px 16px",
                            borderRadius: 28,
                            border: "none",
                            background: "#ea4335",
                            color: "#fff",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#d93025";
                            e.currentTarget.style.transform = "scale(1.02)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#ea4335";
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    >
                        <PhoneOff size={18} />
                        Decline
                    </button>

                    {/* Accept */}
                    <button
                        onClick={() => void callController.acceptCall()}
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            padding: "12px 16px",
                            borderRadius: 28,
                            border: "none",
                            background: "#34a853",
                            color: "#fff",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#2d9649";
                            e.currentTarget.style.transform = "scale(1.02)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#34a853";
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    >
                        <Phone size={18} />
                        Accept
                    </button>
                </div>

                {/* Keyframes */}
                <style>{`
                    @keyframes slideInRight {
                        from {
                            opacity: 0;
                            transform: translateX(100px) scale(0.9);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0) scale(1);
                        }
                    }
                    @keyframes pulseAvatar {
                        0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
                        50% { box-shadow: 0 0 0 10px rgba(255,255,255,0); }
                    }
                `}</style>
            </div>
        );

        return createPortal(popup, document.body);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CALLING / CONNECTING / IN-CALL — Fullscreen Google Meet overlay
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const overlay = (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                background: "#202124",
                display: "flex",
                flexDirection: "column",
                fontFamily: "'Google Sans', 'Roboto', -apple-system, sans-serif",
            }}
        >
            {/* ── Main Video Area ── */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    padding: "8px",
                    gap: "8px",
                    minHeight: 0,
                    position: "relative",
                }}
            >
                {/* Remote / Main Video Panel */}
                <div
                    style={{
                        flex: 1,
                        borderRadius: "12px",
                        overflow: "hidden",
                        position: "relative",
                        background: "linear-gradient(135deg, #3c4043 0%, #2d3436 50%, #3c4043 100%)",
                    }}
                >
                    {isInCall || isConnecting ? (
                        <>
                            <VideoPlayer
                                stream={callController.remoteStream}
                                name={peerName}
                                image={null}
                                isLocal={false}
                                className="w-full h-full object-cover border-none shadow-none rounded-none"
                            />
                            {/* If no remote video, show avatar */}
                            {!callController.remoteStream && (
                                <div style={{
                                    position: "absolute", inset: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    background: "linear-gradient(135deg, #4a6cf7 0%, #3b5998 50%, #4a6cf7 100%)",
                                }}>
                                    <div style={{
                                        width: 96, height: 96, borderRadius: "50%",
                                        background: "#6e88d6",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 40, fontWeight: 500, color: "#e8eaed",
                                    }}>
                                        {initial}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Calling state */
                        <div style={{
                            position: "absolute", inset: 0,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            background: "linear-gradient(135deg, #4a6cf7 0%, #3b5998 50%, #4a6cf7 100%)",
                        }}>
                            {/* Pulsing avatar */}
                            <div style={{ position: "relative", marginBottom: 24 }}>
                                <div style={{
                                    position: "absolute", inset: -12,
                                    borderRadius: "50%",
                                    border: "2px solid rgba(255,255,255,0.15)",
                                    animation: "meetPulse 2s ease-in-out infinite",
                                }} />
                                <div style={{
                                    position: "absolute", inset: -28,
                                    borderRadius: "50%",
                                    border: "2px solid rgba(255,255,255,0.08)",
                                    animation: "meetPulse 2s ease-in-out 0.5s infinite",
                                }} />
                                <div style={{
                                    width: 96, height: 96, borderRadius: "50%",
                                    background: "#6e88d6",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 40, fontWeight: 500, color: "#e8eaed",
                                }}>
                                    {initial}
                                </div>
                            </div>

                            <div style={{ textAlign: "center", color: "#e8eaed" }}>
                                <div style={{ fontSize: 22, fontWeight: 400, marginBottom: 8 }}>
                                    {peerName}
                                </div>
                                <div style={{
                                    fontSize: 14, color: "rgba(232,234,237,0.7)",
                                    fontWeight: 400,
                                }}>
                                    {isCalling ? "Calling..." : "Connecting..."}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Partner name tag (bottom-left) — only in active call */}
                    {(isInCall || isConnecting) && (
                        <div style={{
                            position: "absolute", bottom: 12, left: 12,
                            background: "rgba(0,0,0,0.6)",
                            borderRadius: 4,
                            padding: "4px 8px",
                            fontSize: 13, fontWeight: 500, color: "#e8eaed",
                            display: "flex", alignItems: "center", gap: 6,
                        }}>
                            {peerName}
                        </div>
                    )}

                    {/* Self-view PIP (top-right corner) */}
                    <div style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 200,
                        height: 150,
                        borderRadius: 12,
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                        background: "#3c4043",
                        border: "2px solid #202124",
                    }}>
                        <VideoPlayer
                            stream={callController.localStream}
                            name="You"
                            image={null}
                            isLocal={true}
                            isMuted={callController.isMuted}
                            isVideoOff={!callController.isCameraEnabled}
                            className="w-full h-full object-cover border-none shadow-none rounded-none"
                        />
                        {!callController.isCameraEnabled && (
                            <div style={{
                                position: "absolute", inset: 0,
                                background: "#3c4043",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: "50%",
                                    background: "#5f6368",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 20, fontWeight: 500, color: "#e8eaed",
                                }}>
                                    Y
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Panel — slides in from right */}
                {showChat && isInCall && (
                    <div style={{
                        width: 360,
                        flexShrink: 0,
                        borderRadius: 12,
                        overflow: "hidden",
                        background: "#292a2d",
                        display: "flex",
                        flexDirection: "column",
                    }}>
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "12px 16px",
                            borderBottom: "1px solid #3c4043",
                        }}>
                            <span style={{ color: "#e8eaed", fontSize: 16, fontWeight: 500 }}>
                                In-call messages
                            </span>
                            <button
                                onClick={() => setShowChat(false)}
                                style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    color: "#9aa0a6", padding: 4,
                                    display: "flex", alignItems: "center",
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <LiveChatPanel
                                messages={messages}
                                currentUserId={currentUserId}
                                onSendMessage={onSendMessage}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Bottom Bar ── */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                height: 80,
                position: "relative",
            }}>
                {/* Left: Time + meeting info */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    color: "#e8eaed", fontSize: 13, fontWeight: 400,
                    minWidth: 200,
                }}>
                    {isInCall && (
                        <>
                            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span style={{ color: "#5f6368" }}>|</span>
                            <span style={{ color: "#9aa0a6" }}>{formatTime(elapsedTime)}</span>
                        </>
                    )}
                    {isCalling && (
                        <span style={{ color: "#9aa0a6" }}>Calling {peerName}...</span>
                    )}
                </div>

                {/* Center: Controls */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                }}>
                    {/* Mic toggle */}
                    <button
                        onClick={() => callController.toggleMute()}
                        style={{
                            width: 48, height: 48, borderRadius: "50%",
                            background: callController.isMuted ? "#ea4335" : "#3c4043",
                            border: "none",
                            color: "#e8eaed",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                            transition: "background 0.2s",
                            position: "relative",
                        }}
                        title={callController.isMuted ? "Unmute" : "Mute"}
                    >
                        {callController.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    {/* Camera toggle */}
                    <button
                        onClick={() => callController.toggleCamera()}
                        style={{
                            width: 48, height: 48, borderRadius: "50%",
                            background: !callController.isCameraEnabled ? "#ea4335" : "#3c4043",
                            border: "none",
                            color: "#e8eaed",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                            transition: "background 0.2s",
                            position: "relative",
                        }}
                        title={callController.isCameraEnabled ? "Turn off camera" : "Turn on camera"}
                    >
                        {callController.isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>

                    {/* More options */}
                    <button
                        style={{
                            width: 48, height: 48, borderRadius: "50%",
                            background: "#3c4043",
                            border: "none",
                            color: "#e8eaed",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                            transition: "background 0.2s",
                        }}
                        title="More options"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {/* End call */}
                    <button
                        onClick={() => void callController.endCall()}
                        style={{
                            width: 56, height: 48, borderRadius: 24,
                            background: "#ea4335",
                            border: "none",
                            color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            padding: "0 16px",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#d93025";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#ea4335";
                        }}
                        title="Leave call"
                    >
                        <PhoneOff size={22} />
                    </button>
                </div>

                {/* Right: Toggle chat + info */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    minWidth: 200, justifyContent: "flex-end",
                }}>
                    {isInCall && (
                        <button
                            onClick={() => setShowChat((prev) => !prev)}
                            style={{
                                width: 48, height: 48, borderRadius: "50%",
                                background: showChat ? "#8ab4f8" : "#3c4043",
                                border: "none",
                                color: showChat ? "#202124" : "#e8eaed",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                position: "relative",
                            }}
                            title="Chat"
                        >
                            <MessageSquare size={20} />
                            {messages.length > 0 && !showChat && (
                                <div style={{
                                    position: "absolute", top: -2, right: -2,
                                    width: 18, height: 18, borderRadius: "50%",
                                    background: "#8ab4f8",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 10, fontWeight: 700, color: "#202124",
                                    border: "2px solid #202124",
                                }}>
                                    {messages.length}
                                </div>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Error banner */}
            {callController.error && (
                <div style={{
                    position: "absolute", top: 16, left: "50%",
                    transform: "translateX(-50%)",
                    background: "#fce8e6",
                    border: "1px solid #ea4335",
                    borderRadius: 8,
                    padding: "8px 20px",
                    display: "flex", alignItems: "center", gap: 8,
                    zIndex: 100,
                    maxWidth: 500,
                }}>
                    <span style={{ color: "#ea4335", fontSize: 13, fontWeight: 500 }}>
                        {callController.error}
                    </span>
                    <button
                        onClick={() => {/* Error will auto-clear */}}
                        style={{
                            background: "none", border: "none",
                            color: "#ea4335", cursor: "pointer",
                            display: "flex", padding: 2,
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Keyframes */}
            <style>{`
                @keyframes meetPulse {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.15); opacity: 0; }
                }
            `}</style>
        </div>
    );

    return createPortal(overlay, document.body);
}
