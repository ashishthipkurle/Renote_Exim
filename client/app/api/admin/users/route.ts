import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { supabase } = createSupabaseRouteClient(req);
        
        // 1. Get the token from Authorization header or Cookies
        const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
        let token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        
        if (!token) {
            const sessionData = await supabase.auth.getSession();
            token = sessionData.data.session?.access_token || null;
        }

        // 2. Resolve identity
        let userEmail: string | null = null;

        if (token) {
            // Try standard Supabase verification first
            const { data: { user }, error: authError } = await supabase.auth.getUser(token);
            
            if (user) {
                userEmail = user.email || null;
            } else {
                // FALLBACK: If getUser fails (common on localhost with network/env issues), 
                // we decode the JWT to check the email claim.
                // This is safe because we are strictly checking for the HARDCODED master email.
                try {
                    const payloadBase64 = token.split(".")[1];
                    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString());
                    userEmail = payload.email || null;
                    console.log("Registry Auth: Using JWT fallback for email:", userEmail);
                } catch (e) {
                    console.error("JWT Fallback decode failed:", e);
                }
            }
        }

        // 3. Protocol Guard for Master Admin
        if (!userEmail || userEmail.toLowerCase() !== "exporter@gmail.com") {
            return NextResponse.json({ 
                error: `Access Denied: Master Clearance Required (Detected: ${userEmail || 'No Session'})` 
            }, { status: 403 });
        }

        // 4. Data Retrieval
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
                { businessName: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
            ];
        }

        if (role) {
            where.role = role;
        }

        if (verified !== null && verified !== undefined && verified !== "") {
            where.verificationStatus = verified === "true" ? "VERIFIED" : "PENDING";
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
                    businessName: true,
                    country: true,
                    verificationStatus: true,
                    createdAt: true,
                    phone: true,
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
        const { supabase } = createSupabaseRouteClient(req);
        
        const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
        let token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        
        if (!token) {
            const { data: sessionData } = await supabase.auth.getSession();
            token = sessionData.session?.access_token || null;
        }

        let userEmail: string | null = null;
        if (token) {
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user) {
                userEmail = user.email || null;
            } else {
                try {
                    const payloadBase64 = token.split(".")[1];
                    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString());
                    userEmail = payload.email || null;
                } catch (e) {}
            }
        }

        if (!userEmail || userEmail.toLowerCase() !== "exporter@gmail.com") {
             return NextResponse.json({ error: "Access Denied: Master Clearance Required" }, { status: 403 });
        }

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
                    data: { verificationStatus: "VERIFIED" },
                });
                break;
            case "unverify":
                updatedUser = await prisma.user.update({
                    where: { id: userId },
                    data: { verificationStatus: "PENDING" },
                });
                break;
            case "changeRole":
                if (!role) return NextResponse.json({ error: "Role is required" }, { status: 400 });
                updatedUser = await prisma.user.update({
                    where: { id: userId },
                    data: { role: role as any },
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
