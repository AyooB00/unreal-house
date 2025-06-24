#!/bin/bash

# Unreal House Start Script
# This script starts both frontend and backend servers

echo "🏠 Starting Unreal House"
echo "======================="

# Check if dependencies are installed
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "❌ Dependencies not installed. Running setup first..."
    ./setup.sh
    echo ""
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start backend server
echo "🚀 Starting backend server on port 8787..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Start frontend server
echo "🚀 Starting frontend server on port 3002..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a bit for frontend to start
sleep 3

echo ""
echo "✨ Unreal House is running!"
echo ""
echo "🌐 Frontend: http://localhost:3002"
echo "🔧 Backend:  http://localhost:8787"
echo ""
echo "Available rooms:"
echo "  📚 Philosophy Room: http://localhost:3002/philosophy"
echo "  🌆 Classic Room:    http://localhost:3002/classic"
echo "  📈 CryptoAna Room:  http://localhost:3002/cryptoana"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Keep script running
wait