# MCP Configuration Guide

After deploying your Digital Twin to Vercel, you can configure various MCP clients to use your production server.

## Your Deployment URL

After deploying to Vercel, your URL will be something like:
```
https://your-project-name.vercel.app
```

The MCP endpoint will be at:
```
https://your-project-name.vercel.app/api/mcp
```

---

## Option 1: Claude Desktop Configuration

Configure Claude Desktop to use your production MCP server.

### Steps:

1. **Open Claude Desktop Settings**
   - Click on Claude Desktop menu
   - Go to Settings > Developer

2. **Add MCP Server Configuration**

Edit your Claude Desktop config file (usually at `~/Library/Application Support/Claude/claude_desktop_config.json` on Mac or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "digital-twin-production": {
      "command": "npx",
      "args": [
        "-y", 
        "mcp-remote", 
        "https://your-project-name.vercel.app/api/mcp"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

3. **Restart Claude Desktop**

4. **Test the Connection**

In Claude, try asking:
- "What are my technical skills?"
- "Tell me about my work experience"
- "What projects have I worked on?"

### Benefits:
- ✅ No local server needed
- ✅ Always accessible
- ✅ Automatic updates when you redeploy
- ✅ HTTPS security

---

## Option 2: VS Code GitHub Copilot Configuration

Configure VS Code to use your production MCP server.

### Steps:

1. **Create MCP Configuration File**

Create `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "digital-twin-production": {
      "type": "http",
      "url": "https://your-project-name.vercel.app/api/mcp",
      "timeout": 30000,
      "description": "Production Digital Twin RAG MCP Server"
    }
  }
}
```

2. **Test in VS Code**

Use GitHub Copilot chat:
```
@workspace Can you tell me about my work experience using the digital twin MCP server?
```

3. **Verify Response**

The response should include your personalized professional data from the digital twin.

---

## Option 3: Direct API Access

You can also access the API directly via HTTP requests.

### Using cURL:

```bash
curl -X POST https://your-project-name.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"query": "What are your skills?"}'
```

### Using Python:

```python
import requests

response = requests.post(
    "https://your-project-name.vercel.app/api/mcp",
    json={"query": "What are your skills?"}
)

print(response.json())
```

### Using JavaScript:

```javascript
fetch('https://your-project-name.vercel.app/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'What are your skills?' })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## Testing Your MCP Server

### Health Check

Test if your server is running:

```bash
curl https://your-project-name.vercel.app/api/mcp
```

Expected response:
```json
{
  "status": "ok",
  "service": "Digital Twin MCP Server",
  "timestamp": "2025-11-21T..."
}
```

### Test Query

```bash
curl -X POST https://your-project-name.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about yourself"}'
```

---

## Customizing Your Digital Twin

To customize what your digital twin knows about you, edit the `PROFILE_CONTEXT` in `/api/rag.py`:

```python
PROFILE_CONTEXT = """
You are a digital twin AI assistant representing [YOUR NAME].

About me:
- [Your background]
- [Your experience]
- [Your achievements]

Technical Skills:
- [List your skills]
- [Frameworks you know]
- [Tools you use]

Projects:
- [Notable projects]
- [Technologies used]

When answering questions, speak in first person as if you are me.
"""
```

After editing, commit and push to GitHub. Vercel will automatically redeploy.

---

## Troubleshooting

### MCP Server Not Responding

1. Check Vercel deployment status
2. Verify `GROQ_API_KEY` is set in Vercel environment variables
3. Check Vercel function logs for errors

### Getting Generic Responses

- Make sure you've customized `PROFILE_CONTEXT` in `/api/rag.py`
- Redeploy after making changes

### CORS Errors

The API includes CORS headers by default. If you still get CORS errors:
- Check that the request is going to the correct URL
- Verify the `Content-Type` header is set

---

## Security Considerations

### API Key Protection

Your `GROQ_API_KEY` is stored securely in Vercel environment variables and never exposed to the client.

### Rate Limiting

Consider adding rate limiting if you make your MCP server public:

```typescript
// In app/api/mcp/route.ts
import { ratelimit } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  // ... rest of code
}
```

---

## Advanced Configuration

### Multiple Environments

You can set up different MCP servers for development, staging, and production:

```json
{
  "mcpServers": {
    "digital-twin-dev": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3000/api/mcp"]
    },
    "digital-twin-staging": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://staging-digital-twin.vercel.app/api/mcp"]
    },
    "digital-twin-production": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://digital-twin.vercel.app/api/mcp"]
    }
  }
}
```

### Custom Domain

If you have a custom domain:

1. Add it in Vercel project settings
2. Update MCP configuration to use your domain:

```json
{
  "mcpServers": {
    "digital-twin": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://digitaltwin.yourdomain.com/api/mcp"]
    }
  }
}
```

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Get your deployment URL
3. ✅ Configure MCP client (Claude Desktop or VS Code)
4. ✅ Test the connection
5. ✅ Customize your profile
6. ✅ Share your digital twin with others!

For more help, see:
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Deployment guide
- [Vercel Documentation](https://vercel.com/docs)
- [MCP Documentation](https://modelcontextprotocol.io)
