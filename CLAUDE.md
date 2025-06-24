# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Unreal House is a multi-room AI conversation platform. Each room represents a unique space with its own characters, themes, and conversation dynamics - like rooms in a house where different activities happen.

**Key Characteristics**:
- Minimal dependencies (no database, no complex packages)
- Multiple themed rooms (Classic, Philosophy, Cryptoana)
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
- Simple room navigation system
- No admin panel
- Simplified memory system
- Only essential UI components

## Development Guidelines

- Keep it simple - this is meant for learning
- Don't add complex features - use the full version for that
- Focus on code clarity over optimization
- Maintain the minimal dependency philosophy

## Important Context

- Uses GPT-4o-mini for better quality at lower cost
- Messages generated every 15-30 seconds
- Audio generation is optional (30% of messages)
- No authentication or user management
- Single WebSocket endpoint: `/stream`

## Environment Variables

Only one required variable:
- `OPENAI_API_KEY`: Your OpenAI API key (in backend/.env)

## User Instructions

This is the Unreal House - where each room tells a different story through AI conversations.