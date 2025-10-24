import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authId = searchParams.get("authId");

    console.log("Looking up user with authId:", authId);

    if (!authId) {
      return NextResponse.json(
        { error: "Auth ID is required" },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({
      where: { authId },
    });

    console.log("User lookup result:", user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authId, email, name, avatar, plan } = body;

    console.log("Creating user with data:", {
      authId,
      email,
      name,
      avatar,
      plan,
    });

    if (!authId || !email) {
      return NextResponse.json(
        { error: "Auth ID and email are required" },
        { status: 400 },
      );
    }

    const user = await db.user.create({
      data: {
        authId,
        email,
        name,
        avatar,
      },
    });

    console.log("User created successfully:", user);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("PUT /api/user called");
    const body = await request.json();
    const { authId, email, name, avatar } = body;

    console.log("Updating user with data:", { authId, email, name, avatar });

    if (!authId) {
      return NextResponse.json(
        { error: "Auth ID is required" },
        { status: 400 },
      );
    }

    const user = await db.user.upsert({
      where: { authId },
      update: {
        email,
        name,
        avatar,
      },
      create: {
        authId,
        email,
        name,
        avatar,
      },
    });

    console.log("User updated successfully:", user);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 },
    );
  }
}
