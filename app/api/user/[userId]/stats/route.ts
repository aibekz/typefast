import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Verify authentication
    const authToken = request.cookies.get("auth_token")?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify the user owns this data
    try {
      const { validateToken } = await import("@/lib/auth");
      const userInfo = await validateToken(authToken);

      // Get the database user to verify ownership
      const dbUser = await db.user.findUnique({
        where: { authId: userInfo.id || userInfo.email },
      });

      if (!dbUser || dbUser.id !== userId) {
        return NextResponse.json(
          { error: "Unauthorized access" },
          { status: 403 },
        );
      }
    } catch (authError) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 },
      );
    }

    // Get user's recent tests (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [tests, progress, achievements] = await Promise.all([
      // Recent tests
      db.test.findMany({
        where: {
          userId,
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),

      // Progress data
      db.progress.findMany({
        where: {
          userId,
        },
        orderBy: {
          date: "desc",
        },
        take: 7, // Last 7 days
      }),

      // Achievements
      db.achievement.findMany({
        where: {
          userId,
        },
        orderBy: {
          earnedAt: "desc",
        },
      }),
    ]);

    // Calculate statistics
    const totalTests = tests.length;
    const averageWpm =
      tests.length > 0
        ? Math.round(
            tests.reduce((sum, test) => sum + test.wpm, 0) / tests.length,
          )
        : 0;
    const bestWpm =
      tests.length > 0 ? Math.max(...tests.map((test) => test.wpm)) : 0;
    const averageAccuracy =
      tests.length > 0
        ? Math.round(
            (tests.reduce((sum, test) => sum + test.accuracy, 0) /
              tests.length) *
              100,
          ) / 100
        : 0;

    // Calculate total time spent (in minutes)
    const totalTimeSpent = tests.reduce((sum, test) => sum + test.time, 0) / 60;

    // Get recent progress trend
    const recentProgress = progress.slice(0, 7).reverse();

    const stats = {
      totalTests,
      averageWpm,
      bestWpm,
      averageAccuracy,
      totalTimeSpent: Math.round(totalTimeSpent),
      recentTests: tests,
      recentProgress,
      achievements: achievements.slice(0, 5), // Latest 5 achievements
      lastTestDate: tests.length > 0 ? tests[0].createdAt : null,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 },
    );
  }
}
