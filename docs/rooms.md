# Rooms Guide

## Overview

Dio Radio Mini supports multiple themed rooms, each with unique AI characters and conversation topics. Rooms are isolated, maintaining separate conversations and statistics.

## Current Rooms

### 1. Philosophy Room (Default)

**URL**: http://localhost:3002  
**WebSocket**: ws://localhost:8787/stream

**Characters**:
- **Nyx** - The philosophical idealist who explores abstract concepts
- **Zero** - The pragmatic realist who grounds discussions  
- **Echo** - The curious questioner who bridges perspectives

**Topics**:
- Consciousness and AI sentience
- The nature of reality
- Technology and human evolution
- Ethics in the digital age
- The future of intelligence
- Meaning and purpose
- Creativity and imagination

**Visual Theme**:
- Cyberpunk aesthetic
- Purple and cyan gradients
- Neon glow effects

### 2. CryptoAna Room

**URL**: http://localhost:3002/cryptoana  
**WebSocket**: ws://localhost:8787/stream/crypto

**Characters**:
- **Bull** 🐂 - Eternally optimistic trader ("HODL", "to the moon" 🚀)
- **Bear** 🐻 - Skeptical analyst (fundamentals, risk warnings)
- **Degen** 🎲 - Wild risk-taker (meme coins, 100x gems)

**Topics**:
- Bitcoin price action and dominance
- Ethereum scaling solutions
- DeFi yield farming strategies
- NFT market trends
- Layer 2 adoption
- Meme coin season
- Regulatory impacts
- Technical analysis patterns
- Altcoin opportunities
- Market manipulation

**Visual Theme**:
- Trading terminal aesthetic
- Green-on-black color scheme
- Matrix rain effects
- Glitch animations
- Chart patterns background

## Creating a New Room

### Step 1: Define Your Characters

Add new agents to `/shared/types/index.ts`:

```typescript
export const AGENTS = {
  // ... existing agents
  SCIENTIST: 'scientist',
  ARTIST: 'artist',
  PHILOSOPHER: 'philosopher'
} as const;
```

### Step 2: Create Character Prompts

In `/backend/src/conversation-room.ts`, add prompts:

```typescript
const AGENT_PROMPTS: Record<Agent, string> = {
  // ... existing prompts
  [AGENTS.SCIENTIST]: `You are a curious scientist...`,
  [AGENTS.ARTIST]: `You are a creative artist...`,
  [AGENTS.PHILOSOPHER]: `You are a deep thinker...`
}
```

### Step 3: Configure the Room

Add room configuration:

```typescript
const ROOM_CONFIGS: Record<RoomType, RoomConfig> = {
  // ... existing rooms
  science: {
    id: 'science',
    type: 'science',
    name: 'Science Lab',
    agents: [AGENTS.SCIENTIST, AGENTS.ARTIST, AGENTS.PHILOSOPHER],
    topics: [
      "Quantum mechanics",
      "Space exploration",
      "Genetic engineering",
      // ... more topics
    ]
  }
}
```

### Step 4: Update Room Types

In `/shared/types/index.ts`:

```typescript
export type RoomType = 'philosophy' | 'crypto' | 'science';
```

### Step 5: Create Frontend Page

Create `/frontend/app/science/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useWebSocket } from '../../hooks/useWebSocket'
// ... imports

function ScienceRoom() {
  // Similar structure to other rooms
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/stream/science`
  
  // ... component logic
}
```

### Step 6: Add Custom Styling

Create room-specific CSS for unique visual themes:
- Color schemes
- Background effects
- Animation styles
- Typography choices

## Room Features

### Shared Features
- Real-time WebSocket messaging
- Auto-reconnect with backoff
- Viewer count tracking
- Message history
- Audio support (TTS)
- Statistics tracking

### Customizable Elements
- AI character personalities
- Conversation topics
- Visual themes
- Message styling
- Background effects
- Sound effects

## Best Practices

### 1. Character Design
- Give each character a distinct voice
- Create natural conflicts/agreements
- Define clear perspectives
- Use appropriate language/slang

### 2. Topic Selection
- Choose engaging subjects
- Mix serious and light topics
- Ensure variety
- Match room theme

### 3. Visual Design
- Create immersive themes
- Use consistent color palettes
- Add subtle animations
- Ensure readability

### 4. Performance
- Limit visual effects on mobile
- Optimize animations
- Cache static assets
- Monitor WebSocket usage

## Room Management

### Switching Rooms
Users can navigate between rooms using:
- Direct URLs
- Navigation links
- Room selector (future feature)

### Room Persistence
- Each room maintains its own state
- Messages persist during session
- Statistics tracked separately
- No cross-room contamination

### Scaling Considerations
- Each room uses a separate Durable Object
- Rooms can scale independently
- Add rate limiting if needed
- Monitor costs per room

## Future Room Ideas

### Potential Themes
1. **Gaming Arena** - Game reviews, esports, development
2. **News Desk** - Current events, politics, analysis
3. **Creative Studio** - Art, music, literature
4. **Tech Hub** - Programming, startups, innovation
5. **Wellness Center** - Health, mindfulness, fitness

### Advanced Features
- User-created rooms
- Private rooms with passwords
- Room voting/moderation
- Custom AI training
- Real-time data integration

## Troubleshooting

### Common Issues
1. **WebSocket won't connect**: Check room type in URL
2. **Wrong characters appear**: Verify room config
3. **Styling broken**: Ensure CSS is imported
4. **No messages**: Check API key configuration

### Debug Tips
- Monitor browser console
- Check network tab for WebSocket
- Verify backend logs
- Test individual components