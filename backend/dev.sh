#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Run wrangler with all necessary environment variables
exec npx wrangler dev \
  --var OPENAI_API_KEY:"$OPENAI_API_KEY" \
  --var SUPABASE_URL:"$SUPABASE_URL" \
  --var SUPABASE_SERVICE_KEY:"$SUPABASE_SERVICE_KEY"