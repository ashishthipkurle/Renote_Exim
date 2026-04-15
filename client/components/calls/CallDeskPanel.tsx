"use client";

import { CalendarClock, Check, Loader2, Phone, RefreshCw, Video, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import { authFetch } from "@/lib/api-utils";
import type { RealtimeCallController } from "@/hooks/useRealtimeCall";
import { Button } from "@/components/ui/button";
import LiveCallDock from "@/components/calls/LiveCallDock";

type CallParticipant = {
 id: string;
 name: string | null;
 businessName: string | null;
 avatar: string | null;
 role: string;
};

type CallSchedule = {
 id: string;
 title: string | null;
 agenda: string | null;
 callType: "AUDIO" | "VIDEO";
 scheduledFor: string;
 durationMinutes: number;
 timezone: string;
 status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED" | "EXPIRED";
 requesterId: string;
 receiverId: string;
 requester: CallParticipant;
 receiver: CallParticipant;
};

type CallDeskPanelProps = {
 controller: RealtimeCallController;
 title?: string;
};

function formatDateTime(dateLike: string) {
 const date = new Date(dateLike);
 return new Intl.DateTimeFormat("en-US", {
 month: "short",
 day: "numeric",
 hour: "2-digit",
 minute: "2-digit",
 }).format(date);
}

function relativeTime(dateLike: string) {
 const date = new Date(dateLike).getTime();
 const diffMin = Math.round((date - Date.now()) / 60000);

 if (Math.abs(diffMin) < 1) return "now";
 if (diffMin > 0 && diffMin < 60) return `in ${diffMin}m`;
 if (diffMin > 0 && diffMin < 1440) return `in ${Math.round(diffMin / 60)}h`;
 if (diffMin > 0) return `in ${Math.round(diffMin / 1440)}d`;

 const absMin = Math.abs(diffMin);
 if (absMin < 60) return `${absMin}m ago`;
 if (absMin < 1440) return `${Math.round(absMin / 60)}h ago`;
 return `${Math.round(absMin / 1440)}d ago`;
}

export default function CallDeskPanel({ controller, title = "Call Desk" }: CallDeskPanelProps) {
 const { user } = useAuth();

 const [upcoming, setUpcoming] = useState<CallSchedule[]>([]);
 const [past, setPast] = useState<CallSchedule[]>([]);
 const [loading, setLoading] = useState(true);
 const [busyScheduleId, setBusyScheduleId] = useState<string | null>(null);

 const fetchSchedules = useCallback(async () => {
 setLoading(true);
 try {
 const [upcomingRes, pastRes] = await Promise.all([
 authFetch<{ schedules: CallSchedule[] }>("/api/calls/schedules?status=upcoming&limit=12"),
 authFetch<{ schedules: CallSchedule[] }>("/api/calls/schedules?status=past&limit=8"),
 ]);
 setUpcoming(upcomingRes.schedules || []);
 setPast(pastRes.schedules || []);
 } catch (error) {
 const message = error instanceof Error ? error.message : "Failed to load call schedules";
 toast.error(message);
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 void fetchSchedules();
 }, [fetchSchedules]);

 const runScheduleAction = useCallback(
 async (scheduleId: string, action: "accept" | "reject" | "cancel" | "complete") => {
 setBusyScheduleId(scheduleId);
 try {
 await authFetch(`/api/calls/schedules/${scheduleId}`, {
 method: "PATCH",
 body: JSON.stringify({ action }),
 });

 toast.success(`Schedule ${action}ed`);
 await fetchSchedules();
 } catch (error) {
 const message = error instanceof Error ? error.message : "Action failed";
 toast.error(message);
 } finally {
 setBusyScheduleId(null);
 }
 },
 [fetchSchedules]
 );

 const startFromSchedule = useCallback(
 async (schedule: CallSchedule) => {
 if (!user?.id) return;

 const peer = schedule.requesterId === user.id ? schedule.receiver : schedule.requester;
 await controller.startCall({
 target: { id: peer.id, name: peer.businessName || peer.name },
 callType: schedule.callType,
 scheduleId: schedule.id,
 });
 },
 [controller, user?.id]
 );

 const upcomingSorted = useMemo(
 () => [...upcoming].sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()),
 [upcoming]
 );

 return (
 <div className="space-y-6">
 <LiveCallDock controller={controller} />

 <div className="rounded-lg border border-border bg-card p-5 shadow-xl">
 <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
 <div>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Realtime Scheduling</p>
 <h3 className="mt-1 text-xl font-black tracking-tight text-foreground">{title}</h3>
 </div>
 <Button
 type="button"
 variant="outline"
 className="h-10 rounded-xl border-border bg-muted/40"
 onClick={() => void fetchSchedules()}
 disabled={loading}
 >
 {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
 Refresh
 </Button>
 </div>

 <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
 <div className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-4">
 <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
 <CalendarClock className="h-4 w-4" />
 Upcoming
 </div>

 {loading ? (
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Loader2 className="h-4 w-4 animate-spin" />
 Loading schedules
 </div>
 ) : upcomingSorted.length === 0 ? (
 <p className="rounded-xl border border-border bg-background/80 px-3 py-4 text-sm text-muted-foreground">
 No upcoming calls scheduled.
 </p>
 ) : (
 <div className="space-y-3">
 {upcomingSorted.map((schedule) => {
 const isReceiver = schedule.receiverId === user?.id;
 const peer = isReceiver ? schedule.requester : schedule.receiver;
 const canStart =
 schedule.status === "ACCEPTED" &&
 Date.now() >= new Date(schedule.scheduledFor).getTime() - 10 * 60 * 1000;

 return (
 <div key={schedule.id} className="rounded-xl border border-border bg-background/90 p-3">
 <div className="mb-2 flex items-start justify-between gap-2">
 <div>
 <p className="text-sm font-black text-foreground">{schedule.title || "Trade sync call"}</p>
 <p className="text-xs text-muted-foreground">
 with {peer.businessName || peer.name || "Trade Partner"}
 </p>
 </div>
 <span className="rounded-full border border-border px-2 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
 {schedule.status}
 </span>
 </div>

 <p className="text-xs text-muted-foreground">
 {formatDateTime(schedule.scheduledFor)} · {relativeTime(schedule.scheduledFor)} · {schedule.durationMinutes}m
 </p>

 {schedule.agenda ? (
 <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{schedule.agenda}</p>
 ) : null}

 <div className="mt-3 flex flex-wrap gap-2">
 {isReceiver && schedule.status === "PENDING" ? (
 <>
 <Button
 type="button"
 size="sm"
 className="h-8 rounded-lg bg-emerald-600 text-xs font-black hover:bg-emerald-500"
 onClick={() => void runScheduleAction(schedule.id, "accept")}
 disabled={busyScheduleId === schedule.id}
 >
 <Check className="h-3.5 w-3.5" />
 Accept
 </Button>
 <Button
 type="button"
 size="sm"
 variant="outline"
 className="h-8 rounded-lg border-red-400/40 bg-red-500/10 text-xs font-black text-red-400 hover:bg-red-500/20"
 onClick={() => void runScheduleAction(schedule.id, "reject")}
 disabled={busyScheduleId === schedule.id}
 >
 <X className="h-3.5 w-3.5" />
 Reject
 </Button>
 </>
 ) : null}

 {canStart ? (
 <Button
 type="button"
 size="sm"
 className="h-8 rounded-lg bg-primary text-xs font-black"
 onClick={() => void startFromSchedule(schedule)}
 >
 {schedule.callType === "VIDEO" ? <Video className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
 Start
 </Button>
 ) : null}

 {["PENDING", "ACCEPTED"].includes(schedule.status) ? (
 <Button
 type="button"
 size="sm"
 variant="outline"
 className="h-8 rounded-lg border-border text-xs font-black"
 onClick={() => void runScheduleAction(schedule.id, "cancel")}
 disabled={busyScheduleId === schedule.id}
 >
 Cancel
 </Button>
 ) : null}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 <div className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-4">
 <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Recent Activity</p>
 {loading ? (
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Loader2 className="h-4 w-4 animate-spin" />
 Loading history
 </div>
 ) : past.length === 0 ? (
 <p className="rounded-xl border border-border bg-background/80 px-3 py-4 text-sm text-muted-foreground">
 No call history yet.
 </p>
 ) : (
 <div className="space-y-2">
 {past.map((schedule) => {
 const peer = schedule.requesterId === user?.id ? schedule.receiver : schedule.requester;
 return (
 <div key={schedule.id} className="rounded-xl border border-border bg-background/90 px-3 py-2">
 <p className="text-sm font-semibold text-foreground">{peer.businessName || peer.name || "Trade Partner"}</p>
 <p className="text-xs text-muted-foreground">
 {schedule.callType.toLowerCase()} · {schedule.status.toLowerCase()} · {formatDateTime(schedule.scheduledFor)}
 </p>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
