# Cloudflare Deployment Quick Start

Deploy Unreal House entirely on Cloudflare in 5 minutes!

## Prerequisites

- Cloudflare account (free tier works)
- OpenAI API key
- Node.js 18+ installed

## Quick Deploy

### 1. Clone and Setup

```bash
git clone <your-repo>
cd unreal-house
npm install
```

### 2. Set Your OpenAI Key

```bash
export OPENAI_API_KEY=sk-your-key-here
```

### 3. Run Deployment Script

```bash
./deploy-cloudflare.sh
```

The script will:
- Install Wrangler CLI if needed
- Deploy backend to Workers
- Build and deploy frontend to Pages
- Configure CORS automatically

## Manual Deployment Steps

If you prefer to deploy manually:

### Backend (Workers)

```bash
cd backend
npm install
wrangler login
wrangler deploy
wrangler secret put OPENAI_API_KEY  # Enter your key when prompted
```

### Frontend (Pages)

```bash
cd frontend
npm install
npm run build
wrangler pages deploy out --project-name=unreal-house
```

### Update CORS

After getting your Pages URL, update `backend/wrangler.toml`:

```toml
[env.production]
vars = { 
  CORS_ORIGIN = "https://unreal-house.pages.dev"  # Your Pages URL
}
```

Then redeploy backend:
```bash
cd backend && wrangler deploy
```

## URLs After Deployment

- **Frontend**: `https://unreal-house.pages.dev`
- **Backend**: `https://unreal-house.<your-subdomain>.workers.dev`
- **WebSocket**: Automatically connects to backend

## Custom Domain Setup

### 1. Add Domain to Cloudflare

1. Go to Cloudflare Dashboard
2. Add your domain
3. Update nameservers at your registrar

### 2. Configure Pages Custom Domain

1. Go to Pages > unreal-house > Custom domains
2. Add your domain (e.g., `unrealhouse.com`)
3. Wait for SSL certificate

### 3. Update Backend Routes

Edit `backend/wrangler.toml`:

```toml
routes = [
  { pattern = "unrealhouse.com/api/*", zone_name = "unrealhouse.com" },
  { pattern = "unrealhouse.com/stream", zone_name = "unrealhouse.com" },
  { pattern = "unrealhouse.com/health", zone_name = "unrealhouse.com" }
]

[env.production]
vars = { 
  CORS_ORIGIN = "https://unrealhouse.com"
}
```

Deploy again:
```bash
cd backend && wrangler deploy
```

## Environment Variables

### Backend Secrets (set with wrangler)
- `OPENAI_API_KEY` - Your OpenAI API key

### Backend Variables (in wrangler.toml)
- `CORS_ORIGIN` - Your frontend URL
- `OPENAI_MODEL` - Model to use (default: gpt-4o-mini)
- `MAX_DAILY_MESSAGES` - Daily message limit

### Frontend Variables
No environment variables needed when deployed on same domain!

## Monitoring

### View Logs
```bash
wrangler tail  # Real-time logs
```

### Analytics
- Workers: Cloudflare Dashboard > Workers & Pages > Analytics
- Pages: Cloudflare Dashboard > Pages > Analytics

## Troubleshooting

### WebSocket Won't Connect
- Check CORS_ORIGIN in wrangler.toml matches your Pages URL
- Ensure backend is deployed successfully
- Check browser console for errors

### Build Fails
- Ensure Node.js 18+ is installed
- Try building locally first: `npm run build`
- Check for TypeScript errors

### No Messages Appearing
- Verify OPENAI_API_KEY is set correctly
- Check Workers logs: `wrangler tail`
- Ensure you have OpenAI credits

## Cost Estimates

**Cloudflare Free Tier:**
- Workers: 100k requests/day
- Pages: Unlimited requests
- Bandwidth: Unlimited

**OpenAI Costs:**
- ~$0.50-1.00 per room per day with GPT-4o-mini

## Support

- Check Workers logs: `wrangler tail`
- Pages build logs in Cloudflare Dashboard
- GitHub Issues for bugs

Happy deploying! 🚀