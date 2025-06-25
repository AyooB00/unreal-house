# Deploy Everything on Cloudflare (Recommended)

Host both frontend and backend on Cloudflare for a unified deployment.

## Benefits of All-Cloudflare Deployment

- **Single Platform**: One dashboard, one billing, one DNS
- **No CORS Issues**: Same domain for frontend and backend
- **Better Performance**: Everything on the edge
- **Cost Effective**: Generous free tier covers both
- **Integrated Analytics**: Unified monitoring

## Architecture

```
cloudflare.com
├── Pages (Frontend - Next.js)
│   └── unreal-house.pages.dev
└── Workers (Backend - WebSocket + API)
    └── Handled by same domain via routes
```

## Step-by-Step Deployment

### 1. Prepare the Project

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### 2. Deploy Backend (Workers + Durable Objects)

```bash
cd backend

# Create wrangler.toml if not exists
cat > wrangler.toml << 'EOF'
name = "unreal-house"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[durable_objects]
bindings = [{name = "ROOMS", class_name = "ConversationRoom"}]

[[migrations]]
tag = "v1"
new_classes = ["ConversationRoom"]

[vars]
ENVIRONMENT = "production"

# KV namespace for storing data (optional)
[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"
EOF

# Deploy Workers
wrangler deploy
```

### 3. Build Frontend for Production

```bash
cd ../frontend

# Update next.config.js for static export
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Since we're on same domain, use relative paths
  env: {
    NEXT_PUBLIC_API_URL: ''  // Empty = same domain
  }
}

module.exports = nextConfig
EOF

# Build the frontend
npm run build
```

### 4. Deploy Frontend to Cloudflare Pages

```bash
# Deploy to Pages
wrangler pages deploy out --project-name=unreal-house

# Or using the dashboard:
# 1. Go to Cloudflare Dashboard > Pages
# 2. Create new project
# 3. Upload the 'out' directory
```

### 5. Configure Routing

In Cloudflare Dashboard, set up these routes:

```
yourdomain.com/* → Pages (Frontend)
yourdomain.com/api/* → Workers (Backend)
yourdomain.com/stream → Workers (WebSocket)
```

### 6. Environment Variables

In Cloudflare Dashboard > Workers > Settings:

```
OPENAI_API_KEY=sk-...
CORS_ORIGIN=https://yourdomain.com
```

## Custom Domain Setup

1. Add domain to Cloudflare
2. In Pages settings, add custom domain
3. Workers automatically use same domain

## Single Command Deployment

Create `deploy-cloudflare.sh`:

```bash
#!/bin/bash

# Deploy both frontend and backend to Cloudflare

echo "🚀 Deploying to Cloudflare..."

# Deploy backend
cd backend
wrangler deploy

# Build and deploy frontend
cd ../frontend
npm run build
wrangler pages deploy out --project-name=unreal-house

echo "✅ Deployment complete!"
```

## Cost Comparison

**Cloudflare Free Tier:**
- 100,000 requests/day
- 10ms CPU time per request
- Unlimited bandwidth
- Custom domains included

**Vercel Free Tier:**
- 100GB bandwidth
- 100,000 function invocations
- No WebSocket support

## Monitoring

Single dashboard for everything:
- Analytics
- Error logs
- Performance metrics
- Cost tracking

## Troubleshooting

### Build Issues
```bash
# Test build locally
cd frontend
npm run build
npx serve out
```

### WebSocket Connection
- No CORS needed (same domain)
- Check Workers logs: `wrangler tail`

### Performance
- Enable Cloudflare caching
- Use Workers KV for session data
- Enable Auto Minify in Cloudflare

This approach gives you the best performance, simplest deployment, and lowest operational overhead!