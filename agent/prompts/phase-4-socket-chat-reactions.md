# Phase 4 — Socket.io Server, Chat & Reactions

> Paste into GitHub Copilot Chat (Agent mode).
> Prerequisites: Phase 3 complete, call UI working.
> This phase adds the standalone Socket.io server + real-time chat + emoji reactions.

---

## Task
Build the real-time Socket.io server and wire up chat + reactions in the UI.

---

## Step 1 — Standalone Socket.io Server

Create a separate folder `socket-server/` at project root.

Create `socket-server/package.json`:
```json
{
  "name": "webcall-socket-server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "dev": "npx ts-node --esm index.ts",
    "build": "npx tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "socket.io": "^4.7.0",
    "cors": "^2.8.5",
    "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0",
    "@types/node": "^20.0.0",
    "@types/cors": "^2.8.0"
  }
}
```

Create `socket-server/index.ts`:

```ts
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Track raised hands per room: roomCode → Set of userIds
const raisedHands = new Map<string, Set<string>>();

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

  // Broadcast system message: user joined
  socket.to(roomCode).emit("chat:receive", {
    id: crypto.randomUUID(),
    userId: null,
    userName: "System",
    userAvatar: null,
    content: `${userName} joined the room`,
    type: "SYSTEM",
    createdAt: new Date().toISOString(),
  });

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

  socket.on("hand:lower", () => {
    raisedHands.get(roomCode)?.delete(userId);
    io.to(roomCode).emit("hand:lowered", { userId });
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
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
```

---

## Step 2 — Socket Client Singleton

Create `lib/socket.ts`:
```ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(auth: {
  roomCode: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
}): Socket {
  if (!socket || !socket.connected) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
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
```

---

## Step 3 — Chat Hook

Create `hooks/useChat.ts`:
```ts
// Initialize socket on mount with user auth
// Listen for "chat:receive" events → chatStore.addMessage()
// Expose sendMessage(content: string) → emit "chat:send"
// On unmount: remove listeners (do NOT disconnect socket here)
// Handle "room:ended" → router.push("/")
// Handle "host:kicked" with targetUserId → if match, show toast + disconnect
// Handle "host:muted" with targetUserId → if match, mute local mic via LiveKit
```

---

## Step 4 — Reactions Hook

Create `hooks/useReactions.ts`:
```ts
interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
}

// State: activeReactions: Reaction[]
// Listen for "reaction:receive" → add to activeReactions
// Each reaction auto-removes after 3000ms
// Expose: sendReaction(emoji: string), activeReactions
// Also handle: hand:raised, hand:lowered → maintain raisedHands: { userId, userName }[]
```

---

## Step 5 — Chat Panel UI

Create `components/room/ChatPanel.tsx`:

Layout (fixed right side, `w-80 h-full bg-zinc-900 border-l border-zinc-800 flex flex-col`):
```
┌────────────────────────┐
│ Chat  [X close]        │  ← header h-12, border-b
├────────────────────────┤
│                        │
│   messages list        │  ← flex-1, overflow-y-auto, p-3
│   (reverse scroll)     │    auto-scrolls to bottom
│                        │
├────────────────────────┤
│ [input text........]   │  ← h-14, border-t
│ [Send]                 │    press Enter or click
└────────────────────────┘
```

Message rendering:
- **TEXT message**: Avatar + name (bold) + timestamp + content
- **SYSTEM message**: Centered, text-zinc-500 italic, no avatar ("X joined the room")
- Messages grouped if same user within 60 seconds (hide repeated avatar/name)

Input:
- `<input>` with placeholder "Message..."
- Max 500 chars
- Disabled when content is empty
- Submit on Enter (not Shift+Enter which adds newline)

---

## Step 6 — Reaction Overlay UI

Create `components/room/ReactionOverlay.tsx`:

```tsx
// Renders absolutely over the entire call area (pointer-events-none)
// For each activeReaction in useReactions():
//   - Animate with Framer Motion:
//     initial: { opacity: 1, y: 0, x: randomOffset(-40 to +40) }
//     animate: { opacity: 0, y: -200 }
//     transition: { duration: 2.5, ease: "easeOut" }
//   - Position: bottom-24 (above control bar), centered
//   - Font size: text-4xl
//   - Each reaction has unique key (reaction.id)
```

---

## Step 7 — Emoji Picker in ControlBar

Add to `ControlBar.tsx`:
```tsx
// Popover above the Reactions button
// 5 emoji buttons in a row: 👍 ❤️ 😂 😮 👏
// On click: sendReaction(emoji) from useReactions()
// Popover closes after selection

// Raise Hand button: separate from reactions
// Toggle: if already raised → lower, else raise
// When hand is raised: button has bg-yellow-500
// Send hand:raise or hand:lower via socket
```

---

## Step 8 — Wire Everything into RoomLayout

Update `components/room/RoomLayout.tsx`:
- Initialize `useChat()` and `useReactions()` at layout level
- Pass `sendMessage` and `messages` to `<ChatPanel>`
- Pass `activeReactions` to `<ReactionOverlay>`
- Pass `sendReaction` and `raisedHands` to `<ControlBar>`
- Render `<ReactionOverlay>` absolutely positioned over the grid

---

## Step 9 — Add to package.json scripts

In root `package.json`, add:
```json
"scripts": {
  "socket": "cd socket-server && npm run dev",
  "dev:all": "concurrently \"npm run dev\" \"npm run socket\""
}
```

Install concurrently: `npm install concurrently --save-dev`

---

## Acceptance Criteria
- [ ] Socket server starts on port 3001 with `npm run socket`
- [ ] "X joined the room" system message appears in chat when user enters
- [ ] "X left the room" appears when user leaves
- [ ] Chat messages send and appear in real-time for all participants
- [ ] Emoji reactions float up and fade out after ~2.5 seconds
- [ ] Multiple reactions stack with slight horizontal variation
- [ ] Raise hand button turns yellow, hand icon appears on participant's tile
- [ ] Unread chat badge appears on chat button when panel is closed
- [ ] Badge disappears when chat panel is opened
- [ ] Pressing Enter sends a chat message
