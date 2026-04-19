export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
 req: NextRequest,
 { params }: { params: { id: string } }
) {
 try {
 const user = await prisma.user.findUnique({
 where: { id: params.id },
 select: {
 id: true,
 name: true,
 avatar: true,
 role: true,
 businessName: true,
 country: true,
 },
 });

 if (!user) {
 return NextResponse.json({ error: "User not found" }, { status: 404 });
 }

 return NextResponse.json({ user });
 } catch (error: any) {
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}
