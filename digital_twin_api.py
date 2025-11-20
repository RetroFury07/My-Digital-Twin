"""
FastAPI wrapper for the Digital Twin RAG backend.

POST /rag
  Body: { "question": string }
  Returns: { "answer": string }

Environment variables required:
  - OPENAI_API_KEY (for embeddings and optional chat fallback)
  - Optional: GROQ_API_KEY (for chat completion; falls back to OpenAI if missing)
  - UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN
"""

import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from upstash_vector import Index
from groq import Groq
from openai import OpenAI
from sentence_transformers import SentenceTransformer

load_dotenv()

# Embedding configuration - choose provider
EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "sentence-transformers")  # or "openai"
EMBEDDING_MODEL = "text-embedding-3-small"  # for OpenAI
LOCAL_EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # for sentence-transformers (384-dim)
DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize embedding model based on provider
if EMBEDDING_PROVIDER == "sentence-transformers":
    embedding_model = SentenceTransformer(LOCAL_EMBEDDING_MODEL)
    openai_client = None
else:
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is required when using OpenAI embeddings.")
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    embedding_model = None

groq_client: Optional[Groq]
try:
    groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
except Exception:
    groq_client = None

try:
    index = Index.from_env()
except Exception as e:
    raise RuntimeError(f"Failed to init Upstash Vector: {e}")


def embed_query(text: str):
    if EMBEDDING_PROVIDER == "sentence-transformers":
        # Local embeddings with sentence-transformers
        return embedding_model.encode(text).tolist()
    else:
        # OpenAI embeddings
        resp = openai_client.embeddings.create(model=EMBEDDING_MODEL, input=text)
        return resp.data[0].embedding


def query_vectors(question: str, top_k: int = 3):
    vector = embed_query(question)
    results = index.query(vector=vector, top_k=top_k, include_metadata=True)
    return results


def generate_with_groq(prompt: str) -> str:
    if groq_client is None:
        raise RuntimeError("Groq client is not configured")
    completion = groq_client.chat.completions.create(
        model=DEFAULT_GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are an AI digital twin. Answer in first person based on the provided context.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=500,
    )
    return completion.choices[0].message.content.strip()


def generate_with_openai(prompt: str) -> str:
    completion = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are an AI digital twin. Answer in first person based on the provided context.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=500,
    )
    return completion.choices[0].message.content.strip()


def rag_answer(question: str) -> str:
    results = query_vectors(question, top_k=3)
    if not results:
        return "I don't have specific information about that topic."

    top_docs = []
    for r in results:
        md = getattr(r, "metadata", {}) or {}
        content = md.get("text") or md.get("content") or ""
        title = md.get("title")
        if content:
            top_docs.append(f"{title + ': ' if title else ''}{content}")

    if not top_docs:
        return "I found some information but couldn't extract details."

    context = "\n\n".join(top_docs)
    prompt = (
        "Based on the following information about yourself, answer the question.\n"
        "Speak in first person as if you are describing your own background.\n\n"
        f"Your Information:\n{context}\n\n"
        f"Question: {question}\n\n"
        "Provide a helpful, professional response:"
    )

    try:
        if groq_client is not None:
            return generate_with_groq(prompt)
    except Exception:
        pass
    return generate_with_openai(prompt)


class RagRequest(BaseModel):
    question: str


class RagResponse(BaseModel):
    answer: str


app = FastAPI(title="Digital Twin RAG API")


@app.post("/rag", response_model=RagResponse)
def rag_endpoint(payload: RagRequest):
    q = (payload.question or "").strip()
    if not q:
        raise HTTPException(status_code=400, detail="'question' must be a non-empty string")
    try:
        answer = rag_answer(q)
        return RagResponse(answer=answer)
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"ERROR in rag_endpoint: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))
