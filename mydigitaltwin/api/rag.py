"""
Vercel Serverless Function for Digital Twin RAG
"""

import os
import json
from groq import Groq

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Static profile context
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
    """Generate answer using Groq"""
    if not groq_client:
        return "Sorry, the AI service is not configured properly."
    
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": PROFILE_CONTEXT},
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=500,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        return f"Error generating response: {str(e)}"


def handler(request, response):
    """Vercel serverless function handler"""
    
    # Set CORS headers
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    
    # Handle preflight requests
    if request.method == "OPTIONS":
        response.status = 200
        return response
    
    # Only allow POST
    if request.method != "POST":
        response.status = 405
        response.json({"error": "Method not allowed"})
        return response
    
    try:
        # Parse request body
        body = json.loads(request.body) if isinstance(request.body, str) else request.body
        question = body.get("question", "").strip()
        
        if not question:
            response.status = 400
            response.json({"error": "'question' must be a non-empty string"})
            return response
        
        # Generate answer
        answer = generate_answer(question)
        
        response.status = 200
        response.json({"answer": answer})
        return response
        
    except Exception as e:
        response.status = 500
        response.json({"error": str(e)})
        return response
