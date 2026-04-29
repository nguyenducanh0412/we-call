import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(auth: {
  roomCode: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
}): Socket {
  if (!socket || !socket.connected) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    socket = io(socketUrl, {
      auth,
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
