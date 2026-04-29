# Phase 5 — Host Controls, Polish & Deploy

> Paste into GitHub Copilot Chat (Agent mode).
> Prerequisites: Phase 4 complete, chat and reactions working.

---

## Task
Complete host controls, final UI polish, and deployment setup.

---

## Step 1 — Host Controls Hook

Create `hooks/useHostControls.ts`:
```ts
// Only active when isHost === true
// Expose:
//   kickParticipant(targetUserId: string) → emit "host:kick"
//   muteParticipant(targetUserId: string) → emit "host:mute"
//   endCall() → emit "host:end" → router.push("/") + update DB
//   transferHost(newHostId: string, newHostName: string) → emit "host:transfer"
//   toggleLock() → emit "host:lock" → PATCH /api/rooms/[code] to update isLocked in DB
```

---

## Step 2 — Host Panel UI

Create `components/room/HostPanel.tsx`:

Slide-in from left, `w-72 bg-zinc-900 border-r border-zinc-800`:
```
┌────────────────────────┐
│ 👥 Participants   [X]  │  ← header
├────────────────────────┤
│ 🔒 Lock Room  [toggle] │  ← room lock toggle switch
│ 🔴 End Call            │  ← red button with confirm dialog
├────────────────────────┤
│ Raised Hands (n)       │  ← section, only if hands > 0
│  [avatar] Name    [✓]  │  ← lower hand button
├────────────────────────┤
│ All Participants       │
│  [avatar] Name  HOST   │
│  [avatar] Name         │
│    [Mute] [Kick]       │  ← per-participant actions
│  [avatar] Name ✋      │  ← raised hand indicator
└────────────────────────┘
```

Details:
- Kick button: opens `AlertDialog` ("Kick [name]? They can rejoin with the link.")
  - Confirm → `kickParticipant(userId)` → toast "Kicked [name]"
- Mute button: no confirmation, instant → toast "[name] has been muted"
- End Call: `AlertDialog` → "End call for everyone?" → confirm → `endCall()`
- Lock toggle: switches `isLocked` → toast "Room locked" / "Room unlocked"
- Transfer host: long-press or right-click participant name → "Make host" option
- Don't show Kick/Mute for own tile

---

## Step 3 — Socket Event Handlers in useChat (complete them)

Ensure these are handled in `useChat.ts` or `useRoom.ts`:

```ts
// "room:ended" → show toast "The host ended the call" → router.push("/") after 1500ms

// "host:kicked" → if event.targetUserId === currentUserId:
//   disconnect from LiveKit
//   disconnectSocket()
//   show toast "You were removed from the room"
//   router.push("/") after 1500ms

// "host:muted" → if event.targetUserId === currentUserId:
//   localParticipant.setMicrophoneEnabled(false)
//   show toast "You were muted by the host"

// "host:changed" → if event.newHostId === currentUserId:
//   show toast "You are now the host"
//   update isHost in roomStore
// else:
//   show toast "[newHostName] is now the host"
//   update isHost = false in roomStore

// "room:lockChanged" → update isLocked in roomStore
```

---

## Step 4 — Room API Update Endpoint

Add to `app/api/rooms/[code]/route.ts`:

```
PATCH /api/rooms/[code]
Body: { isLocked?: boolean, endedAt?: Date }
```
- Auth required — only host can call this (verify session.user.id === room.hostId)
- Partial update via Prisma

---

## Step 5 — UI Polish Pass

Apply these improvements across all components:

**Loading States:**
- Dashboard: skeleton loader while creating/joining room
- Room page: full-screen skeleton while fetching token with "Joining [Room Name]..." text
- Participant tiles: `<Skeleton>` while video track is loading

**Empty States:**
- Chat panel with no messages: centered icon + "No messages yet. Say hello! 👋"
- No participants (impossible but): "Waiting for others to join..."

**Animations (Framer Motion):**
- Chat panel slide-in: `x: 320 → 0`, spring animation
- Host panel slide-in: `x: -288 → 0`, spring animation
- Participant tile enter: `scale: 0.8, opacity: 0 → 1`, duration 0.2s
- Toast for join/leave events (use sonner's built-in, position: bottom-left)

**Responsive Tweaks:**
- On mobile (< 768px): hide participant sidebar, chat takes full width
- Control bar buttons: smaller on mobile (`w-10 h-10`)
- Participant grid: max 2 cols on mobile

**Keyboard Shortcuts:**
- `Space` → toggle mic (when not typing in chat)
- `V` → toggle camera
- `C` → toggle chat
- `Escape` → close any open panel

Add a keyboard shortcut hint: small tooltip on hover for each control button.

---

## Step 6 — Copy/Share Room Link

Add to Room Header:
- "Copy Link" button → copies `window.location.href` to clipboard → sonner toast "Link copied!"
- "Invite" button (mobile) → uses Web Share API if available

---

## Step 7 — Deployment Setup

### Vercel (Next.js app)
Create `vercel.json` at root:
```json
{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs"
}
```

Add all env vars in Vercel dashboard.

### Railway (Socket.io server)
Create `socket-server/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

Create `socket-server/railway.json`:
```json
{
  "build": { "builder": "DOCKERFILE" },
  "deploy": { "startCommand": "node dist/index.js", "healthcheckPath": "/" }
}
```

Add a basic health check to socket server:
```ts
httpServer.on("request", (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200);
    res.end("OK");
  }
});
```

### Environment Variable Checklist
Verify all these are set in Vercel:
- [ ] DATABASE_URL (from Railway PostgreSQL or Supabase)
- [ ] NEXTAUTH_SECRET (generate: `openssl rand -base64 32`)
- [ ] NEXTAUTH_URL (your Vercel URL)
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] LIVEKIT_URL
- [ ] LIVEKIT_API_KEY
- [ ] LIVEKIT_API_SECRET
- [ ] NEXT_PUBLIC_LIVEKIT_URL
- [ ] NEXT_PUBLIC_SOCKET_URL (your Railway socket server URL)

Update Google OAuth credentials in Google Console:
- Add Vercel URL to Authorized JavaScript Origins
- Add `[vercel-url]/api/auth/callback/google` to Authorized Redirect URIs

---

## Step 8 — README

Create `README.md` at root:
```md
# WebCall

Real-time video/audio calling with chat and reactions.

## Features
- Google OAuth login
- Create/join rooms with shareable codes
- Audio + video calls (LiveKit)
- Real-time text chat
- Emoji reactions
- Host controls: kick, mute, end call, lock room, transfer host

## Local Development
1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in values
3. `npm install && cd socket-server && npm install && cd ..`
4. `npx prisma db push`
5. `npm run dev:all`

## Deploy
- Frontend: Vercel
- Socket server: Railway
- Database: Railway PostgreSQL or Supabase
- Video: LiveKit Cloud (free tier available)
```

---

## Final Acceptance Criteria
- [ ] Host can mute any participant (they receive a toast and are auto-muted)
- [ ] Host can kick a participant (they see toast and are redirected to home)
- [ ] Host can end the call (everyone is redirected with a toast)
- [ ] Host can lock/unlock room (visible in header)
- [ ] Host can transfer host role (new host sees updated UI)
- [ ] Raised hands appear in host panel with option to lower
- [ ] Space/V/C keyboard shortcuts work when not in chat input
- [ ] Copy link button copies shareable URL
- [ ] App deploys to Vercel without build errors
- [ ] Socket server deploys to Railway and stays connected
- [ ] Full flow works: login → create room → share link → join → chat → react → end call
```
