import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.homeShowcaseItem.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching showcase items:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
