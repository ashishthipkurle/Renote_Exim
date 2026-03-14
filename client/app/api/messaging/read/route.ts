import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

/**
 * PATCH /api/messaging/read
 * Marks messages as read for a specific conversation.
 */
export async function PATCH(req: NextRequest) {
  try {
    const { supabase } = createSupabaseRouteClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { senderId } = await req.json();

    if (!senderId) {
      return NextResponse.json({ error: "senderId is required" }, { status: 400 });
    }

    await prisma.message.updateMany({
      where: {
        senderId,
        receiverId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Messaging Read PATCH Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
