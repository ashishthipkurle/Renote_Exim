import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupabaseRouteClient } from '@/lib/supabase/route';

export async function GET(req: NextRequest) {
  try {
    const { supabase } = createSupabaseRouteClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { emailPreferences: true },
    });

    return NextResponse.json({ preferences: dbUser?.emailPreferences || { orders: true, security: true, marketing: false } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { supabase } = createSupabaseRouteClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { preferences } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { emailPreferences: preferences },
    });

    return NextResponse.json({ preferences: updatedUser.emailPreferences });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
