"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/hooks/useChat";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onClose: () => void;
}

export function ChatPanel({ messages, onSendMessage, onClose }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Check if messages should be grouped (same user within 60 seconds)
  const shouldGroupWithPrevious = (currentMsg: ChatMessage, index: number) => {
    if (index === 0 || currentMsg.type === "SYSTEM") return false;
    
    const prevMsg = messages[index - 1];
    if (prevMsg.type === "SYSTEM" || prevMsg.userId !== currentMsg.userId) return false;

    const timeDiff =
      new Date(currentMsg.createdAt).getTime() -
      new Date(prevMsg.createdAt).getTime();
    return timeDiff < 60000; // 60 seconds
  };

  return (
    <div className="w-80 h-full bg-zinc-900 border-l border-zinc-800 flex flex-col">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-zinc-800">
        <h3 className="text-white font-semibold">Chat</h3>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-zinc-500 text-sm mt-8">
            No messages yet. Start the conversation!
          </div>
        )}

        {messages.map((message, index) => {
          const grouped = shouldGroupWithPrevious(message, index);

          if (message.type === "SYSTEM") {
            return (
              <div key={message.id} className="text-center">
                <p className="text-zinc-500 text-xs italic">{message.content}</p>
              </div>
            );
          }

          return (
            <div key={message.id} className="flex gap-2">
              {!grouped && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.userAvatar || ""} alt={message.userName} />
                  <AvatarFallback className="text-xs">
                    {getInitials(message.userName)}
                  </AvatarFallback>
                </Avatar>
              )}
              
              {grouped && <div className="w-8 flex-shrink-0" />}

              <div className="flex-1 min-w-0">
                {!grouped && (
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-white text-sm font-semibold">
                      {message.userName}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                )}
                <p className="text-zinc-300 text-sm break-words">{message.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="h-14 px-3 py-2 border-t border-zinc-800 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 500))}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          className="flex-1 bg-zinc-800 text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={500}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim()}
          size="sm"
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
