"""
Simple fallback Digital Twin API that works without embeddings.
Uses Groq for responses with static profile context.
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

# Static profile context (replace with your actual profile)
PROFILE_CONTEXT = """
You are a digital twin AI assistant representing a professional profile.

Key Information:
- Experienced software developer with expertise in Python, JavaScript, and cloud technologies
- Strong background in AI/ML, web development, and API integration
- Familiar with FastAPI, Next.js, React, and modern development practices
- Interested in AI applications, digital twins, and automation
- Currently working on projects involving RAG systems, MCP servers, and AI integrations

Answer questions about this profile in first person as if you are the person being represented.
Be professional, helpful, and accurate.
"""

class RagRequest(BaseModel):
    question: str

class RagResponse(BaseModel):
    answer: str

app = FastAPI(title="Digital Twin Simple API")

# Add CORS middleware to allow browser requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.post("/rag", response_model=RagResponse)
def rag_endpoint(payload: RagRequest):
    q = (payload.question or "").strip()
    if not q:
        raise HTTPException(status_code=400, detail="'question' must be a non-empty string")
    
    try:
        prompt = f"{PROFILE_CONTEXT}\n\nQuestion: {q}\n\nProvide a helpful, professional response in first person:"
        
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an AI digital twin. Answer in first person based on the provided context."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=500,
        )
        
        answer = completion.choices[0].message.content.strip()
        return RagResponse(answer=answer)
        
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Digital Twin Simple API"}
