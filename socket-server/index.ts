import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

// Health check endpoint for Railway/Docker
httpServer.on("request", (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
  }
});

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

// Track raised hands per room: roomCode → Set of userIds
const raisedHands = new Map<string, Set<string>>();

// Track connected users per room to prevent duplicate join messages
const connectedUsers = new Map<string, Set<string>>(); // roomCode → Set of userIds

io.on("connection", (socket) => {
  const { roomCode, userId, userName, userAvatar } = socket.handshake.auth;

  if (!roomCode || !userId) {
    socket.disconnect();
    return;
  }

  // Join the socket room
  socket.join(roomCode);

  // Init raised hands for this room if needed
  if (!raisedHands.has(roomCode)) {
    raisedHands.set(roomCode, new Set());
  }

  // Init connected users set
  if (!connectedUsers.has(roomCode)) {
    connectedUsers.set(roomCode, new Set());
  }

  const roomUsers = connectedUsers.get(roomCode)!;
  const isFirstConnection = !roomUsers.has(userId);

  // Add user to connected set
  roomUsers.add(userId);

  console.log(`[${roomCode}] ${userName} (${userId}) connected`);

  // Chỉ broadcast "joined" nếu đây là lần connect đầu tiên (tránh duplicate trong React Strict Mode)
  if (isFirstConnection) {
    socket.to(roomCode).emit("chat:receive", {
      id: crypto.randomUUID(),
      userId: null,
      userName: "System",
      userAvatar: null,
      content: `${userName} joined the room`,
      type: "SYSTEM",
      createdAt: new Date().toISOString(),
    });
  }

  // ── Chat ──────────────────────────────────────
  socket.on("chat:send", async (data: { content: string }) => {
    const message = {
      id: crypto.randomUUID(),
      userId,
      userName,
      userAvatar: userAvatar || null,
      content: data.content.trim(),
      type: "TEXT" as const,
      createdAt: new Date().toISOString(),
    };

    // Broadcast to everyone in room (including sender)
    io.to(roomCode).emit("chat:receive", message);

    // Persist to DB (fire and forget)
    // TODO: import prisma and save message
    // await prisma.message.create({ data: { roomId, userId, content, type: "TEXT" } })
  });

  // ── Reactions ─────────────────────────────────
  socket.on("reaction:send", (data: { emoji: string }) => {
    io.to(roomCode).emit("reaction:receive", {
      id: crypto.randomUUID(),
      emoji: data.emoji,
      userId,
      userName,
    });
  });

  // ── Raise Hand ────────────────────────────────
  socket.on("hand:raise", () => {
    raisedHands.get(roomCode)?.add(userId);
    io.to(roomCode).emit("hand:raised", { userId, userName });
  });

  socket.on("hand:lower", (data?: { targetUserId?: string }) => {
    // If targetUserId is provided, it's a host action to lower someone's hand
    const targetId = data?.targetUserId || userId;
    raisedHands.get(roomCode)?.delete(targetId);
    io.to(roomCode).emit("hand:lowered", { userId: targetId });
  });

  // ── Host Controls ─────────────────────────────
  socket.on("host:kick", (data: { targetUserId: string }) => {
    io.to(roomCode).emit("host:kicked", { targetUserId: data.targetUserId });
  });

  socket.on("host:mute", (data: { targetUserId: string }) => {
    io.to(roomCode).emit("host:muted", { targetUserId: data.targetUserId });
  });

  socket.on("host:end", () => {
    io.to(roomCode).emit("room:ended");
  });

  socket.on("host:transfer", (data: { newHostId: string; newHostName: string }) => {
    io.to(roomCode).emit("host:changed", data);
  });

  socket.on("host:lock", (data: { isLocked: boolean }) => {
    io.to(roomCode).emit("room:lockChanged", data);
  });

  // ── Disconnect ────────────────────────────────
  socket.on("disconnect", () => {
    raisedHands.get(roomCode)?.delete(userId);

    // Chỉ emit "left" message khi user thực sự disconnect (không còn socket nào)
    const roomSockets = io.sockets.adapter.rooms.get(roomCode);
    const stillInRoom = roomSockets && Array.from(roomSockets).some((socketId) => {
      const sock = io.sockets.sockets.get(socketId);
      return sock?.handshake.auth.userId === userId;
    });

    if (!stillInRoom) {
      // User thực sự rời room, xóa khỏi tracking
      connectedUsers.get(roomCode)?.delete(userId);

      console.log(`[${roomCode}] ${userName} (${userId}) disconnected`);

      socket.to(roomCode).emit("chat:receive", {
        id: crypto.randomUUID(),
        userId: null,
        userName: "System",
        userAvatar: null,
        content: `${userName} left the room`,
        type: "SYSTEM",
        createdAt: new Date().toISOString(),
      });

      socket.to(roomCode).emit("hand:lowered", { userId });
    }
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`✅ Socket.io server running on port ${PORT}`);
});
