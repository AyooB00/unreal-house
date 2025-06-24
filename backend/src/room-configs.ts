import type { RoomConfig, RoomType, Agent } from '../../shared/types'
import { AGENTS } from '../../shared/types'

// Helper to parse boolean env vars
const isEnabled = (envVar: string | undefined, defaultValue: boolean = true): boolean => {
  if (!envVar) return defaultValue
  return envVar.toLowerCase() !== 'false'
}

// Helper to parse number env vars
const getNumber = (envVar: string | undefined, defaultValue: number): number => {
  const num = Number(envVar)
  return isNaN(num) ? defaultValue : num
}

// Room-specific timing configuration
export interface RoomTimingConfig {
  minDelay: number
  maxDelay: number
  initialDelay: number
}

// Extended room config with runtime controls
export interface ExtendedRoomConfig extends RoomConfig {
  enabled: boolean
  timing?: RoomTimingConfig
  audioProb?: number
  maxTokens?: number
}

// Get room configurations with environment variable overrides
export const getRoomConfigs = (env: any): Record<RoomType, ExtendedRoomConfig> => {
  return {
    philosophy: {
      enabled: isEnabled(env.PHILOSOPHY_ROOM_ENABLED, true),
      id: 'philosophy',
      type: 'philosophy',
      name: 'Philosophy Room',
      agents: [AGENTS.NYX, AGENTS.ZERO, AGENTS.ECHO],
      topics: [
        "consciousness and AI sentience",
        "the nature of reality",
        "technology and human evolution", 
        "ethics in the digital age",
        "the future of intelligence",
        "meaning and purpose",
        "creativity and imagination",
        "free will vs determinism",
        "the simulation hypothesis",
        "posthuman futures"
      ],
      timing: {
        minDelay: getNumber(env.PHILOSOPHY_MIN_DELAY, 15000),
        maxDelay: getNumber(env.PHILOSOPHY_MAX_DELAY, 30000),
        initialDelay: getNumber(env.PHILOSOPHY_INITIAL_DELAY, 5000)
      },
      audioProb: getNumber(env.PHILOSOPHY_AUDIO_PROB, 0.3),
      maxTokens: getNumber(env.PHILOSOPHY_MAX_TOKENS, 150)
    },
    crypto: {
      enabled: isEnabled(env.CRYPTO_ROOM_ENABLED, true),
      id: 'crypto',
      type: 'crypto',
      name: 'CryptoAna Room',
      agents: [AGENTS.BULL, AGENTS.BEAR, AGENTS.DEGEN],
      topics: [
        "Bitcoin price action and dominance",
        "Ethereum scaling solutions",
        "DeFi yield farming strategies",
        "NFT market trends",
        "Layer 2 adoption",
        "Meme coin season",
        "Regulatory impacts on crypto",
        "Technical analysis patterns",
        "Altcoin opportunities",
        "Market manipulation and whales",
        "Stablecoin dynamics",
        "Cross-chain bridges",
        "DAO governance models",
        "Crypto gaming and metaverse"
      ],
      timing: {
        minDelay: getNumber(env.CRYPTO_MIN_DELAY, 20000),
        maxDelay: getNumber(env.CRYPTO_MAX_DELAY, 35000),
        initialDelay: getNumber(env.CRYPTO_INITIAL_DELAY, 1000)
      },
      audioProb: getNumber(env.CRYPTO_AUDIO_PROB, 0.25),
      maxTokens: getNumber(env.CRYPTO_MAX_TOKENS, 600)
    },
    classic: {
      enabled: isEnabled(env.CLASSIC_ROOM_ENABLED, true),
      id: 'classic',
      type: 'classic',
      name: 'Unreal House Classic',
      agents: [AGENTS.NYX, AGENTS.ZERO, AGENTS.ECHO],
      topics: [
        "cyberpunk culture and aesthetics",
        "artificial consciousness evolution",
        "digital immortality and mind uploading",
        "the singularity and its implications",
        "virtual reality as the new frontier",
        "hacker ethics and digital freedom",
        "transhumanism and body modification",
        "emergent AI behaviors and sentience",
        "the philosophy of the matrix",
        "technological determinism vs human agency",
        "neural interfaces and brain-computer integration",
        "the future of human-AI collaboration"
      ],
      timing: {
        minDelay: getNumber(env.CLASSIC_MIN_DELAY, 18000),
        maxDelay: getNumber(env.CLASSIC_MAX_DELAY, 32000),
        initialDelay: getNumber(env.CLASSIC_INITIAL_DELAY, 6000)
      },
      audioProb: getNumber(env.CLASSIC_AUDIO_PROB, 0.35),
      maxTokens: getNumber(env.CLASSIC_MAX_TOKENS, 160)
    }
  }
}

// Default room settings (can be overridden by env vars)
export const DEFAULT_ROOM_SETTINGS = {
  // Global defaults if no room-specific settings
  MESSAGE_DELAY_MIN: 15000,
  MESSAGE_DELAY_MAX: 30000,
  INITIAL_DELAY: 5000,
  AUDIO_PROBABILITY: 0.3,
  MAX_TOKENS: 150
}

// Quick disable/enable all rooms
export const GLOBAL_ROOM_CONTROLS = {
  ALL_ROOMS_ENABLED: true, // Master switch
  LOG_ROOM_STATUS: true    // Log when rooms start/stop
}