import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

// GET /api/notifications — Get notifications for authenticated user
export async function GET(request: NextRequest) {
    console.log("--> API /notifications route hit!");
    try {
        const { auth, error: authError } = await getApiAuthContext(request);
        console.log("--> API /notifications auth result:", { auth: !!auth, hasError: !!authError });
        
        if (authError || !auth) {
            return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unread') === 'true';
        const type = searchParams.get('type');
        const entityId = searchParams.get('entityId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const countOnly = searchParams.get('countOnly') === 'true';

        // Lightweight unread count endpoint
        if (countOnly) {
            const unreadCount = await prisma.notification.count({
                where: {
                    OR: [{ userId: auth.userId }, { ownerId: auth.userId }],
                    read: false,
                    ...(entityId ? { linkedEntityId: entityId } : {}),
                },
            });
            return NextResponse.json({ unreadCount });
        }

        // Full notifications query — supports dual-targeting via userId OR ownerId
        const where: Record<string, any> = {
            OR: [{ userId: auth.userId }, { ownerId: auth.userId }],
        };
        if (unreadOnly) {
            where.read = false;
        }
        if (entityId) {
            where.linkedEntityId = entityId;
        }
        const validTypes = [
            'ORDER_UPDATE', 'SHIPMENT_UPDATE', 'MESSAGE_RECEIVED', 
            'VERIFICATION_OUTCOME', 'CALL_SCHEDULED', 'CALL_ACCEPTED', 
            'CALL_REJECTED', 'CALL_REMINDER', 'MISSED_CALL', 
            'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'ADMIN_BROADCAST'
        ];

        if (type && type !== 'all' && validTypes.includes(type)) {
            where.type = type;
        } else if (type === 'MESSAGE') {
            // Frontend passes 'MESSAGE' for communications tab
            where.type = 'MESSAGE_RECEIVED';
        } else if (type === 'ORDERS') {
            where.type = 'ORDER_UPDATE';
        } else if (type === 'LOGISTICS') {
            where.type = 'SHIPMENT_UPDATE';
        } else if (type === 'FINANCIAL') {
            where.type = { in: ['PAYMENT_RECEIVED', 'PAYMENT_FAILED'] };
        } else if (type === 'SYSTEM') {
            where.type = { in: ['ADMIN_BROADCAST', 'VERIFICATION_OUTCOME'] };
        }

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({
                where: {
                    OR: [{ userId: auth.userId }, { ownerId: auth.userId }],
                    read: false,
                },
            }),
        ]);

        return NextResponse.json({
            notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

// PATCH /api/notifications — Mark notifications as read
export async function PATCH(request: NextRequest) {
    try {
        const { auth, error: authError } = await getApiAuthContext(request);
        if (authError || !auth) {
            return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { ids, markAll } = body as { ids?: string[]; markAll?: boolean };

        if (markAll) {
            await prisma.notification.updateMany({
                where: {
                    OR: [{ userId: auth.userId }, { ownerId: auth.userId }],
                    read: false,
                },
                data: { read: true, readAt: new Date() },
            });
            return NextResponse.json({ message: 'All notifications marked as read' });
        }

        if (ids && Array.isArray(ids) && ids.length > 0) {
            await prisma.notification.updateMany({
                where: {
                    id: { in: ids },
                    OR: [{ userId: auth.userId }, { ownerId: auth.userId }],
                },
                data: { read: true, readAt: new Date() },
            });
            return NextResponse.json({ message: `${ids.length} notification(s) marked as read` });
        }

        return NextResponse.json({ error: 'Provide ids array or markAll=true' }, { status: 400 });
    } catch (error) {
        console.error('Update notifications error:', error);
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }
}
