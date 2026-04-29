import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLiveKitToken } from "@/lib/livekit";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomCode = searchParams.get("room");

    if (!roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { code: roomCode.toUpperCase() },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.endedAt) {
      return NextResponse.json(
        { error: "Room has ended" },
        { status: 410 }
      );
    }

    const token = await generateLiveKitToken(
      room.code,
      session.user.id,
      session.user.name,
      session.user.image || null
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error("LiveKit token error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
