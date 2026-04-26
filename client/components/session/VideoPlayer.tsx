"use client";

import { useEffect, useRef } from "react";

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

    const hasVideo = stream && stream.getVideoTracks().some((t) => t.enabled) && !isVideoOff;

    return (
        <div className={`relative overflow-hidden ${className}`} style={{ background: "#3c4043" }}>
            {/* Video element — always mounted so stream doesn't disconnect */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: hasVideo ? "block" : "none",
                }}
            />

            {/* Avatar fallback when no video */}
            {!hasVideo && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isLocal ? "#3c4043" : "linear-gradient(135deg, #4a6cf7 0%, #3b5998 50%, #4a6cf7 100%)",
                    }}
                >
                    <div
                        style={{
                            width: isLocal ? 48 : 96,
                            height: isLocal ? 48 : 96,
                            borderRadius: "50%",
                            background: isLocal ? "#5f6368" : "#6e88d6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: isLocal ? 20 : 40,
                            fontWeight: 500,
                            color: "#e8eaed",
                        }}
                    >
                        {initials}
                    </div>
                </div>
            )}
        </div>
    );
}
