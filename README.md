# WebCall

A modern, real-time video calling application with chat, reactions, and host controls.

![WebCall](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![LiveKit](https://img.shields.io/badge/LiveKit-Real--time%20Video-green)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time%20Chat-orange)

## ✨ Features

### Core Functionality
- 🔐 **Google OAuth Authentication** - Secure login with NextAuth.js v5
- 🎥 **High-Quality Video/Audio** - Powered by LiveKit
- 💬 **Real-time Chat** - Socket.io for instant messaging
- 😊 **Emoji Reactions** - Send reactions that float and fade
- ✋ **Raise Hand** - Signal to speak with visual indicator
- 📋 **Room Codes** - Easy to share and join

### Host Controls
- 👥 **Participant Management** - View all participants
- 🔇 **Mute Participants** - Control audio permissions
- 🚪 **Kick Participants** - Remove disruptive users
- 👑 **Transfer Host** - Give control to another user
- 🔒 **Lock Room** - Prevent new participants from joining
- ❌ **End Call** - Close the room for everyone

### UI/UX
- 🎨 **Modern Dark Theme** - Sleek zinc/gray design
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🔔 **Toast Notifications** - Real-time status updates
- ⏱️ **Call Duration Timer** - Track meeting length
- 👀 **Participant Count** - See who's in the room

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL database
- Google OAuth credentials
- LiveKit account (free tier available)

### 1. Install Dependencies
```bash
npm install
cd socket-server && npm install && cd ..
```

### 2. Set Up Environment
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 3. Set Up Database
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev:all
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Environment Variables

See `.env.example` for required environment variables.

## 🌐 Deployment

- **Frontend**: Deploy to Vercel
- **Socket Server**: Deploy to Railway with Docker
- **Database**: Railway PostgreSQL or Supabase

See full deployment guide in the repository.

## 🐛 Troubleshooting

- **Socket not connecting**: Check `NEXT_PUBLIC_SOCKET_URL`
- **Google OAuth fails**: Verify redirect URIs in Google Console
- **Video/Audio not working**: Check LiveKit credentials and browser permissions

---

Built with ❤️ using Next.js and LiveKit
