"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "./Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export function Dashboard({ user }: DashboardProps) {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = roomName.trim();
    if (trimmedName.length < 2) {
      toast.error("Room name must be at least 2 characters");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create room");
      }

      toast.success(`Room "${data.room.name}" created!`);
      router.push(`/room/${data.room.code}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCode = joinCode.trim().toUpperCase();
    if (trimmedCode.length !== 6) {
      toast.error("Room code must be 6 characters");
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch(`/api/rooms/${trimmedCode}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Room not found");
        } else {
          throw new Error(data.error || "Failed to join room");
        }
        return;
      }

      if (data.ended) {
        toast.error("This room has ended");
        return;
      }

      toast.success("Joining room...");
      router.push(`/room/${trimmedCode}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar user={user} />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">
              Start or join a call
            </h1>
            <p className="text-zinc-400">
              No downloads. No sign-ups for guests.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">Create a new room</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-name">Room name</Label>
                  <Input
                    id="room-name"
                    type="text"
                    placeholder="e.g. Design Review"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCreating ? "Creating..." : "Create Room"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-500">or</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">Join with a code</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-code">Room code</Label>
                  <Input
                    id="room-code"
                    type="text"
                    placeholder="e.g. XK9P2Q"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    disabled={isJoining}
                    className="uppercase"
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={isJoining}
                >
                  {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isJoining ? "Joining..." : "Join Room"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
