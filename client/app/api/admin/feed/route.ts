import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const [recentUsers, recentOrders, recentProducts] = await Promise.all([
            prisma.user.findMany({
                take: 10,
                orderBy: { createdAt: "desc" },
                select: { id: true, name: true, createdAt: true, role: true },
            }),
            prisma.order.findMany({
                take: 10,
                orderBy: { createdAt: "desc" },
                include: {
                    importer: { select: { name: true } },
                    product: { select: { name: true } },
                },
            }),
            prisma.product.findMany({
                take: 10,
                orderBy: { createdAt: "desc" },
                include: {
                    exporter: { select: { companyName: true, name: true } },
                },
            }),
        ]);

        const feed = [
            ...recentUsers.map((u) => ({
                id: u.id,
                type: "USER_REGISTERED",
                title: "New User Registration",
                description: `${u.name} joined as ${u.role}`,
                time: u.createdAt,
            })),
            ...recentOrders.map((o) => ({
                id: o.id,
                type: "ORDER_PLACED",
                title: "New Order Placed",
                description: `${o.importer.name} ordered ${o.product.name}`,
                time: o.createdAt,
            })),
            ...recentProducts.map((p) => ({
                id: p.id,
                type: "PRODUCT_LISTED",
                title: "New Product Listing",
                description: `${p.name} listed by ${p.exporter.companyName || p.exporter.name}`,
                time: p.createdAt,
            })),
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 20);

        return NextResponse.json({ feed });
    } catch (error) {
        console.error("Admin feed error:", error);
        return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
    }
}
