# Phase 1 — Project Setup, Database & Auth

> Paste this into GitHub Copilot Chat (Agent mode).
> Prerequisites: Node.js 18+, PostgreSQL running locally or via Docker.

---

## Task
Bootstrap the entire project foundation: Next.js setup, Prisma schema, and Google OAuth login.

---

## Step 1 — Initialize Project

Run these commands:
```bash
npx create-next-app@latest webcall --typescript --tailwind --app --src-dir no --import-alias "@/*"
cd webcall
npx shadcn@latest init
```

shadcn config when prompted:
- Style: Default
- Base color: Zinc
- CSS variables: Yes

Install all dependencies:
```bash
npm install next-auth@beta @auth/prisma-adapter
npm install prisma @prisma/client
npm install zustand sonner framer-motion
npm install livekit-client @livekit/components-react
npm install livekit-server-sdk
npm install socket.io socket.io-client
npm install @types/node --save-dev
```

Install shadcn components:
```bash
npx shadcn@latest add button card input label dialog avatar badge toast skeleton
```

---

## Step 2 — Prisma Schema

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String        @id @default(cuid())
  name      String
  email     String        @unique
  avatar    String?
  googleId  String?       @unique
  createdAt DateTime      @default(now())
  accounts  Account[]
  sessions  Session[]
  roomSessions RoomSession[]
  messages  Message[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

model Room {
  id        String        @id @default(cuid())
  name      String
  code      String        @unique
  hostId    String
  isLocked  Boolean       @default(false)
  createdAt DateTime      @default(now())
  endedAt   DateTime?
  sessions  RoomSession[]
  messages  Message[]
}

model RoomSession {
  id       String    @id @default(cuid())
  roomId   String
  userId   String
  role     String    @default("GUEST")
  joinedAt DateTime  @default(now())
  leftAt   DateTime?
  room     Room      @relation(fields: [roomId], references: [id])
  user     User      @relation(fields: [userId], references: [id])
}

model Message {
  id        String   @id @default(cuid())
  roomId    String
  userId    String?
  content   String
  type      String   @default("TEXT")
  createdAt DateTime @default(now())
  room      Room     @relation(fields: [roomId], references: [id])
  user      User?    @relation(fields: [userId], references: [id])
}
```

Then run:
```bash
npx prisma generate
npx prisma db push
```

---

## Step 3 — Lib Files

Create `lib/prisma.ts`:
```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Create `lib/auth.ts`:
```ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
```

Create `app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

---

## Step 4 — Middleware (Route Protection)

Create `middleware.ts` at root:
```ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## Step 5 — Login Page

Create `app/login/page.tsx`:
- Full screen centered layout, `bg-zinc-950`
- Card with app logo/name "WebCall"
- One button: "Continue with Google" — calls `signIn("google")`
- Subtle tagline: "Real-time calls, zero friction"
- Use shadcn `Card`, `Button` components
- Button has Google icon (use an inline SVG)

---

## Step 6 — TypeScript Types Extension

Create `types/next-auth.d.ts`:
```ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
  }
}
```

---

## Acceptance Criteria
- [ ] `npm run dev` starts without errors
- [ ] Visiting `http://localhost:3000` redirects to `/login`
- [ ] Login page renders with Google button
- [ ] Clicking Google button initiates OAuth flow
- [ ] After login, user is redirected to `/`
- [ ] User record appears in `User` table in DB
- [ ] Visiting `/login` when logged in redirects to `/`
