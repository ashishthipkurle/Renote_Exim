import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/supabase/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// GET /api/user/profile — Get current user profile
export async function GET(request: NextRequest) {
  try {
    const auth = await getApiAuthContext(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyName: true,
        country: true,
        phone: true,
        website: true,
        businessType: true,
        taxId: true,
        address: true,
        verified: true,
        avatar: true,
        description: true,
        socialLinks: true,
        businessHours: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  companyName: z.string().max(200).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  website: z.string().url().or(z.literal('')).optional().nullable(),
  businessType: z.string().max(100).optional().nullable(),
  taxId: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  avatar: z.string().url().or(z.literal('')).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  socialLinks: z.record(z.string()).optional().nullable(),
  businessHours: z.record(z.any()).optional().nullable(),
});

// PATCH /api/user/profile — Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const auth = await getApiAuthContext(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Remove undefined fields
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        data[key] = value;
      }
    }

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyName: true,
        country: true,
        phone: true,
        website: true,
        businessType: true,
        taxId: true,
        address: true,
        verified: true,
        avatar: true,
        description: true,
        socialLinks: true,
        businessHours: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile PATCH error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
