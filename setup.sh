#!/bin/bash

# Unreal House Setup Script
# This script installs dependencies and sets up the environment

echo "🏠 Welcome to Unreal House Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env from .env.example"
        echo "⚠️  Please edit backend/.env and add your OpenAI API key"
    else
        echo "OPENAI_API_KEY=sk-your-key-here" > .env
        echo "✅ Created default .env file"
        echo "⚠️  Please edit backend/.env and add your OpenAI API key"
    fi
else
    echo "✅ .env file already exists"
fi

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creating frontend .env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8787" > .env.local
    echo "NEXT_PUBLIC_WS_URL=ws://localhost:8787" >> .env.local
    echo "✅ Created .env.local with default values"
else
    echo "✅ .env.local already exists"
fi

cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and add your OpenAI API key"
echo "2. Run ./start.sh to start both servers"
echo "3. Open http://localhost:3002 in your browser"
echo ""
echo "Happy chatting! 🤖"