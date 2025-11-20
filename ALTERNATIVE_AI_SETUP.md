# Alternative AI Provider Setup

## ✅ Changes Made

Your digital twin project now uses **FREE alternatives** to avoid OpenAI quota issues:

### 1. **Embeddings: sentence-transformers (Local & Free)**
- **Model**: `all-MiniLM-L6-v2` (384-dim, padded to 1536)
- **Provider**: Runs locally on your machine
- **Cost**: FREE - no API calls needed
- **Performance**: Fast and efficient for most use cases

### 2. **Chat/LLM: Groq (Free Tier Available)**
- **Model**: `llama-3.1-8b-instant`
- **Provider**: Groq (already configured)
- **Cost**: FREE tier available with generous limits

## 🔧 Configuration

Your `.env` file now includes:

```env
# Choose embedding provider
EMBEDDING_PROVIDER="sentence-transformers"  # or "openai"

# Only needed if using EMBEDDING_PROVIDER=openai
OPENAI_API_KEY="your-key-here"

# Free Groq API for chat/LLM
GROQ_API_KEY="your-groq-api-key"
```

## 🚀 Usage

### Option A: Use Free Local Embeddings (Default)
```bash
# Already set in .env
EMBEDDING_PROVIDER="sentence-transformers"

# Run your API
python digital_twin_api.py

# Re-embed your data (if needed)
python embed_digitaltwin.py
```

### Option B: Switch Back to OpenAI (if you get credits)
```env
EMBEDDING_PROVIDER="openai"
OPENAI_API_KEY="your-new-key-with-credits"
```

## 📦 Dependencies Installed

- ✅ `sentence-transformers>=2.2.2` - Local embeddings
- ✅ `groq>=0.13.1` - Free LLM chat completions
- ⚠️ `openai>=1.51.0` - Optional (only if EMBEDDING_PROVIDER=openai)

## 🎯 Benefits

1. **No API Costs**: sentence-transformers runs entirely locally
2. **No Quota Limits**: Use as much as you need
3. **Privacy**: Your data never leaves your machine
4. **Fast**: Local inference is often faster than API calls
5. **Groq for Chat**: Free tier with fast inference speeds

## ⚠️ Note About Dimensions

- sentence-transformers `all-MiniLM-L6-v2` produces 384-dim embeddings
- These are padded with zeros to 1536-dim to match your Upstash Vector index
- If you want optimal performance, consider re-creating your Upstash index with 384 dimensions

## 🔄 Re-embedding Your Data

If you want to re-embed with the new model:

```bash
# This will use sentence-transformers
python embed_digitaltwin.py
```

## 📚 Other Free Alternatives

If you want to explore other options:

### Embeddings:
- **Voyage AI** - Free tier available
- **Cohere** - Free tier with embed-english-v3.0
- **Together AI** - Free tier for embeddings

### Chat/LLM:
- **Groq** (current) - Fast and free
- **Together AI** - Free tier with various models
- **Ollama** - Run LLMs locally (100% free)
- **Anthropic Claude** - Free tier available

Would you like me to set up any of these alternatives?
