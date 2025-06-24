import { RoomPersonality, RoomDefinition, CharacterDefinition } from './room-personality-types'
import { roomPersonalities } from './room-personalities-data'
import type { RoomType } from '../../shared/types'

/**
 * Load room personality from embedded data
 */
export function loadRoomPersonality(roomType: RoomType): RoomPersonality {
  const personality = roomPersonalities[roomType]
  
  if (!personality) {
    console.error(`No personality found for room type: ${roomType}`)
    return getDefaultPersonality(roomType)
  }
  
  // Validate the personality structure
  try {
    validateRoomPersonality(personality)
    return personality
  } catch (error) {
    console.error(`Invalid personality for ${roomType}:`, error)
    return getDefaultPersonality(roomType)
  }
}

/**
 * Get character definition from room
 */
export function getCharacterFromRoom(
  roomType: RoomType, 
  characterName: string
): CharacterDefinition | null {
  const personality = loadRoomPersonality(roomType)
  return personality.characters[characterName.toLowerCase()] || null
}

/**
 * Get room definition
 */
export function getRoomDefinition(roomType: RoomType): RoomDefinition {
  const personality = loadRoomPersonality(roomType)
  return personality.room
}

/**
 * Validate room personality structure
 */
function validateRoomPersonality(personality: any): void {
  if (!personality.room || !personality.characters || !personality.interaction_patterns) {
    throw new Error('Invalid room personality structure')
  }
  
  // Validate room
  const room = personality.room
  if (!room.id || !room.name || !room.style || !room.topics) {
    throw new Error('Invalid room definition')
  }
  
  // Validate characters
  for (const [name, character] of Object.entries(personality.characters)) {
    if (!character || typeof character !== 'object') {
      throw new Error(`Invalid character definition for ${name}`)
    }
    const char = character as any
    if (!char.name || !char.personality || !char.speaking_style) {
      throw new Error(`Incomplete character definition for ${name}`)
    }
  }
}

/**
 * Default personality fallback
 */
function getDefaultPersonality(roomType: RoomType): RoomPersonality {
  return {
    room: {
      id: roomType,
      name: `${roomType} Room`,
      atmosphere: 'A space for conversation',
      purpose: 'Explore ideas through dialogue',
      visual_theme: 'Default theme',
      style: {
        tone: 'Conversational',
        pace: 'Moderate',
        depth: 'Varied',
        formality: 'Casual'
      },
      discussion_rules: ['Be respectful', 'Stay on topic', 'Build on ideas'],
      conversation_dynamics: {
        opening: 'Start with a greeting',
        flow: 'Natural progression',
        transitions: 'Smooth topic changes'
      },
      topics: {
        primary: ['General discussion'],
        secondary: ['Various topics']
      }
    },
    characters: {},
    interaction_patterns: {
      typical_exchange_flow: ['Speaker 1', 'Speaker 2', 'Speaker 3'],
      conflict_resolution: ['Find common ground'],
      topic_transitions: ['Natural progression']
    }
  }
}


/**
 * Get all character names for a room
 */
export function getRoomCharacters(roomType: RoomType): string[] {
  const personality = loadRoomPersonality(roomType)
  return Object.keys(personality.characters)
}

/**
 * Get interaction patterns for a room
 */
export function getRoomInteractionPatterns(roomType: RoomType) {
  const personality = loadRoomPersonality(roomType)
  return personality.interaction_patterns
}