import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = createSupabaseRouteClient(request);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prismaModule = await import("@/lib/prisma");
    const history = await prismaModule.prisma.loginHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(history);

  } catch (error) {
    console.error("Login history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
