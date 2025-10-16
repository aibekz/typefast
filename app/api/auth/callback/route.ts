import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Check for errors
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // Get token from HTTP-only cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 },
      );
    }

    // Return token and state for client-side processing
    return NextResponse.json({
      token,
      state,
      success: true,
    });
  } catch (error) {
    console.error("Auth callback API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
