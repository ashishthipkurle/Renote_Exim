import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getApiAuthContext } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

const CALL_TYPES = ["AUDIO", "VIDEO"] as const;
const CALL_SESSION_STATUSES = ["RINGING", "ACTIVE", "ENDED", "MISSED", "DECLINED", "FAILED"] as const;

const createSessionSchema = z.object({
  calleeId: z.string().min(1, "calleeId is required"),
  callType: z.enum(CALL_TYPES).default("VIDEO"),
  scheduleId: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await getApiAuthContext(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "20")));
    const status = searchParams.get("status")?.toUpperCase();

    const where: Record<string, unknown> = {
      OR: [{ callerId: auth.userId }, { calleeId: auth.userId }],
    };

    if (status && (CALL_SESSION_STATUSES as readonly string[]).includes(status)) {
      where.status = status;
    }

    const [total, sessions] = await Promise.all([
      prisma.callSession.count({ where }),
      prisma.callSession.findMany({
        where,
        include: {
          caller: { select: { id: true, name: true, companyName: true, avatar: true, role: true } },
          callee: { select: { id: true, name: true, companyName: true, avatar: true, role: true } },
          schedule: {
            select: {
              id: true,
              scheduledFor: true,
              status: true,
              agenda: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("Call sessions GET error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getApiAuthContext(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = createSessionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    if (payload.calleeId === auth.userId) {
      return NextResponse.json({ error: "You cannot call yourself" }, { status: 400 });
    }

    const callee = await prisma.user.findUnique({
      where: { id: payload.calleeId },
      select: { id: true, name: true, role: true },
    });

    if (!callee) {
      return NextResponse.json({ error: "Callee not found" }, { status: 404 });
    }

    let scheduleId: string | null = null;

    if (payload.scheduleId) {
      const schedule = await prisma.callSchedule.findUnique({ where: { id: payload.scheduleId } });
      if (!schedule) {
        return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
      }

      const involved =
        schedule.requesterId === auth.userId ||
        schedule.receiverId === auth.userId;

      if (!involved) {
        return NextResponse.json({ error: "You are not part of this schedule" }, { status: 403 });
      }

      if (["CANCELLED", "REJECTED", "COMPLETED"].includes(schedule.status)) {
        return NextResponse.json(
          { error: "Cannot start a session for an inactive schedule" },
          { status: 400 }
        );
      }

      const expectedPeer = schedule.requesterId === auth.userId ? schedule.receiverId : schedule.requesterId;
      if (expectedPeer !== payload.calleeId) {
        return NextResponse.json(
          { error: "Callee must be the other participant in the schedule" },
          { status: 400 }
        );
      }

      scheduleId = schedule.id;

      if (schedule.status === "PENDING") {
        await prisma.callSchedule.update({
          where: { id: schedule.id },
          data: { status: "ACCEPTED" },
        });
      }
    }

    const session = await prisma.callSession.create({
      data: {
        scheduleId,
        callerId: auth.userId,
        calleeId: payload.calleeId,
        callType: payload.callType,
        status: "RINGING",
      },
      include: {
        caller: { select: { id: true, name: true, companyName: true, avatar: true, role: true } },
        callee: { select: { id: true, name: true, companyName: true, avatar: true, role: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: payload.calleeId,
        type: "CALL_REMINDER",
        title: "Incoming call",
        message: `${session.caller.name || "A contact"} is calling you`,
        link: callee.role === "EXPORTER" ? "/dashboard/exporter/suppliers?tab=calls" : "/dashboard/importer/calls",
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Call sessions POST error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
