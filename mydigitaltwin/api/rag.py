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


def handler(request):
    """Vercel serverless function handler"""
    from http.server import BaseHTTPRequestHandler
    
    # CORS headers
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    }
    
    # Handle preflight requests
    if request.method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": headers,
            "body": ""
        }
    
    # Only allow POST
    if request.method != "POST":
        return {
            "statusCode": 405,
            "headers": headers,
            "body": json.dumps({"error": "Method not allowed"})
        }
    
    try:
        # Parse request body
        body = json.loads(request.body.decode('utf-8') if isinstance(request.body, bytes) else request.body)
        question = body.get("question", "").strip()
        
        if not question:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": "'question' must be a non-empty string"})
            }
        
        # Generate answer
        answer = generate_answer(question)
        
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"answer": answer})
        }
        
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)})
        }
