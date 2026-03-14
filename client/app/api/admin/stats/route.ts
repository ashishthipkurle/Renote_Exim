import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const [
            totalUsers,
            totalOrders,
            totalProducts,
            ordersPrice,
            newUsersThisMonth,
            ordersThisMonth,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.order.count(),
            prisma.product.count(),
            prisma.order.aggregate({
                _sum: {
                    totalPrice: true,
                },
            }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
            prisma.order.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
        ]);

        const totalRevenue = ordersPrice._sum.totalPrice || 0;

        return NextResponse.json({
            totalUsers,
            totalOrders,
            totalProducts,
            totalRevenue,
            newUsersThisMonth,
            ordersThisMonth,
        });
    } catch (error) {
        console.error("Admin stats fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch admin statistics" }, { status: 500 });
    }
}
