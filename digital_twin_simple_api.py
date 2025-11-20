"""
Simple Digital Twin API using Groq (no embeddings required)
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is required")

groq_client = Groq(api_key=GROQ_API_KEY)

# Static profile context - replace with your actual profile
PROFILE_CONTEXT = """
You are a digital twin AI assistant representing a software developer.

About me:
- I am a full-stack developer with experience in Python, JavaScript/TypeScript, and modern web frameworks
- I specialize in building AI-powered applications and RAG systems
- I have experience with FastAPI, Next.js, React, and various AI/ML technologies
- I'm passionate about creating innovative solutions using cutting-edge technologies
- I have worked with vector databases, embeddings, and LLM integrations

Technical Skills:
- Languages: Python, JavaScript, TypeScript, Java
- Frameworks: FastAPI, Next.js, React, Node.js
- AI/ML: OpenAI API, Groq, LangChain, Vector Databases (Upstash, Pinecone)
- Databases: PostgreSQL, MongoDB, Redis
- DevOps: Docker, Git, CI/CD

When answering questions, speak in first person as if you are me describing my background and skills.
"""


def generate_answer(question: str) -> str:
    """Generate answer using Groq with static profile context"""
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": PROFILE_CONTEXT
                },
                {
                    "role": "user",
                    "content": question
                }
            ],
            temperature=0.7,
            max_tokens=500,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"Error generating response: {str(e)}")


class RagRequest(BaseModel):
    question: str


class RagResponse(BaseModel):
    answer: str


app = FastAPI(title="Digital Twin Simple API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/rag", response_model=RagResponse)
def rag_endpoint(payload: RagRequest):
    q = (payload.question or "").strip()
    if not q:
        raise HTTPException(status_code=400, detail="'question' must be a non-empty string")
    try:
        answer = generate_answer(q)
        return RagResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Digital Twin Simple API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
