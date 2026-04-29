"use client";

import { useState, useEffect } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { RoomHeader } from "./RoomHeader";
import { ParticipantGrid } from "./ParticipantGrid";
import { ControlBar } from "./ControlBar";
import { ChatPanel } from "./ChatPanel";
import { ReactionOverlay } from "./ReactionOverlay";
import { useChat } from "@/hooks/useChat";
import { useReactions } from "@/hooks/useReactions";

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
  const { localParticipant } = useLocalParticipant();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize chat hook
  const { messages, sendMessage } = useChat({
    roomCode: room.code,
    userId: user.id,
    userName: user.name,
    userAvatar: user.image || null,
    onMuted: async () => {
      // Mute the local participant when host mutes us
      await localParticipant.setMicrophoneEnabled(false);
    },
  });

  // Initialize reactions hook
  const {
    activeReactions,
    raisedHands,
    isHandRaised,
    sendReaction,
    toggleHand,
  } = useReactions({
    roomCode: room.code,
    userId: user.id,
    userName: user.name,
    userAvatar: user.image || null,
  });

  // Track unread messages
  useEffect(() => {
    if (!isChatOpen && messages.length > 0) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [messages.length, isChatOpen]);

  // Reset unread when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  return (
    <div className="h-screen overflow-hidden bg-zinc-950 flex flex-col">
      <RoomHeader roomName={room.name} />
      
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-hidden relative">
          <ParticipantGrid />
          <ReactionOverlay reactions={activeReactions} />
        </div>
        
        {/* Chat panel */}
        {isChatOpen && (
          <ChatPanel
            messages={messages}
            onSendMessage={sendMessage}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </div>

      <ControlBar
        isHost={isHost}
        isChatOpen={isChatOpen}
        onChatToggle={() => setIsChatOpen(!isChatOpen)}
        isParticipantsOpen={isParticipantsOpen}
        onParticipantsToggle={() => setIsParticipantsOpen(!isParticipantsOpen)}
        onSendReaction={sendReaction}
        isHandRaised={isHandRaised}
        onToggleHand={toggleHand}
        unreadCount={unreadCount}
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
            <div className="space-y-2">
              {raisedHands.length > 0 && (
                <div className="border-b border-zinc-800 pb-2 mb-2">
                  <p className="text-zinc-400 text-xs mb-2">Raised Hands</p>
                  {raisedHands.map((hand) => (
                    <div
                      key={hand.userId}
                      className="text-white text-sm flex items-center gap-2 py-1"
                    >
                      <span>✋</span>
                      <span>{hand.userName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
