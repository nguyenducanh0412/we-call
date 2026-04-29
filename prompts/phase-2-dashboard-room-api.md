# Phase 2 — Dashboard & Room Management API

> Paste into GitHub Copilot Chat (Agent mode).
> Prerequisites: Phase 1 complete, user can log in successfully.

---

## Task
Build the home dashboard (create/join room) and all Room API endpoints.

---

## Step 1 — Room API Routes

### `app/api/rooms/route.ts` — Create Room
```
POST /api/rooms
Body: { name: string }
```
Logic:
1. Get session via `auth()` — return 401 if not logged in
2. Generate unique 6-char uppercase code (letters + numbers, e.g. "XK9P2Q")
   - Helper function `generateCode()`: random 6 chars from "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
   - Check DB for collision, retry up to 5 times
3. Create `Room` with: name, code, hostId = session.user.id
4. Create `RoomSession` with: roomId, userId, role = "HOST"
5. Return `{ room: { id, name, code } }` with status 201

### `app/api/rooms/[code]/route.ts` — Get Room
```
GET /api/rooms/[code]
```
Logic:
1. Get session — 401 if not logged in
2. Find room by code — 404 if not found
3. If room.endedAt is not null — return `{ ended: true }`
4. Return `{ room: { id, name, code, hostId, isLocked } }`

---

## Step 2 — Zustand Stores

Create `store/roomStore.ts`:
```ts
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
```

Create `store/chatStore.ts`:
```ts
interface Message {
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
```

---

## Step 3 — Dashboard Page

Create `app/page.tsx` as a Server Component:
- Fetch session with `auth()` — redirect to /login if null
- Render `<Dashboard user={session.user} />`

Create `components/dashboard/Dashboard.tsx` (client component):

Layout (dark, centered, `min-h-screen bg-zinc-950`):
```
[Navbar]
  Left: "WebCall" wordmark in white
  Right: User avatar + name + logout button (small ghost button)

[Main Content — centered, max-w-md, mt-24]
  Heading: "Start or join a call"
  Subtext: "No downloads. No sign-ups for guests."

  [Create Room Card]
    Label: "Create a new room"
    Input: Room name (placeholder: "e.g. Design Review")
    Button: "Create Room" (full width, primary)
    On submit → POST /api/rooms → redirect to /room/[code]

  Divider: "or"

  [Join Room Card]
    Label: "Join with a code"
    Input: 6-char code (placeholder: "e.g. XK9P2Q", auto-uppercase)
    Button: "Join Room" (full width, outline)
    On submit → GET /api/rooms/[code] → if valid, redirect to /room/[code]
```

UX details:
- Both cards use shadcn `Card` with `CardContent`
- Loading spinner inside buttons during API calls
- Toast error if: room not found, name too short (< 2 chars), code wrong format
- Input auto-trims whitespace, code input auto-uppercases on change

---

## Step 4 — Navbar Component

Create `components/dashboard/Navbar.tsx`:
- Fixed top, `bg-zinc-950/80 backdrop-blur border-b border-zinc-800`
- Left: "📞 WebCall" (emoji + text, text-xl font-semibold text-white)
- Right: shadcn `Avatar` (user photo), user name, logout `Button` variant ghost
- Logout calls NextAuth `signOut({ redirectTo: "/login" })`

---

## Step 5 — Room Not Found Page

Create `app/room/[code]/not-found.tsx`:
- Centered message: "Room not found or has ended"
- Button: "Back to Home" → href="/"

---

## Acceptance Criteria
- [ ] Dashboard loads after login showing user avatar in navbar
- [ ] Creating a room with a name → redirected to `/room/[code]` URL (page can be blank for now)
- [ ] Creating a room with empty name shows a toast error
- [ ] Joining with a valid code → redirected to `/room/[code]`
- [ ] Joining with an invalid code shows "Room not found" toast
- [ ] Room + RoomSession records appear in DB after creation
- [ ] Logout button returns to `/login`
