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
      // Could adjust limits per environment
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
      // Could use different models per environment
      ...(environment === 'development' ? {
        OPENAI_MODEL: 'gpt-3.5-turbo', // Cheaper model in dev
      } : {
        OPENAI_MODEL: env.OPENAI_MODEL || 'gpt-4o-mini', // Better model in prod
      })
    },
    environment: environment as 'development' | 'production'
  }
  
  return config
}