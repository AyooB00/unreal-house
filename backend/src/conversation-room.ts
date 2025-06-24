import type { Env } from './index'
import type { Message, ConversationState as SharedConversationState, Agent, WebSocketMessage, RoomConfig, RoomType, MessageArchive } from '../../shared/types'
import { AGENTS } from '../../shared/types'
import { getConfig } from './config'
import { getRoomConfigs, ExtendedRoomConfig, GLOBAL_ROOM_CONTROLS } from './room-configs'
import { saveMessage, saveArchive, getRoomArchives, searchRoomArchives, getRoomMessages, DbMessage, DbArchive } from './supabase'
import { generateCharacterPrompt } from './prompt-generator'

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
  dailyMessages: {
    count: number
    date: string // YYYY-MM-DD
  }
}


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
      archivedMessages: [],
      dailyMessages: {
        count: 0,
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
      }
    }
    this.config = getConfig(env)
    this.roomConfigs = getRoomConfigs(env)
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    
    // Initialize room config if not set
    if (!this.conversationState.roomConfig) {
      const roomType = url.searchParams.get('roomType') as RoomType || 'philosophy'
      this.conversationState.roomConfig = this.roomConfigs[roomType]
      
      // Load archives after room config is set
      await this.loadArchives()
      
      // Check if room is enabled
      if (!this.conversationState.roomConfig?.enabled) {
        return new Response(JSON.stringify({ error: 'Room is disabled' }), { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      // Auto-start conversation for enabled rooms
      if (!this.conversationState.isRunning && this.conversationState.roomConfig.enabled) {
        await this.startConversation()
      }
    }
    
    // Handle archives endpoint
    if (url.pathname === '/archives') {
      // Try to fetch from Supabase first
      const supabaseArchives = await getRoomArchives(
        this.conversationState.roomConfig?.id || 'unknown',
        this.env
      )
      
      // Convert Supabase archives to MessageArchive format
      const archives = supabaseArchives.map(dbArchive => ({
        roomId: dbArchive.room_id,
        archivedAt: dbArchive.archived_at,
        messages: dbArchive.messages || [],
        totalMessages: dbArchive.message_count,
        totalTokens: dbArchive.total_tokens
      }))
      
      return new Response(JSON.stringify({
        archives: archives.length > 0 ? archives : this.conversationState.archivedMessages,
        currentMessageCount: this.conversationState.messages.length,
        archiveThreshold: this.config.limits.ARCHIVE_THRESHOLD
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Handle search endpoint
    if (url.pathname === '/search') {
      const query = url.searchParams.get('q')
      if (!query) {
        return new Response(JSON.stringify({ error: 'Query parameter required' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      const results = await searchRoomArchives(
        this.conversationState.roomConfig?.id || 'unknown',
        query,
        this.env
      )
      
      return new Response(JSON.stringify({ results }), {
        headers: { 'Content-Type': 'application/json' }
      })
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
        archivedMessageCount: this.conversationState.archivedMessages.reduce((sum, archive) => sum + archive.totalMessages, 0),
        dailyMessages: {
          count: this.conversationState.dailyMessages.count,
          date: this.conversationState.dailyMessages.date,
          limit: this.config.limits.MAX_DAILY_MESSAGES_PER_ROOM,
          remaining: Math.max(0, this.config.limits.MAX_DAILY_MESSAGES_PER_ROOM - this.conversationState.dailyMessages.count)
        }
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
    
    // Send connection confirmation with recent messages, stats, and archives
    ws.send(JSON.stringify({
      type: 'connected',
      data: this.conversationState.messages.slice(-this.config.limits.MESSAGES_FOR_NEW_CONNECTIONS),
      stats: {
        viewers: this.conversationState.stats.viewers,
        totalMessages: this.conversationState.stats.totalMessages,
        isRunning: this.conversationState.isRunning,
        totalTokens: this.conversationState.stats.totalTokens
      },
      archives: this.conversationState.archivedMessages
    }))
    
    // Start conversation if not running (auto-start regardless of viewers)
    if (!this.conversationState.isRunning) {
      await this.startConversation()
    }
    
    ws.addEventListener('close', () => {
      this.connections.delete(ws)
      this.conversationState.stats.viewers = this.connections.size
      
      // Keep conversation running even with no connections
      // Commented out to allow auto-chat
      // if (this.connections.size === 0) {
      //   this.stopConversation()
      // }
      
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
    const generateMessage = async (isQuickStart: boolean = false) => {
      if (!this.conversationState.isRunning) return
      
      // Check daily message limit
      const today = new Date().toISOString().split('T')[0]
      if (this.conversationState.dailyMessages.date !== today) {
        // Reset counter for new day
        this.conversationState.dailyMessages = {
          count: 0,
          date: today
        }
      }
      
      if (this.conversationState.dailyMessages.count >= this.config.limits.MAX_DAILY_MESSAGES_PER_ROOM) {
        console.log(`Daily message limit reached for ${this.conversationState.roomConfig?.name || 'room'}`)
        // Schedule retry at midnight UTC
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
        tomorrow.setUTCHours(0, 0, 0, 0)
        const msUntilMidnight = tomorrow.getTime() - now.getTime()
        
        this.conversationInterval = setTimeout(generateMessage, msUntilMidnight)
        return
      }
      
      try {
        const startTime = Date.now()
        
        // Randomly select speaker from room agents, but avoid same speaker twice in a row
        const roomAgents = this.conversationState.roomConfig?.agents || [AGENTS.NYX, AGENTS.ZERO, AGENTS.ECHO]
        const lastSpeaker = this.conversationState.messages[this.conversationState.messages.length - 1]?.speaker
        const availableAgents = lastSpeaker ? roomAgents.filter(a => a !== lastSpeaker) : roomAgents
        const speaker: Agent = availableAgents[Math.floor(Math.random() * availableAgents.length)]
        
        // Get context from recent messages
        const recentMessages = this.conversationState.messages.slice(-6).map(m => ({
          speaker: m.speaker,
          text: m.text
        }))
        
        // Use the new personality-driven prompt generator
        const systemPrompt = generateCharacterPrompt(
          this.conversationState.roomConfig?.type || 'philosophy',
          speaker,
          recentMessages
        )
        
        let response = await this.callOpenAI(systemPrompt)
        
        if (response) {
          // Remove any emojis from crypto room responses
          if (this.conversationState.roomConfig?.type === 'crypto') {
            // Remove all Unicode emojis
            response = response.replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F1E6}-\u{1F1FF}]/gu, '')
            // Remove other common crypto emojis
            response = response.replace(/[🚀📈💎🔥💰📊⚡🐻🐂💸🎯🌙⭐💪🙌👀🤝💯📉🎲]/g, '')
          }
          
          const tokenCount = this.estimateTokens(response)
          const message: Message = {
            id: crypto.randomUUID(),
            speaker,
            text: response,
            timestamp: new Date().toISOString(),
            tokenCount
          }
          
          // Audio generation removed for simplicity
          
          this.conversationState.messages.push(message)
          this.conversationState.lastActivity = Date.now()
          this.conversationState.stats.totalMessages++
          this.conversationState.stats.totalTokens += tokenCount
          this.conversationState.dailyMessages.count++
          
          // Save to Supabase asynchronously
          const dbMessage: DbMessage = {
            id: message.id,
            room_id: this.conversationState.roomConfig?.id || 'unknown',
            speaker: message.speaker,
            text: message.text,
            audio_url: message.audioUrl,
            token_count: message.tokenCount,
            created_at: message.timestamp
          }
          saveMessage(dbMessage, this.env).catch(error => {
            console.error('Failed to save message to Supabase:', error)
          })
          
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
      if (!isQuickStart) {
        const roomTiming = this.conversationState.roomConfig?.timing
        const minDelay = roomTiming?.minDelay || this.config.timing.MESSAGE_GENERATION_MIN
        const maxDelay = roomTiming?.maxDelay || this.config.timing.MESSAGE_GENERATION_MAX
        const delay = minDelay + Math.random() * (maxDelay - minDelay)
        this.conversationInterval = setTimeout(() => generateMessage(false), delay)
      }
    }
    
    // Quick start: Generate 2-3 initial messages immediately if room is empty
    if (this.conversationState.messages.length === 0) {
      const quickStartMessages = this.conversationState.roomConfig?.id === 'crypto' ? 3 : 2
      
      // Generate initial messages with slight delays between them
      for (let i = 0; i < quickStartMessages; i++) {
        setTimeout(() => generateMessage(true), i * 1500) // 1.5 second delay between quick messages
      }
      
      // Schedule regular messages after quick start
      const regularDelay = (quickStartMessages * 1500) + 5000 // Wait for quick messages + 5 seconds
      setTimeout(() => generateMessage(false), regularDelay)
    } else {
      // Normal start with initial delay if messages already exist
      const initialDelay = this.conversationState.roomConfig?.timing?.initialDelay || this.config.timing.INITIAL_MESSAGE_DELAY
      setTimeout(() => generateMessage(false), initialDelay)
    }
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
      
      // Save to Supabase
      const dbArchive: DbArchive = {
        id: crypto.randomUUID(),
        room_id: archive.roomId,
        archived_at: archive.archivedAt,
        message_count: archive.totalMessages,
        total_tokens: archive.totalTokens,
        messages: archive.messages,
        summary: this.generateArchiveSummary(archive.messages)
      }
      
      const saved = await saveArchive(dbArchive, this.env)
      if (!saved) {
        console.error('Failed to save archive to Supabase')
        // Fall back to Durable Object storage
        await this.saveArchives()
      }
      
      // Broadcast archive update to all connections
      this.broadcast({
        type: 'archive',
        data: archive
      } as any)
    }
  }
  
  private generateArchiveSummary(messages: Message[]): string {
    // Generate a summary of the conversation
    const speakers = [...new Set(messages.map(m => m.speaker))]
    const topics = messages.slice(0, 10).map(m => m.text.substring(0, 100)).join(' ')
    return `Conversation between ${speakers.join(', ')} discussing: ${topics.substring(0, 500)}...`
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
      // First try to load from Supabase
      if (this.conversationState.roomConfig?.id) {
        const supabaseArchives = await getRoomArchives(
          this.conversationState.roomConfig.id,
          this.env,
          20 // Load last 20 archives
        )
        
        if (supabaseArchives.length > 0) {
          this.conversationState.archivedMessages = supabaseArchives.map(dbArchive => ({
            roomId: dbArchive.room_id,
            archivedAt: dbArchive.archived_at,
            messages: dbArchive.messages || [],
            totalMessages: dbArchive.message_count,
            totalTokens: dbArchive.total_tokens
          }))
          return
        }
      }
      
      // Fall back to Durable Object storage
      const archivesData = await this.state.storage.get('archives')
      if (archivesData) {
        this.conversationState.archivedMessages = JSON.parse(archivesData as string)
      }
    } catch (error) {
      console.error('Failed to load archives:', error)
    }
  }

  private async callOpenAI(prompt: string, retryCount: number = 0): Promise<string | null> {
    const maxRetries = 3;
    
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
      console.error(`OpenAI API error (attempt ${retryCount + 1}/${maxRetries}):`, error)
      
      // Retry with exponential backoff
      if (retryCount < maxRetries - 1) {
        const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.callOpenAI(prompt, retryCount + 1)
      }
      
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