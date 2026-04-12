import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
 try {
 const authUsers = await prisma.$queryRaw`SELECT count(*) FROM auth.users`;
 const publicUsers = await prisma.user.count();
 
 // Also try an update to test write permissions
 await prisma.$executeRaw`SELECT 1`;
 
 return NextResponse.json({ 
 status: "Ok", 
 authUsers: Number((authUsers as any)[0].count), 
 publicUsers 
 });
 } catch (e: any) {
 return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
 }
}
