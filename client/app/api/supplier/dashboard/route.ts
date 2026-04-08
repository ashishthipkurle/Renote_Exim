import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const auth = await getApiAuthContext(request);
        const role = auth?.role as any;
        if (!auth || role !== 'SUPPLIER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supplierId = auth.userId;

        // Fetch supplier statistical aggregates
        const [totalExporters, totalProducts, activeOrders, revenueData] = await Promise.all([
            // How many exporters is this supplier linked to?
            prisma.supplier.count({
                where: { sourceId: supplierId }
            }),
            // How many products does this supplier offer?
            prisma.product.count({
                where: { exporterId: supplierId } // In our schema, SUPPLIER is a User role
            }),
            // How many active orders (incomplete)?
            prisma.order.count({
                where: { 
                    sellerId: supplierId,
                    status: { notIn: ['DELIVERED', 'CANCELLED'] }
                }
            }),
            // Total revenue from historical orders
            prisma.order.aggregate({
                where: { 
                    sellerId: supplierId,
                    status: 'DELIVERED'
                },
                _sum: {
                    totalPrice: true
                }
            })
        ]);

        return NextResponse.json({
            stats: {
                totalExporters,
                totalProducts,
                activeOrders,
                revenue: revenueData._sum.totalPrice || 0,
                revenueChange: 0 // Baseline for now
            }
        });
    } catch (error) {
        console.error('Supplier Dashboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
