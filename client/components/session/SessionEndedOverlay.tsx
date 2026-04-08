"use client";

import { CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

interface SessionEndedOverlayProps {
    reason: "admin_ended" | "time_expired" | "error";
    endTime?: string;
    sessionDuration?: number; // in minutes
    extensionsCount?: number;
    courseTitle?: string;
    returnUrl?: string;
}

export function SessionEndedOverlay({
    reason,
    endTime,
    sessionDuration,
    extensionsCount,
    courseTitle,
    returnUrl = "/dashboard/session-booking",
}: SessionEndedOverlayProps) {
    const reasonConfig = {
        admin_ended: {
            icon: <CheckCircle className="size-16 text-green-500" />,
            title: "Session Completed",
            description: "The instructor has ended this session.",
        },
        time_expired: {
            icon: <Clock className="size-16 text-yellow-500" />,
            title: "Session Time Expired",
            description: "The session has ended automatically.",
        },
        error: {
            icon: <Clock className="size-16 text-red-500" />,
            title: "Session Ended",
            description: "The session was interrupted due to an error.",
        },
    };

    const config = reasonConfig[reason];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[var(--color-card)] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-[var(--color-border)]">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-[var(--color-card-dark)] rounded-full">
                        {config.icon}
                    </div>
                </div>

                {/* Title & Description */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
                        {config.title}
                    </h2>
                    <p className="text-[var(--color-muted-foreground)]">
                        {config.description}
                    </p>
                </div>

                {/* Session Summary */}
                <div className="bg-[var(--color-muted)]/30 rounded-lg p-4 mb-6 space-y-2">
                    {courseTitle && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Course</span>
                            <span className="font-medium text-[var(--color-foreground)]">
                                {courseTitle}
                            </span>
                        </div>
                    )}
                    {endTime && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Ended At</span>
                            <span className="font-medium text-[var(--color-foreground)]">
                                {format(new Date(endTime), "HH:mm, dd MMM yyyy")}
                            </span>
                        </div>
                    )}
                    {sessionDuration && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="font-medium text-[var(--color-foreground)]">
                                {sessionDuration} minutes
                            </span>
                        </div>
                    )}
                    {extensionsCount !== undefined && extensionsCount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Extensions</span>
                            <span className="font-medium text-green-600">
                                +{extensionsCount} time{extensionsCount > 1 ? "s" : ""}
                            </span>
                        </div>
                    )}
                </div>

                {/* Return Button */}
                <Link href={returnUrl}>
                    <Button className="w-full" size="lg">
                        <ArrowLeft className="size-4 mr-2" />
                        Return to Sessions
                    </Button>
                </Link>
            </div>
        </div>
    );
}
