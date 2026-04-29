"use client";

import { useEffect, useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import type { Participant, Track } from "livekit-client";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ParticipantTileProps {
  participant: Participant;
}

export function ParticipantTile({ participant }: ParticipantTileProps) {
  const { localParticipant } = useLocalParticipant();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoTrack, setVideoTrack] = useState<Track | null>(null);

  const isLocal = participant.identity === localParticipant.identity;

  // Get avatar from metadata
  const metadata = participant.metadata
    ? JSON.parse(participant.metadata)
    : null;
  const avatar = metadata?.avatar || null;

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Listen for speaking events
  useEffect(() => {
    const handleSpeakingChanged = (speaking: boolean) => {
      setIsSpeaking(speaking);
    };

    participant.on("isSpeakingChanged", handleSpeakingChanged);

    return () => {
      participant.off("isSpeakingChanged", handleSpeakingChanged);
    };
  }, [participant]);

  // Listen for track changes
  useEffect(() => {
    const updateVideoTrack = () => {
      const track = participant.videoTrackPublications.values().next().value;
      setVideoTrack(track?.track || null);
    };

    updateVideoTrack();
    participant.on("trackPublished", updateVideoTrack);
    participant.on("trackUnpublished", updateVideoTrack);

    return () => {
      participant.off("trackPublished", updateVideoTrack);
      participant.off("trackUnpublished", updateVideoTrack);
    };
  }, [participant]);

  // Attach video element
  useEffect(() => {
    if (videoTrack) {
      const videoElement = document.getElementById(
        `video-${participant.identity}`
      ) as HTMLVideoElement;
      if (videoElement) {
        videoTrack.attach(videoElement);
        return () => {
          videoTrack.detach(videoElement);
        };
      }
    }
  }, [videoTrack, participant.identity]);

  const isCameraEnabled = participant.isCameraEnabled;
  const isMicrophoneEnabled = participant.isMicrophoneEnabled;

  return (
    <div
      className={`relative bg-zinc-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center ${
        isSpeaking ? "ring-2 ring-green-500" : ""
      }`}
    >
      {isCameraEnabled && videoTrack ? (
        <video
          id={`video-${participant.identity}`}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={isLocal}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatar} alt={participant.name || "User"} />
            <AvatarFallback className="text-2xl">
              {getInitials(participant.name || "User")}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Name label */}
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-white text-sm">
        {isLocal ? `You (${participant.name})` : participant.name}
      </div>

      {/* Mic status */}
      <div className="absolute bottom-2 right-2">
        {isMicrophoneEnabled ? (
          <div className="bg-green-600 rounded-full p-1.5">
            <Mic className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="bg-red-600 rounded-full p-1.5">
            <MicOff className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
