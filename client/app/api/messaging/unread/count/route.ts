import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const context = await getApiAuthContext(request);
    if (!context) return NextResponse.json({ count: 0 });

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
