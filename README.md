# Digital Twin Workshop

This repo builds embeddings from your professional profile (`digitaltwin.json`) and stores them in Upstash Vector for semantic retrieval, then serves a simple MCP server to power RAG.

## Prerequisites

- Python 3.10+
- Upstash Vector index created with dimension = 1536
- API keys
  - `UPSTASH_VECTOR_REST_URL` and `UPSTASH_VECTOR_REST_TOKEN`
  - `OPENAI_API_KEY` (used for embeddings via `text-embedding-3-small`)

## Setup

1. Copy `.env.example` to `.env` and fill in values.
2. Install dependencies:

```powershell
# From the repo root
python -m pip install -r requirements.txt
```

## Embed your Digital Twin

```powershell
python .\embed_digitaltwin.py
```

- The script flattens `digitaltwin.json` and uploads embeddings and metadata to Upstash Vector.
- If you see a dimension mismatch error from Upstash, recreate your index with `dimension=1536`.

## Notes

- The previous version attempted to use Groq for embeddings; Groq currently does not provide the `text-embedding-3-small` model. This script now uses OpenAI's embeddings API instead.
- Keep your API keys safe. Do not commit `.env`.
