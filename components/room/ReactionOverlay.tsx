"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Reaction } from "@/hooks/useReactions";

interface ReactionOverlayProps {
  reactions: Reaction[];
}

export function ReactionOverlay({ reactions }: ReactionOverlayProps) {
  // Generate random horizontal offset for each reaction
  const getRandomOffset = () => {
    return Math.random() * 80 - 40; // Random between -40 and +40
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-24 overflow-hidden">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{
              opacity: 1,
              y: 0,
              x: getRandomOffset(),
            }}
            animate={{
              opacity: 0,
              y: -200,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 2.5,
              ease: "easeOut",
            }}
            className="absolute text-4xl"
          >
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
