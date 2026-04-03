"use client";

import { CalendarClock, Loader2, MessageSquare, Phone, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { authFetch } from "@/lib/api-utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type CallType = "AUDIO" | "VIDEO";

type ContactTarget = {
  id: string;
  name?: string | null;
  companyName?: string | null;
};

type ScheduleCallModalProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  receiver: ContactTarget | null;
  onScheduled?: () => void;
};

function toDateValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toTimeValue(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default function ScheduleCallModal({
  open,
  onOpenChange,
  receiver,
  onScheduled,
}: ScheduleCallModalProps) {
  const [title, setTitle] = useState("");
  const [agenda, setAgenda] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [callType, setCallType] = useState<CallType>("VIDEO");
  const [loading, setLoading] = useState(false);

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);

  useEffect(() => {
    if (!open) return;

    const next = new Date(Date.now() + 30 * 60 * 1000);
    setDate(toDateValue(next));
    setTime(toTimeValue(next));
    setTitle("");
    setAgenda("");
    setDuration(30);
    setCallType("VIDEO");
  }, [open]);

  const submit = async () => {
    if (!receiver?.id) return;

    if (!date || !time) {
      toast.error("Select date and time");
      return;
    }

    const localDate = new Date(`${date}T${time}:00`);
    if (Number.isNaN(localDate.getTime())) {
      toast.error("Invalid schedule date");
      return;
    }

    setLoading(true);
    try {
      await authFetch("/api/calls/schedules", {
        method: "POST",
        body: JSON.stringify({
          receiverId: receiver.id,
          title: title || null,
          agenda: agenda || null,
          callType,
          scheduledFor: localDate.toISOString(),
          durationMinutes: duration,
          timezone,
        }),
      });

      toast.success("Call scheduled successfully");
      onOpenChange(false);
      onScheduled?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to schedule call";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl border-border bg-background/95 p-0 backdrop-blur-xl">
        <div className="relative overflow-hidden rounded-3xl border border-primary/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.15),_transparent_45%)]" />

          <DialogHeader className="relative border-b border-border/80 px-6 py-5 text-left">
            <DialogTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-foreground">
              <CalendarClock className="h-5 w-5 text-primary" />
              Schedule Call
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Book a realtime {callType.toLowerCase()} call with {receiver?.companyName || receiver?.name || "this partner"}.
            </DialogDescription>
          </DialogHeader>

          <div className="relative space-y-4 px-6 py-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCallType("VIDEO")}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-wider transition-all ${
                  callType === "VIDEO"
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                <Video className="h-4 w-4" />
                Video Call
              </button>
              <button
                type="button"
                onClick={() => setCallType("AUDIO")}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-wider transition-all ${
                  callType === "AUDIO"
                    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                <Phone className="h-4 w-4" />
                Voice Call
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Title</label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Quarterly contract discussion"
                className="h-11 rounded-xl border-border bg-muted/40"
                maxLength={120}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Date</label>
                <Input
                  type="date"
                  value={date}
                  min={toDateValue(new Date())}
                  onChange={(event) => setDate(event.target.value)}
                  className="h-11 rounded-xl border-border bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Time</label>
                <Input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="h-11 rounded-xl border-border bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Duration</label>
                <select
                  value={duration}
                  onChange={(event) => setDuration(Number(event.target.value))}
                  className="h-11 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Agenda</label>
              <div className="relative">
                <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  value={agenda}
                  onChange={(event) => setAgenda(event.target.value)}
                  placeholder="Agenda highlights, expected outcomes, and required documents..."
                  rows={4}
                  className="w-full rounded-2xl border border-border bg-muted/40 py-2 pl-10 pr-3 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/30"
                  maxLength={1500}
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Timezone: {timezone}
              </p>
            </div>
          </div>

          <DialogFooter className="relative flex-row gap-2 border-t border-border/80 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              className="h-11 flex-1 rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-11 flex-1 rounded-xl bg-primary font-black tracking-wide shadow-lg shadow-primary/20"
              onClick={submit}
              disabled={loading || !receiver}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scheduling
                </>
              ) : (
                "Confirm Schedule"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
