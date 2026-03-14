import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "20");
        const search = searchParams.get("q") || "";
        const role = searchParams.get("role") || "";
        const verified = searchParams.get("verified");
        const country = searchParams.get("country");

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { companyName: { contains: search, mode: "insensitive" } },
            ];
        }

        if (role) {
            where.role = role;
        }

        if (verified !== null && verified !== undefined && verified !== "") {
            where.verified = verified === "true";
        }

        if (country) {
            where.country = country;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    companyName: true,
                    country: true,
                    verified: true,
                    createdAt: true,
                },
            }),
            prisma.user.count({ where }),
        ]);

        return NextResponse.json({
            users,
            total,
            page,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error("Admin users fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, action, role } = body;

        if (!userId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let updatedUser;

        switch (action) {
            case "verify":
                updatedUser = await prisma.user.update({
                    where: { id: userId },
                    data: { verified: true },
                });
                break;
            case "unverify":
                updatedUser = await prisma.user.update({
                    where: { id: userId },
                    data: { verified: false },
                });
                break;
            case "changeRole":
                if (!role) return NextResponse.json({ error: "Role is required" }, { status: 400 });
                updatedUser = await prisma.user.update({
                    where: { id: userId },
                    data: { role: role },
                });
                break;
            case "delete":
                await prisma.user.delete({
                    where: { id: userId },
                });
                return NextResponse.json({ message: "User deleted successfully" });
            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        return NextResponse.json({ message: "Action successful", user: updatedUser });
    } catch (error) {
        console.error("Admin user action error:", error);
        return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
    }
}
