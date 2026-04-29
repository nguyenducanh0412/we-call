import { create } from "zustand";

export interface Message {
  id: string;
  userId: string | null;
  userName: string;
  userAvatar: string | null;
  content: string;
  type: "TEXT" | "SYSTEM";
  createdAt: string;
}

interface ChatStore {
  messages: Message[];
  unreadCount: number;
  isChatOpen: boolean;
  addMessage: (msg: Message) => void;
  markAllRead: () => void;
  toggleChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  unreadCount: 0,
  isChatOpen: false,
  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
      unreadCount: state.isChatOpen ? state.unreadCount : state.unreadCount + 1,
    })),
  markAllRead: () => set({ unreadCount: 0 }),
  toggleChat: () =>
    set((state) => ({
      isChatOpen: !state.isChatOpen,
      unreadCount: !state.isChatOpen ? 0 : state.unreadCount,
    })),
}));
