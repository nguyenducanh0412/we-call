import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentRoomCode: string | null = null;

export function getSocket(auth: {
  roomCode: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
}): Socket {
  // Nếu đã có socket và đang trong cùng room → reuse
  if (socket && socket.connected && currentRoomCode === auth.roomCode) {
    return socket;
  }

  // Disconnect socket cũ nếu đổi room
  if (socket && currentRoomCode !== auth.roomCode) {
    socket.disconnect();
    socket = null;
  }

  // Tạo socket mới
  if (!socket || !socket.connected) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    socket = io(socketUrl, {
      auth,
      transports: ["websocket"],
      autoConnect: true,
    });
    currentRoomCode = auth.roomCode;
  }
  
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentRoomCode = null;
  }
}
