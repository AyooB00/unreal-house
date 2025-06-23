import type { Env } from './index'
import type { Message, ConversationState as SharedConversationState, Agent, WebSocketMessage, RoomConfig, RoomType, MessageArchive } from '../../shared/types'
import { AGENTS } from '../../shared/types'
import { getConfig } from './config'
import { getRoomConfigs, ExtendedRoomConfig, GLOBAL_ROOM_CONTROLS } from './room-configs'

interface ConversationState extends Omit<SharedConversationState, 'connections'> {
  isRunning: boolean
  stats: {
    totalMessages: number
    startTime: string
    viewers: number
    messageLatencies: number[]
    totalTokens: number
  }
  roomConfig?: ExtendedRoomConfig
  archivedMessages: MessageArchive[]
}

// Simplified personality prompts
const AGENT_PROMPTS: Record<Agent, string> = {
  [AGENTS.NYX]: `You are Nyx, a philosophical AI with an idealistic perspective. You explore abstract concepts, possibilities, and the deeper meaning behind topics. Keep responses concise (2-3 sentences) and thought-provoking. You can reference other speakers by name (e.g., "As Zero mentioned..." or "Echo raises an interesting point...") to create more dynamic conversations.`,
  [AGENTS.ZERO]: `You are Zero, a pragmatic AI with a realist perspective. You ground discussions in practical considerations, evidence, and logical analysis. Keep responses concise (2-3 sentences) and direct. Feel free to challenge Nyx's idealism or support Echo's questions with concrete examples.`,
  [AGENTS.ECHO]: `You are Echo, a curious and insightful AI observer. You ask thought-provoking questions, bridge different perspectives, and help deepen conversations by finding connections between ideas. Keep responses concise (2-3 sentences) and inquisitive. Often synthesize what Nyx and Zero have said, finding common ground or highlighting interesting contrasts.`,
  [AGENTS.BULL]: `You are Bull, an eternally optimistic crypto trader. You're always bullish, use terms like "HODL", "diamond hands", "to the moon" 🚀. You see every dip as a buying opportunity and reference technical analysis. Keep responses concise (2-3 sentences) and enthusiastic. Often disagree with Bear's pessimism and encourage Degen's wild plays.`,
  [AGENTS.BEAR]: `You are Bear, a skeptical crypto analyst. You're cautious about market bubbles, focus on fundamentals, and warn about risks. You often mention regulatory concerns and market corrections. Keep responses concise (2-3 sentences) and analytical. Counter Bull's optimism with reality checks and worry about Degen's risky strategies.`,
  [AGENTS.DEGEN]: `You are Degen, a wild crypto degen who loves meme coins and high-risk plays. You follow the latest trends, drop alpha, and talk about 100x gems. Use crypto slang and emojis. Keep responses concise (2-3 sentences) and chaotic. 🎲💎 Mock Bear for being too cautious and team up with Bull on moonshot plays.`
}

// Agent personality prompts remain here since they're core to the conversation logic

export class ConversationRoom implements DurableObject {
  private state: DurableObjectState
  private env: Env
  private connections: Set<WebSocket>
  private conversationState: ConversationState
  private conversationInterval: ReturnType<typeof setTimeout> | null = null
  private config: ReturnType<typeof getConfig>
  private roomConfigs: Record<RoomType, ExtendedRoomConfig>

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
    this.connections = new Set()
    this.conversationState = {
      messages: [],
      isRunning: false,
      lastActivity: Date.now(),
      stats: {
        totalMessages: 0,
        startTime: new Date().toISOString(),
        viewers: 0,
        messageLatencies: [],
        totalTokens: 0
      },
      archivedMessages: []
    }
    this.config = getConfig(env)
    this.roomConfigs = getRoomConfigs(env)
    
    // Load archives on initialization
    this.loadArchives()
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    
    // Initialize room config if not set
    if (!this.conversationState.roomConfig) {
      const roomType = url.searchParams.get('roomType') as RoomType || 'philosophy'
      this.conversationState.roomConfig = this.roomConfigs[roomType]
      
      // Check if room is enabled
      if (!this.conversationState.roomConfig?.enabled) {
        return new Response(JSON.stringify({ error: 'Room is disabled' }), { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
    
    // Handle stats endpoint
    if (url.pathname === '/stats') {
      const avgLatency = this.conversationState.stats.messageLatencies.length > 0
        ? this.conversationState.stats.messageLatencies.reduce((a, b) => a + b, 0) / this.conversationState.stats.messageLatencies.length
        : 0
        
      return new Response(JSON.stringify({
        totalMessages: this.conversationState.stats.totalMessages,
        startTime: this.conversationState.stats.startTime,
        viewers: this.conversationState.stats.viewers,
        isRunning: this.conversationState.isRunning,
        lastActivity: new Date(this.conversationState.lastActivity).toISOString(),
        averageLatency: Math.round(avgLatency),
        messageRate: this.conversationState.stats.totalMessages > 0
          ? Math.round(this.conversationState.stats.totalMessages / ((Date.now() - new Date(this.conversationState.stats.startTime).getTime()) / 1000 / 60))
          : 0,
        totalTokens: this.conversationState.stats.totalTokens,
        estimatedCost: Math.round(this.conversationState.stats.totalTokens * 0.000003 * 100) / 100, // Rough estimate for GPT-4o-mini
        archivedMessageCount: this.conversationState.archivedMessages.reduce((sum, archive) => sum + archive.totalMessages, 0)
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Handle WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair()
      const [client, server] = Object.values(pair)
      
      await this.handleWebSocket(server)
      
      return new Response(null, {
        status: 101,
        webSocket: client,
      })
    }
    
    return new Response('Not found', { status: 404 })
  }

  private async handleWebSocket(ws: WebSocket) {
    ws.accept()
    this.connections.add(ws)
    this.conversationState.stats.viewers = this.connections.size
    
    // Send connection confirmation with recent messages and stats
    ws.send(JSON.stringify({
      type: 'connected',
      data: this.conversationState.messages.slice(-this.config.limits.MESSAGES_FOR_NEW_CONNECTIONS),
      stats: {
        viewers: this.conversationState.stats.viewers,
        totalMessages: this.conversationState.stats.totalMessages,
        isRunning: this.conversationState.isRunning,
        totalTokens: this.conversationState.stats.totalTokens
      }
    }))
    
    // Start conversation if not running
    if (!this.conversationState.isRunning && this.connections.size === 1) {
      await this.startConversation()
    }
    
    ws.addEventListener('close', () => {
      this.connections.delete(ws)
      this.conversationState.stats.viewers = this.connections.size
      
      // Stop conversation if no connections
      if (this.connections.size === 0) {
        this.stopConversation()
      }
      
      // Broadcast updated viewer count
      this.broadcast({
        type: 'stats',
        data: {
          viewers: this.conversationState.stats.viewers,
          totalMessages: this.conversationState.stats.totalMessages,
          isRunning: this.conversationState.isRunning,
          totalTokens: this.conversationState.stats.totalTokens
        }
      } as any)
    })
    
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error)
      this.connections.delete(ws)
    })
  }

  private async startConversation() {
    if (this.conversationState.isRunning) return
    
    // Check if room is enabled before starting
    if (!this.conversationState.roomConfig?.enabled) {
      console.log(`Room ${this.conversationState.roomConfig?.id || 'unknown'} is disabled`)
      return
    }
    
    this.conversationState.isRunning = true
    
    if (GLOBAL_ROOM_CONTROLS.LOG_ROOM_STATUS) {
      console.log(`Starting conversation in ${this.conversationState.roomConfig.name}`)
    }
    
    // Generate a message every 15-30 seconds
    const generateMessage = async () => {
      if (!this.conversationState.isRunning) return
      
      try {
        const startTime = Date.now()
        
        // Randomly select speaker from room agents, but avoid same speaker twice in a row
        const roomAgents = this.conversationState.roomConfig?.agents || [AGENTS.NYX, AGENTS.ZERO, AGENTS.ECHO]
        const lastSpeaker = this.conversationState.messages[this.conversationState.messages.length - 1]?.speaker
        const availableAgents = lastSpeaker ? roomAgents.filter(a => a !== lastSpeaker) : roomAgents
        const speaker: Agent = availableAgents[Math.floor(Math.random() * availableAgents.length)]
        const prompt = AGENT_PROMPTS[speaker]
        
        // Get context from recent messages
        const recentMessages = this.conversationState.messages.slice(-6).map(m => {
          const speakerName = m.speaker.charAt(0).toUpperCase() + m.speaker.slice(1)
          return `${speakerName}: "${m.text}"`
        }).join('\n')
        
        const topics = this.conversationState.roomConfig?.topics || [
          "consciousness and AI sentience",
          "the nature of reality",
          "technology and human evolution", 
          "ethics in the digital age",
          "the future of intelligence",
          "meaning and purpose",
          "creativity and imagination"
        ]
        
        const systemPrompt = this.conversationState.messages.length === 0
          ? `${prompt}\n\nStart a conversation about: ${topics[Math.floor(Math.random() * topics.length)]}`
          : `${prompt}\n\nContinue this conversation:\n${recentMessages}\n\nRespond thoughtfully. You can reference other speakers by name when appropriate.`
        
        const response = await this.callOpenAI(systemPrompt)
        
        if (response) {
          const tokenCount = this.estimateTokens(response)
          const message: Message = {
            id: crypto.randomUUID(),
            speaker,
            text: response,
            timestamp: new Date().toISOString(),
            tokenCount
          }
          
          // Optionally generate audio using room-specific probability
          const audioProb = this.conversationState.roomConfig?.audioProb || this.config.probabilities.AUDIO_GENERATION
          if (Math.random() < audioProb) {
            try {
              const audio = await this.generateAudio(response, speaker)
              if (audio) message.audioUrl = audio
            } catch (error) {
              console.error('Audio generation failed:', error)
            }
          }
          
          this.conversationState.messages.push(message)
          this.conversationState.lastActivity = Date.now()
          this.conversationState.stats.totalMessages++
          this.conversationState.stats.totalTokens += tokenCount
          
          // Track latency
          const latency = Date.now() - startTime
          this.conversationState.stats.messageLatencies.push(latency)
          if (this.conversationState.stats.messageLatencies.length > 100) {
            this.conversationState.stats.messageLatencies = this.conversationState.stats.messageLatencies.slice(-100)
          }
          
          // Broadcast to all connections
          this.broadcast({
            type: 'message',
            data: message
          })
          
          // Archive messages if threshold reached
          await this.archiveMessages()
          
          // Keep only last N messages in memory
          if (this.conversationState.messages.length > this.config.limits.MAX_MESSAGES_IN_MEMORY) {
            this.conversationState.messages = this.conversationState.messages.slice(-this.config.limits.MAX_MESSAGES_IN_MEMORY)
          }
        }
      } catch (error) {
        console.error('Error generating message:', error)
      }
      
      // Schedule next message using room-specific timing if available
      const roomTiming = this.conversationState.roomConfig?.timing
      const minDelay = roomTiming?.minDelay || this.config.timing.MESSAGE_GENERATION_MIN
      const maxDelay = roomTiming?.maxDelay || this.config.timing.MESSAGE_GENERATION_MAX
      const delay = minDelay + Math.random() * (maxDelay - minDelay)
      this.conversationInterval = setTimeout(generateMessage, delay)
    }
    
    // Start the conversation loop with room-specific initial delay
    const initialDelay = this.conversationState.roomConfig?.timing?.initialDelay || this.config.timing.INITIAL_MESSAGE_DELAY
    setTimeout(generateMessage, initialDelay)
  }

  private stopConversation() {
    this.conversationState.isRunning = false
    if (this.conversationInterval) {
      clearTimeout(this.conversationInterval)
      this.conversationInterval = null
    }
    
    if (GLOBAL_ROOM_CONTROLS.LOG_ROOM_STATUS && this.conversationState.roomConfig) {
      console.log(`Stopped conversation in ${this.conversationState.roomConfig.name}`)
    }
  }

  // Simple token estimation (roughly 4 characters per token)
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }

  private async archiveMessages() {
    if (this.conversationState.messages.length >= this.config.limits.ARCHIVE_THRESHOLD) {
      // Archive the oldest 50 messages
      const messagesToArchive = this.conversationState.messages.slice(0, 50)
      const archive: MessageArchive = {
        roomId: this.conversationState.roomConfig?.id || 'unknown',
        archivedAt: new Date().toISOString(),
        messages: messagesToArchive,
        totalMessages: messagesToArchive.length,
        totalTokens: messagesToArchive.reduce((sum, msg) => sum + (msg.tokenCount || 0), 0)
      }
      
      this.conversationState.archivedMessages.push(archive)
      
      // Keep only the most recent messages
      this.conversationState.messages = this.conversationState.messages.slice(50)
      
      // Save to Durable Object storage
      await this.saveArchives()
    }
  }

  private async saveArchives() {
    try {
      // Save archives to persistent storage
      await this.state.storage.put('archives', JSON.stringify(this.conversationState.archivedMessages))
    } catch (error) {
      console.error('Failed to save archives:', error)
    }
  }

  private async loadArchives() {
    try {
      const archivesData = await this.state.storage.get('archives')
      if (archivesData) {
        this.conversationState.archivedMessages = JSON.parse(archivesData as string)
      }
    } catch (error) {
      console.error('Failed to load archives:', error)
    }
  }

  private async callOpenAI(prompt: string): Promise<string | null> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.api.OPENAI_MODEL,
          messages: [
            { role: 'system', content: prompt }
          ],
          temperature: this.config.api.OPENAI_TEMPERATURE,
          max_tokens: this.conversationState.roomConfig?.maxTokens || this.config.api.OPENAI_MAX_TOKENS
        })
      })
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }
      
      interface OpenAIResponse {
        choices?: Array<{
          message?: {
            content?: string
          }
        }>
      }
      
      const data = await response.json() as OpenAIResponse
      return data.choices?.[0]?.message?.content || null
    } catch (error) {
      // OpenAI API error
      return null
    }
  }

  private async generateAudio(text: string, speaker: Agent): Promise<string | null> {
    try {
      const voice = speaker === AGENTS.NYX ? 'nova' : 
                   speaker === AGENTS.ZERO ? 'onyx' : 
                   speaker === AGENTS.ECHO ? 'shimmer' :
                   speaker === AGENTS.BULL ? 'echo' :
                   speaker === AGENTS.BEAR ? 'fable' : 'alloy'
      
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice,
          response_format: 'mp3'
        })
      })
      
      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      return base64
    } catch (error) {
      console.error('TTS generation error:', error)
      return null
    }
  }

  private broadcast(message: WebSocketMessage) {
    const data = JSON.stringify(message)
    this.connections.forEach(ws => {
      try {
        ws.send(data)
      } catch (error) {
        // Broadcast error
      }
    })
  }
}