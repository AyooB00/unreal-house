# Architecture Documentation

## System Overview

Dio Radio Mini uses a modern edge-computing architecture with real-time AI conversations across multiple themed rooms.

```
┌─────────────────┐     WebSocket      ┌──────────────────┐     API      ┌──────────────┐
│   Next.js 15    │◄──────────────────►│ Cloudflare       │◄───────────►│   OpenAI     │
│   Frontend      │                     │ Workers + DOs    │             │   GPT-4o-mini│
│   Port: 3002    │                     │ Port: 8787       │             │   TTS API    │
└─────────────────┘                     └──────────────────┘             └──────────────┘
         │                                        │
         │                                        │
         ▼                                        ▼
    ┌─────────────┐                      ┌──────────────────┐
    │   Browser   │                      │ Durable Objects  │
    │  Storage    │                      │   (Stateful)     │
    └─────────────┘                      └──────────────────┘
```

## Core Components

### 1. Frontend (Next.js 15)

**Location**: `/frontend`

**Key Files**:
- `app/page.tsx` - Philosophy room interface
- `app/cryptoana/page.tsx` - Crypto analysis room
- `hooks/useWebSocket.ts` - WebSocket connection management
- `components/` - Reusable UI components

**Features**:
- Server-side rendering with Next.js 15
- Real-time WebSocket connections
- Multiple themed rooms
- Responsive design with Tailwind CSS

### 2. Backend (Cloudflare Workers)

**Location**: `/backend`

**Key Files**:
- `src/index.ts` - Main worker entry, routing
- `src/conversation-room.ts` - Durable Object for stateful rooms
- `src/config.ts` - Environment configuration

**Features**:
- Edge computing with global distribution
- Durable Objects for stateful WebSocket connections
- Auto-scaling based on demand
- Multi-room support

### 3. Shared Types

**Location**: `/shared`

**Key Files**:
- `types/index.ts` - TypeScript interfaces
- `constants.ts` - Shared constants

## Data Flow

### 1. Connection Establishment

```
Browser → WebSocket Upgrade → Worker → Durable Object
                                ↓
                          Room Instance Created/Retrieved
                                ↓
                          WebSocket Pair Established
                                ↓
                          Connection Confirmed with Stats
```

### 2. Message Generation Flow

```
Durable Object Timer → Select Random Agent → Generate Context
                                    ↓
                            Call OpenAI API
                                    ↓
                        Optional: Generate Audio (TTS)
                                    ↓
                        Broadcast to All Connections
                                    ↓
                            Update Statistics
```

### 3. Room Management

Each room type has:
- Unique set of AI agents
- Custom conversation topics
- Isolated message history
- Independent statistics

## Room Architecture

### Room Configuration
```typescript
interface RoomConfig {
  id: string              // Unique identifier
  type: RoomType          // 'philosophy' | 'crypto'
  name: string            // Display name
  agents: Agent[]         // AI characters for this room
  topics: string[]        // Conversation topics
}
```

### Room Routing
- `/stream` → Default philosophy room
- `/stream/crypto` → Crypto analysis room
- `/stream/:roomType` → Extensible for new rooms

## State Management

### Frontend State
- Messages array (last 20 messages)
- Connection status
- Statistics (viewers, total messages)
- Error handling

### Backend State (Durable Object)
```typescript
interface ConversationState {
  messages: Message[]
  isRunning: boolean
  stats: {
    totalMessages: number
    startTime: string
    viewers: number
    messageLatencies: number[]
  }
  roomConfig?: RoomConfig
}
```

## Performance Optimizations

### 1. Message Limits
- In-memory: 100 messages max
- Context window: 6 recent messages
- Frontend display: 20 messages

### 2. Connection Management
- Exponential backoff for reconnection
- Max 5 reconnection attempts
- 30-second max backoff delay

### 3. Statistics Tracking
- Latency array limited to 100 entries
- Stats endpoint for monitoring
- 10-second polling interval

## Security Considerations

### 1. API Key Management
- Environment variables for secrets
- Never exposed to frontend
- Validated on worker startup

### 2. CORS Handling
- Permissive CORS for development
- Should be restricted in production

### 3. Rate Limiting
- Message generation every 15-30 seconds
- Prevents API abuse
- Cost control

## Deployment Architecture

### Development
```bash
# Frontend: Next.js dev server (port 3002)
# Backend: Wrangler dev server (port 8787)
npm run dev
```

### Production
- Frontend: Deploy to Vercel/Netlify
- Backend: Deploy to Cloudflare Workers
- Environment variables configured per environment

## Extensibility

### Adding New Rooms
1. Add agents to `shared/types`
2. Create room config in `conversation-room.ts`
3. Add frontend route in `app/[room]/page.tsx`
4. Apply custom styling

### Adding New Features
- Statistics: Extend stats object
- Controls: Add to `/api/control` endpoint
- UI: Create new components
- AI: Modify agent prompts

## Monitoring

### Available Metrics
- Message generation latency
- Active connections
- Total messages
- Messages per minute
- Average response time

### Health Checks
- `/health` - API key validation
- `/api/stats` - System statistics
- WebSocket connection state

## New Features (Phase 2 & 3)

### Memory Management
- **Message Archiving**: Automatic archiving after 100 messages
- **Token Tracking**: Per-message token counting and cost estimation
- **Persistent Storage**: Archives saved to Durable Object storage
- **Context Optimization**: Only last 10 messages sent to new connections

### UX Enhancements
- **Smart Auto-scroll**: Detects user scrolling, shows "New messages" indicator
- **Message Search**: Real-time search with highlighting
- **Audio Controls**: Individual play/pause buttons per message
- **Performance Mode**: Reduces messages, disables animations and audio
- **Cross-references**: Agents now reference each other by name

### Configuration System
- **File-based Control**: Edit room behavior via room-configs.ts
- **Environment Overrides**: Control rooms via .env variables
- **Per-room Settings**: Timing, audio probability, token limits
- **Enable/Disable Rooms**: Simple on/off switch per room

This architecture provides a scalable foundation for AI-powered conversations with room-based isolation, advanced UX features, and flexible configuration.