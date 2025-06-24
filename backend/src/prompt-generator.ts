import { 
  CharacterDefinition, 
  RoomDefinition, 
  PromptContext,
  CharacterState 
} from './room-personality-types'
import { loadRoomPersonality, getCharacterFromRoom } from './room-personality-loader'
import type { RoomType, Agent } from '../../shared/types'

/**
 * Generate a rich, personality-driven prompt for a character
 */
export function generateCharacterPrompt(
  roomType: RoomType,
  agent: Agent,
  recentMessages: Array<{ speaker: string; text: string }>,
  currentTopic?: string
): string {
  const personality = loadRoomPersonality(roomType)
  const character = personality.characters[agent]
  
  if (!character) {
    console.warn(`Character ${agent} not found in room ${roomType}`)
    return getFallbackPrompt(agent)
  }
  
  const room = personality.room
  const context = buildPromptContext(room, character, recentMessages, currentTopic)
  
  return constructPrompt(context)
}

/**
 * Build comprehensive context for prompt generation
 */
function buildPromptContext(
  room: RoomDefinition,
  character: CharacterDefinition,
  recentMessages: Array<{ speaker: string; text: string }>,
  currentTopic?: string
): PromptContext {
  // Analyze conversation to determine context
  const otherSpeakers = [...new Set(recentMessages.map(m => m.speaker))].filter(s => s !== character.name.toLowerCase())
  const conversationDepth = calculateConversationDepth(recentMessages)
  const emotionalTone = detectEmotionalTone(recentMessages)
  
  return {
    room,
    character,
    otherSpeakers,
    recentMessages,
    currentTopic,
    conversationDepth,
    emotionalTone
  }
}

/**
 * Construct the actual prompt from context
 */
function constructPrompt(context: PromptContext): string {
  const { room, character, recentMessages, currentTopic } = context
  
  let prompt = `You are ${character.name}, ${character.role} in the ${room.name}.

${room.atmosphere}

Your core personality: ${character.personality.core}

Speaking style:
- Tone: ${character.speaking_style.tone}
- Use vocabulary like: ${character.speaking_style.vocabulary.slice(0, 5).join(', ')}
- Common patterns: "${character.speaking_style.patterns[0]}", "${character.speaking_style.patterns[1]}"

Character traits: ${character.personality.traits.join(', ')}

Current conversation context:`

  // Add recent messages
  if (recentMessages.length > 0) {
    prompt += '\n\nRecent messages:\n'
    recentMessages.forEach(msg => {
      const speaker = msg.speaker.charAt(0).toUpperCase() + msg.speaker.slice(1)
      prompt += `${speaker}: "${msg.text}"\n`
    })
  }
  
  // Add relationship dynamics
  const otherSpeakers = context.otherSpeakers
  if (otherSpeakers.length > 0) {
    prompt += '\n\nRelationship dynamics:\n'
    otherSpeakers.forEach(speaker => {
      const relationship = character.relationships[speaker.toLowerCase()]
      if (relationship) {
        prompt += `- With ${speaker}: ${relationship.interaction_style}\n`
      }
    })
  }
  
  // Add room-specific guidance
  prompt += `\n\nRoom discussion style: ${room.style.tone}
Pace: ${room.style.pace}

Guidelines:
- ${room.discussion_rules[0]}
- ${room.discussion_rules[1]}
- Keep your response concise (2-3 sentences for philosophy/classic, 5-8 sentences for crypto with analysis)
- Stay true to your character's personality and speaking style`
  
  // Add crypto-specific ASCII art guidance
  if (room.id === 'crypto') {
    prompt += `\n
CRITICAL RULES FOR CRYPTO ROOM:
1. ABSOLUTELY NO UNICODE EMOJIS - Never use 🚀 📈 💎 🔥 💰 📊 ⚡ 🐻 🐂 or ANY emoji
2. If you accidentally include an emoji, your response is invalid
3. Use ONLY ASCII characters and terminal-style formatting

ASCII ART REQUIREMENTS:
- Create PROFESSIONAL multi-line charts (minimum 5 lines tall)
- Include price axes, time labels, and proper formatting
- Use box-drawing characters: ═ ║ ╔ ╗ ╚ ╝ ─ │ ┌ ┐ └ ┘
- Example of GOOD chart:

  BTC/USD 4H Chart
  ╔═══════════════════════════════╗
  ║ $46K ┤     ╱╲    ← Resistance ║
  ║ $45K ┤  ╱╲╱  ╲                ║
  ║ $44K ┤╱╯      ╲╱╲ ← Current   ║
  ║ $43K ┤         ╰─╯            ║
  ╚═══════╧═══╧═══╧═══╧═══════════╝
         00:00 04:00 08:00 12:00

TERMINAL FORMATTING:
- Use markers: [BULL] [BEAR] [SIGNAL] [ALERT] [DATA]
- Price levels: ▬▬▬ Support ▬▬▬ or ═══ Resistance ═══
- Volume bars: ████ High █▓▓▓ Med ▒▒▒▒ Low
- Trends: ↗ Uptrend ↘ Downtrend → Sideways

ANALYSIS STRUCTURE:
- Start with market context and current price
- Include technical levels with ASCII visualization
- Reference indicators without emojis
- End with clear directional bias`
  }
  
  // Add current topic if available
  if (currentTopic) {
    prompt += `\n\nCurrent topic focus: ${currentTopic}`
  } else if (recentMessages.length === 0) {
    // Starting a new conversation
    const topics = room.topics.primary
    const randomTopic = topics[Math.floor(Math.random() * topics.length)]
    prompt += `\n\nStart a conversation about: ${randomTopic}`
    prompt += '\nOpen with an engaging observation or question that reflects your character.'
  }
  
  // Add character-specific quirks
  if (character.speaking_style.quirks.length > 0) {
    const quirk = character.speaking_style.quirks[Math.floor(Math.random() * character.speaking_style.quirks.length)]
    prompt += `\n\nRemember your quirk: ${quirk}`
  }
  
  // Add emotional tone guidance
  prompt += `\n\nThe conversation tone is ${context.emotionalTone}. Respond appropriately while maintaining your character.`
  
  // Final emoji check for crypto room
  if (room.id === 'crypto') {
    prompt += `\n\nFINAL CHECK: Your response MUST NOT contain ANY Unicode emojis. Use ONLY ASCII characters.`
  }
  
  return prompt
}

/**
 * Calculate conversation depth (0-10)
 */
function calculateConversationDepth(messages: Array<{ speaker: string; text: string }>): number {
  if (messages.length === 0) return 0
  
  // Simple heuristic based on message count and complexity
  const messageCount = Math.min(messages.length, 20)
  const avgLength = messages.reduce((sum, m) => sum + m.text.length, 0) / messages.length
  const complexityScore = avgLength > 200 ? 2 : avgLength > 100 ? 1 : 0
  
  return Math.min(10, Math.floor(messageCount / 2) + complexityScore)
}

/**
 * Detect emotional tone of conversation
 */
function detectEmotionalTone(messages: Array<{ speaker: string; text: string }>): 'calm' | 'excited' | 'tense' | 'contemplative' {
  if (messages.length === 0) return 'calm'
  
  // Simple keyword-based detection
  const recentText = messages.slice(-3).map(m => m.text.toLowerCase()).join(' ')
  
  if (recentText.includes('disagree') || recentText.includes('wrong') || recentText.includes('but')) {
    return 'tense'
  }
  if (recentText.includes('amazing') || recentText.includes('incredible') || recentText.includes('!')) {
    return 'excited'
  }
  if (recentText.includes('wonder') || recentText.includes('perhaps') || recentText.includes('consider')) {
    return 'contemplative'
  }
  
  return 'calm'
}

/**
 * Get character state for dynamic adjustments
 */
export function getCharacterState(
  character: CharacterDefinition,
  recentMessages: Array<{ speaker: string; text: string }>
): CharacterState {
  // Analyze recent interactions to determine state
  const mood = determineCharacterMood(character, recentMessages)
  const recentTopics = extractRecentTopics(recentMessages)
  const relationshipStates = determineRelationshipStates(character, recentMessages)
  const energyLevel = calculateEnergyLevel(recentMessages)
  
  return {
    mood,
    recentTopics,
    relationshipStates,
    energyLevel
  }
}

/**
 * Determine character's current mood
 */
function determineCharacterMood(
  character: CharacterDefinition,
  messages: Array<{ speaker: string; text: string }>
): CharacterState['mood'] {
  if (messages.length === 0) return 'neutral'
  
  // Check if character's ideas are being challenged
  const lastMessage = messages[messages.length - 1]
  if (lastMessage.text.toLowerCase().includes('disagree') || lastMessage.text.includes('but')) {
    return 'challenging'
  }
  
  // Check if character's interests are being discussed
  const recentText = messages.slice(-3).map(m => m.text).join(' ')
  const hasRelevantTopics = character.personality.motivations.some(motivation => 
    recentText.toLowerCase().includes(motivation.split(' ')[0].toLowerCase())
  )
  
  if (hasRelevantTopics) return 'engaged'
  
  return 'neutral'
}

/**
 * Extract topics from recent messages
 */
function extractRecentTopics(messages: Array<{ speaker: string; text: string }>): string[] {
  // Simple topic extraction based on keywords
  const topics: string[] = []
  const keywords = ['consciousness', 'reality', 'technology', 'crypto', 'market', 'digital', 'AI', 'human']
  
  messages.slice(-5).forEach(msg => {
    keywords.forEach(keyword => {
      if (msg.text.toLowerCase().includes(keyword) && !topics.includes(keyword)) {
        topics.push(keyword)
      }
    })
  })
  
  return topics
}

/**
 * Determine relationship states based on recent interactions
 */
function determineRelationshipStates(
  character: CharacterDefinition,
  messages: Array<{ speaker: string; text: string }>
): Record<string, 'harmonious' | 'tension' | 'neutral'> {
  const states: Record<string, 'harmonious' | 'tension' | 'neutral'> = {}
  
  // Initialize all relationships as neutral
  Object.keys(character.relationships).forEach(name => {
    states[name] = 'neutral'
  })
  
  // Analyze recent interactions
  messages.slice(-10).forEach((msg, idx) => {
    const speaker = msg.speaker.toLowerCase()
    if (states[speaker] !== undefined && idx > 0) {
      const prevMsg = messages[idx - 1]
      
      // Check for agreement/disagreement patterns
      if (msg.text.includes('agree') || msg.text.includes('exactly') || msg.text.includes('yes')) {
        states[speaker] = 'harmonious'
      } else if (msg.text.includes('disagree') || msg.text.includes('actually') || msg.text.includes('but')) {
        states[speaker] = 'tension'
      }
    }
  })
  
  return states
}

/**
 * Calculate character's energy level
 */
function calculateEnergyLevel(messages: Array<{ speaker: string; text: string }>): number {
  if (messages.length === 0) return 5
  
  // Base energy on conversation activity and excitement
  const recentMessages = messages.slice(-5)
  const avgLength = recentMessages.reduce((sum, m) => sum + m.text.length, 0) / recentMessages.length
  const excitementWords = ['amazing', 'incredible', 'fascinating', 'yes', '!', 'absolutely']
  const excitementCount = recentMessages.filter(m => 
    excitementWords.some(word => m.text.toLowerCase().includes(word))
  ).length
  
  const energy = 5 + (avgLength > 150 ? 2 : 0) + excitementCount
  return Math.min(10, Math.max(0, energy))
}

/**
 * Fallback prompt for unknown characters
 */
function getFallbackPrompt(agent: string): string {
  return `You are ${agent}, a thoughtful participant in this conversation. 
Keep your responses concise (2-3 sentences) and engage meaningfully with the discussion.
Build on previous speakers' ideas and maintain a respectful, curious tone.`
}