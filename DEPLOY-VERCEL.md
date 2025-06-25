# Deploying Unreal House on Vercel

This guide walks you through deploying Unreal House on Vercel with the frontend on Vercel and the backend on Cloudflare Workers.

## Architecture Overview

- **Frontend**: Next.js app deployed on Vercel
- **Backend**: Cloudflare Workers (must be deployed separately)
- **WebSocket**: Connects frontend to Cloudflare Workers backend

## Prerequisites

- Vercel account (free tier works)
- Cloudflare account (free tier works)
- OpenAI API key

## Step 1: Deploy Backend to Cloudflare Workers

First, deploy the backend to Cloudflare Workers:

```bash
# Install Cloudflare CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Navigate to backend
cd backend

# Create .env file with your OpenAI key
echo "OPENAI_API_KEY=your-key-here" > .env

# Deploy to Cloudflare
npm run deploy
```

After deployment, you'll get a URL like: `https://unreal-house.your-subdomain.workers.dev`

## Step 2: Prepare Frontend for Vercel

1. Create environment variables file:

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=https://unreal-house.your-subdomain.workers.dev" > .env.production
```

2. Update the shared dependency in `frontend/package.json`:

```json
{
  "dependencies": {
    "@unreal-house/shared": "file:../shared"
  }
}
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# In the project root
vercel

# Follow prompts:
# - Set up and deploy: Y
# - Which scope: Your account
# - Link to existing project: N
# - Project name: unreal-house
# - Directory: ./frontend
# - Override settings: N
```

### Option B: Using GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

## Step 4: Configure Environment Variables in Vercel

In your Vercel project settings, add:

```
NEXT_PUBLIC_API_URL=https://unreal-house.your-subdomain.workers.dev
```

## Step 5: Handle CORS (Important!)

Update your `backend/wrangler.toml` to allow Vercel domain:

```toml
[env.production.vars]
CORS_ORIGIN = "https://your-app.vercel.app"
```

Or update `backend/src/index.ts` to handle CORS:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'https://your-app.vercel.app',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

## Step 6: Custom Domain (Optional)

1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update CORS settings in backend to include new domain

## Troubleshooting

### WebSocket Connection Issues

If WebSocket won't connect:

1. Check browser console for errors
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Ensure CORS is properly configured
4. Check Cloudflare Workers logs: `wrangler tail`

### Build Failures

If Vercel build fails:

1. Check build logs for errors
2. Ensure all dependencies are listed in package.json
3. Try building locally first: `cd frontend && npm run build`

### Environment Variables Not Working

- Use `NEXT_PUBLIC_` prefix for client-side variables
- Redeploy after adding environment variables
- Check variables are set in Vercel dashboard

## Production Checklist

- [ ] OpenAI API key has sufficient credits
- [ ] Cloudflare Workers deployed successfully
- [ ] Environment variables configured in Vercel
- [ ] CORS configured for production domain
- [ ] WebSocket connection tested
- [ ] All rooms loading correctly

## Monitoring

- **Frontend**: Check Vercel dashboard for analytics
- **Backend**: Use `wrangler tail` for real-time logs
- **Costs**: Monitor OpenAI API usage

## Support

If you encounter issues:

1. Check browser developer console
2. Review Cloudflare Workers logs
3. Verify all environment variables
4. Test WebSocket connection directly

Happy deploying! 🚀