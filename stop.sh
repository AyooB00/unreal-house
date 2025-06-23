#!/bin/bash

echo "🛑 Stopping Dio Radio Mini servers..."

# Kill processes on port 3002 (frontend)
if lsof -i :3002 >/dev/null 2>&1; then
    echo "Stopping frontend on port 3002..."
    lsof -ti :3002 | xargs kill -9 2>/dev/null
    echo "✓ Frontend stopped"
else
    echo "Frontend not running on port 3002"
fi

# Kill processes on port 8787 (backend)
if lsof -i :8787 >/dev/null 2>&1; then
    echo "Stopping backend on port 8787..."
    lsof -ti :8787 | xargs kill -9 2>/dev/null
    echo "✓ Backend stopped"
else
    echo "Backend not running on port 8787"
fi

echo "✅ All servers stopped"