# 📞 WebCall

Real-time video calling application built with Next.js, LiveKit, and Socket.io.

## 🚀 Phase 1 Setup Complete ✅

This project has completed Phase 1 of development:
- ✅ Next.js 14 with TypeScript and Tailwind CSS
- ✅ Prisma ORM with PostgreSQL
- ✅ NextAuth.js v5 with Google OAuth
- ✅ Full database schema (User, Room, Messages, etc.)
- ✅ Route protection middleware
- ✅ Login page with Google authentication

## 📋 Prerequisites

Before running this project, you need:

1. **Node.js 18+** installed
2. **PostgreSQL database** (local or Docker)
3. **Google OAuth credentials** from Google Cloud Console

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/webcall

# NextAuth
NEXTAUTH_SECRET=your-secret-here-run-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**To get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 3. Set Up Database

If you don't have PostgreSQL installed, you can use Docker:

```bash
docker run -d \
  --name webcall-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=webcall \
  -p 5432:5432 \
  postgres:15
```

Then update your DATABASE_URL in `.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/webcall
```

### 4. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you should be redirected to the login page.

## ✅ Phase 1 Acceptance Criteria

- [x] `npm run dev` starts without errors
- [x] Visiting `http://localhost:3000` redirects to `/login`
- [x] Login page renders with Google button
- [ ] Clicking Google button initiates OAuth flow (requires .env setup)
- [ ] After login, user is redirected to `/`
- [ ] User record appears in `User` table in DB
- [ ] Visiting `/login` when logged in redirects to `/`

## 📁 Project Structure

```
webcall/
├── app/
│   ├── api/auth/[...nextauth]/  # NextAuth API routes
│   ├── login/                   # Login page
│   ├── page.tsx                 # Home page (protected)
│   └── globals.css              # Global styles
├── components/
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── auth.ts                  # NextAuth configuration
│   ├── prisma.ts                # Prisma client
│   └── utils.ts                 # Utility functions
├── prisma/
│   └── schema.prisma            # Database schema
├── types/
│   └── next-auth.d.ts           # TypeScript types for NextAuth
└── middleware.ts                # Route protection
```

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL + Prisma ORM
- **OAuth Provider**: Google

## 🔜 Next Steps (Phase 2)

Phase 2 will add:
- Dashboard UI
- Room creation and management
- Room join functionality
- Room API endpoints

## 📝 License

MIT
