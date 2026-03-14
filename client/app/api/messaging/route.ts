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

    // If otherUserId is provided, fetch messages for that specific conversation
    if (otherUserId) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: user.id, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: user.id },
          ],
          ...(orderId ? { orderId } : {}),
        },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json(messages);
    }

    // Otherwise, fetch the inbox (list of conversations)
    // This is a complex query: find distinct users the current user has chatted with
    const sentMessages = await prisma.message.findMany({
      where: { senderId: user.id },
      distinct: ["receiverId"],
      select: { receiverId: true },
    });

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: user.id },
      distinct: ["senderId"],
      select: { senderId: true },
    });

    const contactIds = Array.from(new Set([
      ...sentMessages.map(m => m.receiverId),
      ...receivedMessages.map(m => m.senderId)
    ]));

    const conversations = await Promise.all(contactIds.map(async (contactId) => {
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: user.id, receiverId: contactId },
            { senderId: contactId, receiverId: user.id },
          ],
        },
        orderBy: { createdAt: "desc" },
        include: {
          sender: { select: { name: true, avatar: true } },
          receiver: { select: { name: true, avatar: true } },
        },
      });

      const unreadCount = await prisma.message.count({
        where: {
          senderId: contactId,
          receiverId: user.id,
          read: false,
        }
      });

      const otherUser = await prisma.user.findUnique({
        where: { id: contactId },
        select: { id: true, name: true, avatar: true, role: true }
      });

      return {
        otherUser,
        lastMessage,
        unreadCount,
      };
    }));

    // Sort by last message date
    conversations.sort((a, b) => {
      const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return dateB - dateA;
    });

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

    if (!receiverId || !content) {
      return NextResponse.json({ error: "Receiver and content are required" }, { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content,
        orderId,
        subject,
      },
    });

    return NextResponse.json(newMessage);

  } catch (error: any) {
    console.error("Messaging POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
