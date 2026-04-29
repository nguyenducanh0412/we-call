# Phase 3 — LiveKit Integration & In-Call UI

> Paste into GitHub Copilot Chat (Agent mode).
> Prerequisites: Phase 2 complete. LiveKit Cloud account created at livekit.io.
> Add LIVEKIT_* env vars before starting.

---

## Task
Build the complete in-call page with audio/video using LiveKit SDK.

---

## Step 1 — LiveKit Token API

Create `lib/livekit.ts`:
```ts
import { AccessToken } from "livekit-server-sdk";

export async function generateLiveKitToken(
  roomCode: string,
  userId: string,
  userName: string,
  userAvatar: string | null
): Promise<string> {
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: userId,
      name: userName,
      metadata: JSON.stringify({ avatar: userAvatar }),
      ttl: "4h",
    }
  );

  token.addGrant({
    roomJoin: true,
    room: roomCode,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return token.toJwt();
}
```

Create `app/api/livekit/token/route.ts`:
```
GET /api/livekit/token?room=[code]
```
Logic:
1. `auth()` — 401 if not logged in
2. Validate `room` query param — 400 if missing
3. Check room exists in DB — 404 if not found, 410 if ended
4. Call `generateLiveKitToken(code, userId, userName, userAvatar)`
5. Return `{ token }`

---

## Step 2 — In-Call Page Shell

Create `app/room/[code]/page.tsx` as a Server Component:
1. `auth()` — redirect to /login if no session
2. Fetch room from DB by code — `notFound()` if missing or ended
3. Determine `isHost`: `room.hostId === session.user.id`
4. Pass `{ room, user, isHost }` to `<RoomPage>` client component

Create `app/room/[code]/RoomPage.tsx` (client component):
```
State:
  - token: string | null (fetched on mount)
  - isConnecting: boolean

On mount:
  1. fetch(`/api/livekit/token?room=${code}`)
  2. Set token in state

Render:
  if (!token) → full screen loading skeleton with "Connecting..." text
  if (token)  → <LiveKitRoom> wrapper
```

`<LiveKitRoom>` setup:
```tsx
import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";

<LiveKitRoom
  serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
  token={token}
  connect={true}
  audio={true}
  video={true}
  onDisconnected={() => router.push("/")}
>
  <RoomLayout isHost={isHost} room={room} user={user} />
</LiveKitRoom>
```

---

## Step 3 — Room Layout

Create `components/room/RoomLayout.tsx` (client):
```
Full viewport layout (h-screen, overflow-hidden, bg-zinc-950, flex flex-col):

┌─────────────────────────────────────┐
│         RoomHeader (h-12)           │
├──────────────────────┬──────────────┤
│                      │              │
│   ParticipantGrid    │  ChatPanel   │
│   (flex-1)           │  (w-80)      │
│                      │  (if open)   │
├──────────────────────┴──────────────┤
│         ControlBar (h-20)           │
└─────────────────────────────────────┘
```

Create `components/room/RoomHeader.tsx`:
- Room name (left)
- Participant count (center) — use `useParticipants()` hook
- Timer showing call duration (right) — tick every second from mount

---

## Step 4 — Participant Grid

Create `components/room/ParticipantGrid.tsx`:
```ts
import { useParticipants } from "@livekit/components-react";

// Grid column logic:
// 1 participant  → grid-cols-1
// 2             → grid-cols-2
// 3-4           → grid-cols-2
// 5-9           → grid-cols-3
// 10+           → grid-cols-4
```

Create `components/room/ParticipantTile.tsx`:
- Shows `<VideoTrack>` if camera is on, else shows `<Avatar>` (initial or photo from metadata)
- Name label bottom-left
- Mic icon bottom-right (muted = red mic-off icon, active = green mic icon)
- Speaking indicator: `useSpeakingParticipant()` — add `ring-2 ring-green-500` border when speaking
- Self tile: label says "You (name)"

---

## Step 5 — Control Bar

Create `components/room/ControlBar.tsx` (client):

```
Fixed bottom bar: bg-zinc-900/80 backdrop-blur border-t border-zinc-800
Height: h-20, flex items-center justify-center gap-3

Buttons (left to right):
1. Mic toggle     — useLocalParticipant().localParticipant.setMicrophoneEnabled()
2. Camera toggle  — useLocalParticipant().localParticipant.setCameraEnabled()
3. Chat toggle    — opens ChatPanel, shows unread badge
4. Reactions      — opens emoji picker popover (step built in Phase 4)
5. Participants   — opens ParticipantList sidebar
6. Leave/End      — red button
   - If host: "End for all" with confirmation dialog
   - If guest: "Leave" directly
   - On leave: disconnect from LiveKit → router.push("/")
```

Button design:
- Circular buttons, `w-12 h-12`, `bg-zinc-800 hover:bg-zinc-700`
- Active state (muted / cam off): `bg-red-600 hover:bg-red-500`
- Icons: lucide-react (Mic, MicOff, Video, VideoOff, MessageSquare, Smile, Users, PhoneOff)

---

## Step 6 — Participant List Sidebar

Create `components/room/ParticipantList.tsx`:
- Slide-in panel from right, `w-72 bg-zinc-900 border-l border-zinc-800`
- Header: "Participants (n)"
- Each entry: Avatar + name + mic/cam status icons + "HOST" badge if applicable
- Close button top-right

---

## Step 7 — Device Selector

Add device selector to ControlBar (small settings icon):
- Use LiveKit's `MediaDeviceMenu` component for mic/camera/speaker selection
- Renders as a popover above the control bar

---

## Acceptance Criteria
- [ ] Navigating to `/room/[code]` shows "Connecting..." then the call UI
- [ ] Own video/audio tile appears in the grid
- [ ] Mic and camera toggle buttons work, tile updates accordingly
- [ ] Speaking indicator (green ring) activates when talking
- [ ] Participant count in header updates as people join/leave
- [ ] Timer increments every second
- [ ] Leave button returns to `/`
- [ ] Grid layout adjusts columns for 1, 2, 4, 6 participants
- [ ] All controls have aria-labels
