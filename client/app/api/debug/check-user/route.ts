import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: "Email parameter required" }, { status: 400 });
  }

  try {
    const results: any = {
      email,
      authSchema: null,
      publicSchema: null,
    };

    // 1. Check Nhost Auth schema
    try {
      const authUsers: any[] = await prisma.$queryRawUnsafe(
        `SELECT id, email, email_verified, disabled FROM auth.users WHERE email = $1`,
        email
      );
      results.authSchema = authUsers.length > 0 ? authUsers[0] : "NOT_FOUND";
    } catch (e: any) {
      results.authSchema = { error: e.message };
    }

    // 2. Check Public schema (Prisma)
    try {
      const publicUser = await prisma.user.findUnique({
        where: { email }
      });
      results.publicSchema = publicUser ? { id: publicUser.id, role: publicUser.role, deletedAt: publicUser.deletedAt } : "NOT_FOUND";
    } catch (e: any) {
      results.publicSchema = { error: e.message };
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
