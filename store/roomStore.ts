import { create } from "zustand";

interface RoomStore {
  roomCode: string | null;
  roomName: string | null;
  isHost: boolean;
  isMuted: boolean;
  isCamOff: boolean;
  isLocked: boolean;
  setRoom: (code: string, name: string, isHost: boolean) => void;
  toggleMute: () => void;
  toggleCam: () => void;
  setLocked: (locked: boolean) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomCode: null,
  roomName: null,
  isHost: false,
  isMuted: false,
  isCamOff: false,
  isLocked: false,
  setRoom: (code, name, isHost) =>
    set({ roomCode: code, roomName: name, isHost }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleCam: () => set((state) => ({ isCamOff: !state.isCamOff })),
  setLocked: (locked) => set({ isLocked: locked }),
  reset: () =>
    set({
      roomCode: null,
      roomName: null,
      isHost: false,
      isMuted: false,
      isCamOff: false,
      isLocked: false,
    }),
}));
