import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function findUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const existing = await prisma.room.findUnique({
      where: { code },
    });
    if (!existing) {
      return code;
    }
  }
  throw new Error("Could not generate unique room code");
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Room name must be at least 2 characters" },
        { status: 400 }
      );
    }

    const code = await findUniqueCode();

    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        code,
        hostId: session.user.id,
      },
    });

    await prisma.roomSession.create({
      data: {
        roomId: room.id,
        userId: session.user.id,
        role: "HOST",
      },
    });

    return NextResponse.json(
      {
        room: {
          id: room.id,
          name: room.name,
          code: room.code,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
