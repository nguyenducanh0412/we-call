import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await params;

    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.endedAt) {
      return NextResponse.json({ ended: true }, { status: 200 });
    }

    // Check if room is locked and user is not the host
    if (room.isLocked && room.hostId !== session.user.id) {
      return NextResponse.json(
        { error: "Room is locked", locked: true },
        { status: 403 }
      );
    }

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        code: room.code,
        hostId: room.hostId,
        isLocked: room.isLocked,
      },
    });
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json(
      { error: "Failed to get room" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await params;
    const body = await req.json();

    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Only host can update room
    if (room.hostId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update room with partial data
    const updatedRoom = await prisma.room.update({
      where: { code: code.toUpperCase() },
      data: {
        ...(typeof body.isLocked === "boolean" && { isLocked: body.isLocked }),
        ...(body.endedAt && { endedAt: new Date(body.endedAt) }),
        ...(body.hostId && { hostId: body.hostId }),
      },
    });

    return NextResponse.json({
      room: {
        id: updatedRoom.id,
        name: updatedRoom.name,
        code: updatedRoom.code,
        hostId: updatedRoom.hostId,
        isLocked: updatedRoom.isLocked,
      },
    });
  } catch (error) {
    console.error("Update room error:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}
