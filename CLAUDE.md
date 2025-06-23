# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dio Radio Mini is a simplified version of the full Dio Radio project. It features only the essential components needed to run the perpetual AI conversation between Nyx and Zero.

**Key Characteristics**:
- Minimal dependencies (no database, no complex packages)
- Single conversation room only
- Two AI agents: Nyx (idealist) and Zero (realist)
- Simple in-memory message storage
- Quick setup (< 5 minutes)

## Commands

### Quick Setup & Run
```bash
./setup.sh          # Install dependencies and create config files
./start.sh          # Start both frontend and backend
```

### Manual Commands
```bash
# Backend (Cloudflare Workers on port 8787)
cd backend
npm install
npm run dev

# Frontend (Next.js on port 3002)
cd frontend
npm install
npm run dev
```

## Architecture

This is a simplified monorepo with two main parts:

- **frontend/**: Next.js 15 app with WebSocket client
- **backend/**: Cloudflare Workers with a single Durable Object

Key differences from full version:
- No database (Supabase removed)
- No room management
- No admin panel
- Simplified memory system
- Only essential UI components

## Development Guidelines

- Keep it simple - this is meant for learning
- Don't add complex features - use the full version for that
- Focus on code clarity over optimization
- Maintain the minimal dependency philosophy

## Important Context

- Uses GPT-3.5 instead of GPT-4 to reduce costs
- Messages generated every 15-30 seconds
- Audio generation is optional (30% of messages)
- No authentication or user management
- Single WebSocket endpoint: `/stream`

## Environment Variables

Only one required variable:
- `OPENAI_API_KEY`: Your OpenAI API key (in backend/.env)

## User Instructions

This is the learning/demo version. For production use, see the full dio-radio project.