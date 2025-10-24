import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const body = await request.json();

    const {
      wpm,
      accuracy,
      time,
      characters,
      mistakes,
      testType = "time",
      difficulty = "medium",
    } = body;

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
      const { validateToken } = await import("../../../lib/auth");
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

    if (!wpm || !accuracy || !time || !characters || mistakes === undefined) {
      return NextResponse.json(
        { error: "Missing required test data" },
        { status: 400 },
      );
    }

    // Save the test result
    const test = await db.test.create({
      data: {
        userId,
        wpm: Math.round(wpm),
        accuracy: Math.round(accuracy * 100) / 100,
        time: Math.round(time),
        characters: Math.round(characters),
        mistakes: Math.round(mistakes),
        testType,
        difficulty,
      },
    });

    // Update or create daily progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingProgress = await db.progress.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingProgress) {
      // Update existing progress
      const updatedTestsCount = existingProgress.testsCount + 1;
      const updatedAverageWpm =
        (existingProgress.averageWpm * existingProgress.testsCount + wpm) /
        updatedTestsCount;
      const updatedBestWpm = Math.max(
        existingProgress.bestWpm,
        Math.round(wpm),
      );
      const updatedAccuracy =
        (existingProgress.accuracy * existingProgress.testsCount + accuracy) /
        updatedTestsCount;
      const updatedTimeSpent =
        existingProgress.timeSpent + Math.round(time / 60);

      await db.progress.update({
        where: { id: existingProgress.id },
        data: {
          testsCount: updatedTestsCount,
          averageWpm: Math.round(updatedAverageWpm * 100) / 100,
          bestWpm: updatedBestWpm,
          accuracy: Math.round(updatedAccuracy * 100) / 100,
          timeSpent: updatedTimeSpent,
        },
      });
    } else {
      // Create new progress entry
      await db.progress.create({
        data: {
          userId,
          averageWpm: Math.round(wpm * 100) / 100,
          bestWpm: Math.round(wpm),
          testsCount: 1,
          accuracy: Math.round(accuracy * 100) / 100,
          timeSpent: Math.round(time / 60),
        },
      });
    }

    // Check for achievements
    const achievements = [];

    // Speed achievements
    if (wpm >= 100) {
      achievements.push({
        userId,
        type: "speed",
        title: "Speed Demon",
        description: "Achieved 100+ WPM",
        icon: "⚡",
      });
    } else if (wpm >= 80) {
      achievements.push({
        userId,
        type: "speed",
        title: "Fast Typer",
        description: "Achieved 80+ WPM",
        icon: "🚀",
      });
    }

    // Accuracy achievements
    if (accuracy >= 99) {
      achievements.push({
        userId,
        type: "accuracy",
        title: "Perfectionist",
        description: "Achieved 99%+ accuracy",
        icon: "🎯",
      });
    } else if (accuracy >= 95) {
      achievements.push({
        userId,
        type: "accuracy",
        title: "Precision Master",
        description: "Achieved 95%+ accuracy",
        icon: "🎯",
      });
    }

    // Create achievements if they don't already exist
    for (const achievement of achievements) {
      const existingAchievement = await db.achievement.findFirst({
        where: {
          userId,
          type: achievement.type,
          title: achievement.title,
        },
      });

      if (!existingAchievement) {
        await db.achievement.create({
          data: achievement,
        });
      }
    }

    return NextResponse.json({
      success: true,
      test,
      achievements: achievements.length,
    });
  } catch (error) {
    console.error("Error saving test result:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 },
    );
  }
}
