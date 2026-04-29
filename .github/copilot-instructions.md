# WebCall — Copilot Agent Global Instructions

> This file is always loaded by GitHub Copilot Agent. It defines the project-wide rules,
> tech stack, and conventions. Every phase prompt inherits these rules automatically.

---

## Project Overview
A real-time audio/video calling web app (side project).
Core features: create/join rooms, audio+video call, text chat, emoji reactions, host controls.

---

## Tech Stack (never deviate)
- **Framework**: Next.js 14, App Router, TypeScript strict mode
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: NextAuth.js v5, Google OAuth only
- **Video/Audio**: LiveKit SDK (`livekit-client` + `@livekit/components-react`)
- **Realtime**: Socket.io (standalone server, deployed separately)
- **Database**: PostgreSQL + Prisma ORM
- **State**: Zustand
- **Animations**: Framer Motion (reactions only)
- **Toasts**: Sonner

---

## Code Conventions (apply to every file)
- TypeScript: no `any`, all props typed with interfaces
- React Server Components by default; add `"use client"` only when needed
- Named exports for components, default export for pages
- File naming: `kebab-case.tsx` for components, `camelCase.ts` for lib/hooks
- All async functions: try/catch with proper error handling
- All interactive elements: `aria-label` attribute
- No inline styles — Tailwind only
- No `console.log` in committed code — use `console.error` for caught errors only

---

## Folder Structure
```
/app
  /(auth)/login/page.tsx
  /(dashboard)/page.tsx
  /room/[code]/page.tsx
  /api/auth/[...nextauth]/route.ts
  /api/rooms/route.ts
  /api/rooms/[code]/route.ts
  /api/livekit/token/route.ts

/components
  /ui/              ← shadcn/ui base components only
  /room/            ← all in-call components
  /dashboard/       ← home page components

/lib
  auth.ts           ← NextAuth config
  livekit.ts        ← token generation
  socket.ts         ← Socket.io client singleton
  prisma.ts         ← PrismaClient singleton

/hooks
  useRoom.ts
  useChat.ts
  useReactions.ts
  useHostControls.ts

/store
  roomStore.ts
  chatStore.ts

/socket-server
  index.ts          ← standalone Socket.io server
```

---

## Environment Variables
```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LIVEKIT_URL=wss://your-app.livekit.cloud
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXT_PUBLIC_LIVEKIT_URL=wss://your-app.livekit.cloud
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

## Design Rules
- Dark mode default: `bg-zinc-950` background, `text-zinc-100` text
- In-call page: full viewport, `overflow-hidden`, no page scroll
- ControlBar: fixed bottom, `backdrop-blur`, `bg-zinc-900/80`
- Loading: skeleton components, never blank white screens
- Errors: sonner toast, never alert()
