# Development Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repo-url>
cd dio-radio-mini

# Run setup script
./setup.sh
```

### 2. Configure Environment

Backend environment (`.env`):
```bash
cd backend
cp .env.example .env
# Add your OpenAI API key
OPENAI_API_KEY=sk-...
```

Frontend environment is auto-configured with defaults.

## Development Workflow

### Starting Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
cd frontend && npm run dev  # Port 3002
cd backend && npm run dev   # Port 8787
```

### Stopping Servers

```bash
# From root directory
npm run stop

# Or manually
./stop.sh
```

## Project Structure

```
dio-radio-mini/
├── frontend/           # Next.js frontend
│   ├── app/           # App routes and pages
│   ├── components/    # Reusable components
│   ├── hooks/         # Custom React hooks
│   └── public/        # Static assets
├── backend/           # Cloudflare Workers
│   ├── src/          # Source code
│   └── wrangler.toml # Worker configuration
├── shared/           # Shared types and constants
├── docs/            # Documentation
└── scripts/         # Utility scripts
```

## Making Changes

### Adding a New AI Character

1. Update types in `/shared/types/index.ts`
2. Add character prompt in `/backend/src/conversation-room.ts`
3. Update frontend display logic
4. Add voice selection for TTS

### Creating a New Room

See [Rooms Guide](./rooms.md) for detailed instructions.

### Modifying Conversation Flow

- Edit timing in `/shared/constants.ts`
- Adjust prompts in `conversation-room.ts`
- Change context window size
- Modify topic selection

## Testing

### Manual Testing

1. **WebSocket Connection**: Check browser DevTools Network tab
2. **Message Generation**: Verify 15-30 second intervals
3. **Statistics**: Monitor viewer count and message rate
4. **Room Switching**: Test navigation between rooms
5. **Error Handling**: Disconnect network, check reconnection

### Testing Checklist

- [ ] WebSocket connects successfully
- [ ] Messages appear with correct formatting
- [ ] Audio plays (if enabled)
- [ ] Statistics update in real-time
- [ ] Room switching works
- [ ] Reconnection works after disconnect
- [ ] Error messages display correctly

## Debugging

### Common Issues

#### WebSocket Won't Connect
```bash
# Check if backend is running
curl http://localhost:8787/health

# Check WebSocket URL in frontend
# Should be ws://localhost:8787/stream/:roomType
```

#### Messages Not Generating
```bash
# Check API key is set
echo $OPENAI_API_KEY

# Check backend logs for errors
# Look for OpenAI API errors
```

#### Frontend Build Errors
```bash
# Clear Next.js cache
rm -rf frontend/.next
cd frontend && npm run dev
```

### Debug Tools

1. **Browser DevTools**
   - Network tab for WebSocket frames
   - Console for JavaScript errors
   - Application tab for storage

2. **Backend Logs**
   - Wrangler outputs to terminal
   - Add console.log for debugging
   - Check Durable Object state

3. **API Testing**
   ```bash
   # Test health endpoint
   curl http://localhost:8787/health
   
   # Test stats endpoint
   curl http://localhost:8787/api/stats
   ```

## Performance Optimization

### Frontend
- Limit message history display (20 messages)
- Optimize re-renders with React.memo
- Lazy load heavy components
- Use production builds for testing

### Backend
- Monitor token usage (150 token limit)
- Implement message archiving (100 message limit)
- Cache frequently used data
- Use appropriate AI model (GPT-4o-mini)

## Code Style

### TypeScript
- Use strict mode
- Define interfaces for all data
- Avoid `any` types
- Use descriptive variable names

### React
- Functional components only
- Custom hooks for logic
- Proper cleanup in useEffect
- Error boundaries for stability

### CSS
- Use Tailwind classes
- Component-specific styles in CSS modules
- Maintain consistent spacing
- Mobile-first approach

## Git Workflow

### Branches
- `main` - Stable code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation

### Commits
- Use descriptive messages
- Reference issues if applicable
- Keep commits focused
- Test before committing

## Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy .next folder
```

### Backend (Cloudflare Workers)
```bash
cd backend
wrangler deploy
```

### Environment Variables
- Set in deployment platform
- Never commit secrets
- Use different keys for prod

## Monitoring

### Key Metrics
- Message generation rate
- API costs (tokens/hour)
- WebSocket connections
- Error rates

### Tools
- Browser DevTools
- Cloudflare Analytics
- OpenAI Usage Dashboard
- Custom logging

## Troubleshooting Production

### High Costs
- Reduce message frequency
- Use cheaper AI model
- Implement caching
- Add rate limiting

### Performance Issues
- Check message archive size
- Monitor WebSocket connections
- Optimize frontend bundle
- Use CDN for assets

### Stability Problems
- Implement circuit breakers
- Add retry logic
- Use error boundaries
- Monitor memory usage

## Additional Resources

- [Architecture Documentation](./architecture.md)
- [API Reference](./api-reference.md)
- [Rooms Guide](./rooms.md)
- [Improvement Plan](./improvement-plan.md)