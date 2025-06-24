import { TIMING, LIMITS, PROBABILITIES, API } from '../../shared/constants'

export interface Config {
  timing: {
    MESSAGE_GENERATION_MIN: number
    MESSAGE_GENERATION_MAX: number
    RECONNECT_DELAY: number
    INITIAL_MESSAGE_DELAY: number
  }
  limits: {
    MAX_MESSAGES_IN_MEMORY: number
    MAX_TOKENS_PER_RESPONSE: number
    CONTEXT_MESSAGES_COUNT: number
    MESSAGES_FOR_NEW_CONNECTIONS: number
    ARCHIVE_THRESHOLD: number
    MAX_DAILY_MESSAGES_PER_ROOM: number
  }
  probabilities: {
    AUDIO_GENERATION: number
  }
  api: {
    OPENAI_MODEL: string
    OPENAI_TEMPERATURE: number
    OPENAI_MAX_TOKENS: number
    ELEVENLABS_VOICE_IDS: {
      NYX: string
      ZERO: string
    }
  }
  environment: 'development' | 'production'
}

interface Env {
  ENVIRONMENT?: string
  OPENAI_MODEL?: string
  OPENAI_API_KEY?: string
  MAX_DAILY_MESSAGES?: string
}

export function getConfig(env: Env): Config {
  const environment = env.ENVIRONMENT || 'development'
  
  // You can override specific values based on environment
  const config: Config = {
    timing: {
      ...TIMING,
      // Override for development if needed
      ...(environment === 'development' ? {
        MESSAGE_GENERATION_MIN: 10000, // Faster in dev
        MESSAGE_GENERATION_MAX: 20000,
      } : {})
    },
    limits: {
      ...LIMITS,
      // Override daily limit if provided
      ...(env.MAX_DAILY_MESSAGES ? {
        MAX_DAILY_MESSAGES_PER_ROOM: parseInt(env.MAX_DAILY_MESSAGES, 10)
      } : {})
    },
    probabilities: {
      ...PROBABILITIES,
      // Could adjust probabilities per environment
      ...(environment === 'development' ? {
        AUDIO_GENERATION: 0.1, // Less audio in dev to save API calls
      } : {})
    },
    api: {
      ...API,
      // Allow environment override if needed
      ...(env.OPENAI_MODEL ? {
        OPENAI_MODEL: env.OPENAI_MODEL
      } : {})
    },
    environment: environment as 'development' | 'production'
  }
  
  return config
}