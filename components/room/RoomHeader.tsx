"use client";

import { useEffect, useState } from "react";
import { useParticipants } from "@livekit/components-react";
import { Users, Clock } from "lucide-react";

interface RoomHeaderProps {
  roomName: string;
}

export function RoomHeader({ roomName }: RoomHeaderProps) {
  const participants = useParticipants();
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center px-6">
      <div className="flex-1">
        <h1 className="text-white font-semibold text-lg">{roomName}</h1>
      </div>
      
      <div className="flex items-center gap-6 text-zinc-400 text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{participants.length}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{formatDuration(duration)}</span>
        </div>
      </div>
    </header>
  );
}
