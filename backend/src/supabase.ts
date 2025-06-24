import { createClient } from '@supabase/supabase-js'
import type { Env } from './index'

// Database types
export interface DbMessage {
  id: string
  room_id: string
  speaker: string
  text: string
  audio_url?: string
  token_count?: number
  created_at: string
  embedding?: number[]
}

export interface DbArchive {
  id: string
  room_id: string
  archived_at: string
  message_count: number
  total_tokens: number
  messages: any // JSONB
  summary?: string
  summary_embedding?: number[]
}

// Create Supabase client
export function createSupabaseClient(env: Env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    console.warn('Supabase credentials not configured')
    return null
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Generate embedding using OpenAI
export async function generateEmbedding(text: string, env: Env): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float'
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json() as any
    return data.data?.[0]?.embedding || null
  } catch (error) {
    console.error('Error generating embedding:', error)
    return null
  }
}

// Save message to Supabase
export async function saveMessage(
  message: DbMessage,
  env: Env
): Promise<boolean> {
  const supabase = createSupabaseClient(env)
  if (!supabase) return false

  try {
    // Generate embedding for the message
    const embedding = await generateEmbedding(message.text, env)
    
    const { error } = await supabase
      .from('messages')
      .insert({
        ...message,
        embedding
      })

    if (error) {
      console.error('Error saving message:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in saveMessage:', error)
    return false
  }
}

// Save archive to Supabase
export async function saveArchive(
  archive: DbArchive,
  env: Env
): Promise<boolean> {
  const supabase = createSupabaseClient(env)
  if (!supabase) return false

  try {
    // Generate summary if not provided
    let summary = archive.summary
    if (!summary && Array.isArray(archive.messages)) {
      // Create a simple summary from messages
      const messageTexts = archive.messages.slice(0, 10).map((m: any) => m.text).join(' ')
      summary = messageTexts.substring(0, 500) + '...'
    }

    // Generate embedding for the summary
    const summaryEmbedding = summary ? await generateEmbedding(summary, env) : null

    const { error } = await supabase
      .from('archives')
      .insert({
        ...archive,
        summary,
        summary_embedding: summaryEmbedding
      })

    if (error) {
      console.error('Error saving archive:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in saveArchive:', error)
    return false
  }
}

// Get archives for a specific room
export async function getRoomArchives(
  roomId: string,
  env: Env,
  limit: number = 10
): Promise<DbArchive[]> {
  const supabase = createSupabaseClient(env)
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('archives')
      .select('*')
      .eq('room_id', roomId)
      .order('archived_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching archives:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getRoomArchives:', error)
    return []
  }
}

// Search archives within a specific room
export async function searchRoomArchives(
  roomId: string,
  query: string,
  env: Env,
  limit: number = 5
): Promise<DbArchive[]> {
  const supabase = createSupabaseClient(env)
  if (!supabase) return []

  try {
    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query, env)
    if (!queryEmbedding) return []

    // Use Supabase RPC function for vector search
    const { data, error } = await supabase
      .rpc('search_room_archives', {
        target_room_id: roomId,
        query_embedding: queryEmbedding,
        match_count: limit
      })

    if (error) {
      console.error('Error searching archives:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in searchRoomArchives:', error)
    return []
  }
}

// Get recent messages for a room
export async function getRoomMessages(
  roomId: string,
  env: Env,
  limit: number = 100
): Promise<DbMessage[]> {
  const supabase = createSupabaseClient(env)
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }

    // Return in chronological order
    return (data || []).reverse()
  } catch (error) {
    console.error('Error in getRoomMessages:', error)
    return []
  }
}