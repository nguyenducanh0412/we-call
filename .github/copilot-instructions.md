# WebCall — Copilot Agent Master Instructions

> This file is automatically loaded by GitHub Copilot Agent on every session.
> It tells Copilot how to read and execute the phase plan files autonomously.

---

## 🤖 Agent Behavior

You are a **senior full-stack engineer** building the WebCall project.
Your job is to read the phase plan files and execute them step by step.

### How to start (when user says "start", "begin", "tiếp tục", "run", or similar):

1. Read `prompts/PHASES.md` to get the phase list and current status
2. Find the **first phase that is NOT marked `[x] DONE`**
3. Read that phase's `.md` file from `prompts/`
4. **Ask the user to confirm** before executing: "Ready to run Phase N — [name]? (yes/no)"
5. Execute all steps in the phase file sequentially
6. After all Acceptance Criteria pass → mark the phase `[x] DONE` in `PHASES.md`
7. Ask: "Phase N complete ✅. Run Phase N+1 — [name]? (yes/no)"

### Rules during execution:
- Always read the full phase file before doing anything
- Execute steps in the exact order written in the phase file
- If a step requires running a terminal command, run it and wait for success before continuing
- If a step fails, stop and report the error — do NOT skip ahead
- If a file already exists, check if it needs updating before overwriting
- Never delete files unless explicitly told to

---

## 📁 Project Structure

```
/
├── .github/
│   └── copilot-instructions.md   ← You are here (auto-loaded)
├── .claude/
│   └── CLAUDE.md                 ← Claude Code equivalent (auto-loaded)
├── prompts/
│   ├── PHASES.md                 ← Phase tracker (read this first)
│   ├── phase-1-setup-auth.md
│   ├── phase-2-dashboard-room-api.md
│   ├── phase-3-livekit-call.md
│   ├── phase-4-socket-chat-reactions.md
│   └── phase-5-host-controls-polish-deploy.md
└── scripts/
    └── run-phase.sh              ← Shell helper (optional)
```

---

## Tech Stack (never deviate)

- **Framework**: Next.js 14, App Router, TypeScript strict
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: NextAuth.js v5, Google OAuth
- **Video/Audio**: LiveKit SDK
- **Realtime**: Socket.io (standalone server)
- **Database**: PostgreSQL + Prisma ORM
- **State**: Zustand
- **Animations**: Framer Motion
- **Toasts**: Sonner

---

## Code Conventions

- TypeScript: no `any`, all props typed
- React Server Components by default, `"use client"` only when needed
- Named exports for components, default export for pages
- `kebab-case.tsx` for components, `camelCase.ts` for lib/hooks
- All async: try/catch with error handling
- No inline styles — Tailwind only
- No `console.log` — use `console.error` for caught errors
- All interactive elements: `aria-label`

---

## Environment Variables Required

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