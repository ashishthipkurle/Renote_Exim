"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { NotificationType } from "@prisma/client";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface CreateNotificationInput {
  userId: string;
  ownerId?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  linkedEntityId?: string;
}

export interface FetchNotificationsOptions {
  limit?: number;
  page?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}

// ────────────────────────────────────────────────────────────────────────────
// createNotification
// Programmatically trigger a single alert from anywhere in the app.
// ────────────────────────────────────────────────────────────────────────────

export async function createNotification(input: CreateNotificationInput) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        ownerId: input.ownerId || null,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link || null,
        linkedEntityId: input.linkedEntityId || null,
      },
    });

    return { success: true, notification };
  } catch (error) {
    console.error("[NotificationActions] createNotification failed:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// createBulkNotifications
// High-performance function to send the same alert to many recipients.
// Uses Prisma's createMany for a single DB round-trip.
// ────────────────────────────────────────────────────────────────────────────

export async function createBulkNotifications(
  input: Omit<CreateNotificationInput, "userId">,
  recipientIds: string[],
  recipientField: "userId" | "ownerId" = "userId"
) {
  if (!recipientIds.length) {
    return { success: true, count: 0 };
  }

  try {
    const result = await prisma.notification.createMany({
      data: recipientIds.map((id) => ({
        ...(recipientField === "userId"
          ? { userId: id, ownerId: input.ownerId || null }
          : { userId: id, ownerId: id }),
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link || null,
        linkedEntityId: input.linkedEntityId || null,
      })),
      skipDuplicates: true,
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error("[NotificationActions] createBulkNotifications failed:", error);
    return { success: false, error: "Failed to create bulk notifications" };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// fetchNotifications
// Retrieve alerts for a user (as userId OR ownerId), with pagination.
// ────────────────────────────────────────────────────────────────────────────

export async function fetchNotifications(
  userId: string,
  options: FetchNotificationsOptions = {}
) {
  const { limit = 20, page = 1, unreadOnly = false, type } = options;

  try {
    const where: any = {
      OR: [{ userId }, { ownerId: userId }],
    };

    if (unreadOnly) {
      where.read = false;
    }

    if (type) {
      where.type = type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          OR: [{ userId }, { ownerId: userId }],
          read: false,
        },
      }),
    ]);

    return {
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[NotificationActions] fetchNotifications failed:", error);
    return {
      success: false,
      notifications: [],
      unreadCount: 0,
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// getUnreadCount
// Lightweight function — returns only the count of unread items.
// ────────────────────────────────────────────────────────────────────────────

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: {
        OR: [{ userId }, { ownerId: userId }],
        read: false,
      },
    });
  } catch (error) {
    console.error("[NotificationActions] getUnreadCount failed:", error);
    return 0;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// markAsRead
// Mark a single notification as read. Validates ownership.
// Uses revalidatePath to ensure the UI updates instantly.
// ────────────────────────────────────────────────────────────────────────────

export async function markAsRead(notificationId: string, userId: string) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        OR: [{ userId }, { ownerId: userId }],
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/dashboard", "layout");

    return { success: true, updated: result.count };
  } catch (error) {
    console.error("[NotificationActions] markAsRead failed:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// markAllAsRead
// Mark all unread notifications as read for a user.
// Uses revalidatePath to ensure the UI updates instantly.
// ────────────────────────────────────────────────────────────────────────────

export async function markAllAsRead(userId: string) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        OR: [{ userId }, { ownerId: userId }],
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/dashboard", "layout");

    return { success: true, updated: result.count };
  } catch (error) {
    console.error("[NotificationActions] markAllAsRead failed:", error);
    return { success: false, error: "Failed to mark all as read" };
  }
}
