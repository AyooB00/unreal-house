#!/bin/bash

# Dio Radio Mini Start Script
echo "🚀 Starting Dio Radio Mini..."

# Check if dependencies are installed
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  Dependencies not installed. Running setup first..."
    ./setup.sh
fi

# Check for OpenAI API key
if [ -f "backend/.env" ]; then
    if ! grep -q "OPENAI_API_KEY=sk-" backend/.env; then
        echo "❌ OpenAI API key not found in backend/.env"
        echo "Please add your API key before starting."
        exit 1
    fi
else
    echo "❌ backend/.env file not found"
    echo "Run ./setup.sh first"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "👋 Shutting down Dio Radio Mini..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Function to find available port
find_available_port() {
    local base_port=$1
    local port=$base_port
    while lsof -i :$port >/dev/null 2>&1; do
        echo "Port $port is already in use, trying $((port+1))..."
        port=$((port+1))
    done
    echo $port
}

# Set trap for cleanup
trap cleanup INT TERM

# Find available ports
BACKEND_PORT=$(find_available_port 8787)
FRONTEND_PORT=$(find_available_port 3002)

# Start backend
echo "🔧 Starting backend on port $BACKEND_PORT..."
cd backend
# Load environment variables from .env
export $(grep -v '^#' .env | xargs)
npm run dev -- --port $BACKEND_PORT &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend on port $FRONTEND_PORT..."
cd frontend
# Set the backend URL for frontend to connect to
export NEXT_PUBLIC_API_URL=http://localhost:$BACKEND_PORT
export NEXT_PUBLIC_WS_URL=ws://localhost:$BACKEND_PORT
npm run dev -- -p $FRONTEND_PORT &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 3

echo ""
echo "✅ Dio Radio Mini is running!"
echo "🌐 Open http://localhost:$FRONTEND_PORT in your browser"
echo "📡 Backend: http://localhost:$BACKEND_PORT"
echo ""
echo "Press Ctrl+C to stop"

# Wait for processes
wait