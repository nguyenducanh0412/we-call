"use client";

import { useState, useEffect } from "react";
import {
  useLocalParticipant,
  useParticipants,
} from "@livekit/components-react";
import { RoomHeader } from "./RoomHeader";
import { ParticipantGrid } from "./ParticipantGrid";
import { ControlBar } from "./ControlBar";
import { ChatPanel } from "./ChatPanel";
import { ReactionOverlay } from "./ReactionOverlay";
import { HostPanel } from "./HostPanel";
import { useChat } from "@/hooks/useChat";
import { useReactions } from "@/hooks/useReactions";
import { useHostControls } from "@/hooks/useHostControls";

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

export function RoomLayout({
  room,
  user,
  isHost: initialIsHost,
}: RoomLayoutProps) {
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHostPanelOpen, setIsHostPanelOpen] = useState(false);
  const [lastReadCount, setLastReadCount] = useState(0);
  const [isHost, setIsHost] = useState(initialIsHost);
  const [roomIsLocked, setRoomIsLocked] = useState(false);

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
    onHostChanged: (newIsHost) => {
      setIsHost(newIsHost);
    },
    onRoomLockChanged: (isLocked) => {
      setRoomIsLocked(isLocked);
    },
  });

  // Initialize reactions hook
  const {
    activeReactions,
    raisedHands,
    isHandRaised,
    sendReaction,
    toggleHand,
    lowerParticipantHand,
  } = useReactions({
    roomCode: room.code,
    userId: user.id,
    userName: user.name,
    userAvatar: user.image || null,
  });

  // Initialize host controls
  const hostControls = useHostControls({
    roomCode: room.code,
    roomId: room.id,
    userId: user.id,
    userName: user.name,
    userAvatar: user.image || null,
    isHost,
  });

  useEffect(() => {
    if (isChatOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastReadCount(messages.length);
    }
  }, [isChatOpen, messages.length]);

  const unreadCount = isChatOpen
    ? 0
    : Math.max(0, messages.length - lastReadCount);

  // Map LiveKit participants to our format
  const participantList = participants.map((p) => ({
    userId: p.identity,
    userName: p.name || p.identity,
    userAvatar: null, // LiveKit doesn't provide avatars by default
    isHost: p.identity === room.hostId,
  }));

  return (
    <div className="h-screen overflow-hidden bg-zinc-950 flex flex-col">
      <RoomHeader
        roomName={room.name}
        roomCode={room.code}
        isLocked={roomIsLocked}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Host Panel (left side) */}
        {isHost && isHostPanelOpen && (
          <HostPanel
            currentUserId={user.id}
            participants={participantList}
            raisedHands={raisedHands}
            isLocked={hostControls.isLocked}
            onClose={() => setIsHostPanelOpen(false)}
            onKick={hostControls.kickParticipant}
            onMute={hostControls.muteParticipant}
            onEndCall={hostControls.endCall}
            onTransferHost={hostControls.transferHost}
            onToggleLock={hostControls.toggleLock}
            onLowerHand={lowerParticipantHand}
          />
        )}

        <div className="flex-1 overflow-hidden relative">
          <ParticipantGrid />
          <ReactionOverlay reactions={activeReactions} />
        </div>

        {/* Chat panel (right side) */}
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
        isParticipantsOpen={isHostPanelOpen}
        onParticipantsToggle={() => setIsHostPanelOpen(!isHostPanelOpen)}
        onSendReaction={sendReaction}
        isHandRaised={isHandRaised}
        onToggleHand={toggleHand}
        unreadCount={unreadCount}
      />
    </div>
  );
}
