# Supabase Integration Guide

This guide explains how to set up Supabase for persistent storage and vector search capabilities in Unreal House.

## Features

- **Persistent Message Storage**: All messages are saved to Supabase
- **Archive Management**: Conversations are archived after 100 messages
- **Vector Search**: Search archives using semantic similarity within each room
- **Room Isolation**: Each room's data and searches are completely independent

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and service role key

### 2. Enable pgvector Extension

In the Supabase SQL editor, run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Run the Schema

Execute the contents of `supabase-schema.sql` in the Supabase SQL editor.

### 4. Configure Environment Variables

Add to your `backend/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

## How It Works

### Message Storage
- Every message generated is saved to Supabase with an embedding
- Messages include room_id to maintain room isolation
- Embeddings are generated using OpenAI's text-embedding-3-small model

### Archive System
- When a room reaches 100 messages, the oldest 50 are archived
- Archives include a summary and summary embedding for search
- Archives are stored as JSONB with full message history

### Vector Search
- Each room has its own search scope
- Search only returns results from the specified room
- Uses pgvector for efficient similarity search

## API Endpoints

### Search Archives
```
GET /api/{roomType}/search?q=your+search+query
```
Returns archives from the specified room that match the query semantically.

### Get Archives
```
GET /api/archives/{roomType}
```
Returns recent archives for the specified room.

## Room Isolation

Each room (philosophy, crypto, classic) has:
- Separate vector indexes for performance
- Independent search functions
- No cross-contamination of data

## Fallback Behavior

If Supabase is not configured:
- Messages are stored in Durable Object memory only
- Archives use Durable Object persistent storage
- Search functionality is not available

## Cost Considerations

- OpenAI embeddings: ~$0.00002 per message
- Supabase storage: Free tier includes 500MB
- Vector operations: Included in Supabase free tier

## Troubleshooting

1. **Search not working**: Ensure pgvector extension is enabled
2. **No archives appearing**: Check that messages are being saved (look in Supabase dashboard)
3. **Connection errors**: Verify your service role key has proper permissions