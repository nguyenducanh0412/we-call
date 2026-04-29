"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
}

interface RaisedHand {
  userId: string;
  userName: string;
}

interface UseReactionsOptions {
  roomCode: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
}

export function useReactions({
  roomCode,
  userId,
  userName,
  userAvatar,
}: UseReactionsOptions) {
  const [activeReactions, setActiveReactions] = useState<Reaction[]>([]);
  const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Get socket instance
    const sock = getSocket({
      roomCode,
      userId,
      userName,
      userAvatar,
    });

    setSocket(sock);

    // Listen for reactions
    const handleReactionReceive = (reaction: Reaction) => {
      setActiveReactions((prev) => [...prev, reaction]);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        setActiveReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 3000);
    };

    // Listen for raised hands
    const handleHandRaised = ({ userId: raisedUserId, userName: raisedUserName }: RaisedHand) => {
      setRaisedHands((prev) => {
        // Check if already in list
        if (prev.some((h) => h.userId === raisedUserId)) {
          return prev;
        }
        return [...prev, { userId: raisedUserId, userName: raisedUserName }];
      });

      // If it's our hand
      if (raisedUserId === userId) {
        setIsHandRaised(true);
      }
    };

    const handleHandLowered = ({ userId: loweredUserId }: { userId: string }) => {
      setRaisedHands((prev) => prev.filter((h) => h.userId !== loweredUserId));

      // If it's our hand
      if (loweredUserId === userId) {
        setIsHandRaised(false);
      }
    };

    sock.on("reaction:receive", handleReactionReceive);
    sock.on("hand:raised", handleHandRaised);
    sock.on("hand:lowered", handleHandLowered);

    // Cleanup
    return () => {
      sock.off("reaction:receive", handleReactionReceive);
      sock.off("hand:raised", handleHandRaised);
      sock.off("hand:lowered", handleHandLowered);
    };
  }, [roomCode, userId, userName, userAvatar]);

  const sendReaction = (emoji: string) => {
    if (socket) {
      socket.emit("reaction:send", { emoji });
    }
  };

  const raiseHand = () => {
    if (socket && !isHandRaised) {
      socket.emit("hand:raise");
      setIsHandRaised(true);
    }
  };

  const lowerHand = () => {
    if (socket && isHandRaised) {
      socket.emit("hand:lower");
      setIsHandRaised(false);
    }
  };

  const lowerParticipantHand = (targetUserId: string) => {
    if (socket) {
      // Emit a lower hand event for a specific user (host action)
      socket.emit("hand:lower", { targetUserId });
    }
  };

  const toggleHand = () => {
    if (isHandRaised) {
      lowerHand();
    } else {
      raiseHand();
    }
  };

  return {
    activeReactions,
    raisedHands,
    isHandRaised,
    sendReaction,
    raiseHand,
    lowerHand,
    lowerParticipantHand,
    toggleHand,
  };
}
