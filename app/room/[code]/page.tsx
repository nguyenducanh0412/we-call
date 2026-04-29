import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface RoomPageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { code } = await params;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-4">Room: {code}</h1>
        <p className="text-zinc-400">
          Room page coming in Phase 3 (LiveKit integration)...
        </p>
      </div>
    </div>
  );
}
