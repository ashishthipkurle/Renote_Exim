export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
 try {
 const searchParams = req.nextUrl.searchParams;
 const search = searchParams.get("q") || "";

 const users = await prisma.user.findMany({
 where: {
 OR: [
 { name: { contains: search, mode: "insensitive" } },
 { businessName: { contains: search, mode: "insensitive" } },
 { email: { contains: search, mode: "insensitive" } },
 ]
 },
 orderBy: { businessName: 'asc' },
 select: {
 name: true,
 businessName: true,
 country: true,
 role: true,
 email: true,
 phone: true,
 verified: true
 }
 });

 return NextResponse.json({ users });
 } catch (error) {
 console.error("Admin directory error:", error);
 return NextResponse.json({ error: "Failed to fetch directory" }, { status: 500 });
 }
}

