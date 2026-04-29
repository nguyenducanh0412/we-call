"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";
import { RoomLayout } from "./RoomLayout";
import { Loader2 } from "lucide-react";

interface RoomPageProps {
  room: {
    id: string;
    code: string;
    name: string;
    hostId: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  isHost: boolean;
}

export function RoomPage({ room, user, isHost }: RoomPageProps) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(`/api/livekit/token?room=${room.code}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to get token");
        }

        setToken(data.token);
      } catch (err) {
        console.error("Token fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to connect");
      }
    };

    fetchToken();
  }, [room.code]);

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="text-zinc-400 hover:text-white"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-zinc-400" />
          <p className="text-xl">Connecting...</p>
        </div>
      </div>
    );
  }

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!serverUrl) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">LiveKit server URL not configured</p>
          <p className="text-zinc-400 text-sm">
            Add NEXT_PUBLIC_LIVEKIT_URL to your environment variables
          </p>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect={true}
      audio={true}
      video={true}
      onDisconnected={() => router.push("/")}
    >
      <RoomLayout isHost={isHost} room={room} user={user} />
    </LiveKitRoom>
  );
}
