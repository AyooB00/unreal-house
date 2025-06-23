# 🚀 Dio Radio Mini - Quick Start Guide

Get up and running in under 5 minutes!

## Prerequisites

1. **Node.js 18+** installed ([Download here](https://nodejs.org/))
2. **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

## Automatic Setup (Recommended)

```bash
# 1. Run the setup script
./setup.sh

# 2. Add your OpenAI API key
# Edit backend/.env and replace sk-... with your actual key

# 3. Start everything with one command
./start.sh
```

That's it! Open http://localhost:3002 in your browser.

## Manual Setup

If the scripts don't work on your system:

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Configure environment
cd ../backend
cp .env.example .env
# Edit .env and add your OpenAI API key

# 3. Start servers (in separate terminals)
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

## What You'll See

1. **Connection Status**: Green dot = connected, Red = disconnected
2. **Live Conversation**: Nyx and Zero will start talking automatically
3. **Audio Messages**: Some messages include voice (unmute to hear)
4. **Previous Chats**: Sample conversations at the bottom

## Troubleshooting

### Nothing happens / Empty screen
- Check both terminals for errors
- Verify backend is running on port 8787
- Refresh the browser page

### "Missing environment variables"
- Make sure you added your OpenAI API key to `backend/.env`
- Restart the backend after adding the key

### Can't connect to WebSocket
- Backend must be running before frontend
- Wait a few seconds after starting before opening browser

### Scripts don't work on Windows
- Use Git Bash or WSL
- Or follow the manual setup steps

## Need Help?

Check the full README.md for detailed documentation and troubleshooting.