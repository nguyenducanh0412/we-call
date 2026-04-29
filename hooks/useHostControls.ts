"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";
import type { Socket } from "socket.io-client";

interface UseHostControlsOptions {
  roomCode: string;
  roomId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  isHost: boolean;
}

export function useHostControls({
  roomCode,
  roomId,
  userId,
  userName,
  userAvatar,
  isHost,
}: UseHostControlsOptions) {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!isHost) return;

    // Get socket instance
    const sock = getSocket({
      roomCode,
      userId,
      userName,
      userAvatar,
    });

    setSocket(sock);

    // Listen for room lock changes
    const handleLockChanged = ({ isLocked: locked }: { isLocked: boolean }) => {
      setIsLocked(locked);
    };

    sock.on("room:lockChanged", handleLockChanged);

    return () => {
      sock.off("room:lockChanged", handleLockChanged);
    };
  }, [isHost, roomCode, userId, userName, userAvatar]);

  const kickParticipant = async (targetUserId: string, targetUserName: string) => {
    if (!isHost || !socket) return;

    socket.emit("host:kick", { targetUserId });
    toast.success(`Kicked ${targetUserName}`);
  };

  const muteParticipant = async (targetUserId: string, targetUserName: string) => {
    if (!isHost || !socket) return;

    socket.emit("host:mute", { targetUserId });
    toast.success(`${targetUserName} has been muted`);
  };

  const endCall = async () => {
    if (!isHost || !socket) return;

    try {
      // Update room in database to mark as ended
      const response = await fetch(`/api/rooms/${roomCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endedAt: new Date().toISOString() }),
      });

      if (!response.ok) {
        throw new Error("Failed to end room");
      }

      // Emit to all participants
      socket.emit("host:end");

      // Redirect host
      toast.info("Call ended");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("Error ending call:", error);
      toast.error("Failed to end call");
    }
  };

  const transferHost = async (newHostId: string, newHostName: string) => {
    if (!isHost || !socket) return;

    try {
      // Update room in database
      const response = await fetch(`/api/rooms/${roomCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId: newHostId }),
      });

      if (!response.ok) {
        throw new Error("Failed to transfer host");
      }

      // Emit to all participants
      socket.emit("host:transfer", { newHostId, newHostName });
      toast.success(`${newHostName} is now the host`);
    } catch (error) {
      console.error("Error transferring host:", error);
      toast.error("Failed to transfer host");
    }
  };

  const toggleLock = async () => {
    if (!isHost || !socket) return;

    const newLockState = !isLocked;

    try {
      // Update room in database
      const response = await fetch(`/api/rooms/${roomCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: newLockState }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle lock");
      }

      // Emit to all participants
      socket.emit("host:lock", { isLocked: newLockState });
      setIsLocked(newLockState);
      toast.success(newLockState ? "Room locked" : "Room unlocked");
    } catch (error) {
      console.error("Error toggling lock:", error);
      toast.error("Failed to toggle room lock");
    }
  };

  return {
    kickParticipant,
    muteParticipant,
    endCall,
    transferHost,
    toggleLock,
    isLocked,
  };
}
