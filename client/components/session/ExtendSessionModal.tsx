"use client";

import { useState, useTransition } from "react";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Loader2, Plus } from "lucide-react";
import { extendSession } from "@/app/data/session/session-live-actions";
import { toast } from "sonner";

interface ExtendSessionModalProps {
 isOpen: boolean;
 onClose: () => void;
 sessionId: string;
 onExtended: (newEndTime: string, extensionMinutes: number, totalExtensions: number) => void;
}

const PRESET_OPTIONS = [
 { minutes: 15, label: "+15 min" },
 { minutes: 30, label: "+30 min" },
 { minutes: 45, label: "+45 min" },
 { minutes: 60, label: "+1 hour" },
];

export function ExtendSessionModal({
 isOpen,
 onClose,
 sessionId,
 onExtended,
}: ExtendSessionModalProps) {
 const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
 const [customMinutes, setCustomMinutes] = useState("");
 const [reason, setReason] = useState("");
 const [isPending, startTransition] = useTransition();

 const handleExtend = () => {
 const minutes = selectedMinutes || parseInt(customMinutes, 10);

 if (!minutes || minutes < 1 || minutes > 120) {
 toast.error("Please enter a valid duration (1-120 minutes)");
 return;
 }

 startTransition(async () => {
 const result = await extendSession({
 sessionId,
 minutes,
 reason: reason || undefined,
 });

 if (result.success && result.data) {
 toast.success(`Session extended by ${minutes} minutes`);
 onExtended(result.data.newEndTime, result.data.extensionMinutes, result.data.totalExtensions);
 onClose();
 // Reset form
 setSelectedMinutes(null);
 setCustomMinutes("");
 setReason("");
 } else {
 toast.error(result.error || "Failed to extend session");
 }
 });
 };

 return (
 <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
 <DialogContent className="sm:max-w-md">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2">
 <Clock className="size-5 text-green-500" />
 Extend Session
 </DialogTitle>
 <DialogDescription>
 Add more time to the current session. The timer will update for both participants.
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-4 py-4">
 {/* Preset options */}
 <div className="space-y-2">
 <Label>Quick Select</Label>
 <div className="grid grid-cols-4 gap-2">
 {PRESET_OPTIONS.map((option) => (
 <Button
 key={option.minutes}
 variant={selectedMinutes === option.minutes ? "default" : "outline"}
 size="sm"
 onClick={() => {
 setSelectedMinutes(option.minutes);
 setCustomMinutes("");
 }}
 className="text-sm"
 >
 {option.label}
 </Button>
 ))}
 </div>
 </div>

 {/* Custom input */}
 <div className="space-y-2">
 <Label htmlFor="custom-minutes">Or enter custom minutes</Label>
 <div className="flex gap-2">
 <Input
 id="custom-minutes"
 type="number"
 min="1"
 max="120"
 placeholder="Enter minutes..."
 value={customMinutes}
 onChange={(e) => {
 setCustomMinutes(e.target.value);
 setSelectedMinutes(null);
 }}
 />
 <span className="flex items-center text-sm text-muted-foreground">
 minutes
 </span>
 </div>
 </div>

 {/* Optional reason */}
 <div className="space-y-2">
 <Label htmlFor="reason">Reason (optional)</Label>
 <Input
 id="reason"
 placeholder="e.g., Additional topic discussion"
 value={reason}
 onChange={(e) => setReason(e.target.value)}
 />
 </div>
 </div>

 <DialogFooter>
 <Button variant="outline" onClick={onClose} disabled={isPending}>
 Cancel
 </Button>
 <Button
 onClick={handleExtend}
 disabled={isPending || (!selectedMinutes && !customMinutes)}
 className="bg-green-500 hover:bg-green-600"
 >
 {isPending ? (
 <Loader2 className="size-4 animate-spin mr-2" />
 ) : (
 <Plus className="size-4 mr-2" />
 )}
 Extend Session
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 );
}
