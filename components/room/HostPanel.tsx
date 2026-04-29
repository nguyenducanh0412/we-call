"use client";

import { useState } from "react";
import { X, Lock, Unlock, PhoneOff, Crown, Mic, UserX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface Participant {
  userId: string;
  userName: string;
  userAvatar?: string | null;
  isHost?: boolean;
}

interface RaisedHand {
  userId: string;
  userName: string;
}

interface HostPanelProps {
  currentUserId: string;
  participants: Participant[];
  raisedHands: RaisedHand[];
  isLocked: boolean;
  onClose: () => void;
  onKick: (userId: string, userName: string) => void;
  onMute: (userId: string, userName: string) => void;
  onEndCall: () => void;
  onTransferHost: (userId: string, userName: string) => void;
  onToggleLock: () => void;
  onLowerHand: (userId: string) => void;
}

export function HostPanel({
  currentUserId,
  participants,
  raisedHands,
  isLocked,
  onClose,
  onKick,
  onMute,
  onEndCall,
  onTransferHost,
  onToggleLock,
  onLowerHand,
}: HostPanelProps) {
  const [kickTarget, setKickTarget] = useState<Participant | null>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [transferTarget, setTransferTarget] = useState<Participant | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleKickConfirm = () => {
    if (kickTarget) {
      onKick(kickTarget.userId, kickTarget.userName);
      setKickTarget(null);
    }
  };

  const handleTransferConfirm = () => {
    if (transferTarget) {
      onTransferHost(transferTarget.userId, transferTarget.userName);
      setTransferTarget(null);
    }
  };

  return (
    <>
      <div className="w-72 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col">
        {/* Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            <h3 className="text-white font-semibold">Host Controls</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
            aria-label="Close host controls"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Room Controls */}
          <div className="space-y-2">
            {/* Lock Room */}
            <button
              onClick={onToggleLock}
              className="w-full flex items-center gap-3 px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              {isLocked ? (
                <Lock className="h-4 w-4 text-yellow-500" />
              ) : (
                <Unlock className="h-4 w-4 text-zinc-400" />
              )}
              <span className="text-white text-sm">
                {isLocked ? "Room Locked" : "Lock Room"}
              </span>
            </button>

            {/* End Call */}
            <button
              onClick={() => setShowEndDialog(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded bg-red-600 hover:bg-red-500 transition-colors"
            >
              <PhoneOff className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">End Call</span>
            </button>
          </div>

          {/* Raised Hands */}
          {raisedHands.length > 0 && (
            <div className="border-t border-zinc-800 pt-4">
              <h4 className="text-zinc-400 text-xs font-semibold mb-2 uppercase">
                Raised Hands ({raisedHands.length})
              </h4>
              <div className="space-y-2">
                {raisedHands.map((hand) => (
                  <div
                    key={hand.userId}
                    className="flex items-center gap-2 px-2 py-1 rounded bg-zinc-800"
                  >
                    <span className="text-lg">✋</span>
                    <span className="text-white text-sm flex-1">{hand.userName}</span>
                    <button
                      onClick={() => onLowerHand(hand.userId)}
                      className="text-zinc-400 hover:text-white text-xs"
                      aria-label={`Lower ${hand.userName}'s hand`}
                    >
                      Lower
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Participants */}
          <div className="border-t border-zinc-800 pt-4">
            <h4 className="text-zinc-400 text-xs font-semibold mb-2 uppercase">
              All Participants ({participants.length})
            </h4>
            <div className="space-y-2">
              {participants.map((participant) => {
                const isCurrentUser = participant.userId === currentUserId;
                const hasRaisedHand = raisedHands.some(
                  (h) => h.userId === participant.userId
                );

                return (
                  <div
                    key={participant.userId}
                    className="flex items-center gap-2 px-2 py-2 rounded bg-zinc-800"
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage
                        src={participant.userAvatar || ""}
                        alt={participant.userName}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(participant.userName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-white text-sm truncate">
                          {participant.userName}
                          {isCurrentUser && " (You)"}
                        </span>
                        {hasRaisedHand && <span className="text-sm">✋</span>}
                      </div>
                      {participant.isHost && (
                        <span className="text-yellow-500 text-xs font-medium">
                          HOST
                        </span>
                      )}
                    </div>

                    {/* Actions (not for current user) */}
                    {!isCurrentUser && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => onMute(participant.userId, participant.userName)}
                          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white"
                          aria-label={`Mute ${participant.userName}`}
                          title="Mute"
                        >
                          <Mic className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setKickTarget(participant)}
                          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-red-400"
                          aria-label={`Kick ${participant.userName}`}
                          title="Kick"
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </button>
                        {!participant.isHost && (
                          <button
                            onClick={() => setTransferTarget(participant)}
                            className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-yellow-400"
                            aria-label={`Make ${participant.userName} host`}
                            title="Make host"
                          >
                            <Crown className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Kick Confirmation Dialog */}
      <AlertDialog open={!!kickTarget} onOpenChange={() => setKickTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kick {kickTarget?.userName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This participant will be removed from the call. They can rejoin with the
              link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleKickConfirm}
              className="bg-red-600 hover:bg-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-zinc-900"
            >
              Kick
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Call Confirmation Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End call for everyone?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect all participants and end the room. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowEndDialog(false);
                onEndCall();
              }}
              className="bg-red-600 hover:bg-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-zinc-900"
            >
              End for all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Host Confirmation Dialog */}
      <AlertDialog
        open={!!transferTarget}
        onOpenChange={() => setTransferTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Make {transferTarget?.userName} the host?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer be the host and will lose host controls.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransferConfirm}
              className="bg-yellow-600 hover:bg-yellow-500 focus-visible:ring-yellow-500 focus-visible:ring-offset-zinc-900"
            >
              Transfer Host
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
