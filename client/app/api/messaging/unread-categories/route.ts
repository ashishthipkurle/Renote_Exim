export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiAuthContext } from "@/lib/auth-server";

/**
 * GET /api/messaging/unread-categories
 * Returns unread message counts grouped by UI category.
 */
export async function GET(req: NextRequest) {
  try {
    const { auth, error: authError } = await getApiAuthContext(req);

    if (authError || !auth) {
      return authError || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all unread messages for the user
    const unreadMessages = await prisma.message.findMany({
      where: {
        receiverId: auth.userId,
        isRead: false,
      },
      select: {
        senderId: true,
        sender: {
          select: {
            role: true,
          },
        },
      },
    });

    const counts = {
      buyers: 0,
      dealers: 0,
      sellers: 0,
      exporters: 0, // For Supplier dashboard
    };

    if (auth.role === "EXPORTER") {
      // Dealers are partners specifically registered in the exporter's supplier list
      const suppliers = await prisma.supplier.findMany({
        where: { exporterId: auth.userId },
        select: { importerId: true },
      });
      const dealerIds = new Set(suppliers.map((s) => s.importerId).filter(Boolean) as string[]);

      unreadMessages.forEach((msg) => {
        if (dealerIds.has(msg.senderId)) {
          counts.dealers++;
        } else if (msg.sender.role === "IMPORTER") {
          counts.buyers++;
        }
      });
    } else if (auth.role === "IMPORTER") {
      unreadMessages.forEach((msg) => {
        if (msg.sender.role === "EXPORTER") {
          counts.sellers++;
        }
      });
    } else if (auth.role === "SUPPLIER") {
      unreadMessages.forEach((msg) => {
        if (msg.sender.role === "EXPORTER") {
          counts.exporters++;
        }
      });
    }

    return NextResponse.json(counts);
  } catch (error: any) {
    console.error("Unread Categories API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
