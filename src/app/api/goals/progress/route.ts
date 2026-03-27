import { NextRequest, NextResponse } from "next/server";
import { adaptGoal } from "@/lib/ai/decomposer";
import { getAuthenticatedUser } from "@/lib/db/get-user";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.goalId) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    const result = await adaptGoal(body.goalId, user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/goals/progress error:", error);
    return NextResponse.json(
      { error: "Failed to adapt goal" },
      { status: 500 }
    );
  }
}
