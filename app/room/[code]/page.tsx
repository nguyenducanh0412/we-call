import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { RoomPage } from "@/components/room/RoomPage";

interface RoomPageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function Room({ params }: RoomPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { code } = await params;

  const room = await prisma.room.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!room || room.endedAt) {
    notFound();
  }

  const isHost = room.hostId === session.user.id;

  return (
    <RoomPage
      room={{
        id: room.id,
        code: room.code,
        name: room.name,
        hostId: room.hostId,
      }}
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      isHost={isHost}
    />
  );
}
