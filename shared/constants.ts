export const TIMING = {
  MESSAGE_GENERATION_MIN: 15000, // 15 seconds
  MESSAGE_GENERATION_MAX: 30000, // 30 seconds
  RECONNECT_DELAY: 3000, // 3 seconds
  INITIAL_MESSAGE_DELAY: 5000, // 5 seconds
} as const;

export const LIMITS = {
  MAX_MESSAGES_IN_MEMORY: 100,
  MAX_TOKENS_PER_RESPONSE: 150,
  CONTEXT_MESSAGES_COUNT: 10,
  MESSAGES_FOR_NEW_CONNECTIONS: 10,
  ARCHIVE_THRESHOLD: 100,
  MAX_DAILY_MESSAGES_PER_ROOM: 2000, // ~$0.90 per room per day with gpt-4o-mini
} as const;

export const PROBABILITIES = {
  AUDIO_GENERATION: 0.3, // 30% chance of audio
} as const;

export const API = {
  OPENAI_MODEL: 'gpt-4o-mini',
  OPENAI_TEMPERATURE: 0.8,
  OPENAI_MAX_TOKENS: 150,
  ELEVENLABS_VOICE_IDS: {
    NYX: 'EXAVITQu4vr4xnSDxMaL', // Sarah
    ZERO: 'ErXwobaYiN019PkySvjV', // Antoni
  },
} as const;

export const ENDPOINTS = {
  HEALTH: '/health',
  STREAM: '/stream',
} as const;