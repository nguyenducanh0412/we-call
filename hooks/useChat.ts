"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { toast } from "sonner";
import type { Socket } from "socket.io-client";

export interface ChatMessage {
  id: string;
  userId: string | null;
  userName: string;
  userAvatar: string | null;
  content: string;
  type: "TEXT" | "SYSTEM";
  createdAt: string;
}

interface UseChatOptions {
  roomCode: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  onMuted?: () => void;
  onHostChanged?: (isHost: boolean, newHostName?: string) => void;
  onRoomLockChanged?: (isLocked: boolean) => void;
}

export function useChat({
  roomCode,
  userId,
  userName,
  userAvatar,
  onMuted,
  onHostChanged,
  onRoomLockChanged,
}: UseChatOptions) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // Use refs to store callbacks to avoid infinite re-renders
  const onMutedRef = useRef(onMuted);
  const onHostChangedRef = useRef(onHostChanged);
  const onRoomLockChangedRef = useRef(onRoomLockChanged);

  // Update refs when callbacks change
  useEffect(() => {
    onMutedRef.current = onMuted;
    onHostChangedRef.current = onHostChanged;
    onRoomLockChangedRef.current = onRoomLockChanged;
  }, [onMuted, onHostChanged, onRoomLockChanged]);

  useEffect(() => {
    // Initialize socket connection
    const sock = getSocket({
      roomCode,
      userId,
      userName,
      userAvatar,
    });

    socketRef.current = sock;

    // Listen for incoming messages
    const handleChatReceive = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    // Handle room ended
    const handleRoomEnded = () => {
      toast.error("The host ended the call");
      disconnectSocket();
      setTimeout(() => {
        router.push("/");
      }, 1500);
    };

    // Handle kicked by host
    const handleKicked = ({ targetUserId }: { targetUserId: string }) => {
      if (targetUserId === userId) {
        toast.error("You were removed from the room");
        disconnectSocket();
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    };

    // Handle muted by host
    const handleMuted = ({ targetUserId }: { targetUserId: string }) => {
      if (targetUserId === userId) {
        toast.warning("You were muted by the host");
        onMutedRef.current?.();
      }
    };

    // Handle host changed
    const handleHostChanged = ({
      newHostId,
      newHostName,
    }: {
      newHostId: string;
      newHostName: string;
    }) => {
      if (newHostId === userId) {
        toast.success("You are now the host");
        onHostChangedRef.current?.(true);
      } else {
        toast.info(`${newHostName} is now the host`);
        onHostChangedRef.current?.(false, newHostName);
      }
    };

    // Handle room lock changed
    const handleRoomLockChanged = ({ isLocked }: { isLocked: boolean }) => {
      onRoomLockChangedRef.current?.(isLocked);
    };

    sock.on("chat:receive", handleChatReceive);
    sock.on("room:ended", handleRoomEnded);
    sock.on("host:kicked", handleKicked);
    sock.on("host:muted", handleMuted);
    sock.on("host:changed", handleHostChanged);
    sock.on("room:lockChanged", handleRoomLockChanged);

    // Cleanup
    return () => {
      sock.off("chat:receive", handleChatReceive);
      sock.off("room:ended", handleRoomEnded);
      sock.off("host:kicked", handleKicked);
      sock.off("host:muted", handleMuted);
      sock.off("host:changed", handleHostChanged);
      sock.off("room:lockChanged", handleRoomLockChanged);
      // Do NOT disconnect socket here - it's managed globally
    };
  }, [roomCode, userId, userName, userAvatar, router]);

  const sendMessage = (content: string) => {
    if (socketRef.current && content.trim()) {
      socketRef.current.emit("chat:send", { content: content.trim() });
    }
  };

  return {
    messages,
    sendMessage,
  };
}
