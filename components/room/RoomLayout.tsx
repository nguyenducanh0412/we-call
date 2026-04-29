"use client";

import { useState } from "react";
import { RoomHeader } from "./RoomHeader";
import { ParticipantGrid } from "./ParticipantGrid";
import { ControlBar } from "./ControlBar";

interface RoomLayoutProps {
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

export function RoomLayout({ room, user, isHost }: RoomLayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-zinc-950 flex flex-col">
      <RoomHeader roomName={room.name} />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <ParticipantGrid />
        </div>
        
        {/* Chat panel will be added in Phase 4 */}
        {isChatOpen && (
          <div className="w-80 bg-zinc-900 border-l border-zinc-800">
            <div className="p-4 text-white">Chat (Phase 4)</div>
          </div>
        )}
      </div>

      <ControlBar
        isHost={isHost}
        isChatOpen={isChatOpen}
        onChatToggle={() => setIsChatOpen(!isChatOpen)}
        isParticipantsOpen={isParticipantsOpen}
        onParticipantsToggle={() => setIsParticipantsOpen(!isParticipantsOpen)}
      />

      {/* Participant list sidebar */}
      {isParticipantsOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-72 bg-zinc-900 border-l border-zinc-800 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Participants</h3>
              <button
                onClick={() => setIsParticipantsOpen(false)}
                className="text-zinc-400 hover:text-white"
                aria-label="Close participants"
              >
                ×
              </button>
            </div>
            <div className="text-zinc-400 text-sm">
              Participant list (Phase 3)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
