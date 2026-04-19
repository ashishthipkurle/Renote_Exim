export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
 try {
 const notifications = await prisma.notification.findMany({
 take: 50,
 orderBy: { createdAt: 'desc' },
 include: { user: { select: { name: true, email: true } } }
 });
 return NextResponse.json({ notifications });
 } catch (error) {
 console.error("Admin notifications error:", error);
 return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
 }
}

export async function POST(req: NextRequest) {
 try {
 const { title, message, targetRole, type } = await req.json();

 if (!title || !message) {
 return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
 }

 const users = await prisma.user.findMany({
 where: targetRole ? { role: targetRole } : {},
 select: { id: true }
 });

 await prisma.notification.createMany({
 data: users.map(u => ({
 userId: u.id,
 title,
 message,
 type: type || 'GENERAL',
 }))
 });

 return NextResponse.json({ message: "Broadcast sent successfully", count: users.length });
 } catch (error) {
 console.error("Admin notification broadcast error:", error);
 return NextResponse.json({ error: "Failed to broadcast notification" }, { status: 500 });
 }
}

