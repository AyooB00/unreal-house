#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Run wrangler with the loaded environment variable
exec npx wrangler dev --var OPENAI_API_KEY:"$OPENAI_API_KEY"