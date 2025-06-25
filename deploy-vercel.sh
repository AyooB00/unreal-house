#!/bin/bash

# Deploy Unreal House to Vercel and Cloudflare
# This script helps deploy both frontend and backend

echo "🚀 Unreal House Deployment Script"
echo "================================="

# Check if required tools are installed
check_requirements() {
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v wrangler &> /dev/null; then
        echo "📦 Installing Wrangler CLI..."
        npm install -g wrangler
    fi
    
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
}

# Deploy backend to Cloudflare
deploy_backend() {
    echo ""
    echo "1️⃣  Deploying Backend to Cloudflare Workers"
    echo "-------------------------------------------"
    
    cd backend
    
    # Check for .env file
    if [ ! -f .env ]; then
        echo "❌ backend/.env file not found!"
        echo "Please create it with your OpenAI API key:"
        echo "OPENAI_API_KEY=your-key-here"
        exit 1
    fi
    
    # Install dependencies
    echo "📦 Installing backend dependencies..."
    npm install
    
    # Deploy to Cloudflare
    echo "🚀 Deploying to Cloudflare Workers..."
    npm run deploy
    
    echo "✅ Backend deployed! Note your Workers URL."
    echo ""
    read -p "Enter your Cloudflare Workers URL (e.g., https://unreal-house.name.workers.dev): " WORKERS_URL
    
    cd ..
}

# Deploy frontend to Vercel
deploy_frontend() {
    echo ""
    echo "2️⃣  Deploying Frontend to Vercel"
    echo "---------------------------------"
    
    cd frontend
    
    # Create production env file
    echo "NEXT_PUBLIC_API_URL=$WORKERS_URL" > .env.production
    
    echo "📦 Installing frontend dependencies..."
    npm install
    
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    cd ..
}

# Main execution
echo ""
echo "This script will deploy:"
echo "- Backend → Cloudflare Workers"
echo "- Frontend → Vercel"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    check_requirements
    deploy_backend
    deploy_frontend
    
    echo ""
    echo "✅ Deployment Complete!"
    echo ""
    echo "Next steps:"
    echo "1. Add your Vercel domain to CORS settings in backend"
    echo "2. Test WebSocket connection"
    echo "3. Monitor logs in both platforms"
else
    echo "Deployment cancelled."
fi