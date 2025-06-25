#!/bin/bash

# Deploy Unreal House to Cloudflare (Workers + Pages)
# This script deploys both backend and frontend to Cloudflare

set -e  # Exit on error

echo "🚀 Unreal House - Cloudflare Deployment"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if wrangler is installed
check_wrangler() {
    if ! command -v wrangler &> /dev/null; then
        echo -e "${RED}❌ Wrangler CLI not found${NC}"
        echo "Installing Wrangler..."
        npm install -g wrangler
    else
        echo -e "${GREEN}✅ Wrangler CLI found${NC}"
    fi
}

# Deploy backend to Workers
deploy_backend() {
    echo ""
    echo -e "${BLUE}1️⃣  Deploying Backend to Cloudflare Workers${NC}"
    echo "==========================================="
    
    cd backend
    
    # Check for OpenAI API key
    if [ -z "$OPENAI_API_KEY" ]; then
        echo -e "${RED}❌ OPENAI_API_KEY not set${NC}"
        echo "Please set your OpenAI API key:"
        read -s -p "OPENAI_API_KEY: " OPENAI_API_KEY
        echo ""
    fi
    
    # Install dependencies
    echo "📦 Installing backend dependencies..."
    npm install
    
    # Deploy to Workers
    echo "🚀 Deploying to Cloudflare Workers..."
    wrangler deploy
    
    # Set the secret
    echo "🔐 Setting OpenAI API key..."
    echo "$OPENAI_API_KEY" | wrangler secret put OPENAI_API_KEY
    
    # Get the deployed URL
    WORKER_URL=$(wrangler whoami | grep -oE 'https://[^[:space:]]+\.workers\.dev' || echo "")
    if [ -z "$WORKER_URL" ]; then
        WORKER_URL="https://unreal-house.${CF_ACCOUNT_ID}.workers.dev"
    fi
    
    echo -e "${GREEN}✅ Backend deployed!${NC}"
    echo "Worker URL: $WORKER_URL"
    
    cd ..
}

# Build and deploy frontend to Pages
deploy_frontend() {
    echo ""
    echo -e "${BLUE}2️⃣  Deploying Frontend to Cloudflare Pages${NC}"
    echo "=========================================="
    
    cd frontend
    
    # Install dependencies
    echo "📦 Installing frontend dependencies..."
    npm install
    
    # Build the static site
    echo "🔨 Building frontend..."
    npm run build
    
    # Check if build succeeded
    if [ ! -d "out" ]; then
        echo -e "${RED}❌ Build failed - 'out' directory not found${NC}"
        exit 1
    fi
    
    # Deploy to Pages
    echo "🚀 Deploying to Cloudflare Pages..."
    if wrangler pages deploy out --project-name=unreal-house; then
        echo -e "${GREEN}✅ Frontend deployed!${NC}"
        PAGES_URL="https://unreal-house.pages.dev"
        echo "Pages URL: $PAGES_URL"
    else
        echo -e "${RED}❌ Pages deployment failed${NC}"
        exit 1
    fi
    
    cd ..
}

# Update CORS settings
update_cors() {
    echo ""
    echo -e "${BLUE}3️⃣  Updating CORS Configuration${NC}"
    echo "================================"
    
    cd backend
    
    # Update wrangler.toml with the Pages URL
    if [ -n "$PAGES_URL" ]; then
        echo "📝 Updating CORS origin to: $PAGES_URL"
        
        # Update production CORS_ORIGIN in wrangler.toml
        sed -i.bak "s|CORS_ORIGIN = \"https://unreal-house.pages.dev\"|CORS_ORIGIN = \"$PAGES_URL\"|g" wrangler.toml
        
        # Redeploy with updated CORS
        echo "🔄 Redeploying backend with updated CORS..."
        wrangler deploy
        
        echo -e "${GREEN}✅ CORS updated!${NC}"
    fi
    
    cd ..
}

# Show final instructions
show_instructions() {
    echo ""
    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    echo "======================="
    echo ""
    echo "Your Unreal House is now live at:"
    echo -e "${BLUE}Frontend:${NC} $PAGES_URL"
    echo -e "${BLUE}Backend:${NC} $WORKER_URL"
    echo ""
    echo "Next steps:"
    echo "1. Visit $PAGES_URL to see your site"
    echo "2. Monitor logs: wrangler tail"
    echo "3. Set up custom domain (optional)"
    echo ""
    echo "To use a custom domain:"
    echo "1. Add domain to Cloudflare"
    echo "2. Go to Pages > Custom domains"
    echo "3. Update wrangler.toml routes section"
    echo ""
}

# Main execution
main() {
    echo "This will deploy:"
    echo "- Backend → Cloudflare Workers (with Durable Objects)"
    echo "- Frontend → Cloudflare Pages (static site)"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
    
    check_wrangler
    
    # Login to Cloudflare if needed
    if ! wrangler whoami &> /dev/null; then
        echo "📝 Please login to Cloudflare:"
        wrangler login
    fi
    
    deploy_backend
    deploy_frontend
    update_cors
    show_instructions
}

# Run main function
main