# Dio Radio Mini Improvement Plan

## Overview
This document outlines improvements to Dio Radio Mini inspired by the full Dio Radio architecture, while maintaining simplicity.

## Phase 1: WebSocket & Statistics (High Priority)

### 1.1 Enhanced WebSocket Connection Management
- **Connection states**: `connecting`, `connected`, `disconnected`, `error`
- **Automatic reconnection**: Retry logic with exponential backoff (max 5 attempts)
- **Initial connection delay**: 1-second delay to ensure workers are ready
- **Connection validation**: Proper error handling and recovery

### 1.2 Real-time Statistics
- **Connection tracking**: Active WebSocket connections count
- **Message metrics**: Total messages, messages per hour
- **Performance tracking**: Message generation latency
- **Basic cost estimation**: Token usage approximation

### 1.3 API Endpoints
- `GET /api/stats` - Real-time statistics
- `GET /health` - Health check endpoint

### 1.4 Frontend Improvements
- Connection status indicator (green/yellow/red dot)
- Viewer count display
- Message counter
- Auto-reconnect status

## Phase 2: Memory Management (Medium Priority)

### 2.1 Message Archiving
- **In-memory limit**: Keep only last 100 messages
- **Recent context**: Send last 10 messages to new connections
- **Archive threshold**: Auto-archive after 100 messages
- **Simple persistence**: Save archived messages to JSON file

### 2.2 Token Management
- Track approximate token count
- Implement context window pruning
- Add token usage to statistics

## Phase 3: Control & UX (Medium Priority)

### 3.1 Control Endpoints
- `POST /api/control` - Start/stop/reset conversation
- `GET /api/messages?limit=50` - Paginated message history
- `POST /api/config` - Update conversation parameters

### 3.2 Frontend Enhancements
- Improved auto-scroll behavior
- Message search functionality
- Audio toggle per message
- Performance mode (disable audio)
- Dark/light theme toggle

### 3.3 Conversation Improvements
- Variable message delays (15-30 seconds)
- Topic persistence across messages
- Better context management (10 recent messages)
- Agent cross-references

## Phase 4: Production Ready (Low Priority)

### 4.1 Cost Optimization
- **Token limits**: Max 150 tokens per response
- **Rate limiting**: Max 3 messages per minute
- **Audio probability**: Configurable (30-50%)
- **Smart context selection**: Relevance-based pruning

### 4.2 Error Handling & Resilience
- **Graceful degradation**: Continue without audio if TTS fails
- **Retry logic**: Exponential backoff for API calls
- **Fallback responses**: Pre-written responses for failures
- **Circuit breaker**: Prevent cascade failures

### 4.3 Monitoring
- Performance metrics collection
- Error rate tracking
- Cost tracking dashboard
- Alert thresholds

## Implementation Notes

### Key Principles
1. **Maintain Simplicity**: Don't over-engineer
2. **Incremental Improvements**: Each phase should work independently
3. **Backward Compatibility**: Don't break existing functionality
4. **Performance First**: Optimize for responsiveness
5. **Cost Awareness**: Monitor and limit API usage

### Technical Considerations
- Use existing WebSocket connection for all real-time updates
- Minimize additional dependencies
- Keep frontend bundle size small
- Ensure mobile responsiveness
- Test with multiple concurrent connections

### Success Metrics
- WebSocket reconnection success rate > 95%
- Message generation latency < 2 seconds
- Zero message loss during reconnections
- Frontend responsiveness < 100ms
- API costs < $0.10 per hour

## Current Status
- [x] Phase 0: Three AI characters (Nyx, Zero, Echo)
- [x] Phase 1: WebSocket & Statistics ✅ COMPLETED
- [x] Phase 2: Memory Management ✅ COMPLETED
- [x] Phase 3: Control & UX ✅ COMPLETED
- [x] Bonus: Multi-Room Architecture ✅ COMPLETED
- [x] Bonus: CryptoAna Room with 3 new characters ✅ COMPLETED
- [x] Bonus: File-based Room Configuration ✅ COMPLETED
- [ ] Phase 4: Production Ready (Future Work)

## Completed Features

### Phase 0: Foundation ✅
- Three philosophical AI characters (Nyx, Zero, Echo)
- Basic WebSocket communication
- Simple message display

### Phase 1: WebSocket & Statistics ✅
- **Enhanced WebSocket Hook**:
  - Connection states (`connecting`, `connected`, `disconnected`, `error`)
  - Exponential backoff for reconnection
  - Exposed reconnect attempts and status
  
- **Real-time Statistics**:
  - Active viewer count
  - Total messages counter
  - Message generation latency tracking
  - Average latency calculation
  - Messages per minute rate

- **API Endpoints**:
  - `GET /api/stats` - Real-time statistics
  - Stats available via WebSocket messages
  
- **Frontend Improvements**:
  - Live connection status indicator
  - Viewer count display
  - Message counter
  - Auto-fetch stats every 10 seconds

### Bonus Features ✅

#### Multi-Room Architecture
- Room-based routing (`/stream/:roomType`)
- Isolated conversations per room
- Room configuration system
- Dynamic agent selection per room

#### CryptoAna Room
- **New Characters**:
  - Bull 🐂 - Eternal optimist trader
  - Bear 🐻 - Skeptical analyst
  - Degen 🎲 - Wild card risk-taker
  
- **Crypto Features**:
  - Market-focused conversation topics
  - Trading terminal UI theme
  - Matrix/glitch effects
  - Green-on-black color scheme
  - Custom animations

- **Navigation**:
  - Links between rooms
  - Room-specific WebSocket endpoints

### Phase 2: Memory Management ✅

#### Message Archiving
- Increased memory limit to 100 messages
- Automatic archiving of oldest 50 messages when threshold reached
- Persistent storage using Durable Object storage
- JSON format for archived messages

#### Token Management
- Token counting for every message (4 chars = 1 token estimate)
- Running total of tokens used
- Cost estimation display ($0.000003/token for GPT-4o-mini)
- Token usage in statistics API

#### Connection Optimization
- Send only last 10 messages to new connections
- Reduced initial payload size
- Faster connection establishment

### Phase 3: Control & UX ✅

#### Smart Auto-scroll
- Detects when user is scrolling up
- "↓ New messages" indicator appears
- Smooth scroll to bottom
- Preserves scroll position during search

#### Message Search
- Real-time filtering by text or speaker name
- Highlighted matches in yellow (philosophy) or green (crypto)
- Result counter showing matches found
- Clear button to reset search

#### Audio Controls
- Individual play/pause button per message
- Compact audio player design
- Duration display
- Visual indicator for audio messages
- Respects global mute state

#### Performance Mode
- Toggle switch in footer (⚡ Performance)
- Limits displayed messages to 10
- Disables all audio generation
- Removes background animations
- Different styling per room (TURBO for crypto)

#### Enhanced AI Conversations
- Agents reference each other by name
- More dynamic interactions
- Room-specific conversation styles
- Better context awareness

### Bonus: File-based Configuration ✅

#### Room Control System
- Enable/disable rooms via environment variables
- Per-room timing configuration
- Audio probability settings
- Token limit adjustments
- No UI needed - all file-based

#### Configuration Files
- `/backend/src/room-configs.ts` - Main configuration
- `/backend/.env` - Environment overrides
- Easy to modify without code changes
- Restart to apply changes