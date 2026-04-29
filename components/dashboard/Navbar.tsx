"use client";

import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📞</span>
          <span className="text-xl font-semibold text-white">WebCall</span>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-zinc-300 hidden sm:inline">
            {user.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ redirectTo: "/login" })}
            aria-label="Sign out"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
