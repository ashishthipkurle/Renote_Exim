import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

/**
 * GET /api/messaging
 * Fetches the user's conversation list (Inbox) or messages for a specific conversation.
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase } = createSupabaseRouteClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("otherUserId");
    const orderId = searchParams.get("orderId");
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "50")));
    const before = searchParams.get("before");

    // If otherUserId is provided, fetch messages for that specific conversation
    if (otherUserId) {
      const beforeDate = before ? new Date(before) : null;

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: user.id, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: user.id },
          ],
          ...(orderId ? { orderId } : {}),
          ...(beforeDate && !Number.isNaN(beforeDate.getTime()) ? { createdAt: { lt: beforeDate } } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      // Frontend expects chronological order.
      return NextResponse.json(messages.reverse());
    }

    // Otherwise, fetch inbox list with a single aggregate query.
    const rows = await prisma.$queryRaw<
      Array<{
        otherUserId: string;
        messageId: string;
        content: string;
        createdAt: Date;
        senderId: string;
        unreadCount: bigint | number;
      }>
    >`
      WITH conversation_messages AS (
        SELECT
          CASE
            WHEN m."senderId" = ${user.id} THEN m."receiverId"
            ELSE m."senderId"
          END AS "otherUserId",
          m.id,
          m.body,
          m."createdAt",
          m."senderId"
        FROM messages m
        WHERE m."senderId" = ${user.id} OR m."receiverId" = ${user.id}
      ),
      latest_messages AS (
        SELECT DISTINCT ON ("otherUserId")
          "otherUserId",
          id,
          body,
          "createdAt",
          "senderId"
        FROM conversation_messages
        ORDER BY "otherUserId", "createdAt" DESC
      ),
      unread_counts AS (
        SELECT
          m."senderId" AS "otherUserId",
          COUNT(*)::int AS "unreadCount"
        FROM messages m
        WHERE m."receiverId" = ${user.id} AND m."isRead" = false
        GROUP BY m."senderId"
      )
      SELECT
        l."otherUserId",
        l.id AS "messageId",
        l.body,
        l."createdAt",
        l."senderId",
        COALESCE(u."unreadCount", 0) AS "unreadCount"
      FROM latest_messages l
      LEFT JOIN unread_counts u
        ON u."otherUserId" = l."otherUserId"
      ORDER BY l."createdAt" DESC
      LIMIT ${limit}
    `;

    const userIds = rows.map((row) => row.otherUserId);
    if (!userIds.length) {
      return NextResponse.json([]);
    }

    const otherUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatar: true, role: true },
    });

    const userMap = new Map(otherUsers.map((entry) => [entry.id, entry]));

    const conversations = rows
      .map((row) => {
        const otherUser = userMap.get(row.otherUserId);
        if (!otherUser) return null;

        return {
          otherUser,
          lastMessage: {
            id: row.messageId,
            body: row.body,
            createdAt: row.createdAt,
            senderId: row.senderId,
          },
          unreadCount: Number(row.unreadCount),
        };
      })
      .filter(Boolean);

    return NextResponse.json(conversations);

  } catch (error: any) {
    console.error("Messaging API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/messaging
 * Sends a new message.
 */
export async function POST(req: NextRequest) {
  try {
    const { supabase } = createSupabaseRouteClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, content, orderId, subject } = await req.json();
    const messageText = typeof content === "string" ? content.trim() : "";

    if (!receiverId || !messageText) {
      return NextResponse.json({ error: "Receiver and content are required" }, { status: 400 });
    }

    if (messageText.length > 4000) {
      return NextResponse.json({ error: "Message is too long" }, { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        body: messageText,
        orderId,
        subject,
      },
    });

    const receiverUser = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { role: true },
    });

    const notificationLink =
      receiverUser?.role === "IMPORTER"
        ? "/dashboard/importer/messages"
        : receiverUser?.role === "ADMIN"
          ? "/dashboard/admin/notifications"
          : "/dashboard/exporter/messages";

    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "MESSAGE_RECEIVED",
        title: "New message",
        message: "You have received a new trade message.",
        link: notificationLink,
      },
    }).catch(() => {
      // Notification should not block message delivery.
    });

    return NextResponse.json(newMessage);

  } catch (error: any) {
    console.error("Messaging POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
