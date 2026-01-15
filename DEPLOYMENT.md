# Deployment Guide: Agent on Internet to Cloudflare Workers

This guide walks you through deploying your AI agent to Cloudflare Workers step-by-step.

## Prerequisites

Before you begin, make sure you have:

1. ✅ A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier is fine)
2. ✅ [Node.js](https://nodejs.org/) v18 or later installed
3. ✅ A [Google AI API key](https://aistudio.google.com/app/apikey) (optional but recommended)
4. ✅ Project dependencies installed (`npm install`)

## Step 1: Install Wrangler CLI

Wrangler is Cloudflare's CLI tool for managing Workers. It's already in your `package.json`, but you can verify:

```bash
npx wrangler --version
```

## Step 2: Authenticate with Cloudflare

Run the login command and follow the browser prompts:

```bash
npx wrangler login
```

This will:
1. Open your browser
2. Ask you to log into your Cloudflare account
3. Grant Wrangler access to your account

## Step 3: Configure Your Worker

Your `wrangler.toml` is already configured, but you can customize:

```toml
name = "agent-on-internet"  # Change this to your preferred name
main = "src/index.ts"
compatibility_date = "2024-01-15"
```

The `name` field determines your worker's URL: 
`https://<name>.<your-subdomain>.workers.dev`

## Step 4: Add Google AI API Key (Recommended)

Without this, your agent will run in fallback mode with limited capabilities.

### Get Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

### Set as Worker Secret

```bash
npx wrangler secret put GOOGLE_AI_API_KEY
```

When prompted, paste your API key and press Enter.

> **Note**: Secrets are encrypted and can only be accessed by your Worker. They won't appear in logs or the dashboard.

## Step 5: Deploy Your Worker!

```bash
npm run deploy
```

Or using Wrangler directly:

```bash
npx wrangler deploy
```

You should see output like:

```
Total Upload: 3.45 KiB / gzip: 1.23 KiB
Uploaded agent-on-internet (2.34 sec)
Published agent-on-internet (0.56 sec)
  https://agent-on-internet.<your-subdomain>.workers.dev
Current Deployment ID: abc123...
```

🎉 **Your agent is now live!**

## Step 6: Test Your Deployed Agent

### Health Check

```bash
curl https://agent-on-internet.<your-subdomain>.workers.dev/health
```

### Get API Info

```bash
curl https://agent-on-internet.<your-subdomain>.workers.dev/info
```

### Send a Task

```bash
curl -X POST https://agent-on-internet.<your-subdomain>.workers.dev/agent \
  -H "Content-Type: application/json" \
  -d '{"task": "What is the capital of France?"}'
```

## Step 7: Monitor and Manage

### View Real-Time Logs

```bash
npx wrangler tail
```

This streams live logs from your Worker. Send requests to see them appear!

### Check Dashboard

Visit the [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages

Here you can:
- View deployment history
- See analytics and metrics
- Manage environment variables
- Configure custom domains

## Optional: Custom Domain

To use your own domain instead of `*.workers.dev`:

1. Add your domain to Cloudflare
2. In the Workers dashboard, go to your worker
3. Click "Triggers" → "Add Custom Domain"
4. Follow the prompts to map your domain

Example: `https://agent.yourdomain.com`

## Optional: KV Storage

To add persistent storage for your agent:

1. **Create a KV namespace**:
   ```bash
   npx wrangler kv:namespace create AGENT_KV
   ```

2. **Update `wrangler.toml`**:
   ```toml
   [[kv_namespaces]]
   binding = "AGENT_KV"
   id = "your-kv-namespace-id"  # From step 1 output
   ```

3. **Use in code** (already typed in `src/types.ts`):
   ```typescript
   // Store data
   await env.AGENT_KV.put('key', 'value');
   
   // Retrieve data
   const value = await env.AGENT_KV.get('key');
   ```

4. **Redeploy**:
   ```bash
   npm run deploy
   ```

## Updating Your Agent

Made changes to your code? Simply redeploy:

```bash
npm run deploy
```

Cloudflare Workers deploy almost instantly (usually < 10 seconds).

## Environment Comparison

| Feature | Local (`npm run dev`) | Production (`npm run deploy`) |
|---------|----------------------|------------------------------|
| URL | `http://localhost:8787` | `https://*.workers.dev` |
| Secrets | `.dev.vars` file | `wrangler secret put` |
| Hot reload | ✅ Yes | ❌ Must redeploy |
| Global edge | ❌ No | ✅ Yes (300+ locations) |

## Troubleshooting

### "Error: No such command 'deploy'"

Make sure you're in the project directory:
```bash
cd /Users/ruicao/Desktop/agent-on-internet
```

### "Authentication error"

Re-run the login:
```bash
npx wrangler login
```

### "Failed to publish"

Common issues:
- Check your internet connection
- Verify you're logged in: `npx wrangler whoami`
- Ensure `wrangler.toml` is valid

### "Google AI API error"

Verify:
1. Your API key is set: `npx wrangler secret list`
2. Your API key is valid at [Google AI Studio](https://aistudio.google.com/)
3. You haven't exceeded API quotas

## Costs

Cloudflare Workers Free Tier includes:
- ✅ 100,000 requests per day
- ✅ 10 ms CPU time per request
- ✅ Unlimited outbound requests

This is plenty for testing and small projects! 

For production apps, check [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).

Google AI also has a free tier with generous limits.

## Next Steps

- 📖 Explore the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
- 🧪 Try different Gemini models (`gemini-1.5-pro`, etc.)
- 🔧 Add more endpoints to your agent
- 📊 Set up analytics and monitoring
- 🌐 Configure a custom domain

---

**Happy deploying! 🚀**

If you run into issues, check the [Cloudflare Workers Discord](https://discord.gg/cloudflaredev) or [Google AI community](https://developers.googleblog.com/).
