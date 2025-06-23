#!/bin/bash

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Run wrangler directly with the API key
./node_modules/.bin/wrangler dev --var OPENAI_API_KEY:$OPENAI_API_KEY