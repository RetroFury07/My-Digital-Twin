# Claude Desktop MCP Configuration Guide

## Your Digital Twin MCP Server Setup

Your Next.js server is running at: **http://localhost:3000**

The MCP endpoint is available at: **http://localhost:3000/api/mcp**

---

## Option 1: Local Connection (Recommended for Development)

Add this to your Claude Desktop configuration:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "digital-twin": {
      "command": "node",
      "args": ["d:/WEEK-6/digital-twin-workshop/mydigitaltwin/mcp-server.js"],
      "env": {
        "UPSTASH_VECTOR_REST_URL": "your-upstash-url",
        "UPSTASH_VECTOR_REST_TOKEN": "your-upstash-token",
        "OPENAI_API_KEY": "your-openai-key",
        "GROQ_API_KEY": "your-groq-key"
      }
    }
  }
}
```

**Note:** Replace the environment variables with your actual API keys from `.env.local`

---

## Option 2: HTTP Connection via MCP-Remote

If you want to use the HTTP endpoint:

```json
{
  "mcpServers": {
    "digital-twin-http": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3000/api/mcp"]
    }
  }
}
```

**Note:** This requires the `mcp-remote` package which bridges HTTP to stdio.

---

## Option 3: Tunnel for Remote Access

If you need to access your MCP server remotely (e.g., from different machines):

1. Install a tunnel tool like `ngrok` or `cloudflared`:
   ```powershell
   npm install -g ngrok
   ngrok http 3000
   ```

2. Use the provided tunnel URL in your configuration:
   ```json
   {
     "mcpServers": {
       "digital-twin-remote": {
         "command": "npx",
         "args": ["-y", "mcp-remote", "https://your-tunnel-url.ngrok.io/api/mcp"]
       }
     }
   }
   ```

---

## Testing Your MCP Server

### Test the HTTP endpoint:
```powershell
curl -X POST http://localhost:3000/api/mcp `
  -H "Content-Type: application/json" `
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }'
```

### Test the stdio server:
```powershell
node mydigitaltwin/mcp-server.js
```
Then type JSON-RPC messages to interact with it.

---

## Available Tool

Once configured, Claude Desktop will have access to:

**Tool Name:** `query_digital_twin`

**Description:** Query the digital twin's knowledge base to get information about the person's professional background, skills, experience, and career.

**Example Usage in Claude:**
- "What are your technical skills?"
- "Tell me about your work experience"
- "What projects have you worked on?"

---

## Troubleshooting

### Server not starting?
- Check that port 3000 is not in use
- Verify `.env.local` has all required API keys
- Run: `cd mydigitaltwin; pnpm dev`

### Claude Desktop not connecting?
- Restart Claude Desktop after changing the config
- Check the Developer Console in Claude Desktop for errors
- Verify the file path in the config is correct (use absolute paths)

### MCP commands not working?
- Ensure the server is running before starting Claude Desktop
- Check that environment variables are properly set
- Look at the server logs for error messages

---

## Current Status

✅ Next.js server running on http://localhost:3000  
✅ MCP HTTP endpoint available at /api/mcp  
✅ Stdio MCP server available via mcp-server.js  

**Next Steps:**
1. Copy your API keys from `.env.local`
2. Choose one of the configuration options above
3. Edit your Claude Desktop config file
4. Restart Claude Desktop
5. Test the `query_digital_twin` tool!
