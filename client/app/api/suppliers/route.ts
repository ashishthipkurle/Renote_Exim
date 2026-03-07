import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/supabase/auth';
import { z } from 'zod';

const supplierSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    contactPerson: z.string().optional().nullable(),
    email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

// GET /api/suppliers - List all suppliers for the exporter
export async function GET(request: NextRequest) {
    try {
        const auth = await getApiAuthContext(request);
        if (!auth || auth.role !== 'EXPORTER' && auth.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const suppliers = await prisma.supplier.findMany({
            where: { userId: auth.userId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ suppliers });
    } catch (error) {
        console.error('Get suppliers error:', error);
        return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
    }
}

// POST /api/suppliers - Create a new supplier
export async function POST(request: NextRequest) {
    try {
        const auth = await getApiAuthContext(request);
        if (!auth || auth.role !== 'EXPORTER' && auth.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validated = supplierSchema.parse(body);

        const supplier = await prisma.supplier.create({
            data: {
                ...validated,
                userId: auth.userId,
            },
        });

        return NextResponse.json({ supplier }, { status: 201 });
    } catch (error) {
        console.error('Create supplier error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.flatten() }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
    }
}
