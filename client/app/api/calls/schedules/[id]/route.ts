import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getApiAuthContext } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

const updateScheduleSchema = z.object({
 action: z.enum(["accept", "reject", "cancel", "complete", "reschedule"]),
 scheduledFor: z.string().optional(),
 durationMinutes: z.number().int().min(10).max(180).optional(),
 title: z.string().trim().max(120).optional().nullable(),
 agenda: z.string().trim().max(1500).optional().nullable(),
 timezone: z.string().trim().max(80).optional(),
});

export async function GET(
 request: NextRequest,
 { params }: { params: { id: string } }
) {
 try {
 const auth = await getApiAuthContext(request);
 if (!auth) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const schedule = await prisma.callSchedule.findUnique({
 where: { id: params.id },
 include: {
 requester: { select: { id: true, name: true, companyName: true, avatar: true, role: true } },
 receiver: { select: { id: true, name: true, companyName: true, avatar: true, role: true } },
 sessions: {
 orderBy: { createdAt: "desc" },
 take: 10,
 include: {
 caller: { select: { id: true, name: true, avatar: true } },
 callee: { select: { id: true, name: true, avatar: true } },
 },
 },
 },
 });

 if (!schedule) {
 return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
 }

 const allowed =
 auth.role === "ADMIN" ||
 schedule.requesterId === auth.userId ||
 schedule.receiverId === auth.userId;

 if (!allowed) {
 return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 }

 return NextResponse.json({ schedule });
 } catch (error) {
 console.error("Call schedule GET by id error:", error);
 return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
 }
}

export async function PATCH(
 request: NextRequest,
 { params }: { params: { id: string } }
) {
 try {
 const auth = await getApiAuthContext(request);
 if (!auth) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const parsed = updateScheduleSchema.safeParse(await request.json());
 if (!parsed.success) {
 return NextResponse.json(
 { error: "Validation failed", details: parsed.error.flatten() },
 { status: 400 }
 );
 }

 const existing = await prisma.callSchedule.findUnique({ where: { id: params.id } });
 if (!existing) {
 return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
 }

 const allowed =
 auth.role === "ADMIN" ||
 existing.requesterId === auth.userId ||
 existing.receiverId === auth.userId;

 if (!allowed) {
 return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 }

 const { action, ...rest } = parsed.data;
 const now = new Date();
 let updateData: Record<string, unknown> = {};
 let notifyUserId: string | null = null;
 let notifyTitle = "";
 let notifyMessage = "";
 let notifyType: "CALL_ACCEPTED" | "CALL_REJECTED" | "CALL_SCHEDULED" | "GENERAL" = "GENERAL";

 if (action === "accept") {
 if (auth.role !== "ADMIN" && existing.receiverId !== auth.userId) {
 return NextResponse.json(
 { error: "Only the receiving participant can accept this call" },
 { status: 403 }
 );
 }
 updateData.status = "ACCEPTED";
 notifyUserId = existing.requesterId;
 notifyTitle = "Call request accepted";
 notifyMessage = "Your scheduled call request has been accepted.";
 notifyType = "CALL_ACCEPTED";
 }

 if (action === "reject") {
 if (auth.role !== "ADMIN" && existing.receiverId !== auth.userId) {
 return NextResponse.json(
 { error: "Only the receiving participant can reject this call" },
 { status: 403 }
 );
 }
 updateData.status = "REJECTED";
 notifyUserId = existing.requesterId;
 notifyTitle = "Call request rejected";
 notifyMessage = "Your scheduled call request was rejected.";
 notifyType = "CALL_REJECTED";
 }

 if (action === "cancel") {
 updateData.status = "CANCELLED";
 notifyUserId = existing.requesterId === auth.userId ? existing.receiverId : existing.requesterId;
 notifyTitle = "Scheduled call cancelled";
 notifyMessage = "A scheduled call was cancelled.";
 notifyType = "GENERAL";
 }

 if (action === "complete") {
 updateData.status = "COMPLETED";
 }

 if (action === "reschedule") {
 if (!rest.scheduledFor) {
 return NextResponse.json({ error: "scheduledFor is required for reschedule" }, { status: 400 });
 }

 const nextDate = new Date(rest.scheduledFor);
 if (Number.isNaN(nextDate.getTime())) {
 return NextResponse.json({ error: "Invalid scheduledFor date" }, { status: 400 });
 }

 if (nextDate.getTime() <= now.getTime() + 5 * 60 * 1000) {
 return NextResponse.json(
 { error: "Rescheduled time must be at least 5 minutes from now" },
 { status: 400 }
 );
 }

 updateData = {
 status: "PENDING",
 scheduledFor: nextDate,
 durationMinutes: rest.durationMinutes ?? existing.durationMinutes,
 title: rest.title ?? existing.title,
 agenda: rest.agenda ?? existing.agenda,
 timezone: rest.timezone ?? existing.timezone,
 };

 notifyUserId = existing.requesterId === auth.userId ? existing.receiverId : existing.requesterId;
 notifyTitle = "Call rescheduled";
 notifyMessage = "A call was rescheduled and awaits confirmation.";
 notifyType = "CALL_SCHEDULED";
 }

 const schedule = await prisma.callSchedule.update({
 where: { id: params.id },
 data: updateData,
 include: {
 requester: { select: { id: true, name: true, companyName: true, avatar: true, role: true } },
 receiver: { select: { id: true, name: true, companyName: true, avatar: true, role: true } },
 },
 });

 if (notifyUserId) {
 await prisma.notification.create({
 data: {
 userId: notifyUserId,
 type: notifyType,
 title: notifyTitle,
 message: notifyMessage,
 link: "/dashboard/exporter/suppliers?tab=calls",
 },
 });
 }

 return NextResponse.json({ schedule });
 } catch (error) {
 console.error("Call schedule PATCH error:", error);
 return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
 }
}
