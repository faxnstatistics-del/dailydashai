import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/db/get-user";
import { decomposeGoal } from "@/lib/ai/decomposer";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();

    if (!body.title || !body.targetDate) {
      return NextResponse.json(
        { error: "Title and target date are required" },
        { status: 400 }
      );
    }

    const result = await decomposeGoal({
      userId: user.id,
      title: body.title,
      description: body.description,
      targetDate: body.targetDate,
      category: body.category,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/goals/decompose error:", error);
    return NextResponse.json(
      { error: "Failed to decompose goal" },
      { status: 500 }
    );
  }
}
