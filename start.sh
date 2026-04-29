#!/bin/bash
# Quick Start Script for WebCall Phase 1

echo "🚀 WebCall Phase 1 - Quick Start"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "⚠️  .env file not found!"
  echo ""
  echo "Creating .env file from template..."
  cat > .env << 'EOF'
# Database - Update with your PostgreSQL connection string
DATABASE_URL=postgresql://postgres:password@localhost:5432/webcall

# NextAuth - REPLACE THIS with output from: openssl rand -base64 32
NEXTAUTH_SECRET=REPLACE_WITH_GENERATED_SECRET
NEXTAUTH_URL=http://localhost:3000

# Google OAuth - Get from Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LiveKit (for Phase 3)
LIVEKIT_URL=wss://your-app.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-app.livekit.cloud

# Socket.io (for Phase 4)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
EOF
  
  echo "✅ Created .env file"
  echo ""
  echo "⚠️  IMPORTANT: You must edit .env and add:"
  echo "   1. Your PostgreSQL DATABASE_URL"
  echo "   2. Generate NEXTAUTH_SECRET: openssl rand -base64 32"
  echo "   3. Your Google OAuth credentials"
  echo ""
  exit 1
fi

echo "✅ .env file found"
echo ""

# Check PostgreSQL
echo "🔍 Checking PostgreSQL connection..."
if npx prisma db pull --force 2>&1 | grep -q "Error"; then
  echo "⚠️  PostgreSQL not accessible!"
  echo ""
  echo "Quick Start PostgreSQL with Docker:"
  echo "  docker run -d --name webcall-postgres \\"
  echo "    -e POSTGRES_PASSWORD=password \\"
  echo "    -e POSTGRES_DB=webcall \\"
  echo "    -p 5432:5432 postgres:15"
  echo ""
  echo "Then update DATABASE_URL in .env:"
  echo "  DATABASE_URL=postgresql://postgres:password@localhost:5432/webcall"
  echo ""
  exit 1
fi

echo "✅ PostgreSQL connected"
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate
echo ""

# Push schema to database
echo "🗄️  Creating database tables..."
npx prisma db push --skip-generate
echo ""

echo "✅ Database setup complete!"
echo ""

# Start dev server
echo "🚀 Starting development server..."
echo "   Open http://localhost:3000 in your browser"
echo ""
npm run dev
