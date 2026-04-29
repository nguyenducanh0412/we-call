"use client";

import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Video, LogOut } from "lucide-react";
import { motion } from "framer-motion";

interface NavbarProps {
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

export function Navbar({ user }: NavbarProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            WebCall
          </span>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-white">{user.name}</span>
            <span className="text-xs text-slate-400">{user.email}</span>
          </div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Avatar className="h-10 w-10 ring-2 ring-blue-500/50">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-500 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ redirectTo: "/login" })}
            className="text-slate-300 hover:text-white hover:bg-white/10"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
