#!/bin/bash

# Simple deployment script for Unreal House

echo "🚀 Deploying Unreal House Backend..."

# Navigate to backend directory
cd backend || exit 1

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "❌ Error: Not logged in to Cloudflare. Please run:"
    echo "wrangler login"
    exit 1
fi

# Deploy to Cloudflare Workers
echo "📦 Deploying to Cloudflare Workers..."
npm run deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📊 Checking deployment status..."
    
    # Wait a moment for deployment to settle
    sleep 5
    
    # Get the worker URL (you may need to adjust this based on your wrangler.toml)
    WORKER_URL="https://unreal-house.YOUR-SUBDOMAIN.workers.dev"
    
    echo "🔍 Testing /status endpoint..."
    curl -s "$WORKER_URL/status" | jq . || echo "Failed to fetch status"
    
    echo ""
    echo "✨ Deployment complete!"
    echo "📍 Worker URL: $WORKER_URL"
    echo "📊 Status: $WORKER_URL/status"
else
    echo "❌ Deployment failed!"
    exit 1
fi