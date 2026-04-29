"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Users,
  PhoneOff,
  Smile,
  Hand,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ControlBarProps {
  isHost: boolean;
  isChatOpen: boolean;
  onChatToggle: () => void;
  isParticipantsOpen: boolean;
  onParticipantsToggle: () => void;
  onSendReaction?: (emoji: string) => void;
  isHandRaised?: boolean;
  onToggleHand?: () => void;
  unreadCount?: number;
}

export function ControlBar({
  isHost,
  isChatOpen,
  onChatToggle,
  isParticipantsOpen,
  onParticipantsToggle,
  onSendReaction,
  isHandRaised = false,
  onToggleHand,
  unreadCount = 0,
}: ControlBarProps) {
  const router = useRouter();
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  const emojis = ["👍", "❤️", "😂", "😮", "👏"];

  const toggleMic = async () => {
    const enabled = await localParticipant.setMicrophoneEnabled(!isMuted);
    setIsMuted(!enabled);
  };

  const toggleCamera = async () => {
    const enabled = await localParticipant.setCameraEnabled(!isCamOff);
    setIsCamOff(!enabled);
  };

  const handleReactionClick = (emoji: string) => {
    onSendReaction?.(emoji);
    setShowEmojiPicker(false);
  };

  const handleLeave = () => {
    if (isHost) {
      setShowEndDialog(true);
    } else {
      room.disconnect();
      router.push("/");
    }
  };

  const handleEndForAll = async () => {
    // In Phase 5, we'll add API call to end room for all
    // For now, just disconnect
    room.disconnect();
    router.push("/");
  };

  return (
    <>
      <div className="h-20 bg-zinc-900/80 backdrop-blur border-t border-zinc-800 flex items-center justify-center gap-3 px-6">
        {/* Mic toggle */}
        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isMuted
              ? "bg-red-600 hover:bg-red-500"
              : "bg-zinc-800 hover:bg-zinc-700"
          }`}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? (
            <MicOff className="h-5 w-5 text-white" />
          ) : (
            <Mic className="h-5 w-5 text-white" />
          )}
        </button>

        {/* Camera toggle */}
        <button
          onClick={toggleCamera}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isCamOff
              ? "bg-red-600 hover:bg-red-500"
              : "bg-zinc-800 hover:bg-zinc-700"
          }`}
          aria-label={isCamOff ? "Turn on camera" : "Turn off camera"}
        >
          {isCamOff ? (
            <VideoOff className="h-5 w-5 text-white" />
          ) : (
            <Video className="h-5 w-5 text-white" />
          )}
        </button>

        {/* Chat toggle */}
        <button
          onClick={onChatToggle}
          className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isChatOpen
              ? "bg-blue-600 hover:bg-blue-500"
              : "bg-zinc-800 hover:bg-zinc-700"
          }`}
          aria-label="Toggle chat"
        >
          <MessageSquare className="h-5 w-5 text-white" />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Emoji reactions */}
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <button
              className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-zinc-800 hover:bg-zinc-700"
              aria-label="Send reaction"
            >
              <Smile className="h-5 w-5 text-white" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 bg-zinc-800 border-zinc-700">
            <div className="flex gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform"
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Raise hand */}
        <button
          onClick={onToggleHand}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isHandRaised
              ? "bg-yellow-500 hover:bg-yellow-400"
              : "bg-zinc-800 hover:bg-zinc-700"
          }`}
          aria-label={isHandRaised ? "Lower hand" : "Raise hand"}
        >
          <Hand className="h-5 w-5 text-white" />
        </button>

        {/* Participants toggle */}
        <button
          onClick={onParticipantsToggle}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isParticipantsOpen
              ? "bg-blue-600 hover:bg-blue-500"
              : "bg-zinc-800 hover:bg-zinc-700"
          }`}
          aria-label="Toggle participants list"
        >
          <Users className="h-5 w-5 text-white" />
        </button>

        <div className="flex-1" />

        {/* Leave/End button */}
        <button
          onClick={handleLeave}
          className="px-6 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white font-medium flex items-center gap-2 transition-colors"
          aria-label={isHost ? "End call for all" : "Leave call"}
        >
          <PhoneOff className="h-5 w-5" />
          {isHost ? "End" : "Leave"}
        </button>
      </div>

      {/* End call confirmation dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End call for everyone?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect all participants and end the room. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndForAll}
              className="bg-red-600 hover:bg-red-500"
            >
              End for all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
