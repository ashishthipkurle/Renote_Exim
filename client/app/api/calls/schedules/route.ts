import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getApiAuthContext } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

const CALL_TYPES = ["AUDIO", "VIDEO"] as const;

const createScheduleSchema = z.object({
  receiverId: z.string().min(1, "receiverId is required"),
  title: z.string().trim().max(120).optional().nullable(),
  agenda: z.string().trim().max(1500).optional().nullable(),
  callType: z.enum(CALL_TYPES).default("VIDEO"),
  scheduledFor: z.string().min(1, "scheduledFor is required"),
  durationMinutes: z.number().int().min(10).max(180).default(30),
  timezone: z.string().trim().max(80).default("UTC"),
});

const scheduleStatusFilterSchema = z.enum([
  "all",
  "upcoming",
  "past",
  "pending",
  "accepted",
  "cancelled",
  "rejected",
  "completed",
  "expired",
]);

function buildStatusFilter(raw: string | null): z.infer<typeof scheduleStatusFilterSchema> {
  const parsed = scheduleStatusFilterSchema.safeParse((raw || "upcoming").toLowerCase());
  return parsed.success ? parsed.data : "upcoming";
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getApiAuthContext(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "20")));
    const statusFilter = buildStatusFilter(searchParams.get("status"));

    const now = new Date();
    const where: Record<string, unknown> = {
      OR: [{ requesterId: auth.userId }, { receiverId: auth.userId }],
    };

    if (statusFilter === "upcoming") {
      where.status = { in: ["PENDING", "ACCEPTED"] };
      where.scheduledFor = { gte: now };
    } else if (statusFilter === "past") {
      where.OR = [
        {
          OR: [{ requesterId: auth.userId }, { receiverId: auth.userId }],
          scheduledFor: { lt: now },
        },
        {
          OR: [{ requesterId: auth.userId }, { receiverId: auth.userId }],
          status: {
            in: [
              "COMPLETED",
              "REJECTED",
              "CANCELLED",
              "EXPIRED",
            ],
          },
        },
      ];
    } else if (statusFilter !== "all") {
      where.status = statusFilter.toUpperCase();
    }

    const [total, schedules] = await Promise.all([
      prisma.callSchedule.count({ where }),
      prisma.callSchedule.findMany({
        where,
        include: {
          requester: { select: { id: true, name: true, companyName: true, avatar: true, role: true } },
          receiver: { select: { id: true, name: true, companyName: true, avatar: true, role: true } },
          sessions: {
            select: {
              id: true,
              status: true,
              callType: true,
              startedAt: true,
              connectedAt: true,
              endedAt: true,
              callerId: true,
              calleeId: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: statusFilter === "past" ? { scheduledFor: "desc" } : { scheduledFor: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      schedules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("Call schedules GET error:", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getApiAuthContext(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = createScheduleSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    if (payload.receiverId === auth.userId) {
      return NextResponse.json({ error: "You cannot schedule a call with yourself" }, { status: 400 });
    }

    const scheduledFor = new Date(payload.scheduledFor);
    if (Number.isNaN(scheduledFor.getTime())) {
      return NextResponse.json({ error: "Invalid scheduledFor date" }, { status: 400 });
    }

    const minLeadMinutes = 5;
    if (scheduledFor.getTime() < Date.now() + minLeadMinutes * 60 * 1000) {
      return NextResponse.json(
        { error: `Call must be scheduled at least ${minLeadMinutes} minutes from now` },
        { status: 400 }
      );
    }

    const receiver = await prisma.user.findUnique({
      where: { id: payload.receiverId },
      select: { id: true, name: true, role: true },
    });

    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    if (auth.role === "IMPORTER" && receiver.role !== "EXPORTER") {
      return NextResponse.json(
        { error: "Importers can only schedule calls with exporters" },
        { status: 400 }
      );
    }

    const schedule = await prisma.callSchedule.create({
      data: {
        requesterId: auth.userId,
        receiverId: payload.receiverId,
        title: payload.title || null,
        agenda: payload.agenda || null,
        callType: payload.callType,
        scheduledFor,
        durationMinutes: payload.durationMinutes,
        timezone: payload.timezone,
      },
      include: {
        requester: { select: { id: true, name: true, companyName: true, avatar: true, role: true } },
        receiver: { select: { id: true, name: true, companyName: true, avatar: true, role: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: payload.receiverId,
        type: "CALL_SCHEDULED",
        title: "New call request",
        message: `${schedule.requester.name || "A contact"} scheduled a ${schedule.callType.toLowerCase()} call with you`,
        link: receiver.role === "EXPORTER" ? "/dashboard/exporter/suppliers?tab=calls" : "/dashboard/importer/calls",
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error("Call schedules POST error:", error);
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}
