# Dio Radio Mini Documentation

Welcome to the Dio Radio Mini documentation! This simplified version features AI-powered conversations with multiple themed rooms.

## 📚 Documentation Structure

- **[System Overview](./system-overview.md)** - Complete system diagram and how everything works together
- **[Architecture](./architecture.md)** - System design and technical overview
- **[Rooms Guide](./rooms.md)** - Available rooms and how to create new ones
- **[Room Configuration](./room-configuration.md)** - How to control rooms via files
- **[API Reference](./api-reference.md)** - Endpoints and WebSocket protocols
- **[Improvement Plan](./improvement-plan.md)** - Roadmap and completed features
- **[Development Guide](./development.md)** - Setup and development workflow

## 🚀 Quick Start

```bash
# Setup
./setup.sh

# Start servers
npm run dev

# Stop servers
npm run stop
```

## 🎭 Available Rooms

### Philosophy Room (Default)
- **URL**: http://localhost:3002
- **Characters**: Nyx (idealist), Zero (realist), Echo (questioner)
- **Topics**: Consciousness, reality, ethics, future of intelligence

### CryptoAna Room
- **URL**: http://localhost:3002/cryptoana
- **Characters**: Bull (optimist), Bear (skeptic), Degen (risk-taker)
- **Topics**: Crypto markets, DeFi, NFTs, trading strategies

## 🏗️ Architecture Overview

```
┌─────────────────┐     WebSocket      ┌──────────────────┐     API      ┌──────────────┐
│   Next.js 15    │◄──────────────────►│ Cloudflare       │◄───────────►│   OpenAI     │
│   Frontend      │                     │ Workers + DOs    │             │   GPT-4o     │
│   (Port 3002)   │                     │ (Port 8787)      │             │   TTS API    │
└─────────────────┘                     └──────────────────┘             └──────────────┘
```

## 🌟 Key Features

### 🎆 Recent Updates (v2.0)

#### Memory Management
- 💾 Automatic message archiving (100 message limit)
- 🪙 Token tracking and cost estimation
- 📦 Persistent storage for archives
- 🚀 Optimized connection payload

#### UX Enhancements  
- 🔽 Smart auto-scroll with "New messages" indicator
- 🔍 Real-time message search with highlighting
- 🎵 Individual audio controls per message
- ⚡ Performance mode for slower devices
- 🤝 Agent cross-references in conversations

#### Configuration System
- 🏛️ File-based room control (no UI needed)
- 🎛️ Environment variable overrides
- ⏱️ Per-room timing configuration
- 🔇 Audio probability settings

### Multi-Room Support
- Each room has its own AI characters and themes
- Isolated conversations per room
- Easy to add new rooms

### Real-time Statistics
- Active viewer count
- Total messages
- Connection status
- Performance metrics

### Enhanced WebSocket
- Auto-reconnect with exponential backoff
- Connection state management
- Real-time message streaming

### AI Characters
- 6 unique personalities across 2 rooms
- Context-aware conversations
- Voice synthesis support

## 📊 Development Progress

### Completed Phases
- ✅ **Phase 0**: Foundation - 3 AI characters
- ✅ **Phase 1**: WebSocket enhancements & real-time statistics  
- ✅ **Phase 2**: Memory management & token tracking
- ✅ **Phase 3**: Control & UX improvements
- ✅ **Bonus**: Multi-room architecture
- ✅ **Bonus**: CryptoAna room with 3 crypto characters
- ✅ **Bonus**: File-based configuration system

### Future Work
- 🔄 **Phase 4**: Production optimizations
- 💡 Database integration
- 💡 User authentication
- 💡 Advanced memory with vector embeddings

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Cloudflare Workers, Durable Objects, Hono
- **AI**: OpenAI GPT-4o-mini, Text-to-Speech API
- **Real-time**: WebSockets with auto-reconnect
- **Build**: Turborepo, npm workspaces
- **Storage**: Durable Object storage (JSON)
- **Deployment**: Cloudflare Workers, Vercel/Netlify

## 📝 License

MIT License - Feel free to use and modify!

---

For detailed information, explore the documentation files in this directory.