"use client";

import { useEffect, useState } from "react";
import { useParticipants } from "@livekit/components-react";
import { Users, Clock, Copy, Lock, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface RoomHeaderProps {
  roomName: string;
  roomCode: string;
  isLocked?: boolean;
}

export function RoomHeader({ roomName, roomCode, isLocked = false }: RoomHeaderProps) {
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: roomName,
          text: `Join my video call: ${roomName}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error);
          toast.error("Failed to share");
        }
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center px-6">
      <div className="flex-1 flex items-center gap-3">
        <h1 className="text-white font-semibold text-lg">{roomName}</h1>
        <span className="text-zinc-400 text-sm">({roomCode})</span>
        {isLocked && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/20 text-yellow-500">
            <Lock className="h-3 w-3" />
            <span className="text-xs font-medium">Locked</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4 text-zinc-400 text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{participants.length}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{formatDuration(duration)}</span>
        </div>

        {/* Share button (mobile) */}
        <Button
          onClick={handleShare}
          variant="outline"
          size="sm"
          className="md:hidden"
          aria-label="Share link"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        
        {/* Copy link button (desktop) */}
        <Button
          onClick={handleCopyLink}
          variant="outline"
          size="sm"
          className="hidden md:flex gap-2 text-white"
          aria-label="Copy link"
        >
          <Copy className="h-4 w-4" />
          <span>Copy Link</span>
        </Button>
      </div>
    </header>
  );
}
