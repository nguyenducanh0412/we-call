"use client";

import { useEffect, useState } from "react";
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
}

export function useChat({
  roomCode,
  userId,
  userName,
  userAvatar,
  onMuted,
}: UseChatOptions) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const sock = getSocket({
      roomCode,
      userId,
      userName,
      userAvatar,
    });

    setSocket(sock);

    // Listen for incoming messages
    const handleChatReceive = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    // Handle room ended
    const handleRoomEnded = () => {
      toast.error("Room has been ended by the host");
      disconnectSocket();
      router.push("/");
    };

    // Handle kicked by host
    const handleKicked = ({ targetUserId }: { targetUserId: string }) => {
      if (targetUserId === userId) {
        toast.error("You have been removed from the room");
        disconnectSocket();
        router.push("/");
      }
    };

    // Handle muted by host
    const handleMuted = ({ targetUserId }: { targetUserId: string }) => {
      if (targetUserId === userId) {
        toast.warning("You have been muted by the host");
        onMuted?.();
      }
    };

    sock.on("chat:receive", handleChatReceive);
    sock.on("room:ended", handleRoomEnded);
    sock.on("host:kicked", handleKicked);
    sock.on("host:muted", handleMuted);

    // Cleanup
    return () => {
      sock.off("chat:receive", handleChatReceive);
      sock.off("room:ended", handleRoomEnded);
      sock.off("host:kicked", handleKicked);
      sock.off("host:muted", handleMuted);
      // Do NOT disconnect socket here - it's managed globally
    };
  }, [roomCode, userId, userName, userAvatar, router, onMuted]);

  const sendMessage = (content: string) => {
    if (socket && content.trim()) {
      socket.emit("chat:send", { content: content.trim() });
    }
  };

  return {
    messages,
    sendMessage,
  };
}
