import { Hono } from 'hono'

export interface Env {
  CONVERSATION_ROOM: DurableObjectNamespace
  OPENAI_API_KEY: string
  ENVIRONMENT: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_KEY?: string
}

const app = new Hono<{ Bindings: Env }>()

// Root route
app.get('/', async (c) => {
  return c.json({
    name: 'Unreal House API',
    version: '1.0.0',
    status: 'online',
    endpoints: [
      'GET /health',
      'GET /status',
      'GET /api/stats',
      'GET /stream (philosophy room)',
      'GET /stream/philosophy',
      'GET /stream/classic', 
      'GET /stream/crypto'
    ]
  })
})

// Health check
app.get('/health', async (c) => {
  const hasApiKey = !!c.env.OPENAI_API_KEY
  
  return c.json({
    status: hasApiKey ? 'healthy' : 'degraded',
    environment: {
      valid: hasApiKey,
      missing: hasApiKey ? [] : ['OPENAI_API_KEY']
    },
    timestamp: new Date().toISOString()
  })
})

// Stats endpoint (returns stats for philosophy room by default)
app.get('/api/stats', async (c) => {
  try {
    const roomId = c.env.CONVERSATION_ROOM.idFromName('philosophy-room')
    const room = c.env.CONVERSATION_ROOM.get(roomId)
    
    const response = await room.fetch(new Request('http://internal/stats'))
    const stats = await response.json()
    
    return c.json(stats)
  } catch (error) {
    return c.json({ error: 'Failed to get stats' }, 500)
  }
})

// Status endpoint - shows all rooms
app.get('/status', async (c) => {
  const rooms = ['philosophy', 'crypto', 'classic']
  const roomStats: any = {}
  let totalCost = 0
  let totalMessages = 0
  
  for (const roomType of rooms) {
    try {
      const roomId = c.env.CONVERSATION_ROOM.idFromName(`${roomType}-room`)
      const room = c.env.CONVERSATION_ROOM.get(roomId)
      
      const response = await room.fetch(new Request('http://internal/stats'))
      const stats = await response.json() as any
      
      roomStats[roomType] = {
        running: stats.isRunning,
        messagesToday: stats.dailyMessages?.count || 0,
        dailyLimit: stats.dailyMessages?.limit || 2000,
        remaining: stats.dailyMessages?.remaining || 0
      }
      
      totalMessages += stats.dailyMessages?.count || 0
      totalCost += (stats.dailyMessages?.count || 0) * 0.0012 // Rough estimate per message
    } catch (error) {
      roomStats[roomType] = {
        running: false,
        messagesToday: 0,
        dailyLimit: 2000,
        remaining: 2000,
        error: 'Failed to fetch stats'
      }
    }
  }
  
  return c.json({
    rooms: roomStats,
    totalDailyMessages: totalMessages,
    estimatedDailyCost: `$${totalCost.toFixed(2)}`,
    timestamp: new Date().toISOString()
  })
})

// Archives endpoint for a specific room
app.get('/api/archives/:roomType', async (c) => {
  const roomType = c.req.param('roomType')
  if (roomType !== 'crypto' && roomType !== 'philosophy' && roomType !== 'classic') {
    return c.json({ error: 'Invalid room type' }, 400)
  }
  
  try {
    const roomId = c.env.CONVERSATION_ROOM.idFromName(`${roomType}-room`)
    const room = c.env.CONVERSATION_ROOM.get(roomId)
    
    const response = await room.fetch(new Request('http://internal/archives'))
    const archives = await response.json()
    
    return c.json(archives)
  } catch (error) {
    return c.json({ error: 'Failed to get archives' }, 500)
  }
})

// Search endpoint for a specific room
app.get('/api/:roomType/search', async (c) => {
  const roomType = c.req.param('roomType')
  const query = c.req.query('q')
  
  if (roomType !== 'crypto' && roomType !== 'philosophy' && roomType !== 'classic') {
    return c.json({ error: 'Invalid room type' }, 400)
  }
  
  if (!query) {
    return c.json({ error: 'Query parameter required' }, 400)
  }
  
  try {
    const roomId = c.env.CONVERSATION_ROOM.idFromName(`${roomType}-room`)
    const room = c.env.CONVERSATION_ROOM.get(roomId)
    
    const url = new URL('http://internal/search')
    url.searchParams.set('q', query)
    
    const response = await room.fetch(new Request(url.toString()))
    const results = await response.json()
    
    return c.json(results)
  } catch (error) {
    return c.json({ error: 'Search failed' }, 500)
  }
})

// WebSocket stream endpoint for default room (keeping for backward compatibility)
app.get('/stream', async (c) => {
  if (!c.env.OPENAI_API_KEY) {
    return c.json({ error: 'Missing OPENAI_API_KEY' }, 500)
  }
  
  try {
    const roomId = c.env.CONVERSATION_ROOM.idFromName('philosophy-room')
    const room = c.env.CONVERSATION_ROOM.get(roomId)
    
    // Create a new request with the original URL to pass to the Durable Object
    const url = new URL(c.req.url)
    url.searchParams.set('roomType', 'philosophy')
    const roomRequest = new Request(url.toString(), {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: c.req.raw.body
    })
    
    return await room.fetch(roomRequest)
  } catch (error) {
    // Stream error
    return c.json({ error: 'Failed to connect to conversation room' }, 500)
  }
})

// WebSocket stream endpoint for specific room type
app.get('/stream/:roomType', async (c) => {
  if (!c.env.OPENAI_API_KEY) {
    return c.json({ error: 'Missing OPENAI_API_KEY' }, 500)
  }
  
  const roomType = c.req.param('roomType')
  if (roomType !== 'crypto' && roomType !== 'philosophy' && roomType !== 'classic') {
    return c.json({ error: 'Invalid room type' }, 400)
  }
  
  try {
    const roomId = c.env.CONVERSATION_ROOM.idFromName(`${roomType}-room`)
    const room = c.env.CONVERSATION_ROOM.get(roomId)
    
    // Create a new request with the original URL to pass to the Durable Object
    const url = new URL(c.req.url)
    url.searchParams.set('roomType', roomType)
    const roomRequest = new Request(url.toString(), {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: c.req.raw.body
    })
    
    return await room.fetch(roomRequest)
  } catch (error) {
    // Stream error
    return c.json({ error: 'Failed to connect to conversation room' }, 500)
  }
})

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      })
    }
    
    const response = await app.fetch(request, env, ctx)
    
    // Add CORS headers to all responses
    const newResponse = new Response(response.body, response)
    newResponse.headers.set('Access-Control-Allow-Origin', '*')
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    newResponse.headers.set('Access-Control-Allow-Headers', '*')
    
    return newResponse
  }
}

// Export ConversationRoom
export { ConversationRoom } from './conversation-room'