import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiAuthContext } from "@/lib/auth-server";

/**
 * PATCH /api/messaging/read
 * Marks messages as read for a specific conversation.
 */
export async function PATCH(req: NextRequest) {
 try {
 const { auth, error: authError } = await getApiAuthContext(req);

 if (authError || !auth) {
 return authError || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const { senderId } = await req.json();

 if (!senderId) {
 return NextResponse.json({ error: "senderId is required" }, { status: 400 });
 }

 await prisma.message.updateMany({
 where: {
 senderId,
 receiverId: auth.userId,
 isRead: false,
 },
 data: {
 isRead: true,
 },
 });

 return NextResponse.json({ success: true });

 } catch (error: any) {
 console.error("Messaging Read PATCH Error:", error);
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}
