// Room Personality Type Definitions

export interface RoomPersonality {
  room: RoomDefinition
  characters: Record<string, CharacterDefinition>
  interaction_patterns: InteractionPatterns
}

export interface RoomDefinition {
  id: string
  name: string
  atmosphere: string
  purpose: string
  visual_theme: string
  style: RoomStyle
  discussion_rules: string[]
  conversation_dynamics: ConversationDynamics
  topics: {
    primary: string[]
    secondary: string[]
  }
}

export interface RoomStyle {
  tone: string
  pace: string
  depth: string
  formality: string
}

export interface ConversationDynamics {
  opening: string
  flow: string
  transitions: string
  depth_progression?: string
  intensity?: string
  atmosphere?: string
}

export interface CharacterDefinition {
  name: string
  role: string
  archetype: string
  personality: CharacterPersonality
  speaking_style: SpeakingStyle
  philosophical_leanings?: string[]
  trading_style?: string[]
  cyberpunk_philosophy?: string[]
  relationships: Record<string, CharacterRelationship>
}

export interface CharacterPersonality {
  core: string
  traits: string[]
  motivations: string[]
  fears: string[]
}

export interface SpeakingStyle {
  tone: string
  vocabulary: string[]
  patterns: string[]
  quirks: string[]
}

export interface CharacterRelationship {
  dynamic: string
  tension: string
  common_ground: string
  interaction_style: string
}

export interface InteractionPatterns {
  typical_exchange_flow: string[]
  conflict_resolution: string[]
  topic_transitions: string[]
  special_behaviors?: string[]
}

// Enhanced prompt context for generation
export interface PromptContext {
  room: RoomDefinition
  character: CharacterDefinition
  otherSpeakers: string[]
  recentMessages: Array<{
    speaker: string
    text: string
  }>
  currentTopic?: string
  conversationDepth: number // 0-10 scale
  emotionalTone: 'calm' | 'excited' | 'tense' | 'contemplative'
}

// Character state for dynamic personality
export interface CharacterState {
  mood: 'neutral' | 'engaged' | 'challenging' | 'supportive' | 'contemplative'
  recentTopics: string[]
  relationshipStates: Record<string, 'harmonious' | 'tension' | 'neutral'>
  energyLevel: number // 0-10 scale
}