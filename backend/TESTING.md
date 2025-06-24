# Testing Supabase Integration

## Quick Test Without Supabase

The system works without Supabase configuration:
1. Messages are stored in Durable Object memory
2. Archives use Durable Object persistent storage
3. Search functionality is disabled

## Setting Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Run the contents of `supabase-schema.sql`
5. Get your credentials from Settings > API:
   - Project URL
   - Service Role Key (secret)

## Configure Environment

Add to `backend/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

## Test Features

### 1. Message Storage
- Start the app and let it generate messages
- Check Supabase Table Editor > messages table
- You should see messages being saved with embeddings

### 2. Archive Creation
- Let the app run until 100+ messages
- Archives will be created automatically
- Check Supabase Table Editor > archives table

### 3. Search Functionality
- In the frontend, expand the archives section
- Enter a search query (e.g., "consciousness", "bitcoin")
- Results will show archives that semantically match your query

## Verify Room Isolation

1. Search in Philosophy room for "crypto" - should return no results
2. Search in Crypto room for "philosophy" - should return no results
3. Each room's search is completely isolated

## Monitor Costs

- Check OpenAI usage for embedding costs (~$0.00002 per message)
- Supabase free tier includes:
  - 500MB database
  - 2GB bandwidth
  - Unlimited API requests

## Troubleshooting

### No messages in Supabase
- Check browser console for errors
- Verify environment variables are loaded
- Check backend logs for Supabase connection errors

### Search not working
- Ensure pgvector extension is enabled
- Verify archives have embeddings (summary_embedding column)
- Check that search function was created in SQL

### Archives not appearing
- Let the app run longer (needs 100+ messages)
- Check if archives are being saved to Supabase
- Verify room_id matches between frontend and backend