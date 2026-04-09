import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const { auth, error } = await getApiAuthContext(req);
    if (error || !auth) return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { emailPreferences: true },
    });

    return NextResponse.json({ preferences: dbUser?.emailPreferences || { orders: true, security: true, marketing: false } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { auth, error } = await getApiAuthContext(req);
    if (error || !auth) return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { preferences } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: { emailPreferences: preferences },
    });

    return NextResponse.json({ preferences: updatedUser.emailPreferences });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
