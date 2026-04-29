"use client";

import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Video, Sparkles, Shield, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const features = [
    {
      icon: Video,
      title: "HD Video Calls",
      description: "Crystal clear video quality powered by LiveKit",
    },
    {
      icon: Zap,
      title: "Instant Rooms",
      description: "Create and join calls in seconds, no setup needed",
    },
    {
      icon: Sparkles,
      title: "Live Reactions",
      description: "Express yourself with real-time emoji reactions",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encrypted connections",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-violet-500/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">Now with AI-powered features</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                WebCall
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300">
              Real-time video calls,{" "}
              <span className="text-blue-400 font-semibold">zero friction</span>
            </p>

            <p className="text-slate-400 text-lg max-w-lg mx-auto lg:mx-0">
              Join millions connecting face-to-face. Create instant video rooms, 
              chat in real-time, and collaborate seamlessly.
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <feature.icon className="w-6 h-6 text-blue-400 mb-2" />
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Login card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-md">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative group"
              >
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                
                {/* Card */}
                <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                  {/* Logo */}
                  <motion.div
                    className="flex justify-center mb-6"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
                      <Video className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                  </motion.div>

                  <h2 className="text-3xl font-bold text-center mb-2 text-white">
                    Welcome back
                  </h2>
                  <p className="text-center text-slate-400 mb-8">
                    Sign in to start your next call
                  </p>

                  {/* Google Sign In Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => signIn("google", { callbackUrl: "/" })}
                      className="w-full h-12 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                      aria-label="Sign in with Google"
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </motion.div>

                  <div className="mt-6 text-center">
                    <p className="text-xs text-slate-500">
                      By signing in, you agree to our{" "}
                      <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                        Terms of Service
                      </a>
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 grid grid-cols-3 gap-4 text-center"
              >
                <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-blue-400">10K+</div>
                  <div className="text-xs text-slate-400">Active Users</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-violet-400">50K+</div>
                  <div className="text-xs text-slate-400">Calls Daily</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-pink-400">99.9%</div>
                  <div className="text-xs text-slate-400">Uptime</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
