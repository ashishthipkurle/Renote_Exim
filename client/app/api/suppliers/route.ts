import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';
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
    importerId: z.string().optional().nullable(),
});

// GET /api/suppliers - List all suppliers for the exporter
export async function GET(request: NextRequest) {
    try {
        const { auth, error: authError } = await getApiAuthContext(request);
        if (authError || !auth) {
            return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = auth.role as any;
        const isExporter = role === 'EXPORTER' || role === 'ADMIN';
        const isSupplier = role === 'SUPPLIER';

        if (!isExporter && !isSupplier) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const suppliers = await prisma.supplier.findMany({
            where: isExporter 
                ? { exporterId: auth.userId }
                : isSupplier
                    ? { sourceId: auth.userId }
                    : { id: 'none' }, // Fallback
            orderBy: { createdAt: 'desc' },
            include: isSupplier ? {
                exporter: {
                    select: {
                        id: true,
                        name: true,
                        businessName: true,
                        email: true,
                        phone: true,
                    }
                }
            } : undefined
        });

        // If user is a supplier, we want to map the exporter details into the response
        const formattedSuppliers = isSupplier ? suppliers.map((s: any) => ({
            ...s,
            name: s.exporter?.businessName || s.exporter?.name || s.name,
            email: s.exporter?.email || s.email,
            phone: s.exporter?.phone || s.phone,
        })) : suppliers;

        return NextResponse.json({ suppliers: formattedSuppliers });
    } catch (error) {
        console.error('Get suppliers error:', error);
        return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
    }
}

// POST /api/suppliers - Create a new supplier
export async function POST(request: NextRequest) {
    try {
        const { auth, error: authError } = await getApiAuthContext(request);
        if (authError || !auth) {
            return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const role = auth.role as any;
        if (role !== 'EXPORTER' && role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const validated = supplierSchema.parse(body);

        const supplier = await prisma.supplier.create({
            data: {
                ...validated,
                exporterId: auth.userId,
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
