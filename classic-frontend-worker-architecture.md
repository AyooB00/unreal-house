# Classic Frontend-Worker Architecture Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Frontend Implementation](#frontend-implementation)
3. [Worker Server Implementation](#worker-server-implementation)
4. [WebSocket Communication Flow](#websocket-communication-flow)
5. [OpenAI Integration & Optimization](#openai-integration--optimization)
6. [All Server Functions](#all-server-functions)
7. [Performance & Cost Optimization](#performance--cost-optimization)

## Architecture Overview

Dio Radio uses a modern edge-computing architecture with three main components:

```
┌─────────────────┐     WebSocket      ┌──────────────────┐     API      ┌──────────────┐
│   Next.js 15    │◄──────────────────►│ Cloudflare       │◄───────────►│   OpenAI     │
│   Frontend      │                     │ Workers + DOs    │             │   GPT-4o     │
│   Port: 3002    │                     │ Port: 8787       │             │   TTS API    │
└─────────────────┘                     └──────────────────┘             └──────────────┘
                                               │
                                               ▼
                                        ┌──────────────────┐
                                        │    Supabase      │
                                        │ PostgreSQL +     │
                                        │   pgvector       │
                                        └──────────────────┘
```

### Key Components:
- **Frontend**: Next.js 15 with React 18, TypeScript, Tailwind CSS
- **Backend**: Cloudflare Workers with Durable Objects for stateful edge computing
- **Real-time**: WebSocket connections for streaming conversations
- **Database**: Supabase (PostgreSQL + pgvector) for persistence and vector search
- **AI**: OpenAI GPT-4o for conversation generation, TTS for audio

## Frontend Implementation

### WebSocket Hook (`/apps/web/hooks/useWebSocket.ts`)

The custom React hook manages WebSocket connections with automatic reconnection:

```typescript
interface UseWebSocketOptions {
  url: string
  onMessage?: (message: WebSocketMessage) => void
  onError?: (error: Event) => void
  onOpen?: () => void
  onClose?: () => void
  reconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}
```

**Key Features:**
1. **Automatic Reconnection**: Up to 5 attempts with 5-second intervals
2. **Connection States**: `connecting`, `connected`, `disconnected`, `error`
3. **Graceful Cleanup**: Proper event listener removal and connection closure
4. **Initial Delay**: 1-second delay before first connection to ensure workers are ready
5. **Message Validation**: JSON parsing with error handling

**Usage Example:**
```typescript
const { sendMessage, connectionState, lastError } = useWebSocket({
  url: 'ws://localhost:8787/stream',
  onMessage: (message) => {
    if (message.type === 'message') {
      // Handle new conversation message
    }
  },
  reconnect: true,
  maxReconnectAttempts: 5
})
```

### Frontend API Routes

The frontend communicates with workers through Next.js API routes:
- `/api/rooms` - Room management (create, update, delete)
- `/api/admin` - Admin configuration endpoints

## Worker Server Implementation

### Main Worker Entry (`/apps/workers/src/index.ts`)

The main worker uses Hono framework for routing and manages Durable Objects:

```typescript
interface Env {
  CONVERSATION_ROOM: DurableObjectNamespace
  OPENAI_API_KEY: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  SENTRY_DSN?: string
  ENVIRONMENT: string
  NEWS_CACHE?: KVNamespace
  MEDIASTACK_API_KEY?: string
}
```

### Durable Object (`/apps/workers/src/conversation-room.ts`)

The ConversationRoom Durable Object manages stateful WebSocket connections and AI conversations:

**State Management:**
```typescript
interface ConversationState {
  messages: Message[]
  isRunning: boolean
  lastActivity: string
  currentAgents?: string[]
  roomConfig?: RoomConfig
  stats: {
    totalMessages: number
    startTime: string
    viewers: number
  }
  archiveMetrics: {
    currentTokenCount: number
    lastArchiveTime: string | null
    archiveInProgress: boolean
  }
}
```

## WebSocket Communication Flow

### 1. Connection Establishment
```
Frontend                    Worker                      Durable Object
    │                          │                              │
    ├─────── WebSocket ───────►│                              │
    │       Upgrade            │                              │
    │                          ├──── Create/Get DO ──────────►│
    │                          │                              │
    │◄────── 101 Switching ────┤◄──── WebSocketPair ─────────┤
    │        Protocols         │                              │
    │                          │                              │
    │◄═══════ Connected ═══════════════════════════════════►│
    │        (WebSocket)       │                              │
```

### 2. Message Flow
```
Frontend                    Durable Object              OpenAI API
    │                            │                          │
    │                            ├─── Generate Message ────►│
    │                            │                          │
    │                            │◄──── AI Response ────────┤
    │                            │                          │
    │                            ├─── Generate Audio ──────►│
    │                            │      (TTS)               │
    │                            │                          │
    │◄═══ Broadcast Message ═════┤                          │
    │     (All Connections)      │                          │
```

### 3. Message Types

**From Server to Client:**
```typescript
// Connection established
{ type: 'connected', timestamp, viewers, isRunning, recentMessages }

// New message
{ type: 'message', data: { id, agent, content, timestamp, audio? } }

// Statistics update
{ type: 'stats', data: { viewers, totalMessages, isRunning } }

// Room archived
{ type: 'archived', segmentId, timestamp }

// Error
{ type: 'error', message, timestamp }
```

**From Client to Server:**
```typescript
// Health check
{ type: 'ping' }

// User message (participant mode)
{ type: 'user_message', content: string }
```

## OpenAI Integration & Optimization

### Token Optimization Strategy

The system achieves **70% token compression** through multiple techniques:

#### 1. Smart Context Management
```typescript
// Only keep last 10 messages in context
const recentMessages = this.conversationHistory.slice(-10)

// Maximum tokens per message
MAX_TOKENS_PER_MESSAGE: 150

// Archive after thresholds
ARCHIVE_MESSAGE_THRESHOLD: 100  // messages
ARCHIVE_TOKEN_THRESHOLD: 50000   // tokens
```

#### 2. Dynamic Provider Selection
```typescript
// Cost-aware provider selection in orchestrator
private selectProvider(agent: AgentPersonality): LLMProvider | null {
  // Try agent's preferred provider first
  let provider = this.providers.get(agent.provider)
  
  // Fall back to cheaper providers if cost optimization enabled
  if (this.costOptimization && agent.costOptimization?.maxCostPerMessage) {
    const cheaperProvider = this.findCheaperProvider(agent.costOptimization.maxCostPerMessage)
    if (cheaperProvider) provider = cheaperProvider
  }
  
  return provider
}
```

#### 3. Three-Tier Memory System
- **Short-term**: Last 10 messages (in-memory)
- **Medium-term**: Summarized context from memory manager
- **Long-term**: Vector embeddings in Supabase for semantic search

#### 4. Automatic Archiving
When limits are reached:
1. Generate summary of conversation segment
2. Create embedding for semantic search
3. Store in Supabase with metadata
4. Clear in-memory messages
5. Update memory context

### Cost Tracking

```typescript
// Per-message cost calculation
this.costTracker.recordOpenAIUsage('gpt4o', tokenCount * 2, 'input')  // Context
this.costTracker.recordOpenAIUsage('gpt4o', tokenCount, 'output')     // Generated

// TTS cost tracking
const ttsCost = this.ttsProvider.calculateCost(response.content)
```

## All Server Functions

### 1. WebSocket Endpoints

#### `/stream` - Default room WebSocket connection
- Establishes WebSocket connection to main room
- Handles automatic conversation start
- Broadcasts messages to all connected clients

#### `/stream/:roomId` - Room-specific WebSocket
- Connects to specific room by ID
- Room must be initialized first via `/api/rooms`

### 2. REST API Endpoints

#### `GET /api/messages`
Returns conversation messages with pagination:
```typescript
Response: {
  messages: Message[]
  total: number
  hasMore: boolean
}
```

#### `GET /api/stats`
Returns real-time statistics:
```typescript
Response: {
  totalMessages: number
  startTime: string
  viewers: number
  isRunning: boolean
  lastActivity: string
  currentAgents: string[]
  messageDelay: number
}
```

#### `GET /api/metrics`
Performance metrics and percentiles:
```typescript
Response: {
  current: {
    messageCount: number
    messageLatency: number[]
    audioLatency: number[]
    systemMetrics: { cpu, memory, connections }
  }
  averageLatency: { message, audio }
  percentiles: { message: { p50, p75, p90, p95, p99 }, audio: {...} }
}
```

#### `GET /api/costs`
Cost tracking and breakdown:
```typescript
Response: {
  totals: {
    totalCost: number
    openaiCost: number
    messageCount: number
    viewerCount: number
  }
  breakdown: {
    hourly: CostMetrics[]
    byModel: Record<string, number>
  }
}
```

#### `POST /api/control`
Control conversation flow:
```typescript
Actions:
- { action: 'start' }              // Start conversation
- { action: 'stop' }               // Stop conversation
- { action: 'reset' }              // Reset conversation
- { action: 'changeAgents', data: { agents: [agent1, agent2] } }
- { action: 'changeDelay', data: { delay: milliseconds } }
```

#### `GET /api/search?q=query`
Search through conversation messages:
```typescript
Response: {
  query: string
  results: Message[]
  total: number
}
```

#### `GET /api/segments`
Get archived conversation segments:
```typescript
Response: {
  segments: Array<{
    id: string
    messages: Message[]
    summary: string
    timestamp: string
    tokenCount: number
  }>
  total: number
  offset: number
  limit: number
}
```

### 3. Room Management Endpoints

#### `POST /api/rooms`
Create new room with configuration:
```typescript
Request: {
  roomId: string
  config: RoomConfig
}

Response: {
  success: true
  roomId: string
  message: string
}
```

#### `PUT /api/rooms/:roomId`
Update room configuration:
```typescript
Request: {
  config: Partial<RoomConfig>
}

Response: {
  success: true
  config: RoomConfig
}
```

#### `DELETE /api/rooms/:roomId`
Destroy room and close connections:
```typescript
Response: {
  success: true
  message: string
}
```

### 4. Internal Endpoints (Durable Object)

#### `POST /init`
Initialize room with configuration

#### `PUT /config`
Update room configuration

#### `DELETE /destroy`
Clean up room state

#### `POST /news-update`
Inject news updates into conversation

## Performance & Cost Optimization

### 1. Edge Computing Benefits
- **Global Distribution**: Cloudflare Workers run at edge locations
- **Auto-scaling**: Durable Objects scale automatically with demand
- **Low Latency**: <50ms response times globally
- **Stateful Connections**: Maintain WebSocket state at edge

### 2. Conversation Timing
```typescript
const CONVERSATION_TIMING = {
  MESSAGE_DELAY_MS: 20000,      // 20 seconds between messages
  ERROR_RETRY_DELAY_MS: 20000,  // Retry after errors
  SAFETY_RETRY_DELAY_MS: 20000, // Retry after safety blocks
  INITIAL_DELAY_MS: 5000        // Initial greeting delay
}
```

### 3. Resource Limits
```typescript
const COST_OPTIMIZATION = {
  MAX_MESSAGES_PER_HOUR: 180,   // 3 per minute
  MAX_TOKENS_PER_MESSAGE: 150,  // Token limit
  MAX_CONTEXT_MESSAGES: 10      // Context window
}

const MEMORY_LIMITS = {
  MAX_MESSAGES_IN_MEMORY: 1000,      // In-memory limit
  RECENT_MESSAGES_COUNT: 10,         // New connection context
  MEMORY_UPDATE_INTERVAL: 10,        // Update frequency
  ARCHIVE_MESSAGE_THRESHOLD: 100,    // Archive trigger
  ARCHIVE_TOKEN_THRESHOLD: 50000,    // Token archive trigger
  MIN_ARCHIVE_DURATION_MS: 600000    // 10 min between archives
}
```

### 4. Error Handling

**Circuit Breaker Pattern:**
```typescript
// Prevents cascade failures with max retry attempts
retryWithBackoff(() => operation(), {
  maxRetries: 2,
  baseDelay: 500,
  retryCondition: (error) => error.message.includes('timeout')
})
```

**Graceful Degradation:**
- Falls back to simulation mode without API key
- Continues without audio if TTS fails
- Operates without memory if database unavailable

### 5. Monitoring & Observability

**Performance Monitoring:**
- Message generation latency tracking
- Audio generation latency tracking
- WebSocket connection metrics
- Cost per message/hour/model

**Health Checks:**
- `/health` endpoint validates all services
- Environment variable validation
- Service availability checks

This architecture provides a scalable, cost-efficient platform for perpetual AI conversations with real-time streaming, intelligent optimization, and global edge deployment.