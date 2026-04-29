"use client";

import { useEffect, useState } from "react";
import { useLocalParticipant, VideoTrack } from "@livekit/components-react";
import type { Participant } from "livekit-client";
import { Track } from "livekit-client";
import { Mic, MicOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ParticipantTileProps {
  participant: Participant;
}

export function ParticipantTile({ participant }: ParticipantTileProps) {
  const { localParticipant } = useLocalParticipant();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null,
  );
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );

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

  // Attach video track
  useEffect(() => {
    if (!videoElement) return;

    const attachVideoTrack = () => {
      const videoTrack = participant.getTrackPublication(
        Track.Source.Camera,
      )?.track;
      if (videoTrack) {
        videoTrack.attach(videoElement);
      }
    };

    const detachVideoTrack = () => {
      const videoTrack = participant.getTrackPublication(
        Track.Source.Camera,
      )?.track;
      if (videoTrack) {
        videoTrack.detach(videoElement);
      }
    };

    // Attach ngay nếu track đã có sẵn
    attachVideoTrack();

    // Listen for track events
    participant.on("trackSubscribed", attachVideoTrack);
    participant.on("trackUnsubscribed", detachVideoTrack);

    return () => {
      detachVideoTrack();
      participant.off("trackSubscribed", attachVideoTrack);
      participant.off("trackUnsubscribed", detachVideoTrack);
    };
  }, [participant, videoElement]);

  // Attach audio track (chỉ cho remote participants)
  useEffect(() => {
    if (isLocal || !audioElement) return;

    const attachAudioTrack = () => {
      const audioTrack = participant.getTrackPublication(
        Track.Source.Microphone,
      )?.track;
      if (audioTrack) {
        audioTrack.attach(audioElement);
      }
    };

    const detachAudioTrack = () => {
      const audioTrack = participant.getTrackPublication(
        Track.Source.Microphone,
      )?.track;
      if (audioTrack) {
        audioTrack.detach(audioElement);
      }
    };

    // Attach ngay nếu track đã có sẵn
    attachAudioTrack();

    // Listen for track events
    participant.on("trackSubscribed", attachAudioTrack);
    participant.on("trackUnsubscribed", detachAudioTrack);

    return () => {
      detachAudioTrack();
      participant.off("trackSubscribed", attachAudioTrack);
      participant.off("trackUnsubscribed", detachAudioTrack);
    };
  }, [participant, audioElement, isLocal]);

  const isCameraEnabled = participant.isCameraEnabled;
  const isMicrophoneEnabled = participant.isMicrophoneEnabled;
  const participantName = participant.name || participant.identity || "Unknown";

  return (
    <div
      className={`relative bg-zinc-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center ${
        isSpeaking ? "ring-2 ring-green-500" : ""
      }`}
    >
      {isCameraEnabled ? (
        <video
          ref={setVideoElement}
          className="w-full h-full object-cover scale-x-[-1]"
          autoPlay
          playsInline
          muted={isLocal}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatar} alt={participantName} />
            <AvatarFallback className="text-2xl">
              {getInitials(participantName)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Audio element (hidden) */}
      {!isLocal && (
        <audio ref={setAudioElement} autoPlay playsInline className="hidden" />
      )}

      {/* Name label */}
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-white text-sm">
        {isLocal ? `You (${participantName})` : participantName}
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
