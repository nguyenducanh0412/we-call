"use client";

import { useParticipants } from "@livekit/components-react";
import { ParticipantTile } from "./ParticipantTile";

export function ParticipantGrid() {
  const participants = useParticipants();

  const getGridCols = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    if (count <= 9) return "grid-cols-3";
    return "grid-cols-4";
  };

  if (participants.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-zinc-400">Waiting for participants...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 overflow-auto">
      <div className={`grid ${getGridCols(participants.length)} gap-4 h-full`}>
        {participants.map((participant) => (
          <ParticipantTile
            key={participant.identity}
            participant={participant}
          />
        ))}
      </div>
    </div>
  );
}
