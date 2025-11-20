# Digital Twin MCP Deployment Guide

## Overview
This guide explains how to deploy your Digital Twin MCP server to Vercel and connect it to Claude Desktop.

## Architecture
- **Frontend**: Next.js 13 (deployed on Vercel)
- **Backend**: FastAPI Python service (needs separate hosting)
- **MCP Endpoint**: `/api/mcp` route in Next.js

## Deployment Steps

### 1. Deploy Python Backend (FastAPI)

Your Python backend (`digital_twin_api.py`) needs to be hosted separately. Options:

#### Option A: Deploy to Render.com (Recommended - Free tier available)
```bash
# Create Dockerfile in root directory
# See example below
```

#### Option B: Deploy to Railway.app
```bash
railway init
railway up
```

#### Option C: Deploy to AWS EC2/Lambda
Follow AWS deployment guides for FastAPI applications.

### 2. Deploy Next.js to Vercel

```bash
cd mydigitaltwin
vercel
```

Or connect via GitHub:
1. Go to https://vercel.com/new
2. Import repository: `RetroFury07/My-Digital-Twin`
3. Set root directory: `mydigitaltwin`
4. Add environment variables (see below)
5. Deploy

### 3. Configure Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```
DIGITAL_TWIN_BACKEND_URL=https://your-backend-url.com
UPSTASH_VECTOR_REST_URL=https://your-upstash-url
UPSTASH_VECTOR_REST_TOKEN=your-token
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
```

### 4. Update Claude Desktop Configuration

Once deployed, update your Claude Desktop MCP config:

**Location**: 
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Configuration**:
```json
{
  "mcpServers": {
    "digital-twin-production": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-app.vercel.app/api/mcp"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

Replace `https://your-app.vercel.app` with your actual Vercel deployment URL.

### 5. Test the MCP Endpoint

```bash
# Test health check
curl https://your-app.vercel.app/api/mcp

# Test MCP query
curl -X POST https://your-app.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"question": "What are your technical skills?"}'
```

## Sample Dockerfile for Python Backend

Create `Dockerfile` in your project root:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY digital_twin_api.py .
COPY digitaltwin.json .
COPY digitaltwin_rag.py .

EXPOSE 8000

CMD ["uvicorn", "digital_twin_api:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Troubleshooting

### MCP Connection Failed
- Check Vercel deployment logs
- Verify environment variables are set
- Test `/api/mcp` endpoint directly

### Backend Not Responding
- Ensure Python backend is deployed and running
- Check `DIGITAL_TWIN_BACKEND_URL` points to correct URL
- Verify backend health endpoint works

### Claude Desktop Not Connecting
- Restart Claude Desktop after config changes
- Check config JSON syntax is valid
- Verify MCP endpoint URL is correct

## Local Development

```bash
# Terminal 1: Start Python backend
cd d:\WEEK-6\digital-twin-workshop
python digital_twin_api.py

# Terminal 2: Start Next.js dev server
cd mydigitaltwin
npm run dev

# Terminal 3: Test locally
curl http://localhost:3000/api/mcp
```

## Production URLs

After deployment, you'll have:
- Frontend: `https://your-app.vercel.app`
- MCP Endpoint: `https://your-app.vercel.app/api/mcp`
- Python Backend: `https://your-backend.com` (separate hosting)

## Next Steps

1. ✅ Deploy Python backend to Render/Railway
2. ✅ Deploy Next.js to Vercel
3. ✅ Configure environment variables
4. ✅ Update Claude Desktop config
5. ✅ Test MCP connection
6. ✅ Start using your Digital Twin in Claude!
