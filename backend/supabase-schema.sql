-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Messages table for all rooms
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,
  speaker TEXT NOT NULL,
  text TEXT NOT NULL,
  audio_url TEXT,
  token_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  embedding vector(1536)
);

-- Archives table for all rooms
CREATE TABLE IF NOT EXISTS archives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  messages JSONB NOT NULL,
  summary TEXT,
  summary_embedding vector(1536)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_room_created ON messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_archives_room_archived ON archives(room_id, archived_at DESC);

-- Room-specific vector indexes for better performance
CREATE INDEX IF NOT EXISTS idx_philosophy_message_embedding ON messages USING ivfflat (embedding vector_cosine_ops) WHERE room_id = 'philosophy';
CREATE INDEX IF NOT EXISTS idx_crypto_message_embedding ON messages USING ivfflat (embedding vector_cosine_ops) WHERE room_id = 'crypto';
CREATE INDEX IF NOT EXISTS idx_classic_message_embedding ON messages USING ivfflat (embedding vector_cosine_ops) WHERE room_id = 'classic';

CREATE INDEX IF NOT EXISTS idx_philosophy_archive_embedding ON archives USING ivfflat (summary_embedding vector_cosine_ops) WHERE room_id = 'philosophy';
CREATE INDEX IF NOT EXISTS idx_crypto_archive_embedding ON archives USING ivfflat (summary_embedding vector_cosine_ops) WHERE room_id = 'crypto';
CREATE INDEX IF NOT EXISTS idx_classic_archive_embedding ON archives USING ivfflat (summary_embedding vector_cosine_ops) WHERE room_id = 'classic';

-- Room-specific search function for archives
CREATE OR REPLACE FUNCTION search_room_archives(
  target_room_id TEXT,
  query_embedding vector(1536),
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  room_id TEXT,
  archived_at TIMESTAMPTZ,
  message_count INTEGER,
  total_tokens INTEGER,
  summary TEXT,
  similarity FLOAT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.room_id,
    a.archived_at,
    a.message_count,
    a.total_tokens,
    a.summary,
    1 - (a.summary_embedding <=> query_embedding) as similarity
  FROM archives a
  WHERE a.room_id = target_room_id
    AND a.summary_embedding IS NOT NULL
  ORDER BY a.summary_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Room-specific search function for messages
CREATE OR REPLACE FUNCTION search_room_messages(
  target_room_id TEXT,
  query_embedding vector(1536),
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  room_id TEXT,
  speaker TEXT,
  text TEXT,
  created_at TIMESTAMPTZ,
  similarity FLOAT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.room_id,
    m.speaker,
    m.text,
    m.created_at,
    1 - (m.embedding <=> query_embedding) as similarity
  FROM messages m
  WHERE m.room_id = target_room_id
    AND m.embedding IS NOT NULL
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant permissions (adjust based on your Supabase setup)
GRANT ALL ON messages TO anon, authenticated, service_role;
GRANT ALL ON archives TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_room_archives TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_room_messages TO anon, authenticated, service_role;