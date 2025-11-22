"""
Advanced Digital Twin API with RAG Optimization
Features:
- Query preprocessing (enhancement)
- Response post-processing (interview formatting)
- STAR format responses when appropriate
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

# Enhanced profile context with achievements and metrics
PROFILE_CONTEXT = """
You are a digital twin AI assistant representing a professional software developer.

Professional Background:
- Full-stack developer with 5+ years of experience
- Expertise in Python, JavaScript/TypeScript, and modern web frameworks
- Successfully built and deployed 15+ production applications
- Led teams of 3-5 developers on multiple projects

Technical Skills & Achievements:
- Languages: Python, JavaScript, TypeScript, Java
- Frameworks: FastAPI (built 10+ APIs), Next.js (5+ production apps), React (50+ components)
- AI/ML: Implemented RAG systems serving 1000+ daily queries, integrated OpenAI/Groq APIs
- Databases: Designed schemas for PostgreSQL (3+ projects), MongoDB (2 projects), Redis caching
- DevOps: Set up CI/CD pipelines reducing deployment time by 60%, Docker containerization
- Vector Databases: Implemented Upstash and Pinecone for semantic search (3 projects)

Notable Projects:
1. AI-Powered Digital Twin Platform - Built RAG system with 95% accuracy
2. Real-time Analytics Dashboard - Handled 10K+ concurrent users
3. MCP Server Integration - Reduced API latency by 40%

Soft Skills:
- Strong problem-solving and debugging capabilities
- Excellent communication and team collaboration
- Agile/Scrum methodology experience
- Code review and mentoring junior developers
"""


def enhance_query(user_question: str) -> str:
    """
    Preprocess user query to improve retrieval quality.
    Expands query with relevant synonyms and context.
    """
    enhanced_prompt = f"""You are a query optimization assistant for a professional profile system.

Improve this question to better search professional profile data:

Original Question: {user_question}

Enhanced query should:
- Include relevant synonyms (e.g., "built" → "developed, created, implemented")
- Add professional context (e.g., "Python" → "Python development, Python frameworks")
- Focus on interview-relevant aspects
- Expand acronyms if present

Return ONLY the enhanced query, no explanations:"""
    
    try:
        response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": enhanced_prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.3,
            max_tokens=150,
        )
        enhanced = response.choices[0].message.content.strip()
        print(f"[Query Enhancement] Original: {user_question} → Enhanced: {enhanced}")
        return enhanced
    except Exception as e:
        print(f"[Query Enhancement Error] {e}, using original query")
        return user_question


def format_for_interview(answer: str, original_question: str) -> str:
    """
    Post-process the response to format it for interview scenarios.
    Applies STAR format when appropriate and enhances with metrics.
    """
    interview_prompt = f"""You are an expert interview coach. Refine this response for an interview setting.

Original Question: {original_question}
Current Response: {answer}

Improve the response to:
- Use STAR format (Situation, Task, Action, Result) if describing past work
- Include specific metrics and achievements when mentioned
- Sound confident, natural, and conversational
- Be concise but complete (2-4 sentences for simple questions, more for complex)
- Speak in first person
- Directly address the question

Return ONLY the improved response:"""
    
    try:
        response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": interview_prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=600,
        )
        formatted = response.choices[0].message.content.strip()
        print(f"[Response Formatting] Applied interview optimization")
        return formatted
    except Exception as e:
        print(f"[Response Formatting Error] {e}, using original answer")
        return answer


class RagRequest(BaseModel):
    question: str
    enhance_query: bool = True  # Enable query preprocessing
    format_response: bool = True  # Enable response post-processing

class RagResponse(BaseModel):
    answer: str
    original_question: str = None
    enhanced_question: str = None


app = FastAPI(title="Digital Twin Advanced API")

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
        # Step 1: Query Preprocessing (if enabled)
        enhanced_query = enhance_query(q) if payload.enhance_query else q
        
        # Step 2: Generate initial response
        prompt = f"""{PROFILE_CONTEXT}

Question: {enhanced_query}

Provide a helpful, professional response in first person, including specific examples and metrics when relevant:"""
        
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an AI digital twin representing a professional software developer. Answer in first person with specific examples and achievements."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=700,
        )
        
        initial_answer = completion.choices[0].message.content.strip()
        
        # Step 3: Response Post-processing (if enabled)
        final_answer = format_for_interview(initial_answer, q) if payload.format_response else initial_answer
        
        return RagResponse(
            answer=final_answer,
            original_question=q if payload.enhance_query else None,
            enhanced_question=enhanced_query if payload.enhance_query else None
        )
        
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "Digital Twin Advanced API",
        "features": ["query_enhancement", "interview_formatting", "star_format"]
    }

