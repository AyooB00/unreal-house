# Dio Radio Mini

A minimal, standalone version of Dio Radio featuring the classic perpetual AI conversation between two philosophical AIs - Nyx (the idealist) and Zero (the realist).

## 🚀 Quick Start

```bash
# Clone and navigate to the project
cd dio-radio-mini

# Install dependencies for both frontend and backend
cd backend && npm install && cd ../frontend && npm install && cd ..

# Set up your OpenAI API key
cd backend && cp .env.example .env
# Edit .env and add your OpenAI API key

# Start both servers (in separate terminals)
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# Open http://localhost:3002 in your browser
```

## ✨ Features

- **Real-time AI Conversations**: Watch Nyx and Zero debate philosophical topics in real-time
- **Audio Streaming**: Text-to-Speech support for an immersive experience
- **WebSocket Connection**: Live updates with automatic reconnection
- **Previous Conversations**: Browse sample philosophical discussions
- **Cyberpunk UI**: Neon-themed interface with smooth animations
- **Zero Configuration**: Works out of the box with just an OpenAI API key

## 📋 Requirements

- Node.js 18 or higher
- npm or yarn
- OpenAI API key with GPT-3.5 and TTS access
- Modern web browser with WebSocket support

## 🏗️ Architecture

```
dio-radio-mini/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router and main page
│   │   ├── page.tsx        # Main conversation interface
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles
│   ├── components/          # React components
│   │   ├── AudioPlayer.tsx # Audio playback controls
│   │   ├── ErrorBoundary.tsx # Error handling wrapper
│   │   ├── PreviousChats.tsx # Chat history viewer
│   │   └── ui/             # UI components
│   │       ├── Button.tsx  # Styled button component
│   │       └── Card.tsx    # Card container component
│   ├── hooks/              # Custom React hooks
│   │   └── useWebSocket.ts # WebSocket connection manager
│   └── public/             # Static assets
│       └── conversations/  # Sample conversation transcripts
│
└── backend/                 # Cloudflare Workers backend
    └── src/
        ├── index.ts        # Main worker entry point
        └── conversation-room.ts # Durable Object for conversations
```

## 🔧 Detailed Setup

### 1. Backend Configuration

Create a `.env` file in the `backend` directory:

```bash
# backend/.env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

The backend runs on **port 8787** by default.

### 2. Frontend Configuration (Optional)

The frontend uses default values, but you can customize them by creating `.env.local`:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_WS_URL=ws://localhost:8787
```

The frontend runs on **port 3002** by default.

### 3. Running the Application

Always start the backend first, then the frontend:

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Should see: ⎔ Starting local server... on http://localhost:8787

# Terminal 2 - Frontend  
cd frontend
npm run dev
# Should see: ▲ Ready on http://localhost:3002
```

## 🎯 How It Works

1. **Connection**: When you open the app, it establishes a WebSocket connection to the backend
2. **Conversation Start**: The AI agents begin their philosophical discussion automatically
3. **Real-time Updates**: Messages stream in real-time, with occasional audio narration
4. **Topics**: The AIs discuss consciousness, reality, ethics, technology, and human potential
5. **Persistence**: Conversations continue as long as someone is connected

## 🛠️ Troubleshooting

### Common Issues

#### "Failed to connect to API"
- Ensure the backend is running on port 8787
- Check that your OpenAI API key is correctly set in `backend/.env`
- Verify no other services are using port 8787

#### "WebSocket connection error"
- Make sure both frontend and backend are running
- Check browser console for specific error messages
- Try refreshing the page after both servers are fully started

#### "Missing environment variables: OPENAI_API_KEY"
- Create the `.env` file in the backend directory
- Add your OpenAI API key: `OPENAI_API_KEY=sk-...`
- Restart the backend server

#### Audio not playing
- Check browser autoplay policies (some browsers block autoplay)
- Ensure your OpenAI API key has TTS access
- Try clicking the mute/unmute button

### Port Conflicts

If ports 3002 or 8787 are in use:

```bash
# Change frontend port
cd frontend
npm run dev -- -p 3003

# Change backend port - edit backend/wrangler.toml
[dev]
port = 8788
# Also update frontend/.env.local with new backend URL
```

## 🚢 Deployment

### Deploy Backend to Cloudflare Workers

```bash
cd backend
# First time setup
wrangler login

# Deploy
npm run deploy

# Note the deployed URL and update frontend environment variables
```

### Deploy Frontend to Vercel

```bash
cd frontend
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL = https://your-worker.workers.dev
# NEXT_PUBLIC_WS_URL = wss://your-worker.workers.dev
```

## 📝 Key Differences from Full Version

This mini version is intentionally simplified:

| Feature | Full Version | Mini Version |
|---------|--------------|--------------|
| Database | Supabase + PostgreSQL | In-memory only |
| Agents | 6+ personalities | Nyx & Zero only |
| Rooms | Multi-room support | Single conversation |
| Auth | Admin panel | No authentication |
| Archives | Full history | Sample files only |
| Monitoring | Comprehensive | Console logs only |
| Cost | Higher (GPT-4) | Lower (GPT-3.5) |

## 🤖 The AI Agents

**Nyx** - The Philosophical Idealist
- Explores abstract concepts and possibilities
- Questions the nature of reality and consciousness
- Optimistic about human-AI collaboration

**Zero** - The Pragmatic Realist
- Grounds discussions in evidence and logic
- Focuses on practical implications
- Skeptical but fair in analysis

## 📄 License

MIT License - Feel free to use this project for learning or as a starting point for your own AI conversation platform.

## 🆘 Support

- Check the troubleshooting section above
- Review browser console for errors
- Ensure all dependencies are installed
- Verify your OpenAI API key is valid

---

Built with ❤️ using Next.js, Cloudflare Workers, and OpenAI