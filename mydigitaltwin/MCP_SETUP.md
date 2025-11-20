# Digital Twin MCP Server - Claude Desktop Setup

## Quick Setup Guide

Your Digital Twin is now deployed on Vercel with an MCP endpoint. Follow these steps to connect it to Claude Desktop.

## Prerequisites

- Deployed Vercel app: `https://your-app.vercel.app` (check your Vercel dashboard)
- Claude Desktop installed
- `mcp-remote` package (auto-installed by Claude)

## Step 1: Get Your Vercel Deployment URL

After Vercel deployment completes, note your app URL:
- Check Vercel dashboard: https://vercel.com/dashboard
- Your URL will be: `https://<your-project-name>.vercel.app`

## Step 2: Configure Claude Desktop

### Windows
1. Open: `%APPDATA%\Claude\claude_desktop_config.json`
2. Edit the file (create if it doesn't exist)

### Mac
1. Open: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Edit the file (create if it doesn't exist)

### Configuration

Replace the entire file with this configuration (update the URL):

```json
{
  "mcpServers": {
    "digital-twin": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://YOUR-APP-NAME.vercel.app/api/mcp"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**Important**: Replace `YOUR-APP-NAME` with your actual Vercel project name!

## Step 3: Restart Claude Desktop

1. Close Claude Desktop completely
2. Reopen Claude Desktop
3. The MCP server will connect automatically

## Step 4: Test Your Digital Twin

In Claude Desktop, try asking:

```
"Query my digital twin: What are your technical skills?"
"Ask my digital twin about your experience with computer vision"
"What projects has my digital twin worked on?"
```

## Verification

### Check MCP Endpoint Health

Test your endpoint is live:

```bash
# Browser or curl
curl https://your-app-name.vercel.app/api/mcp
```

Should return:
```json
{
  "status": "ok",
  "service": "Digital Twin MCP Server",
  "timestamp": "2025-11-18T..."
}
```

### Test MCP Query

```bash
curl -X POST https://your-app-name.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"question": "What are your technical skills?"}'
```

## Troubleshooting

### MCP Server Not Connecting

1. **Check Claude Desktop Logs**
   - Windows: `%APPDATA%\Claude\logs\`
   - Mac: `~/Library/Logs/Claude/`

2. **Verify JSON Syntax**
   - Use a JSON validator: https://jsonlint.com/
   - Ensure no trailing commas

3. **Check Vercel Deployment**
   - Visit Vercel dashboard
   - Check deployment status and logs
   - Verify environment variables are set

4. **Restart Everything**
   ```bash
   # Kill any Claude processes
   # Windows: Task Manager
   # Mac: Activity Monitor
   # Then restart Claude Desktop
   ```

### Backend Error

If you see "Backend responded with 500":

1. Check your Python backend is deployed and running
2. Verify `DIGITAL_TWIN_BACKEND_URL` in Vercel environment variables
3. Check Vercel function logs for errors

### Environment Variables Missing

In Vercel Dashboard:
1. Settings → Environment Variables
2. Add all required variables:
   - `DIGITAL_TWIN_BACKEND_URL`
   - `UPSTASH_VECTOR_REST_URL`
   - `UPSTASH_VECTOR_REST_TOKEN`
   - `OPENAI_API_KEY`
   - `GROQ_API_KEY`

## Advanced Configuration

### Multiple MCP Servers

You can add multiple servers to your config:

```json
{
  "mcpServers": {
    "digital-twin": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://your-app.vercel.app/api/mcp"]
    },
    "other-server": {
      "command": "node",
      "args": ["/path/to/other-server.js"]
    }
  }
}
```

### Local Development

For local testing:

```json
{
  "mcpServers": {
    "digital-twin-local": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3000/api/mcp"]
    }
  }
}
```

## Next Steps

Once connected, your Digital Twin will be available in Claude for:
- Interview preparation
- Technical skill queries
- Project experience discussions
- Career planning assistance

## Support

- Vercel Deployment Issues: Check [Vercel Dashboard](https://vercel.com/dashboard)
- MCP Protocol: See [MCP Documentation](https://modelcontextprotocol.io/)
- Claude Desktop: Check Claude app logs

---

**Your Digital Twin is now live!** Ask Claude to query your digital twin and start preparing for interviews! 🚀
