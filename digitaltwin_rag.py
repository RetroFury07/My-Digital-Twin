"""
Digital Twin RAG Application (fixed)

Retrieves relevant profile snippets from Upstash Vector and generates
answers with an LLM using the retrieved context.

This script queries Upstash Vector using an OpenAI embedding vector (1536-dim)
to match the embedding model used during indexing. It uses Groq for chat
completion by default and falls back to OpenAI if GROQ_API_KEY is missing.
"""

import os
import sys
from dotenv import load_dotenv
from upstash_vector import Index
from groq import Groq
from openai import OpenAI

# Load environment variables
load_dotenv()

# Constants / Config
EMBEDDING_MODEL = "text-embedding-3-small"  # 1536-dim
DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant"

# API keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def setup_openai_client() -> OpenAI:
    if not OPENAI_API_KEY:
        raise RuntimeError(
            "OPENAI_API_KEY not found in .env; required for query embeddings."
        )
    return OpenAI(api_key=OPENAI_API_KEY)


def setup_groq_client():
    try:
        if not GROQ_API_KEY:
            print("ℹ️  GROQ_API_KEY not found; will try OpenAI for chat.")
            return None
        client = Groq(api_key=GROQ_API_KEY)
        print("✅ Groq client initialized successfully!")
        return client
    except Exception as e:
        print(f"❌ Error initializing Groq client: {e}")
        return None


def setup_vector_database():
    """Connect to Upstash Vector and report current vector count."""
    print("🔄 Connecting to Upstash Vector...")
    index = Index.from_env()
    print("✅ Connected to Upstash Vector successfully!")
    try:
        info = index.info()
        count = getattr(info, "vector_count", None)
        if count is not None:
            print(f"📊 Current vectors in database: {count}")
    except Exception:
        pass
    return index


def embed_query(openai_client: OpenAI, text: str):
    resp = openai_client.embeddings.create(model=EMBEDDING_MODEL, input=text)
    return resp.data[0].embedding


def query_vectors(index: Index, openai_client: OpenAI, query_text: str, top_k: int = 3):
    """Query Upstash Vector for similar vectors using an embedding vector."""
    vector = embed_query(openai_client, query_text)
    results = index.query(vector=vector, top_k=top_k, include_metadata=True)
    return results


def generate_response_with_groq(client: Groq, prompt: str, model: str = DEFAULT_GROQ_MODEL) -> str:
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI digital twin. Answer questions as if you are the person, speaking in first person about your background, skills, and experience.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=500,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        return f"❌ Error generating response: {e}"


def generate_response_with_openai(openai_client: OpenAI, prompt: str, model: str = "gpt-4o-mini") -> str:
    try:
        completion = openai_client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI digital twin. Answer questions as if you are the person, speaking in first person about your background, skills, and experience.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=500,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        return f"❌ Error generating response (OpenAI): {e}"


def rag_query(index: Index, openai_client: OpenAI, groq_client: Groq | None, question: str) -> str:
    try:
        # 1) Vector search
        results = query_vectors(index, openai_client, question, top_k=3)
        if not results:
            return "I don't have specific information about that topic."

        # 2) Extract context
        print("\n🧠 Searching your professional profile...\n")
        top_docs = []
        for res in results:
            md = getattr(res, "metadata", {}) or {}
            content = md.get("text") or md.get("content") or ""
            title = md.get("title", "Information")
            score = getattr(res, "score", 0.0)
            print(f"🔹 Found: {title} (Relevance: {score:.3f})")
            if content:
                if md.get("text") is None and title:
                    top_docs.append(f"{title}: {content}")
                else:
                    top_docs.append(content)

        if not top_docs:
            return "I found some information but couldn't extract details."

        print("⚡ Generating personalized response...\n")
        context = "\n\n".join(top_docs)
        prompt = (
            "Based on the following information about yourself, answer the question.\n"
            "Speak in first person as if you are describing your own background.\n\n"
            f"Your Information:\n{context}\n\n"
            f"Question: {question}\n\n"
            "Provide a helpful, professional response:"
        )

        # 3) Generate answer
        if groq_client is not None:
            return generate_response_with_groq(groq_client, prompt)
        else:
            return generate_response_with_openai(openai_client, prompt)
    except Exception as e:
        return f"❌ Error during query: {e}"


def main():
    print("🤖 Your Digital Twin - AI Profile Assistant")
    print("=" * 50)
    print("🔗 Vector Storage: Upstash (1536-dim vectors)")
    print(f"⚡ AI Inference: Groq ({DEFAULT_GROQ_MODEL}) or OpenAI fallback")

    openai_client = setup_openai_client()
    groq_client = setup_groq_client()
    index = setup_vector_database()

    print("✅ Your Digital Twin is ready!\n")

    # One-shot mode (CLI args or QUESTION env var)
    question_arg = " ".join(sys.argv[1:]).strip()
    question_env = os.getenv("QUESTION", "").strip()
    if question_arg or question_env:
        question = question_arg or question_env
        answer = rag_query(index, openai_client, groq_client, question)
        print(f"🤖 Digital Twin: {answer}")
        return

    # Interactive loop
    print("🤖 Chat with your AI Digital Twin!")
    print("Ask questions about your experience, skills, projects, or career goals.")
    print("Type 'exit' to quit.\n")
    while True:
        q = input("You: ").strip()
        if q.lower() in ("exit", "quit"):
            print("👋 Thanks for chatting with your Digital Twin!")
            break
        if not q:
            continue
        ans = rag_query(index, openai_client, groq_client, q)
        print(f"🤖 Digital Twin: {ans}\n")


if __name__ == "__main__":
    main()
