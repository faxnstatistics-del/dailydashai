import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/db/get-user";
import { generateDailyBriefing } from "@/lib/ai/briefing";
import { prisma } from "@/lib/db/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const today = new Date();

    const existing = await prisma.briefing.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return NextResponse.json(JSON.parse(existing.content));
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error("GET /api/briefing error:", error);
    return NextResponse.json(
      { error: "Failed to fetch briefing" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const briefing = await generateDailyBriefing(user.id);
    return NextResponse.json(briefing);
  } catch (error: unknown) {
    console.error("POST /api/briefing error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate briefing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
