import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
 try {
 const { auth: context, error: authError } = await getApiAuthContext(request);
 if (authError || !context) return NextResponse.json({ count: 0 });

 const count = await prisma.message.count({
 where: {
 receiverId: context.userId,
 read: false,
 }
 });

 return NextResponse.json({ count });
 } catch (error) {
 return NextResponse.json({ count: 0 });
 }
}
