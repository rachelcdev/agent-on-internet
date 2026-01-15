# Agent on Internet 🤖

An AI Task Automation Agent powered by Google AI (Gemini) and deployable to Cloudflare Workers. This agent can process tasks, answer questions, and provide assistance through a simple HTTP API.

## Features

- ✅ **Google AI Integration** - Uses Gemini models for intelligent task processing
- ✅ **Cloudflare Workers** - Serverless deployment with global edge network
- ✅ **TypeScript** - Full type safety and modern development experience
- ✅ **REST API** - Simple HTTP endpoints for easy integration
- ✅ **CORS Support** - Ready for browser-based clients
- ✅ **Fallback Mode** - Works without API key for basic responses

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Cloudflare Account](https://dash.cloudflare.com/sign-up) (free tier works!)
- [Google AI API Key](https://aistudio.google.com/app/apikey) (optional but recommended)

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Test the agent**:
   ```bash
   # Health check
   curl http://localhost:8787/health
   
   # Get API info
   curl http://localhost:8787/info
   
   # Send a task (fallback mode)
   curl -X POST http://localhost:8787/agent \
     -H "Content-Type: application/json" \
     -d '{"task": "Hello, what can you do?"}'
   ```

### With Google AI API Key

To enable full AI capabilities during local development, create a `.dev.vars` file:

```bash
# .dev.vars
GOOGLE_AI_API_KEY=your-api-key-here
```

Then test with AI:
```bash
curl -X POST http://localhost:8787/agent \
  -H "Content-Type: application/json" \
  -d '{"task": "What is the capital of France?"}'
```

## API Endpoints

### `GET /` or `GET /health`
Health check endpoint.

**Response**:
```json
{
  "status": "healthy",
  "message": "Agent is running",
  "timestamp": "2026-01-15T22:48:00.000Z",
  "hasApiKey": true
}
```

### `GET /info`
Get API information and usage examples.

### `POST /agent`
Process a task with the AI agent.

**Request**:
```json
{
  "task": "Your task or question here",
  "context": "Optional context information",
  "model": "gemini-2.5-flash"
}
```

**Available Models**:
- `gemini-2.5-flash` (default, fast)

**Response**:
```json
{
  "success": true,
  "result": "The AI's response to your task",
  "timestamp": "2026-01-15T22:48:00.000Z",
  "model": "gemini-2.5-flash",
  "tokensUsed": 42
}
```

## Deployment to Cloudflare

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy**:
```bash
# 1. Login to Cloudflare (first time only)
npx wrangler login

# 2. Add your Google AI API key
npx wrangler secret put GOOGLE_AI_API_KEY

# 3. Deploy!
npm run deploy
```

Your agent will be live at: `https://agent-on-internet.<your-subdomain>.workers.dev`

## Project Structure

```
agent-on-internet/
├── src/
│   ├── index.ts      # Main worker entry point & HTTP routing
│   ├── agent.ts      # Agent logic & Google AI integration
│   └── types.ts      # TypeScript type definitions
├── package.json      # Dependencies & scripts
├── tsconfig.json     # TypeScript configuration
├── wrangler.toml     # Cloudflare Workers config
└── README.md         # This file
```

## Examples

### Ask a Question
```bash
curl -X POST https://your-agent.workers.dev/agent \
  -H "Content-Type: application/json" \
  -d '{"task": "Explain quantum computing in simple terms"}'
```

### With Context
```bash
curl -X POST https://your-agent.workers.dev/agent \
  -H "Content-Type: application/json" \
  -d '{
    "task": "What should I do next?",
    "context": "I am learning web development and just finished HTML/CSS"
  }'
```

### Use a Specific Model
```bash
curl -X POST https://your-agent.workers.dev/agent \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Write a haiku about AI",
    "model": "gemini-1.5-pro"
  }'
```

## Development

### Build TypeScript
```bash
npm run build
```

### Deploy to Cloudflare
```bash
npm run deploy
```

### View Logs
```bash
npx wrangler tail
```

## Environment Variables

- `GOOGLE_AI_API_KEY` - Your Google AI API key (required for AI features)

Set secrets using Wrangler:
```bash
npx wrangler secret put GOOGLE_AI_API_KEY
```

## Troubleshooting

**Agent returns fallback responses**
- Make sure you've set the `GOOGLE_AI_API_KEY` secret
- Verify your API key is valid at https://aistudio.google.com/

**TypeScript errors**
- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript version matches in `package.json`

**Wrangler errors**
- Make sure you're logged in: `npx wrangler login`
- Check your `wrangler.toml` configuration

## License

MIT

## Learn More

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Google AI (Gemini) API Docs](https://ai.google.dev/docs)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
