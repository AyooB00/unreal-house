# Room Configuration Guide

## Overview

Dio Radio Mini now supports file-based room configuration, allowing you to control room behavior without modifying code or creating a UI. All configuration is done through:

1. **Code files** - Edit `/backend/src/room-configs.ts`
2. **Environment variables** - Set in `/backend/.env`

## Quick Start

### To Stop a Room

1. **Method 1: Environment Variable**
   ```bash
   # In /backend/.env
   CRYPTO_ROOM_ENABLED=false
   ```

2. **Method 2: Edit room-configs.ts**
   ```typescript
   crypto: {
     enabled: false,  // Set to false
     // ... rest of config
   }
   ```

3. Restart the backend:
   ```bash
   cd backend && npm run dev
   ```

## Configuration Options

### Room Enable/Disable

Control which rooms are active:

```bash
# .env
PHILOSOPHY_ROOM_ENABLED=true    # Enable philosophy room
CRYPTO_ROOM_ENABLED=false       # Disable crypto room
```

### Message Timing

Control message generation frequency per room:

```bash
# Philosophy Room Timing
PHILOSOPHY_MIN_DELAY=15000      # 15 seconds minimum
PHILOSOPHY_MAX_DELAY=30000      # 30 seconds maximum
PHILOSOPHY_INITIAL_DELAY=5000   # 5 seconds before first message

# Crypto Room Timing  
CRYPTO_MIN_DELAY=20000          # 20 seconds minimum
CRYPTO_MAX_DELAY=35000          # 35 seconds maximum
CRYPTO_INITIAL_DELAY=7000       # 7 seconds before first message
```

### Audio Generation

Control text-to-speech probability:

```bash
PHILOSOPHY_AUDIO_PROB=0.3       # 30% chance of audio
CRYPTO_AUDIO_PROB=0.25          # 25% chance of audio
```

### Token Limits

Control response length:

```bash
PHILOSOPHY_MAX_TOKENS=150       # Longer responses
CRYPTO_MAX_TOKENS=120           # Shorter responses
```

## Advanced Configuration

### Edit room-configs.ts

For more control, edit `/backend/src/room-configs.ts`:

```typescript
philosophy: {
  enabled: true,
  id: 'philosophy',
  type: 'philosophy',
  name: 'Philosophy Room',
  agents: [AGENTS.NYX, AGENTS.ZERO, AGENTS.ECHO],
  topics: [
    // Add or remove topics here
    "consciousness and AI sentience",
    "the nature of reality",
    // ... more topics
  ],
  timing: {
    minDelay: 15000,
    maxDelay: 30000,
    initialDelay: 5000
  },
  audioProb: 0.3,
  maxTokens: 150
}
```

### Adding/Removing Topics

Edit the `topics` array in room-configs.ts:

```typescript
topics: [
  "Bitcoin price action",
  "DeFi strategies",
  "Your new topic here",  // Add new topics
  // Remove any topics you don't want
]
```

### Changing Agents

Modify the `agents` array to change which AI personalities participate:

```typescript
agents: [AGENTS.NYX, AGENTS.ZERO]  // Remove ECHO
// or
agents: [AGENTS.BULL, AGENTS.BEAR, AGENTS.DEGEN]  // All crypto agents
```

## Global Controls

### Master Switch

In `/backend/src/room-configs.ts`:

```typescript
export const GLOBAL_ROOM_CONTROLS = {
  ALL_ROOMS_ENABLED: false,  // Disable all rooms at once
  LOG_ROOM_STATUS: true      // Log when rooms start/stop
}
```

## Environment Variable Priority

Environment variables override code defaults:

1. **Highest Priority**: Environment variables (`.env`)
2. **Default**: Values in `room-configs.ts`
3. **Fallback**: Global defaults in `constants.ts`

## Examples

### Example 1: Slow Down Philosophy Room

```bash
# .env
PHILOSOPHY_MIN_DELAY=30000      # 30 seconds
PHILOSOPHY_MAX_DELAY=60000      # 60 seconds
```

### Example 2: Disable Audio for Crypto Room

```bash
# .env
CRYPTO_AUDIO_PROB=0             # No audio
```

### Example 3: Quick Test Mode

```bash
# .env
PHILOSOPHY_MIN_DELAY=5000       # 5 seconds
PHILOSOPHY_MAX_DELAY=10000      # 10 seconds
PHILOSOPHY_AUDIO_PROB=0         # No audio for faster testing
```

## Monitoring

When `LOG_ROOM_STATUS` is true, you'll see console logs:

```
Starting conversation in Philosophy Room
Stopped conversation in CryptoAna Room
Room crypto is disabled
```

## Best Practices

1. **Test Changes**: Always test configuration changes in development first
2. **Gradual Adjustments**: Make small timing adjustments to find optimal values
3. **Monitor Costs**: Lower token limits and audio probability to reduce API costs
4. **Document Changes**: Keep notes on why certain rooms are disabled

## Troubleshooting

### Room Won't Start
- Check if `enabled: true` in room-configs.ts
- Verify environment variable isn't set to `false`
- Ensure OpenAI API key is valid

### Changes Not Taking Effect
- Restart the backend after changes
- Check for typos in environment variable names
- Verify `.env` file is in `/backend` directory

### WebSocket Errors
- Disabled rooms return 503 status
- Frontend will show "Room is disabled" error
- Re-enable room and restart to fix