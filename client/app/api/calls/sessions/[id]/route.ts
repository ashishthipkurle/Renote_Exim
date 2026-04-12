import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getApiAuthContext } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

const updateSessionSchema = z.object({
 action: z.enum(["connect", "end", "missed", "declined", "failed"]),
 endedReason: z.string().trim().max(500).optional().nullable(),
});

export async function PATCH(
 request: NextRequest,
 { params }: { params: { id: string } }
) {
 try {
 const { auth, error: authError } = await getApiAuthContext(request);
 if (authError || !auth) {
 return authError || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const parsed = updateSessionSchema.safeParse(await request.json());
 if (!parsed.success) {
 return NextResponse.json(
 { error: "Validation failed", details: parsed.error.flatten() },
 { status: 400 }
 );
 }

 const existing = await prisma.callSession.findUnique({
 where: { id: params.id },
 include: {
 caller: { select: { id: true, name: true, role: true } },
 callee: { select: { id: true, name: true, role: true } },
 },
 });

 if (!existing) {
 return NextResponse.json({ error: "Session not found" }, { status: 404 });
 }

 const allowed =
 auth.role === "ADMIN" ||
 existing.callerId === auth.userId ||
 existing.calleeId === auth.userId;

 if (!allowed) {
 return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 }

 const now = new Date();
 const { action, endedReason } = parsed.data;

 let status = existing.status;
 let connectedAt = existing.connectedAt;
 let endedAt = existing.endedAt;
 let durationSec = existing.durationSec;

 if (action === "connect") {
 status = "ACTIVE";
 connectedAt = now;
 }

 if (["end", "missed", "declined", "failed"].includes(action)) {
 endedAt = now;
 if (action === "end") status = "ENDED";
 if (action === "missed") status = "MISSED";
 if (action === "declined") status = "DECLINED";
 if (action === "failed") status = "FAILED";

 const start = existing.connectedAt || existing.startedAt;
 durationSec = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 1000));
 }

 const session = await prisma.callSession.update({
 where: { id: params.id },
 data: {
 status,
 connectedAt,
 endedAt,
 durationSec,
 endedReason: endedReason ?? existing.endedReason,
 },
 include: {
 caller: { select: { id: true, name: true, businessName: true, avatar: true, role: true } },
 callee: { select: { id: true, name: true, businessName: true, avatar: true, role: true } },
 schedule: {
 select: {
 id: true,
 status: true,
 scheduledFor: true,
 callType: true,
 title: true,
 },
 },
 },
 });

 if (session.scheduleId && action === "end") {
 await prisma.callSchedule.update({
 where: { id: session.scheduleId },
 data: { status: "COMPLETED" },
 });
 }

 if (["missed", "declined"].includes(action)) {
 const notifyUserId = existing.callerId === auth.userId ? existing.calleeId : existing.callerId;
 await prisma.notification.create({
 data: {
 userId: notifyUserId,
 type: "MISSED_CALL",
 title: action === "declined" ? "Call declined" : "Missed call",
 message:
 action === "declined"
 ? `${auth.userId === existing.calleeId ? existing.callee.name : existing.caller.name} declined the call.`
 : `You have a missed call from ${auth.userId === existing.calleeId ? existing.callee.name : existing.caller.name}.`,
 link:
 auth.userId === existing.calleeId
 ? "/dashboard/exporter/suppliers?tab=calls"
 : "/dashboard/importer/calls",
 },
 });
 }

 return NextResponse.json({ session });
 } catch (error) {
 console.error("Call session PATCH error:", error);
 return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
 }
}
