"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "./Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Video,
  Plus,
  Users,
  Clock,
  Sparkles,
  Copy,
  ArrowRight,
  Zap,
  Shield,
} from "lucide-react";

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
      toast.error(
        error instanceof Error ? error.message : "Failed to create room",
      );
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
      toast.error(
        error instanceof Error ? error.message : "Failed to join room",
      );
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <Navbar user={user} />

      <main className="relative z-10 container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">
              Welcome back, {user.name}!
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Ready to connect?
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Start a video call instantly or join an existing room
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto"
        >
          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <Video className="w-8 h-8 text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-white">HD Quality</div>
            <div className="text-sm text-slate-400">Crystal clear calls</div>
          </div>
          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <Zap className="w-8 h-8 text-violet-400 mb-2" />
            <div className="text-2xl font-bold text-white">Instant</div>
            <div className="text-sm text-slate-400">No waiting, join now</div>
          </div>
          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <Shield className="w-8 h-8 text-pink-400 mb-2" />
            <div className="text-2xl font-bold text-white">Secure</div>
            <div className="text-sm text-slate-400">End-to-end encrypted</div>
          </div>
        </motion.div>

        {/* Main Action Cards */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          {/* Create Room Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Create Room</h3>
                  <p className="text-sm text-slate-400">
                    Start a new video call
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-name" className="text-white">
                    Room Name
                  </Label>
                  <Input
                    id="room-name"
                    type="text"
                    placeholder="e.g. Team Standup"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    disabled={isCreating}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-xl"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5 mr-2" />
                      Create Room
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Join Room Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Join Room</h3>
                  <p className="text-sm text-slate-400">Enter a room code</p>
                </div>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-code" className="text-white">
                    Room Code
                  </Label>
                  <div className="relative">
                    <Input
                      id="room-code"
                      type="text"
                      placeholder="ABC123"
                      value={joinCode}
                      onChange={(e) =>
                        setJoinCode(e.target.value.toUpperCase())
                      }
                      maxLength={6}
                      disabled={isJoining}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500 uppercase text-center text-2xl font-mono tracking-widest"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-semibold rounded-xl"
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                      />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5 mr-2" />
                      Join Room
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-2 text-sm text-slate-400">
                  <Copy className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>Get the room code from your host to join their call</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Why WebCall?</h2>
            <p className="text-slate-400">
              Everything you need for seamless video calls
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Video,
                title: "HD Video & Audio",
                description: "Crystal clear quality powered by LiveKit",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Users,
                title: "Real-time Chat",
                description: "Stay connected with instant messaging",
                color: "from-violet-500 to-purple-500",
              },
              {
                icon: Sparkles,
                title: "Live Reactions",
                description: "Express yourself with emoji reactions",
                color: "from-pink-500 to-rose-500",
              },
              {
                icon: Clock,
                title: "No Time Limits",
                description: "Call as long as you need, no restrictions",
                color: "from-amber-500 to-orange-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
              >
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
