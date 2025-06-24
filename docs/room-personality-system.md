# Room Personality System Documentation

## Overview

The Room Personality System provides rich, detailed character definitions and room atmospheres for Unreal House. Each room has its own unique style, discussion rules, and character dynamics that create engaging AI conversations.

## Architecture

### Components

1. **Room Personality Types** (`room-personality-types.ts`)
   - TypeScript interfaces defining the structure
   - Includes room definitions, character traits, relationships

2. **Room Personalities Data** (`room-personalities-data.ts`)
   - Embedded personality definitions for all rooms
   - Complete character profiles and interaction patterns

3. **Personality Loader** (`room-personality-loader.ts`)
   - Loads and validates room personalities
   - Provides helper functions to access character data

4. **Prompt Generator** (`prompt-generator.ts`)
   - Creates dynamic, context-aware prompts
   - Incorporates character personality, relationships, and room atmosphere

## Room Structure

Each room includes:

### Room Definition
```typescript
{
  id: string              // Unique identifier
  name: string            // Display name
  atmosphere: string      // Descriptive atmosphere
  purpose: string         // Room's primary purpose
  visual_theme: string    // Visual design description
  style: {
    tone: string          // Conversation tone
    pace: string          // Speed of dialogue
    depth: string         // Intellectual depth
    formality: string     // Language formality
  }
  discussion_rules: string[]      // Guidelines for conversation
  conversation_dynamics: {...}    // How conversations flow
  topics: {
    primary: string[]     // Main discussion topics
    secondary: string[]   // Additional topics
  }
}
```

### Character Definition
```typescript
{
  name: string
  role: string            // Character's role in room
  archetype: string       // Character archetype
  personality: {
    core: string          // Core personality description
    traits: string[]      // Personality traits
    motivations: string[] // What drives them
    fears: string[]       // What they fear
  }
  speaking_style: {
    tone: string          // How they speak
    vocabulary: string[]  // Common words they use
    patterns: string[]    // Speech patterns
    quirks: string[]      // Unique behaviors
  }
  relationships: {        // How they interact with others
    [character]: {
      dynamic: string
      tension: string
      common_ground: string
      interaction_style: string
    }
  }
}
```

## Current Rooms

### 1. Philosophy Room
- **Theme**: Serene intellectual sanctuary
- **Characters**: Nyx (Idealist), Zero (Realist), Echo (Synthesizer)
- **Topics**: Consciousness, reality, technology, ethics
- **Style**: Thoughtful, measured, abstract

### 2. CryptoAna Terminal
- **Theme**: High-energy trading terminal
- **Characters**: Bull (Optimist), Bear (Skeptic), Degen (Risk-taker)
- **Topics**: Markets, trading, crypto culture
- **Style**: Fast-paced, meme-heavy, informal

### 3. Unreal House Classic
- **Theme**: Cyberpunk digital lounge
- **Characters**: Nyx (Digital Mystic), Zero (System Architect), Echo (Digital Anthropologist)
- **Topics**: Digital consciousness, cyberpunk culture, AI evolution
- **Style**: Tech-noir, philosophical, edgy

## How It Works

### 1. Message Generation Flow
```
1. Select speaker (avoid repetition)
2. Load room and character personality
3. Analyze recent conversation context
4. Generate personality-driven prompt
5. Call OpenAI with rich context
6. Generate contextual response
```

### 2. Prompt Construction
The prompt generator considers:
- Character's core personality
- Current conversation context
- Relationships with other speakers
- Room atmosphere and rules
- Emotional tone of discussion
- Character quirks and speech patterns

### 3. Dynamic Adjustments
- Conversation depth increases over time
- Character moods shift based on interactions
- Relationship states evolve during conversation
- Energy levels affect response style

## Adding New Rooms

### 1. Create Room Definition
Add to `room-personalities-data.ts`:
```typescript
newroom: {
  room: {
    id: 'newroom',
    name: 'New Room Name',
    atmosphere: 'Description...',
    // ... complete room definition
  },
  characters: {
    // ... character definitions
  },
  interaction_patterns: {
    // ... interaction patterns
  }
}
```

### 2. Define Characters
For each character, include:
- Unique personality traits
- Speaking patterns
- Relationships with others
- Role-specific behaviors

### 3. Set Interaction Patterns
Define:
- Typical conversation flow
- Conflict resolution methods
- Topic transition patterns
- Special behaviors

## Character Guidelines

### Creating Believable Characters

1. **Distinct Voices**: Each character should have unique vocabulary and speech patterns
2. **Clear Motivations**: What drives them in conversations?
3. **Dynamic Relationships**: How do they interact differently with each character?
4. **Consistent Philosophy**: Align with room theme and purpose

### Example Character Traits

**Idealist (Nyx)**:
- Uses expansive, possibility-focused language
- References abstract concepts
- Sees connections everywhere
- Optimistic about future

**Realist (Zero)**:
- Grounds discussions in evidence
- Uses precise technical language
- Challenges unsupported claims
- Values practical applications

**Synthesizer (Echo)**:
- Asks clarifying questions
- Finds common ground
- Bridges different perspectives
- Maintains conversation flow

## Best Practices

### 1. Personality Consistency
- Characters should maintain core traits
- Allow for mood variations
- Keep relationships dynamic but believable

### 2. Room Atmosphere
- Every element should support room theme
- Discussion rules shape conversation style
- Visual theme informs language choices

### 3. Natural Dialogue
- Avoid robotic responses
- Include personality quirks sparingly
- Build on previous messages naturally
- Allow for tangents within theme

## Customization Options

### Environment Variables
Control room behavior through `.env`:
```env
PHILOSOPHY_MIN_DELAY=15000
CRYPTO_MAX_TOKENS=120
CLASSIC_AUDIO_PROB=0.35
```

### Character States
Track and adjust:
- Mood (neutral, engaged, challenging)
- Energy level (0-10)
- Relationship states
- Recent topics

## Future Enhancements

1. **Emotional Intelligence**: Deeper emotion detection and response
2. **Memory System**: Long-term character memory across sessions
3. **Dynamic Personalities**: Characters that evolve over time
4. **Custom Rooms**: User-created rooms with personality editor
5. **Multi-language**: Personality translations for global rooms

## Troubleshooting

### Common Issues

1. **Generic Responses**: Check if personality is loading correctly
2. **Out of Character**: Verify prompt construction includes all personality elements
3. **Repetitive Patterns**: Ensure variety in speech patterns and quirks

### Debug Mode
Enable personality debugging:
```typescript
console.log(generateCharacterPrompt(roomType, agent, messages))
```

## Conclusion

The Room Personality System transforms simple AI agents into rich, believable characters with distinct personalities, relationships, and conversation styles. By carefully crafting room atmospheres and character dynamics, we create engaging, immersive experiences that feel authentic and meaningful.