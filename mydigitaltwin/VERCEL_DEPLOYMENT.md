# Deploying Digital Twin to Vercel

## Prerequisites
- A [Vercel account](https://vercel.com/signup)
- Vercel CLI installed (optional): `npm i -g vercel`
- Your Groq API key

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   cd mydigitaltwin
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Set the **Root Directory** to `mydigitaltwin`

3. **Configure Environment Variables**
   
   Add these environment variables in the Vercel dashboard:
   
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Navigate to your project**
   ```bash
   cd mydigitaltwin
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set environment variables**
   ```bash
   vercel env add GROQ_API_KEY
   ```
   Enter your Groq API key when prompted.

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Environment Variables Required

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Your Groq API key for LLM completions |

## Project Structure

```
mydigitaltwin/
├── api/
│   └── rag.py          # Python serverless function for backend
├── app/
│   ├── api/
│   │   └── mcp/
│   │       └── route.ts # Next.js API route (middleware)
│   ├── page.tsx         # Main chat interface
│   └── layout.tsx
├── requirements.txt     # Python dependencies for serverless function
├── vercel.json         # Vercel configuration
└── package.json
```

## How It Works

1. **Frontend (Next.js)**: Deployed as a static site with server-side rendering
2. **Backend (Python)**: Deployed as a Vercel serverless function at `/api/rag`
3. **API Route**: The Next.js API route forwards requests to the Python function
4. **LLM**: Uses Groq's free tier (no OpenAI quota issues)

## Updating Your Deployment

To update your deployment after making changes:

```bash
git add .
git commit -m "Update digital twin"
git push
```

Vercel will automatically deploy the changes.

## Testing Your Deployment

After deployment, visit your Vercel URL and try asking questions like:
- "What are your skills?"
- "Tell me about your experience"
- "What projects have you worked on?"

## Customizing Your Profile

Edit the `PROFILE_CONTEXT` in `/api/rag.py` to customize your digital twin's knowledge:

```python
PROFILE_CONTEXT = """
You are a digital twin AI assistant representing [YOUR NAME].

About me:
- [Add your background]
- [Add your experience]
...
"""
```

After updating, commit and push to deploy the changes.

## Troubleshooting

### Build Fails
- Check that `requirements.txt` exists with `groq==0.11.0`
- Ensure `vercel.json` is properly configured

### API Returns 500 Error
- Verify `GROQ_API_KEY` is set in Vercel environment variables
- Check Vercel function logs in the dashboard

### Frontend Can't Connect to Backend
- Ensure the Python file is at `/api/rag.py`
- Check that `vercel.json` has the correct rewrite rule

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Python Runtime](https://vercel.com/docs/functions/runtimes/python)
- [Groq Documentation](https://console.groq.com/docs)

## Next Steps After Deployment

Once deployed, you can:

1. **Configure MCP Clients** - See [MCP_CONFIGURATION.md](./MCP_CONFIGURATION.md) for:
   - Claude Desktop configuration
   - VS Code GitHub Copilot configuration
   - Direct API access examples

2. **Customize Your Profile** - Edit `PROFILE_CONTEXT` in `/api/rag.py` to personalize your digital twin

3. **Test Your Deployment** - Visit your Vercel URL and chat with your digital twin

4. **Share Your Digital Twin** - Give others access to your deployed URL
